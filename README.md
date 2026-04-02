# Issa Compass UI 🧭

Next.js frontend for the Issa Compass AI assistant console.

## Features

- **Chat Tab** — Simulate client conversations with AI replies
- **Train AI Tab** — Feed real consultant examples to improve the AI's prompt automatically
- **Prompt Tab** — Manually edit the AI prompt with natural language instructions + quick presets

## Setup

```bash
# Install dependencies
npm install

# Copy env file
cp .env.example .env.local

# Fill in your Railway backend URL
# NEXT_PUBLIC_API_URL=https://your-app.up.railway.app

# Run dev server
npm run dev
```

Open [http://localhost:3001](http://localhost:3001)

## Deploy to Vercel

```bash
npx vercel
# Set NEXT_PUBLIC_API_URL environment variable in Vercel dashboard
```

## Project Structure

```
src/
  app/
    globals.css       # Global styles, fonts, animations
    layout.tsx        # Root layout
    page.tsx          # Main page with tab navigation
  components/
    ChatTab.tsx       # Chat interface
    TrainTab.tsx      # AI training with diff view
    PromptTab.tsx     # Manual prompt editor
  lib/
    api.ts            # API client for Railway backend
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Your Railway backend URL |
