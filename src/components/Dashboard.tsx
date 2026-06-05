import React, { useEffect, useState } from 'react';
import { BarChart2, TrendingUp, Shield, Zap, Target, Trophy, Crown, Star } from 'lucide-react';
import { supabase, Game, Profile } from '../lib/supabase';
import type { AuthUser } from '../types';

interface DashboardProps {
  user: AuthUser | null;
  onAuthClick: () => void;
}

const LEADERBOARD_MOCK = [
  { rank: 1, username: 'Magnus_AI', rating: 2847, country: '🇳🇴', winrate: 78 },
  { rank: 2, username: 'DeepBlue_V2', rating: 2780, country: '🇺🇸', winrate: 74 },
  { rank: 3, username: 'CyberKnight', rating: 2712, country: '🇷🇺', winrate: 71 },
  { rank: 4, username: 'NeuralQueen', rating: 2654, country: '🇨🇳', winrate: 68 },
  { rank: 5, username: 'QuantumRook', rating: 2601, country: '🇬🇧', winrate: 66 },
];

export const Dashboard: React.FC<DashboardProps> = ({ user, onAuthClick }) => {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) loadGames();
  }, [user]);

  const loadGames = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('games')
      .select('*')
      .or(`white_id.eq.${user!.id},black_id.eq.${user!.id}`)
      .order('created_at', { ascending: false })
      .limit(5);
    if (data) setGames(data);
    setLoading(false);
  };

  const profile = user?.profile;
  const wins = profile?.wins || 0;
  const losses = profile?.losses || 0;
  const draws = profile?.draws || 0;
  const total = wins + losses + draws || 1;
  const winrate = Math.round((wins / total) * 100);

  if (!user) {
    return (
      <section id="dashboard" style={{ padding: '80px 24px', maxWidth: 1400, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', maxWidth: 480, margin: '0 auto' }}>
          <Crown size={48} color="#7B2FF7" style={{ margin: '0 auto 16px',
            filter: 'drop-shadow(0 0 12px rgba(123,47,247,0.6))' }} />
          <h2 style={{ fontSize: 32, fontWeight: 800, color: '#F5F5F5', marginBottom: 12 }}>
            Your Command Center
          </h2>
          <p style={{ color: '#606078', fontSize: 15, marginBottom: 24 }}>
            Sign in to access your personalized dashboard with stats, ratings, and match history.
          </p>
          <button onClick={onAuthClick} className="btn-primary"
            style={{ padding: '14px 36px', borderRadius: 10,
              fontSize: 14, fontWeight: 700, cursor: 'pointer', letterSpacing: '0.08em' }}>
            SIGN IN TO CONTINUE
          </button>
        </div>
      </section>
    );
  }

  const ratingCards = [
    { label: 'RAPID', value: profile?.rating_rapid || 1200, icon: <BarChart2 size={18} />, color: '#7B2FF7' },
    { label: 'BLITZ', value: profile?.rating_blitz || 1200, icon: <Zap size={18} />, color: '#FFD700' },
    { label: 'BULLET', value: profile?.rating_bullet || 1200, icon: <Target size={18} />, color: '#FF3366' },
    { label: 'PUZZLE', value: profile?.rating_puzzle || 1200, icon: <Star size={18} />, color: '#00F5FF' },
  ];

  return (
    <section id="dashboard" style={{ padding: '80px 24px', maxWidth: 1400, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'rgba(123,47,247,0.08)', border: '1px solid rgba(123,47,247,0.2)',
          borderRadius: 100, padding: '6px 16px', marginBottom: 16 }}>
          <BarChart2 size={14} color="#7B2FF7" />
          <span style={{ color: '#9B4FFF', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em' }}>DASHBOARD</span>
        </div>
        <h2 style={{ fontSize: 40, fontWeight: 900, fontFamily: 'Poppins',
          background: 'linear-gradient(135deg, #ffffff, #9B4FFF)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
          Command Center
        </h2>
      </div>

      {/* Profile header */}
      <div style={{ background: '#0D0D14',
        border: '1px solid rgba(123,47,247,0.15)',
        borderRadius: 20, padding: 28, marginBottom: 24,
        display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%',
          background: 'linear-gradient(135deg, #7B2FF7, #3A86FF)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 32, fontWeight: 900, color: '#fff',
          boxShadow: '0 0 30px rgba(123,47,247,0.4)',
          flexShrink: 0 }}>
          {profile?.username?.charAt(0).toUpperCase() || 'U'}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <h3 style={{ color: '#F5F5F5', fontSize: 24, fontWeight: 800 }}>
              {profile?.username || 'Player'}
            </h3>
            {profile?.title && (
              <span style={{ background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.3)',
                borderRadius: 6, padding: '2px 8px',
                color: '#FFD700', fontSize: 12, fontWeight: 700 }}>
                {profile.title}
              </span>
            )}
          </div>
          <p style={{ color: '#606078', fontSize: 13 }}>
            Member since {new Date(profile?.created_at || Date.now()).getFullYear()}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 24 }}>
          {[
            { label: 'GAMES', value: profile?.games_played || 0, color: '#A0A0B8' },
            { label: 'WINS', value: wins, color: '#00FF88' },
            { label: 'LOSSES', value: losses, color: '#FF3366' },
            { label: 'DRAWS', value: draws, color: '#FFD700' },
          ].map((s) => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ color: s.color, fontSize: 28, fontWeight: 900 }}>{s.value}</div>
              <div style={{ color: '#606078', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em' }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 16, marginBottom: 24 }}>
        {ratingCards.map((card) => (
          <div key={card.label} className="stat-card"
            style={{ borderRadius: 16, padding: 20, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${card.color}20, transparent)`,
              filter: 'blur(20px)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <div style={{ color: card.color }}>{card.icon}</div>
              <span style={{ color: '#606078', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em' }}>
                {card.label}
              </span>
            </div>
            <div style={{ fontSize: 36, fontWeight: 900, color: card.color,
              fontFamily: 'Poppins', textShadow: `0 0 20px ${card.color}60` }}>
              {card.value}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6 }}>
              <TrendingUp size={12} color="#00FF88" />
              <span style={{ color: '#00FF88', fontSize: 11, fontWeight: 600 }}>+12 this week</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 24 }}>
        {/* Win rate */}
        <div style={{ background: '#0D0D14', border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 16, padding: 20 }}>
          <h4 style={{ color: '#A0A0B8', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', marginBottom: 16 }}>
            WIN RATE
          </h4>
          <div style={{ fontSize: 40, fontWeight: 900, color: '#00FF88',
            textShadow: '0 0 20px rgba(0,255,136,0.4)', marginBottom: 12 }}>
            {winrate}%
          </div>
          <div style={{ height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${winrate}%`,
              background: 'linear-gradient(90deg, #00FF88, #00F5FF)',
              borderRadius: 3, transition: 'width 1s ease' }} />
          </div>
        </div>

        {/* Accuracy */}
        <div style={{ background: '#0D0D14', border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 16, padding: 20 }}>
          <h4 style={{ color: '#A0A0B8', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', marginBottom: 16 }}>
            ACCURACY
          </h4>
          <div style={{ fontSize: 40, fontWeight: 900, color: '#3A86FF',
            textShadow: '0 0 20px rgba(58,134,255,0.4)', marginBottom: 12 }}>
            {profile?.accuracy_avg?.toFixed(0) || 72}%
          </div>
          <div style={{ height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${profile?.accuracy_avg || 72}%`,
              background: 'linear-gradient(90deg, #3A86FF, #7B2FF7)',
              borderRadius: 3, transition: 'width 1s ease' }} />
          </div>
        </div>

        {/* Best rating */}
        <div style={{ background: '#0D0D14', border: '1px solid rgba(255,215,0,0.1)',
          borderRadius: 16, padding: 20 }}>
          <h4 style={{ color: '#A0A0B8', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', marginBottom: 16 }}>
            PEAK RATING
          </h4>
          <div style={{ fontSize: 40, fontWeight: 900, color: '#FFD700',
            textShadow: '0 0 20px rgba(255,215,0,0.4)', marginBottom: 12 }}>
            {Math.max(profile?.rating_rapid || 1200, profile?.rating_blitz || 1200, profile?.rating_bullet || 1200)}
          </div>
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            <Trophy size={12} color="#FFD700" />
            <span style={{ color: '#606078', fontSize: 11 }}>All-time peak</span>
          </div>
        </div>
      </div>

      {/* Leaderboard */}
      <div style={{ background: '#0D0D14', border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 20, overflow: 'hidden' }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Trophy size={16} color="#FFD700" />
            <span style={{ color: '#F5F5F5', fontSize: 14, fontWeight: 700 }}>Global Leaderboard</span>
          </div>
          <span style={{ color: '#606078', fontSize: 12 }}>Top 5 Players</span>
        </div>
        {LEADERBOARD_MOCK.map((p, i) => (
          <div key={p.rank} className="leaderboard-row" style={{
            display: 'flex', alignItems: 'center', gap: 16,
            padding: '14px 24px',
            borderBottom: '1px solid rgba(255,255,255,0.03)',
            background: i % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'transparent',
          }}>
            <div style={{ width: 32, textAlign: 'center' }}>
              {p.rank <= 3 ? (
                <span style={{ fontSize: 18 }}>
                  {p.rank === 1 ? '🥇' : p.rank === 2 ? '🥈' : '🥉'}
                </span>
              ) : (
                <span style={{ color: '#606078', fontSize: 13, fontWeight: 700 }}>#{p.rank}</span>
              )}
            </div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%',
                background: `linear-gradient(135deg, ${['#FFD700','#A0A0B8','#CD7F32','#7B2FF7','#3A86FF'][i]}, ${['#FFA500','#808080','#8B4513','#9B4FFF','#60A5FA'][i]})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, fontWeight: 700, color: '#fff' }}>
                {p.username.charAt(0)}
              </div>
              <div>
                <div style={{ color: '#F5F5F5', fontSize: 13, fontWeight: 700 }}>
                  {p.username}
                </div>
                <div style={{ color: '#606078', fontSize: 11 }}>{p.country}</div>
              </div>
            </div>
            <div style={{ color: '#7B2FF7', fontSize: 16, fontWeight: 800, minWidth: 50, textAlign: 'right' }}>
              {p.rating}
            </div>
            <div style={{ minWidth: 60, textAlign: 'right' }}>
              <span style={{ color: '#00FF88', fontSize: 12, fontWeight: 700 }}>
                {p.winrate}% W
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Dashboard;
