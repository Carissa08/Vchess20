import React, { useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import { BookOpen, Zap, Target, Brain, Clock, Trophy, ChevronRight, Check, X } from 'lucide-react';
import { ChessBoard } from './ChessBoard';
import { supabase, Puzzle } from '../lib/supabase';
import type { AuthUser } from '../types';

interface TrainingSystemProps {
  user: AuthUser | null;
  onAuthClick: () => void;
}

const OPENINGS = [
  { name: "Ruy Lopez", moves: ["e4", "e5", "Nf3", "Nc6", "Bb5"], eco: "C60", color: "#FFD700" },
  { name: "Sicilian Defense", moves: ["e4", "c5"], eco: "B20", color: "#FF3366" },
  { name: "Italian Game", moves: ["e4", "e5", "Nf3", "Nc6", "Bc4"], eco: "C50", color: "#00FF88" },
  { name: "Queen's Gambit", moves: ["d4", "d5", "c4"], eco: "D20", color: "#3A86FF" },
  { name: "King's Indian", moves: ["d4", "Nf6", "c4", "g6"], eco: "E60", color: "#9B4FFF" },
  { name: "French Defense", moves: ["e4", "e6", "d4", "d5"], eco: "C00", color: "#00F5FF" },
];

export const TrainingSystem: React.FC<TrainingSystemProps> = ({ user, onAuthClick }) => {
  const [activeMode, setActiveMode] = useState<'menu' | 'puzzle' | 'opening' | 'endgame'>('menu');
  const [puzzles, setPuzzles] = useState<Puzzle[]>([]);
  const [currentPuzzle, setCurrentPuzzle] = useState<Puzzle | null>(null);
  const [puzzleChess] = useState(() => new Chess());
  const [puzzleFen, setPuzzleFen] = useState('');
  const [puzzleMoveIdx, setPuzzleMoveIdx] = useState(0);
  const [puzzleStatus, setPuzzleStatus] = useState<'playing' | 'correct' | 'wrong' | 'solved'>('playing');
  const [puzzlePlayerColor, setPuzzlePlayerColor] = useState<'w' | 'b'>('w');
  const [streak, setStreak] = useState(0);
  const [openingIdx, setOpeningIdx] = useState(0);
  const [openingChess] = useState(() => new Chess());
  const [openingFen, setOpeningFen] = useState('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
  const [openingMoveIdx, setOpeningMoveIdx] = useState(0);
  const [openingFeedback, setOpeningFeedback] = useState('');
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);
  const [solvedCount, setSolvedCount] = useState(0);

  useEffect(() => {
    loadPuzzles();
  }, []);

  const loadPuzzles = async () => {
    const { data } = await supabase.from('puzzles').select('*').limit(20);
    if (data) setPuzzles(data);
  };

  const startPuzzle = (puzzle: Puzzle) => {
    puzzleChess.load(puzzle.fen);
    setPuzzleFen(puzzle.fen);
    setCurrentPuzzle(puzzle);
    setPuzzleMoveIdx(0);
    setPuzzleStatus('playing');
    setLastMove(null);

    const chess = new Chess(puzzle.fen);
    setPuzzlePlayerColor(chess.turn());
    setActiveMode('puzzle');

    // Make the first move if it's a 'setup' move (opponent moves first)
    if (puzzle.moves.length > 0) {
      const setupChess = new Chess(puzzle.fen);
      const setupMove = setupChess.move(puzzle.moves[0] as never);
      if (setupMove) {
        puzzleChess.load(setupChess.fen());
        setPuzzleFen(setupChess.fen());
        setLastMove({ from: setupMove.from, to: setupMove.to });
        setPuzzlePlayerColor(setupChess.turn());
        setPuzzleMoveIdx(1);
      }
    }
  };

  const handlePuzzleMove = (from: string, to: string, san: string, newFen: string) => {
    if (!currentPuzzle || puzzleStatus !== 'playing') return;
    const expectedMove = currentPuzzle.moves[puzzleMoveIdx];
    if (!expectedMove) return;

    const testChess = new Chess(puzzleChess.fen());
    const result = testChess.move({ from: from as never, to: to as never, promotion: 'q' as never });
    if (!result) return;

    const actualUci = `${from}${to}`;
    const expectedUci = expectedMove.length >= 4 ? expectedMove : '';

    const isCorrect = actualUci === expectedUci ||
      san === expectedMove ||
      result.san === expectedMove;

    if (isCorrect) {
      puzzleChess.load(newFen);
      setPuzzleFen(newFen);
      setLastMove({ from, to });
      const nextIdx = puzzleMoveIdx + 1;

      if (nextIdx >= currentPuzzle.moves.length) {
        setPuzzleStatus('solved');
        setStreak((s) => s + 1);
        setSolvedCount((c) => c + 1);
      } else {
        setPuzzleMoveIdx(nextIdx);
        // Auto-play next opponent move
        setTimeout(() => {
          const oppMove = currentPuzzle.moves[nextIdx];
          if (oppMove) {
            const oppChess = new Chess(newFen);
            const oppResult = oppChess.move(oppMove as never);
            if (oppResult) {
              puzzleChess.load(oppChess.fen());
              setPuzzleFen(oppChess.fen());
              setLastMove({ from: oppResult.from, to: oppResult.to });
              setPuzzleMoveIdx(nextIdx + 1);
            }
          }
        }, 500);
      }
    } else {
      setPuzzleStatus('wrong');
      setStreak(0);
      setTimeout(() => setPuzzleStatus('playing'), 1200);
    }
  };

  const startOpening = (idx: number) => {
    setOpeningIdx(idx);
    openingChess.reset();
    setOpeningFen(openingChess.fen());
    setOpeningMoveIdx(0);
    setOpeningFeedback('');
    setLastMove(null);
    setActiveMode('opening');
  };

  const handleOpeningMove = (from: string, to: string, san: string, newFen: string) => {
    const opening = OPENINGS[openingIdx];
    const expected = opening.moves[openingMoveIdx];

    if (san === expected) {
      openingChess.load(newFen);
      setOpeningFen(newFen);
      setLastMove({ from, to });
      const nextIdx = openingMoveIdx + 1;
      setOpeningMoveIdx(nextIdx);

      if (nextIdx >= opening.moves.length) {
        setOpeningFeedback('Perfect! Opening complete!');
      } else {
        setOpeningFeedback('Correct!');
        // Auto-play next moves for the other side
        const chess = new Chess(newFen);
        if (chess.turn() !== 'w') {
          const oppMove = opening.moves[nextIdx];
          if (oppMove) {
            setTimeout(() => {
              const oppChess = new Chess(newFen);
              const result = oppChess.move(oppMove as never);
              if (result) {
                openingChess.load(oppChess.fen());
                setOpeningFen(oppChess.fen());
                setLastMove({ from: result.from, to: result.to });
                setOpeningMoveIdx(nextIdx + 1);
              }
            }, 500);
          }
        }
      }
    } else {
      setOpeningFeedback(`Incorrect. Expected: ${expected}`);
    }
  };

  return (
    <section id="training" style={{ padding: '80px 24px', maxWidth: 1400, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'rgba(0,255,136,0.08)', border: '1px solid rgba(0,255,136,0.2)',
          borderRadius: 100, padding: '6px 16px', marginBottom: 16 }}>
          <BookOpen size={14} color="#00FF88" />
          <span style={{ color: '#00FF88', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em' }}>TRAINING SYSTEM</span>
        </div>
        <h2 style={{ fontSize: 40, fontWeight: 900, fontFamily: 'Poppins',
          background: 'linear-gradient(135deg, #ffffff, #00FF88)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
          Level Up Your Game
        </h2>
      </div>

      {activeMode === 'menu' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 20, maxWidth: 1000, margin: '0 auto' }}>
          {[
            { icon: <Target size={32} />, title: 'Daily Puzzles', desc: `${puzzles.length} puzzles available`, color: '#FF3366',
              action: () => puzzles.length > 0 ? startPuzzle(puzzles[0]) : loadPuzzles(),
              badge: streak > 0 ? `${streak} streak` : null },
            { icon: <Zap size={32} />, title: 'Puzzle Rush', desc: 'Solve as many as possible in 3 minutes', color: '#FFD700',
              action: () => puzzles.length > 0 ? startPuzzle(puzzles[Math.floor(Math.random() * puzzles.length)]) : loadPuzzles() },
            { icon: <BookOpen size={32} />, title: 'Opening Trainer', desc: `${OPENINGS.length} openings to master`, color: '#3A86FF',
              action: () => setActiveMode('opening') },
            { icon: <Brain size={32} />, title: 'Endgame Studies', desc: 'Master king, rook, and pawn endings', color: '#9B4FFF',
              action: () => setActiveMode('endgame') },
            { icon: <Clock size={32} />, title: 'Speed Chess', desc: 'Sharpen tactical speed', color: '#00F5FF',
              action: () => {} },
            { icon: <Trophy size={32} />, title: 'AI Lessons', desc: 'Guided coaching sessions', color: '#00FF88',
              action: () => {} },
          ].map((card) => (
            <button
              key={card.title}
              onClick={card.action}
              style={{
                background: '#0D0D14',
                border: `1px solid rgba(255,255,255,0.06)`,
                borderRadius: 16,
                padding: '28px 24px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = `${card.color}40`;
                e.currentTarget.style.background = `${card.color}08`;
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = `0 20px 40px rgba(0,0,0,0.4), 0 0 20px ${card.color}20`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                e.currentTarget.style.background = '#0D0D14';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {card.badge && (
                <div style={{ position: 'absolute', top: 12, right: 12,
                  background: `${card.color}20`, border: `1px solid ${card.color}40`,
                  borderRadius: 100, padding: '2px 8px',
                  color: card.color, fontSize: 10, fontWeight: 700 }}>
                  {card.badge}
                </div>
              )}
              <div style={{ color: card.color, marginBottom: 16,
                filter: `drop-shadow(0 0 8px ${card.color}60)` }}>
                {card.icon}
              </div>
              <h3 style={{ color: '#F5F5F5', fontSize: 16, fontWeight: 700, marginBottom: 6 }}>
                {card.title}
              </h3>
              <p style={{ color: '#606078', fontSize: 13 }}>{card.desc}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4,
                color: card.color, fontSize: 12, fontWeight: 600, marginTop: 14 }}>
                START <ChevronRight size={14} />
              </div>
            </button>
          ))}
        </div>
      )}

      {activeMode === 'puzzle' && currentPuzzle && (
        <div style={{ display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap' }}>
          <div>
            <ChessBoard
              fen={puzzleFen}
              flipped={puzzlePlayerColor === 'b'}
              onMove={handlePuzzleMove}
              disabled={puzzleStatus === 'solved'}
              playerColor={puzzlePlayerColor}
              lastMove={lastMove}
              size={460}
            />
          </div>

          <div style={{ width: 280, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Puzzle info */}
            <div style={{ background: '#0D0D14', border: '1px solid rgba(255,51,102,0.15)',
              borderRadius: 16, padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ color: '#FF3366', fontSize: 12, fontWeight: 700, letterSpacing: '0.1em' }}>
                  PUZZLE #{currentPuzzle.id.substring(0, 8)}
                </span>
                <span style={{ color: '#FFD700', fontSize: 12, fontWeight: 700 }}>
                  ★ {currentPuzzle.rating}
                </span>
              </div>
              <h3 style={{ color: '#F5F5F5', fontSize: 16, fontWeight: 700, marginBottom: 8 }}>
                {currentPuzzle.title}
              </h3>
              <p style={{ color: '#A0A0B8', fontSize: 13, marginBottom: 12 }}>
                {puzzlePlayerColor === 'w' ? 'White' : 'Black'} to move. Find the best sequence!
              </p>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {currentPuzzle.themes.map((t) => (
                  <span key={t} style={{ background: 'rgba(255,51,102,0.1)',
                    border: '1px solid rgba(255,51,102,0.2)',
                    borderRadius: 100, padding: '2px 10px',
                    color: '#FF3366', fontSize: 10, fontWeight: 600 }}>
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Status */}
            {puzzleStatus === 'solved' && (
              <div style={{ background: 'rgba(0,255,136,0.1)', border: '1px solid rgba(0,255,136,0.3)',
                borderRadius: 12, padding: '16px', textAlign: 'center' }}>
                <Check size={32} color="#00FF88" style={{ margin: '0 auto 8px' }} />
                <p style={{ color: '#00FF88', fontWeight: 700, fontSize: 16, marginBottom: 4 }}>
                  Puzzle Solved!
                </p>
                <p style={{ color: '#606078', fontSize: 12, marginBottom: 12 }}>
                  Streak: {streak} puzzles
                </p>
                <button
                  onClick={() => {
                    const next = puzzles[Math.floor(Math.random() * puzzles.length)];
                    if (next) startPuzzle(next);
                  }}
                  style={{ padding: '8px 20px', background: 'linear-gradient(135deg, #00FF88, #00F5FF)',
                    border: 'none', borderRadius: 8, cursor: 'pointer',
                    color: '#07070A', fontSize: 12, fontWeight: 800 }}>
                  NEXT PUZZLE
                </button>
              </div>
            )}

            {puzzleStatus === 'wrong' && (
              <div style={{ background: 'rgba(255,51,102,0.1)', border: '1px solid rgba(255,51,102,0.3)',
                borderRadius: 12, padding: 16, textAlign: 'center' }}>
                <X size={28} color="#FF3366" style={{ margin: '0 auto 6px' }} />
                <p style={{ color: '#FF3366', fontWeight: 700, fontSize: 14 }}>Not the best move!</p>
                <p style={{ color: '#606078', fontSize: 12 }}>Try again</p>
              </div>
            )}

            {/* Stats */}
            <div style={{ background: '#0D0D14', border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 12, padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: '#FFD700', fontSize: 24, fontWeight: 900 }}>{streak}</div>
                  <div style={{ color: '#606078', fontSize: 10, fontWeight: 600 }}>STREAK</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: '#00FF88', fontSize: 24, fontWeight: 900 }}>{solvedCount}</div>
                  <div style={{ color: '#606078', fontSize: 10, fontWeight: 600 }}>SOLVED</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: '#9B4FFF', fontSize: 24, fontWeight: 900 }}>
                    {currentPuzzle.rating}
                  </div>
                  <div style={{ color: '#606078', fontSize: 10, fontWeight: 600 }}>RATING</div>
                </div>
              </div>
            </div>

            <button onClick={() => setActiveMode('menu')}
              style={{ padding: '10px', background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8,
                cursor: 'pointer', color: '#A0A0B8', fontSize: 12 }}>
              ← Back to Training
            </button>
          </div>
        </div>
      )}

      {activeMode === 'opening' && (
        <div style={{ display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap' }}>
          {/* Opening selector */}
          <div style={{ width: 260 }}>
            <div style={{ background: '#0D0D14', border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 16, overflow: 'hidden' }}>
              <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ color: '#A0A0B8', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em' }}>
                  OPENINGS
                </span>
              </div>
              {OPENINGS.map((op, i) => (
                <button key={op.name} onClick={() => startOpening(i)}
                  style={{ display: 'block', width: '100%', padding: '12px 16px',
                    background: openingIdx === i ? `${op.color}10` : 'none',
                    border: 'none', borderBottom: '1px solid rgba(255,255,255,0.04)',
                    cursor: 'pointer', textAlign: 'left',
                    transition: 'all 0.2s' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ color: openingIdx === i ? op.color : '#F5F5F5',
                        fontSize: 13, fontWeight: 700 }}>{op.name}</div>
                      <div style={{ color: '#606078', fontSize: 11 }}>{op.eco}</div>
                    </div>
                    <div style={{ width: 8, height: 8, borderRadius: '50%',
                      background: op.color, opacity: openingIdx === i ? 1 : 0.4 }} />
                  </div>
                </button>
              ))}
            </div>
            <button onClick={() => setActiveMode('menu')} style={{ marginTop: 12,
              padding: '10px', background: 'rgba(255,255,255,0.04)', width: '100%',
              border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8,
              cursor: 'pointer', color: '#A0A0B8', fontSize: 12 }}>
              ← Back
            </button>
          </div>

          {/* Board */}
          <div>
            <ChessBoard
              fen={openingFen}
              onMove={handleOpeningMove}
              lastMove={lastMove}
              size={460}
            />
            <div style={{ marginTop: 12, textAlign: 'center' }}>
              {openingFeedback && (
                <span style={{
                  color: openingFeedback.includes('Correct') || openingFeedback.includes('Perfect')
                    ? '#00FF88' : '#FF3366',
                  fontSize: 13, fontWeight: 700,
                  background: openingFeedback.includes('Correct') || openingFeedback.includes('Perfect')
                    ? 'rgba(0,255,136,0.1)' : 'rgba(255,51,102,0.1)',
                  padding: '6px 16px', borderRadius: 100,
                  border: `1px solid ${openingFeedback.includes('Correct') || openingFeedback.includes('Perfect') ? 'rgba(0,255,136,0.3)' : 'rgba(255,51,102,0.3)'}`,
                }}>
                  {openingFeedback}
                </span>
              )}
            </div>
          </div>

          {/* Move guide */}
          <div style={{ width: 240 }}>
            <div style={{ background: '#0D0D14', border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 16, padding: 20 }}>
              <h3 style={{ color: OPENINGS[openingIdx].color, fontSize: 16, fontWeight: 700,
                marginBottom: 8 }}>{OPENINGS[openingIdx].name}</h3>
              <p style={{ color: '#606078', fontSize: 12, marginBottom: 16 }}>
                Play the correct moves to complete this opening
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {OPENINGS[openingIdx].moves.map((move, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8,
                    padding: '6px 10px', borderRadius: 6,
                    background: i < openingMoveIdx
                      ? 'rgba(0,255,136,0.08)'
                      : i === openingMoveIdx
                      ? 'rgba(255,215,0,0.08)'
                      : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${i < openingMoveIdx ? 'rgba(0,255,136,0.2)' : i === openingMoveIdx ? 'rgba(255,215,0,0.2)' : 'rgba(255,255,255,0.04)'}`,
                  }}>
                    <span style={{ color: '#606078', fontSize: 11, fontWeight: 700, width: 16 }}>
                      {Math.floor(i / 2) + 1}{i % 2 === 0 ? '.' : '...'}
                    </span>
                    <span style={{
                      color: i < openingMoveIdx ? '#00FF88' : i === openingMoveIdx ? '#FFD700' : '#A0A0B8',
                      fontSize: 13, fontWeight: 700, fontFamily: 'monospace',
                    }}>
                      {i < openingMoveIdx ? move : i === openingMoveIdx ? '?' : '...'}
                    </span>
                    {i < openingMoveIdx && <Check size={12} color="#00FF88" style={{ marginLeft: 'auto' }} />}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeMode === 'endgame' && (
        <div style={{ textAlign: 'center', maxWidth: 600, margin: '0 auto' }}>
          <div style={{ background: '#0D0D14', border: '1px solid rgba(123,47,247,0.15)',
            borderRadius: 20, padding: 40 }}>
            <Brain size={48} color="#9B4FFF" style={{ margin: '0 auto 16px',
              filter: 'drop-shadow(0 0 12px rgba(123,47,247,0.6))' }} />
            <h3 style={{ color: '#F5F5F5', fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
              Endgame Studies
            </h3>
            <p style={{ color: '#606078', fontSize: 14, marginBottom: 24 }}>
              Master essential endgame patterns: King + Pawn, Rook Endings, Queen vs Pawn, and more.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
              {['K+P Endings', 'Rook Endings', 'Queen vs Pawn', 'Bishop Endings',
                'Knight Endings', 'Lucena Position'].map((e) => (
                <button key={e}
                  style={{ padding: '12px', background: 'rgba(123,47,247,0.08)',
                    border: '1px solid rgba(123,47,247,0.15)', borderRadius: 8,
                    cursor: 'pointer', color: '#A0A0B8', fontSize: 12, fontWeight: 600,
                    transition: 'all 0.2s', textAlign: 'left' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(123,47,247,0.15)'; e.currentTarget.style.color = '#9B4FFF'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(123,47,247,0.08)'; e.currentTarget.style.color = '#A0A0B8'; }}>
                  {e}
                </button>
              ))}
            </div>
            <button onClick={() => setActiveMode('menu')}
              style={{ padding: '10px 24px', background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8,
                cursor: 'pointer', color: '#A0A0B8', fontSize: 13 }}>
              ← Back to Training
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default TrainingSystem;
