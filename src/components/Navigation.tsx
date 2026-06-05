import React, { useState, useEffect } from 'react';
import { Crown, Zap, Brain, Activity, Users, BookOpen, BarChart2, Clock, Menu, X, LogIn, User } from 'lucide-react';
import type { Section } from '../types';
import type { AuthUser } from '../types';

interface NavigationProps {
  activeSection: Section;
  onNavigate: (section: Section) => void;
  user: AuthUser | null;
  onAuthClick: () => void;
  onLogout: () => void;
}

const NAV_ITEMS: { id: Section; label: string; icon: React.ReactNode }[] = [
  { id: 'hero', label: 'HOME', icon: <Crown size={14} /> },
  { id: 'arena', label: 'ARENA', icon: <Zap size={14} /> },
  { id: 'multiplayer', label: 'MULTIPLAYER', icon: <Users size={14} /> },
  { id: 'coach', label: 'AI COACH', icon: <Brain size={14} /> },
  { id: 'analysis', label: 'ANALYSIS', icon: <Activity size={14} /> },
  { id: 'training', label: 'TRAINING', icon: <BookOpen size={14} /> },
  { id: 'dashboard', label: 'DASHBOARD', icon: <BarChart2 size={14} /> },
  { id: 'history', label: 'HISTORY', icon: <Clock size={14} /> },
];

export const Navigation: React.FC<NavigationProps> = ({
  activeSection,
  onNavigate,
  user,
  onAuthClick,
  onLogout,
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <nav style={{
      position: 'fixed',
      top: 0, left: 0, right: 0,
      zIndex: 1000,
      transition: 'all 0.3s ease',
      background: scrolled
        ? 'rgba(7, 7, 10, 0.95)'
        : 'transparent',
      backdropFilter: scrolled ? 'blur(20px)' : 'none',
      borderBottom: scrolled
        ? '1px solid rgba(123, 47, 247, 0.15)'
        : '1px solid transparent',
    }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
          {/* Logo */}
          <button
            onClick={() => onNavigate('hero')}
            style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <div className="logo-glow" style={{ color: '#7B2FF7' }}>
              <Crown size={28} fill="#7B2FF7" />
            </div>
            <span style={{
              fontSize: 22,
              fontWeight: 900,
              fontFamily: 'Poppins, sans-serif',
              letterSpacing: '0.08em',
              background: 'linear-gradient(135deg, #9B4FFF, #3A86FF)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              VCHESS
            </span>
          </button>

          {/* Desktop Nav */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 2 }} className="hidden md:flex">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '6px 12px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  fontFamily: 'Inter, sans-serif',
                  color: activeSection === item.id ? '#9B4FFF' : '#A0A0B8',
                  position: 'relative',
                  transition: 'color 0.2s ease',
                }}
              >
                {activeSection === item.id && (
                  <div style={{
                    position: 'absolute', bottom: -2, left: 0, right: 0, height: 2,
                    background: 'linear-gradient(90deg, #7B2FF7, #3A86FF)',
                    boxShadow: '0 0 8px rgba(123,47,247,0.8)',
                    borderRadius: 1,
                  }} />
                )}
                <span style={{ color: activeSection === item.id ? '#9B4FFF' : '#606078' }}>
                  {item.icon}
                </span>
                {item.label}
              </button>
            ))}
          </div>

          {/* Auth / Profile */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {user ? (
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    background: 'rgba(123,47,247,0.1)',
                    border: '1px solid rgba(123,47,247,0.3)',
                    borderRadius: 8, padding: '6px 12px',
                    cursor: 'pointer', color: '#F5F5F5',
                    fontSize: 13, fontWeight: 600,
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{
                    width: 28, height: 28,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #7B2FF7, #3A86FF)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 700, color: '#fff',
                  }}>
                    {user.profile?.username?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span>{user.profile?.username || 'Player'}</span>
                  <span style={{ color: '#7B2FF7', fontSize: 11, fontWeight: 700 }}>
                    {user.profile?.rating_rapid || 1200}
                  </span>
                </button>
                {profileOpen && (
                  <div style={{
                    position: 'absolute', top: '110%', right: 0,
                    background: '#0D0D14',
                    border: '1px solid rgba(123,47,247,0.2)',
                    borderRadius: 12, minWidth: 180,
                    boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
                    overflow: 'hidden', zIndex: 100,
                  }}>
                    <button
                      onClick={() => { onNavigate('dashboard'); setProfileOpen(false); }}
                      style={{ display: 'block', width: '100%', padding: '12px 16px', textAlign: 'left',
                        background: 'none', border: 'none', color: '#A0A0B8',
                        fontSize: 13, cursor: 'pointer', transition: 'all 0.2s' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(123,47,247,0.1)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                    >
                      <User size={14} style={{ display: 'inline', marginRight: 8 }} />
                      Profile
                    </button>
                    <div style={{ height: 1, background: 'rgba(255,255,255,0.05)' }} />
                    <button
                      onClick={() => { onLogout(); setProfileOpen(false); }}
                      style={{ display: 'block', width: '100%', padding: '12px 16px', textAlign: 'left',
                        background: 'none', border: 'none', color: '#FF3366',
                        fontSize: 13, cursor: 'pointer', transition: 'all 0.2s' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,51,102,0.1)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onAuthClick}
                className="btn-primary"
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '8px 18px',
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: '0.05em',
                  cursor: 'pointer',
                }}
              >
                <LogIn size={14} />
                SIGN IN
              </button>
            )}

            {/* Mobile menu */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#A0A0B8',
                display: 'none' }}
              className="md:hidden block"
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div style={{
            borderTop: '1px solid rgba(255,255,255,0.05)',
            padding: '8px 0',
            display: 'flex', flexDirection: 'column', gap: 2,
          }}>
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => { onNavigate(item.id); setMobileOpen(false); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '10px 16px',
                  background: activeSection === item.id ? 'rgba(123,47,247,0.1)' : 'none',
                  border: 'none', borderRadius: 6,
                  cursor: 'pointer',
                  color: activeSection === item.id ? '#9B4FFF' : '#A0A0B8',
                  fontSize: 13, fontWeight: 600,
                  letterSpacing: '0.05em',
                  textAlign: 'left',
                }}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
