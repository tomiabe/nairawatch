import { GoogleGenerativeAI } from "@google/generative-ai";
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Inline constants to avoid build-time import errors from frontend directories
const FALLBACK_RATES: any[] = [
    { code: 'USD', name: 'US Dollar', flag: '🇺🇸', buy: 1600, sell: 1615, official: 1530 },
    { code: 'GBP', name: 'British Pound', flag: '🇬🇧', buy: 2050, sell: 2080, official: 1950 },
    { code: 'EUR', name: 'Euro', flag: '🇪🇺', buy: 1720, sell: 1750, official: 1650 },
    { code: 'CAD', name: 'Canadian Dollar', flag: '🇨🇦', buy: 1150, sell: 1180, official: 1100 },
    { code: 'AUD', name: 'Australian Dollar', flag: '🇦🇺', buy: 1050, sell: 1080, official: 1000 },
    { code: 'CNY', name: 'Chinese Yuan', flag: '🇨🇳', buy: 220, sell: 235, official: 210 },
    { code: 'AED', name: 'UAE Dirham', flag: '🇦🇪', buy: 430, sell: 445, official: 415 },
    { code: 'SAR', name: 'Saudi Riyal', flag: '🇸🇦', buy: 420, sell: 435, official: 405 },
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

/**
 * Fetch Official rates from a public API as a primary source for official data
 * and as a fallback for the AI.
 */
async function fetchOfficialRates() {
    try {
        const response = await fetch("https://open.exchangerate-api.com/v6/latest/USD");
        if (!response.ok) throw new Error("API failed");
        const data = await response.json();
        return {
            rates: data.rates,
            usdToNgn: data.rates.NGN
        };
    } catch (e) {
        console.error("Failed to fetch official rates:", e);
        return null;
    }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;

        // 1. Fetch Official Rates (No Quota Limit)
        const officialData = await fetchOfficialRates();
        const officialUsdToNgn = officialData?.usdToNgn || 1530;

        // 2. Prepare Base Rates with Official Data
        let mergedRates = FALLBACK_RATES.map((init) => {
            const currencyToUsd = officialData?.rates?.[init.code];
            if (currencyToUsd) {
                const officialRate = officialUsdToNgn / currencyToUsd;
                return { ...init, official: Math.round(officialRate * 100) / 100 };
            }
            return init;
        });

        // 3. Try to Fetch Street Rates with Gemini
        let aiParsed: any = { rates: [] };
        let sources: string[] = ["Official Exchange API"];
        let isFallback = true;
        let quotaError = false;

        if (apiKey) {
            try {
                const genAI = new GoogleGenerativeAI(apiKey);
                const model = genAI.getGenerativeModel({
                    model: "gemini-2.0-flash-lite",
                    generationConfig: { temperature: 0.1, maxOutputTokens: 1000 }
                });

                const prompt = `Return ONLY JSON for current NGN parallel market rates (USD, GBP, EUR, CAD, AUD, CNY, AED, SAR, CHF, JPY, ZAR, GHS, INR, XOF, KES, SGD, TRY, BRL, KRW, MYR). 
        Prioritize NgnRates.com and AbokiFX. 
        {"rates": [{"code": "USD", "buy": 1600, "sell": 1620, "official": 1550}]}`;

                const result = await model.generateContent(prompt);
                const response = await result.response;
                const jsonText = response.text().replace(/```json/g, '').replace(/```/g, '').trim();

                aiParsed = JSON.parse(jsonText);
                isFallback = false;

                // Extract sources
                if (jsonText.toLowerCase().includes('ngnrates')) sources.push('NgnRates.com');
                if (jsonText.toLowerCase().includes('abokifx')) sources.push('AbokiFX');
            } catch (err: any) {
                console.error("Gemini failed:", err.message);
                if (err?.message?.includes("429") || err?.message?.includes("quota")) {
                    quotaError = true;
                }
            }
        }

        // 4. Merge AI results into our official rates
        mergedRates = mergedRates.map((rate) => {
            const found = aiParsed.rates?.find((r: any) => r.code === rate.code);
            if (found && (found.buy || found.sell)) {
                return {
                    ...rate,
                    buy: Math.max(found.buy, rate.official || 0),
                    sell: Math.max(found.sell, (rate.official || 0) + 5),
                    lastUpdated: new Date().toISOString()
                };
            }

            // If AI failed/quota, we estimate Black Market as Official + ~5% (very conservative)
            if (isFallback && rate.official) {
                return {
                    ...rate,
                    buy: Math.round(rate.official * 1.04 * 100) / 100,
                    sell: Math.round(rate.official * 1.06 * 100) / 100,
                    lastUpdated: new Date().toISOString()
                };
            }
            return rate;
        });

        return res.status(200).json({
            rates: mergedRates,
            sources: Array.from(new Set(sources)),
            isFallback: isFallback,
            error: quotaError ? "Gemini Quota Exceeded. Using smart estimates." : null
        });
    } catch (err: any) {
        console.error("Handler error:", err);
        return res.status(200).json({
            rates: FALLBACK_RATES,
            sources: ["Offline Estimates"],
            isFallback: true,
            error: err instanceof Error ? err.message : "Internal Error",
        });
    }
}
