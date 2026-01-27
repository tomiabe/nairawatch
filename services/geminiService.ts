import { CurrencyRate } from "../types";
import { INITIAL_RATES } from "../constants";

export interface RatesResponse {
  rates: CurrencyRate[];
  sources: string[];
  isFallback: boolean;
  error?: string;
}

const API_ENDPOINT = '/api/rates';

/**
 * Fetches the latest rates using the AI-powered Vercel function.
 * Specifically designed to ground in sources like NgnRates.com
 */
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
        : "Live updates unavailable",
    };
  }
};
