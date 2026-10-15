import React, { useEffect, useState } from 'react';
import {
  History,
  CheckCircle2,
  XCircle,
  Clock,
  Code,
  X,
  Copy,
  Check,
  Terminal,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { Submission } from '../types';
import { LanguageIcon } from '../components/LanguageIcon';
import { useAuth } from '../context/AuthContext';

interface Props {
  onNavigate: (path: string) => void;
}

export const SubmissionsPage: React.FC<Props> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSubs() {
      try {
        setLoading(true);
        const res = await fetch('/api/student/submissions', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('codearena_token')}`,
          },
        });
        if (res.ok) {
          setSubmissions(await res.json());
        }
      } catch (err) {
        console.error('Error fetching submissions:', err);
      } finally {
        setLoading(false);
      }
    }
    if (user) {
      loadSubs();
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleCopyCode = () => {
    if (selectedSubmission) {
      navigator.clipboard.writeText(selectedSubmission.source_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!user) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-xl font-bold text-white mb-2">Student Authentication Required</h2>
        <p className="text-xs text-slate-400 mb-4">Please log in to review your submission records.</p>
        <button
          onClick={() => onNavigate('/login')}
          className="px-5 py-2 rounded-xl text-xs font-bold text-slate-950 bg-cyan-400"
        >
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-mono mb-2">
            <History className="w-3.5 h-3.5" />
            <span>Submission Log</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            My Submission History
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Complete audit trail of all code evaluations, passed tests, and execution benchmarks.
          </p>
        </div>

        <button
          onClick={() => onNavigate('/problems')}
          className="self-start sm:self-auto px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition-colors flex items-center gap-1.5"
        >
          <span>Solve More Problems</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center font-mono text-slate-400 flex flex-col items-center justify-center gap-3">
          <Sparkles className="w-6 h-6 text-cyan-400 animate-spin" />
          <span>Loading submission history...</span>
        </div>
      ) : submissions.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800">
          <Code className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-200">No Submissions Yet</h3>
          <p className="text-xs text-slate-400 mt-1 mb-4">
            You haven't submitted any solutions yet. Open a problem and click Submit Solution!
          </p>
          <button
            onClick={() => onNavigate('/problems')}
            className="px-5 py-2 rounded-xl text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300"
          >
            Explore Problem Library
          </button>
        </div>
      ) : (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/80 text-xs font-mono uppercase tracking-wider text-slate-400">
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Problem</th>
                  <th className="py-3 px-4">Language</th>
                  <th className="py-3 px-4 text-center">Test Cases</th>
                  <th className="py-3 px-4 text-center">Runtime</th>
                  <th className="py-3 px-4 text-right">Submitted At</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs font-mono">
                {submissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-800/30 transition-colors">
                    {/* Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {sub.status === 'Accepted' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                        )}
                        <span
                          className={`font-bold ${
                            sub.status === 'Accepted' ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {sub.status}
                        </span>
                      </div>
                    </td>

                    {/* Problem */}
                    <td className="py-3.5 px-4 font-sans font-semibold text-slate-200">
                      <button
                        onClick={() => onNavigate(`/problems/${sub.problem_id}`)}
                        className="hover:text-cyan-400 transition-colors text-left"
                      >
                        {sub.problem_title || sub.problem_id}
                      </button>
                    </td>

                    {/* Language */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 capitalize text-slate-300">
                        <LanguageIcon language={sub.language_id} className="w-3.5 h-3.5" />
                        <span>{sub.language_id}</span>
                      </div>
                    </td>

                    {/* Test Cases */}
                    <td className="py-3.5 px-4 text-center text-slate-400">
                      {sub.passed_test_cases} / {sub.total_test_cases}
                    </td>

                    {/* Runtime */}
                    <td className="py-3.5 px-4 text-center text-slate-400">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        {sub.execution_time}ms
                      </span>
                    </td>

                    {/* Submitted At */}
                    <td className="py-3.5 px-4 text-right text-slate-500 whitespace-nowrap">
                      {new Date(sub.submitted_at).toLocaleString()}
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => setSelectedSubmission(sub)}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-sans text-xs transition-colors"
                      >
                        View Code
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Code Viewer Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>{selectedSubmission.problem_title}</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded font-mono ${
                      selectedSubmission.status === 'Accepted'
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'bg-rose-500/10 text-rose-400'
                    }`}
                  >
                    {selectedSubmission.status}
                  </span>
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Language: {selectedSubmission.language_id} • Runtime: {selectedSubmission.execution_time}ms
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-4 flex-1 overflow-auto bg-slate-950">
              <pre className="font-mono text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
                {selectedSubmission.source_code}
              </pre>
            </div>

            {selectedSubmission.error_message && (
              <div className="p-3 bg-rose-950/40 border-t border-rose-900/50 text-rose-300 text-xs font-mono">
                <span className="font-bold block mb-1">Diagnostic Output:</span>
                {selectedSubmission.error_message}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
