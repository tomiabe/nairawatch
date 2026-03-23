import React, { useEffect, useMemo, useState } from 'react';
import { Header } from './components/Header';
import { Converter } from './components/Converter';
import { RateCard } from './components/RateCard';
import { TrendModal } from './components/TrendModal';
import { fetchLatestRates } from './services/geminiService';
import { buildMockTrend } from './services/trendService';
import { CurrencyRate, TrendPeriod, TrendPoint } from './types';
import { INITIAL_RATES } from './constants';
import { ExternalLink, Info, TrendingDown, TrendingUp, WifiOff } from 'lucide-react';

type RateSnapshot = { ts: number; sell: number };

const HISTORY_KEY = 'nairawatch_rate_history_v1';
const HISTORY_MAX_DAYS = 8;
const HISTORY_MIN_INTERVAL_MS = 2 * 60 * 1000;
const HISTORY_MAX_POINTS = 2000;

const REGION_LABELS = ['All', 'Americas', 'Europe', 'Africa', 'Asia', 'Middle East', 'Oceania'] as const;
type RegionLabel = typeof REGION_LABELS[number];

const REGION_MAP: Record<string, Exclude<RegionLabel, 'All'>> = {
  USD: 'Americas',
  CAD: 'Americas',
  MXN: 'Americas',
  BRL: 'Americas',
  ARS: 'Americas',
  CLP: 'Americas',
  COP: 'Americas',
  PEN: 'Americas',

  GBP: 'Europe',
  EUR: 'Europe',
  CHF: 'Europe',
  SEK: 'Europe',
  NOK: 'Europe',
  DKK: 'Europe',
  PLN: 'Europe',
  CZK: 'Europe',
  HUF: 'Europe',
  RON: 'Europe',
  BGN: 'Europe',
  UAH: 'Europe',
  RUB: 'Europe',
  ISK: 'Europe',
  TRY: 'Europe',

  ZAR: 'Africa',
  GHS: 'Africa',
  XOF: 'Africa',
  XAF: 'Africa',
  KES: 'Africa',
  UGX: 'Africa',
  TZS: 'Africa',
  EGP: 'Africa',
  MAD: 'Africa',
  TND: 'Africa',
  DZD: 'Africa',
  ETB: 'Africa',

  CNY: 'Asia',
  JPY: 'Asia',
  INR: 'Asia',
  PKR: 'Asia',
  BDT: 'Asia',
  LKR: 'Asia',
  NPR: 'Asia',
  IDR: 'Asia',
  THB: 'Asia',
  VND: 'Asia',
  PHP: 'Asia',
  HKD: 'Asia',
  TWD: 'Asia',
  SGD: 'Asia',
  KRW: 'Asia',
  MYR: 'Asia',

  AED: 'Middle East',
  SAR: 'Middle East',
  ILS: 'Middle East',
  QAR: 'Middle East',
  KWD: 'Middle East',
  BHD: 'Middle East',
  OMR: 'Middle East',

  AUD: 'Oceania',
  NZD: 'Oceania',
};

const loadRateHistory = (): Record<string, RateSnapshot[]> => {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, RateSnapshot[]>;
    return parsed || {};
  } catch {
    return {};
  }
};

const saveRateHistory = (history: Record<string, RateSnapshot[]>) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch {
    // Ignore quota or serialization errors
  }
};

const appendRateHistory = (
  prev: Record<string, RateSnapshot[]>,
  rates: CurrencyRate[],
): Record<string, RateSnapshot[]> => {
  const now = Date.now();
  const cutoff = now - HISTORY_MAX_DAYS * 24 * 60 * 60 * 1000;
  const next: Record<string, RateSnapshot[]> = { ...prev };

  rates.forEach((rate) => {
    if (!Number.isFinite(rate.sell) || rate.sell <= 0) return;
    const list = [...(next[rate.code] || [])];
    const last = list[list.length - 1];

    if (last && now - last.ts < HISTORY_MIN_INTERVAL_MS && Math.abs(last.sell - rate.sell) < 0.0001) {
      list[list.length - 1] = { ts: now, sell: rate.sell };
    } else {
      list.push({ ts: now, sell: rate.sell });
    }

    const pruned = list.filter((point) => point.ts >= cutoff);
    if (pruned.length > HISTORY_MAX_POINTS) {
      next[rate.code] = pruned.slice(pruned.length - HISTORY_MAX_POINTS);
    } else {
      next[rate.code] = pruned;
    }
  });

  return next;
};

