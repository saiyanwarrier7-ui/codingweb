import React, { useRef } from 'react';
import Editor from '@monaco-editor/react';
import { Copy, RotateCcw, Check, Sparkles } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface Props {
  language: string;
  code: string;
  onChange: (value: string) => void;
  onReset: () => void;
  height?: string;
  readOnly?: boolean;
}

export const CodeEditor: React.FC<Props> = ({
  language,
  code,
  onChange,
  onReset,
  height = '480px',
  readOnly = false,
}) => {
  const { theme } = useTheme();
  const [copied, setCopied] = React.useState(false);
  const editorRef = useRef<any>(null);

  // Map our language slugs to Monaco language IDs
  const monacoLanguage = (() => {
    switch (language.toLowerCase()) {
      case 'python':
      case 'py':
        return 'python';
      case 'cpp':
      case 'c++':
        return 'cpp';
      case 'c':
        return 'c';
      case 'java':
        return 'java';
      case 'html':
        return 'html';
      case 'javascript':
      case 'js':
        return 'javascript';
      case 'css':
        return 'css';
      default:
        return 'plaintext';
    }
  })();

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
  };

  return (
    <div className="w-full flex flex-col rounded-xl overflow-hidden border border-slate-800 bg-slate-950 shadow-xl">
      {/* Editor Control Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 mr-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
          </div>
          <span className="font-mono text-cyan-400 font-semibold uppercase tracking-wider">
            {monacoLanguage}
          </span>
          <span className="text-slate-500 font-mono">UTF-8</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Copy Code"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
          {!readOnly && (
            <button
              onClick={() => {
                if (window.confirm('Reset code to default starter template?')) {
                  onReset();
                }
              }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Reset Code"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Monaco Editor Container */}
      <div className="relative w-full" style={{ height }}>
        <Editor
          height="100%"
          language={monacoLanguage}
          value={code}
          theme={theme === 'dark' ? 'vs-dark' : 'light'}
          onChange={(val) => onChange(val || '')}
          onMount={handleEditorDidMount}
          options={{
            readOnly,
            fontSize: 14,
            fontFamily: "'Fira Code', 'JetBrains Mono', Consolas, monospace",
            fontLigatures: true,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 4,
            lineNumbers: 'on',
            lineDecorationsWidth: 10,
            wordWrap: 'on',
            bracketPairColorization: { enabled: true },
            cursorBlinking: 'smooth',
            smoothScrolling: true,
            padding: { top: 12, bottom: 12 },
          }}
          loading={
            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 text-slate-400 font-mono text-sm gap-2">
              <Sparkles className="w-6 h-6 text-cyan-400 animate-spin" />
              <span>Loading Monaco Code Arena...</span>
            </div>
          }
        />
      </div>
    </div>
  );
};
