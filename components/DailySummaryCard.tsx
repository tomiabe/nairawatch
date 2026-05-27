import React from 'react';
import { Sparkles } from 'lucide-react';

export type DailySummaryItem = {
  key: string;
  label: string;
  value: string;
  tone?: 'up' | 'down' | 'neutral';
};

type DailySummaryCardProps = {
  title?: string;
  items: DailySummaryItem[];
  isReady: boolean;
};

export const DailySummaryCard: React.FC<DailySummaryCardProps> = ({
  title = 'Today in the Naira Market',
  items,
  isReady,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
      <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-emerald-500" />
        {title}
      </h3>

      {!isReady ? (
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Building your summary… check back after a couple refreshes.
        </p>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => {
            const tone =
              item.tone === 'up'
                ? 'text-emerald-600 dark:text-emerald-400'
                : item.tone === 'down'
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-slate-700 dark:text-slate-200';

            return (
              <li key={item.key} className="flex items-baseline gap-3 text-sm">
                <span className="min-w-0 text-slate-700 dark:text-slate-200">{item.label}</span>
                <span className="flex-1 border-b border-dotted border-slate-200 dark:border-slate-700/60" />
                <span className={`tabular-nums font-semibold ${tone}`}>{item.value}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