export default function App() {
  const [rates, setRates] = useState<CurrencyRate[]>(INITIAL_RATES);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [sources, setSources] = useState<string[]>([]);

  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [trendPeriod, setTrendPeriod] = useState<TrendPeriod>('24h');
  const [trendSeriesByCode, setTrendSeriesByCode] = useState<Record<string, TrendPoint[]>>({});
  const [rateHistory, setRateHistory] = useState<Record<string, RateSnapshot[]>>({});
  const [regionFilter, setRegionFilter] = useState<RegionLabel>('All');

  useEffect(() => {
    const checkTimeForTheme = () => {
      const hour = new Date().getHours();
      const isDayTime = hour >= 7 && hour < 19;
      setIsDarkMode(!isDayTime);
    };

    checkTimeForTheme();
    const timer = setInterval(checkTimeForTheme, 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  const loadRates = async () => {
    setIsLoading(true);
    try {
      const data = await fetchLatestRates();
      setRates(data.rates);
      setSources(data.sources);

      if (data.isFallback) {
        setIsOffline(true);
        setErrorMsg(data.error || '');
      } else {
        setIsOffline(false);
        setErrorMsg('');
        setLastUpdated(new Date());
      }
    } catch (err) {
      console.error('Unexpected error in App:', err);
      setIsOffline(true);
      setErrorMsg('Unexpected system error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRates();
    const interval = setInterval(loadRates, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setRateHistory(loadRateHistory());
  }, []);

  useEffect(() => {
    if (rates.length === 0) return;
    setRateHistory((prev) => {
      const next = appendRateHistory(prev, rates);
      saveRateHistory(next);
      return next;
    });
  }, [rates]);

  useEffect(() => {
    const next: Record<string, TrendPoint[]> = {};
    rates.forEach((rate) => {
      next[rate.code] = buildMockTrend(rate, trendPeriod);
    });
    setTrendSeriesByCode(next);
  }, [rates, trendPeriod]);

  const selectedRate = selectedCode ? rates.find((r) => r.code === selectedCode) || null : null;
  const selectedTrend = selectedRate ? trendSeriesByCode[selectedRate.code] || [] : [];

  const filteredRates = useMemo(() => {
    if (regionFilter === 'All') return rates;
    return rates.filter((rate) => (REGION_MAP[rate.code] || 'Asia') === regionFilter);
  }, [rates, regionFilter]);

  const trendLeaders = useMemo(() => {
    const periodMs = trendPeriod === '7d' ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
    const items = rates.map((rate) => {
      const series = rateHistory[rate.code] || [];
      if (series.length < 2) return { code: rate.code, pct: 0 };

      const now = Date.now();
      const target = now - periodMs;
      let first = series[0];
      for (let i = series.length - 1; i >= 0; i -= 1) {
        if (series[i].ts <= target) {
          first = series[i];
          break;
        }
      }
      const last = series[series.length - 1];
      const pct = first.sell > 0 ? ((last.sell - first.sell) / first.sell) * 100 : 0;
      return { code: rate.code, pct };
    });

    const gainers = [...items].sort((a, b) => b.pct - a.pct).slice(0, 3);
    const decliners = [...items].sort((a, b) => a.pct - b.pct).slice(0, 3);
    return { gainers, decliners };
  }, [rates, rateHistory, trendPeriod]);

  const currencyNameByCode = useMemo(() => {
    return rates.reduce<Record<string, string>>((acc, rate) => {
      acc[rate.code] = rate.name;
      return acc;
    }, {});
  }, [rates]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-8 transition-colors duration-300">
      <Header
        lastUpdated={lastUpdated}
        onRefresh={loadRates}
        isLoading={isLoading}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <section className="max-w-3xl mx-auto">
          <Converter rates={rates} />
        </section>

        <section>
          <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-8 gap-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Current Market Rates</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Tap any card to view trend analytics.</p>
            </div>

            <div className="flex flex-col items-start md:items-end gap-2">
              {isOffline ? (
                <>
                  <span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-medium text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                    <WifiOff className="w-3 h-3 mr-2" />
                    Offline / Estimates
                  </span>
                  <p className="text-xs text-slate-500 dark:text-slate-500 font-medium md:text-right">
                    Live updates paused. Showing estimated rates.
                  </p>
                </>
              ) : (
                <>
                  <span className="inline-flex items-center rounded-full bg-emerald-100 dark:bg-emerald-900/30 px-3 py-1 text-xs font-medium text-emerald-800 dark:text-emerald-300 animate-pulse border border-emerald-200 dark:border-emerald-800/30">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span>
                    Live Updates
                  </span>
                  <p className="text-xs text-emerald-600 dark:text-emerald-500/70 font-medium md:text-right">
                    Live Parallel Market Estimates
                  </p>
                </>
              )}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                Top Gainers ({trendPeriod})
              </h3>
              <div className="space-y-2">
                {trendLeaders.gainers.map((item) => (
                  <div key={item.code} className="flex items-center gap-3 text-sm">
                    <div className="min-w-0">
                      <div className="font-medium text-slate-800 dark:text-slate-100">{item.code}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {currencyNameByCode[item.code] || item.code}
                      </div>
                    </div>
                    <span className="flex-1 border-b border-dotted border-slate-200 dark:border-slate-700/60" />
                    <span className="text-emerald-600 dark:text-emerald-400 tabular-nums">+{item.pct.toFixed(2)}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3 flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-red-500" />
                Top Decliners ({trendPeriod})
              </h3>
              <div className="space-y-2">
                {trendLeaders.decliners.map((item) => (
                  <div key={item.code} className="flex items-center gap-3 text-sm">
                    <div className="min-w-0">
                      <div className="font-medium text-slate-800 dark:text-slate-100">{item.code}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {currencyNameByCode[item.code] || item.code}
                      </div>
                    </div>
                    <span className="flex-1 border-b border-dotted border-slate-200 dark:border-slate-700/60" />
                    <span className="text-red-600 dark:text-red-400 tabular-nums">{item.pct.toFixed(2)}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {REGION_LABELS.map((label) => (
              <button
                key={label}
                type="button"
                onClick={() => setRegionFilter(label)}
                className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                  regionFilter === label
                    ? 'bg-emerald-500 text-white border-emerald-500'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-emerald-300/60 hover:text-emerald-600 dark:hover:text-emerald-400'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredRates.map((rate) => (
              <RateCard key={rate.code} rate={rate} onOpenTrend={() => setSelectedCode(rate.code)} />
            ))}
          </div>
        </section>

        {!!errorMsg && (
          <section className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-xl px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
            {errorMsg}
          </section>
        )}

        <footer className="border-t border-slate-200 dark:border-slate-800 pt-8 mt-8">
          <div className="bg-slate-900 dark:bg-slate-900/50 rounded-2xl p-6 md:p-8 text-slate-300 border border-transparent dark:border-slate-800">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-white font-bold text-lg mb-2">About NairaWatch</h3>
                <p className="text-sm text-slate-400 leading-relaxed mb-4">
                  NairaWatch aggregates Nigerian parallel market exchange rates using a hybrid model that blends official reference data with AI-assisted analysis of real-world market signals.
                </p>
                <p className="text-xs text-slate-500">
                  *Rates reflect real-world street pricing trends but may vary by location, volume, and vendor. Always confirm before completing a transaction.
                </p>
              </div>
              <div>
                <h4 className="text-white font-semibold text-sm mb-3">Data Sources</h4>
                <ul className="space-y-2 text-sm">
                  {sources.length > 0 ? sources.slice(0, 4).map((source, idx) => (
                    <li key={idx} className="flex items-center">
                      <ExternalLink className="h-3 w-3 mr-2 text-emerald-500" />
                      <span className="truncate">{source}</span>
                    </li>
                  )) : (
                    <li className="flex items-center text-slate-500">
                      <Info className="h-3 w-3 mr-2" />
                      <span>Searching live sources...</span>
                    </li>
                  )}
                </ul>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-slate-800 text-center text-xs text-slate-500">
              &copy; {new Date().getFullYear()} NairaWatch. Made by <a href="https://studio.tomiabe.com" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:text-emerald-300 transition-colors">Tomi Abe Studio</a>.
            </div>
          </div>
        </footer>
      </main>

      {selectedRate && (
        <TrendModal
          rate={selectedRate}
          points={selectedTrend}
          period={trendPeriod}
          onPeriodChange={setTrendPeriod}
          onClose={() => setSelectedCode(null)}
        />
      )}
    </div>
  );
}
