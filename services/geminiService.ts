import { CurrencyRate } from "../types";
import { INITIAL_RATES } from "../constants";

export interface RatesResponse {
    rates: CurrencyRate[];
    sources: string[];
    isFallback: boolean;
    error?: string;
}

export const fetchLatestRates = async (): Promise<RatesResponse> => {
  try {
    const res = await fetch("/.netlify/functions/rates");

    if (!res.ok) {
        // Handle 404 specifically (common in local dev without Netlify CLI)
        if (res.status === 404) {
             console.warn("API function not found (likely local dev). Using offline fallback.");
             return { 
                 rates: INITIAL_RATES, 
                 sources: ["Offline Estimates"],
                 isFallback: true,
                 error: "Live updates unavailable (Local Mode)"
             };
        }
        
        throw new Error(`Server error: ${res.status} ${res.statusText}`);
    }

    return await res.json();
  } catch (error) {
    console.error("Failed to fetch rates:", error);
    return { 
        rates: INITIAL_RATES, 
        sources: ["Offline Estimates"],
        isFallback: true,
        error: "Offline or server unavailable"
    };
  }
};