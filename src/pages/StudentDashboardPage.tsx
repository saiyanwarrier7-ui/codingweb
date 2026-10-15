import React, { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  CheckCircle2,
  Flame,
  Award,
  Bookmark,
  History,
  TrendingUp,
  ArrowRight,
  Sparkles,
  Calendar,
  Layers,
  Terminal,
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { useAuth } from '../context/AuthContext';
import { DifficultyBadge } from '../components/DifficultyBadge';
import { LanguageIcon } from '../components/LanguageIcon';
import { CodingProblem, Submission, UserAchievement } from '../types';

interface Props {
  onNavigate: (path: string) => void;
}

export const StudentDashboardPage: React.FC<Props> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        const res = await fetch('/api/student/dashboard', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('codearena_token')}`,
          },
        });
        if (res.ok) {
          setDashboardData(await res.json());
        }
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      loadDashboard();
    } else {
      setLoading(false);
    }
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-2xl font-bold text-white mb-2">Student Login Required</h2>
        <p className="text-sm text-slate-400 mb-6">
          Please log in to your student account to access your personal dashboard and statistics.
        </p>
        <button
          onClick={() => onNavigate('/login')}
          className="px-6 py-2.5 rounded-xl font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300"
        >
          Sign In
        </button>
      </div>
    );
  }

  if (loading || !dashboardData) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center font-mono text-slate-400 gap-3">
        <Sparkles className="w-8 h-8 text-cyan-400 animate-spin" />
        <p className="text-sm">Calculating student progress metrics...</p>
      </div>
    );
  }

  const { stats, recentSubmissions, bookmarkedProblems, achievements, activityMap } =
    dashboardData;

  const difficultyChartData = [
    { name: 'Easy', value: stats.difficulty.easy.solved, color: '#10b981' },
    { name: 'Medium', value: stats.difficulty.medium.solved, color: '#f59e0b' },
    { name: 'Hard', value: stats.difficulty.hard.solved, color: '#f43f5e' },
  ];

  // Generate 28-day activity calendar
  const pastDays = Array.from({ length: 28 }, (_, i) => {
    const d = new Date(Date.now() - (27 - i) * 86400000);
    const dateStr = d.toISOString().split('T')[0];
    const count = activityMap[dateStr] || 0;
    return { date: dateStr, count };
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-8">
      {/* Welcome Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-cyan-950/30 border border-slate-800 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded border border-cyan-500/20">
              Student Workspace
            </span>
            {user.college_name && (
              <span className="text-xs text-slate-400 font-mono">
                {user.college_name} • {user.department || 'CS'}
              </span>
            )}
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Welcome back, {user.full_name}!
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Track your daily coding consistency, evaluate submission accuracy, and master data structures.
          </p>
        </div>

        <button
          onClick={() => onNavigate('/problems')}
          className="px-6 py-3 rounded-xl font-bold text-sm bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center justify-center gap-2 shrink-0 transition-colors shadow-lg shadow-cyan-500/20"
        >
          <Terminal className="w-4 h-4" />
          <span>Continue Practicing</span>
        </button>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Solved */}
        <div
          onClick={() => onNavigate('/problems')}
          className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-cyan-500/40 cursor-pointer transition-colors"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2">
            <span>Problems Solved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">{stats.totalSolved}</div>
          <p className="text-[11px] text-slate-500 mt-1">Across all 5 language tracks</p>
        </div>

        {/* Acceptance Rate */}
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2">
            <span>Acceptance Rate</span>
            <TrendingUp className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-3xl font-extrabold text-cyan-400 font-mono">
            {stats.acceptanceRate}%
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {stats.totalSubmissions} total submissions
          </p>
        </div>

        {/* Streak */}
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2">
            <span>Coding Streak</span>
            <Flame className="w-4 h-4 text-rose-400 fill-current" />
          </div>
          <div className="text-3xl font-extrabold text-rose-400 font-mono">
            {stats.currentStreak} Days
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Max streak: {stats.longestStreak} days</p>
        </div>

        {/* Achievements Earned */}
        <div
          onClick={() => onNavigate('/leaderboard')}
          className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-purple-500/40 cursor-pointer transition-colors"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2">
            <span>Earned Badges</span>
            <Award className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-3xl font-extrabold text-purple-400 font-mono">
            {achievements.length}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Check leaderboard rank</p>
        </div>
      </div>

      {/* Main Grid: Difficulty Breakdown + Language Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Difficulty Breakdown (5 cols) */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white mb-4 flex items-center justify-between">
              <span>Difficulty Distribution</span>
              <span className="text-xs font-mono text-slate-400">
                {stats.totalSolved} Completed
              </span>
            </h3>

            {/* Donut Chart */}
            <div className="h-44 w-full relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={difficultyChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {difficultyChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#1e293b',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute text-center pointer-events-none">
                <span className="text-xl font-bold font-mono text-white block">
                  {stats.totalSolved}
                </span>
                <span className="text-[10px] text-slate-400 uppercase font-mono">Solved</span>
              </div>
            </div>

            {/* Breakdown Bars */}
            <div className="space-y-3 mt-4">
              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-emerald-400 font-semibold">Easy</span>
                  <span className="text-slate-400">
                    {stats.difficulty.easy.solved} / {stats.difficulty.easy.total}
                  </span>
                </div>
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-400 h-full rounded-full transition-all"
                    style={{
                      width: `${
                        stats.difficulty.easy.total > 0
                          ? (stats.difficulty.easy.solved / stats.difficulty.easy.total) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-amber-400 font-semibold">Medium</span>
                  <span className="text-slate-400">
                    {stats.difficulty.medium.solved} / {stats.difficulty.medium.total}
                  </span>
                </div>
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-400 h-full rounded-full transition-all"
                    style={{
                      width: `${
                        stats.difficulty.medium.total > 0
                          ? (stats.difficulty.medium.solved / stats.difficulty.medium.total) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-rose-400 font-semibold">Hard</span>
                  <span className="text-slate-400">
                    {stats.difficulty.hard.solved} / {stats.difficulty.hard.total}
                  </span>
                </div>
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-rose-400 h-full rounded-full transition-all"
                    style={{
                      width: `${
                        stats.difficulty.hard.total > 0
                          ? (stats.difficulty.hard.solved / stats.difficulty.hard.total) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Language Progress & Activity Calendar (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Language Breakdown */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
            <h3 className="text-base font-bold text-white mb-4">Language-Wise Accepted Solutions</h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {[
                { name: 'Python', slug: 'python', count: stats.languageStats.python || 0 },
                { name: 'C++', slug: 'cpp', count: stats.languageStats.cpp || 0 },
                { name: 'C', slug: 'c', count: stats.languageStats.c || 0 },
                { name: 'HTML', slug: 'html', count: stats.languageStats.html || 0 },
                { name: 'Java', slug: 'java', count: stats.languageStats.java || 0 },
              ].map((item) => (
                <div
                  key={item.slug}
                  onClick={() => onNavigate(`/languages/${item.slug}`)}
                  className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-center hover:border-cyan-500/40 cursor-pointer transition-colors"
                >
                  <LanguageIcon language={item.slug} className="w-5 h-5 mx-auto mb-2" />
                  <div className="text-lg font-bold font-mono text-white">{item.count}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{item.name}</div>
                </div>
              ))}
            </div>
          </div>

          {/* GitHub-style Coding Activity Calendar (Past 4 Weeks) */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-cyan-400" />
                <span>28-Day Practice Heatmap</span>
              </h3>
              <span className="text-xs text-slate-400 font-mono">Recent Activity</span>
            </div>

            <div className="grid grid-cols-7 gap-2">
              {pastDays.map((d, i) => (
                <div
                  key={i}
                  title={`${d.date}: ${d.count} submissions`}
                  className={`h-8 rounded-lg flex items-center justify-center text-[10px] font-mono border transition-all ${
                    d.count > 2
                      ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400'
                      : d.count > 0
                      ? 'bg-cyan-500/30 text-cyan-300 border-cyan-500/40'
                      : 'bg-slate-950 text-slate-600 border-slate-800/80'
                  }`}
                >
                  {d.date.slice(8)}
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 font-mono">
              <span>28 days ago</span>
              <div className="flex items-center gap-1.5">
                <span>Less</span>
                <span className="w-2.5 h-2.5 rounded bg-slate-950 border border-slate-800" />
                <span className="w-2.5 h-2.5 rounded bg-cyan-500/30 border border-cyan-500/40" />
                <span className="w-2.5 h-2.5 rounded bg-cyan-500" />
                <span>More</span>
              </div>
              <span>Today</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Recent Submissions & Bookmarks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Submissions */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <History className="w-4 h-4 text-blue-400" />
              <span>Recent Submissions</span>
            </h3>
            <button
              onClick={() => onNavigate('/submissions')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-medium"
            >
              View All
            </button>
          </div>

          <div className="space-y-2">
            {recentSubmissions.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">
                No submissions recorded yet. Start solving problems!
              </p>
            ) : (
              recentSubmissions.slice(0, 5).map((sub: Submission) => (
                <div
                  key={sub.id}
                  onClick={() => onNavigate(`/problems/${sub.problem_id}`)}
                  className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 cursor-pointer flex items-center justify-between text-xs transition-colors"
                >
                  <div>
                    <div className="font-semibold text-slate-200">{sub.problem_title}</div>
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5 capitalize">
                      {sub.language_id} • {new Date(sub.submitted_at).toLocaleDateString()}
                    </div>
                  </div>
                  <span
                    className={`font-mono font-bold text-xs ${
                      sub.status === 'Accepted' ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {sub.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Bookmarked Problems */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-purple-400" />
              <span>Saved / Bookmarked Problems</span>
            </h3>
            <button
              onClick={() => onNavigate('/bookmarks')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-medium"
            >
              View All
            </button>
          </div>

          <div className="space-y-2">
            {bookmarkedProblems.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">
                No bookmarked problems. Click the bookmark icon on any problem to save it here!
              </p>
            ) : (
              bookmarkedProblems.slice(0, 5).map((prob: CodingProblem) => (
                <div
                  key={prob.id}
                  onClick={() => onNavigate(`/problems/${prob.id}`)}
                  className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 cursor-pointer flex items-center justify-between text-xs transition-colors"
                >
                  <div>
                    <div className="font-semibold text-slate-200">{prob.title}</div>
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                      {prob.topic_tags.join(', ')}
                    </div>
                  </div>
                  <DifficultyBadge difficulty={prob.difficulty} size="sm" />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
