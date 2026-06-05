import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Chess } from 'chess.js';
import { Brain, RotateCcw, Flag, RefreshCw, Clock, Zap, ChevronRight, Volume2, VolumeX } from 'lucide-react';
import { ChessBoard } from './ChessBoard';
import { getBestMove, getEvalScore, AIDifficulty } from '../lib/chess-ai';
import type { AuthUser } from '../types';
import { supabase } from '../lib/supabase';

interface ArenaProps {
  user: AuthUser | null;
  onAuthClick: () => void;
}

const DIFFICULTIES: { id: AIDifficulty; label: string; rating: number; color: string }[] = [
  { id: 'beginner', label: 'BEGINNER', rating: 400, color: '#00FF88' },
  { id: 'easy', label: 'EASY', rating: 800, color: '#3A86FF' },
  { id: 'medium', label: 'MEDIUM', rating: 1200, color: '#FFD700' },
  { id: 'hard', label: 'HARD', rating: 1600, color: '#FFA500' },
  { id: 'master', label: 'MASTER', rating: 2200, color: '#FF3366' },
];

const TIME_CONTROLS = [
  { label: '1 min', seconds: 60 },
  { label: '3 min', seconds: 180 },
  { label: '5 min', seconds: 300 },
  { label: '10 min', seconds: 600 },
  { label: '∞', seconds: 0 },
];

