const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const DEFAULT_GROQ_MODEL = 'openai/gpt-oss-120b';
const DEFAULT_GROQ_FALLBACK_MODELS = [
	'openai/gpt-oss-120b',
	'openai/gpt-oss-20b',
];

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions';
const DEFAULT_GEMINI_MODEL = 'gemini-3.1-flash-lite';
const DEFAULT_GEMINI_FALLBACK_MODELS = [
	'gemini-3.1-flash-lite',
	'gemini-flash-latest',
];

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const DEFAULT_OPENROUTER_MODEL = 'google/gemma-4-31b-it:free';
const DEFAULT_OPENROUTER_FALLBACK_MODELS = [
	'google/gemma-4-31b-it:free',
	'google/gemma-4-26b-a4b-it:free',
	'nvidia/nemotron-3-super-120b-a12b:free',
];

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
	{ code: 'SEK', name: 'Swedish Krona', flag: '🇸🇪', buy: 150, sell: 160 },
	{ code: 'NOK', name: 'Norwegian Krone', flag: '🇳🇴', buy: 150, sell: 162 },
	{ code: 'DKK', name: 'Danish Krone', flag: '🇩🇰', buy: 235, sell: 250 },
	{ code: 'PLN', name: 'Polish Zloty', flag: '🇵🇱', buy: 420, sell: 440 },
	{ code: 'MXN', name: 'Mexican Peso', flag: '🇲🇽', buy: 92, sell: 98 },
	{ code: 'NZD', name: 'New Zealand Dollar', flag: '🇳🇿', buy: 960, sell: 990 },
	{ code: 'HKD', name: 'Hong Kong Dollar', flag: '🇭🇰', buy: 200, sell: 210 },
	{ code: 'TWD', name: 'New Taiwan Dollar', flag: '🇹🇼', buy: 48, sell: 52 },
	{ code: 'THB', name: 'Thai Baht', flag: '🇹🇭', buy: 43, sell: 46 },
	{ code: 'IDR', name: 'Indonesian Rupiah', flag: '🇮🇩', buy: 0.09, sell: 0.11 },
	{ code: 'PHP', name: 'Philippine Peso', flag: '🇵🇭', buy: 28, sell: 31 },
	{ code: 'VND', name: 'Vietnamese Dong', flag: '🇻🇳', buy: 0.05, sell: 0.06 },
	{ code: 'PKR', name: 'Pakistani Rupee', flag: '🇵🇰', buy: 5.5, sell: 6.2 },
	{ code: 'BDT', name: 'Bangladeshi Taka', flag: '🇧🇩', buy: 14, sell: 15.5 },
	{ code: 'LKR', name: 'Sri Lankan Rupee', flag: '🇱🇰', buy: 4.8, sell: 5.5 },
	{ code: 'NPR', name: 'Nepalese Rupee', flag: '🇳🇵', buy: 11, sell: 12.5 },
	{ code: 'RUB', name: 'Russian Ruble', flag: '🇷🇺', buy: 17, sell: 19 },
	{ code: 'UAH', name: 'Ukrainian Hryvnia', flag: '🇺🇦', buy: 42, sell: 46 },
	{ code: 'CZK', name: 'Czech Koruna', flag: '🇨🇿', buy: 66, sell: 72 },
	{ code: 'HUF', name: 'Hungarian Forint', flag: '🇭🇺', buy: 4.2, sell: 4.9 },
	{ code: 'RON', name: 'Romanian Leu', flag: '🇷🇴', buy: 340, sell: 365 },
	{ code: 'BGN', name: 'Bulgarian Lev', flag: '🇧🇬', buy: 860, sell: 900 },
	{ code: 'ISK', name: 'Icelandic Krona', flag: '🇮🇸', buy: 11, sell: 12.5 },
	{ code: 'ARS', name: 'Argentine Peso', flag: '🇦🇷', buy: 1.8, sell: 2.3 },
	{ code: 'CLP', name: 'Chilean Peso', flag: '🇨🇱', buy: 1.6, sell: 2.0 },
	{ code: 'COP', name: 'Colombian Peso', flag: '🇨🇴', buy: 0.38, sell: 0.48 },
	{ code: 'PEN', name: 'Peruvian Sol', flag: '🇵🇪', buy: 420, sell: 445 },
	{ code: 'XAF', name: 'CFA Franc (Central)', flag: '🇨🇲', buy: 2.4, sell: 2.8 },
	{ code: 'UGX', name: 'Ugandan Shilling', flag: '🇺🇬', buy: 0.41, sell: 0.5 },
	{ code: 'TZS', name: 'Tanzanian Shilling', flag: '🇹🇿', buy: 0.55, sell: 0.65 },
	{ code: 'EGP', name: 'Egyptian Pound', flag: '🇪🇬', buy: 50, sell: 55 },
	{ code: 'MAD', name: 'Moroccan Dirham', flag: '🇲🇦', buy: 155, sell: 170 },
	{ code: 'TND', name: 'Tunisian Dinar', flag: '🇹🇳', buy: 500, sell: 540 },
	{ code: 'DZD', name: 'Algerian Dinar', flag: '🇩🇿', buy: 11, sell: 12.5 },
	{ code: 'ETB', name: 'Ethiopian Birr', flag: '🇪🇹', buy: 28, sell: 32 },
	{ code: 'ILS', name: 'Israeli New Shekel', flag: '🇮🇱', buy: 420, sell: 450 },
	{ code: 'QAR', name: 'Qatari Riyal', flag: '🇶🇦', buy: 430, sell: 450 },
	{ code: 'KWD', name: 'Kuwaiti Dinar', flag: '🇰🇼', buy: 5150, sell: 5350 },
	{ code: 'BHD', name: 'Bahraini Dinar', flag: '🇧🇭', buy: 4180, sell: 4350 },
	{ code: 'OMR', name: 'Omani Rial', flag: '🇴🇲', buy: 4100, sell: 4300 },
];

