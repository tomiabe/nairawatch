# NairaWatch 🇳🇬

Real-time parallel market (black market) exchange rates for Nigerian Naira, powered by Gemini AI with search grounding.

## 🚀 How to Run on Your PC

To run this project locally with live AI rates, follow these steps:

### 1. Setup
Install all dependencies (including the Vercel tools):
```bash
npm install
```

### 2. Start Developing
Run the following command to start both the frontend and the AI-powered backend:
```bash
npm run dev:live
```
*Note: The first time you run this, it will prompt you to link the project to Vercel. You can simply accept the defaults.*

## 🛠️ Tech Stack
- **Frontend**: React, Vite, Tailwind CSS (Vanilla CSS focus)
- **Backend**: Vercel Serverless Functions
- **AI**: Google Gemini (with search grounding in NgnRates.com, AbokiFX, etc.)

## 🔑 Environment Variables
You will need a `GEMINI_API_KEY` from [Google AI Studio](https://aistudio.google.com/).
A `.env.local` file has been prepared for you.

---
Built by [Tomi Abe Studio](https://studio.tomiabe.com).
