import { GoogleGenerativeAI } from "@google/generative-ai";

const FALLBACK_RATES = [...]; // your INITIAL_RATES

export const handler = async () => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) throw new Error("Missing API key");

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `...`; // your JSON prompt for rates

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
