# Issa Compass — AI Visa Assistant 🧭

A self-learning AI customer support assistant for Thailand DTV visa inquiries. Built for the Issa Compass Vibe Hackathon.

**Live Demo:** [hackathon-issa-ui.vercel.app](https://hackathon-issa-ui.vercel.app)  
**API:** [hackathon-issa-production.up.railway.app](https://hackathon-issa-production.up.railway.app)

---

## What It Does

Clients asking about DTV visas get instant, human-like replies — not robotic AI responses. The system learns from real consultant conversations, automatically improving its own behavior over time.

- Responds to client messages in a casual, friendly tone
- Self-improves by comparing AI replies against real consultant replies
- Prompt updates are stored in Supabase and take effect immediately — no redeployment needed

---

## Architecture

```
Client (Next.js on Vercel)
        ↓
Express API (Railway)
        ↓
Groq LLaMA 3.3 70B  ←→  Supabase (prompt storage)
```

---

## API Endpoints

### `POST /generate-reply`
Generate an AI response based on conversation context.

```bash
curl -X POST https://hackathon-issa-production.up.railway.app/generate-reply \
  -H "Content-Type: application/json" \
  -d '{
    "clientSequence": "Hi I want DTV visa, I am American",
    "chatHistory": []
  }'
```

```json
{ "aiReply": "Hey! As an American you're eligible for the DTV..." }
```

---

### `POST /improve-ai`
Auto-improve the AI prompt by comparing predicted vs actual consultant reply.

```bash
curl -X POST https://hackathon-issa-production.up.railway.app/improve-ai \
  -H "Content-Type: application/json" \
  -d '{
    "clientSequence": "Can I apply from Bali?",
    "chatHistory": [],
    "consultantReply": "Yes! Indonesia works great, takes about 10 business days."
  }'
```

```json
{
  "predictedReply": "You can apply from Bali...",
  "updatedPrompt": "You are a helpful visa consultant..."
}
```

---

### `POST /improve-ai-manually`
Update the AI prompt with plain English instructions.

```bash
curl -X POST https://hackathon-issa-production.up.railway.app/improve-ai-manually \
  -H "Content-Type: application/json" \
  -d '{ "instructions": "Always ask for nationality early in the conversation" }'
```

```json
{ "updatedPrompt": "You are a helpful visa consultant..." }
```

---

## UI Features

| Tab | Description |
|-----|-------------|
| 💬 Chat | Live chat interface with AI replies |
| 🧠 Train AI | Feed real consultant examples — shows predicted vs actual reply diff |
| ⚙️ Prompt | Edit AI behavior with natural language + quick preset buttons |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, Tailwind CSS, TypeScript |
| Backend | Node.js, Express |
| AI | Groq API (LLaMA 3.3 70B) |
| Database | Supabase (prompt versioning) |
| Deploy | Vercel (UI) + Railway (API) |

---

## Local Setup

```bash
# Clone the repo
git clone https://github.com/thaxkk/hackathon-issa.git
cd hackathon-issa

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Fill in: GROQ_API_KEY, SUPABASE_URL, SUPABASE_ANON_KEY

# Run Express API
node server.js

# In another terminal, run Next.js UI
# Set NEXT_PUBLIC_API_URL=http://localhost:4000 in .env.local
npm run dev
```

---

## Environment Variables

| Variable | Used By | Description |
|----------|---------|-------------|
| `GROQ_API_KEY` | API server | Groq API key for LLaMA |
| `SUPABASE_URL` | API server | Supabase project URL |
| `SUPABASE_ANON_KEY` | API server | Supabase anon key |
| `NEXT_PUBLIC_API_URL` | Next.js UI | Railway backend URL |

---

## How Self-Learning Works

1. Client sends a message
2. AI generates a reply using the current prompt from Supabase
3. A real consultant reply is provided as ground truth
4. A second AI call compares the two replies and surgically updates the prompt
5. The new prompt is saved to Supabase — all future replies immediately improve

```
Client message
      ↓
AI reply (predicted)     Real consultant reply (ground truth)
      ↓                           ↓
      └──────── Gap Analysis ──────┘
                    ↓
           Updated Prompt → Saved to Supabase
                    ↓
         All future replies are better
```
