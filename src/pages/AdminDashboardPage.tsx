import React, { useEffect, useState } from 'react';
import {
  Shield,
  FileCode,
  Users,
  History,
  Download,
  Plus,
  Terminal,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Submission, UserProfile } from '../types';

interface Props {
  onNavigate: (path: string) => void;
}

export const AdminDashboardPage: React.FC<Props> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [data, setData] = useState<{
    stats: any;
    recentSubmissions: Submission[];
    usersCount: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAdminData() {
      try {
        setLoading(true);
        const res = await fetch('/api/admin/overview', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('codearena_token')}`,
          },
        });
        if (res.ok) {
          setData(await res.json());
        }
      } catch (err) {
        console.error('Error fetching admin data:', err);
      } finally {
        setLoading(false);
      }
    }

    if (user && user.role === 'admin') {
      loadAdminData();
    } else {
      setLoading(false);
    }
  }, [user]);

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center text-center px-4">
        <Shield className="w-12 h-12 text-rose-500 mb-3" />
        <h2 className="text-2xl font-bold text-white mb-2">Access Restricted</h2>
        <p className="text-xs text-slate-400 max-w-md mb-6">
          This portal requires Administrator credentials. Sign in with the administrative account to continue.
        </p>
        <button
          onClick={() => onNavigate('/admin/login')}
          className="px-6 py-2.5 rounded-xl font-bold text-xs bg-purple-500 hover:bg-purple-400 text-white"
        >
          Admin Sign In
        </button>
      </div>
    );
  }

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center font-mono text-slate-400 gap-3">
        <Sparkles className="w-8 h-8 text-purple-400 animate-spin" />
        <p className="text-sm">Loading Administrator Portal...</p>
      </div>
    );
  }

  const { stats, recentSubmissions, usersCount } = data;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-8">
      {/* Header */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-purple-950/40 via-slate-900 to-slate-900 border border-purple-500/30 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-purple-400 bg-purple-500/10 px-2.5 py-0.5 rounded border border-purple-500/20">
              Instructor / Super Admin
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            CodeArena Administrative Portal
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Curate problem catalog, author hidden evaluation test cases, review platform submissions, and inspect student activity.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('/admin/problems/create')}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center gap-2 transition-colors shadow-lg shadow-cyan-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Problem</span>
          </button>
        </div>
      </div>

      {/* Admin KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div
          onClick={() => onNavigate('/admin/problems')}
          className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-purple-500/40 cursor-pointer transition-colors"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Total Problems</span>
            <FileCode className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-bold font-mono text-white">{stats.totalProblems}</div>
          <p className="text-[11px] text-slate-500 mt-1">Manage, edit, or author</p>
        </div>

        <div
          onClick={() => onNavigate('/admin/users')}
          className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-purple-500/40 cursor-pointer transition-colors"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Student Accounts</span>
            <Users className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-3xl font-bold font-mono text-purple-400">{usersCount}</div>
          <p className="text-[11px] text-slate-500 mt-1">Registered students</p>
        </div>

        <div
          onClick={() => onNavigate('/admin/submissions')}
          className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-purple-500/40 cursor-pointer transition-colors"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Total Submissions</span>
            <History className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-3xl font-bold font-mono text-blue-400">
            {stats.totalSubmissions}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Live grading log</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Acceptance Rate</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-bold font-mono text-emerald-400">
            {stats.acceptanceRate}%
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Overall platform pass rate</p>
        </div>
      </div>

      {/* Admin Action Modules */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          onClick={() => onNavigate('/admin/problems')}
          className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 cursor-pointer transition-all group"
        >
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-4">
            <FileCode className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">
            Manage Problem Catalog
          </h3>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            Create algorithmic tasks, configure starter codes across 5 languages, set constraints, and update private test cases.
          </p>
          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center text-xs font-semibold text-cyan-400">
            <span>View All Problems →</span>
          </div>
        </div>

        <div
          onClick={() => onNavigate('/admin/submissions')}
          className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-purple-500/40 cursor-pointer transition-all group"
        >
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-4">
            <History className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white group-hover:text-purple-400 transition-colors">
            Submissions & Error Logs
          </h3>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            Inspect all student code submissions, compilation errors, runtime failures, and time-limit exceedances.
          </p>
          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center text-xs font-semibold text-purple-400">
            <span>Review Submissions →</span>
          </div>
        </div>

        <div
          onClick={() => {
            window.open('/api/admin/export', '_blank');
          }}
          className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 cursor-pointer transition-all group"
        >
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
            <Download className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">
            Export Problem Bank (JSON)
          </h3>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            Download a full backup archive of all coding problems, supported languages, and hidden test cases in standardized JSON format.
          </p>
          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center text-xs font-semibold text-emerald-400">
            <span>Download Archive →</span>
          </div>
        </div>
      </div>

      {/* Recent Submissions Feed */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <History className="w-4 h-4 text-purple-400" />
            <span>Platform-Wide Recent Submissions</span>
          </h3>
          <button
            onClick={() => onNavigate('/admin/submissions')}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-medium"
          >
            View All Log
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                <th className="py-2.5 px-3">Student</th>
                <th className="py-2.5 px-3">Problem</th>
                <th className="py-2.5 px-3">Language</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {recentSubmissions.slice(0, 6).map((sub) => (
                <tr key={sub.id} className="hover:bg-slate-800/30">
                  <td className="py-2.5 px-3 font-sans font-medium text-slate-200">
                    {sub.user_name || 'Student'}
                  </td>
                  <td className="py-2.5 px-3 text-slate-300 font-sans">
                    {sub.problem_title || sub.problem_id}
                  </td>
                  <td className="py-2.5 px-3 capitalize text-slate-400">{sub.language_id}</td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`font-bold ${
                        sub.status === 'Accepted' ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {sub.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-500">
                    {new Date(sub.submitted_at).toLocaleTimeString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
