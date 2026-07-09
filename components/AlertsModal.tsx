import React, { useEffect, useState } from 'react';
import { Bell, Trash2, X } from 'lucide-react';
import { CurrencyRate, PriceAlert } from '../types';
import { EMOJI_STYLE } from './emojiStyles';

interface AlertsModalProps {
  rate: CurrencyRate;
  alerts: PriceAlert[];
  onAdd: (alert: Omit<PriceAlert, 'id' | 'fired'>) => void;
  onRemove: (id: string) => void;
  onClose: () => void;
}

export const AlertsModal: React.FC<AlertsModalProps> = ({ rate, alerts, onAdd, onRemove, onClose }) => {
  const [direction, setDirection] = useState<'above' | 'below'>('above');
  const [threshold, setThreshold] = useState('');
  const [permDenied, setPermDenied] = useState(false);

  const existing = alerts.filter((a) => a.code === rate.code);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = parseFloat(threshold);
    if (!isFinite(value) || value <= 0) return;

    if ('Notification' in window && Notification.permission === 'default') {
      const result = await Notification.requestPermission();
      if (result === 'denied') {
        setPermDenied(true);
      }
    } else if ('Notification' in window && Notification.permission === 'denied') {
      setPermDenied(true);
    }

    onAdd({ code: rate.code, direction, threshold: value });
    setThreshold('');
  };

  return (
    <div className="fixed inset-0 z-[70] bg-slate-950/60 backdrop-blur-sm p-4 flex items-center justify-center">
      <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-amber-500" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              <span style={EMOJI_STYLE}>{rate.flag}</span> {rate.code} Alerts
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="bg-slate-50 dark:bg-slate-800 rounded-lg px-4 py-2.5 flex justify-between items-center">
            <span className="text-sm text-slate-500 dark:text-slate-400">Current sell</span>
            <span className="text-sm font-bold font-mono text-slate-900 dark:text-white">
              ₦{rate.sell.toLocaleString()}
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex gap-2">
              <select
                value={direction}
                onChange={(e) => setDirection(e.target.value as 'above' | 'below')}
                className="flex-shrink-0 text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                <option value="above">Above ₦</option>
                <option value="below">Below ₦</option>
              </select>
              <input
                type="number"
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
                placeholder={rate.sell.toLocaleString()}
                min="0"
                step="any"
                className="flex-1 min-w-0 text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
            <button
              type="submit"
              disabled={!threshold || parseFloat(threshold) <= 0}
              className="w-full py-2 rounded-lg bg-amber-500 text-white text-sm font-semibold hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Set Alert
            </button>
          </form>

          {permDenied && (
            <p className="text-xs text-red-500 dark:text-red-400">
              Browser notifications are blocked. Enable them in your browser settings to receive alerts.
            </p>
          )}

          {existing.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                Active alerts
              </p>
              {existing.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-center justify-between bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 rounded-lg px-3 py-2"
                >
                  <span className="text-sm text-slate-700 dark:text-slate-200">
                    Sell {alert.direction}{' '}
                    <span className="font-mono font-bold">₦{alert.threshold.toLocaleString()}</span>
                    {alert.fired && (
                      <span className="ml-2 text-[10px] uppercase tracking-wide text-amber-600 dark:text-amber-400 font-semibold">
                        triggered
                      </span>
                    )}
                  </span>
                  <button
                    onClick={() => onRemove(alert.id)}
                    className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                    aria-label="Remove alert"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <p className="text-xs text-slate-400 dark:text-slate-500">
            Alerts fire on the next rate refresh when your threshold is crossed. The tab must be open to receive them.
          </p>
        </div>
      </div>
    </div>
  );
};
