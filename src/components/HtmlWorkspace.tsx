import React, { useState, useMemo } from 'react';
import Editor from '@monaco-editor/react';
import { RotateCcw, Copy, Check, Eye, Code, Paintbrush, Play, Smartphone, Monitor } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface Props {
  initialHtml: string;
  onChange: (fullBundle: { html: string; css: string; js: string }) => void;
  onReset: () => void;
}

export const HtmlWorkspace: React.FC<Props> = ({ initialHtml, onChange, onReset }) => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<'html' | 'css' | 'js'>('html');
  const [htmlCode, setHtmlCode] = useState(initialHtml);
  const [cssCode, setCssCode] = useState(
    '/* Custom CSS Styling */\nbody {\n  font-family: system-ui, -apple-system, sans-serif;\n  padding: 1.5rem;\n  background: #f8fafc;\n  color: #0f172a;\n}\n.profile-card {\n  max-width: 320px;\n  background: #ffffff;\n  border-radius: 12px;\n  padding: 1.5rem;\n  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);\n}\n.avatar {\n  width: 72px;\n  height: 72px;\n  border-radius: 50%;\n  object-fit: cover;\n}\n.btn-connect {\n  background: #0284c7;\n  color: white;\n  border: none;\n  padding: 8px 16px;\n  border-radius: 6px;\n  cursor: pointer;\n}\n'
  );
  const [jsCode, setJsCode] = useState(
    '// Interactive JavaScript\ndocument.addEventListener("DOMContentLoaded", () => {\n  console.log("HTML Sandbox ready.");\n});\n'
  );
  const [viewport, setViewport] = useState<'desktop' | 'mobile'>('desktop');
  const [iframeKey, setIframeKey] = useState(1);
  const [copied, setCopied] = useState(false);

  const handleHtmlChange = (val: string) => {
    setHtmlCode(val);
    onChange({ html: val, css: cssCode, js: jsCode });
  };

  const handleCssChange = (val: string) => {
    setCssCode(val);
    onChange({ html: htmlCode, css: val, js: jsCode });
  };

  const handleJsChange = (val: string) => {
    setJsCode(val);
    onChange({ html: htmlCode, css: cssCode, js: val });
  };

  const handleResetPreview = () => {
    setIframeKey((prev) => prev + 1);
  };

  // Construct combined sandboxed srcdoc
  const combinedSrcDoc = useMemo(() => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            ${cssCode}
          </style>
        </head>
        <body>
          ${htmlCode}
          <script>
            try {
              ${jsCode}
            } catch (err) {
              console.error("Sandbox Script Error:", err);
            }
          </script>
        </body>
      </html>
    `;
  }, [htmlCode, cssCode, jsCode]);

  const copyCurrent = () => {
    const text = activeTab === 'html' ? htmlCode : activeTab === 'css' ? cssCode : jsCode;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full flex flex-col rounded-xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl">
      {/* Workspace Header */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 text-xs gap-2">
        {/* Editor Tabs */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setActiveTab('html')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-mono font-medium transition-colors ${
              activeTab === 'html'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            index.html
          </button>
          <button
            onClick={() => setActiveTab('css')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-mono font-medium transition-colors ${
              activeTab === 'css'
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Paintbrush className="w-3.5 h-3.5" />
            style.css
          </button>
          <button
            onClick={() => setActiveTab('js')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-mono font-medium transition-colors ${
              activeTab === 'js'
                ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            script.js
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setViewport('desktop')}
              className={`p-1 rounded text-xs ${
                viewport === 'desktop' ? 'bg-slate-800 text-cyan-400' : 'text-slate-500 hover:text-slate-300'
              }`}
              title="Desktop View"
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewport('mobile')}
              className={`p-1 rounded text-xs ${
                viewport === 'mobile' ? 'bg-slate-800 text-cyan-400' : 'text-slate-500 hover:text-slate-300'
              }`}
              title="Mobile View"
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={copyCurrent}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            onClick={handleResetPreview}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 text-xs"
            title="Reload Preview"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Preview</span>
          </button>
        </div>
      </div>

      {/* Editor & Preview Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-800 h-[520px]">
        {/* Active Code Tab */}
        <div className="h-full relative">
          {activeTab === 'html' && (
            <Editor
              height="100%"
              language="html"
              value={htmlCode}
              theme={theme === 'dark' ? 'vs-dark' : 'light'}
              onChange={(val) => handleHtmlChange(val || '')}
              options={{
                fontSize: 13,
                fontFamily: "'Fira Code', monospace",
                minimap: { enabled: false },
                wordWrap: 'on',
                tabSize: 2,
              }}
            />
          )}
          {activeTab === 'css' && (
            <Editor
              height="100%"
              language="css"
              value={cssCode}
              theme={theme === 'dark' ? 'vs-dark' : 'light'}
              onChange={(val) => handleCssChange(val || '')}
              options={{
                fontSize: 13,
                fontFamily: "'Fira Code', monospace",
                minimap: { enabled: false },
                wordWrap: 'on',
                tabSize: 2,
              }}
            />
          )}
          {activeTab === 'js' && (
            <Editor
              height="100%"
              language="javascript"
              value={jsCode}
              theme={theme === 'dark' ? 'vs-dark' : 'light'}
              onChange={(val) => handleJsChange(val || '')}
              options={{
                fontSize: 13,
                fontFamily: "'Fira Code', monospace",
                minimap: { enabled: false },
                wordWrap: 'on',
                tabSize: 2,
              }}
            />
          )}
        </div>

        {/* Sandboxed Live Preview */}
        <div className="h-full flex flex-col bg-slate-900/60 p-3">
          <div className="flex items-center justify-between pb-2 text-xs font-mono text-slate-400 border-b border-slate-800/80">
            <span className="flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-cyan-400" />
              Sandboxed Live Preview
            </span>
            <span className="text-[10px] text-slate-500">
              {viewport === 'mobile' ? '375px' : '100%'}
            </span>
          </div>

          <div className="flex-1 flex items-center justify-center pt-2 overflow-auto">
            <div
              className={`h-full bg-white rounded-lg shadow-inner overflow-hidden transition-all duration-200 ${
                viewport === 'mobile' ? 'w-[375px] max-w-full' : 'w-full'
              }`}
            >
              <iframe
                key={iframeKey}
                title="HTML Exercise Live Preview"
                srcDoc={combinedSrcDoc}
                sandbox="allow-scripts"
                className="w-full h-full border-0"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
