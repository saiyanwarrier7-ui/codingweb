import React from 'react';
import { ProblemDifficulty } from '../types';

interface Props {
  difficulty: ProblemDifficulty | string;
  size?: 'sm' | 'md' | 'lg';
}

export const DifficultyBadge: React.FC<Props> = ({ difficulty, size = 'sm' }) => {
  const diff = difficulty ? difficulty.toLowerCase() : 'easy';

  let colorClasses = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
  if (diff === 'medium') {
    colorClasses = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
  } else if (diff === 'hard') {
    colorClasses = 'bg-rose-500/10 text-rose-400 border-rose-500/30';
  }

  const sizeClasses = {
    sm: 'text-xs px-2.5 py-0.5',
    md: 'text-sm px-3 py-1 font-medium',
    lg: 'text-base px-4 py-1.5 font-semibold',
  }[size];

  return (
    <span
      className={`inline-flex items-center font-mono rounded-full border ${colorClasses} ${sizeClasses}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
          diff === 'easy'
            ? 'bg-emerald-400'
            : diff === 'medium'
            ? 'bg-amber-400'
            : 'bg-rose-400'
        }`}
      />
      {difficulty}
    </span>
  );
};
