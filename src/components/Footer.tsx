import React from 'react';
import { Crown, Github, Twitter, Twitch, Youtube, Shield, Zap, Brain } from 'lucide-react';
import type { Section } from '../types';

interface FooterProps {
  onNavigate: (section: Section) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer style={{
      borderTop: '1px solid rgba(255,255,255,0.05)',
      background: '#07070A',
      padding: '60px 24px 32px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background glow */}
      <div style={{
        position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: 600, height: 200,
        background: 'radial-gradient(ellipse, rgba(123,47,247,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 40, marginBottom: 48 }}>
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <Crown size={28} fill="#7B2FF7" color="#7B2FF7"
                style={{ filter: 'drop-shadow(0 0 8px rgba(123,47,247,0.6))' }} />
              <span style={{ fontSize: 22, fontWeight: 900, fontFamily: 'Poppins',
                letterSpacing: '0.08em',
                background: 'linear-gradient(135deg, #9B4FFF, #3A86FF)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                VCHESS
              </span>
            </div>
            <p style={{ color: '#606078', fontSize: 13, lineHeight: 1.7, maxWidth: 220 }}>
              The next-generation AI chess operating system. Train, compete, and evolve.
            </p>
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              {[<Twitter size={16} />, <Github size={16} />, <Twitch size={16} />, <Youtube size={16} />].map((icon, i) => (
                <button key={i} style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: '#606078',
                  transition: 'all 0.2s',
                }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(123,47,247,0.1)'; e.currentTarget.style.color = '#9B4FFF'; e.currentTarget.style.borderColor = 'rgba(123,47,247,0.3)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#606078'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Play */}
          <div>
            <h4 style={{ color: '#F5F5F5', fontSize: 12, fontWeight: 700,
              letterSpacing: '0.1em', marginBottom: 16 }}>PLAY</h4>
            {[
              { label: 'Chess Arena', section: 'arena' as Section },
              { label: 'Multiplayer', section: 'multiplayer' as Section },
              { label: 'AI Coach', section: 'coach' as Section },
              { label: 'Training', section: 'training' as Section },
            ].map((item) => (
              <button key={item.label} onClick={() => onNavigate(item.section)}
                style={{ display: 'block', background: 'none', border: 'none',
                  cursor: 'pointer', color: '#606078', fontSize: 13,
                  padding: '5px 0', textAlign: 'left',
                  transition: 'color 0.2s', lineHeight: 1.8 }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#9B4FFF'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#606078'}>
                {item.label}
              </button>
            ))}
          </div>

          {/* Features */}
          <div>
            <h4 style={{ color: '#F5F5F5', fontSize: 12, fontWeight: 700,
              letterSpacing: '0.1em', marginBottom: 16 }}>FEATURES</h4>
            {['Stockfish AI Engine', 'Game Analysis', 'Opening Explorer',
              'Rating System', 'Daily Puzzles'].map((f) => (
              <div key={f} style={{ color: '#606078', fontSize: 13, padding: '5px 0', lineHeight: 1.8 }}>
                {f}
              </div>
            ))}
          </div>

          {/* Stats */}
          <div>
            <h4 style={{ color: '#F5F5F5', fontSize: 12, fontWeight: 700,
              letterSpacing: '0.1em', marginBottom: 16 }}>LIVE STATS</h4>
            {[
              { icon: <Zap size={12} />, label: 'Games Today', value: '186,427', color: '#FFD700' },
              { icon: <Brain size={12} />, label: 'AI Analyses', value: '94,203', color: '#00F5FF' },
              { icon: <Shield size={12} />, label: 'Total Players', value: '2.4M+', color: '#00FF88' },
            ].map((s) => (
              <div key={s.label} style={{ display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', padding: '6px 0',
                borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ color: s.color }}>{s.icon}</span>
                  <span style={{ color: '#606078', fontSize: 12 }}>{s.label}</span>
                </div>
                <span style={{ color: s.color, fontSize: 12, fontWeight: 700 }}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)',
          paddingTop: 24,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <span style={{ color: '#606078', fontSize: 12 }}>
            © 2035 VCHESS. All rights reserved. Built with ♟ and AI.
          </span>
          <div style={{ display: 'flex', gap: 20 }}>
            {['Privacy', 'Terms', 'Contact', 'API'].map((l) => (
              <button key={l} style={{ background: 'none', border: 'none', cursor: 'pointer',
                color: '#606078', fontSize: 12,
                transition: 'color 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#9B4FFF'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#606078'}>
                {l}
              </button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
