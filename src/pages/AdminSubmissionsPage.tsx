import React, { useEffect, useState } from 'react';
import {
  History,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronLeft,
  X,
  Copy,
  Check,
  Search,
  Sparkles,
} from 'lucide-react';
import { Submission } from '../types';
import { LanguageIcon } from '../components/LanguageIcon';
import { useAuth } from '../context/AuthContext';

interface Props {
  onNavigate: (path: string) => void;
}

export const AdminSubmissionsPage: React.FC<Props> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadSubs() {
      try {
        setLoading(true);
        const res = await fetch('/api/admin/submissions', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('codearena_token')}`,
          },
        });
        if (res.ok) {
          setSubmissions(await res.json());
        }
      } catch (err) {
        console.error('Failed to load admin submissions:', err);
      } finally {
        setLoading(false);
      }
    }
    if (user && user.role === 'admin') {
      loadSubs();
    } else {
      setLoading(false);
    }
  }, [user]);

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

  const filtered = submissions.filter((s) => {
    if (filterStatus !== 'all' && s.status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <button
            onClick={() => onNavigate('/admin/dashboard')}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 transition-colors mb-3"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Admin Overview</span>
          </button>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Review Submissions & Error Logs ({submissions.length})
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Audit student solutions, grading diagnostics, and compiler outputs.
          </p>
        </div>

        {/* Status filter */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500 self-start sm:self-auto"
        >
          <option value="all">All Statuses</option>
          <option value="Accepted">Accepted Only</option>
          <option value="Wrong Answer">Wrong Answer</option>
          <option value="Compilation Error">Compilation Error</option>
          <option value="Runtime Error">Runtime Error</option>
          <option value="Time Limit Exceeded">Time Limit Exceeded</option>
        </select>
      </div>

      {loading ? (
        <div className="py-20 text-center font-mono text-slate-400 flex flex-col items-center justify-center gap-3">
          <Sparkles className="w-6 h-6 text-purple-400 animate-spin" />
          <span>Loading submissions log...</span>
        </div>
      ) : (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 uppercase text-[10px]">
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Problem</th>
                  <th className="py-3 px-4">Language</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center">Score</th>
                  <th className="py-3 px-4 text-center">Runtime</th>
                  <th className="py-3 px-4 text-right">Submitted</th>
                  <th className="py-3 px-4 text-center">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filtered.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4 font-sans font-semibold text-slate-100">
                      {sub.user_name || sub.user_id}
                    </td>

                    <td className="py-3.5 px-4 font-sans text-slate-300">
                      {sub.problem_title || sub.problem_id}
                    </td>

                    <td className="py-3.5 px-4 capitalize">
                      <div className="flex items-center gap-1.5">
                        <LanguageIcon language={sub.language_id} className="w-3.5 h-3.5" />
                        <span>{sub.language_id}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`font-bold ${
                          sub.status === 'Accepted' ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {sub.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center text-slate-400">
                      {sub.passed_test_cases}/{sub.total_test_cases}
                    </td>

                    <td className="py-3.5 px-4 text-center text-slate-400">
                      {sub.execution_time}ms
                    </td>

                    <td className="py-3.5 px-4 text-right text-slate-500 whitespace-nowrap">
                      {new Date(sub.submitted_at).toLocaleString()}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => setSelectedSubmission(sub)}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-sans text-xs transition-colors"
                      >
                        Review Code
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
                  Student: {selectedSubmission.user_name} • Lang: {selectedSubmission.language_id}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(selectedSubmission.source_code);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
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
                <span className="font-bold block mb-1">Execution Diagnostics:</span>
                {selectedSubmission.error_message}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