function formatTime(seconds: number): string {
  if (seconds === 0) return '∞';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function getMoveClass(san: string): string {
  if (san.includes('!!')) return 'brilliant';
  if (san.includes('!')) return 'great';
  if (san.includes('??')) return 'blunder';
  if (san.includes('?')) return 'mistake';
  return 'best';
}

const CLASSIFICATION_COLORS: Record<string, string> = {
  brilliant: '#00F5FF',
  great: '#00FF88',
  best: '#3A86FF',
  excellent: '#7B2FF7',
  good: '#A0A0B8',
  inaccuracy: '#FFD700',
  mistake: '#FFA500',
  blunder: '#FF3366',
};

export const Arena: React.FC<ArenaProps> = ({ user, onAuthClick }) => {
  const [chess] = useState(() => new Chess());
  const [fen, setFen] = useState(chess.fen());
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [gameResult, setGameResult] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<AIDifficulty>('medium');
  const [playerColor, setPlayerColor] = useState<'w' | 'b'>('w');
  const [aiThinking, setAiThinking] = useState(false);
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);
  const [evalScore, setEvalScore] = useState(0);
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [capturedWhite, setCapturedWhite] = useState<string[]>([]);
  const [capturedBlack, setCapturedBlack] = useState<string[]>([]);
  const [timeControl, setTimeControl] = useState(300);
  const [whiteTime, setWhiteTime] = useState(300);
  const [blackTime, setBlackTime] = useState(300);
  const [timerRunning, setTimerRunning] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [checkedKing, setCheckedKing] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const updateCaptured = (c: Chess) => {
    const history = c.history({ verbose: true });
    const wc: string[] = [];
    const bc: string[] = [];
    history.forEach((m) => {
      if (m.captured) {
        if (m.color === 'w') wc.push(m.captured);
        else bc.push(m.captured);
      }
    });
    setCapturedWhite(wc);
    setCapturedBlack(bc);
  };

  const getCheckedKingSquare = (c: Chess): string | null => {
    if (!c.inCheck()) return null;
    const board = c.board();
    const turn = c.turn();
    for (let r = 0; r < 8; r++) {
      for (let f = 0; f < 8; f++) {
        const p = board[r][f];
        if (p && p.type === 'k' && p.color === turn) {
          return `${'abcdefgh'[f]}${8 - r}`;
        }
      }
    }
    return null;
  };

  const startTimer = useCallback(() => {
    if (timeControl === 0) return;
    setTimerRunning(true);
  }, [timeControl]);

  useEffect(() => {
    if (!timerRunning || gameOver || timeControl === 0) return;
    timerRef.current = setInterval(() => {
      const turn = chess.turn();
      if (turn === 'w') {
        setWhiteTime((t) => {
          if (t <= 1) { endGame('b', 'timeout'); return 0; }
          return t - 1;
        });
      } else {
        setBlackTime((t) => {
          if (t <= 1) { endGame('w', 'timeout'); return 0; }
          return t - 1;
        });
      }
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timerRunning, gameOver, chess.turn()]);

  const endGame = (winner: string | null, reason: string) => {
    setGameOver(true);
    setTimerRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
    let result = '';
    if (reason === 'checkmate') result = winner === playerColor ? 'You Win by Checkmate!' : 'AI Wins by Checkmate!';
    else if (reason === 'timeout') result = winner === playerColor ? 'You Win — AI Out of Time!' : 'AI Wins — You\'re Out of Time!';
    else if (reason === 'draw') result = 'Draw!';
    else if (reason === 'resign') result = 'You Resigned.';
    setGameResult(result);
    saveGame(reason, winner);
  };

  const saveGame = async (termination: string, winner: string | null) => {
    if (!user) return;
    try {
      const diff = DIFFICULTIES.find((d) => d.id === difficulty);
      await supabase.from('games').insert({
        white_id: playerColor === 'w' ? user.id : null,
        black_id: playerColor === 'b' ? user.id : null,
        white_username: playerColor === 'w' ? (user.profile?.username || 'Player') : `AI (${diff?.label})`,
        black_username: playerColor === 'b' ? (user.profile?.username || 'Player') : `AI (${diff?.label})`,
        time_control: timeControl === 0 ? '∞' : `${Math.floor(timeControl / 60)}+0`,
        game_mode: timeControl <= 60 ? 'bullet' : timeControl <= 300 ? 'blitz' : 'rapid',
        result: winner === 'w' ? '1-0' : winner === 'b' ? '0-1' : '1/2-1/2',
        termination,
        pgn: chess.pgn(),
        move_count: chess.history().length,
        is_vs_ai: true,
        ai_difficulty: difficulty,
      });
    } catch (_) {}
  };

  const handleMove = useCallback((from: string, to: string, san: string, newFen: string) => {
    chess.load(newFen);
    setFen(newFen);
    setLastMove({ from, to });
    setMoveHistory(chess.history());
    setEvalScore(getEvalScore(newFen));
    setCheckedKing(getCheckedKingSquare(chess));
    updateCaptured(chess);

    if (chess.isCheckmate()) { endGame(chess.turn() === 'w' ? 'b' : 'w', 'checkmate'); return; }
    if (chess.isDraw()) { endGame(null, 'draw'); return; }

    if (chess.turn() !== playerColor) {
      setAiThinking(true);
      setTimeout(() => {
        const move = getBestMove(newFen, difficulty);
        if (move) {
          const testChess = new Chess(newFen);
          const result = testChess.move(move);
          if (result) {
            chess.load(testChess.fen());
            setFen(testChess.fen());
            setLastMove({ from: result.from, to: result.to });
            setMoveHistory(chess.history());
            setEvalScore(getEvalScore(testChess.fen()));
            setCheckedKing(getCheckedKingSquare(testChess));
            updateCaptured(testChess);
            if (testChess.isCheckmate()) { endGame(testChess.turn() === 'w' ? 'b' : 'w', 'checkmate'); }
            if (testChess.isDraw()) { endGame(null, 'draw'); }
          }
        }
        setAiThinking(false);
      }, 300 + Math.random() * 600);
    }
  }, [chess, playerColor, difficulty]);

  const startNewGame = () => {
    chess.reset();
    setFen(chess.fen());
    setGameStarted(true);
    setGameOver(false);
    setGameResult(null);
    setLastMove(null);
    setEvalScore(0);
    setMoveHistory([]);
    setCapturedWhite([]);
    setCapturedBlack([]);
    setCheckedKing(null);
    setWhiteTime(timeControl);
    setBlackTime(timeControl);
    setAiThinking(false);
    startTimer();

    if (playerColor === 'b') {
      setAiThinking(true);
      setTimeout(() => {
        const move = getBestMove(chess.fen(), difficulty);
        if (move) {
          chess.move(move as never);
          setFen(chess.fen());
          setLastMove(null);
          setMoveHistory(chess.history());
        }
        setAiThinking(false);
      }, 500);
    }
  };

  const handleResign = () => endGame(playerColor === 'w' ? 'b' : 'w', 'resign');

  const evalPercent = Math.max(5, Math.min(95, ((evalScore + 20) / 40) * 100));

  const PIECE_SYMBOLS: Record<string, string> = { p: '♟', n: '♞', b: '♝', r: '♜', q: '♛' };

  return (
    <section id="arena" style={{ padding: '80px 24px', maxWidth: 1400, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'rgba(123,47,247,0.1)', border: '1px solid rgba(123,47,247,0.2)',
          borderRadius: 100, padding: '6px 16px', marginBottom: 16 }}>
          <Zap size={14} color="#7B2FF7" />
          <span style={{ color: '#9B4FFF', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em' }}>CHESS ARENA</span>
        </div>
        <h2 style={{ fontSize: 40, fontWeight: 900, fontFamily: 'Poppins', letterSpacing: '-0.02em',
          background: 'linear-gradient(135deg, #ffffff, #9B4FFF)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
          Battle the AI
        </h2>
        <p style={{ color: '#606078', fontSize: 14, marginTop: 8 }}>
          Challenge Stockfish-powered AI across 5 difficulty levels
        </p>
      </div>

      {!gameStarted ? (
        /* Setup Screen */
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <div style={{ background: '#0D0D14', border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 20, padding: 40 }}>
            {/* Color selection */}
            <div style={{ marginBottom: 32 }}>
              <p style={{ color: '#A0A0B8', fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', marginBottom: 12 }}>
                PLAY AS
              </p>
              <div style={{ display: 'flex', gap: 12 }}>
                {(['w', 'b'] as const).map((c) => (
                  <button
                    key={c}
                    onClick={() => setPlayerColor(c)}
                    style={{
                      flex: 1, padding: '14px 20px',
                      background: playerColor === c ? 'rgba(123,47,247,0.15)' : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${playerColor === c ? 'rgba(123,47,247,0.5)' : 'rgba(255,255,255,0.08)'}`,
                      borderRadius: 10, cursor: 'pointer',
                      color: playerColor === c ? '#9B4FFF' : '#A0A0B8',
                      fontSize: 24, transition: 'all 0.2s',
                      boxShadow: playerColor === c ? '0 0 20px rgba(123,47,247,0.2)' : 'none',
                    }}
                  >
                    {c === 'w' ? '♔' : '♚'}
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', marginTop: 4,
                      color: playerColor === c ? '#9B4FFF' : '#606078' }}>
                      {c === 'w' ? 'WHITE' : 'BLACK'}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty */}
            <div style={{ marginBottom: 32 }}>
              <p style={{ color: '#A0A0B8', fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', marginBottom: 12 }}>
                AI DIFFICULTY
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {DIFFICULTIES.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => setDifficulty(d.id)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '12px 16px',
                      background: difficulty === d.id ? 'rgba(123,47,247,0.12)' : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${difficulty === d.id ? 'rgba(123,47,247,0.4)' : 'rgba(255,255,255,0.06)'}`,
                      borderRadius: 8, cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: d.color,
                        boxShadow: `0 0 8px ${d.color}` }} />
                      <span style={{ color: difficulty === d.id ? '#F5F5F5' : '#A0A0B8',
                        fontSize: 13, fontWeight: 700, letterSpacing: '0.05em' }}>
                        {d.label}
                      </span>
                    </div>
                    <span style={{ color: d.color, fontSize: 12, fontWeight: 700 }}>
                      ~{d.rating} ELO
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Time control */}
            <div style={{ marginBottom: 32 }}>
              <p style={{ color: '#A0A0B8', fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', marginBottom: 12 }}>
                TIME CONTROL
              </p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {TIME_CONTROLS.map((tc) => (
                  <button
                    key={tc.seconds}
                    onClick={() => setTimeControl(tc.seconds)}
                    style={{
                      flex: 1, minWidth: 60,
                      padding: '10px 8px',
                      background: timeControl === tc.seconds ? 'rgba(123,47,247,0.15)' : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${timeControl === tc.seconds ? 'rgba(123,47,247,0.5)' : 'rgba(255,255,255,0.08)'}`,
                      borderRadius: 8, cursor: 'pointer',
                      color: timeControl === tc.seconds ? '#9B4FFF' : '#A0A0B8',
                      fontSize: 13, fontWeight: 700,
                      transition: 'all 0.2s',
                    }}
                  >
                    {tc.label}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={startNewGame} className="btn-primary" style={{
              width: '100%', padding: '16px', borderRadius: 12,
              fontSize: 15, fontWeight: 800, letterSpacing: '0.1em', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
              <Zap size={18} fill="white" />
              START GAME
            </button>
          </div>
        </div>
      ) : (
        /* Game Screen */
        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', justifyContent: 'center', flexWrap: 'wrap' }}>
          {/* Left: Eval bar + Board */}
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            {/* Evaluation Bar */}
            <div style={{
              width: 24,
              height: 480,
              background: '#1A1A28',
              borderRadius: 4,
              border: '1px solid rgba(255,255,255,0.06)',
              overflow: 'hidden',
              position: 'relative',
              display: 'flex', flexDirection: 'column',
            }}>
              <div style={{ height: `${100 - evalPercent}%`, background: '#F5F5F5',
                transition: 'height 0.5s cubic-bezier(0.4,0,0.2,1)' }} />
              <div style={{ height: `${evalPercent}%`, background: '#1A1A28' }} />
              <div style={{
                position: 'absolute', top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                fontSize: 8, fontWeight: 700, color: '#7B2FF7',
                writingMode: 'vertical-rl',
                letterSpacing: '0.1em',
              }}>
                {evalScore > 0 ? `+${evalScore.toFixed(1)}` : evalScore.toFixed(1)}
              </div>
            </div>

            {/* Board area */}
            <div>
              {/* Black player info */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                marginBottom: 8, padding: '0 4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #333, #111)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 16, border: '1px solid rgba(255,255,255,0.1)' }}>
                    {playerColor === 'b' ? '👤' : '🤖'}
                  </div>
                  <div>
                    <div style={{ color: '#F5F5F5', fontSize: 13, fontWeight: 700 }}>
                      {playerColor === 'b' ? (user?.profile?.username || 'You') : `AI (${DIFFICULTIES.find(d=>d.id===difficulty)?.label})`}
                    </div>
                    <div style={{ color: '#606078', fontSize: 10, fontWeight: 600 }}>
                      {capturedBlack.map(p => PIECE_SYMBOLS[p] || '').join('')}
                    </div>
                  </div>
                </div>
                <div style={{
                  background: chess.turn() === 'b' && !gameOver ? 'rgba(123,47,247,0.2)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${chess.turn() === 'b' && !gameOver ? 'rgba(123,47,247,0.5)' : 'rgba(255,255,255,0.08)'}`,
                  borderRadius: 8, padding: '4px 10px',
                  color: chess.turn() === 'b' && !gameOver ? '#9B4FFF' : '#606078',
                  fontSize: 16, fontWeight: 800, fontFamily: 'monospace',
                  minWidth: 64, textAlign: 'center',
                }}>
                  {timeControl === 0 ? '∞' : formatTime(blackTime)}
                </div>
              </div>

              <ChessBoard
                fen={fen}
                flipped={playerColor === 'b'}
                onMove={handleMove}
                disabled={gameOver || aiThinking || chess.turn() !== playerColor}
                playerColor={playerColor}
                lastMove={lastMove}
                checkedKingSquare={checkedKing}
                size={480}
              />

              {/* White player info */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                marginTop: 8, padding: '0 4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #7B2FF7, #3A86FF)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 700, color: '#fff',
                    border: '1px solid rgba(123,47,247,0.4)' }}>
                    {playerColor === 'w' ? (user?.profile?.username?.charAt(0).toUpperCase() || 'U') : '🤖'}
                  </div>
                  <div>
                    <div style={{ color: '#F5F5F5', fontSize: 13, fontWeight: 700 }}>
                      {playerColor === 'w' ? (user?.profile?.username || 'You') : `AI (${DIFFICULTIES.find(d=>d.id===difficulty)?.label})`}
                    </div>
                    <div style={{ color: '#606078', fontSize: 10, fontWeight: 600 }}>
                      {capturedWhite.map(p => PIECE_SYMBOLS[p] || '').join('')}
                    </div>
                  </div>
                </div>
                <div style={{
                  background: chess.turn() === 'w' && !gameOver ? 'rgba(123,47,247,0.2)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${chess.turn() === 'w' && !gameOver ? 'rgba(123,47,247,0.5)' : 'rgba(255,255,255,0.08)'}`,
                  borderRadius: 8, padding: '4px 10px',
                  color: chess.turn() === 'w' && !gameOver ? '#9B4FFF' : '#606078',
                  fontSize: 16, fontWeight: 800, fontFamily: 'monospace',
                  minWidth: 64, textAlign: 'center',
                }}>
                  {timeControl === 0 ? '∞' : formatTime(whiteTime)}
                </div>
              </div>
            </div>
          </div>

          {/* Right panel */}
          <div style={{ width: 280, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* AI Thinking */}
            {aiThinking && (
              <div style={{ background: 'rgba(123,47,247,0.1)', border: '1px solid rgba(123,47,247,0.3)',
                borderRadius: 10, padding: '12px 16px',
                display: 'flex', alignItems: 'center', gap: 10 }}>
                <Brain size={16} color="#9B4FFF" style={{ animation: 'spin 2s linear infinite' }} />
                <span style={{ color: '#9B4FFF', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em' }}>
                  AI THINKING
                </span>
                <div className="ai-thinking" style={{ display: 'flex', gap: 4, marginLeft: 'auto' }}>
                  {[0,1,2].map(i => (
                    <span key={i} style={{ width: 6, height: 6, borderRadius: '50%',
                      background: '#7B2FF7', display: 'block',
                      animation: `aiThink 1s ease-in-out ${i * 0.2}s infinite` }} />
                  ))}
                </div>
              </div>
            )}

            {/* Game over */}
            {gameOver && gameResult && (
              <div style={{ background: 'rgba(123,47,247,0.15)', border: '1px solid rgba(123,47,247,0.4)',
                borderRadius: 12, padding: 20, textAlign: 'center' }}>
                <p style={{ color: '#F5F5F5', fontSize: 18, fontWeight: 800, marginBottom: 12 }}>
                  {gameResult}
                </p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={startNewGame} className="btn-primary" style={{
                    flex: 1, padding: '10px', borderRadius: 8,
                    fontSize: 12, fontWeight: 700, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                    <RefreshCw size={14} /> REMATCH
                  </button>
                </div>
              </div>
            )}

            {/* Controls */}
            {!gameOver && (
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setSoundEnabled(!soundEnabled)}
                  style={{ flex: 0, padding: '8px 10px', background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8,
                    cursor: 'pointer', color: '#A0A0B8' }}>
                  {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
                </button>
                <button onClick={() => {
                  chess.undo(); chess.undo();
                  setFen(chess.fen());
                  setMoveHistory(chess.history());
                  setLastMove(null);
                  updateCaptured(chess);
                }} style={{ flex: 1, padding: '8px 12px', background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8,
                  cursor: 'pointer', color: '#A0A0B8', fontSize: 12, fontWeight: 600,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <RotateCcw size={12} /> TAKEBACK
                </button>
                <button onClick={handleResign}
                  style={{ flex: 1, padding: '8px 12px', background: 'rgba(255,51,102,0.08)',
                    border: '1px solid rgba(255,51,102,0.2)', borderRadius: 8,
                    cursor: 'pointer', color: '#FF3366', fontSize: 12, fontWeight: 600,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <Flag size={12} /> RESIGN
                </button>
              </div>
            )}

            {/* Move history */}
            <div style={{ background: '#0D0D14', border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#A0A0B8', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em' }}>
                  MOVES
                </span>
                <span style={{ color: '#606078', fontSize: 11 }}>
                  {Math.ceil(moveHistory.length / 2)} moves
                </span>
              </div>
              <div className="move-list" style={{ padding: 8 }}>
                {Array.from({ length: Math.ceil(moveHistory.length / 2) }, (_, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center',
                    padding: '4px 8px', borderRadius: 6, gap: 8 }}
                    className="move-item">
                    <span style={{ color: '#606078', fontSize: 11, fontWeight: 700,
                      width: 24, textAlign: 'right' }}>{i + 1}.</span>
                    <span style={{ color: '#F5F5F5', fontSize: 12, fontWeight: 600,
                      flex: 1, fontFamily: 'monospace' }}>
                      {moveHistory[i * 2]}
                    </span>
                    {moveHistory[i * 2 + 1] && (
                      <span style={{ color: '#A0A0B8', fontSize: 12, fontWeight: 600,
                        flex: 1, fontFamily: 'monospace' }}>
                        {moveHistory[i * 2 + 1]}
                      </span>
                    )}
                  </div>
                ))}
                {moveHistory.length === 0 && (
                  <p style={{ color: '#606078', fontSize: 12, textAlign: 'center', padding: '16px 0' }}>
                    No moves yet
                  </p>
                )}
              </div>
            </div>

            {/* New game */}
            <button onClick={startNewGame}
              style={{ padding: '10px', background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8,
                cursor: 'pointer', color: '#A0A0B8', fontSize: 12, fontWeight: 600,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                transition: 'all 0.2s' }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(123,47,247,0.3)'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}>
              <RefreshCw size={12} />
              NEW GAME
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default Arena;
