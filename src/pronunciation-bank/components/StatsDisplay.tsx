import React from 'react';
import { WordStats } from '../../types';

interface StatsDisplayProps {
  stats: WordStats;
}

const StatsDisplay: React.FC<StatsDisplayProps> = ({ stats }) => {
  return (
    <div className="flex items-center gap-8">
      <div className="text-center">
        <div className="text-3xl font-bold text-theme-error">{stats.learning}</div>
        <div className="text-theme-muted text-sm mt-1">Learning</div>
      </div>
      <div className="text-center">
        <div className="text-3xl font-bold text-theme-warning">{stats.reviewing}</div>
        <div className="text-theme-muted text-sm mt-1">Reviewing</div>
      </div>
      <div className="text-center">
        <div className="text-3xl font-bold text-theme-success">{stats.mastered}</div>
        <div className="text-theme-muted text-sm mt-1">Mastered</div>
      </div>
    </div>
  );
};

export default StatsDisplay;
