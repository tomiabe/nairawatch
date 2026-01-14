import { GoogleGenAI, Type } from "@google/genai";
import { CurrencyRate } from "../types";
import { INITIAL_RATES } from "../constants";

export interface RatesResponse {
    rates: CurrencyRate[];
    sources: string[];
    isFallback: boolean;
    error?: string;
}

// Fallback logic for client-side execution (Development/Preview only)
const fetchRatesDirectly = async (): Promise<RatesResponse> => {
    console.log("Attempting client-side AI fetch (fallback for local dev)...");
    try {
        // @ts-ignore
        const apiKey = process.env.API_KEY; 
        if (!apiKey) throw new Error("No API Key available for client-side fallback");

        const ai = new GoogleGenAI({ apiKey });

        const prompt = `
          Find the current parallel market (black market) currency exchange rates for Nigerian Naira (NGN).
          I need the rates for the following currencies against NGN: USD, GBP, EUR, CAD, AUD, CNY, AED, SAR, CHF, JPY, ZAR, GHS, INR, XOF, KES, SGD, TRY, BRL, KRW, MYR.
          
          Look for recent data from sources like 'naira_rates' on Twitter, AbokiFX, or other reliable parallel market trackers.
          
          Return a JSON object with a list of rates. For each currency, provide:
          - 'code': The 3-letter currency code (e.g., USD).
          - 'buy': The buying rate (what exchangers pay).
          - 'sell': The selling rate (what exchangers sell for).
          - 'official': The official CBN rate if available (optional).
          
          If you find a single rate, use it for both buy and sell.
        `;

        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        rates: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    code: { type: Type.STRING },
                                    buy: { type: Type.NUMBER },
                                    sell: { type: Type.NUMBER },
                                    official: { type: Type.NUMBER },
                                },
                                required: ["code", "buy", "sell"],
                            },
                        },
                    },
                    required: ["rates"],
                },
            },
        });

        const jsonText = response.text;
        const parsed = JSON.parse(jsonText || "{}");

        // Extract sources
        const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        const sources: string[] = [];
        if (groundingChunks) {
            groundingChunks.forEach((chunk: any) => {
                if (chunk.web?.uri) {
                    sources.push(chunk.web.title || chunk.web.uri);
                }
            });
        }
        const uniqueSources = Array.from(new Set(sources));

        const mergedRates = INITIAL_RATES.map((init) => {
            const found = parsed.rates?.find((r: any) => r.code === init.code);
            return found
                ? { ...init, buy: found.buy, sell: found.sell, official: found.official, lastUpdated: new Date().toISOString() }
                : init;
        });

        return {
            rates: mergedRates,
            sources: uniqueSources,
            isFallback: false
        };

    } catch (error) {
        console.error("Client-side AI fetch failed:", error);
        throw error;
    }
};

export const fetchLatestRates = async (): Promise<RatesResponse> => {
  try {
    // 1. Try fetching from the Netlify Function (Production)
    const res = await fetch("/.netlify/functions/rates");

    if (res.ok) {
        return await res.json();
    }

    // 2. If Function is missing (404 - Local Dev / Preview), fallback to client-side SDK
    if (res.status === 404) {
        console.warn("Serverless function not found (404). Falling back to client-side AI call.");
        return await fetchRatesDirectly();
    }

    throw new Error(`Server error: ${res.status} ${res.statusText}`);
  } catch (error) {
    console.error("Primary fetch failed, attempting absolute fallback...", error);
    
    // 3. Last resort: Try client-side if the network request failed entirely (not just 404)
    try {
        return await fetchRatesDirectly();
    } catch (clientError) {
        console.error("All fetch methods failed. Using offline data.", clientError);
        return { 
            rates: INITIAL_RATES, 
            sources: ["Offline Estimates"],
            isFallback: true,
            error: "Live updates unavailable"
        };
    }
  }
};