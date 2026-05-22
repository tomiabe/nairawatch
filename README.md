<div align="center">

# NairaWatch

**Real-time Nigerian parallel market exchange rates**

[![Live Site](https://img.shields.io/badge/Live%20Site-tomiabe.github.io%2Fnairawatch-0ea5e9?style=flat-square)](https://tomiabe.github.io/nairawatch/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](#)

</div>

---

NairaWatch tracks the parallel (street) market exchange rates between the Nigerian Naira and 60+ world currencies. Rates are fetched and estimated using AI-assisted analysis, cross-referenced against official exchange data.

## Features

- Live buy/sell rates for 60+ currencies against the Naira
- Official CBN rate comparison alongside street market rates
- Region filters (Americas, Europe, Africa, Middle East, Asia-Pacific)
- Dark mode
- Mobile-friendly

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, TypeScript, Vite, Tailwind CSS |
| API | Cloudflare Workers |
| AI | Groq (LLaMA) with OpenRouter fallback |
| Hosting | GitHub Pages |

## Running Locally

**Prerequisites:** Node.js 18+, a [Cloudflare account](https://cloudflare.com) (free), a [Groq API key](https://console.groq.com) (free)

```bash
# Install dependencies
npm install

# Start the API worker locally (port 8787)
npx wrangler dev

# In a separate terminal, start the frontend
npm run dev
```

The frontend proxies `/api` requests to the local worker automatically.

## Contributing

Issues and pull requests are welcome. Please open an issue first to discuss significant changes.

---

Built by [Tomi Abe Studio](https://studio.tomiabe.com)
