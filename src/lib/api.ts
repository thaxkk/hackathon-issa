const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

export interface ChatMessage {
  role: 'client' | 'consultant'
  message: string
}

export interface GenerateReplyResponse {
  aiReply: string
  error?: string
}

export interface ImproveAIResponse {
  predictedReply: string
  updatedPrompt: string
  error?: string
}

export interface ImproveManuallyResponse {
  updatedPrompt: string
  error?: string
}

export async function generateReply(
  clientSequence: string,
  chatHistory: ChatMessage[]
): Promise<GenerateReplyResponse> {
  const res = await fetch(`${API_URL}/generate-reply`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ clientSequence, chatHistory }),
  })
  return res.json()
}

export async function improveAI(
  clientSequence: string,
  chatHistory: ChatMessage[],
  consultantReply: string
): Promise<ImproveAIResponse> {
  const res = await fetch(`${API_URL}/improve-ai`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ clientSequence, chatHistory, consultantReply }),
  })
  return res.json()
}

export async function improveManually(
  instructions: string
): Promise<ImproveManuallyResponse> {
  const res = await fetch(`${API_URL}/improve-ai-manually`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ instructions }),
  })
  return res.json()
}
