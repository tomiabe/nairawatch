import React from 'react';
import { ArrowUpRight, ArrowDownLeft, Building2, Store } from 'lucide-react';
import { CurrencyRate } from '../types';

interface RateCardProps {
  rate: CurrencyRate;
}

const formatPrice = (price: number) => {
  const parts = price.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).split('.');

  return (
    <span className="flex items-baseline">
      <span className="text-lg font-bold">₦{parts[0]}</span>
      {parts[1] && (
        <span className="text-xs font-semibold opacity-80">.{parts[1]}</span>
      )}
    </span>
  );
};

export const RateCard: React.FC<RateCardProps> = ({ rate }) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-md border border-slate-200 dark:border-slate-800 p-5 hover:shadow-lg transition-all duration-300 group">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-3">
          <span className="text-4xl shadow-sm rounded-full bg-slate-50 dark:bg-slate-800 p-1">{rate.flag}</span>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-lg">{rate.code}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{rate.name}</p>
          </div>
        </div>
        <div className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-1 rounded text-xs font-bold font-mono">
          {rate.code}/NGN
        </div>
      </div>

      <div className="space-y-4">
        {/* Parallel Market */}
        <div className="bg-slate-50 dark:bg-slate-950/50 rounded-lg p-3 border border-slate-100 dark:border-slate-800 group-hover:border-emerald-100 dark:group-hover:border-emerald-900/50 transition-colors">
          <div className="flex items-center space-x-2 mb-2">
            <Store className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Black Market</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center space-x-1 mb-1">
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium uppercase tracking-tight">Buy Rate</p>
              </div>
              <div className="flex items-center space-x-1 overflow-hidden">
                <div className="text-slate-900 dark:text-slate-100 truncate">
                  {formatPrice(rate.buy)}
                </div>
                <ArrowDownLeft className="h-4 w-4 text-red-500 dark:text-red-400 flex-shrink-0" />
              </div>
            </div>
            <div className="text-right border-l border-slate-200 dark:border-slate-800 pl-4">
              <div className="flex items-center justify-end space-x-1 mb-1">
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium uppercase tracking-tight">Sell Rate</p>
              </div>
              <div className="flex items-center justify-end space-x-1 overflow-hidden text-right">
                <div className="text-emerald-600 dark:text-emerald-400 truncate">
                  {formatPrice(rate.sell)}
                </div>
                <ArrowUpRight className="h-4 w-4 text-emerald-500 dark:text-emerald-400 flex-shrink-0" />
              </div>
            </div>
          </div>
        </div>

        {/* Official Rate - Only show if available and different significantly */}
        {rate.official && (
          <div className="flex justify-between items-center px-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center space-x-2">
              <Building2 className="w-3 h-3 text-blue-500 dark:text-blue-400" />
              <span className="text-xs text-slate-500 dark:text-slate-400">Official CBN</span>
            </div>
            <span className="text-xs font-mono font-medium text-slate-700 dark:text-slate-300">₦{rate.official.toLocaleString()}</span>
          </div>
        )}
      </div>
    </div>
  );
};