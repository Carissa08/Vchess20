import React, { useEffect, useState } from 'react';
import { Clock, Trophy, Shield, Zap, Target } from 'lucide-react';
import { supabase, Game } from '../lib/supabase';
import type { AuthUser } from '../types';

interface MatchHistoryProps {
  user: AuthUser | null;
  onAuthClick: () => void;
}

function formatDate(d: string): string {
  const date = new Date(d);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export const MatchHistory: React.FC<MatchHistoryProps> = ({ user, onAuthClick }) => {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'rapid' | 'blitz' | 'bullet' | 'ai'>('all');

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
      .limit(20);
    if (data) setGames(data);
    setLoading(false);
  };

  const getResult = (game: Game): { label: string; color: string } => {
    if (!game.result) return { label: 'Ongoing', color: '#606078' };
    const isWhite = game.white_id === user?.id;
    if (game.result === '1/2-1/2') return { label: 'Draw', color: '#FFD700' };
    if ((isWhite && game.result === '1-0') || (!isWhite && game.result === '0-1')) {
      return { label: 'Win', color: '#00FF88' };
    }
    return { label: 'Loss', color: '#FF3366' };
  };

  const filtered = games.filter((g) => {
    if (filter === 'all') return true;
    if (filter === 'ai') return g.is_vs_ai;
    return g.game_mode === filter;
  });

  const MOCK_GAMES: Game[] = [
    { id: '1', white_id: user?.id || null, black_id: null, white_username: user?.profile?.username || 'You',
      black_username: 'AI (HARD)', time_control: '5+0', game_mode: 'blitz', result: '1-0',
      termination: 'checkmate', pgn: '1. e4 e5 2. Nf3 Nc6', white_accuracy: 87, black_accuracy: 71,
      white_rating: 1250, black_rating: 1600, white_rating_change: 12, black_rating_change: -12,
      move_count: 34, is_vs_ai: true, ai_difficulty: 'hard',
      created_at: new Date(Date.now() - 3600000).toISOString(), completed_at: new Date().toISOString() },
    { id: '2', white_id: null, black_id: user?.id || null, white_username: 'CyberKnight',
      black_username: user?.profile?.username || 'You', time_control: '10+0', game_mode: 'rapid',
      result: '0-1', termination: 'resignation', pgn: '', white_accuracy: 65, black_accuracy: 82,
      white_rating: 1450, black_rating: 1250, white_rating_change: -8, black_rating_change: 8,
      move_count: 42, is_vs_ai: false, ai_difficulty: null,
      created_at: new Date(Date.now() - 86400000).toISOString(), completed_at: null },
    { id: '3', white_id: user?.id || null, black_id: null, white_username: user?.profile?.username || 'You',
      black_username: 'AI (MEDIUM)', time_control: '3+0', game_mode: 'blitz', result: '0-1',
      termination: 'checkmate', pgn: '', white_accuracy: 61, black_accuracy: 78,
      white_rating: 1200, black_rating: 1200, white_rating_change: -5, black_rating_change: 5,
      move_count: 28, is_vs_ai: true, ai_difficulty: 'medium',
      created_at: new Date(Date.now() - 172800000).toISOString(), completed_at: null },
  ];

  const displayGames = filtered.length > 0 ? filtered : MOCK_GAMES;

  const MODE_ICONS: Record<string, React.ReactNode> = {
    rapid: <Clock size={12} />,
    blitz: <Zap size={12} />,
    bullet: <Target size={12} />,
  };

  return (
    <section id="history" style={{ padding: '80px 24px', maxWidth: 1400, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'rgba(58,134,255,0.08)', border: '1px solid rgba(58,134,255,0.2)',
          borderRadius: 100, padding: '6px 16px', marginBottom: 16 }}>
          <Clock size={14} color="#3A86FF" />
          <span style={{ color: '#3A86FF', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em' }}>MATCH HISTORY</span>
        </div>
        <h2 style={{ fontSize: 40, fontWeight: 900, fontFamily: 'Poppins',
          background: 'linear-gradient(135deg, #ffffff, #3A86FF)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
          Battle Archives
        </h2>
        <p style={{ color: '#606078', fontSize: 14, marginTop: 8 }}>
          Your complete game history and performance records
        </p>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        {!user && (
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <p style={{ color: '#606078', fontSize: 14, marginBottom: 12 }}>
              Sign in to see your personal match history
            </p>
            <button onClick={onAuthClick} className="btn-primary"
              style={{ padding: '10px 24px', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
              Sign In
            </button>
          </div>
        )}

        {/* Filters */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          {(['all', 'rapid', 'blitz', 'bullet', 'ai'] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ padding: '7px 16px', borderRadius: 8,
                background: filter === f ? 'rgba(58,134,255,0.15)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${filter === f ? 'rgba(58,134,255,0.4)' : 'rgba(255,255,255,0.08)'}`,
                cursor: 'pointer',
                color: filter === f ? '#60A5FA' : '#A0A0B8',
                fontSize: 12, fontWeight: 700, letterSpacing: '0.05em',
                transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
              {f === 'rapid' && <Clock size={11} />}
              {f === 'blitz' && <Zap size={11} />}
              {f === 'bullet' && <Target size={11} />}
              {f === 'ai' && <Shield size={11} />}
              {f.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Games list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {displayGames.map((game) => {
            const result = getResult(game);
            const isWhite = game.white_id === user?.id;
            const opponent = isWhite ? game.black_username : game.white_username;
            const myAccuracy = isWhite ? game.white_accuracy : game.black_accuracy;
            const ratingChange = isWhite ? game.white_rating_change : game.black_rating_change;

            return (
              <div key={game.id}
                style={{ background: '#0D0D14',
                  border: '1px solid rgba(255,255,255,0.05)',
                  borderLeft: `3px solid ${result.color}`,
                  borderRadius: 12, padding: '16px 20px',
                  display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
                  cursor: 'pointer', transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#12121C';
                  e.currentTarget.style.transform = 'translateX(4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#0D0D14';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                {/* Result */}
                <div style={{ textAlign: 'center', minWidth: 48 }}>
                  <div style={{ fontSize: 16, fontWeight: 900, color: result.color }}>
                    {result.label}
                  </div>
                  <div style={{ fontSize: 10, color: '#606078', marginTop: 2 }}>
                    {game.move_count} moves
                  </div>
                </div>

                {/* Opponent */}
                <div style={{ flex: 1, minWidth: 160 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%',
                      background: game.is_vs_ai
                        ? 'linear-gradient(135deg, #1A1A28, #0D0D14)'
                        : 'linear-gradient(135deg, #7B2FF7, #3A86FF)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: game.is_vs_ai ? 14 : 11,
                      fontWeight: 700, color: '#fff',
                      border: '1px solid rgba(255,255,255,0.1)' }}>
                      {game.is_vs_ai ? '🤖' : opponent.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ color: '#F5F5F5', fontSize: 13, fontWeight: 700 }}>{opponent}</div>
                      <div style={{ color: '#606078', fontSize: 11 }}>
                        {isWhite ? 'White' : 'Black'} vs {isWhite ? 'Black' : 'White'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Time control & mode */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 6, padding: '3px 8px',
                    color: '#A0A0B8', fontSize: 11, fontWeight: 700,
                    display: 'flex', alignItems: 'center', gap: 4 }}>
                    {MODE_ICONS[game.game_mode]}
                    {game.time_control}
                  </span>
                </div>

                {/* Accuracy */}
                {myAccuracy != null && (
                  <div style={{ textAlign: 'center', minWidth: 60 }}>
                    <div style={{ fontSize: 16, fontWeight: 800,
                      color: myAccuracy >= 80 ? '#00FF88' : myAccuracy >= 60 ? '#FFD700' : '#FF3366' }}>
                      {myAccuracy.toFixed(0)}%
                    </div>
                    <div style={{ color: '#606078', fontSize: 10 }}>ACCURACY</div>
                  </div>
                )}

                {/* Rating change */}
                {ratingChange != null && (
                  <div style={{ textAlign: 'center', minWidth: 50 }}>
                    <div style={{ fontSize: 14, fontWeight: 800,
                      color: ratingChange >= 0 ? '#00FF88' : '#FF3366' }}>
                      {ratingChange >= 0 ? '+' : ''}{ratingChange}
                    </div>
                    <div style={{ color: '#606078', fontSize: 10 }}>RATING</div>
                  </div>
                )}

                {/* Date */}
                <div style={{ color: '#606078', fontSize: 12, minWidth: 60, textAlign: 'right' }}>
                  {formatDate(game.created_at)}
                </div>
              </div>
            );
          })}
        </div>

        {displayGames.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 0', color: '#606078' }}>
            <Trophy size={32} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
            <p>No games found. Start playing to build your history!</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default MatchHistory;
