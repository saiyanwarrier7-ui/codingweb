import React, { useEffect, useState } from 'react';
import {
  Terminal,
  Code2,
  ArrowRight,
  Flame,
  CheckCircle2,
  Trophy,
  Users,
  Layers,
  Sparkles,
  Zap,
  Play,
  Lock,
  ChevronRight,
  Cpu,
  Coffee,
  Globe,
  Code,
} from 'lucide-react';
import { CodingProblem, LanguageTrack, PlatformStats, DailyChallenge } from '../types';
import { DifficultyBadge } from '../components/DifficultyBadge';
import { LanguageIcon } from '../components/LanguageIcon';
import { useAuth } from '../context/AuthContext';

interface Props {
  onNavigate: (path: string) => void;
}

export const HomePage: React.FC<Props> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [languages, setLanguages] = useState<LanguageTrack[]>([]);
  const [featuredProblems, setFeaturedProblems] = useState<CodingProblem[]>([]);
  const [dailyChallenge, setDailyChallenge] = useState<DailyChallenge | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHomeData() {
      try {
        const [statsRes, langRes, probsRes, dcRes] = await Promise.all([
          fetch('/api/stats'),
          fetch('/api/languages'),
          fetch('/api/problems'),
          fetch('/api/daily-challenge'),
        ]);

        if (statsRes.ok) setStats(await statsRes.json());
        if (langRes.ok) setLanguages(await langRes.json());
        if (probsRes.ok) {
          const allProbs: CodingProblem[] = await probsRes.json();
          // Filter diverse sample problems: easy, medium, hard
          setFeaturedProblems(allProbs.slice(0, 6));
        }
        if (dcRes.ok) setDailyChallenge(await dcRes.json());
      } catch (err) {
        console.error('Error fetching home data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadHomeData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 border-b border-slate-800/60">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-cyan-600/20 via-blue-600/15 to-purple-600/20 blur-[120px] pointer-events-none rounded-full" />
        <div className="absolute top-10 right-10 w-72 h-72 bg-cyan-500/10 blur-[90px] pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-cyan-500/30 text-xs font-mono text-cyan-400 mb-6 shadow-lg shadow-cyan-950/50">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
            <span>Interactive Code Execution Engine • Python, C++, C, HTML, Java</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight sm:leading-none">
            Master Coding{' '}
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 bg-clip-text text-transparent">
              One Problem
            </span>{' '}
            at a Time.
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto font-light leading-relaxed">
            Practice real programming problems, write and execute code in an integrated IDE, submit solutions against hidden test cases, and level up your software engineering skills.
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => onNavigate(user ? '/problems' : '/register')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl text-base font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 shadow-xl shadow-cyan-500/25 flex items-center justify-center gap-2 group transition-all"
            >
              <span>{user ? 'Start Practicing Now' : 'Create Free Student Account'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => onNavigate('/problems')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl text-base font-semibold text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 hover:border-cyan-500/50 transition-all flex items-center justify-center gap-2"
            >
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span>Explore Problems</span>
            </button>
          </div>

          {/* Real Platform Statistics (using actual database values) */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 backdrop-blur-sm">
              <div className="text-2xl sm:text-3xl font-extrabold text-cyan-400 font-mono">
                {stats ? stats.totalProblems : '12+'}
              </div>
              <div className="text-xs text-slate-400 font-medium mt-1">Available Problems</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 backdrop-blur-sm">
              <div className="text-2xl sm:text-3xl font-extrabold text-purple-400 font-mono">
                {stats ? stats.totalLanguages : '5'}
              </div>
              <div className="text-xs text-slate-400 font-medium mt-1">Supported Languages</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 backdrop-blur-sm">
              <div className="text-2xl sm:text-3xl font-extrabold text-blue-400 font-mono">
                {stats ? stats.totalStudents : '4'}
              </div>
              <div className="text-xs text-slate-400 font-medium mt-1">Registered Students</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 backdrop-blur-sm">
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">
                {stats ? `${stats.acceptanceRate}%` : '85%'}
              </div>
              <div className="text-xs text-slate-400 font-medium mt-1">Avg Acceptance Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Daily Challenge Banner */}
      {dailyChallenge && dailyChallenge.problem && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20 w-full">
          <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-950/80 via-slate-900 to-purple-950/80 border border-cyan-500/30 shadow-2xl backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 shadow-lg shadow-amber-500/20">
                <Flame className="w-7 h-7 animate-bounce" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    Daily Challenge
                  </span>
                  <DifficultyBadge difficulty={dailyChallenge.problem.difficulty} />
                  <span className="text-xs text-slate-400 font-mono">+{dailyChallenge.points} pts</span>
                </div>
                <h3 className="text-xl font-bold text-white">
                  {dailyChallenge.problem.title}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                  {dailyChallenge.problem.description.replace(/###/g, '').slice(0, 100)}...
                </p>
              </div>
            </div>

            <button
              onClick={() => onNavigate(`/problems/${dailyChallenge.problem_id}`)}
              className="w-full md:w-auto px-6 py-2.5 rounded-xl font-bold text-sm bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center justify-center gap-2 shrink-0 transition-colors shadow-lg shadow-cyan-500/25"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Solve Today's Challenge</span>
            </button>
          </div>
        </section>
      )}

      {/* Programming Languages Track Section */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <div className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-400 mb-2">
              Curated Learning Roadmaps
            </div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">
              Master the Big 5 Programming Languages
            </h2>
          </div>
          <button
            onClick={() => onNavigate('/languages')}
            className="mt-4 md:mt-0 text-sm font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 group"
          >
            <span>View All Tracks & Curriculums</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {languages.map((lang) => (
            <div
              key={lang.id}
              onClick={() => onNavigate(`/languages/${lang.slug}`)}
              className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 hover:bg-slate-900 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <LanguageIcon language={lang.slug} className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded">
                    {lang.problemCount || 3} exercises
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">
                  {lang.name}
                </h3>
                <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                  {lang.description}
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-800/60 flex items-center justify-between text-xs font-medium text-cyan-400">
                <span>Explore Track</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Problems Section */}
      <section className="py-16 bg-slate-900/30 border-y border-slate-800/60 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
            <div>
              <div className="text-xs font-mono font-semibold uppercase tracking-wider text-purple-400 mb-2">
                Hand-Picked Coding Challenges
              </div>
              <h2 className="text-3xl font-extrabold text-white tracking-tight">
                Featured Practice Problems
              </h2>
            </div>
            <button
              onClick={() => onNavigate('/problems')}
              className="mt-4 md:mt-0 text-sm font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 group"
            >
              <span>View All Problems</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {featuredProblems.map((problem) => (
              <div
                key={problem.id}
                onClick={() => onNavigate(`/problems/${problem.id}`)}
                className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 hover:bg-slate-900 transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <DifficultyBadge difficulty={problem.difficulty} />
                    <div className="flex items-center gap-1.5">
                      {problem.supported_languages.map((l) => (
                        <LanguageIcon key={l} language={l} className="w-3.5 h-3.5 text-slate-500" />
                      ))}
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">
                    {problem.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                    {problem.description.replace(/[#$*]/g, '').slice(0, 130)}...
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between">
                  <div className="flex flex-wrap gap-1.5">
                    {problem.topic_tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <span className="text-xs font-semibold text-cyan-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                    Solve <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-400 mb-2">
            The CodeArena Workflow
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            How Students Practice and Excel
          </h2>
          <p className="text-sm text-slate-400 mt-3">
            A frictionless, browser-based coding experience with server-enforced automated grading.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 relative">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-lg mb-4 font-mono">
              01
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Pick Your Language</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Choose from Python, C++, C, HTML, or Java. Filter problems by difficulty, category, or daily challenges.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 relative">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-lg mb-4 font-mono">
              02
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Code in Real-Time</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Use the built-in Monaco Editor with syntax highlighting, automatic indentation, custom test inputs, and sandboxed live HTML preview.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 relative">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-lg mb-4 font-mono">
              03
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Submit & Track Progress</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Your solution runs against isolated hidden test cases. Earn achievements, maintain coding streaks, and climb the university leaderboard.
            </p>
          </div>
        </div>
      </section>

      {/* Demo Credentials Quick-Card */}
      <section className="pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-purple-950/40 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">
                One-Click Quick Test Accounts
              </span>
            </div>
            <h4 className="text-base font-bold text-white mt-1">
              Test Student or Administrator Experience Instantly
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              Student: <code className="text-cyan-300 font-mono">alex.dev@college.edu</code> (Pass: <code className="text-cyan-300 font-mono">StudentPass123!</code>) •
              Admin: <code className="text-purple-300 font-mono">admin@codearena.dev</code> (Pass: <code className="text-purple-300 font-mono">AdminPass123!</code>)
            </p>
          </div>

          <button
            onClick={() => onNavigate('/login')}
            className="px-5 py-2.5 rounded-xl font-semibold text-xs bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 shrink-0 transition-colors"
          >
            Go to Login Page
          </button>
        </div>
      </section>
    </div>
  );
};
