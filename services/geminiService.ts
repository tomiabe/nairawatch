import { GoogleGenAI, Type } from "@google/genai";
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
    // Initialize Gemini AI with process.env.API_KEY as per guidelines
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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
    if (!jsonText) {
       throw new Error("Empty response from Gemini");
    }

    const parsed = JSON.parse(jsonText);
    
    // Merge with initial rates to ensure we have flags and names even if API misses some metadata
    const mergedRates = INITIAL_RATES.map(initRate => {
      const found = parsed.rates.find((r: any) => r.code === initRate.code);
      if (found) {
        return {
          ...initRate,
          buy: found.buy,
          sell: found.sell,
          official: found.official
        };
      }
      return initRate;
    });

    // Extract sources if available
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    const sources: string[] = [];
    if (groundingChunks) {
        groundingChunks.forEach((chunk: any) => {
            if (chunk.web?.uri) {
                sources.push(chunk.web.title || chunk.web.uri);
            }
        });
    }

    return { 
        rates: mergedRates, 
        sources: Array.from(new Set(sources)),
        isFallback: false
    };

  } catch (error) {
    console.error("Failed to fetch rates:", error);
    return { 
        rates: INITIAL_RATES, 
        sources: ["Offline Estimates"],
        isFallback: true,
        error: "Connection or AI generation failed."
    };
  }
};