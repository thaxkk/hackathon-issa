require("dotenv").config();
const express = require("express");
const cors = require("cors");
const Groq = require("groq-sdk");
const { createClient } = require("@supabase/supabase-js");

const app = express();
app.use(cors());
app.use(express.json());

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// ─── Helper: call Groq ────────────────────────────────────────────────────────
async function callGroq(systemPrompt, userMessage) {
  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ],
    max_tokens: 1000,
  });
  return response.choices[0].message.content.trim();
}

// ─── Helper: get latest prompt from Supabase ─────────────────────────────────
async function getPrompt() {
  const { data, error } = await supabase
    .from("ai_prompt")
    .select("prompt")
    .order("updated_at", { ascending: false })
    .limit(1)
    .single();

  if (error) throw new Error("Failed to fetch prompt: " + error.message);
  return data.prompt;
}

// ─── Helper: save updated prompt to Supabase ─────────────────────────────────
async function savePrompt(newPrompt) {
  const { error } = await supabase
    .from("ai_prompt")
    .insert({ prompt: newPrompt });

  if (error) throw new Error("Failed to save prompt: " + error.message);
}

// ─── Helper: format chat history ─────────────────────────────────────────────
function formatHistory(chatHistory = []) {
  return chatHistory
    .map((m) => `(${m.role.toUpperCase()}) ${m.message}`)
    .join("\n");
}

// ─── Helper: parse JSON from LLM response ────────────────────────────────────
function parseJSON(raw) {
  const clean = raw.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /generate-reply
// ─────────────────────────────────────────────────────────────────────────────
app.post("/generate-reply", async (req, res) => {
  try {
    const { clientSequence, chatHistory = [] } = req.body;
    if (!clientSequence)
      return res.status(400).json({ error: "clientSequence is required" });

    const systemPrompt = await getPrompt();
    const historyText = formatHistory(chatHistory);

    const userMessage = `
CHAT HISTORY:
${historyText || "(no prior history)"}

CLIENT MESSAGE:
${clientSequence}

Reply as the consultant. Return JSON only: {"reply": "your reply here"}
`.trim();

    const raw = await callGroq(systemPrompt, userMessage);
    const parsed = parseJSON(raw);

    res.json({ aiReply: parsed.reply });
  } catch (err) {
    console.error("/generate-reply error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /improve-ai
// ─────────────────────────────────────────────────────────────────────────────
app.post("/improve-ai", async (req, res) => {
  try {
    const { clientSequence, chatHistory = [], consultantReply } = req.body;
    if (!clientSequence || !consultantReply)
      return res
        .status(400)
        .json({ error: "clientSequence and consultantReply are required" });

    const currentPrompt = await getPrompt();
    const historyText = formatHistory(chatHistory);

    // Step 1: Generate predicted reply
    const predictedRaw = await callGroq(
      currentPrompt,
      `CHAT HISTORY:\n${historyText || "(none)"}\n\nCLIENT MESSAGE:\n${clientSequence}\n\nReply as the consultant. Return JSON only: {"reply": "your reply here"}`
    );
    const predictedReply = parseJSON(predictedRaw).reply;

    // Step 2: Editor prompt
    const editorMessage = `
You are an AI prompt editor. Improve this chatbot prompt by analyzing the gap between the predicted and real consultant reply.

EXISTING PROMPT:
${currentPrompt}

CLIENT MESSAGE:
${clientSequence}

CHAT HISTORY:
${historyText || "(none)"}

REAL CONSULTANT REPLY:
${consultantReply}

PREDICTED AI REPLY:
${predictedReply}

Analyze differences in tone, accuracy, and style. Surgically update only what needs changing. Return JSON only: {"prompt": "updated prompt here"}
`.trim();

    const editorRaw = await callGroq("You are an expert AI prompt engineer.", editorMessage);
    const updatedPrompt = parseJSON(editorRaw).prompt;

    await savePrompt(updatedPrompt);

    res.json({ predictedReply, updatedPrompt });
  } catch (err) {
    console.error("/improve-ai error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /improve-ai-manually
// ─────────────────────────────────────────────────────────────────────────────
app.post("/improve-ai-manually", async (req, res) => {
  try {
    const { instructions } = req.body;
    if (!instructions)
      return res.status(400).json({ error: "instructions is required" });

    const currentPrompt = await getPrompt();

    const editorMessage = `
You are an AI prompt editor. Update this chatbot prompt based on the instructions.

CURRENT PROMPT:
${currentPrompt}

INSTRUCTIONS:
${instructions}

Apply precisely and surgically. Return JSON only: {"prompt": "updated prompt here"}
`.trim();

    const raw = await callGroq("You are an expert AI prompt engineer.", editorMessage);
    const updatedPrompt = parseJSON(raw).prompt;

    await savePrompt(updatedPrompt);

    res.json({ updatedPrompt });
  } catch (err) {
    console.error("/improve-ai-manually error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── Health check ─────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Issa Compass AI is running 🧭" });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});