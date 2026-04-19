import { useState, useEffect, useRef } from 'react';
import api from '../api/client';
import { useToast } from './Toast';
import { MessageSquare, Send, Loader2, Bot, User, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

function TypingIndicator() {
  return (
    <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
      <div style={{
        width: '32px', height: '32px', borderRadius: '12px', flexShrink: 0,
        background: 'linear-gradient(135deg, var(--color-neon), var(--color-cyan))',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 0 15px rgba(0,245,212,0.15)',
      }}>
        <Bot size={16} color="#060b18" />
      </div>
      <div style={{
        padding: '12px 18px', borderRadius: '14px',
        background: 'rgba(0,245,212,0.06)', border: '1px solid rgba(0,245,212,0.12)',
      }}>
        <div className="typing-indicator">
          <span></span><span></span><span></span>
        </div>
      </div>
    </div>
  );
}

export default function ChatAssistant({ selectedPatient }) {
  const { addToast } = useToast();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (selectedPatient) {
      api.get(`/chat/history/${selectedPatient.id}`)
        .then(res => setMessages(res.data))
        .catch(() => {});
    } else {
      api.get('/chat/history')
        .then(res => setMessages(res.data))
        .catch(() => {});
    }
  }, [selectedPatient]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/chat', { 
        message: input, 
        patient_id: selectedPatient?.id || null 
      });
      setMessages(prev => [...prev, res.data]);
    } catch (err) {
      addToast('Failed to get AI response', 'error');
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    "Summarize patient history",
    "Analyze current severity",
    "Suggest follow-up plan",
    "Explain last scan findings"
  ];

  return (
    <div className="animate-fadeIn chat-container" style={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
            <Sparkles size={14} style={{ color: 'var(--color-neon)' }} />
            <span style={{ fontSize: '12px', color: 'var(--color-neon)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '2px' }}>Clinical Intelligence</span>
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: '800' }}>AI Research Co-Pilot</h2>
        </div>
      </div>

      <div className="glass" style={{ flex: 1, display: 'flex', flexDirection: 'column', borderRadius: '24px', overflow: 'hidden', transition: 'all 0.3s ease', minHeight: 0 }}>
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', WebkitOverflowScrolling: 'touch' }}>
          {messages.length === 0 && (
            <div style={{ textAlign: 'center', marginTop: '40px', opacity: 0.5 }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: 'rgba(0,245,212,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Bot size={32} color="var(--color-neon)" />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--color-text-primary)' }}>How can I help you today?</h3>
              <p style={{ fontSize: '14px', maxWidth: '300px', margin: '8px auto' }}>Select a quick action below or type a query about the patient's records.</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center', marginTop: '24px' }}>
                {quickActions.map(action => (
                  <button key={action} onClick={() => setInput(action)} style={{
                    padding: '8px 16px', borderRadius: '12px', background: 'rgba(0,245,212,0.05)',
                    border: '1px solid rgba(0,245,212,0.15)', color: 'var(--color-neon)',
                    fontSize: '12px', cursor: 'pointer', transition: 'all 0.2s',
                    WebkitTapHighlightColor: 'transparent',
                  }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,245,212,0.1)'} 
                     onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,245,212,0.05)'}>
                    {action}
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map((msg, i) => (
            <div key={i} style={{ display: 'flex', gap: '12px', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
              {msg.role !== 'user' && (
                <div style={{
                  width: '32px', height: '32px', borderRadius: '10px', flexShrink: 0,
                  background: 'linear-gradient(135deg, var(--color-neon), var(--color-cyan))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Bot size={16} color="#060b18" />
                </div>
              )}
              <div className="glass chat-message-bubble" style={{
                maxWidth: '80%', padding: '12px 18px', borderRadius: '18px',
                borderBottomRightRadius: msg.role === 'user' ? '4px' : '18px',
                borderTopLeftRadius: msg.role !== 'user' ? '4px' : '18px',
                background: msg.role === 'user' ? 'rgba(0,245,212,0.08)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${msg.role === 'user' ? 'rgba(0,245,212,0.2)' : 'var(--color-border)'}`,
              }}>
                <div className="markdown-content" style={{ fontSize: '14px', color: 'var(--color-text-primary)', wordBreak: 'break-word' }}>
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              </div>
            </div>
          ))}
          {loading && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>
        <div className="chat-input-area" style={{ padding: '24px', borderTop: '1px solid var(--color-border)', background: 'rgba(0,0,0,0.2)' }}>
          <form onClick={(e) => e.stopPropagation()} onSubmit={handleSend} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <input className="input-field" placeholder="Ask for clinical insights..." value={input} onChange={e => setInput(e.target.value)} disabled={loading} style={{ borderRadius: '16px', height: '54px', flex: 1 }} />
            <button type="submit" className="btn-primary" disabled={loading || !input.trim()} style={{ padding: '14px 20px', borderRadius: '14px', height: '54px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {loading ? <Loader2 size={18} className="animate-spin-slow" /> : <Send size={18} />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
