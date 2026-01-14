import { CurrencyRate } from "../types";
import { INITIAL_RATES } from "../constants";

export interface RatesResponse {
  rates: CurrencyRate[];
  sources: string[];
  isFallback: boolean;
  error?: string;
}

// Frontend-safe: Only fetch JSON from Netlify Function
export const fetchLatestRates = async (): Promise<RatesResponse> => {
  try {
    const res = await fetch("/.netlify/functions/rates");

    if (res.ok) return await res.json();

    throw new Error(`Function fetch failed: ${res.status} ${res.statusText}`);
  } catch (err) {
    console.error("All fetch methods failed, using fallback", err);
    return {
      rates: INITIAL_RATES,
      sources: ["Offline Estimates"],
      isFallback: true,
      error: "Live updates unavailable",
    };
  }
};
