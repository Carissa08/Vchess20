import React, { useState, useRef, useEffect } from 'react';
import { Brain, Send, Sparkles, Lightbulb, Target, ChevronRight } from 'lucide-react';
import type { ChatMessage } from '../types';

interface AICoachProps {
  currentFen?: string;
  lastMove?: string;
  moveHistory?: string[];
}

const COACH_RESPONSES: Record<string, string[]> = {
  opening: [
    "Control the center with pawns and develop your knights before bishops. Castle early to protect your king.",
    "In the opening phase, avoid moving the same piece twice unless absolutely necessary.",
    "The Sicilian Defense is excellent for counterplay. After 1.e4 c5, Black fights for the d4 square.",
    "With 1.d4, you enter Queen's Pawn territory — positional, strategic chess awaits.",
  ],
  middlegame: [
    "Look for piece activity! Identify your worst-placed piece and improve its position.",
    "Always calculate tactics before making a move. Check for forks, pins, skewers, and discovered attacks.",
    "Pawn structure determines your long-term plans. Avoid creating isolated or doubled pawns.",
    "King safety is paramount. Don't open lines near your own king without good reason.",
  ],
  endgame: [
    "In the endgame, king activity is crucial. Activate your king immediately!",
    "Passed pawns must be pushed! They become queens if you don't stop them.",
    "Rooks belong behind passed pawns — yours or your opponent's.",
    "In rook endgames, remember the Lucena and Philidor positions.",
  ],
  tactics: [
    "Always look for checks, captures, and threats before making your move.",
    "Discovered attacks can be devastating — moving one piece to reveal an attack by another.",
    "The knight fork is a powerful weapon. Knights can attack multiple pieces simultaneously.",
    "Pins and skewers are related tactics. A pin prevents movement; a skewer forces it.",
  ],
  general: [
    "Think before you move! Always ask: what is my opponent's threat? What is my best response?",
    "Chess is about patterns. Study master games and practice tactics daily.",
    "Don't play too fast in critical positions. Slow down and calculate deeply.",
    "Having a plan, even an imperfect one, is better than drifting aimlessly.",
  ],
};

const QUICK_QUESTIONS = [
  "What's the best opening strategy?",
  "Explain my last move",
  "How should I handle this middlegame?",
  "What are key endgame principles?",
  "Find tactical opportunities",
  "Evaluate my position",
];