interface KVStore {
	get(key: string, type: 'json'): Promise<any>;
	put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
}

export interface Env {
	GROQ_API_KEY?: string;
	OPENROUTER_API_KEY?: string;
	GEMINI_API_KEY?: string;
	GEMINI_MODEL?: string;
	GEMINI_MODELS?: string;
	GROQ_MODEL?: string;
	GROQ_MODELS?: string;
	OPENROUTER_MODEL?: string;
	OPENROUTER_MODELS?: string;
	OPENROUTER_SITE_URL?: string;
	OPENROUTER_APP_NAME?: string;
	MANSA_API_KEY?: string;
	HISTORY?: KVStore;
}

type ParsedAiResponse = {
	rates?: Array<{ code: string; buy?: number; sell?: number; official?: number }>;
	sources?: string[];
};

const CORS_HEADERS = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'GET, OPTIONS',
	'Access-Control-Allow-Headers': 'Content-Type',
};

function jsonResponse(data: unknown, status = 200): Response {
	return new Response(JSON.stringify(data), {
		status,
		headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
	});
}

async function fetchOfficialRates() {
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), 10000);
	try {
		const response = await fetch('https://open.exchangerate-api.com/v6/latest/USD', {
			signal: controller.signal,
		});
		if (!response.ok) throw new Error('API failed');
		const data: any = await response.json();
		return { rates: data.rates, usdToNgn: data.rates.NGN };
	} catch (e) {
		console.error('Failed to fetch official rates:', e);
		return null;
	} finally {
		clearTimeout(timeout);
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
			return JSON.parse(cleaned.slice(start, end + 1));
		}
		throw new Error('No JSON payload found in model response');
	}
}

