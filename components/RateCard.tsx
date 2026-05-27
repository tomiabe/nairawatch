import React from 'react';
import { ArrowUpRight, ArrowDownLeft, Building2, Star, Store } from 'lucide-react';
import { CurrencyRate } from '../types';
import { EMOJI_STYLE } from './emojiStyles';

interface RateCardProps {
  rate: CurrencyRate;
  onOpenTrend?: (rate: CurrencyRate) => void;
  isWatched?: boolean;
  onToggleWatch?: (code: string) => void;
}

export const RateCard: React.FC<RateCardProps> = ({ rate, onOpenTrend, isWatched = false, onToggleWatch }) => {
  return (
    <button
      type="button"
      onClick={() => onOpenTrend?.(rate)}
      className="w-full text-left bg-white dark:bg-slate-900 rounded-xl shadow-md border border-slate-200 dark:border-slate-800 p-5 hover:shadow-lg transition-all duration-300 group"
      aria-label={`Open ${rate.code} trend`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-3">
          <span
            className="grid place-items-center w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-800 shadow-sm"
            style={EMOJI_STYLE}
          >
            <span className="block text-4xl leading-none translate-y-[1px]">{rate.flag}</span>
          </span>
          <div>
            <h2 className="font-bold text-slate-900 dark:text-white text-lg">{rate.code}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{rate.name}</p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleWatch?.(rate.code);
            }}
            className={`p-2 rounded-lg border transition-colors ${
              isWatched
                ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/40 text-amber-700 dark:text-amber-300'
                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-300'
            }`}
            aria-label={isWatched ? `Unwatch ${rate.code}` : `Watch ${rate.code}`}
            title={isWatched ? 'Remove from watchlist' : 'Add to watchlist'}
          >
            <Star className={`w-4 h-4 ${isWatched ? 'fill-current' : ''}`} />
          </button>

          <div className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-1 rounded text-xs font-bold font-mono">
            {rate.code}/NGN
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
