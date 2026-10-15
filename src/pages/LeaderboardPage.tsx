import React, { useEffect, useState } from 'react';
import {
  Trophy,
  Medal,
  Award,
  Flame,
  Zap,
  Sparkles,
  Terminal,
  Cpu,
  Code,
  Globe,
  Coffee,
  CheckCircle2,
} from 'lucide-react';
import { LeaderboardEntry, Achievement } from '../types';

interface Props {
  onNavigate: (path: string) => void;
}

export const LeaderboardPage: React.FC<Props> = ({ onNavigate }) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [lbRes, achRes] = await Promise.all([
          fetch('/api/leaderboard'),
          fetch('/api/achievements'),
        ]);
        if (lbRes.ok) setLeaderboard(await lbRes.json());
        if (achRes.ok) setAchievements(await achRes.json());
      } catch (err) {
        console.error('Error fetching leaderboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const getBadgeIcon = (iconName: string) => {
    switch (iconName) {
      case 'Award':
        return Award;
      case 'Trophy':
        return Trophy;
      case 'Flame':
        return Flame;
      case 'Zap':
        return Zap;
      case 'Terminal':
        return Terminal;
      case 'Cpu':
        return Cpu;
      case 'Code':
        return Code;
      case 'Globe':
        return Globe;
      case 'Coffee':
        return Coffee;
      default:
        return Medal;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-mono text-amber-400 mb-3">
          <Trophy className="w-3.5 h-3.5" />
          <span>Real-Time University Rankings</span>
        </div>
        <h1 className="text-4xl font-extrabold text-white tracking-tight">
          CodeArena Global Leaderboard
        </h1>
        <p className="text-sm text-slate-400 mt-2">
          Rankings are calculated dynamically based on problem difficulty points, first-time completion, and daily streaks.
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center font-mono text-slate-400 flex flex-col items-center justify-center gap-3">
          <Sparkles className="w-6 h-6 text-cyan-400 animate-spin" />
          <span>Calculating leaderboard rankings...</span>
        </div>
      ) : (
        <div className="space-y-12">
          {/* Top 3 Podium Highlights if at least 3 students */}
          {leaderboard.length >= 3 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto pt-6">
              {/* Silver (Rank 2) */}
              <div className="order-2 md:order-1 p-6 rounded-2xl bg-slate-900/60 border border-slate-800 text-center flex flex-col items-center justify-center relative shadow-xl">
                <div className="w-12 h-12 rounded-full bg-slate-400/20 text-slate-300 flex items-center justify-center font-mono font-bold text-lg mb-3 border border-slate-400/30">
                  #2
                </div>
                <h3 className="text-lg font-bold text-white">{leaderboard[1].display_name}</h3>
                <p className="text-xs text-slate-400">{leaderboard[1].college_name || 'College'}</p>
                <div className="mt-4 flex items-center gap-4 text-xs font-mono">
                  <div>
                    <div className="font-bold text-cyan-400">{leaderboard[1].points}</div>
                    <div className="text-slate-500">Points</div>
                  </div>
                  <div>
                    <div className="font-bold text-emerald-400">{leaderboard[1].problems_solved}</div>
                    <div className="text-slate-500">Solved</div>
                  </div>
                </div>
              </div>

              {/* Gold (Rank 1) */}
              <div className="order-1 md:order-2 p-8 rounded-3xl bg-gradient-to-b from-amber-500/10 via-slate-900 to-slate-900 border border-amber-500/40 text-center flex flex-col items-center justify-center relative -translate-y-2 shadow-2xl shadow-amber-500/10">
                <div className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-mono font-extrabold text-2xl mb-4 border border-amber-500/50 shadow-lg shadow-amber-500/20">
                  <Trophy className="w-8 h-8 fill-current" />
                </div>
                <div className="text-xs font-mono text-amber-400 font-bold uppercase tracking-wider mb-1">
                  Rank 1 Champion
                </div>
                <h3 className="text-xl font-extrabold text-white">{leaderboard[0].display_name}</h3>
                <p className="text-xs text-slate-400">{leaderboard[0].college_name || 'University'}</p>
                <div className="mt-5 flex items-center gap-6 text-xs font-mono">
                  <div>
                    <div className="text-lg font-bold text-amber-400">{leaderboard[0].points}</div>
                    <div className="text-slate-400">Total Pts</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-emerald-400">
                      {leaderboard[0].problems_solved}
                    </div>
                    <div className="text-slate-400">Problems</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-rose-400 flex items-center justify-center gap-0.5">
                      <Flame className="w-4 h-4 fill-current" />
                      {leaderboard[0].current_streak}d
                    </div>
                    <div className="text-slate-400">Streak</div>
                  </div>
                </div>
              </div>

              {/* Bronze (Rank 3) */}
              <div className="order-3 md:order-3 p-6 rounded-2xl bg-slate-900/60 border border-slate-800 text-center flex flex-col items-center justify-center relative shadow-xl">
                <div className="w-12 h-12 rounded-full bg-amber-700/20 text-amber-600 flex items-center justify-center font-mono font-bold text-lg mb-3 border border-amber-700/30">
                  #3
                </div>
                <h3 className="text-lg font-bold text-white">{leaderboard[2].display_name}</h3>
                <p className="text-xs text-slate-400">{leaderboard[2].college_name || 'College'}</p>
                <div className="mt-4 flex items-center gap-4 text-xs font-mono">
                  <div>
                    <div className="font-bold text-cyan-400">{leaderboard[2].points}</div>
                    <div className="text-slate-500">Points</div>
                  </div>
                  <div>
                    <div className="font-bold text-emerald-400">{leaderboard[2].problems_solved}</div>
                    <div className="text-slate-500">Solved</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Full Leaderboard Table */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/80 text-xs font-mono uppercase tracking-wider text-slate-400">
                    <th className="py-3.5 px-4 w-16 text-center">Rank</th>
                    <th className="py-3.5 px-4">Student</th>
                    <th className="py-3.5 px-4 hidden sm:table-cell">Institution</th>
                    <th className="py-3.5 px-4 text-center">Solved</th>
                    <th className="py-3.5 px-4 text-center">Points</th>
                    <th className="py-3.5 px-4 text-center">Streak</th>
                    <th className="py-3.5 px-4 text-center">Badges</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
                  {leaderboard.map((entry) => (
                    <tr key={entry.user_id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-4 px-4 text-center font-bold">
                        {entry.rank === 1 ? (
                          <span className="text-amber-400 font-extrabold text-sm">🥇 #1</span>
                        ) : entry.rank === 2 ? (
                          <span className="text-slate-300 font-extrabold text-sm">🥈 #2</span>
                        ) : entry.rank === 3 ? (
                          <span className="text-amber-600 font-extrabold text-sm">🥉 #3</span>
                        ) : (
                          <span className="text-slate-500">#{entry.rank}</span>
                        )}
                      </td>

                      <td className="py-4 px-4 font-sans font-semibold text-slate-100">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-purple-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                            {entry.display_name.charAt(0)}
                          </div>
                          <div>
                            <div>{entry.display_name}</div>
                            <div className="text-[11px] text-slate-400 sm:hidden">
                              {entry.college_name || 'Student'}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4 hidden sm:table-cell font-sans text-slate-400">
                        {entry.college_name || '—'}
                      </td>

                      <td className="py-4 px-4 text-center font-bold text-emerald-400">
                        {entry.problems_solved}
                      </td>

                      <td className="py-4 px-4 text-center font-extrabold text-cyan-400">
                        {entry.points}
                      </td>

                      <td className="py-4 px-4 text-center">
                        <span className="inline-flex items-center gap-1 text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                          <Flame className="w-3.5 h-3.5 fill-current" />
                          {entry.current_streak}d
                        </span>
                      </td>

                      <td className="py-4 px-4 text-center text-purple-400 font-bold">
                        {entry.badges_count}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Achievement Badges Showcase */}
          <div className="pt-8">
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
              <Award className="w-6 h-6 text-purple-400" />
              <span>Platform Achievement Badges</span>
            </h2>
            <p className="text-xs text-slate-400 mb-6">
              Unlock prestigious badges by maintaining coding streaks, solving problems across diverse languages, and conquering challenges.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {achievements.map((ach) => {
                const IconComponent = getBadgeIcon(ach.badge_icon);
                return (
                  <div
                    key={ach.id}
                    className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center flex flex-col items-center justify-between"
                  >
                    <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-3">
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{ach.name}</h4>
                      <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                        {ach.description}
                      </p>
                    </div>
                    <div className="mt-3 text-[10px] font-mono text-cyan-400 uppercase tracking-wider">
                      {ach.criteria}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
