import { GoogleGenerativeAI } from "@google/generative-ai";
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Inline constants to avoid build-time import errors from frontend directories
const FALLBACK_RATES: any[] = [
    { code: 'USD', name: 'US Dollar', flag: '🇺🇸', buy: 1600, sell: 1615, official: 1530 },
    { code: 'GBP', name: 'British Pound', flag: '🇬🇧', buy: 2050, sell: 2080, official: 1950 },
    { code: 'EUR', name: 'Euro', flag: '🇪🇺', buy: 1720, sell: 1750, official: 1650 },
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
        console.log("API Handler Invoked. API Key Present:", !!apiKey);

        if (!apiKey) {
            console.warn("Missing API Key in environment variables!");
            return res.status(200).json({
                rates: FALLBACK_RATES,
                sources: ["Offline Estimates (Missing API Key)"],
                isFallback: true,
            });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash",
            generationConfig: {
                temperature: 0.1,
                maxOutputTokens: 1000,
            }
        });

        const prompt = `
      Current NGN black market (parallel) rates for: USD, GBP, EUR, CAD, AUD, CNY, AED, SAR, CHF, JPY, ZAR, GHS, INR, XOF, KES, SGD, TRY, BRL, KRW, MYR.
      
      CRITICAL: Check NgnRates.com, AbokiFX, and @naira_rates.
      
      Return ONLY a raw JSON object string:
      {"rates": [{"code": "USD", "buy": 1600, "sell": 1620, "official": 1550}]}
      
      Ensure every currency in the list has a buy/sell value. No explanation text.
    `;

        console.log("Sending prompt to Gemini...");
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const jsonText = response.text().replace(/```json/g, '').replace(/```/g, '').trim();

        console.log("Gemini Raw Output (first 100 chars):", jsonText.substring(0, 100));

        let parsed: any = { rates: [] };
        try {
            parsed = JSON.parse(jsonText);
        } catch (e) {
            console.error("Failed to parse AI response:", jsonText);
        }

        // Extract sources mentioned in text
        const sources: string[] = [];
        if (jsonText.toLowerCase().includes('ngnrates')) sources.push('NgnRates.com');
        if (jsonText.toLowerCase().includes('abokifx')) sources.push('AbokiFX');
        if (jsonText.toLowerCase().includes('twitter') || jsonText.toLowerCase().includes('nairarates')) sources.push('NairaRates (Twitter)');

        const uniqueSources = Array.from(new Set(sources));

        const mergedRates = FALLBACK_RATES.map((init) => {
            const found = parsed.rates?.find((r: any) => r.code === init.code);
            if (found && (found.buy || found.sell)) {
                return {
                    ...init,
                    buy: found.buy || found.sell,
                    sell: found.sell || found.buy,
                    official: found.official || (init as any).official || null,
                    lastUpdated: new Date().toISOString()
                };
            }
            return init;
        });

        return res.status(200).json({
            rates: mergedRates,
            sources: uniqueSources.length > 0 ? uniqueSources : ["AI Market Search"],
            isFallback: false,
        });
    } catch (err) {
        console.error("Vercel Function error:", err);
        // Return 200 with fallbacks to prevent frontend error toast
        return res.status(200).json({
            rates: FALLBACK_RATES,
            sources: ["Offline Estimates (Function Error)"],
            isFallback: true,
            error: err instanceof Error ? err.message : "AI fetch failed",
        });
    }
}
