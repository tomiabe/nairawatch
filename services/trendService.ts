import { CurrencyRate, TrendPeriod, TrendPoint } from '../types';

const PERIOD_CONFIG: Record<TrendPeriod, { points: number; stepHours: number; volatility: number }> = {
  '24h': { points: 24, stepHours: 1, volatility: 0.006 },
  '7d': { points: 28, stepHours: 6, volatility: 0.013 },
};

const hash = (text: string): number =>
  text.split('').reduce((acc, ch) => (acc * 31 + ch.charCodeAt(0)) >>> 0, 7);

const pseudoRandom = (seed: number): number => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

export const buildMockTrend = (rate: CurrencyRate, period: TrendPeriod): TrendPoint[] => {
  const { points, stepHours, volatility } = PERIOD_CONFIG[period];
  const now = Date.now();
  const seed = hash(rate.code);
  const baseMid = (rate.buy + rate.sell) / 2;
  const baseSpread = Math.max(1, rate.sell - rate.buy);

  const series: TrendPoint[] = [];

  for (let i = 0; i < points; i += 1) {
    const pointSeed = seed + i * 17;
    const wave = Math.sin((i / points) * Math.PI * 2 + (seed % 10)) * volatility;
    const noise = (pseudoRandom(pointSeed) - 0.5) * volatility * 1.7;
    const drift = (i / (points - 1) - 0.5) * volatility * 0.8;
    const change = wave + noise + drift;

    const mid = baseMid * (1 + change);
    const spreadFactor = 1 + (pseudoRandom(pointSeed + 3) - 0.5) * 0.2;
    const spread = baseSpread * spreadFactor;

    const buy = Math.max(0.01, mid - spread / 2);
    const sell = Math.max(buy + 0.01, mid + spread / 2);
    const timestamp = new Date(now - (points - 1 - i) * stepHours * 60 * 60 * 1000).toISOString();

    series.push({
      timestamp,
      buy: Math.round(buy * 100) / 100,
      sell: Math.round(sell * 100) / 100,
    });
  }

  return series;
};
