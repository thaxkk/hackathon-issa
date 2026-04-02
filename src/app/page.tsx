'use client'

import { useState } from 'react'
import ChatTab from '@/components/ChatTab'
import TrainTab from '@/components/TrainTab'
import PromptTab from '@/components/PromptTab'

type Tab = 'chat' | 'train' | 'prompt'

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('chat')

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0A0F1E' }}>
      {/* Background radial glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #F5A623 0%, transparent 70%)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full opacity-5"
          style={{ background: 'radial-gradient(circle, #00C9A7 0%, transparent 70%)' }} />
      </div>

      {/* Header */}
      <header className="relative z-10 px-6 py-5 flex items-center justify-between"
        style={{ borderBottom: '1px solid rgba(30,45,69,0.6)' }}>
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #F5A623, #E8981C)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="3" fill="white" />
                <path d="M12 2v3M12 19v3M2 12h3M19 12h3" stroke="white" strokeWidth="2" strokeLinecap="round" />
                <path d="M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 animate-pulse-slow"
              style={{ background: '#00C9A7', borderColor: '#0A0F1E' }} />
          </div>
          <div>
            <div className="text-sm font-semibold tracking-wide" style={{ color: '#E8F0FA', fontFamily: 'var(--font-display)' }}>
              Issa Compass
            </div>
            <div className="text-xs" style={{ color: '#4A6280' }}>AI Console</div>
          </div>
        </div>

        {/* Tabs */}
        <nav className="flex items-center gap-1 rounded-xl p-1"
          style={{ background: 'rgba(13,21,40,0.8)', border: '1px solid rgba(30,45,69,0.6)' }}>
          {([
            { id: 'chat', label: 'Chat', icon: '💬' },
            { id: 'train', label: 'Train AI', icon: '🧠' },
            { id: 'prompt', label: 'Prompt', icon: '⚙️' },
          ] as { id: Tab; label: string; icon: string }[]).map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                activeTab === tab.id ? 'tab-active' : ''
              }`}
              style={{
                background: activeTab === tab.id ? 'rgba(245,166,35,0.1)' : 'transparent',
                color: activeTab === tab.id ? '#F5A623' : '#4A6280',
                border: activeTab === tab.id ? '1px solid rgba(245,166,35,0.2)' : '1px solid transparent',
              }}
            >
              <span>{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className="text-xs px-3 py-1.5 rounded-full"
          style={{ background: 'rgba(0,201,167,0.1)', color: '#00C9A7', border: '1px solid rgba(0,201,167,0.2)' }}>
          🟢 Live
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex-1 overflow-hidden">
        {activeTab === 'chat' && <ChatTab />}
        {activeTab === 'train' && <TrainTab />}
        {activeTab === 'prompt' && <PromptTab />}
      </main>
    </div>
  )
}
