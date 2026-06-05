import React, { useState, useCallback } from 'react';
import { Chess } from 'chess.js';
import { Activity, Upload, ChevronLeft, ChevronRight, BarChart2, Search } from 'lucide-react';
import { ChessBoard } from './ChessBoard';
import { getEvalScore, classifyMove } from '../lib/chess-ai';

interface AnalysisMove {
  san: string;
  fen: string;
  eval: number;
  classification: string;
  moveNumber: number;
  color: 'w' | 'b';
}

const CLASSIFICATION_COLORS: Record<string, string> = {
  brilliant: '#00F5FF', great: '#00FF88', best: '#3A86FF',
  excellent: '#7B2FF7', good: '#A0A0B8',
  inaccuracy: '#FFD700', mistake: '#FFA500', blunder: '#FF3366',
};

const CLASSIFICATION_SYMBOLS: Record<string, string> = {
  brilliant: '!!', great: '!', best: '', excellent: '',
  good: '', inaccuracy: '?!', mistake: '?', blunder: '??',
};

export const AnalysisCenter: React.FC = () => {
  const [pgn, setPgn] = useState('');
  const [fen, setFen] = useState('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
  const [fenInput, setFenInput] = useState('');
  const [moves, setMoves] = useState<AnalysisMove[]>([]);
  const [currentIdx, setCurrentIdx] = useState(-1);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'pgn' | 'fen'>('pgn');
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);

  const analyzePGN = useCallback(async () => {
    if (!pgn.trim()) return;
    setAnalyzing(true);
    setError('');
    setMoves([]);
    setCurrentIdx(-1);

    try {
      const chess = new Chess();
      chess.loadPgn(pgn.trim());
      const history = chess.history({ verbose: true });

      const analyzed: AnalysisMove[] = [];
      const temp = new Chess();
      let prevEval = 0;

      for (const move of history as Array<{ from: string; to: string; san: string; color: string }>) {
        const evalBefore = prevEval;
        temp.move(move.san);
        const evalAfter = getEvalScore(temp.fen());
        const classification = classifyMove(evalBefore, evalAfter, move.color as string);

        analyzed.push({
          san: move.san,
          fen: temp.fen(),
          eval: evalAfter,
          classification,
          moveNumber: Math.ceil(analyzed.length / 2) + 1,
          color: move.color as 'w' | 'b',
        });
        prevEval = evalAfter;
        await new Promise((r) => setTimeout(r, 5));
      }

      setMoves(analyzed);
      if (analyzed.length > 0) {
        setCurrentIdx(analyzed.length - 1);
        setFen(analyzed[analyzed.length - 1].fen);
        const hist = (new Chess());
        hist.loadPgn(pgn.trim());
        const histVerbose = hist.history({ verbose: true }) as Array<{ from: string; to: string }>;
        const last = histVerbose[histVerbose.length - 1];
        if (last) setLastMove({ from: last.from, to: last.to });
      }
    } catch (e) {
      setError('Invalid PGN. Please check your notation.');
    }

    setAnalyzing(false);
  }, [pgn]);

  const analyzeFEN = () => {
    if (!fenInput.trim()) return;
    try {
      const chess = new Chess(fenInput.trim());
      setFen(chess.fen());
      setFenInput('');
      setMoves([]);
      setCurrentIdx(-1);
      setLastMove(null);
    } catch {
      setError('Invalid FEN string.');
    }
  };

  const goToMove = (idx: number) => {
    if (idx < 0 || idx >= moves.length) return;
    setCurrentIdx(idx);
    setFen(moves[idx].fen);
    if (idx > 0) {
      const prev = new Chess(moves[idx - 1].fen);
      const curr = new Chess(moves[idx].fen);
    }
  };

  const goFirst = () => { setCurrentIdx(-1); setFen('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'); setLastMove(null); };
  const goPrev = () => { if (currentIdx > 0) goToMove(currentIdx - 1); else goFirst(); };
  const goNext = () => { if (currentIdx < moves.length - 1) goToMove(currentIdx + 1); };
  const goLast = () => { if (moves.length > 0) goToMove(moves.length - 1); };

  const evalPercent = Math.max(5, Math.min(95, ((getEvalScore(fen) + 20) / 40) * 100));

  const classificationCounts = moves.reduce((acc, m) => {
    acc[m.classification] = (acc[m.classification] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const accuracy = moves.length > 0
    ? Math.round(
        (moves.filter(m => ['brilliant', 'great', 'best', 'excellent', 'good'].includes(m.classification)).length
          / moves.length) * 100
      )
    : 0;

  return (
    <section id="analysis" style={{ padding: '80px 24px', maxWidth: 1400, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'rgba(255,215,0,0.08)', border: '1px solid rgba(255,215,0,0.2)',
          borderRadius: 100, padding: '6px 16px', marginBottom: 16 }}>
          <Activity size={14} color="#FFD700" />
          <span style={{ color: '#FFD700', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em' }}>ANALYSIS CENTER</span>
        </div>
        <h2 style={{ fontSize: 40, fontWeight: 900, fontFamily: 'Poppins',
          background: 'linear-gradient(135deg, #ffffff, #FFD700)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
          Deep Analysis
        </h2>
        <p style={{ color: '#606078', fontSize: 14, marginTop: 8 }}>
          Import and analyze any game with AI-powered move classification
        </p>
      </div>

      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
        {/* Left panel - Import */}
        <div style={{ width: 280, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Tabs */}
          <div style={{ display: 'flex', background: '#0D0D14',
            border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: 4, gap: 4 }}>
            {(['pgn', 'fen'] as const).map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{
                flex: 1, padding: '8px', borderRadius: 7,
                background: activeTab === tab ? 'rgba(123,47,247,0.2)' : 'transparent',
                border: activeTab === tab ? '1px solid rgba(123,47,247,0.3)' : '1px solid transparent',
                cursor: 'pointer', color: activeTab === tab ? '#9B4FFF' : '#606078',
                fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', transition: 'all 0.2s',
              }}>
                {tab.toUpperCase()}
              </button>
            ))}
          </div>

          {activeTab === 'pgn' && (
            <div style={{ background: '#0D0D14', border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 12, padding: 16 }}>
              <label style={{ color: '#A0A0B8', fontSize: 11, fontWeight: 700,
                letterSpacing: '0.1em', display: 'block', marginBottom: 8 }}>
                PASTE PGN
              </label>
              <textarea
                className="input-futuristic"
                value={pgn}
                onChange={(e) => setPgn(e.target.value)}
                placeholder="1. e4 e5 2. Nf3 Nc6..."
                style={{ width: '100%', height: 180, padding: '10px 12px',
                  borderRadius: 8, fontSize: 12, resize: 'vertical',
                  fontFamily: 'monospace', lineHeight: 1.5 }}
              />
              {error && (
                <p style={{ color: '#FF3366', fontSize: 11, marginTop: 8 }}>{error}</p>
              )}
              <button
                onClick={analyzePGN}
                disabled={!pgn.trim() || analyzing}
                style={{
                  width: '100%', marginTop: 10,
                  padding: '10px', borderRadius: 8,
                  background: pgn.trim() && !analyzing ? 'linear-gradient(135deg, #FFD700, #FFA500)' : 'rgba(255,255,255,0.06)',
                  border: 'none', cursor: pgn.trim() && !analyzing ? 'pointer' : 'not-allowed',
                  color: pgn.trim() && !analyzing ? '#07070A' : '#606078',
                  fontSize: 12, fontWeight: 800, letterSpacing: '0.1em',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  opacity: analyzing ? 0.7 : 1,
                }}
              >
                {analyzing ? (
                  <>
                    <div style={{ width: 12, height: 12, borderRadius: '50%',
                      border: '2px solid #07070A', borderTopColor: 'transparent',
                      animation: 'spin 0.8s linear infinite' }} />
                    ANALYZING...
                  </>
                ) : (
                  <><Search size={14} /> ANALYZE</>
                )}
              </button>
            </div>
          )}

          {activeTab === 'fen' && (
            <div style={{ background: '#0D0D14', border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 12, padding: 16 }}>
              <label style={{ color: '#A0A0B8', fontSize: 11, fontWeight: 700,
                letterSpacing: '0.1em', display: 'block', marginBottom: 8 }}>
                ENTER FEN
              </label>
              <input
                className="input-futuristic"
                value={fenInput}
                onChange={(e) => setFenInput(e.target.value)}
                placeholder="rnbqkbnr/pppppppp/8/8..."
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, fontSize: 12, fontFamily: 'monospace' }}
              />
              {error && <p style={{ color: '#FF3366', fontSize: 11, marginTop: 8 }}>{error}</p>}
              <button onClick={analyzeFEN} disabled={!fenInput.trim()}
                style={{ width: '100%', marginTop: 10, padding: '10px', borderRadius: 8,
                  background: fenInput.trim() ? 'linear-gradient(135deg, #FFD700, #FFA500)' : 'rgba(255,255,255,0.06)',
                  border: 'none', cursor: fenInput.trim() ? 'pointer' : 'not-allowed',
                  color: fenInput.trim() ? '#07070A' : '#606078',
                  fontSize: 12, fontWeight: 800, letterSpacing: '0.1em' }}>
                LOAD POSITION
              </button>
            </div>
          )}

          {/* Stats */}
          {moves.length > 0 && (
            <div style={{ background: '#0D0D14', border: '1px solid rgba(255,215,0,0.15)',
              borderRadius: 12, padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ color: '#A0A0B8', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em' }}>
                  ACCURACY
                </span>
                <span style={{ color: '#FFD700', fontSize: 18, fontWeight: 900 }}>
                  {accuracy}%
                </span>
              </div>
              <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden', marginBottom: 16 }}>
                <div style={{ height: '100%', width: `${accuracy}%`,
                  background: 'linear-gradient(90deg, #FF3366, #FFD700, #00FF88)',
                  borderRadius: 2, transition: 'width 1s ease' }} />
              </div>
              {Object.entries(classificationCounts)
                .filter(([, count]) => count > 0)
                .sort(([a], [b]) => {
                  const order = ['brilliant','great','best','excellent','good','inaccuracy','mistake','blunder'];
                  return order.indexOf(a) - order.indexOf(b);
                })
                .map(([cls, count]) => (
                  <div key={cls} style={{ display: 'flex', justifyContent: 'space-between',
                    padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <span style={{ color: CLASSIFICATION_COLORS[cls], fontSize: 12,
                      fontWeight: 600, textTransform: 'capitalize' }}>
                      {cls}
                    </span>
                    <span style={{ color: CLASSIFICATION_COLORS[cls], fontSize: 12, fontWeight: 700 }}>
                      {count}
                    </span>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Center - Board */}
        <div>
          {/* Eval bar */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <div style={{
              width: 18, height: 480,
              background: '#1A1A28',
              borderRadius: 4, overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.06)',
            }}>
              <div style={{ height: `${100 - evalPercent}%`, background: '#F5F5F5',
                transition: 'height 0.5s ease' }} />
              <div style={{ height: `${evalPercent}%`, background: '#1A1A28' }} />
            </div>

            <ChessBoard fen={fen} lastMove={lastMove} disabled={true} size={460} />
          </div>

          {/* Navigation */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 12 }}>
            {[
              { icon: <ChevronLeft size={14} />, action: goFirst, tip: 'First', double: true },
              { icon: <ChevronLeft size={16} />, action: goPrev, tip: 'Previous' },
              { icon: <ChevronRight size={16} />, action: goNext, tip: 'Next' },
              { icon: <ChevronRight size={14} />, action: goLast, tip: 'Last', double: true },
            ].map((btn, i) => (
              <button key={i} onClick={btn.action} title={btn.tip}
                style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8,
                  cursor: 'pointer', color: '#A0A0B8', transition: 'all 0.2s',
                  display: 'flex', alignItems: 'center' }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(123,47,247,0.4)'; e.currentTarget.style.color = '#9B4FFF'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#A0A0B8'; }}>
                {btn.double ? <>{btn.icon}{btn.icon}</> : btn.icon}
              </button>
            ))}
          </div>

          {currentIdx >= 0 && moves[currentIdx] && (
            <div style={{ textAlign: 'center', marginTop: 10 }}>
              <span style={{
                color: CLASSIFICATION_COLORS[moves[currentIdx].classification],
                fontSize: 13, fontWeight: 700,
                background: `${CLASSIFICATION_COLORS[moves[currentIdx].classification]}15`,
                padding: '4px 12px', borderRadius: 100,
                border: `1px solid ${CLASSIFICATION_COLORS[moves[currentIdx].classification]}30`,
              }}>
                {moves[currentIdx].san}
                {CLASSIFICATION_SYMBOLS[moves[currentIdx].classification] && (
                  <span style={{ marginLeft: 4 }}>{CLASSIFICATION_SYMBOLS[moves[currentIdx].classification]}</span>
                )}
                {' · '}
                {moves[currentIdx].classification}
              </span>
            </div>
          )}
        </div>

        {/* Right - Move list */}
        {moves.length > 0 && (
          <div style={{ width: 260 }}>
            <div style={{ background: '#0D0D14', border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 12, overflow: 'hidden', height: 520 }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ color: '#A0A0B8', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em' }}>
                  MOVE ANALYSIS
                </span>
              </div>
              <div style={{ overflowY: 'auto', height: 'calc(100% - 44px)', padding: 8 }}>
                {Array.from({ length: Math.ceil(moves.length / 2) }, (_, i) => {
                  const wMove = moves[i * 2];
                  const bMove = moves[i * 2 + 1];
                  return (
                    <div key={i} style={{ display: 'flex', gap: 4,
                      padding: '4px 4px',
                      borderRadius: 6, marginBottom: 2,
                      background: (currentIdx === i * 2 || currentIdx === i * 2 + 1)
                        ? 'rgba(123,47,247,0.1)' : 'transparent' }}>
                      <span style={{ color: '#606078', fontSize: 11, fontWeight: 700,
                        width: 22, flexShrink: 0, paddingTop: 1 }}>{i + 1}.</span>
                      <button onClick={() => goToMove(i * 2)}
                        style={{ flex: 1, padding: '3px 6px', background: 'none', border: 'none',
                          cursor: 'pointer', textAlign: 'left', borderRadius: 4,
                          transition: 'background 0.15s' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'none'}>
                        <span style={{ color: CLASSIFICATION_COLORS[wMove.classification] || '#F5F5F5',
                          fontSize: 13, fontWeight: 600, fontFamily: 'monospace' }}>
                          {wMove.san}
                          <span style={{ fontSize: 10, marginLeft: 2 }}>
                            {CLASSIFICATION_SYMBOLS[wMove.classification]}
                          </span>
                        </span>
                      </button>
                      {bMove && (
                        <button onClick={() => goToMove(i * 2 + 1)}
                          style={{ flex: 1, padding: '3px 6px', background: 'none', border: 'none',
                            cursor: 'pointer', textAlign: 'left', borderRadius: 4,
                            transition: 'background 0.15s' }}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'none'}>
                          <span style={{ color: CLASSIFICATION_COLORS[bMove.classification] || '#A0A0B8',
                            fontSize: 13, fontWeight: 600, fontFamily: 'monospace' }}>
                            {bMove.san}
                            <span style={{ fontSize: 10, marginLeft: 2 }}>
                              {CLASSIFICATION_SYMBOLS[bMove.classification]}
                            </span>
                          </span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default AnalysisCenter;
