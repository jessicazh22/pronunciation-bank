import React from 'react';
import { Music, RefreshCw } from 'lucide-react';

interface HeaderActionsProps {
  onFetchAudio: () => void;
  onRefreshAll: () => void;
  isLoading: boolean;
  hasWords: boolean;
}

const HeaderActions: React.FC<HeaderActionsProps> = ({
  onFetchAudio,
  onRefreshAll,
  isLoading,
  hasWords,
}) => {
  if (!hasWords) return null;

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={onFetchAudio}
        disabled={isLoading}
        className="flex items-center gap-2 px-4 py-2.5 text-sm text-white bg-teal-600 rounded-xl hover:bg-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm font-medium"
      >
        <Music className="w-4 h-4" />
        <span>Fetch Audio</span>
      </button>
      <button
        onClick={onRefreshAll}
        disabled={isLoading}
        className="flex items-center gap-2 px-4 py-2.5 text-sm text-warm-700 border border-warm-300 rounded-xl hover:bg-warm-50 hover:border-warm-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
      >
        {isLoading ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Refreshing...</span>
          </>
        ) : (
          <>
            <RefreshCw className="w-4 h-4" />
            <span>Refresh All</span>
          </>
        )}
      </button>
    </div>
  );
};

export default HeaderActions;
