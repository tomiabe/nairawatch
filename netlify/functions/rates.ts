import { GoogleGenerativeAI } from "@google/generative-ai";

const FALLBACK_RATES = [
  { code: "USD", name: "US Dollar", flag: "🇺🇸", buy: 1600, sell: 1615 },
  { code: "GBP", name: "British Pound", flag: "🇬🇧", buy: 2050, sell: 2080 },
  { code: "EUR", name: "Euro", flag: "🇪🇺", buy: 1720, sell: 1750 },
  { code: "CAD", name: "Canadian Dollar", flag: "🇨🇦", buy: 1150, sell: 1180 },
  { code: "AUD", name: "Australian Dollar", flag: "🇦🇺", buy: 1050, sell: 1080 },
  { code: "CNY", name: "Chinese Yuan", flag: "🇨🇳", buy: 220, sell: 235 },
  { code: "AED", name: "UAE Dirham", flag: "🇦🇪", buy: 430, sell: 445 },
  { code: "SAR", name: "Saudi Riyal", flag: "🇸🇦", buy: 420, sell: 435 },
  { code: "CHF", name: "Swiss Franc", flag: "🇨🇭", buy: 1750, sell: 1780 },
  { code: "JPY", name: "Japanese Yen", flag: "🇯🇵", buy: 10.5, sell: 11.5 },
  { code: "ZAR", name: "South African Rand", flag: "🇿🇦", buy: 85, sell: 95 },
  { code: "GHS", name: "Ghanaian Cedi", flag: "🇬🇭", buy: 95, sell: 105 },
  { code: "INR", name: "Indian Rupee", flag: "🇮🇳", buy: 18, sell: 20 },
  { code: "XOF", name: "CFA Franc", flag: "🇧🇯", buy: 2.4, sell: 2.8 },
  { code: "KES", name: "Kenyan Shilling", flag: "🇰🇪", buy: 12, sell: 13 },
  { code: "SGD", name: "Singapore Dollar", flag: "🇸🇬", buy: 1180, sell: 1210 },
  { code: "TRY", name: "Turkish Lira", flag: "🇹🇷", buy: 45, sell: 48 },
  { code: "BRL", name: "Brazilian Real", flag: "🇧🇷", buy: 280, sell: 300 },
  { code: "KRW", name: "South Korean Won", flag: "🇰🇷", buy: 1.1, sell: 1.3 },
  { code: "MYR", name: "Malaysian Ringgit", flag: "🇲🇾", buy: 350, sell: 370 },
];

export const handler = async () => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) throw new Error("Missing API key");

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
Return ONLY valid JSON. No explanations.

Get the current Nigerian black market (parallel market) exchange rates for NGN.

Format exactly:
{
  "rates": [
    { "code": "USD", "buy": 1600, "sell": 1620, "official": 1550 }
  ]
}

Currencies:
USD, GBP, EUR, CAD, AUD, CNY, AED, SAR, CHF, JPY, ZAR, GHS, INR, XOF, KES, SGD, TRY, BRL, KRW, MYR.

Sources:
- @naira_rates (Twitter)
- AbokiFX
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const parsed = JSON.parse(text);

    const mergedRates = FALLBACK_RATES.map((base) => {
      const found = parsed.rates?.find((r: any) => r.code === base.code);
      return found
        ? { ...base, buy: found.buy, sell: found.sell, official: found.official }
        : base;
    });

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rates: mergedRates,
        sources: ["naira_rates", "AbokiFX"],
        isFallback: false,
      }),
    };
  } catch (err) {
    console.error("Rates function error:", err);
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
  }
};
