
import React from 'react';

interface ProgressBarProps {
  progress: number; // Value between 0 and 100
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
  const cappedProgress = Math.max(0, Math.min(100, progress));

  return (
    <div className="w-full bg-slate-700 rounded-full h-2.5 mt-4 overflow-hidden shadow-inner border border-slate-600">
      <div
        className="bg-gradient-to-r from-purple-500 to-pink-500 h-2.5 rounded-full transition-all duration-300 ease-out"
        style={{ width: `${cappedProgress}%` }}
        role="progressbar"
        aria-valuenow={cappedProgress}
        aria-valuemin={0}
        aria-valuemax={100}
      ></div>
    </div>
  );
};
    