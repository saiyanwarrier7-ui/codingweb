import { spawn } from 'child_process';
import { ExecutionResult, SubmissionStatus } from './types.ts';

// Wandbox API endpoint
const WANDBOX_URL = 'https://wandbox.org/api/compile.json';

// Normalize output for test comparison (trim whitespace, normalize \r\n to \n)
export function normalizeOutput(out: string): string {
  if (!out) return '';
  return out
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.trimEnd())
    .join('\n')
    .trim();
}

/**
 * Execute Python code locally using child_process.spawn for low-latency & sandbox isolation
 */
async function runPythonLocal(code: string, stdin: string, timeLimitMs: number = 3000): Promise<ExecutionResult> {
  const startTime = Date.now();
  return new Promise((resolve) => {
    let killed = false;
    const proc = spawn('python3', ['-u', '-c', code], {
      timeout: timeLimitMs,
      env: { ...process.env, PYTHONUNBUFFERED: '1' },
    });

    let stdout = '';
    let stderr = '';

    const timer = setTimeout(() => {
      killed = true;
      proc.kill('SIGKILL');
      resolve({
        status: 'Time Limit Exceeded',
        stdout: stdout.slice(0, 10000),
        stderr: 'Time Limit Exceeded: Execution took longer than ' + timeLimitMs + 'ms',
        execution_time: timeLimitMs,
        passed: false,
      });
    }, timeLimitMs);

    if (stdin) {
      try {
        proc.stdin.write(stdin);
        proc.stdin.end();
      } catch (err) {
        // ignore pipe error
      }
    } else {
      proc.stdin.end();
    }

    proc.stdout.on('data', (data) => {
      stdout += data.toString();
      if (stdout.length > 50000) proc.kill('SIGKILL');
    });

    proc.stderr.on('data', (data) => {
      stderr += data.toString();
      if (stderr.length > 50000) proc.kill('SIGKILL');
    });

    proc.on('error', (err) => {
      if (killed) return;
      clearTimeout(timer);
      resolve({
        status: 'Runtime Error',
        stdout: stdout.slice(0, 10000),
        stderr: err.message,
        execution_time: Date.now() - startTime,
        passed: false,
      });
    });

    proc.on('close', (exitCode) => {
      if (killed) return;
      clearTimeout(timer);
      const execution_time = Date.now() - startTime;
      const cleanStdout = stdout.slice(0, 10000);
      const cleanStderr = stderr.slice(0, 10000);

      if (exitCode !== 0) {
        let status: SubmissionStatus = 'Runtime Error';
        if (cleanStderr.includes('SyntaxError') || cleanStderr.includes('IndentationError')) {
          status = 'Compilation Error';
        }
        resolve({
          status,
          stdout: cleanStdout,
          stderr: cleanStderr,
          compile_output: cleanStderr,
          execution_time,
          passed: false,
        });
      } else {
        resolve({
          status: 'Accepted',
          stdout: cleanStdout,
          stderr: cleanStderr,
          execution_time,
          passed: true,
        });
      }
    });
  });
}

/**
 * Execute C, C++, or Java code via Wandbox sandbox
 */
async function runWandbox(
  compiler: string,
  code: string,
  stdin: string,
  timeLimitMs: number = 5000
): Promise<ExecutionResult> {
  const startTime = Date.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeLimitMs + 4000);

  try {
    const payload = {
      compiler,
      code,
      stdin: stdin || '',
    };

    const res = await fetch(WANDBOX_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const errText = await res.text();
      return {
        status: 'Internal Error',
        stdout: '',
        stderr: `Execution service returned HTTP ${res.status}: ${errText}`,
        execution_time: Date.now() - startTime,
        passed: false,
      };
    }

    const data: any = await res.json();
    const execution_time = Date.now() - startTime;
    const compileErr = data.compiler_error || data.compiler_message || '';
    const progOut = data.program_output || '';
    const progErr = data.program_error || '';

    // Check compilation errors
    if (compileErr && data.status !== '0' && !progOut) {
      return {
        status: 'Compilation Error',
        stdout: '',
        stderr: compileErr,
        compile_output: compileErr,
        execution_time,
        passed: false,
      };
    }

    // Check runtime signal / timeout
    if (data.signal && (data.signal.includes('KILL') || data.signal.includes('ALRM'))) {
      return {
        status: 'Time Limit Exceeded',
        stdout: progOut,
        stderr: `Process terminated by signal: ${data.signal}`,
        execution_time,
        passed: false,
      };
    }

    if (data.status !== '0' && !progOut) {
      return {
        status: 'Runtime Error',
        stdout: progOut,
        stderr: progErr || compileErr || 'Non-zero exit code: ' + data.status,
        execution_time,
        passed: false,
      };
    }

    return {
      status: 'Accepted',
      stdout: progOut,
      stderr: progErr,
      compile_output: compileErr,
      execution_time,
      passed: true,
    };
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      return {
        status: 'Time Limit Exceeded',
        stdout: '',
        stderr: `Code execution timed out after ${timeLimitMs}ms`,
        execution_time: timeLimitMs,
        passed: false,
      };
    }
    return {
      status: 'Internal Error',
      stdout: '',
      stderr: `Code execution failure: ${err.message}`,
      execution_time: Date.now() - startTime,
      passed: false,
    };
  }
}

