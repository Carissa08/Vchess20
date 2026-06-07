import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase, Profile } from './lib/supabase';
import type { Section, AuthUser } from './types';
import { ParticleBackground } from './components/ParticleBackground';
import { Navigation } from './components/Navigation';
import { Hero } from './components/Hero';
import { Arena } from './components/Arena';
import { MultiplayerLobby } from './components/MultiplayerLobby';
import { AICoach } from './components/AICoach';
import { AnalysisCenter } from './components/AnalysisCenter';
import { TrainingSystem } from './components/TrainingSystem';
import { Dashboard } from './components/Dashboard';
import { MatchHistory } from './components/MatchHistory';
import { AuthModal } from './components/AuthModal';
import { Footer } from './components/Footer';

const SECTION_IDS: Section[] = [
  'hero', 'arena', 'multiplayer', 'coach', 'analysis', 'training', 'dashboard', 'history',
];

function App() {
  const [activeSection, setActiveSection] = useState<Section>('hero');
  const [user, setUser] = useState<AuthUser | null>(null);
  <div style={{color:'white'}}>HELLO VCHESS</div>
  const [authLoading, setAuthLoading] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      (async () => {
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();

          setUser({
            id: session.user.id,
            email: session.user.email || '',
            profile: profile as Profile | null,
          });
        } else {
          setUser(null);
        }
        setAuthLoading(false);
      })();
    });

    return () => subscription.unsubscribe();
  }, []);

  const navigateTo = useCallback((section: Section) => {
    setActiveSection(section);
    const el = document.getElementById(section);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const handleAuthSuccess = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();

      setUser({
        id: session.user.id,
        email: session.user.email || '',
        profile: profile as Profile | null,
      });
    }
  };

  // Intersection observer for active section tracking
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.3) {
            const id = entry.target.id as Section;
            if (SECTION_IDS.includes(id)) {
              setActiveSection(id);
            }
          }
        });
      },
      { threshold: 0.3 }
    );

    SECTION_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observerRef.current?.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, []);

  return (
    <div style={{ background: '#07070A', minHeight: '100vh', position: 'relative' }}>
      <ParticleBackground />

      {/* Scan line effect */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 1,
        background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)',
        pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', zIndex: 2 }}>
        <Navigation
          activeSection={activeSection}
          onNavigate={navigateTo}
          user={user}
          onAuthClick={() => setAuthModalOpen(true)}
          onLogout={handleLogout}
        />

        <main>
          <Hero
            onNavigate={navigateTo}
            onAuthClick={() => setAuthModalOpen(true)}
          />

          <div id="arena" style={{ scrollMarginTop: 64 }}>
            <Arena user={user} onAuthClick={() => setAuthModalOpen(true)} />
          </div>

          <div style={{
            height: 1,
            background: 'linear-gradient(90deg, transparent, rgba(123,47,247,0.3), transparent)',
            margin: '0 48px',
          }} />

          <div id="multiplayer" style={{ scrollMarginTop: 64 }}>
            <MultiplayerLobby user={user} onAuthClick={() => setAuthModalOpen(true)} />
          </div>

          <div style={{
            height: 1,
            background: 'linear-gradient(90deg, transparent, rgba(58,134,255,0.3), transparent)',
            margin: '0 48px',
          }} />

          <div id="coach" style={{ scrollMarginTop: 64 }}>
            <AICoach />
          </div>

          <div style={{
            height: 1,
            background: 'linear-gradient(90deg, transparent, rgba(255,215,0,0.2), transparent)',
            margin: '0 48px',
          }} />

          <div id="analysis" style={{ scrollMarginTop: 64 }}>
            <AnalysisCenter />
          </div>

          <div style={{
            height: 1,
            background: 'linear-gradient(90deg, transparent, rgba(0,255,136,0.2), transparent)',
            margin: '0 48px',
          }} />

          <div id="training" style={{ scrollMarginTop: 64 }}>
            <TrainingSystem user={user} onAuthClick={() => setAuthModalOpen(true)} />
          </div>

          <div style={{
            height: 1,
            background: 'linear-gradient(90deg, transparent, rgba(123,47,247,0.3), transparent)',
            margin: '0 48px',
          }} />

          <div id="dashboard" style={{ scrollMarginTop: 64 }}>
            <Dashboard user={user} onAuthClick={() => setAuthModalOpen(true)} />
          </div>

          <div style={{
            height: 1,
            background: 'linear-gradient(90deg, transparent, rgba(58,134,255,0.3), transparent)',
            margin: '0 48px',
          }} />

          <div id="history" style={{ scrollMarginTop: 64 }}>
            <MatchHistory user={user} onAuthClick={() => setAuthModalOpen(true)} />
          </div>
        </main>

        <Footer onNavigate={navigateTo} />
      </div>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      {/* Loading overlay */}
      {authLoading && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: '#07070A',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexDirection: 'column', gap: 16,
          animation: 'fadeIn 0.3s ease',
        }}>
          <div style={{ fontSize: 48, animation: 'logoPulse 1.5s ease-in-out infinite' }}>♛</div>
          <div style={{ display: 'flex', gap: 6 }}>
            {[0,1,2].map(i => (
              <div key={i} style={{
                width: 8, height: 8, borderRadius: '50%',
                background: '#7B2FF7',
                animation: `aiThink 1s ease-in-out ${i * 0.2}s infinite`,
              }} />
            ))}
          </div>
          <span style={{ color: '#606078', fontSize: 12, letterSpacing: '0.2em' }}>
            INITIALIZING VCHESS
          </span>
        </div>
      )}
    </div>
  );
}

export default App;
