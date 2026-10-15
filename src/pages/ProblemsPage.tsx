import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Filter,
  CheckCircle2,
  Bookmark,
  Terminal,
  Flame,
  ArrowUpDown,
  BookOpen,
  Sparkles,
  Play,
  RotateCcw,
} from 'lucide-react';
import { CodingProblem, DailyChallenge } from '../types';
import { DifficultyBadge } from '../components/DifficultyBadge';
import { LanguageIcon } from '../components/LanguageIcon';
import { useAuth } from '../context/AuthContext';

interface Props {
  onNavigate: (path: string) => void;
}

export const ProblemsPage: React.FC<Props> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [problems, setProblems] = useState<CodingProblem[]>([]);
  const [dailyChallenge, setDailyChallenge] = useState<DailyChallenge | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'solved' | 'unsolved'>('all');
  const [onlyBookmarked, setOnlyBookmarked] = useState(false);
  const [sortBy, setSortBy] = useState<'default' | 'title' | 'difficulty'>('default');

  const fetchProblems = async () => {
    try {
      setLoading(true);
      const [probsRes, dcRes] = await Promise.all([
        fetch('/api/problems'),
        fetch('/api/daily-challenge'),
      ]);

      if (probsRes.ok) {
        const data = await probsRes.json();
        setProblems(data);
      }
      if (dcRes.ok) {
        setDailyChallenge(await dcRes.json());
      }
    } catch (err) {
      console.error('Error fetching problems:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProblems();
  }, [user]);

  const handleToggleBookmark = async (e: React.MouseEvent, problemId: string) => {
    e.stopPropagation();
    if (!user) {
      onNavigate('/login');
      return;
    }

    try {
      const res = await fetch(`/api/problems/${problemId}/bookmark`, {
        method: 'POST',
      });
      if (res.ok) {
        const { bookmarked } = await res.json();
        setProblems((prev) =>
          prev.map((p) => (p.id === problemId ? { ...p, is_bookmarked: bookmarked } : p))
        );
      }
    } catch (err) {
      console.error('Failed to toggle bookmark:', err);
    }
  };

  // Collect all unique topics for dropdown
  const allTopics = useMemo(() => {
    const set = new Set<string>();
    problems.forEach((p) => p.topic_tags.forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [problems]);

  // Filtered & sorted problems
  const filteredProblems = useMemo(() => {
    return problems
      .filter((p) => {
        // Search query
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          const matchTitle = p.title.toLowerCase().includes(q);
          const matchTag = p.topic_tags.some((t) => t.toLowerCase().includes(q));
          if (!matchTitle && !matchTag) return false;
        }

        // Language
        if (selectedLanguage !== 'all') {
          if (!p.supported_languages.includes(selectedLanguage.toLowerCase())) return false;
        }

        // Difficulty
        if (selectedDifficulty !== 'All') {
          if (p.difficulty.toLowerCase() !== selectedDifficulty.toLowerCase()) return false;
        }

        // Topic
        if (selectedTopic !== 'all') {
          if (!p.topic_tags.map((t) => t.toLowerCase()).includes(selectedTopic.toLowerCase())) return false;
        }

        // Status
        if (statusFilter === 'solved' && !p.is_solved) return false;
        if (statusFilter === 'unsolved' && p.is_solved) return false;

        // Bookmarks
        if (onlyBookmarked && !p.is_bookmarked) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'title') {
          return a.title.localeCompare(b.title);
        }
        if (sortBy === 'difficulty') {
          const weights: Record<string, number> = { Easy: 1, Medium: 2, Hard: 3 };
          return (weights[a.difficulty] || 0) - (weights[b.difficulty] || 0);
        }
        return 0;
      });
  }, [
    problems,
    searchQuery,
    selectedLanguage,
    selectedDifficulty,
    selectedTopic,
    statusFilter,
    onlyBookmarked,
    sortBy,
  ]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedLanguage('all');
    setSelectedDifficulty('All');
    setSelectedTopic('all');
    setStatusFilter('all');
    setOnlyBookmarked(false);
    setSortBy('default');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
              Problem Library
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {filteredProblems.length} of {problems.length} problems shown
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Coding Challenges & Exercises
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Solve problems across Python, C++, C, HTML, and Java with automated hidden test case validation.
          </p>
        </div>

        {dailyChallenge && dailyChallenge.problem && (
          <button
            onClick={() => onNavigate(`/problems/${dailyChallenge.problem_id}`)}
            className="flex items-center gap-3 p-3 rounded-xl bg-slate-900 border border-amber-500/30 hover:border-amber-500/60 shadow-lg shadow-amber-500/10 transition-colors text-left"
          >
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-mono text-amber-400 font-bold uppercase">
                Today's Daily Challenge
              </div>
              <div className="text-xs font-bold text-white truncate max-w-[180px]">
                {dailyChallenge.problem.title}
              </div>
            </div>
            <Play className="w-4 h-4 text-amber-400 shrink-0 fill-current ml-2" />
          </button>
        )}
      </div>

      {/* Filter and Search Bar Controls */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 mb-6 shadow-xl space-y-4">
        {/* Top search and primary language pills */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search problems by title, keywords, or algorithms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          {/* Language selector tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
            {[
              { id: 'all', label: 'All Languages' },
              { id: 'python', label: 'Python' },
              { id: 'cpp', label: 'C++' },
              { id: 'c', label: 'C' },
              { id: 'html', label: 'HTML' },
              { id: 'java', label: 'Java' },
            ].map((lang) => (
              <button
                key={lang.id}
                onClick={() => setSelectedLanguage(lang.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  selectedLanguage === lang.id
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-white bg-slate-950/60 border border-slate-800'
                }`}
              >
                {lang.id !== 'all' && <LanguageIcon language={lang.id} className="w-3.5 h-3.5" />}
                <span>{lang.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Secondary filters row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/80 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            {/* Difficulty */}
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
            >
              <option value="All">Difficulty: All</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>

            {/* Topic dropdown */}
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
            >
              <option value="all">Topic: All</option>
              {allTopics.map((topic) => (
                <option key={topic} value={topic}>
                  {topic}
                </option>
              ))}
            </select>

            {/* Solved Status */}
            {user && (
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
              >
                <option value="all">Status: All</option>
                <option value="solved">Solved</option>
                <option value="unsolved">Unsolved</option>
              </select>
            )}

            {/* Bookmark toggle */}
            {user && (
              <button
                onClick={() => setOnlyBookmarked(!onlyBookmarked)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-colors ${
                  onlyBookmarked
                    ? 'bg-purple-500/20 text-purple-400 border-purple-500/40'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5 fill-current" />
                <span>Saved</span>
              </button>
            )}
          </div>

          {/* Sort By & Reset */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-slate-400 font-mono">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
              <span>Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
              >
                <option value="default">Default</option>
                <option value="title">Title (A-Z)</option>
                <option value="difficulty">Difficulty</option>
              </select>
            </div>

            <button
              onClick={resetFilters}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-950 border border-slate-800"
              title="Reset Filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Problems Table / List */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        {loading ? (
          <div className="py-20 text-center font-mono text-slate-400 flex flex-col items-center justify-center gap-3">
            <Sparkles className="w-6 h-6 text-cyan-400 animate-spin" />
            <span>Loading coding challenges...</span>
          </div>
        ) : filteredProblems.length === 0 ? (
          <div className="py-20 text-center text-slate-400">
            <p className="text-base font-semibold text-slate-300">No problems match your criteria.</p>
            <p className="text-xs text-slate-500 mt-1">Try resetting the language, topic, or search term.</p>
            <button
              onClick={resetFilters}
              className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-cyan-400 hover:bg-slate-700 transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/80 text-xs font-mono uppercase tracking-wider text-slate-400">
                  <th className="py-3.5 px-4 w-12 text-center">Status</th>
                  <th className="py-3.5 px-4">Title & Description</th>
                  <th className="py-3.5 px-4 w-28">Difficulty</th>
                  <th className="py-3.5 px-4 hidden md:table-cell">Languages</th>
                  <th className="py-3.5 px-4 hidden lg:table-cell">Tags</th>
                  <th className="py-3.5 px-4 w-16 text-center">Save</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredProblems.map((prob) => (
                  <tr
                    key={prob.id}
                    onClick={() => onNavigate(`/problems/${prob.id}`)}
                    className="hover:bg-slate-800/40 cursor-pointer transition-colors group"
                  >
                    {/* Status */}
                    <td className="py-4 px-4 text-center">
                      {prob.is_solved ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 mx-auto" />
                      ) : (
                        <span className="w-2.5 h-2.5 rounded-full bg-slate-700 block mx-auto group-hover:bg-cyan-500/50" />
                      )}
                    </td>

                    {/* Title */}
                    <td className="py-4 px-4">
                      <div className="font-semibold text-slate-100 group-hover:text-cyan-400 transition-colors flex items-center gap-2">
                        <span>{prob.title}</span>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-1 mt-0.5 font-light">
                        {prob.description.replace(/[#$*]/g, '').slice(0, 95)}...
                      </p>
                    </td>

                    {/* Difficulty */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <DifficultyBadge difficulty={prob.difficulty} />
                    </td>

                    {/* Languages */}
                    <td className="py-4 px-4 hidden md:table-cell whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {prob.supported_languages.map((l) => (
                          <span key={l} title={l}>
                            <LanguageIcon language={l} className="w-4 h-4 text-slate-400" />
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Tags */}
                    <td className="py-4 px-4 hidden lg:table-cell">
                      <div className="flex flex-wrap gap-1.5 max-w-xs">
                        {prob.topic_tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Bookmark */}
                    <td className="py-4 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={(e) => handleToggleBookmark(e, prob.id)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          prob.is_bookmarked
                            ? 'text-purple-400 bg-purple-500/10'
                            : 'text-slate-600 hover:text-slate-300'
                        }`}
                        title={prob.is_bookmarked ? 'Remove Bookmark' : 'Bookmark Problem'}
                      >
                        <Bookmark
                          className={`w-4 h-4 ${prob.is_bookmarked ? 'fill-current' : ''}`}
                        />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
