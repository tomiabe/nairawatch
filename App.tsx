import React, { useEffect, useState } from 'react';
import { Header } from './components/Header';
import { Converter } from './components/Converter';
import { RateCard } from './components/RateCard';
import { fetchLatestRates } from './services/geminiService';
import { trackEvent } from './services/analyticsService';
import { CurrencyRate } from './types';
import { INITIAL_RATES } from './constants';
import { ExternalLink, Info, AlertTriangle, WifiOff } from 'lucide-react';

export default function App() {
  const [rates, setRates] = useState<CurrencyRate[]>(INITIAL_RATES);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [sources, setSources] = useState<string[]>([]);

  // Status State
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Theme State
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  // Initialize Theme based on time (7 AM - 7 PM = Light)
  useEffect(() => {
    const checkTimeForTheme = () => {
      const hour = new Date().getHours();
      // Light mode from 7 (7 AM) to 18 (6:59 PM). Dark mode from 19 (7 PM) to 6 (6:59 AM).
      const isDayTime = hour >= 7 && hour < 19;
      setIsDarkMode(!isDayTime);
    };

    checkTimeForTheme();
    // Re-check every minute
    const timer = setInterval(checkTimeForTheme, 60000);
    return () => clearInterval(timer);
  }, []);

  // Apply Theme to DOM
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(prev => {
      const nextMode = !prev;
      trackEvent('theme_toggled', { mode: nextMode ? 'dark' : 'light' });
      return nextMode;
    });
  };

  const loadRates = async (trigger: 'initial' | 'auto' | 'manual' = 'auto') => {
    setIsLoading(true);
    try {
      const data = await fetchLatestRates();
      setRates(data.rates);
      setSources(data.sources);
      trackEvent('rates_loaded', {
        trigger,
        count: data.rates.length,
        fallback: data.isFallback
      });

      // Handle fallback/error state
      if (data.isFallback) {
        setIsOffline(true);
        setErrorMsg(data.error || 'Using offline estimates');
      } else {
        setIsOffline(false);
        setErrorMsg('');
        setLastUpdated(new Date());
      }
    } catch (err) {
      console.error("Unexpected error in App:", err);
      setIsOffline(true);
      setErrorMsg('Unexpected system error');
      trackEvent('rates_load_failed', { trigger });
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualRefresh = () => {
    trackEvent('refresh_clicked');
    loadRates('manual');
  };

  useEffect(() => {
    loadRates('initial');
    // Refresh every 5 minutes automatically
    const interval = setInterval(() => loadRates('auto'), 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-8 transition-colors duration-300">
      <Header
        lastUpdated={lastUpdated}
        onRefresh={handleManualRefresh}
        isLoading={isLoading}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">



        {/* Hero Section / Converter */}
        <section className="max-w-3xl mx-auto">
          <Converter rates={rates} onInteraction={trackEvent} />
        </section>

        {/* Live Rates Grid */}
        <section>
          <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-8 gap-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Current Market Rates</h1>
            </div>

            <div className="flex flex-col items-start md:items-end gap-2">
              {isOffline ? (
                <>
                  <span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-medium text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                    <WifiOff className="w-3 h-3 mr-2" />
                    Offline / Estimates
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-500 font-medium md:text-right">
                    Estimates Mode (Live updates paused)
                  </p>
                </>
              ) : (
                <>
                  <span className="inline-flex items-center rounded-full bg-emerald-100 dark:bg-emerald-900/30 px-3 py-1 text-xs font-medium text-emerald-800 dark:text-emerald-300 animate-pulse border border-emerald-200 dark:border-emerald-800/30">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span>
                    Live Updates
                  </span>
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-500/70 font-medium md:text-right">
                    Live Parallel Market Estimates
                  </p>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {rates.map((rate) => (
              <RateCard key={rate.code} rate={rate} />
            ))}
          </div>
        </section>

        {/* Footer / Disclaimer */}
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
    </div>
  );
}
