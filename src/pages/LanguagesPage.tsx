import React, { useEffect, useState } from 'react';
import { BookOpen, ChevronRight, Terminal, Cpu, Code, Globe, Coffee, Sparkles } from 'lucide-react';
import { LanguageTrack } from '../types';
import { LanguageIcon } from '../components/LanguageIcon';

interface Props {
  onNavigate: (path: string) => void;
}

export const LanguagesPage: React.FC<Props> = ({ onNavigate }) => {
  const [languages, setLanguages] = useState<LanguageTrack[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLangs() {
      try {
        const res = await fetch('/api/languages');
        if (res.ok) {
          setLanguages(await res.json());
        }
      } catch (err) {
        console.error('Error fetching languages:', err);
      } finally {
        setLoading(false);
      }
    }
    loadLangs();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-mono text-cyan-400 mb-3">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Curated Developer Tracks</span>
        </div>
        <h1 className="text-4xl font-extrabold text-white tracking-tight">
          Supported Programming Languages
        </h1>
        <p className="text-base text-slate-400 mt-2 max-w-3xl leading-relaxed">
          Master the fundamentals, data structures, and advanced paradigms of Python, C++, C, HTML, and Java with structured roadmaps and real-time execution sandboxes.
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center font-mono text-slate-400 flex flex-col items-center justify-center gap-3">
          <Sparkles className="w-6 h-6 text-cyan-400 animate-spin" />
          <span>Loading programming tracks...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {languages.map((lang) => (
            <div
              key={lang.id}
              onClick={() => onNavigate(`/languages/${lang.slug}`)}
              className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-cyan-500/40 hover:bg-slate-900 transition-all cursor-pointer group flex flex-col justify-between shadow-xl"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <LanguageIcon language={lang.slug} className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-mono text-slate-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                    {lang.problemCount || 3} exercises
                  </span>
                </div>

                <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">
                  {lang.name}
                </h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed line-clamp-3">
                  {lang.description}
                </p>

                {/* Difficulty count bar */}
                {lang.difficultyCounts && (
                  <div className="mt-4 flex items-center gap-2 text-xs font-mono">
                    <span className="text-emerald-400">{lang.difficultyCounts.easy} Easy</span>
                    <span className="text-slate-600">•</span>
                    <span className="text-amber-400">{lang.difficultyCounts.medium} Med</span>
                    <span className="text-slate-600">•</span>
                    <span className="text-rose-400">{lang.difficultyCounts.hard} Hard</span>
                  </div>
                )}

                {/* Topics preview */}
                <div className="mt-4 pt-4 border-t border-slate-800/80">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block mb-2">
                    Curriculum Highlights
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {lang.topics.slice(0, 3).map((topic, i) => (
                      <span
                        key={i}
                        className="text-[11px] px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800"
                      >
                        {topic.title}
                      </span>
                    ))}
                    {lang.topics.length > 3 && (
                      <span className="text-[11px] px-2 py-0.5 rounded bg-slate-950 text-slate-500">
                        +{lang.topics.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-cyan-400">
                <span>View Full Roadmap</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