export const AICoach: React.FC<AICoachProps> = ({ currentFen, lastMove, moveHistory = [] }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'ai',
      content: "Hello, champion! I'm ARIA, your AI chess coach. I'm here to help you improve your game. Ask me about openings, tactics, strategy, or request an analysis of your current position.",
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getAIResponse = (question: string): string => {
    const q = question.toLowerCase();
    if (q.includes('opening') || q.includes('start')) {
      return COACH_RESPONSES.opening[Math.floor(Math.random() * COACH_RESPONSES.opening.length)];
    }
    if (q.includes('middlegame') || q.includes('middle') || q.includes('plan')) {
      return COACH_RESPONSES.middlegame[Math.floor(Math.random() * COACH_RESPONSES.middlegame.length)];
    }
    if (q.includes('endgame') || q.includes('end')) {
      return COACH_RESPONSES.endgame[Math.floor(Math.random() * COACH_RESPONSES.endgame.length)];
    }
    if (q.includes('tactic') || q.includes('fork') || q.includes('pin') || q.includes('attack')) {
      return COACH_RESPONSES.tactics[Math.floor(Math.random() * COACH_RESPONSES.tactics.length)];
    }
    if (q.includes('last move') || q.includes('explain')) {
      if (lastMove) {
        return `Your move ${lastMove} was played. ${COACH_RESPONSES.general[Math.floor(Math.random() * COACH_RESPONSES.general.length)]}`;
      }
      return "No move has been played yet. Start a game and I'll analyze your moves in real time!";
    }
    if (q.includes('evaluat') || q.includes('position')) {
      if (moveHistory.length > 0) {
        return `After ${Math.ceil(moveHistory.length / 2)} moves, the position is ${moveHistory.length < 10 ? 'still in the opening phase' : 'entering the middlegame'}. ${COACH_RESPONSES.general[1]}`;
      }
      return "Start a game and I'll evaluate your position move by move!";
    }
    return COACH_RESPONSES.general[Math.floor(Math.random() * COACH_RESPONSES.general.length)];
  };

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setIsTyping(true);

    await new Promise((r) => setTimeout(r, 800 + Math.random() * 600));

    const aiMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'ai',
      content: getAIResponse(text),
      timestamp: new Date(),
    };
    setMessages((m) => [...m, aiMsg]);
    setIsTyping(false);
  };

  return (
    <section id="coach" style={{ padding: '80px 24px', maxWidth: 1400, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'rgba(0,245,255,0.08)', border: '1px solid rgba(0,245,255,0.2)',
          borderRadius: 100, padding: '6px 16px', marginBottom: 16 }}>
          <Brain size={14} color="#00F5FF" />
          <span style={{ color: '#00F5FF', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em' }}>AI COACH</span>
        </div>
        <h2 style={{ fontSize: 40, fontWeight: 900, fontFamily: 'Poppins',
          background: 'linear-gradient(135deg, #ffffff, #00F5FF)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
          Meet ARIA
        </h2>
        <p style={{ color: '#606078', fontSize: 14, marginTop: 8 }}>
          Your personal AI chess coach — available 24/7
        </p>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        {/* Main chat */}
        <div style={{ flex: 1, minWidth: 300 }}>
          <div style={{
            background: '#0D0D14',
            border: '1px solid rgba(0,245,255,0.15)',
            borderRadius: 20,
            overflow: 'hidden',
            boxShadow: '0 0 40px rgba(0,245,255,0.05)',
          }}>
            {/* Header */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid rgba(255,255,255,0.05)',
              background: 'linear-gradient(135deg, rgba(0,245,255,0.05), rgba(123,47,247,0.05))',
              display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: '50%',
                background: 'linear-gradient(135deg, #00F5FF, #7B2FF7)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20,
                boxShadow: '0 0 20px rgba(0,245,255,0.4)',
                animation: 'glowPulse 2s ease-in-out infinite',
              }}>
                🤖
              </div>
              <div>
                <div style={{ color: '#F5F5F5', fontSize: 15, fontWeight: 700 }}>ARIA</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#00FF88',
                    boxShadow: '0 0 6px #00FF88' }} />
                  <span style={{ color: '#00FF88', fontSize: 11, fontWeight: 600 }}>Online</span>
                </div>
              </div>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                <span style={{ background: 'rgba(0,245,255,0.1)', border: '1px solid rgba(0,245,255,0.2)',
                  borderRadius: 100, padding: '3px 10px',
                  color: '#00F5FF', fontSize: 10, fontWeight: 700 }}>
                  <Sparkles size={9} style={{ display: 'inline', marginRight: 4 }} />
                  AI POWERED
                </span>
              </div>
            </div>

            {/* Messages */}
            <div style={{
              height: 360, overflowY: 'auto', padding: '16px',
              display: 'flex', flexDirection: 'column', gap: 12,
            }}>
              {messages.map((msg) => (
                <div key={msg.id} style={{
                  display: 'flex',
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  gap: 8, alignItems: 'flex-start',
                }}>
                  {msg.role === 'ai' && (
                    <div style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                      background: 'linear-gradient(135deg, #00F5FF, #7B2FF7)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>
                      🤖
                    </div>
                  )}
                  <div style={{
                    maxWidth: '80%',
                    padding: '10px 14px',
                    borderRadius: msg.role === 'ai' ? '4px 14px 14px 14px' : '14px 4px 14px 14px',
                    background: msg.role === 'ai'
                      ? 'rgba(0,245,255,0.08)'
                      : 'rgba(123,47,247,0.15)',
                    border: `1px solid ${msg.role === 'ai' ? 'rgba(0,245,255,0.15)' : 'rgba(123,47,247,0.25)'}`,
                    color: '#F5F5F5',
                    fontSize: 13,
                    lineHeight: 1.6,
                  }}>
                    {msg.content}
                    <div style={{ color: '#606078', fontSize: 10, marginTop: 4 }}>
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  {msg.role === 'user' && (
                    <div style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                      background: 'linear-gradient(135deg, #7B2FF7, #3A86FF)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontWeight: 700, color: '#fff' }}>
                      U
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #00F5FF, #7B2FF7)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>
                    🤖
                  </div>
                  <div style={{ padding: '10px 14px',
                    background: 'rgba(0,245,255,0.08)', border: '1px solid rgba(0,245,255,0.15)',
                    borderRadius: '4px 14px 14px 14px',
                    display: 'flex', gap: 5, alignItems: 'center' }}>
                    {[0,1,2].map(i => (
                      <div key={i} style={{ width: 6, height: 6, borderRadius: '50%',
                        background: '#00F5FF', opacity: 0.6,
                        animation: `aiThink 1s ease-in-out ${i * 0.2}s infinite` }} />
                    ))}
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div style={{
              padding: '12px 16px',
              borderTop: '1px solid rgba(255,255,255,0.05)',
              display: 'flex', gap: 8,
            }}>
              <input
                className="input-futuristic"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') sendMessage(input); }}
                placeholder="Ask ARIA anything about chess..."
                style={{ flex: 1, padding: '10px 14px', borderRadius: 10, fontSize: 13 }}
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || isTyping}
                style={{
                  padding: '10px 16px',
                  background: input.trim() ? 'linear-gradient(135deg, #00F5FF, #7B2FF7)' : 'rgba(255,255,255,0.06)',
                  border: 'none', borderRadius: 10, cursor: input.trim() ? 'pointer' : 'not-allowed',
                  color: '#fff', transition: 'all 0.2s',
                  opacity: isTyping ? 0.6 : 1,
                  display: 'flex', alignItems: 'center',
                }}
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Quick questions + features */}
        <div style={{ width: 240, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Quick questions */}
          <div style={{ background: '#0D0D14', border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 16, overflow: 'hidden' }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ color: '#A0A0B8', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em' }}>
                QUICK QUESTIONS
              </span>
            </div>
            <div style={{ padding: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
              {QUICK_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  style={{
                    padding: '8px 12px',
                    background: 'none',
                    border: '1px solid transparent',
                    borderRadius: 8, cursor: 'pointer',
                    color: '#A0A0B8', fontSize: 12,
                    textAlign: 'left',
                    display: 'flex', alignItems: 'center', gap: 8,
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(0,245,255,0.06)';
                    e.currentTarget.style.borderColor = 'rgba(0,245,255,0.15)';
                    e.currentTarget.style.color = '#00F5FF';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'none';
                    e.currentTarget.style.borderColor = 'transparent';
                    e.currentTarget.style.color = '#A0A0B8';
                  }}
                >
                  <ChevronRight size={10} style={{ flexShrink: 0 }} />
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Coach features */}
          {[
            { icon: <Lightbulb size={16} />, label: 'Opening Theory', desc: 'Master all major openings', color: '#FFD700' },
            { icon: <Target size={16} />, label: 'Tactical Vision', desc: 'Find winning combinations', color: '#FF3366' },
            { icon: <Brain size={16} />, label: 'Positional Play', desc: 'Long-term strategic planning', color: '#00F5FF' },
          ].map((f) => (
            <div key={f.label} style={{
              background: '#0D0D14',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 12, padding: '14px 16px',
              display: 'flex', alignItems: 'center', gap: 12,
              cursor: 'pointer', transition: 'all 0.2s',
            }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${f.color}40`; e.currentTarget.style.background = `${f.color}08`; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.background = '#0D0D14'; }}
            >
              <div style={{ color: f.color }}>{f.icon}</div>
              <div>
                <div style={{ color: '#F5F5F5', fontSize: 13, fontWeight: 700 }}>{f.label}</div>
                <div style={{ color: '#606078', fontSize: 11 }}>{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AICoach;
