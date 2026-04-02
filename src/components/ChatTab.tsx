'use client'

import { useState, useRef, useEffect } from 'react'
import { generateReply, ChatMessage } from '@/lib/api'

interface Message {
  id: string
  role: 'client' | 'ai'
  text: string
  timestamp: string // ISO string
}

export default function ChatTab() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'ai',
      text: "Sawadee ka! 🙏 I'm your Issa Compass assistant. Ask me anything about the DTV visa — I'm here to help you make Thailand home.",
      timestamp: new Date().toISOString(),
    }
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([])
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const handleSend = async () => {
    const text = input.trim()
    if (!text || isTyping) return

    const clientMsg: Message = {
      id: Date.now().toString(),
      role: 'client',
      text,
      timestamp: new Date().toISOString(),
    }

    setMessages(prev => [...prev, clientMsg])
    setInput('')
    setIsTyping(true)

    try {
      const res = await generateReply(text, chatHistory)
      const aiText = res.aiReply || res.error || 'Something went wrong.'

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        text: aiText,
        timestamp: new Date().toISOString(),
      }])

      setChatHistory(prev => [
        ...prev,
        { role: 'client', message: text },
        { role: 'consultant', message: aiText },
      ])
    } catch {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        text: '⚠️ Could not connect to the server. Check your API URL.',
        timestamp: new Date().toISOString(),
      }])
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    // Auto-resize
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
  }

  const clearChat = () => {
    setMessages([{
      id: '0',
      role: 'ai',
      text: "Sawadee ka! 🙏 I'm your Issa Compass assistant. Ask me anything about the DTV visa — I'm here to help you make Thailand home.",
      timestamp: new Date().toISOString(),
    }])
    setChatHistory([])
  }

  const formatTime = (timestamp: string) => {
    const d = new Date(timestamp)
    // Use fixed locale and 24-hour format to avoid hydration mismatch
    return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })
  }

  return (
    <div className="flex flex-col h-[calc(100vh-73px)]">
      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 space-y-4"
        style={{ scrollbarGutter: 'stable' }}>
        
        {/* Suggested questions */}
        {messages.length === 1 && (
          <div className="animate-fade-up">
            <p className="text-xs mb-3 text-center" style={{ color: '#4A6280' }}>Try asking:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {[
                "What documents do I need for a DTV?",
                "Can I apply from Bali?",
                "How long does processing take?",
                "What's the cost of the DTV visa?",
              ].map(q => (
                <button
                  key={q}
                  onClick={() => setInput(q)}
                  className="text-xs px-3 py-2 rounded-full transition-all duration-200 hover:scale-105"
                  style={{
                    background: 'rgba(245,166,35,0.08)',
                    border: '1px solid rgba(245,166,35,0.2)',
                    color: '#F5A623',
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={msg.id}
            className={`flex animate-fade-up ${msg.role === 'client' ? 'justify-end' : 'justify-start'}`}
            style={{ animationDelay: `${i * 0.02}s` }}
          >
            {msg.role === 'ai' && (
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mr-3 mt-1"
                style={{ background: 'linear-gradient(135deg, #F5A623, #E8981C)' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="3" fill="white" />
                  <path d="M12 2v3M12 19v3M2 12h3M19 12h3" stroke="white" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
            )}

            <div className={`max-w-[75%] sm:max-w-[65%]`}>
              <div className={`px-4 py-3 text-sm leading-relaxed ${
                msg.role === 'client' ? 'msg-client' : 'msg-ai'
              }`} style={{ color: '#E8F0FA' }}>
                {msg.text}
              </div>
              <div className={`text-xs mt-1 ${msg.role === 'client' ? 'text-right' : 'text-left'}`}
                style={{ color: '#4A6280' }}>
                {formatTime(msg.timestamp)}
              </div>
            </div>

            {msg.role === 'client' && (
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ml-3 mt-1 text-xs font-semibold"
                style={{ background: 'rgba(30,45,69,0.8)', color: '#C8D8EC', border: '1px solid rgba(30,45,69,0.9)' }}>
                U
              </div>
            )}
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex justify-start animate-fade-up">
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mr-3 mt-1"
              style={{ background: 'linear-gradient(135deg, #F5A623, #E8981C)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="3" fill="white" />
                <path d="M12 2v3M12 19v3M2 12h3M19 12h3" stroke="white" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <div className="msg-ai px-4 py-4 flex items-center gap-2">
              <div className="typing-dot" />
              <div className="typing-dot" />
              <div className="typing-dot" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="px-4 sm:px-8 py-4" style={{ borderTop: '1px solid rgba(30,45,69,0.6)', background: 'rgba(13,21,40,0.4)' }}>
        <div className="flex items-end gap-3 max-w-4xl mx-auto">
          <button
            onClick={clearChat}
            className="flex-shrink-0 p-2.5 rounded-xl transition-all duration-200 hover:scale-105 mb-0.5"
            style={{ background: 'rgba(30,45,69,0.6)', color: '#4A6280', border: '1px solid rgba(30,45,69,0.8)' }}
            title="Clear chat"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <div className="flex-1 relative rounded-2xl overflow-hidden"
            style={{ background: 'rgba(17,24,39,0.8)', border: '1px solid rgba(30,45,69,0.9)' }}>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder="Ask about DTV visa, documents, process..."
              rows={1}
              className="w-full px-4 py-3 pr-14 text-sm resize-none outline-none bg-transparent"
              style={{ color: '#E8F0FA', caretColor: '#F5A623', fontFamily: 'var(--font-body)' }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className="absolute right-2 bottom-2 w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-105 disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(135deg, #F5A623, #E8981C)' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
        <p className="text-center text-xs mt-2" style={{ color: '#2A3F5F' }}>
          Press Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  )
}
