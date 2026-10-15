import React, { useEffect, useState } from 'react';
import {
  FileCode,
  Plus,
  Edit3,
  Trash2,
  CheckCircle2,
  XCircle,
  Eye,
  ChevronLeft,
  Sparkles,
  Search,
} from 'lucide-react';
import { CodingProblem } from '../types';
import { DifficultyBadge } from '../components/DifficultyBadge';
import { LanguageIcon } from '../components/LanguageIcon';
import { useAuth } from '../context/AuthContext';

interface Props {
  onNavigate: (path: string) => void;
}

export const AdminProblemsPage: React.FC<Props> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [problems, setProblems] = useState<CodingProblem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadProblems = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/problems', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('codearena_token')}`,
        },
      });
      if (res.ok) {
        setProblems(await res.json());
      }
    } catch (err) {
      console.error('Failed to load admin problems:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'admin') {
      loadProblems();
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete problem "${title}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/problems/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('codearena_token')}`,
        },
      });

      if (res.ok) {
        setProblems((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleTogglePublish = async (problem: CodingProblem) => {
    try {
      const res = await fetch(`/api/admin/problems/${problem.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('codearena_token')}`,
        },
        body: JSON.stringify({ is_published: !problem.is_published }),
      });

      if (res.ok) {
        const updated = await res.json();
        setProblems((prev) => prev.map((p) => (p.id === problem.id ? updated : p)));
      }
    } catch (err) {
      console.error('Toggle error:', err);
    }
  };

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

  const filtered = problems.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.topic_tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      {/* Top Header */}
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
            Manage Coding Problems ({problems.length})
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Author, inspect, publish, or remove exercises across Python, C++, C, HTML, and Java.
          </p>
        </div>

        <button
          onClick={() => onNavigate('/admin/problems/create')}
          className="self-start sm:self-auto px-5 py-2.5 rounded-xl font-bold text-xs bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center gap-2 transition-colors shadow-lg shadow-cyan-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Author New Problem</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="mb-6 max-w-md">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search problems..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Problems Table */}
      {loading ? (
        <div className="py-20 text-center font-mono text-slate-400 flex flex-col items-center justify-center gap-3">
          <Sparkles className="w-6 h-6 text-purple-400 animate-spin" />
          <span>Loading problem repository...</span>
        </div>
      ) : (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 uppercase text-[10px]">
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4">Difficulty</th>
                  <th className="py-3 px-4">Languages</th>
                  <th className="py-3 px-4">Sample Tests</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filtered.map((prob) => (
                  <tr key={prob.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4 font-sans font-semibold text-slate-100">
                      <div>{prob.title}</div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                        ID: {prob.id} • {prob.topic_tags.join(', ')}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <DifficultyBadge difficulty={prob.difficulty} size="sm" />
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        {prob.supported_languages.map((l) => (
                          <LanguageIcon key={l} language={l} className="w-3.5 h-3.5 text-slate-400" />
                        ))}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-400">
                      {prob.sample_tests?.length || 0} cases
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleTogglePublish(prob)}
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase transition-colors ${
                          prob.is_published
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-slate-800 text-slate-500 border border-slate-700'
                        }`}
                        title="Click to toggle publish status"
                      >
                        {prob.is_published ? 'Published' : 'Draft'}
                      </button>
                    </td>

                    <td className="py-3.5 px-4 text-right space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => onNavigate(`/problems/${prob.id}`)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors"
                        title="View problem workspace"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onNavigate(`/admin/problems/${prob.id}/edit`)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-purple-400 hover:bg-slate-800 transition-colors"
                        title="Edit problem and hidden test cases"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(prob.id, prob.title)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                        title="Delete problem"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
