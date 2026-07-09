import React from 'react';
import { RefreshCw, Share2, TrendingUp, Moon, Sun } from 'lucide-react';

interface HeaderProps {
  lastUpdated: Date;
  onRefresh: () => void;
  onShare: () => void;
  isLoading: boolean;
  isDarkMode: boolean;
  toggleTheme: () => void;
  refreshesRemaining: number;
}

export const Header: React.FC<HeaderProps> = ({
  lastUpdated,
  onRefresh,
  onShare,
  isLoading,
  isDarkMode,
  toggleTheme,
  refreshesRemaining,
}) => {
  return (
    <header className="sticky top-0 z-50 bg-slate-900/95 dark:bg-slate-900/95 backdrop-blur-md text-white shadow-lg border-b border-slate-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="bg-emerald-500 p-2 rounded-lg shadow-emerald-500/20 shadow-md">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="text-xl font-bold tracking-tight text-white">NairaWatch</div>
              <p className="text-xs text-slate-400 hidden sm:block">Parallel Market Monitor</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs text-slate-400">Last Updated</p>
              <p className="text-sm font-medium font-mono text-emerald-400">
                {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
              </p>
            </div>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-slate-800 transition-all duration-200 border border-slate-700 hover:border-emerald-500/50 text-slate-400 hover:text-emerald-400"
              aria-label={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            <button
              onClick={onShare}
              className="p-2 rounded-full hover:bg-slate-800 transition-all duration-200 border border-slate-700 hover:border-emerald-500/50 text-slate-400 hover:text-emerald-400"
              aria-label="Share rate card"
              title="Share rate card"
            >
              <Share2 className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-1.5">
              <button
                onClick={onRefresh}
                disabled={isLoading || refreshesRemaining <= 0}
                className={`p-2 rounded-full transition-all duration-200 border border-slate-700 ${
                  isLoading || refreshesRemaining <= 0
                    ? 'opacity-40 cursor-not-allowed'
                    : 'hover:bg-slate-800 hover:border-emerald-500/50 hover:text-emerald-400'
                }`}
                aria-label="Refresh rates"
                title={
                  refreshesRemaining <= 0
                    ? 'Refresh limit reached for this hour'
                    : `${refreshesRemaining} manual refresh${refreshesRemaining !== 1 ? 'es' : ''} remaining`
                }
              >
                <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
              <span className="text-[10px] tabular-nums text-slate-500 leading-none">
                {refreshesRemaining}/hr
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};