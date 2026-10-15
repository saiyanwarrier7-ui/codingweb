import React from 'react';
import { Terminal, Cpu, Code, Globe, Coffee, FileCode } from 'lucide-react';

interface Props {
  language: string;
  className?: string;
  showName?: boolean;
}

export const LanguageIcon: React.FC<Props> = ({ language, className = 'w-4 h-4', showName = false }) => {
  const lang = language ? language.toLowerCase() : 'python';

  let Icon = FileCode;
  let label = language;
  let color = 'text-slate-400';

  if (lang === 'python' || lang === 'py') {
    Icon = Terminal;
    label = 'Python';
    color = 'text-emerald-400';
  } else if (lang === 'cpp' || lang === 'c++') {
    Icon = Cpu;
    label = 'C++';
    color = 'text-blue-400';
  } else if (lang === 'c') {
    Icon = Code;
    label = 'C';
    color = 'text-cyan-400';
  } else if (lang === 'html' || lang === 'web') {
    Icon = Globe;
    label = 'HTML';
    color = 'text-amber-400';
  } else if (lang === 'java') {
    Icon = Coffee;
    label = 'Java';
    color = 'text-orange-400';
  }

  return (
    <span className="inline-flex items-center gap-1.5 font-mono">
      <Icon className={`${className} ${color}`} />
      {showName && <span>{label}</span>}
    </span>
  );
};
