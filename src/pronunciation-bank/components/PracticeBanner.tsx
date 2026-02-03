import React from 'react';
import { PlayCircle } from 'lucide-react';

interface PracticeBannerProps {
  eligibleWordsCount: number;
  sessionNumber: number;
  onStartPractice: () => void;
}

const PracticeBanner: React.FC<PracticeBannerProps> = ({
  eligibleWordsCount,
  sessionNumber,
  onStartPractice,
}) => {
  const wordsToShow = Math.min(eligibleWordsCount, 15);
  const hasWords = eligibleWordsCount > 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-theme-card border-t border-theme shadow-lg">
      <div className="max-w-7xl mx-auto px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-theme-primary-light rounded-xl flex items-center justify-center">
            <PlayCircle className="w-6 h-6 text-theme-primary" />
          </div>
          <div>
            <div className="text-theme font-semibold text-lg">
              {hasWords ? 'Daily Practice Ready' : 'All Caught Up!'}
            </div>
            <div className="text-theme-muted text-sm">
              {hasWords
                ? `${wordsToShow} word${wordsToShow !== 1 ? 's' : ''} ready • Session #${sessionNumber}`
                : 'Add more words to continue practicing'}
            </div>
          </div>
        </div>
        <button
          onClick={onStartPractice}
          disabled={!hasWords}
          className="px-6 py-3 bg-theme-primary text-white hover:bg-theme-primary-hover disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all flex items-center gap-2 font-semibold shadow-md hover:shadow-lg"
        >
          <PlayCircle className="w-5 h-5" />
          Start Practice
        </button>
      </div>
    </div>
  );
};

export default PracticeBanner;
