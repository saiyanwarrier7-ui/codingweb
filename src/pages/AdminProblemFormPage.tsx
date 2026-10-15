import React, { useEffect, useState } from 'react';
import {
  ChevronLeft,
  Save,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Code2,
  FileCode,
  Shield,
} from 'lucide-react';
import { CodingProblem, HiddenTestCase, ProblemDifficulty } from '../types';
import { useAuth } from '../context/AuthContext';

interface Props {
  problemId?: string; // If provided, edit mode
  onNavigate: (path: string) => void;
}

export const AdminProblemFormPage: React.FC<Props> = ({ problemId, onNavigate }) => {
  const { user } = useAuth();
  const isEdit = Boolean(problemId);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [inputFormat, setInputFormat] = useState('');
  const [outputFormat, setOutputFormat] = useState('');
  const [constraints, setConstraints] = useState('');
  const [difficulty, setDifficulty] = useState<ProblemDifficulty>('Easy');
  const [topicTags, setTopicTags] = useState('Basics, Algorithms');
  const [supportedLanguages, setSupportedLanguages] = useState<string[]>([
    'python',
    'cpp',
    'c',
    'java',
  ]);
  const [isPublished, setIsPublished] = useState(true);

  // Starter code per language
  const [starterCodes, setStarterCodes] = useState<Record<string, string>>({
    python: '# Read input and solve\n',
    cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\n    // Code here\n    return 0;\n}\n',
    c: '#include <stdio.h>\n\nint main() {\n    // Code here\n    return 0;\n}\n',
    java: 'import java.util.Scanner;\n\nclass Solution {\n    public static void main(String[] args) {\n        // Code here\n    }\n}\n',
    html: '<div>\n  <h1>Hello World</h1>\n</div>\n',
  });
  const [activeStarterLang, setActiveStarterLang] = useState('python');

  // Sample tests
  const [sampleTests, setSampleTests] = useState<
    Array<{ input: string; expected_output: string; explanation?: string }>
  >([{ input: '2 3', expected_output: '5', explanation: '2 + 3 = 5' }]);

  // Hidden test cases
  const [hiddenTests, setHiddenTests] = useState<
    Array<{ input_data: string; expected_output: string; points: number; time_limit: number }>
  >([{ input_data: '10 20', expected_output: '30', points: 10, time_limit: 2000 }]);

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    async function loadProblem() {
      if (!problemId) return;
      try {
        setLoading(true);
        const [probRes, testsRes] = await Promise.all([
          fetch(`/api/problems/${problemId}`),
          fetch(`/api/admin/problems/${problemId}/test-cases`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('codearena_token')}`,
            },
          }),
        ]);

        if (probRes.ok) {
          const p: CodingProblem = await probRes.json();
          setTitle(p.title);
          setDescription(p.description);
          setInputFormat(p.input_format);
          setOutputFormat(p.output_format);
          setConstraints(p.constraints);
          setDifficulty(p.difficulty);
          setTopicTags(p.topic_tags.join(', '));
          setSupportedLanguages(p.supported_languages);
          setStarterCodes((prev) => ({ ...prev, ...p.starter_code }));
          setSampleTests(p.sample_tests || []);
          setIsPublished(p.is_published);
        }

        if (testsRes.ok) {
          const tests: HiddenTestCase[] = await testsRes.json();
          if (tests.length > 0) {
            setHiddenTests(
              tests.map((t) => ({
                input_data: t.input_data,
                expected_output: t.expected_output,
                points: t.points || 10,
                time_limit: t.time_limit || 2000,
              }))
            );
          }
        }
      } catch (err) {
        console.error('Failed to load problem:', err);
      } finally {
        setLoading(false);
      }
    }

    if (isEdit) {
      loadProblem();
    }
  }, [problemId, isEdit]);

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-xl font-bold text-white mb-2">Admin Authorization Required</h2>
        <button
          onClick={() => onNavigate('/admin/login')}
          className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-purple-600"
        >
          Sign In as Admin
        </button>
      </div>
    );
  }

  const handleToggleLang = (lang: string) => {
    if (supportedLanguages.includes(lang)) {
      if (supportedLanguages.length === 1) return; // Keep at least one
      setSupportedLanguages(supportedLanguages.filter((l) => l !== lang));
    } else {
      setSupportedLanguages([...supportedLanguages, lang]);
    }
  };

  const handleAddSampleTest = () => {
    setSampleTests([...sampleTests, { input: '', expected_output: '', explanation: '' }]);
  };

  const handleRemoveSampleTest = (index: number) => {
    setSampleTests(sampleTests.filter((_, i) => i !== index));
  };

  const handleAddHiddenTest = () => {
    setHiddenTests([
      ...hiddenTests,
      { input_data: '', expected_output: '', points: 10, time_limit: 2000 },
    ]);
  };

  const handleRemoveHiddenTest = (index: number) => {
    setHiddenTests(hiddenTests.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSaving(true);

    try {
      const payload = {
        title,
        description,
        input_format: inputFormat,
        output_format: outputFormat,
        constraints,
        difficulty,
        topic_tags: topicTags.split(',').map((t) => t.trim()).filter(Boolean),
        supported_languages: supportedLanguages,
        starter_code: starterCodes,
        sample_tests: sampleTests,
        hidden_test_cases: hiddenTests,
        is_published: isPublished,
      };

      const url = isEdit ? `/api/admin/problems/${problemId}` : '/api/admin/problems';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('codearena_token')}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSuccess(isEdit ? 'Problem updated successfully!' : 'Problem created successfully!');
        setTimeout(() => {
          onNavigate('/admin/problems');
        }, 1200);
      } else {
        const err = await res.json();
        setError(err.error || 'Failed to save problem');
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center font-mono text-slate-400 gap-3">
        <Sparkles className="w-8 h-8 text-purple-400 animate-spin" />
        <p className="text-sm">Loading problem authoring form...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-8">
        <div>
          <button
            onClick={() => onNavigate('/admin/problems')}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 transition-colors mb-3"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Problem Catalog</span>
          </button>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            {isEdit ? 'Edit Problem & Test Cases' : 'Author New Problem'}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure starter code, sample examples, and backend-isolated hidden test cases.
          </p>
        </div>
      </div>

      {success && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2 mb-6">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2 mb-6">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8 text-xs font-mono">
        {/* Section 1: Basic Info */}
        <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider text-cyan-400 font-mono">
            1. Problem Identity & Difficulty
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="text-slate-400 block mb-1">Problem Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Reverse an Array in Place"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm font-sans text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Difficulty *</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as ProblemDifficulty)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
              >
                <option value="Easy">Easy (10 pts)</option>
                <option value="Medium">Medium (20 pts)</option>
                <option value="Hard">Hard (35 pts)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-slate-400 block mb-1">Topic Tags (comma-separated)</label>
              <input
                type="text"
                value={topicTags}
                onChange={(e) => setTopicTags(e.target.value)}
                placeholder="e.g. Arrays, Two Pointers, Math"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex items-center gap-3 pt-6">
              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-800 text-cyan-500 focus:ring-0"
                />
                <span>Publish immediately to student problem library</span>
              </label>
            </div>
          </div>
        </div>

        {/* Section 2: Statement, I/O & Constraints */}
        <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4 font-sans">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider text-purple-400 font-mono">
            2. Problem Description & Formats
          </h2>

          <div>
            <label className="text-slate-400 block mb-1 font-mono text-xs">Problem Description *</label>
            <textarea
              rows={5}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed description of the task, mathematical problem formulation, requirements..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500 leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-slate-400 block mb-1 font-mono text-xs">Input Format</label>
              <input
                type="text"
                value={inputFormat}
                onChange={(e) => setInputFormat(e.target.value)}
                placeholder="e.g. A single line with N integers"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1 font-mono text-xs">Output Format</label>
              <input
                type="text"
                value={outputFormat}
                onChange={(e) => setOutputFormat(e.target.value)}
                placeholder="e.g. Print YES or NO"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1 font-mono text-xs">Constraints</label>
              <input
                type="text"
                value={constraints}
                onChange={(e) => setConstraints(e.target.value)}
                placeholder="e.g. 1 <= N <= 10^5"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Supported Languages & Starter Code */}
        <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider text-blue-400 font-mono">
            3. Supported Languages & Starter Code
          </h2>

          <div className="flex flex-wrap items-center gap-4">
            {['python', 'cpp', 'c', 'java', 'html'].map((lang) => (
              <label key={lang} className="flex items-center gap-2 cursor-pointer text-slate-300 capitalize">
                <input
                  type="checkbox"
                  checked={supportedLanguages.includes(lang)}
                  onChange={() => handleToggleLang(lang)}
                  className="rounded bg-slate-950 border-slate-800 text-cyan-500 focus:ring-0"
                />
                <span>{lang}</span>
              </label>
            ))}
          </div>

          {/* Starter code editor tabs */}
          <div className="pt-2">
            <div className="flex items-center gap-1 border-b border-slate-800 pb-2 mb-2">
              {supportedLanguages.map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setActiveStarterLang(lang)}
                  className={`px-3 py-1 rounded text-xs font-mono capitalize transition-colors ${
                    activeStarterLang === lang
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {lang} Starter Code
                </button>
              ))}
            </div>

            <textarea
              rows={6}
              value={starterCodes[activeStarterLang] || ''}
              onChange={(e) =>
                setStarterCodes({ ...starterCodes, [activeStarterLang]: e.target.value })
              }
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        {/* Section 4: Sample Test Cases (Visible to Students) */}
        <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider text-amber-400 font-mono">
              4. Sample Examples (Visible in problem description)
            </h2>
            <button
              type="button"
              onClick={handleAddSampleTest}
              className="flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 text-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Example</span>
            </button>
          </div>

          <div className="space-y-3">
            {sampleTests.map((st, i) => (
              <div key={i} className="p-4 rounded-xl bg-slate-950 border border-slate-850 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-bold">Sample Case {i + 1}</span>
                  {sampleTests.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveSampleTest(i)}
                      className="text-rose-400 hover:text-rose-300"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] text-slate-500 block mb-0.5">Input Data</span>
                    <textarea
                      rows={2}
                      value={st.input}
                      onChange={(e) => {
                        const copy = [...sampleTests];
                        copy[i].input = e.target.value;
                        setSampleTests(copy);
                      }}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 font-mono"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block mb-0.5">Expected Output</span>
                    <textarea
                      rows={2}
                      value={st.expected_output}
                      onChange={(e) => {
                        const copy = [...sampleTests];
                        copy[i].expected_output = e.target.value;
                        setSampleTests(copy);
                      }}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 font-mono"
                    />
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block mb-0.5">Explanation (optional)</span>
                  <input
                    type="text"
                    value={st.explanation || ''}
                    onChange={(e) => {
                      const copy = [...sampleTests];
                      copy[i].explanation = e.target.value;
                      setSampleTests(copy);
                    }}
                    placeholder="e.g. 2 plus 3 produces 5."
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-300 font-sans"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 5: Hidden Test Cases (Private to Backend) */}
        <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider text-rose-400 font-mono flex items-center gap-2">
                <Shield className="w-4 h-4 text-rose-400" />
                <span>5. Hidden Evaluation Test Cases (Guarded on Backend)</span>
              </h2>
              <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                These tests are never sent to the browser. The backend evaluates submissions against them.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddHiddenTest}
              className="flex items-center gap-1 px-3 py-1 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 text-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Hidden Test</span>
            </button>
          </div>

          <div className="space-y-3">
            {hiddenTests.map((ht, i) => (
              <div key={i} className="p-4 rounded-xl bg-slate-950 border border-slate-850 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-bold text-rose-400">Hidden Evaluation Case {i + 1}</span>
                  {hiddenTests.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveHiddenTest(i)}
                      className="text-rose-400 hover:text-rose-300"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] text-slate-500 block mb-0.5">Private Input</span>
                    <textarea
                      rows={2}
                      value={ht.input_data}
                      onChange={(e) => {
                        const copy = [...hiddenTests];
                        copy[i].input_data = e.target.value;
                        setHiddenTests(copy);
                      }}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 font-mono"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block mb-0.5">Expected Output</span>
                    <textarea
                      rows={2}
                      value={ht.expected_output}
                      onChange={(e) => {
                        const copy = [...hiddenTests];
                        copy[i].expected_output = e.target.value;
                        setHiddenTests(copy);
                      }}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 font-mono"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <span className="text-[10px] text-slate-500 block mb-0.5">Points</span>
                    <input
                      type="number"
                      value={ht.points}
                      onChange={(e) => {
                        const copy = [...hiddenTests];
                        copy[i].points = parseInt(e.target.value) || 10;
                        setHiddenTests(copy);
                      }}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-300"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block mb-0.5">Time Limit (ms)</span>
                    <input
                      type="number"
                      value={ht.time_limit}
                      onChange={(e) => {
                        const copy = [...hiddenTests];
                        copy[i].time_limit = parseInt(e.target.value) || 2000;
                        setHiddenTests(copy);
                      }}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-300"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={() => onNavigate('/admin/problems')}
            className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 flex items-center gap-2 shadow-xl shadow-cyan-500/25 disabled:opacity-50 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Problem...' : isEdit ? 'Update Problem' : 'Create Problem'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
