import { useState, useRef, useEffect } from 'react';

const API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL_NAME = 'llama3-70b-8192'; // Standard high-availability model

const SYSTEM_PROMPT = `You are NeRA (NestFund Real-time Advisor), an expert AI financial tutor and investment advisor for NestFund — an AI-powered fractional investment platform built on the Stellar blockchain using Soroban smart contracts.

Your identity and rules:
- You are NeRA.
- Explain investment concepts simply (fractional investing, invoice financing, revenue sharing).
- Use Stellar/Soroban context (secure, transparent, automatic profit distribution).
- Keep responses concise (2-4 paragraphs).
- Mention returns average 14.2% APY.
- Educational guidance, not financial advice.`;

const SUGGESTED = [
  "What is invoice financing?",
  "How do smart contracts protect my money?",
  "What's a good AI risk score?",
  "How do I diversify my portfolio?",
  "Technical: How does Stellar help?",
  "How is my profit calculated?",
];

function TypingIndicator() {
  return (
    <div className="chat-bubble ai-bubble">
      <div className="ai-avatar" style={{ fontSize: '10px', fontWeight: '800' }}>AI</div>
      <div className="chat-text typing-dots">
        <span></span><span></span><span></span>
      </div>
    </div>
  );
}

export default function NeRAChat({ embedded = false, onClose }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello! I'm **NeRA**, your NestFund Investment Advisor. I'm powered by high-speed neural processing to help you analyze risks, understand fractional assets, and navigate the Stellar ecosystem.\n\nHow can I assist you today?",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const feedRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const sendMessage = async (text) => {
    const userText = (text || input).trim();
    if (!userText || loading) return;
    setInput('');

    // Add user message to UI
    const updatedMessages = [...messages, { role: 'user', content: userText }];
    setMessages(updatedMessages);
    setLoading(true);

    // Prepare messages for Groq (OpenAI format)
    const apiMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...updatedMessages.map(msg => ({
        role: msg.role,
        content: msg.content
      }))
    ];

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: MODEL_NAME,
          messages: apiMessages,
          temperature: 0.7,
          max_tokens: 1024
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || `Groq API Error: ${res.status}`);

      const reply = data.choices[0]?.message?.content;
      setMessages(prev => [...prev, { role: 'assistant', content: reply || "I'm sorry, I couldn't reach my brain." }]);
    } catch (err) {
      console.error('[Groq Error]', err);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Connection Error: ${err.message}. Please check your connection.`,
        isError: true
      }]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const renderText = (text) => {
    if (!text) return '';
    // Simple markdown-ish rendering
    return text
      .trim()
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/(\r\n|\n|\r)/g, '<br/>')
      .replace(/•\s?(.+?)(<br\/>|$)/g, '<div style="margin-left: 12px; display: flex; gap: 8px;"><span>•</span><span>$1</span></div>')
      .replace(/(\d\.\s?)(.+?)(<br\/>|$)/g, '<div style="margin-left: 12px; display: flex; gap: 8px;"><span>$1</span><span>$2</span></div>');
  };

  return (
    <div className={`nera-chat-container ${embedded ? 'nera-embedded' : 'nera-floating-box'}`}>
      {/* Header */}
      <div className="nera-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="nera-avatar-main" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path></svg>
            <div className="nera-online-pulse" />
          </div>
          <div>
            <div className="nera-title">NeRA · AI Advisor</div>
            <div className="nera-subtitle">Llama 3.3 70B [Groq] · Always available</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div className="nera-badge">LIVE AI</div>
          {onClose && (
            <button className="nera-close" onClick={onClose}>✕</button>
          )}
        </div>
      </div>

      {/* Chat Feed */}
      <div className="nera-feed" ref={feedRef}>
        {messages.map((msg, i) => (
          <div key={i} className={`chat-bubble ${msg.role === 'user' ? 'user' : 'ai-bubble'}`}>
            {msg.role === 'assistant' && <div className="ai-avatar" style={{ fontSize: '10px', fontWeight: '800' }}>AI</div>}
            <div
              className={`chat-text ${msg.isError ? 'chat-error' : ''}`}
              dangerouslySetInnerHTML={{ __html: renderText(msg.content) }}
            />
          </div>
        ))}
        {loading && <TypingIndicator />}
      </div>

      {/* Suggestions */}
      {messages.length <= 1 && !loading && (
        <div className="nera-suggestions">
          {SUGGESTED.map((s) => (
            <button key={s} className="suggestion-chip" onClick={() => sendMessage(s)}>
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="nera-input-row">
        <textarea
          ref={inputRef}
          className="nera-input"
          placeholder="Ask me anything about investing…"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          rows={1}
          disabled={loading}
        />
        <button
          className={`nera-send ${loading ? 'loading' : ''}`}
          onClick={() => sendMessage()}
          disabled={loading || !input.trim()}
        >
          {loading ? '...' : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
          )}
        </button>
      </div>
    </div>
  );
}
