import React, { useMemo, useState } from 'react';
import { RateCard } from './components/RateCard';
import { INITIAL_RATES } from './constants';
import { CurrencyRate } from './types';

const REGIONS = ['Americas', 'Europe', 'Africa', 'Asia', 'Middle East', 'Oceania'] as const;

type Region = typeof REGIONS[number];

const REGION_MAP: Record<string, Region> = {
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

const MAJOR_CODES = new Set(['USD', 'EUR', 'GBP', 'CHF', 'JPY', 'CNY']);

const groupByRegion = (rates: CurrencyRate[]) => {
  const grouped: Record<Region, CurrencyRate[]> = {
    Americas: [],
    Europe: [],
    Africa: [],
    Asia: [],
    'Middle East': [],
    Oceania: [],
  };

  rates.forEach((rate) => {
    const region = REGION_MAP[rate.code] || 'Asia';
    grouped[region].push(rate);
  });

  return grouped;
};

const Section: React.FC<{ title: string; subtitle?: string; children: React.ReactNode }> = ({ title, subtitle, children }) => (
  <section className="bg-white/70 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
    <div className="mb-4">
      <h2 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h2>
      {subtitle && <p className="text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
    </div>
    {children}
  </section>
);

const Grid: React.FC<{ items: CurrencyRate[] }> = ({ items }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
    {items.map((rate) => (
      <RateCard key={rate.code} rate={rate} />
    ))}
  </div>
);

export const GroupingPreview: React.FC = () => {
  const rates = useMemo(() => INITIAL_RATES, []);
  const grouped = useMemo(() => groupByRegion(rates), [rates]);
  const [openRegion, setOpenRegion] = useState<Region | null>('Europe');
  const [filter, setFilter] = useState<Region | 'All'>('All');

  const major = rates.filter((rate) => MAJOR_CODES.has(rate.code));
  const regional = rates.filter((rate) => !MAJOR_CODES.has(rate.code));

  const filtered = filter === 'All'
    ? rates
    : rates.filter((rate) => (REGION_MAP[rate.code] || 'Asia') === filter);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 pb-12">
      <header className="sticky top-0 z-40 bg-slate-900/90 text-white backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold">Currency Grouping Preview</h1>
          <p className="text-sm text-slate-300">Four layout options to compare: regions, major + regions, accordion, and filter.</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <Section
          title="Option A — Region Sections"
          subtitle="Straightforward region grouping (fast to scan, minimal UI)."
        >
          <div className="space-y-8">
            {REGIONS.map((region) => (
              <div key={region}>
                <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200 mb-3">{region}</h3>
                <Grid items={grouped[region]} />
              </div>
            ))}
          </div>
        </Section>

        <Section
          title="Option B — Major + Regional"
          subtitle="Puts the most-used currencies first, then regional lists."
        >
          <div className="space-y-8">
            <div>
              <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200 mb-3">Major / Global</h3>
              <Grid items={major} />
            </div>
            {REGIONS.map((region) => (
              <div key={region}>
                <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200 mb-3">{region}</h3>
                <Grid items={grouped[region].filter((rate) => !MAJOR_CODES.has(rate.code))} />
              </div>
            ))}
          </div>
        </Section>

        <Section
          title="Option C — Accordion"
          subtitle="Keeps the page short; users expand a region to view cards."
        >
          <div className="space-y-3">
            {REGIONS.map((region) => {
              const isOpen = openRegion === region;
              return (
                <div key={region} className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setOpenRegion(isOpen ? null : region)}
                    className="w-full flex items-center justify-between px-4 py-3 text-left bg-slate-100/70 dark:bg-slate-900/70 hover:bg-slate-100 dark:hover:bg-slate-900"
                  >
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{region}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">{isOpen ? 'Hide' : 'Show'}</span>
                  </button>
                  {isOpen && (
                    <div className="p-4 bg-white dark:bg-slate-950">
                      <Grid items={grouped[region]} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Section>

        <Section
          title="Option D — Filter Pills"
          subtitle="Best for scale. Users can filter by region without long scrolling."
        >
          <div className="flex flex-wrap gap-2 mb-4">
            {['All', ...REGIONS].map((label) => (
              <button
                key={label}
                type="button"
                onClick={() => setFilter(label as Region | 'All')}
                className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                  filter === label
                    ? 'bg-emerald-500 text-white border-emerald-500'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <Grid items={filtered} />
        </Section>
      </main>
    </div>
  );
};
