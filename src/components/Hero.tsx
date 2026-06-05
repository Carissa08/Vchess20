import React, { useEffect, useState } from 'react';
import { Crown, Zap, Brain, Activity, Play, ChevronDown, Shield, Trophy, Star } from 'lucide-react';
import type { Section } from '../types';

interface HeroProps {
  onNavigate: (section: Section) => void;
  onAuthClick: () => void;
}

const STATS = [
  { label: 'Active Players', value: '2.4M+', icon: <Shield size={16} /> },
  { label: 'Games Today', value: '186K', icon: <Zap size={16} /> },
  { label: 'AI Analyses', value: '94K', icon: <Brain size={16} /> },
  { label: 'Tournaments', value: '1.2K', icon: <Trophy size={16} /> },
];

export const Hero: React.FC<HeroProps> = ({ onNavigate, onAuthClick }) => {
  const [count, setCount] = useState(0);
  const phrases = ['PLAY CHESS', 'MASTER AI', 'DOMINATE', 'EVOLVE'];
  const [phraseIdx, setPhraseIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPhraseIdx((i) => (i + 1) % phrases.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (count < 2847) setCount((c) => Math.min(c + Math.floor(Math.random() * 60 + 10), 2847));
    }, 30);
    return () => clearTimeout(timer);
  }, [count]);

  return (
    <section id="hero" style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      padding: '80px 24px 40px',
      overflow: 'hidden',
    }}>
      {/* Orb backgrounds */}
      <div style={{
        position: 'absolute', top: '20%', left: '15%',
        width: 500, height: 500,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(123,47,247,0.15) 0%, transparent 70%)',
        filter: 'blur(60px)',
        pointerEvents: 'none',
        animation: 'float 8s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute', top: '30%', right: '10%',
        width: 400, height: 400,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(58,134,255,0.12) 0%, transparent 70%)',
        filter: 'blur(60px)',
        pointerEvents: 'none',
        animation: 'float 10s ease-in-out infinite reverse',
      }} />

      {/* Grid overlay */}
      <div className="bg-grid" style={{
        position: 'absolute', inset: 0,
        opacity: 0.4,
        pointerEvents: 'none',
      }} />

      {/* Online counter */}
      <div className="hero-reveal" style={{
        display: 'flex', alignItems: 'center', gap: 8,
        background: 'rgba(0,255,136,0.08)',
        border: '1px solid rgba(0,255,136,0.2)',
        borderRadius: 100,
        padding: '6px 16px',
        marginBottom: 32,
        position: 'relative', zIndex: 1,
      }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#00FF88',
          boxShadow: '0 0 8px #00FF88', animation: 'glowPulse 1.5s ease-in-out infinite' }} />
        <span style={{ color: '#00FF88', fontSize: 12, fontWeight: 600, letterSpacing: '0.1em' }}>
          {count.toLocaleString()} PLAYERS ONLINE NOW
        </span>
      </div>

      {/* Main headline */}
      <div style={{ textAlign: 'center', position: 'relative', zIndex: 1, maxWidth: 900 }}>
        <div className="logo-glow" style={{ marginBottom: 16 }}>
          <Crown size={64} fill="#7B2FF7" color="#7B2FF7" style={{ display: 'block', margin: '0 auto' }} />
        </div>
        <h1 className="hero-reveal hero-reveal-delay-1" style={{
          fontSize: 'clamp(48px, 8vw, 100px)',
          fontWeight: 900,
          fontFamily: 'Poppins, sans-serif',
          letterSpacing: '-0.02em',
          lineHeight: 1,
          marginBottom: 8,
          background: 'linear-gradient(135deg, #ffffff 0%, #9B4FFF 40%, #3A86FF 80%, #00F5FF 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          VCHESS
        </h1>

        {/* Animated phrase */}
        <div style={{ height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
          <h2 style={{
            fontSize: 'clamp(20px, 3vw, 32px)',
            fontWeight: 700,
            fontFamily: 'Poppins, sans-serif',
            letterSpacing: '0.15em',
            color: '#7B2FF7',
            textShadow: '0 0 20px rgba(123,47,247,0.6)',
            transition: 'all 0.5s ease',
            key: phraseIdx,
          }}>
            {phrases[phraseIdx]}
          </h2>
        </div>

        <p className="hero-reveal hero-reveal-delay-2" style={{
          fontSize: 'clamp(14px, 2vw, 18px)',
          color: '#A0A0B8',
          maxWidth: 600,
          margin: '0 auto 40px',
          lineHeight: 1.7,
          fontWeight: 400,
        }}>
          The next-generation AI chess operating system. Train with advanced neural networks,
          compete globally, and evolve your game beyond limits.
        </p>

        {/* CTA Buttons */}
        <div className="hero-reveal hero-reveal-delay-3" style={{
          display: 'flex', flexWrap: 'wrap', gap: 12,
          justifyContent: 'center', marginBottom: 48,
        }}>
          <button
            onClick={() => onNavigate('arena')}
            className="btn-primary"
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '14px 32px', borderRadius: 10,
              fontSize: 14, fontWeight: 700,
              letterSpacing: '0.08em', cursor: 'pointer',
            }}
          >
            <Play size={16} fill="white" />
            PLAY NOW
          </button>
          <button
            onClick={() => onNavigate('arena')}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '14px 32px', borderRadius: 10,
              fontSize: 14, fontWeight: 700,
              letterSpacing: '0.08em', cursor: 'pointer',
              background: 'rgba(58,134,255,0.1)',
              border: '1px solid rgba(58,134,255,0.4)',
              color: '#60A5FA',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(58,134,255,0.2)';
              e.currentTarget.style.boxShadow = '0 0 25px rgba(58,134,255,0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(58,134,255,0.1)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <Brain size={16} />
            PLAY AI
          </button>
          <button
            onClick={() => onNavigate('analysis')}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '14px 32px', borderRadius: 10,
              fontSize: 14, fontWeight: 700,
              letterSpacing: '0.08em', cursor: 'pointer',
              background: 'rgba(0,245,255,0.08)',
              border: '1px solid rgba(0,245,255,0.25)',
              color: '#00F5FF',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(0,245,255,0.15)';
              e.currentTarget.style.boxShadow = '0 0 20px rgba(0,245,255,0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(0,245,255,0.08)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <Activity size={16} />
            ANALYZE GAME
          </button>
          <button
            onClick={onAuthClick}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '14px 32px', borderRadius: 10,
              fontSize: 14, fontWeight: 700,
              letterSpacing: '0.08em', cursor: 'pointer',
              background: 'rgba(255,215,0,0.08)',
              border: '1px solid rgba(255,215,0,0.25)',
              color: '#FFD700',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,215,0,0.15)';
              e.currentTarget.style.boxShadow = '0 0 20px rgba(255,215,0,0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,215,0,0.08)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <Crown size={16} />
            ENTER ARENA
          </button>
        </div>

        {/* Stats row */}
        <div className="hero-reveal hero-reveal-delay-4" style={{
          display: 'flex', flexWrap: 'wrap',
          justifyContent: 'center', gap: 16, marginBottom: 48,
        }}>
          {STATS.map((stat) => (
            <div key={stat.label} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              padding: '16px 24px',
              background: 'rgba(13,13,20,0.6)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 12,
              backdropFilter: 'blur(10px)',
              minWidth: 120,
            }}>
              <div style={{ color: '#7B2FF7', marginBottom: 6 }}>{stat.icon}</div>
              <span style={{ fontSize: 22, fontWeight: 800, color: '#F5F5F5', fontFamily: 'Poppins' }}>
                {stat.value}
              </span>
              <span style={{ fontSize: 10, color: '#606078', letterSpacing: '0.1em', fontWeight: 600, marginTop: 2 }}>
                {stat.label.toUpperCase()}
              </span>
            </div>
          ))}
        </div>

        {/* Feature pills */}
        <div className="hero-reveal hero-reveal-delay-5" style={{
          display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center',
        }}>
          {['AI-Powered Analysis', 'Realtime Multiplayer', 'Stockfish Engine', 'Daily Puzzles',
            'Rating System', 'Opening Explorer', 'Game Review', 'Coaching System'].map((f) => (
            <span key={f} style={{
              padding: '5px 14px',
              background: 'rgba(123,47,247,0.08)',
              border: '1px solid rgba(123,47,247,0.15)',
              borderRadius: 100,
              fontSize: 11, color: '#9B4FFF',
              fontWeight: 600, letterSpacing: '0.05em',
            }}>
              <Star size={9} style={{ display: 'inline', marginRight: 4 }} />
              {f}
            </span>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <button
        onClick={() => onNavigate('arena')}
        style={{
          position: 'absolute', bottom: 32,
          background: 'none', border: 'none', cursor: 'pointer',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
          color: '#606078', fontSize: 10, fontWeight: 600, letterSpacing: '0.1em',
          animation: 'float 2s ease-in-out infinite',
        }}
      >
        SCROLL
        <ChevronDown size={20} style={{ color: '#7B2FF7' }} />
      </button>
    </section>
  );
};

export default Hero;