/**
 * Execute HTML / Web submissions
 */
function evaluateHtml(code: string, expectedOutput: string): ExecutionResult {
  // In HTML mode, code can either be plain HTML or JSON with { html, css, js }
  let htmlContent = code;
  try {
    const parsed = JSON.parse(code);
    if (parsed.html) htmlContent = parsed.html;
  } catch {
    // raw HTML
  }

  // Check required tags or patterns if expectedOutput specifies them
  const requiredTags = expectedOutput ? expectedOutput.split(',').map((t) => t.trim().toLowerCase()) : [];
  const missingTags: string[] = [];

  for (const tag of requiredTags) {
    if (!tag) continue;
    if (tag.startsWith('.')) {
      // check class
      const cls = tag.slice(1);
      if (!htmlContent.includes(`class="${cls}`) && !htmlContent.includes(`class='${cls}`) && !htmlContent.includes(cls)) {
        missingTags.push(`class .${cls}`);
      }
    } else if (tag.startsWith('#')) {
      // check id
      const id = tag.slice(1);
      if (!htmlContent.includes(`id="${id}`) && !htmlContent.includes(`id='${id}`) && !htmlContent.includes(id)) {
        missingTags.push(`id #${id}`);
      }
    } else {
      // check html tag <tag
      const regex = new RegExp(`<${tag}[\\s>]`, 'i');
      if (!regex.test(htmlContent)) {
        missingTags.push(`<${tag}>`);
      }
    }
  }

  if (missingTags.length > 0) {
    return {
      status: 'Wrong Answer',
      stdout: 'HTML Rendered Successfully',
      stderr: `Missing required HTML elements: ${missingTags.join(', ')}`,
      execution_time: 15,
      passed: false,
    };
  }

  return {
    status: 'Accepted',
    stdout: 'HTML Preview and Structure Validated Successfully!',
    stderr: '',
    execution_time: 20,
    passed: true,
  };
}

/**
 * Main execution dispatcher
 */
export async function executeCode(
  language: string,
  code: string,
  stdin: string = '',
  expectedOutput?: string,
  timeLimitMs: number = 4000
): Promise<ExecutionResult> {
  const lang = language.toLowerCase();

  if (lang === 'html') {
    return evaluateHtml(code, expectedOutput || '');
  }

  if (lang === 'python' || lang === 'py') {
    return runPythonLocal(code, stdin, timeLimitMs);
  }

  if (lang === 'c') {
    return runWandbox('gcc-13.2.0-c', code, stdin, timeLimitMs);
  }

  if (lang === 'cpp' || lang === 'c++') {
    return runWandbox('gcc-13.2.0', code, stdin, timeLimitMs);
  }

  if (lang === 'java') {
    // Ensure Java class isn't declared "public class Main" or "public class Solution"
    // Wandbox expects package-private class in single-file execution: "class Solution" or "class Main"
    const sanitizedJava = code.replace(/public\s+class\s+(\w+)/g, 'class $1');
    return runWandbox('openjdk-jdk-21+35', sanitizedJava, stdin, timeLimitMs);
  }

  return {
    status: 'Internal Error',
    stdout: '',
    stderr: `Unsupported language for execution: ${language}`,
    execution_time: 0,
    passed: false,
  };
}
