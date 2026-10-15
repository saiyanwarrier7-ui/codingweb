import React from 'react';
import { Terminal, Shield, Github, Heart, Database, CheckCircle2 } from 'lucide-react';

interface Props {
  onNavigate: (path: string) => void;
}

export const Footer: React.FC<Props> = ({ onNavigate }) => {
  return (
    <footer className="w-full bg-slate-950 border-t border-slate-800/80 text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <div
              onClick={() => onNavigate('/')}
              className="flex items-center gap-2.5 cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white">
                <Terminal className="w-4 h-4 text-slate-950" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">CodeArena</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Learn to Code. Practice Daily. Build Your Future. The modern interactive coding practice platform designed for students and future software engineers.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Execution Sandbox Online
            </div>
          </div>

          {/* Languages Col */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">
              Supported Languages
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('/languages/python')}
                  className="hover:text-cyan-400 transition-colors"
                >
                  Python Track (Data Structures & OOP)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/languages/cpp')}
                  className="hover:text-cyan-400 transition-colors"
                >
                  C++ Track (STL & Competitive Coding)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/languages/c')}
                  className="hover:text-cyan-400 transition-colors"
                >
                  C Track (Pointers & Memory Allocation)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/languages/java')}
                  className="hover:text-cyan-400 transition-colors"
                >
                  Java Track (Classes & Collections)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/languages/html')}
                  className="hover:text-cyan-400 transition-colors"
                >
                  HTML Track (Live Sandboxed Preview)
                </button>
              </li>
            </ul>
          </div>

          {/* Platform Col */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">
              Platform & Features
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavigate('/problems')} className="hover:text-cyan-400">
                  Problem Library
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/leaderboard')} className="hover:text-cyan-400">
                  Global Leaderboard
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/dashboard')} className="hover:text-cyan-400">
                  Student Dashboard
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/admin/login')} className="hover:text-purple-400">
                  Instructor / Admin Portal
                </button>
              </li>
            </ul>
          </div>

          {/* Architecture & Security Col */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">
              Security & Architecture
            </h4>
            <div className="space-y-2.5 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <Database className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>PostgreSQL / Supabase Schema & RLS</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Isolated Sandbox Subprocess Execution</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>Private Backend Test Evaluation</span>
              </div>
              <p className="text-[11px] text-slate-500 pt-1 leading-relaxed">
                Passwords hashed with bcrypt. Hidden test cases guarded on backend.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} CodeArena. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
            <span>•</span>
            <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
            <span>•</span>
            <span className="hover:text-slate-400 cursor-pointer">Honor Code</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
