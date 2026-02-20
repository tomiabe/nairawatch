import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { CurrencyRate, TrendPeriod, TrendPoint } from '../types';
import { TrendChart } from './TrendChart';

interface TrendModalProps {
  rate: CurrencyRate;
  points: TrendPoint[];
  period: TrendPeriod;
  onPeriodChange: (period: TrendPeriod) => void;
  onClose: () => void;
}

export const TrendModal: React.FC<TrendModalProps> = ({
  rate,
  points,
  period,
  onPeriodChange,
  onClose,
}) => {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  const first = points[0];
  const last = points[points.length - 1];
  const delta = first && last ? last.sell - first.sell : 0;
  const pct = first && first.sell > 0 ? (delta / first.sell) * 100 : 0;
  const high = points.length ? Math.max(...points.map((p) => p.sell)) : rate.sell;
  const low = points.length ? Math.min(...points.map((p) => p.buy)) : rate.buy;

  return (
    <div className="fixed inset-0 z-[60] bg-slate-950/60 backdrop-blur-sm p-4 sm:p-8 flex items-center justify-center">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-start gap-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              {rate.flag} {rate.code}/NGN Trend
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">{rate.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Close trend modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          <div className="flex gap-2">
            {(['24h', '7d'] as TrendPeriod[]).map((p) => (
              <button
                key={p}
                onClick={() => onPeriodChange(p)}
                className={`px-3 py-1.5 text-sm rounded-lg border ${
                  period === p
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Stat label="Current Sell" value={`₦${last?.sell.toLocaleString() || rate.sell.toLocaleString()}`} />
            <Stat label="Change" value={`${delta >= 0 ? '+' : ''}${delta.toFixed(2)} (${pct.toFixed(2)}%)`} />
            <Stat label="High" value={`₦${high.toLocaleString()}`} />
            <Stat label="Low" value={`₦${low.toLocaleString()}`} />
          </div>

          <TrendChart points={points} period={period} />
        </div>
      </div>
    </div>
  );
};

const Stat: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl p-3">
    <p className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
    <p className="text-sm font-semibold text-slate-900 dark:text-white mt-1">{value}</p>
  </div>
);
