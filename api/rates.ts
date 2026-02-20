import type { VercelRequest, VercelResponse } from '@vercel/node';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const DEFAULT_OPENROUTER_MODEL = 'meta-llama/llama-3.1-8b-instruct:free';

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

type ParsedAiResponse = {
    rates?: Array<{ code: string; buy?: number; sell?: number; official?: number }>;
    sources?: string[];
};

async function fetchOfficialRates() {
    try {
        const response = await fetch('https://open.exchangerate-api.com/v6/latest/USD');
        if (!response.ok) throw new Error('API failed');
        const data = await response.json();
        return {
            rates: data.rates,
            usdToNgn: data.rates.NGN,
        };
    } catch (e) {
        console.error('Failed to fetch official rates:', e);
        return null;
    }
}

function extractJsonPayload(text: string): ParsedAiResponse {
    const cleaned = text.trim();

    try {
        return JSON.parse(cleaned);
    } catch {
        const start = cleaned.indexOf('{');
        const end = cleaned.lastIndexOf('}');
        if (start >= 0 && end > start) {
            const slice = cleaned.slice(start, end + 1);
            return JSON.parse(slice);
        }
        throw new Error('No JSON payload found in model response');
    }
}

async function fetchStreetRatesWithOpenRouter(
    apiKey: string,
    model: string,
    officialUsdToNgn: number,
): Promise<{ parsed: ParsedAiResponse; rawText: string }> {
    const prompt = `Return ONLY valid JSON for current NGN parallel market rates for these currencies:
USD, GBP, EUR, CAD, AUD, CNY, AED, SAR, CHF, JPY, ZAR, GHS, INR, XOF, KES, SGD, TRY, BRL, KRW, MYR.

Rules:
- Output object shape must be: {"rates": [{"code":"USD","buy":1600,"sell":1620}], "sources": ["NgnRates.com", "AbokiFX"]}
- Use numbers only for buy/sell.
- Include only the listed currency codes.
- Prefer market references like NgnRates.com and AbokiFX when possible.
- Official USD/NGN reference is about ${officialUsdToNgn}.`; 

    const response = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
            'HTTP-Referer': process.env.OPENROUTER_SITE_URL || 'https://nairawatch.vercel.app',
            'X-Title': process.env.OPENROUTER_APP_NAME || 'NairaWatch',
        },
        body: JSON.stringify({
            model,
            temperature: 0.1,
            max_tokens: 1000,
            messages: [
                {
                    role: 'system',
                    content: 'You are a financial data assistant. Respond only with valid JSON and no markdown.',
                },
                {
                    role: 'user',
                    content: prompt,
                },
            ],
        }),
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`OpenRouter ${response.status}: ${text}`);
    }

    const data = await response.json();
    const rawText = data?.choices?.[0]?.message?.content;

    if (!rawText || typeof rawText !== 'string') {
        throw new Error('OpenRouter returned empty completion content');
    }

    return {
        parsed: extractJsonPayload(rawText),
        rawText,
    };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        const apiKey = process.env.OPENROUTER_API_KEY || process.env.API_KEY;
        const model = process.env.OPENROUTER_MODEL || DEFAULT_OPENROUTER_MODEL;

        const officialData = await fetchOfficialRates();
        const officialUsdToNgn = officialData?.usdToNgn || 1530;

        let mergedRates = FALLBACK_RATES.map((init) => {
            const currencyToUsd = officialData?.rates?.[init.code];
            if (currencyToUsd) {
                const officialRate = officialUsdToNgn / currencyToUsd;
                return { ...init, official: Math.round(officialRate * 100) / 100 };
            }
            return init;
        });

        let aiParsed: ParsedAiResponse = { rates: [] };
        let sources: string[] = ['Official Exchange API'];
        let isFallback = true;
        let quotaError = false;

        if (apiKey) {
            try {
                const { parsed, rawText } = await fetchStreetRatesWithOpenRouter(apiKey, model, officialUsdToNgn);
                aiParsed = parsed;
                isFallback = false;
                sources.push(`OpenRouter (${model})`);

                const modelSources = parsed.sources || [];
                if (modelSources.length > 0) {
                    sources.push(...modelSources);
                }

                const lowered = rawText.toLowerCase();
                if (lowered.includes('ngnrates')) sources.push('NgnRates.com');
                if (lowered.includes('abokifx')) sources.push('AbokiFX');
            } catch (err: any) {
                console.error('OpenRouter failed:', err?.message || err);
                if (String(err?.message || '').includes('429')) {
                    quotaError = true;
                }
            }
        }

        mergedRates = mergedRates.map((rate) => {
            const found = aiParsed.rates?.find((r) => r.code === rate.code);
            if (found && (found.buy || found.sell)) {
                return {
                    ...rate,
                    buy: Math.max(Number(found.buy), rate.official || 0),
                    sell: Math.max(Number(found.sell), (rate.official || 0) + 5),
                    lastUpdated: new Date().toISOString(),
                };
            }

            if (isFallback && rate.official) {
                return {
                    ...rate,
                    buy: Math.round(rate.official * 1.04 * 100) / 100,
                    sell: Math.round(rate.official * 1.06 * 100) / 100,
                    lastUpdated: new Date().toISOString(),
                };
            }
            return rate;
        });

        return res.status(200).json({
            rates: mergedRates,
            sources: Array.from(new Set(sources)),
            isFallback,
            error: quotaError ? 'OpenRouter rate limit reached. Using smart estimates.' : null,
        });
    } catch (err: any) {
        console.error('Handler error:', err);
        return res.status(200).json({
            rates: FALLBACK_RATES,
            sources: ['Offline Estimates'],
            isFallback: true,
            error: err instanceof Error ? err.message : 'Internal Error',
        });
    }
}
