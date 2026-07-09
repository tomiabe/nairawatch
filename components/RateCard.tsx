import React from 'react';
import { ArrowUpRight, ArrowDownLeft, Bell, Building2, Star, Store } from 'lucide-react';
import { CurrencyRate } from '../types';
import { EMOJI_STYLE } from './emojiStyles';

interface RateCardProps {
  rate: CurrencyRate;
  onOpenTrend?: (rate: CurrencyRate) => void;
  isWatched?: boolean;
  onToggleWatch?: (code: string) => void;
  hasAlert?: boolean;
  onOpenAlert?: (code: string) => void;
}

export const RateCard: React.FC<RateCardProps> = ({
  rate,
  onOpenTrend,
  isWatched = false,
  onToggleWatch,
  hasAlert = false,
  onOpenAlert,
}) => {
  return (
    <button
      type="button"
      onClick={() => onOpenTrend?.(rate)}
      className="w-full text-left bg-white dark:bg-slate-900 rounded-xl shadow-md border border-slate-200 dark:border-slate-800 p-5 hover:shadow-lg transition-all duration-300 group"
      aria-label={`Open ${rate.code} trend`}
    >
      <div className="flex justify-between items-start mb-4">
        {/* Left: flag + code + name get the full remaining width */}
        <div className="flex items-center gap-3 min-w-0 pr-3">
          <span
            className="grid place-items-center w-12 h-12 md:w-11 md:h-11 rounded-full bg-slate-50 dark:bg-slate-800 shadow-sm flex-shrink-0"
            style={EMOJI_STYLE}
          >
            <span className="block text-4xl md:text-3xl leading-none translate-y-[1px]">{rate.flag}</span>
          </span>
          <div className="min-w-0">
            <h2 className="font-bold text-slate-900 dark:text-white text-lg">{rate.code}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">{rate.name}</p>
          </div>
        </div>

        {/* Right: badge on top, action icons below — stacked vertically */}
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <div className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-1 rounded text-xs font-bold font-mono">
            {rate.code}/NGN
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggleWatch?.(rate.code);
              }}
              className={`p-1.5 rounded-lg border transition-colors ${
                isWatched
                  ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/40 text-amber-700 dark:text-amber-300'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-300'
              }`}
              aria-label={isWatched ? `Unwatch ${rate.code}` : `Watch ${rate.code}`}
              title={isWatched ? 'Remove from watchlist' : 'Add to watchlist'}
            >
              <Star className={`w-3.5 h-3.5 ${isWatched ? 'fill-current' : ''}`} />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onOpenAlert?.(rate.code);
              }}
              className={`p-1.5 rounded-lg border transition-colors ${
                hasAlert
                  ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/40 text-emerald-600 dark:text-emerald-400'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400'
              }`}
              aria-label={`Set alert for ${rate.code}`}
              title="Set price alert"
            >
              <Bell className={`w-3.5 h-3.5 ${hasAlert ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-slate-50 dark:bg-slate-950/50 rounded-lg p-3 border border-slate-100 dark:border-slate-800 group-hover:border-emerald-100 dark:group-hover:border-emerald-900/50 transition-colors">
          <div className="flex items-center space-x-2 mb-2">
            <Store className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Black Market</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center space-x-1 mb-1">
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium uppercase tracking-tight">Buy Rate</p>
                <ArrowDownLeft className="h-3 w-3 text-red-500 dark:text-red-400 flex-shrink-0" />
              </div>
              <div className="text-slate-900 dark:text-slate-100">
                <span className="text-lg font-bold currency-amount">₦{rate.buy.toLocaleString()}</span>
              </div>
            </div>
            <div className="text-right border-l border-slate-200 dark:border-slate-800 pl-4">
              <div className="flex items-center justify-end space-x-1 mb-1">
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium uppercase tracking-tight">Sell Rate</p>
                <ArrowUpRight className="h-3 w-3 text-emerald-500 dark:text-emerald-400 flex-shrink-0" />
              </div>
              <div className="text-emerald-600 dark:text-emerald-400">
                <span className="text-lg font-bold currency-amount">₦{rate.sell.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {rate.official && (
          <div className="flex justify-between items-center px-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center space-x-2">
              <Building2 className="w-3 h-3 text-blue-500 dark:text-blue-400" />
              <span className="text-xs text-slate-500 dark:text-slate-400">Official CBN</span>
            </div>
            <span className="text-xs font-mono font-medium text-slate-700 dark:text-slate-300 currency-amount">₦{rate.official.toLocaleString()}</span>
          </div>
        )}
      </div>
    </button>
  );
};
