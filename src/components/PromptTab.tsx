'use client'

import { useState } from 'react'
import { improveManually } from '@/lib/api'

type Status = 'idle' | 'loading' | 'success' | 'error'

const PRESET_INSTRUCTIONS = [
  { label: 'More Concise', icon: '✂️', instruction: 'Be more concise. Keep replies under 3 sentences unless more detail is truly needed.' },
  { label: 'More Emoji', icon: '😊', instruction: 'Add more emoji to replies to make them feel warm and casual, like a friendly DM.' },
  { label: 'Proactive Booking', icon: '📅', instruction: 'Always proactively mention appointment booking when discussing embassy visits or applications.' },
  { label: 'Thai Phrases', icon: '🇹🇭', instruction: 'Occasionally use friendly Thai phrases like "Sawadee ka/krub" and "Khop khun ka/krub" naturally.' },
  { label: 'Ask Nationality', icon: '🌍', instruction: 'Always ask for the client\'s nationality early in the conversation as it affects visa requirements.' },
  { label: 'Less Formal', icon: '💬', instruction: 'Make the tone less formal and more like chatting with a helpful friend, not a corporate assistant.' },
]

export default function PromptTab() {
  const [instructions, setInstructions] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [updatedPrompt, setUpdatedPrompt] = useState('')
  const [error, setError] = useState('')
  const [history, setHistory] = useState<{ instruction: string; prompt: string; time: Date }[]>([])

  const handleSubmit = async () => {
    if (!instructions.trim() || status === 'loading') return
    setStatus('loading')
    setError('')

    try {
      const res = await improveManually(instructions)
      if (res.error) throw new Error(res.error)
      setUpdatedPrompt(res.updatedPrompt)
      setHistory(prev => [{ instruction: instructions, prompt: res.updatedPrompt, time: new Date() }, ...prev.slice(0, 4)])
      setStatus('success')
      setInstructions('')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Unknown error')
      setStatus('error')
    }
  }

  const formatTime = (d: Date) =>
    d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="h-[calc(100vh-73px)] overflow-y-auto">
      <div className="max-w-3xl mx-auto px-4 sm:px-8 py-8 space-y-6">

        {/* Header */}
        <div className="animate-fade-up stagger-1">
          <h2 className="text-2xl mb-1" style={{ fontFamily: 'var(--font-display)', color: '#E8F0FA' }}>
            Prompt Editor
          </h2>
          <p className="text-sm" style={{ color: '#4A6280' }}>
            Give direct instructions to surgically update the AI's behavior.
          </p>
        </div>

        {/* Preset chips */}
        <div className="animate-fade-up stagger-2">
          <p className="text-xs mb-3" style={{ color: '#4A6280' }}>Quick instructions:</p>
          <div className="flex flex-wrap gap-2">
            {PRESET_INSTRUCTIONS.map(p => (
              <button
                key={p.label}
                onClick={() => setInstructions(p.instruction)}
                className="text-xs px-3 py-2 rounded-full transition-all duration-200 hover:scale-105 flex items-center gap-1.5"
                style={{
                  background: 'rgba(30,45,69,0.5)',
                  border: '1px solid rgba(30,45,69,0.9)',
                  color: '#C8D8EC',
                }}
              >
                <span>{p.icon}</span>
                <span>{p.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Instruction input */}
        <div className="animate-fade-up stagger-3 space-y-3">
          <label className="text-xs font-medium block" style={{ color: '#C8D8EC' }}>
            Instructions
          </label>
          <textarea
            value={instructions}
            onChange={e => setInstructions(e.target.value)}
            rows={4}
            placeholder="Describe exactly how you want the AI to change its behavior, tone, or approach..."
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

          <button
            onClick={handleSubmit}
            disabled={status === 'loading' || !instructions.trim()}
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
                Updating Prompt...
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Apply Instructions
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

        {/* Updated prompt result */}
        {status === 'success' && updatedPrompt && (
          <div className="animate-fade-up space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(0,201,167,0.2)' }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#00C9A7" strokeWidth="3">
                    <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span className="text-sm font-medium" style={{ color: '#00C9A7' }}>
                  Prompt updated & saved
                </span>
              </div>
              <button
                onClick={() => navigator.clipboard.writeText(updatedPrompt)}
                className="text-xs px-3 py-1.5 rounded-full transition-all hover:scale-105"
                style={{ background: 'rgba(30,45,69,0.6)', color: '#4A6280', border: '1px solid rgba(30,45,69,0.9)' }}
              >
                Copy
              </button>
            </div>
            <div className="rounded-xl p-4 text-xs font-mono leading-relaxed overflow-auto max-h-56"
              style={{
                background: 'rgba(10,15,30,0.8)',
                border: '1px solid rgba(0,201,167,0.2)',
                color: '#C8D8EC',
              }}>
              {updatedPrompt}
            </div>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="animate-fade-up space-y-3">
            <p className="text-xs font-medium" style={{ color: '#4A6280' }}>Recent updates this session</p>
            {history.map((h, i) => (
              <div key={i} className="rounded-xl p-4 space-y-2"
                style={{ background: 'rgba(17,24,39,0.5)', border: '1px solid rgba(30,45,69,0.6)' }}>
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium" style={{ color: '#F5A623' }}>"{h.instruction.slice(0, 60)}{h.instruction.length > 60 ? '…' : ''}"</p>
                  <span className="text-xs" style={{ color: '#2A3F5F' }}>{formatTime(h.time)}</span>
                </div>
                <p className="text-xs leading-relaxed line-clamp-2" style={{ color: '#4A6280' }}>
                  {h.prompt.slice(0, 120)}…
                </p>
                <button
                  onClick={() => setUpdatedPrompt(h.prompt)}
                  className="text-xs" style={{ color: '#4A6280' }}>
                  View full prompt →
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
