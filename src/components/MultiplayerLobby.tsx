import React, { useState, useEffect, useCallback } from 'react';
import { Chess } from 'chess.js';
import { Users, Plus, Copy, ArrowRight, RefreshCw, Wifi } from 'lucide-react';
import { ChessBoard } from './ChessBoard';
import { supabase, MultiplayerRoom } from '../lib/supabase';
import type { AuthUser } from '../types';

interface MultiplayerLobbyProps {
  user: AuthUser | null;
  onAuthClick: () => void;
}

function generateRoomCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export const MultiplayerLobby: React.FC<MultiplayerLobbyProps> = ({ user, onAuthClick }) => {
  const [view, setView] = useState<'lobby' | 'waiting' | 'game'>('lobby');
  const [roomCode, setRoomCode] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [room, setRoom] = useState<MultiplayerRoom | null>(null);
  const [chess] = useState(() => new Chess());
  const [fen, setFen] = useState(chess.fen());
  const [playerColor, setPlayerColor] = useState<'w' | 'b'>('w');
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [gameResult, setGameResult] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<{ text: string; from: string }[]>([]);
  const [chatInput, setChatInput] = useState('');

  const createRoom = async () => {
    if (!user) { onAuthClick(); return; }
    const code = generateRoomCode();
    const { data, error: err } = await supabase.from('multiplayer_rooms').insert({
      room_code: code,
      host_id: user.id,
      white_id: user.id,
      white_username: user.profile?.username || 'Player',
      status: 'waiting',
      time_control: '10+0',
    }).select().maybeSingle();

    if (err) { setError('Failed to create room.'); return; }
    setRoom(data);
    setRoomCode(code);
    setPlayerColor('w');
    setView('waiting');
    subscribeToRoom(code);
  };

  const joinRoom = async () => {
    if (!user) { onAuthClick(); return; }
    const code = joinCode.trim().toUpperCase();
    if (!code) return;

    const { data: existing } = await supabase
      .from('multiplayer_rooms')
      .select()
      .eq('room_code', code)
      .maybeSingle();

    if (!existing) { setError('Room not found.'); return; }
    if (existing.status !== 'waiting') { setError('Room is full or game already started.'); return; }

    const { data, error: err } = await supabase
      .from('multiplayer_rooms')
      .update({
        black_id: user.id,
        black_username: user.profile?.username || 'Player',
        status: 'playing',
        updated_at: new Date().toISOString(),
      })
      .eq('room_code', code)
      .select()
      .maybeSingle();

    if (err) { setError('Failed to join room.'); return; }
    setRoom(data);
    setRoomCode(code);
    setPlayerColor('b');
    chess.reset();
    setFen(chess.fen());
    setView('game');
    subscribeToRoom(code);
  };

  const subscribeToRoom = useCallback((code: string) => {
    const channel = supabase
      .channel(`room:${code}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'multiplayer_rooms',
        filter: `room_code=eq.${code}`,
      }, (payload) => {
        const updated = payload.new as MultiplayerRoom;
        setRoom(updated);
        if (updated.status === 'playing' && view === 'waiting') {
          chess.reset();
          setFen(chess.fen());
          setView('game');
        }
        if (updated.current_fen && updated.current_fen !== chess.fen()) {
          chess.load(updated.current_fen);
          setFen(updated.current_fen);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [chess, view]);

  const handleMove = async (from: string, to: string, san: string, newFen: string) => {
    chess.load(newFen);
    setFen(newFen);
    setLastMove({ from, to });

    if (room) {
      await supabase.from('multiplayer_rooms').update({
        current_fen: newFen,
        turn: chess.turn(),
        pgn: chess.pgn(),
        updated_at: new Date().toISOString(),
      }).eq('room_code', room.room_code);
    }

    if (chess.isCheckmate()) {
      setGameResult(chess.turn() === 'w' ? 'Black wins by checkmate!' : 'White wins by checkmate!');
    }
    if (chess.isDraw()) setGameResult("It's a draw!");
  };

  const copyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sendChat = async () => {
    if (!chatInput.trim()) return;
    setChatMessages((m) => [...m, { text: chatInput, from: user?.profile?.username || 'You' }]);
    setChatInput('');
  };

  return (
    <section id="multiplayer" style={{ padding: '80px 24px', maxWidth: 1400, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'rgba(58,134,255,0.08)', border: '1px solid rgba(58,134,255,0.2)',
          borderRadius: 100, padding: '6px 16px', marginBottom: 16 }}>
          <Users size={14} color="#3A86FF" />
          <span style={{ color: '#3A86FF', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em' }}>MULTIPLAYER</span>
        </div>
        <h2 style={{ fontSize: 40, fontWeight: 900, fontFamily: 'Poppins',
          background: 'linear-gradient(135deg, #ffffff, #3A86FF)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
          Play Friends
        </h2>
        <p style={{ color: '#606078', fontSize: 14, marginTop: 8 }}>
          Real-time chess with friends via room codes
        </p>
      </div>

      {view === 'lobby' && (
        <div style={{ maxWidth: 600, margin: '0 auto', display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          {/* Create room */}
          <div style={{ flex: 1, minWidth: 260, background: '#0D0D14',
            border: '1px solid rgba(58,134,255,0.15)', borderRadius: 20, padding: 32,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(58,134,255,0.2), rgba(123,47,247,0.2))',
              border: '1px solid rgba(58,134,255,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Plus size={28} color="#3A86FF" />
            </div>
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ color: '#F5F5F5', fontSize: 18, fontWeight: 700, marginBottom: 6 }}>
                Create Room
              </h3>
              <p style={{ color: '#606078', fontSize: 13 }}>
                Get a room code and share it with a friend
              </p>
            </div>
            <button onClick={createRoom}
              style={{ width: '100%', padding: '12px', borderRadius: 10,
                background: 'linear-gradient(135deg, #3A86FF, #7B2FF7)',
                border: 'none', cursor: 'pointer', color: '#fff',
                fontSize: 13, fontWeight: 700, letterSpacing: '0.08em',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'all 0.3s ease' }}
              onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 0 25px rgba(58,134,255,0.4)'}
              onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}>
              <Plus size={16} /> CREATE ROOM
            </button>
          </div>

          {/* Join room */}
          <div style={{ flex: 1, minWidth: 260, background: '#0D0D14',
            border: '1px solid rgba(123,47,247,0.15)', borderRadius: 20, padding: 32,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(123,47,247,0.2), rgba(0,245,255,0.1))',
              border: '1px solid rgba(123,47,247,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ArrowRight size={28} color="#9B4FFF" />
            </div>
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ color: '#F5F5F5', fontSize: 18, fontWeight: 700, marginBottom: 6 }}>
                Join Room
              </h3>
              <p style={{ color: '#606078', fontSize: 13 }}>
                Enter a room code to join a friend's game
              </p>
            </div>
            <input
              className="input-futuristic"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => { if (e.key === 'Enter') joinRoom(); }}
              placeholder="ENTER CODE"
              maxLength={6}
              style={{ width: '100%', padding: '12px 16px', borderRadius: 10,
                fontSize: 18, fontWeight: 800, letterSpacing: '0.2em',
                textAlign: 'center', fontFamily: 'monospace' }}
            />
            {error && <p style={{ color: '#FF3366', fontSize: 12 }}>{error}</p>}
            <button onClick={joinRoom}
              style={{ width: '100%', padding: '12px', borderRadius: 10,
                background: 'linear-gradient(135deg, #7B2FF7, #3A86FF)',
                border: 'none', cursor: 'pointer', color: '#fff',
                fontSize: 13, fontWeight: 700, letterSpacing: '0.08em',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'all 0.3s ease' }}
              onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 0 25px rgba(123,47,247,0.4)'}
              onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}>
              JOIN ROOM
            </button>
          </div>
        </div>
      )}

      {view === 'waiting' && (
        <div style={{ maxWidth: 480, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ background: '#0D0D14', border: '1px solid rgba(58,134,255,0.2)',
            borderRadius: 20, padding: 48 }}>
            <div style={{ marginBottom: 24 }}>
              <Wifi size={48} color="#3A86FF" style={{ margin: '0 auto 16px',
                animation: 'glowPulse 2s ease-in-out infinite' }} />
              <h3 style={{ color: '#F5F5F5', fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
                Waiting for opponent...
              </h3>
              <p style={{ color: '#606078', fontSize: 14 }}>
                Share this room code with your friend
              </p>
            </div>
            <div style={{ background: 'rgba(58,134,255,0.08)',
              border: '1px solid rgba(58,134,255,0.3)',
              borderRadius: 12, padding: '20px 32px', marginBottom: 24,
              display: 'flex', alignItems: 'center', gap: 16, justifyContent: 'center' }}>
              <span style={{ fontSize: 36, fontWeight: 900, letterSpacing: '0.2em',
                color: '#3A86FF', fontFamily: 'monospace',
                textShadow: '0 0 20px rgba(58,134,255,0.5)' }}>
                {roomCode}
              </span>
              <button onClick={copyCode}
                style={{ background: copied ? 'rgba(0,255,136,0.1)' : 'rgba(255,255,255,0.06)',
                  border: `1px solid ${copied ? 'rgba(0,255,136,0.3)' : 'rgba(255,255,255,0.1)'}`,
                  borderRadius: 8, padding: '8px', cursor: 'pointer',
                  color: copied ? '#00FF88' : '#A0A0B8', transition: 'all 0.2s' }}>
                <Copy size={18} />
              </button>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 24 }}>
              {[0,1,2].map(i => (
                <div key={i} style={{ width: 10, height: 10, borderRadius: '50%',
                  background: '#3A86FF',
                  animation: `aiThink 1.2s ease-in-out ${i * 0.4}s infinite` }} />
              ))}
            </div>
            <button onClick={() => { setView('lobby'); setRoom(null); setRoomCode(''); }}
              style={{ padding: '10px 24px', background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8,
                cursor: 'pointer', color: '#A0A0B8', fontSize: 13 }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {view === 'game' && (
        <div style={{ display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap' }}>
          <div>
            {/* Opponent */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              marginBottom: 8, padding: '0 4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #333, #111)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
                  border: '1px solid rgba(255,255,255,0.1)' }}>
                  {(playerColor === 'w' ? room?.black_username : room?.white_username)?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <span style={{ color: '#F5F5F5', fontSize: 13, fontWeight: 700 }}>
                  {playerColor === 'w' ? (room?.black_username || 'Waiting...') : (room?.white_username || 'Waiting...')}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#00FF88' }} />
                <span style={{ color: '#00FF88', fontSize: 11, fontWeight: 600 }}>Online</span>
              </div>
            </div>

            <ChessBoard
              fen={fen}
              flipped={playerColor === 'b'}
              onMove={handleMove}
              disabled={chess.turn() !== playerColor}
              playerColor={playerColor}
              lastMove={lastMove}
              size={480}
            />

            {/* You */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              marginTop: 8, padding: '0 4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #7B2FF7, #3A86FF)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 700, color: '#fff' }}>
                  {user?.profile?.username?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span style={{ color: '#F5F5F5', fontSize: 13, fontWeight: 700 }}>
                  {user?.profile?.username || 'You'} ({playerColor === 'w' ? 'White' : 'Black'})
                </span>
              </div>
            </div>
          </div>

          {/* Chat + controls */}
          <div style={{ width: 260, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Room info */}
            <div style={{ background: '#0D0D14', border: '1px solid rgba(58,134,255,0.15)',
              borderRadius: 12, padding: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ color: '#A0A0B8', fontSize: 11, fontWeight: 700 }}>ROOM</span>
                <span style={{ color: '#3A86FF', fontSize: 14, fontWeight: 800,
                  fontFamily: 'monospace', letterSpacing: '0.1em' }}>{roomCode}</span>
              </div>
              <div style={{ color: '#606078', fontSize: 12 }}>
                {chess.turn() === playerColor ? 'Your turn' : "Opponent's turn"}
                {chess.inCheck() && <span style={{ color: '#FF3366', marginLeft: 8 }}>CHECK!</span>}
              </div>
            </div>

            {/* Game result */}
            {gameResult && (
              <div style={{ background: 'rgba(123,47,247,0.15)',
                border: '1px solid rgba(123,47,247,0.4)',
                borderRadius: 12, padding: 16, textAlign: 'center' }}>
                <p style={{ color: '#F5F5F5', fontSize: 16, fontWeight: 700, marginBottom: 10 }}>
                  {gameResult}
                </p>
                <button onClick={() => { setView('lobby'); chess.reset(); setFen(chess.fen()); setGameResult(null); }}
                  style={{ padding: '8px 20px', background: 'linear-gradient(135deg, #7B2FF7, #3A86FF)',
                    border: 'none', borderRadius: 8, cursor: 'pointer', color: '#fff',
                    fontSize: 12, fontWeight: 700 }}>
                  <RefreshCw size={12} style={{ display: 'inline', marginRight: 6 }} />
                  NEW GAME
                </button>
              </div>
            )}

            {/* Live chat */}
            <div style={{ background: '#0D0D14', border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 12, overflow: 'hidden', flex: 1 }}>
              <div style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ color: '#A0A0B8', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em' }}>
                  LIVE CHAT
                </span>
              </div>
              <div style={{ height: 200, overflowY: 'auto', padding: 10,
                display: 'flex', flexDirection: 'column', gap: 6 }}>
                {chatMessages.length === 0 && (
                  <p style={{ color: '#606078', fontSize: 12, textAlign: 'center', marginTop: 20 }}>
                    Say hello!
                  </p>
                )}
                {chatMessages.map((msg, i) => (
                  <div key={i} style={{ fontSize: 12, lineHeight: 1.5 }}>
                    <span style={{ color: '#7B2FF7', fontWeight: 700 }}>{msg.from}: </span>
                    <span style={{ color: '#A0A0B8' }}>{msg.text}</span>
                  </div>
                ))}
              </div>
              <div style={{ padding: 8, display: 'flex', gap: 6,
                borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <input
                  className="input-futuristic"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') sendChat(); }}
                  placeholder="Message..."
                  style={{ flex: 1, padding: '6px 10px', borderRadius: 6, fontSize: 12 }}
                />
                <button onClick={sendChat}
                  style={{ padding: '6px 10px', background: 'rgba(123,47,247,0.2)',
                    border: '1px solid rgba(123,47,247,0.3)', borderRadius: 6,
                    cursor: 'pointer', color: '#9B4FFF' }}>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default MultiplayerLobby;