async function fetchStreetRatesWithAI(
	apiUrl: string,
	apiKey: string,
	model: string,
	officialUsdToNgn: number,
	provider: string,
	env: Env,
): Promise<{ parsed: ParsedAiResponse; rawText: string }> {
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), 15000);

	const today = new Date().toLocaleDateString('en-US', {
		weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
	});

	const prompt = `Today is ${today}. Estimate current Nigerian naira (NGN) parallel/black market exchange rates.

Anchor: The live official USD/NGN rate today is ${officialUsdToNgn} (from exchangerate-api.com).
The Nigerian parallel market currently trades roughly 5–15% above the official rate.
Derive all other currency pairs mathematically:
  NGN_parallel = (USD_parallel_rate) ÷ (foreign_currency_per_USD)
For example, if USD parallel sell = X, then GBP parallel sell ≈ X × 1.27 (current GBP/USD cross).

Return ONLY valid JSON — no explanation, no markdown:
{"rates": [{"code":"USD","buy":XXXX,"sell":XXXX},...], "sources": ["NgnRates.com","AbokiFX"]}

Rules:
- Numbers only for buy/sell (no strings, no ₦ symbol).
- buy < sell for every pair.
- Include ONLY these codes:
USD, GBP, EUR, CAD, AUD, CNY, AED, SAR, CHF, JPY, ZAR, GHS, INR, XOF, KES, SGD, TRY, BRL, KRW, MYR, SEK, NOK, DKK, PLN, MXN, NZD, HKD, TWD, THB, IDR, PHP, VND, PKR, BDT, LKR, NPR, RUB, UAH, CZK, HUF, RON, BGN, ISK, ARS, CLP, COP, PEN, XAF, UGX, TZS, EGP, MAD, TND, DZD, ETB, ILS, QAR, KWD, BHD, OMR.`;

	try {
		const headers: Record<string, string> = {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${apiKey}`,
		};

		if (provider === 'OpenRouter') {
			headers['HTTP-Referer'] = env.OPENROUTER_SITE_URL || 'https://tomiabe.github.io/NairaWatch';
			headers['X-Title'] = env.OPENROUTER_APP_NAME || 'NairaWatch';
		}

		const response = await fetch(apiUrl, {
			method: 'POST',
			signal: controller.signal,
			headers,
			body: JSON.stringify({
				model,
				temperature: 0.1,
				max_tokens: 8192,
				...(model.startsWith('openai/gpt-oss') ? { reasoning_effort: 'low' } : {}),
				messages: [{ role: 'user', content: prompt }],
			}),
		});

		if (!response.ok) {
			const text = await response.text();
			throw new Error(`${provider} ${response.status}: ${text}`);
		}

		const data: any = await response.json();
		const rawText = data?.choices?.[0]?.message?.content;

		if (!rawText || typeof rawText !== 'string') {
			throw new Error(`${provider} returned empty completion content`);
		}

		return { parsed: extractJsonPayload(rawText), rawText };
	} finally {
		clearTimeout(timeout);
	}
}

function getGroqCandidates(env: Env) {
	const primary = env.GROQ_MODEL || DEFAULT_GROQ_MODEL;
	const extra = (env.GROQ_MODELS || '').split(',').map((m) => m.trim()).filter(Boolean);
	return Array.from(new Set([primary, ...extra, ...DEFAULT_GROQ_FALLBACK_MODELS]));
}

function getGeminiCandidates(env: Env) {
	const primary = env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL;
	const extra = (env.GEMINI_MODELS || '').split(',').map((m) => m.trim()).filter(Boolean);
	return Array.from(new Set([primary, ...extra, ...DEFAULT_GEMINI_FALLBACK_MODELS]));
}

function getOpenRouterCandidates(env: Env) {
	const primary = env.OPENROUTER_MODEL || DEFAULT_OPENROUTER_MODEL;
	const extra = (env.OPENROUTER_MODELS || '').split(',').map((m) => m.trim()).filter(Boolean);
	return Array.from(new Set([primary, ...extra, ...DEFAULT_OPENROUTER_FALLBACK_MODELS]));
}

type LiveQuote = { buy?: number; sell?: number };

// Real black-market quotes scraped from NgnRates.com. Quotes marked "Historical rate" are ignored.
async function fetchNgnRatesLive(): Promise<Record<string, LiveQuote> | null> {
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), 10000);
	try {
		const response = await fetch('https://ngnrates.com/', {
			signal: controller.signal,
			headers: { 'User-Agent': 'Mozilla/5.0 (compatible; NairaWatch/1.0)' },
		});
		if (!response.ok) throw new Error(`NgnRates ${response.status}`);
		const html = await response.text();
		const tokens = html
			.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, '')
			.replace(/<[^>]+>/g, '\n')
			.split('\n')
			.map((t) => t.replace(/&nbsp;/g, ' ').trim())
			.filter(Boolean);

		const parseNum = (s: string) => {
			const n = Number(s.replace(/,/g, ''));
			return Number.isFinite(n) && n > 0 ? n : undefined;
		};

		const out: Record<string, LiveQuote> = {};
		for (let i = 0; i < tokens.length; i++) {
			if (!/^[A-Z]{3,4}$/.test(tokens[i])) continue;
			const code = tokens[i] === 'RMB' ? 'CNY' : tokens[i];
			if (out[code]) continue;
			let sawBlackMarket = false;
			for (let j = i + 1; j < Math.min(i + 14, tokens.length); j++) {
				const t = tokens[j];
				if (t.startsWith('See ') || (j > i + 1 && /^[A-Z]{3,4}$/.test(t) && !['CBN', 'NGN'].includes(t))) break;
				if (t === 'CBN') break;
				if (t === 'Black Market') { sawBlackMarket = true; continue; }
				if (!sawBlackMarket) continue;
				if (/historical rate/i.test(t)) break;
				const m = t.match(/^([\d,.]+|—|-)\s*\/\s*([\d,.]+|—|-)$/);
				if (m) {
					// skip if the next few tokens flag it as a stale historical quote
					const stale = tokens.slice(j + 1, j + 5).some((x) => /historical rate/i.test(x));
					if (!stale) {
						const buy = parseNum(m[1]);
						const sell = parseNum(m[2]);
						if (buy || sell) out[code] = { buy, sell };
					}
					break;
				}
			}
		}
		return Object.keys(out).length > 0 ? out : null;
	} catch (e) {
		console.error('Failed to fetch NgnRates:', e);
		return null;
	} finally {
		clearTimeout(timeout);
	}
}

// Backup USD black-market quote from MansaAPI (P2P markets). Only used if NgnRates is unavailable.
async function fetchMansaUsd(apiKey: string): Promise<LiveQuote | null> {
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), 8000);
	try {
		const response = await fetch('https://mansaapi.com/api/v1/fx/rates?currency=NGN', {
			signal: controller.signal,
			headers: { Authorization: `Bearer ${apiKey}` },
		});
		if (!response.ok) throw new Error(`Mansa ${response.status}`);
		const data: any = await response.json();
		const c = data?.data?.consensus;
		const buy = Number(c?.parallel_buy);
		let sell = Number(c?.parallel_sell);
		if (!Number.isFinite(buy) || buy <= 0) return null;
		// Thin order books produce outlier sell prices, so cap the spread at 3%.
		if (!Number.isFinite(sell) || sell <= 0 || c?.confidence === 'thin' || sell > buy * 1.03) {
			sell = Math.round(buy * 1.01 * 100) / 100;
		}
		return { buy: Math.round(buy * 100) / 100, sell };
	} catch (e) {
		console.error('Failed to fetch Mansa:', e);
		return null;
	} finally {
		clearTimeout(timeout);
	}
}

// Luno public order book (USDT/NGN). Independent of NgnRates and Mansa. bid = buy, ask = sell.
async function fetchLunoUsd(): Promise<LiveQuote | null> {
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), 8000);
	try {
		const response = await fetch('https://api.luno.com/api/1/ticker?pair=USDTNGN', { signal: controller.signal });
		if (!response.ok) throw new Error(`Luno ${response.status}`);
		const data: any = await response.json();
		const buy = Number(data?.bid);
		const sell = Number(data?.ask);
		if (!Number.isFinite(buy) || !Number.isFinite(sell) || buy <= 0 || sell < buy) return null;
		return { buy: Math.round(buy * 100) / 100, sell: Math.round(sell * 100) / 100 };
	} catch (e) {
		console.error('Failed to fetch Luno:', e);
		return null;
	} finally {
		clearTimeout(timeout);
	}
}

// Mansa's free tier allows 100 calls/day, so cache its quote in KV for 35 minutes.
async function getMansaUsd(env: Env, needed: boolean): Promise<LiveQuote | null> {
	if (!env.MANSA_API_KEY) return null;
	const MAX_AGE = 35 * 60 * 1000;
	if (env.HISTORY) {
		try {
			const cached = await env.HISTORY.get('mansa', 'json');
			if (cached && Date.now() - cached.t < MAX_AGE) return cached.q;
		} catch (e) {
			console.error('Mansa cache read failed:', e);
		}
		const q = await fetchMansaUsd(env.MANSA_API_KEY);
		if (q) {
			try {
				await env.HISTORY.put('mansa', JSON.stringify({ t: Date.now(), q }));
			} catch (e) {
				console.error('Mansa cache write failed:', e);
			}
		}
		return q;
	}
	// No cache available: only spend a call when other sources are missing.
	return needed ? fetchMansaUsd(env.MANSA_API_KEY) : null;
}

const median = (nums: number[]): number => {
	const a = nums.filter((n) => Number.isFinite(n) && n > 0).sort((x, y) => x - y);
	if (a.length === 0) return 0;
	const m = Math.floor(a.length / 2);
	return a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2;
};

// ---- Rate history (real snapshots stored in KV) ----
type Snapshot = { t: number; r: Record<string, [number, number]> };
const HISTORY_KEEP_MS = 8 * 24 * 60 * 60 * 1000;

async function recordSnapshot(env: Env, rates: any[], minGapMs: number): Promise<void> {
	if (!env.HISTORY) return;
	try {
		const now = Date.now();
		const hist: Snapshot[] = (await env.HISTORY.get('history', 'json')) || [];
		const last = hist[hist.length - 1];
		if (last && now - last.t < minGapMs) return;
		const r: Record<string, [number, number]> = {};
		for (const rate of rates) {
			if (Number.isFinite(rate.buy) && Number.isFinite(rate.sell)) r[rate.code] = [rate.buy, rate.sell];
		}
		hist.push({ t: now, r });
		const trimmed = hist.filter((p) => now - p.t <= HISTORY_KEEP_MS);
		await env.HISTORY.put('history', JSON.stringify(trimmed));
	} catch (e) {
		console.error('Failed to record snapshot:', e);
	}
}

async function handleHistory(url: URL, env: Env): Promise<Response> {
	const period = url.searchParams.get('period') === '7d' ? '7d' : '24h';
	const windowMs = (period === '7d' ? 7 : 1) * 24 * 60 * 60 * 1000;
	let points: Snapshot[] = [];
	try {
		const hist: Snapshot[] = env.HISTORY ? (await env.HISTORY.get('history', 'json')) || [] : [];
		const cutoff = Date.now() - windowMs;
		points = hist.filter((p) => p.t >= cutoff);
	} catch (e) {
		console.error('History read failed:', e);
	}
	return new Response(JSON.stringify({ period, points }), {
		headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=300', ...CORS_HEADERS },
	});
}

async function computeRates(env: Env): Promise<any> {
		try {
			const groqKey = env.GROQ_API_KEY;
			const orKey = env.OPENROUTER_API_KEY;
			const geminiKey = env.GEMINI_API_KEY;

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
			let modelErrorSummary = '';

			const providersToTry: Array<{ provider: string; url: string; key: string; model: string }> = [];
			if (groqKey) {
				getGroqCandidates(env).forEach((m) =>
					providersToTry.push({ provider: 'Groq', url: GROQ_API_URL, key: groqKey, model: m }),
				);
			}
			if (geminiKey) {
				getGeminiCandidates(env).forEach((m) =>
					providersToTry.push({ provider: 'Gemini', url: GEMINI_API_URL, key: geminiKey, model: m }),
				);
			}
			if (orKey) {
				getOpenRouterCandidates(env).forEach((m) =>
					providersToTry.push({ provider: 'OpenRouter', url: OPENROUTER_API_URL, key: orKey, model: m }),
				);
			}

			let live = await fetchNgnRatesLive();
			const usdSources: Array<{ name: string; buy: number; sell: number }> = [];
			if (live?.USD?.buy && live?.USD?.sell) {
				usdSources.push({ name: 'NgnRates.com', buy: live.USD.buy, sell: live.USD.sell });
			}
			const luno = await fetchLunoUsd();
			if (luno) usdSources.push({ name: 'Luno', buy: luno.buy as number, sell: luno.sell as number });
			const mansa = await getMansaUsd(env, usdSources.length < 2);
			if (mansa) usdSources.push({ name: 'MansaAPI', buy: mansa.buy as number, sell: mansa.sell as number });
			if (usdSources.length > 0) {
				const mBuy = median(usdSources.map((x) => x.buy));
				const mSell = Math.max(median(usdSources.map((x) => x.sell)), mBuy);
				live = { ...(live || {}), USD: { buy: Math.round(mBuy * 100) / 100, sell: Math.round(mSell * 100) / 100 } };
			}

			// AI is only a fallback when live market data could not be fetched.
			if (!live && providersToTry.length > 0) {
				const failures: string[] = [];
				for (const { provider, url, key, model } of providersToTry) {
					try {
						const { parsed, rawText } = await fetchStreetRatesWithAI(
							url, key, model, officialUsdToNgn, provider, env,
						);
						aiParsed = parsed;
						isFallback = false;
						sources.push(`${provider} (${model})`);

						const modelSources = parsed.sources || [];
						if (modelSources.length > 0) sources.push(...modelSources);

						const lowered = rawText.toLowerCase();
						if (lowered.includes('ngnrates')) sources.push('NgnRates.com');
						if (lowered.includes('abokifx')) sources.push('AbokiFX');
						break;
					} catch (err: any) {
						const msg = String(err?.message || err);
						console.error(`${provider} failed (${model}):`, msg);
						failures.push(`${model}: ${msg}`);
						if (msg.includes('429')) quotaError = true;
					}
				}
				if (isFallback && failures.length > 0) {
					modelErrorSummary = failures.slice(0, 2).join(' | ');
				}
			}

			let dataQuality: 'live' | 'estimate' = 'estimate';
			if (live) {
				const round2 = (n: number) => Math.round(n * 100) / 100;
				const usdOfficial = mergedRates.find((r) => r.code === 'USD')?.official || officialUsdToNgn;
				const usd = live.USD;
				const clamp = (p: number) => Math.min(Math.max(p, 0), 0.25);
				const buyPrem = usd?.buy ? clamp(usd.buy / usdOfficial - 1) : 0.04;
				const sellPrem = usd?.sell ? clamp(usd.sell / usdOfficial - 1) : 0.06;
				const spread = usd?.buy && usd?.sell ? usd.sell / usd.buy : 1.01;
				mergedRates = mergedRates.map((rate) => {
					const q = live[rate.code];
					const now = new Date().toISOString();
					if (q && (q.buy || q.sell)) {
						const buy = q.buy ?? round2((q.sell as number) / spread);
						const sell = q.sell ?? round2((q.buy as number) * spread);
						return { ...rate, buy, sell, quality: 'live', lastUpdated: now };
					}
					if (rate.official) {
						return {
							...rate,
							buy: round2(rate.official * (1 + buyPrem)),
							sell: round2(rate.official * (1 + sellPrem)),
							quality: 'derived',
							lastUpdated: now,
						};
					}
					return { ...rate, quality: 'estimate' };
				});
				isFallback = false;
				dataQuality = 'live';
				sources.push(...usdSources.map((x) => `${x.name} (USD)`));
				if (live.EUR || live.GBP) sources.push('NgnRates.com (live black-market quotes)');
			} else mergedRates = mergedRates.map((rate) => {
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

			return ({
				rates: mergedRates,
				sources: Array.from(new Set(sources)),
				isFallback,
				dataQuality,
				liveCurrencies: live ? Object.keys(live) : [],
				usdSources,
				error: quotaError
					? `API rate limit reached. Using smart estimates.${modelErrorSummary ? ` ${modelErrorSummary}` : ''}`
					: modelErrorSummary || null,
			});
		} catch (err: any) {
			console.error('Handler error:', err);
			return ({
				rates: FALLBACK_RATES,
				sources: ['Offline Estimates'],
				isFallback: true,
				error: err instanceof Error ? err.message : 'Internal Error',
			});
		}
}

export default {
	async fetch(request: Request, env: Env, ctx?: { waitUntil(p: Promise<unknown>): void }): Promise<Response> {
		if (request.method === 'OPTIONS') {
			return new Response(null, { headers: CORS_HEADERS });
		}
		const url = new URL(request.url);
		if (url.pathname.endsWith('/history')) return handleHistory(url, env);

		const data = await computeRates(env);
		if (!data.isFallback && ctx) ctx.waitUntil(recordSnapshot(env, data.rates, 55 * 60 * 1000));
		return jsonResponse(data);
	},

	async scheduled(_event: unknown, env: Env, ctx: { waitUntil(p: Promise<unknown>): void }): Promise<void> {
		const data = await computeRates(env);
		if (!data.isFallback) ctx.waitUntil(recordSnapshot(env, data.rates, 10 * 60 * 1000));
	},
};
