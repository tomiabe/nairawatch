import React, { useEffect, useState } from 'react';
import { Header } from './components/Header';
import { Converter } from './components/Converter';
import { RateCard } from './components/RateCard';
import { fetchLatestRates } from './services/geminiService';
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
    setIsDarkMode(prev => !prev);
  };

  const loadRates = async () => {
    setIsLoading(true);
    try {
      const data = await fetchLatestRates();
      setRates(data.rates);
      setSources(data.sources);
      
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
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRates();
    // Refresh every 5 minutes automatically
    const interval = setInterval(loadRates, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

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
        
        {/* Error / Offline Banner */}
        {isOffline && (
            <div className="rounded-lg bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 p-4">
            <div className="flex">
                <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-amber-400" aria-hidden="true" />
                </div>
                <div className="ml-3">
                <h3 className="text-sm font-medium text-amber-800 dark:text-amber-200">
                    System Alert: Live Updates Unavailable
                </h3>
                <div className="mt-2 text-sm text-amber-700 dark:text-amber-300">
                    <p>
                    {errorMsg || "Unable to connect to market data."} Displaying estimated rates.
                    </p>
                </div>
                </div>
            </div>
            </div>
        )}

        {/* Hero Section / Converter */}
        <section className="max-w-3xl mx-auto">
            <Converter rates={rates} />
        </section>

        {/* Live Rates Grid */}
        <section>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Current Market Rates</h2>
                
                {isOffline ? (
                     <span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-medium text-slate-600 dark:text-slate-400">
                        <WifiOff className="w-3 h-3 mr-2" />
                        Offline / Estimates
                    </span>
                ) : (
                    <span className="inline-flex items-center rounded-full bg-emerald-100 dark:bg-emerald-900/30 px-3 py-1 text-xs font-medium text-emerald-800 dark:text-emerald-300 animate-pulse">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span>
                        Live Updates
                    </span>
                )}
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
                            We aggregate parallel market (black market) rates from various reliable sources including social media trackers like @naira_rates, AbokiFX, and P2P exchange platforms.
                        </p>
                        <p className="text-xs text-slate-500">
                            *Rates are estimates and may vary by location and vendor. Always confirm before transaction.
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
                    &copy; {new Date().getFullYear()} NairaWatch. Built by <a href="https://studio.tomiabe.com" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:text-emerald-300 transition-colors">Tomi Abe Studio</a>.
                </div>
            </div>
        </footer>

      </main>
    </div>
  );
}