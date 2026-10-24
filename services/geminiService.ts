import { CurrencyRate } from "../types";
import { INITIAL_RATES } from "../constants";

export interface RatesResponse {
  rates: CurrencyRate[];
  sources: string[];
  isFallback: boolean;
  error?: string;
}

const API_ENDPOINT = import.meta.env.VITE_API_URL || '/api/rates';


export const fetchLatestRates = async (): Promise<RatesResponse> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout for AI search

  try {
    const res = await fetch(API_ENDPOINT, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) return await res.json();

    throw new Error(`Function fetch failed: ${res.status} ${res.statusText}`);
  } catch (err) {
    clearTimeout(timeoutId);
    console.error("All fetch methods failed, using fallback", err);
    return {
      rates: INITIAL_RATES,
      sources: ["Offline Estimates"],
      isFallback: true,
      error: err instanceof Error && err.name === 'AbortError'
        ? "Request timed out. Using estimated rates."
        : "",
    };
  }
};

export type ServerSnapshot = { t: number; r: Record<string, [number, number]> };

const HISTORY_ENDPOINT = (() => {
  const base = import.meta.env.VITE_API_URL;
  if (!base) return '/api/history';
  return `${String(base).replace(/\/+$/, '')}/history`;
})();

// Real hourly snapshots recorded by the worker. Returns [] if unavailable.
export const fetchRateHistory = async (period: '24h' | '7d' = '7d'): Promise<ServerSnapshot[]> => {
  try {
    const res = await fetch(`${HISTORY_ENDPOINT}?period=${period}`);
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data?.points) ? data.points : [];
  } catch {
    return [];
  }
};
