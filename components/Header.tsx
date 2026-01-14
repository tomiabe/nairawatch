import React from 'react';
import { RefreshCw, TrendingUp, Moon, Sun } from 'lucide-react';

interface HeaderProps {
  lastUpdated: Date;
  onRefresh: () => void;
  isLoading: boolean;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({ lastUpdated, onRefresh, isLoading, isDarkMode, toggleTheme }) => {
  return (
    <header className="sticky top-0 z-50 bg-slate-900/95 dark:bg-slate-900/95 backdrop-blur-md text-white shadow-lg border-b border-slate-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="bg-emerald-500 p-2 rounded-lg shadow-emerald-500/20 shadow-md">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">NairaWatch</h1>
              <p className="text-xs text-slate-400 hidden sm:block">Parallel Market Monitor</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs text-slate-400">Last Updated</p>
              <p className="text-sm font-medium font-mono text-emerald-400">
                {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            
            {/* Theme Toggle */}
            <button
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-slate-800 transition-all duration-200 border border-slate-700 hover:border-slate-500 text-slate-400 hover:text-white"
                aria-label={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
                {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {/* Refresh Button */}
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className={`p-2 rounded-full hover:bg-slate-800 transition-all duration-200 border border-slate-700 ${
                isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:border-emerald-500/50 hover:text-emerald-400'
              }`}
              aria-label="Refresh rates"
            >
              <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};