import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Play,
  Send,
  Bookmark,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Terminal,
  HelpCircle,
  FileCode,
  RotateCcw,
  ListOrdered,
  Layers,
  History,
  Check,
} from 'lucide-react';
import { CodingProblem, ExecutionResult, Submission } from '../types';
import { DifficultyBadge } from '../components/DifficultyBadge';
import { LanguageIcon } from '../components/LanguageIcon';
import { CodeEditor } from '../components/CodeEditor';
import { HtmlWorkspace } from '../components/HtmlWorkspace';
import { useAuth } from '../context/AuthContext';

interface Props {
  problemId: string;
  onNavigate: (path: string) => void;
}

export const ProblemWorkspacePage: React.FC<Props> = ({ problemId, onNavigate }) => {
  const { user } = useAuth();
  const [problem, setProblem] = useState<CodingProblem | null>(null);
  const [loading, setLoading] = useState(true);

  // Workspace state
  const [selectedLanguage, setSelectedLanguage] = useState<string>('python');
  const [code, setCode] = useState<string>('');
  const [htmlBundle, setHtmlBundle] = useState<{ html: string; css: string; js: string }>({
    html: '',
    css: '',
    js: '',
  });

  // Console & Execution state
  const [activeConsoleTab, setActiveConsoleTab] = useState<
    'testcases' | 'custom' | 'output' | 'submissions'
  >('testcases');
  const [customInput, setCustomInput] = useState<string>('');
  const [selectedTestCaseIndex, setSelectedTestCaseIndex] = useState(0);

  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [runResult, setRunResult] = useState<ExecutionResult | null>(null);
  const [submissionResult, setSubmissionResult] = useState<any | null>(null);
  const [submissionsHistory, setSubmissionsHistory] = useState<Submission[]>([]);

  // Load problem details
  const fetchProblem = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/problems/${problemId}`);
      if (!res.ok) {
        onNavigate('/problems');
        return;
      }
      const data: CodingProblem = await res.json();
      setProblem(data);

      // Default language to first supported
      const initialLang = data.supported_languages[0] || 'python';
      setSelectedLanguage(initialLang);

      // Set starter code
      const starter = data.starter_code[initialLang] || '';
      setCode(starter);

      if (initialLang === 'html') {
        setHtmlBundle({
          html: starter,
          css: '/* Custom CSS */\nbody { font-family: sans-serif; padding: 1.5rem; }',
          js: '// Javascript code',
        });
      }

      // Pre-fill custom input with sample test 0 input if available
      if (data.sample_tests && data.sample_tests.length > 0) {
        setCustomInput(data.sample_tests[0].input || '');
      }
    } catch (err) {
      console.error('Error fetching problem details:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load problem submissions history
  const fetchSubmissions = async () => {
    if (!user) return;
    try {
      const res = await fetch('/api/student/submissions');
      if (res.ok) {
        const all: Submission[] = await res.json();
        const forThisProb = all.filter((s) => s.problem_id === problemId);
        setSubmissionsHistory(forThisProb);
      }
    } catch (err) {
      console.error('Error fetching submissions:', err);
    }
  };

  useEffect(() => {
    fetchProblem();
    fetchSubmissions();
  }, [problemId, user]);

  // Handle language switch
  const handleLanguageChange = (newLang: string) => {
    setSelectedLanguage(newLang);
    if (problem) {
      const starter = problem.starter_code[newLang] || '';
      setCode(starter);
      if (newLang === 'html') {
        setHtmlBundle({
          html: starter,
          css: '/* Custom CSS */\nbody { font-family: sans-serif; padding: 1.5rem; }',
          js: '// Javascript code',
        });
      }
    }
  };

  // Reset starter code
  const handleResetCode = () => {
    if (problem) {
      const starter = problem.starter_code[selectedLanguage] || '';
      setCode(starter);
    }
  };

  // Toggle bookmark
  const handleToggleBookmark = async () => {
    if (!user) {
      onNavigate('/login');
      return;
    }
    if (!problem) return;
    try {
      const res = await fetch(`/api/problems/${problem.id}/bookmark`, { method: 'POST' });
      if (res.ok) {
        const { bookmarked } = await res.json();
        setProblem((prev) => (prev ? { ...prev, is_bookmarked: bookmarked } : null));
      }
    } catch (err) {
      console.error('Bookmark error:', err);
    }
  };

  // Run Code (Sample test or Custom input)
  const handleRunCode = async () => {
    setIsRunning(true);
    setRunResult(null);
    setActiveConsoleTab('output');

    try {
      const inputToUse =
        activeConsoleTab === 'testcases' &&
        problem?.sample_tests &&
        problem.sample_tests[selectedTestCaseIndex]
          ? problem.sample_tests[selectedTestCaseIndex].input
          : customInput;

      const payloadCode = selectedLanguage === 'html' ? JSON.stringify(htmlBundle) : code;

      const res = await fetch('/api/code/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: selectedLanguage,
          code: payloadCode,
          stdin: inputToUse,
        }),
      });

      const data: ExecutionResult = await res.json();
      setRunResult(data);
    } catch (err: any) {
      setRunResult({
        status: 'Internal Error',
        stdout: '',
        stderr: err.message || 'Execution failed',
        execution_time: 0,
        passed: false,
      });
    } finally {
      setIsRunning(false);
    }
  };

  // Submit Solution (Evaluates on backend hidden test cases!)
  const handleSubmitSolution = async () => {
    if (!user) {
      onNavigate('/login');
      return;
    }

    setIsSubmitting(true);
    setSubmissionResult(null);
    setActiveConsoleTab('output');

    try {
      const payloadCode = selectedLanguage === 'html' ? JSON.stringify(htmlBundle) : code;

      const res = await fetch('/api/code/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('codearena_token')}`,
        },
        body: JSON.stringify({
          problemId: problem?.id,
          language: selectedLanguage,
          code: payloadCode,
        }),
      });

      const data = await res.json();
      setSubmissionResult(data);

      if (data.is_accepted) {
        // Trigger celebratory confetti!
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#06b6d4', '#3b82f6', '#8b5cf6', '#10b981'],
        });

        // Mark problem as solved locally
        if (problem) {
          setProblem({ ...problem, is_solved: true });
        }
      }

      fetchSubmissions();
    } catch (err: any) {
      setSubmissionResult({
        is_accepted: false,
        submission: {
          status: 'Internal Error',
          error_message: err.message,
          passed_test_cases: 0,
          total_test_cases: 0,
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || !problem) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center font-mono text-slate-400 gap-3">
        <Sparkles className="w-8 h-8 text-cyan-400 animate-spin" />
        <p className="text-sm">Preparing Coding Workspace...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Navigation & Workspace Header */}
      <div className="bg-slate-900/90 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between gap-3 text-xs">
        {/* Left: Back and Problem title */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('/problems')}
            className="flex items-center gap-1 text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Problems</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-100 text-sm">{problem.title}</span>
            <DifficultyBadge difficulty={problem.difficulty} size="sm" />
            {problem.is_solved && (
              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Solved
              </span>
            )}
          </div>
        </div>

        {/* Right: Prev/Next problem nav and Bookmark */}
        <div className="flex items-center gap-2">
          {problem.navigation?.prevId && (
            <button
              onClick={() => onNavigate(`/problems/${problem.navigation?.prevId}`)}
              className="p-1.5 rounded text-slate-400 hover:text-white bg-slate-800 transition-colors"
              title={`Previous: ${problem.navigation?.prevTitle}`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}

          {problem.navigation?.nextId && (
            <button
              onClick={() => onNavigate(`/problems/${problem.navigation?.nextId}`)}
              className="p-1.5 rounded text-slate-400 hover:text-white bg-slate-800 transition-colors"
              title={`Next: ${problem.navigation?.nextTitle}`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={handleToggleBookmark}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded border transition-colors ${
              problem.is_bookmarked
                ? 'bg-purple-500/20 text-purple-400 border-purple-500/30'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${problem.is_bookmarked ? 'fill-current' : ''}`} />
            <span className="hidden sm:inline">
              {problem.is_bookmarked ? 'Saved' : 'Bookmark'}
            </span>
          </button>
        </div>
      </div>

      {/* Main Two-Panel Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-800 min-h-0">
        {/* LEFT PANEL: Problem Details & Examples (5 columns on desktop) */}
        <div className="lg:col-span-5 p-6 overflow-y-auto max-h-[calc(100vh-105px)] space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-extrabold text-white">{problem.title}</h1>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <DifficultyBadge difficulty={problem.difficulty} size="sm" />
              {problem.topic_tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs font-mono px-2.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="prose prose-invert max-w-none text-sm text-slate-300 leading-relaxed space-y-3 font-sans">
            <div className="whitespace-pre-line">{problem.description}</div>
          </div>

          {/* Input & Output Format */}
          <div className="space-y-4 pt-2 border-t border-slate-800/80">
            <div>
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 mb-1">
                Input Format
              </h3>
              <p className="text-xs text-slate-300 bg-slate-900 p-3 rounded-xl border border-slate-800 font-mono">
                {problem.input_format || 'Standard Input (stdin)'}
              </p>
            </div>

            <div>
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 mb-1">
                Output Format
              </h3>
              <p className="text-xs text-slate-300 bg-slate-900 p-3 rounded-xl border border-slate-800 font-mono">
                {problem.output_format || 'Standard Output (stdout)'}
              </p>
            </div>

            {problem.constraints && (
              <div>
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 mb-1">
                  Constraints
                </h3>
                <pre className="text-xs text-slate-300 bg-slate-900 p-3 rounded-xl border border-slate-800 font-mono whitespace-pre-wrap">
                  {problem.constraints}
                </pre>
              </div>
            )}
          </div>

          {/* Sample Test Cases with Explanation */}
          <div className="space-y-4 pt-2 border-t border-slate-800/80">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-purple-400">
              Sample Examples
            </h3>
            {problem.sample_tests.map((st, idx) => (
              <div
                key={idx}
                className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 space-y-2 text-xs font-mono"
              >
                <div className="font-bold text-slate-300">Example {idx + 1}:</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-850">
                    <span className="text-[10px] uppercase text-slate-500 block mb-1">Input</span>
                    <pre className="text-slate-200 whitespace-pre-wrap">{st.input || '(empty)'}</pre>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-850">
                    <span className="text-[10px] uppercase text-slate-500 block mb-1">Expected Output</span>
                    <pre className="text-slate-200 whitespace-pre-wrap">{st.expected_output}</pre>
                  </div>
                </div>
                {st.explanation && (
                  <p className="text-slate-400 text-[11px] font-sans pt-1 italic">
                    Explanation: {st.explanation}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT PANEL: Code Editor & Execution Console (7 columns on desktop) */}
        <div className="lg:col-span-7 flex flex-col h-full bg-slate-950">
          {/* Editor Top Bar: Language Selector & Action Buttons */}
          <div className="flex flex-wrap items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 gap-3">
            {/* Language Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-400 hidden sm:inline">Language:</span>
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                {problem.supported_languages.map((lang) => (
                  <button
                    key={lang}
                    onClick={() => handleLanguageChange(lang)}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium font-mono transition-colors ${
                      selectedLanguage === lang
                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <LanguageIcon language={lang} className="w-3.5 h-3.5" />
                    <span className="capitalize">{lang}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Run & Submit Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleRunCode}
                disabled={isRunning || isSubmitting}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 disabled:opacity-50 transition-colors shadow-sm"
              >
                <Play className={`w-3.5 h-3.5 text-cyan-400 ${isRunning ? 'animate-spin' : ''}`} />
                <span>{isRunning ? 'Running...' : 'Run Code'}</span>
              </button>

              <button
                onClick={handleSubmitSolution}
                disabled={isRunning || isSubmitting}
                className="flex items-center gap-1.5 px-5 py-1.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 transition-all shadow-md shadow-cyan-500/25"
              >
                <Send className={`w-3.5 h-3.5 ${isSubmitting ? 'animate-pulse' : ''}`} />
                <span>{isSubmitting ? 'Evaluating...' : 'Submit Solution'}</span>
              </button>
            </div>
          </div>

          {/* Editor Container */}
          <div className="flex-1 p-3 min-h-[350px]">
            {selectedLanguage === 'html' ? (
              <HtmlWorkspace
                initialHtml={code}
                onChange={(bundle) => setHtmlBundle(bundle)}
                onReset={handleResetCode}
              />
            ) : (
              <CodeEditor
                language={selectedLanguage}
                code={code}
                onChange={(newVal) => setCode(newVal)}
                onReset={handleResetCode}
                height="400px"
              />
            )}
          </div>

          {/* Bottom Execution Console & Results Area */}
          <div className="border-t border-slate-800 bg-slate-900/80 p-3 flex flex-col">
            {/* Console Tab Selector */}
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 mb-3">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setActiveConsoleTab('testcases')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-mono font-medium transition-colors ${
                    activeConsoleTab === 'testcases'
                      ? 'bg-slate-800 text-cyan-400 border border-slate-700'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <ListOrdered className="w-3.5 h-3.5" />
                  Test Cases
                </button>

                <button
                  onClick={() => setActiveConsoleTab('custom')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-mono font-medium transition-colors ${
                    activeConsoleTab === 'custom'
                      ? 'bg-slate-800 text-cyan-400 border border-slate-700'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5" />
                  Custom Input
                </button>

                <button
                  onClick={() => setActiveConsoleTab('output')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-mono font-medium transition-colors ${
                    activeConsoleTab === 'output'
                      ? 'bg-slate-800 text-cyan-400 border border-slate-700'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  Output & Results
                  {(runResult || submissionResult) && (
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse ml-0.5" />
                  )}
                </button>

                <button
                  onClick={() => {
                    setActiveConsoleTab('submissions');
                    fetchSubmissions();
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-mono font-medium transition-colors ${
                    activeConsoleTab === 'submissions'
                      ? 'bg-slate-800 text-cyan-400 border border-slate-700'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <History className="w-3.5 h-3.5" />
                  Submissions ({submissionsHistory.length})
                </button>
              </div>
            </div>

            {/* TAB CONTENT */}

            {/* 1. Sample Test Cases */}
            {activeConsoleTab === 'testcases' && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  {problem.sample_tests.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setSelectedTestCaseIndex(idx);
                        setCustomInput(problem.sample_tests[idx].input || '');
                      }}
                      className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition-colors ${
                        selectedTestCaseIndex === idx
                          ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                          : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                      }`}
                    >
                      Case {idx + 1}
                    </button>
                  ))}
                </div>

                {problem.sample_tests[selectedTestCaseIndex] && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 uppercase block mb-1">Input</span>
                      <pre className="text-slate-200 whitespace-pre-wrap">
                        {problem.sample_tests[selectedTestCaseIndex].input || '(No input)'}
                      </pre>
                    </div>
                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 uppercase block mb-1">
                        Expected Output
                      </span>
                      <pre className="text-slate-200 whitespace-pre-wrap">
                        {problem.sample_tests[selectedTestCaseIndex].expected_output}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 2. Custom Input */}
            {activeConsoleTab === 'custom' && (
              <div>
                <label className="text-[10px] font-mono text-slate-400 block mb-1 uppercase">
                  Standard Input (stdin passed to program)
                </label>
                <textarea
                  rows={3}
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  placeholder="Enter custom input values here..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
            )}

            {/* 3. Output & Results Tab */}
            {activeConsoleTab === 'output' && (
              <div className="space-y-3 text-xs font-mono">
                {/* When Submission Was Made */}
                {submissionResult && (
                  <div
                    className={`p-4 rounded-xl border ${
                      submissionResult.is_accepted
                        ? 'bg-emerald-950/30 border-emerald-500/40'
                        : 'bg-rose-950/30 border-rose-500/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {submissionResult.is_accepted ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <XCircle className="w-5 h-5 text-rose-400" />
                        )}
                        <span
                          className={`font-bold text-sm ${
                            submissionResult.is_accepted ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {submissionResult.submission?.status ||
                            (submissionResult.is_accepted ? 'Accepted' : 'Wrong Answer')}
                        </span>
                      </div>
                      <span className="text-slate-400">
                        Passed {submissionResult.passed_test_cases} /{' '}
                        {submissionResult.total_test_cases} test cases
                      </span>
                    </div>

                    {submissionResult.submission?.error_message && (
                      <div className="mt-2 text-rose-300 bg-slate-950/80 p-2.5 rounded-lg border border-rose-900/40 text-xs font-mono whitespace-pre-wrap">
                        {submissionResult.submission.error_message}
                      </div>
                    )}

                    {submissionResult.is_accepted && (
                      <p className="mt-2 text-emerald-300 text-xs font-sans">
                        🎉 Outstanding! Your solution passed all hidden evaluation test cases and has been recorded in your student dashboard.
                      </p>
                    )}
                  </div>
                )}

                {/* When Run Code Was Triggered */}
                {runResult && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-slate-400">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-200">Execution Status:</span>
                        <span
                          className={
                            runResult.status === 'Accepted'
                              ? 'text-emerald-400 font-bold'
                              : 'text-rose-400 font-bold'
                          }
                        >
                          {runResult.status}
                        </span>
                      </div>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        {runResult.execution_time}ms
                      </span>
                    </div>

                    {runResult.compile_output && (
                      <div className="bg-slate-950 p-3 rounded-xl border border-rose-900/50 text-rose-400 whitespace-pre-wrap">
                        <span className="text-[10px] text-slate-500 uppercase block mb-1">
                          Compiler Diagnostics:
                        </span>
                        {runResult.compile_output}
                      </div>
                    )}

                    {runResult.stdout !== undefined && (
                      <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                        <span className="text-[10px] text-slate-500 uppercase block mb-1">
                          Standard Output (stdout):
                        </span>
                        <pre className="text-slate-100 whitespace-pre-wrap">
                          {runResult.stdout || '(no standard output produced)'}
                        </pre>
                      </div>
                    )}

                    {runResult.stderr && (
                      <div className="bg-slate-950 p-3 rounded-xl border border-rose-900/50 text-rose-300 whitespace-pre-wrap">
                        <span className="text-[10px] text-slate-500 uppercase block mb-1">
                          Standard Error (stderr):
                        </span>
                        {runResult.stderr}
                      </div>
                    )}
                  </div>
                )}

                {!runResult && !submissionResult && (
                  <div className="text-center py-6 text-slate-500 font-sans">
                    Click <strong className="text-slate-300">Run Code</strong> to test your code with custom input, or <strong className="text-cyan-400">Submit Solution</strong> to test against hidden grading cases.
                  </div>
                )}
              </div>
            )}

            {/* 4. Submissions History */}
            {activeConsoleTab === 'submissions' && (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {submissionsHistory.length === 0 ? (
                  <div className="text-center py-6 text-slate-500 text-xs">
                    No submissions recorded yet for this problem.
                  </div>
                ) : (
                  submissionsHistory.map((sub) => (
                    <div
                      key={sub.id}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono"
                    >
                      <div className="flex items-center gap-2">
                        {sub.status === 'Accepted' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-400" />
                        )}
                        <span
                          className={
                            sub.status === 'Accepted' ? 'text-emerald-400 font-bold' : 'text-rose-400'
                          }
                        >
                          {sub.status}
                        </span>
                        <span className="text-slate-400 capitalize">({sub.language_id})</span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-400 text-[11px]">
                        <span>
                          {sub.passed_test_cases}/{sub.total_test_cases} tests
                        </span>
                        <span>{sub.execution_time}ms</span>
                        <span>{new Date(sub.submitted_at).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
