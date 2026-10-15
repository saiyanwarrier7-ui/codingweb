import React, { useEffect, useState } from 'react';
import {
  ChevronLeft,
  BookOpen,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Layers,
  GraduationCap,
  Play,
} from 'lucide-react';
import { LanguageTrack, CodingProblem } from '../types';
import { LanguageIcon } from '../components/LanguageIcon';
import { DifficultyBadge } from '../components/DifficultyBadge';
import { useAuth } from '../context/AuthContext';

interface Props {
  slug: string;
  onNavigate: (path: string) => void;
}

export const LanguageDetailPage: React.FC<Props> = ({ slug, onNavigate }) => {
  const { user } = useAuth();
  const [data, setData] = useState<{
    language: LanguageTrack;
    problems: CodingProblem[];
    completionStats: { total: number; solved: number; percentage: number };
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTrack() {
      try {
        setLoading(true);
        const res = await fetch(`/api/languages/${slug}`);
        if (!res.ok) {
          onNavigate('/languages');
          return;
        }
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error('Error fetching language detail:', err);
      } finally {
        setLoading(false);
      }
    }
    loadTrack();
  }, [slug, user]);

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center font-mono text-slate-400 gap-3">
        <Sparkles className="w-8 h-8 text-cyan-400 animate-spin" />
        <p className="text-sm">Loading Learning Roadmap...</p>
      </div>
    );
  }

  const { language, problems, completionStats } = data;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      {/* Back button */}
      <button
        onClick={() => onNavigate('/languages')}
        className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 transition-colors mb-6"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>All Languages</span>
      </button>

      {/* Header Card */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-blue-950/40 border border-slate-800 shadow-2xl mb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-5">
            <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center shrink-0 shadow-lg">
              <LanguageIcon language={language.slug} className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">
                  Learning Track
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {language.execution_language_id}
                </span>
              </div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">
                {language.name} Roadmap & Practice
              </h1>
              <p className="text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
                {language.description}
              </p>
            </div>
          </div>

          {/* Student Progress Card */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 min-w-[240px]">
            <div className="flex items-center justify-between text-xs font-mono mb-2">
              <span className="text-slate-400">Completion</span>
              <span className="text-cyan-400 font-bold">{completionStats.percentage}%</span>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-2">
              <div
                className="bg-gradient-to-r from-cyan-400 to-blue-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${completionStats.percentage}%` }}
              />
            </div>
            <div className="text-[11px] text-slate-400 font-mono text-center">
              {completionStats.solved} of {completionStats.total} problems completed
            </div>
          </div>
        </div>
      </div>

      {/* Curriculum & Topic Roadmap Modules */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <GraduationCap className="w-6 h-6 text-cyan-400" />
          <span>Curriculum Roadmap</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {language.topics.map((topic, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-cyan-400 font-bold">Module {idx + 1}</span>
                <DifficultyBadge difficulty={topic.difficulty} size="sm" />
              </div>
              <h3 className="text-base font-bold text-slate-100">{topic.title}</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                {topic.description}
              </p>

              <ul className="mt-4 pt-3 border-t border-slate-800/80 space-y-1.5 text-xs text-slate-300">
                {topic.items.map((item, itemIdx) => (
                  <li key={itemIdx} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Practice Problems in this Language */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-purple-400" />
          <span>Practice Problems ({problems.length})</span>
        </h2>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl divide-y divide-slate-800/60">
          {problems.map((prob) => (
            <div
              key={prob.id}
              onClick={() => onNavigate(`/problems/${prob.id}`)}
              className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-800/40 cursor-pointer transition-colors group"
            >
              <div className="flex items-start sm:items-center gap-3.5">
                {prob.is_solved ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5 sm:mt-0" />
                ) : (
                  <span className="w-3 h-3 rounded-full bg-slate-700 block shrink-0 mt-1 sm:mt-0 group-hover:bg-cyan-500/50" />
                )}
                <div>
                  <h4 className="text-base font-bold text-white group-hover:text-cyan-400 transition-colors">
                    {prob.title}
                  </h4>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <DifficultyBadge difficulty={prob.difficulty} size="sm" />
                    {prob.topic_tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-400"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-center">
                <button className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-cyan-400 transition-all flex items-center gap-1.5 shadow-sm">
                  <span>Solve in {language.name}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
