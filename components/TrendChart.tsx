import React from 'react';
import { TrendPoint, TrendPeriod } from '../types';

interface TrendChartProps {
  points: TrendPoint[];
  period: TrendPeriod;
}

const formatXLabel = (iso: string, period: TrendPeriod) => {
  const d = new Date(iso);
  return period === '24h'
    ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : d.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

export const TrendChart: React.FC<TrendChartProps> = ({ points, period }) => {
  if (points.length < 2) {
    return <div className="text-sm text-slate-500 dark:text-slate-400">Not enough trend data.</div>;
  }

  const width = 760;
  const height = 260;
  const pad = 28;

  const allValues = points.flatMap((p) => [p.buy, p.sell]);
  const min = Math.min(...allValues);
  const max = Math.max(...allValues);
  const range = Math.max(1, max - min);

  const x = (i: number) => pad + (i / (points.length - 1)) * (width - 2 * pad);
  const y = (val: number) => height - pad - ((val - min) / range) * (height - 2 * pad);

  const path = (key: 'buy' | 'sell') =>
    points
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${x(i).toFixed(2)} ${y(p[key]).toFixed(2)}`)
      .join(' ');

  const first = points[0];
  const mid = points[Math.floor(points.length / 2)];
  const last = points[points.length - 1];

  return (
    <div className="space-y-3">
      <div className="w-full overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full min-w-[560px]">
          {[0, 1, 2, 3, 4].map((line) => {
            const yy = pad + (line / 4) * (height - 2 * pad);
            return (
              <line
                key={line}
                x1={pad}
                y1={yy}
                x2={width - pad}
                y2={yy}
                stroke="currentColor"
                className="text-slate-200 dark:text-slate-700"
                strokeDasharray="4 4"
              />
            );
          })}

          <path d={path('buy')} fill="none" stroke="#ef4444" strokeWidth="2.5" />
          <path d={path('sell')} fill="none" stroke="#10b981" strokeWidth="2.5" />
        </svg>
      </div>

      <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
        <span>{formatXLabel(first.timestamp, period)}</span>
        <span>{formatXLabel(mid.timestamp, period)}</span>
        <span>{formatXLabel(last.timestamp, period)}</span>
      </div>

      <div className="flex gap-4 text-xs font-medium">
        <span className="inline-flex items-center gap-2 text-red-600 dark:text-red-400">
          <span className="w-2 h-2 rounded-full bg-red-500" />
          Buy
        </span>
        <span className="inline-flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          Sell
        </span>
      </div>
    </div>
  );
};
