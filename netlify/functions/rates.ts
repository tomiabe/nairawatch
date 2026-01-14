import { GoogleGenAI, Type } from "@google/genai";

// Inline constants to avoid build-time import errors from frontend directories
const FALLBACK_RATES = [
  { code: 'USD', name: 'US Dollar', flag: '🇺🇸', buy: 1600, sell: 1615 },
  { code: 'GBP', name: 'British Pound', flag: '🇬🇧', buy: 2050, sell: 2080 },
  { code: 'EUR', name: 'Euro', flag: '🇪🇺', buy: 1720, sell: 1750 },
  { code: 'CAD', name: 'Canadian Dollar', flag: '🇨🇦', buy: 1150, sell: 1180 },
  { code: 'AUD', name: 'Australian Dollar', flag: '🇦🇺', buy: 1050, sell: 1080 },
  { code: 'CNY', name: 'Chinese Yuan', flag: '🇨🇳', buy: 220, sell: 235 },
  { code: 'AED', name: 'UAE Dirham', flag: '🇦🇪', buy: 430, sell: 445 },
  { code: 'SAR', name: 'Saudi Riyal', flag: '🇸🇦', buy: 420, sell: 435 },
  { code: 'CHF', name: 'Swiss Franc', flag: '🇨🇭', buy: 1750, sell: 1780 },
  { code: 'JPY', name: 'Japanese Yen', flag: '🇯🇵', buy: 10.5, sell: 11.5 },
  { code: 'ZAR', name: 'South African Rand', flag: '🇿🇦', buy: 85, sell: 95 },
  { code: 'GHS', name: 'Ghanaian Cedi', flag: '🇬🇭', buy: 95, sell: 105 },
  { code: 'INR', name: 'Indian Rupee', flag: '🇮🇳', buy: 18, sell: 20 },
  { code: 'XOF', name: 'CFA Franc', flag: '🇧🇯', buy: 2.4, sell: 2.8 },
  { code: 'KES', name: 'Kenyan Shilling', flag: '🇰🇪', buy: 12, sell: 13 },
  { code: 'SGD', name: 'Singapore Dollar', flag: '🇸🇬', buy: 1180, sell: 1210 },
  { code: 'TRY', name: 'Turkish Lira', flag: '🇹🇷', buy: 45, sell: 48 },
  { code: 'BRL', name: 'Brazilian Real', flag: '🇧🇷', buy: 280, sell: 300 },
  { code: 'KRW', name: 'South Korean Won', flag: '🇰🇷', buy: 1.1, sell: 1.3 },
  { code: 'MYR', name: 'Malaysian Ringgit', flag: '🇲🇾', buy: 350, sell: 370 },
];

export const handler = async () => {
  try {
    const apiKey = process.env.API_KEY;

    if (!apiKey) {
      console.error("Missing API Key");
      return {
        statusCode: 500,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rates: FALLBACK_RATES,
          sources: ["Offline Estimates"],
          isFallback: true,
          error: "Missing API key on server",
        }),
      };
    }

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

    const mergedRates = FALLBACK_RATES.map((init) => {
      const found = parsed.rates?.find((r: any) => r.code === init.code);
      return found
        ? { ...init, buy: found.buy, sell: found.sell, official: found.official }
        : init;
    });

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        rates: mergedRates,
        sources: uniqueSources,
        isFallback: false,
      }),
    };
  } catch (err) {
    console.error("Handler error:", err);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rates: FALLBACK_RATES,
        sources: ["Offline Estimates"],
        isFallback: true,
        error: "AI fetch failed",
      }),
    };
  };
};