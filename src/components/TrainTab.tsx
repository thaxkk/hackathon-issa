'use client'

import { useState } from 'react'
import { improveAI, ChatMessage } from '@/lib/api'

type Status = 'idle' | 'loading' | 'success' | 'error'

function DiffView({ before, after }: { before: string; after: string }) {
  // Simple word-level diff visualization
  const beforeWords = before.split(' ')
  const afterWords = after.split(' ')

  return (
    <div className="space-y-3">
      <div className="rounded-xl p-4 text-sm leading-relaxed"
        style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full" style={{ background: '#ef4444' }} />
          <span className="text-xs font-medium" style={{ color: '#ef4444' }}>Predicted AI Reply</span>
        </div>
        <p style={{ color: '#C8D8EC' }}>{before}</p>
      </div>

      <div className="flex justify-center">
        <div className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-full"
          style={{ background: 'rgba(245,166,35,0.08)', color: '#F5A623', border: '1px solid rgba(245,166,35,0.15)' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12l7 7 7-7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Prompt Updated
        </div>
      </div>

      <div className="rounded-xl p-4 text-sm leading-relaxed"
        style={{ background: 'rgba(0,201,167,0.06)', border: '1px solid rgba(0,201,167,0.2)' }}>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#00C9A7' }} />
          <span className="text-xs font-medium" style={{ color: '#00C9A7' }}>Real Consultant Reply (Ground Truth)</span>
        </div>
        <p style={{ color: '#C8D8EC' }}>{after}</p>
      </div>
    </div>
  )
}

export default function TrainTab() {
  const [clientMsg, setClientMsg] = useState('')
  const [consultantReply, setConsultantReply] = useState('')
  const [historyRaw, setHistoryRaw] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [result, setResult] = useState<{ predictedReply: string; updatedPrompt: string } | null>(null)
  const [error, setError] = useState('')

  const parseHistory = (): ChatMessage[] => {
    if (!historyRaw.trim()) return []
    try {
      return JSON.parse(historyRaw)
    } catch {
      return []
    }
  }

  const handleSubmit = async () => {
    if (!clientMsg.trim() || !consultantReply.trim()) return
    setStatus('loading')
    setResult(null)
    setError('')

    try {
      const res = await improveAI(clientMsg, parseHistory(), consultantReply)
      if (res.error) throw new Error(res.error)
      setResult(res)
      setStatus('success')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Unknown error')
      setStatus('error')
    }
  }

  const examples = [
    {
      client: "I'm American and currently in Bali. Can I apply from Indonesia?",
      consultant: "Yes, absolutely! You can apply at the Thai Embassy in Jakarta. I'd recommend scheduling an appointment soon as slots fill up quickly."
    },
    {
      client: "How much does the DTV visa cost?",
      consultant: "The DTV is 10,000 THB for 5 years! Pretty good deal for long-term remote workers 😊 Want me to walk you through what's included?"
    },
  ]

  return (
    <div className="h-[calc(100vh-73px)] overflow-y-auto">
      <div className="max-w-3xl mx-auto px-4 sm:px-8 py-8 space-y-6">

        {/* Header */}
        <div className="animate-fade-up stagger-1">
          <h2 className="text-2xl mb-1" style={{ fontFamily: 'var(--font-display)', color: '#E8F0FA' }}>
            Train the AI
          </h2>
          <p className="text-sm" style={{ color: '#4A6280' }}>
            Feed real consultant conversations to improve the AI's responses over time.
          </p>
        </div>

        {/* Quick fill examples */}
        <div className="animate-fade-up stagger-2">
          <p className="text-xs mb-2" style={{ color: '#4A6280' }}>Quick examples:</p>
          <div className="flex gap-2 flex-wrap">
            {examples.map((ex, i) => (
              <button
                key={i}
                onClick={() => { setClientMsg(ex.client); setConsultantReply(ex.consultant) }}
                className="text-xs px-3 py-1.5 rounded-full transition-all duration-200 hover:scale-105"
                style={{ background: 'rgba(245,166,35,0.08)', color: '#F5A623', border: '1px solid rgba(245,166,35,0.2)' }}
              >
                Example {i + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="space-y-4 animate-fade-up stagger-3">
          <div>
            <label className="text-xs font-medium mb-2 block" style={{ color: '#C8D8EC' }}>
              Client Message *
            </label>
            <textarea
              value={clientMsg}
              onChange={e => setClientMsg(e.target.value)}
              rows={3}
              placeholder="The client's exact message..."
              className="w-full rounded-xl px-4 py-3 text-sm outline-none resize-none transition-all"
              style={{
                background: 'rgba(17,24,39,0.7)',
                border: '1px solid rgba(30,45,69,0.9)',
                color: '#E8F0FA',
                fontFamily: 'var(--font-body)',
              }}
              onFocus={e => e.target.style.borderColor = 'rgba(245,166,35,0.4)'}
              onBlur={e => e.target.style.borderColor = 'rgba(30,45,69,0.9)'}
            />
          </div>

          <div>
            <label className="text-xs font-medium mb-2 block" style={{ color: '#C8D8EC' }}>
              Real Consultant Reply *
              <span className="ml-2 text-xs font-normal" style={{ color: '#4A6280' }}>Ground truth for learning</span>
            </label>
            <textarea
              value={consultantReply}
              onChange={e => setConsultantReply(e.target.value)}
              rows={3}
              placeholder="How the real consultant responded..."
              className="w-full rounded-xl px-4 py-3 text-sm outline-none resize-none transition-all"
              style={{
                background: 'rgba(17,24,39,0.7)',
                border: '1px solid rgba(30,45,69,0.9)',
                color: '#E8F0FA',
                fontFamily: 'var(--font-body)',
              }}
              onFocus={e => e.target.style.borderColor = 'rgba(0,201,167,0.4)'}
              onBlur={e => e.target.style.borderColor = 'rgba(30,45,69,0.9)'}
            />
          </div>

          <div>
            <label className="text-xs font-medium mb-2 block" style={{ color: '#C8D8EC' }}>
              Chat History
              <span className="ml-2 text-xs font-normal" style={{ color: '#4A6280' }}>Optional — JSON array</span>
            </label>
            <textarea
              value={historyRaw}
              onChange={e => setHistoryRaw(e.target.value)}
              rows={3}
              placeholder='[{"role": "consultant", "message": "Hi there!"}]'
              className="w-full rounded-xl px-4 py-3 text-sm outline-none resize-none font-mono transition-all"
              style={{
                background: 'rgba(17,24,39,0.7)',
                border: '1px solid rgba(30,45,69,0.9)',
                color: '#E8F0FA',
                fontSize: '11px',
              }}
              onFocus={e => e.target.style.borderColor = 'rgba(30,45,69,1)'}
              onBlur={e => e.target.style.borderColor = 'rgba(30,45,69,0.9)'}
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={status === 'loading' || !clientMsg.trim() || !consultantReply.trim()}
            className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 hover:scale-[1.01] disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center gap-2"
            style={{
              background: status === 'loading'
                ? 'rgba(245,166,35,0.3)'
                : 'linear-gradient(135deg, #F5A623, #E8981C)',
              color: status === 'loading' ? '#F5A623' : '#0A0F1E',
            }}
          >
            {status === 'loading' ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                Analyzing & Updating Prompt...
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Train AI with This Example
              </>
            )}
          </button>
        </div>

        {/* Error */}
        {status === 'error' && (
          <div className="rounded-xl px-4 py-3 text-sm animate-fade-up"
            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5' }}>
            ⚠️ {error}
          </div>
        )}

        {/* Results */}
        {status === 'success' && result && (
          <div className="space-y-4 animate-fade-up">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(0,201,167,0.2)' }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#00C9A7" strokeWidth="3">
                  <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="text-sm font-medium" style={{ color: '#00C9A7' }}>
                Prompt updated successfully
              </span>
            </div>

            <DiffView before={result.predictedReply} after={consultantReply} />

            <div>
              <p className="text-xs font-medium mb-2" style={{ color: '#4A6280' }}>Updated Prompt (saved to DB)</p>
              <div className="rounded-xl p-4 text-xs font-mono leading-relaxed overflow-auto max-h-48"
                style={{
                  background: 'rgba(10,15,30,0.8)',
                  border: '1px solid rgba(30,45,69,0.8)',
                  color: '#C8D8EC',
                }}>
                {result.updatedPrompt}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
