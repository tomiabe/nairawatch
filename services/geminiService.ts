import { CurrencyRate } from "../types";
import { INITIAL_RATES } from "../constants";

export interface RatesResponse {
  rates: CurrencyRate[];
  sources: string[];
  isFallback: boolean;
  error?: string;
}

<<<<<<< HEAD
const API_ENDPOINT = '/api/rates';

/**
 * Fetches the latest rates using the AI-powered Netlify function.
 * Specifically designed to ground in sources like NgnRates.com
 */
export const fetchLatestRates = async (): Promise<RatesResponse> => {
    try {
        const response = await fetch(API_ENDPOINT);

        if (!response.ok) {
            throw new Error(`Server returned ${response.status}`);
        }

        const data = await response.json();
        return {
            rates: data.rates,
            sources: data.sources || ["AI Grounding"],
            isFallback: data.isFallback || false,
        };
    } catch (error) {
        console.warn("AI Function failed, falling back to basic API logic:", error);

        // This is a minimal fallback that could be expanded with direct API calls 
        // if the Netlify function is down or misconfigured.
        return {
            rates: INITIAL_RATES,
            sources: ["Offline Estimates (Connection Failed)"],
            isFallback: true,
            error: error instanceof Error ? error.message : "Fetch failed"
        };
    }
};
=======
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
>>>>>>> a59d4ec9bb8812fe4b790a7c15b0ec0369c216b3
