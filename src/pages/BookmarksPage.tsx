import React, { useEffect, useState } from 'react';
import { Bookmark, ArrowRight, Trash2, CheckCircle2, Sparkles, Terminal } from 'lucide-react';
import { CodingProblem } from '../types';
import { DifficultyBadge } from '../components/DifficultyBadge';
import { LanguageIcon } from '../components/LanguageIcon';
import { useAuth } from '../context/AuthContext';

interface Props {
  onNavigate: (path: string) => void;
}

export const BookmarksPage: React.FC<Props> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState<CodingProblem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadBookmarks = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/student/bookmarks', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('codearena_token')}`,
        },
      });
      if (res.ok) {
        setBookmarks(await res.json());
      }
    } catch (err) {
      console.error('Failed to load bookmarks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadBookmarks();
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleRemoveBookmark = async (e: React.MouseEvent, problemId: string) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/problems/${problemId}/bookmark`, { method: 'POST' });
      if (res.ok) {
        setBookmarks((prev) => prev.filter((p) => p.id !== problemId));
      }
    } catch (err) {
      console.error('Error removing bookmark:', err);
    }
  };

  if (!user) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-xl font-bold text-white mb-2">Student Authentication Required</h2>
        <p className="text-xs text-slate-400 mb-4">Please log in to view your saved problems.</p>
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs font-mono mb-2">
            <Bookmark className="w-3.5 h-3.5 fill-current" />
            <span>Saved Problem Stash</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Bookmarked Problems ({bookmarks.length})
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Revisit challenging algorithmic exercises and practice for upcoming college exams or interviews.
          </p>
        </div>

        <button
          onClick={() => onNavigate('/problems')}
          className="self-start sm:self-auto px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition-colors flex items-center gap-1.5"
        >
          <Terminal className="w-4 h-4" />
          <span>Browse All Problems</span>
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center font-mono text-slate-400 flex flex-col items-center justify-center gap-3">
          <Sparkles className="w-6 h-6 text-cyan-400 animate-spin" />
          <span>Loading bookmarked challenges...</span>
        </div>
      ) : bookmarks.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800">
          <Bookmark className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-200">No Saved Problems</h3>
          <p className="text-xs text-slate-400 mt-1 mb-4">
            Click the bookmark ribbon on any coding problem in the problem list or workspace to save it here.
          </p>
          <button
            onClick={() => onNavigate('/problems')}
            className="px-5 py-2 rounded-xl text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300"
          >
            Explore Problem Library
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {bookmarks.map((prob) => (
            <div
              key={prob.id}
              onClick={() => onNavigate(`/problems/${prob.id}`)}
              className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 hover:bg-slate-900 transition-all cursor-pointer group flex flex-col justify-between shadow-xl"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <DifficultyBadge difficulty={prob.difficulty} size="sm" />
                  <button
                    onClick={(e) => handleRemoveBookmark(e, prob.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                    title="Remove from bookmarks"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">
                  {prob.title}
                </h3>
                <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                  {prob.description.replace(/[#$*]/g, '').slice(0, 110)}...
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  {prob.supported_languages.map((l) => (
                    <LanguageIcon key={l} language={l} className="w-3.5 h-3.5 text-slate-400" />
                  ))}
                </div>
                <span className="font-semibold text-cyan-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                  Solve <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
