import React, { useState, useCallback, useEffect } from 'react';
import { Chess } from 'chess.js';
import { ChessPiece } from './ChessPiece';

interface ChessBoardProps {
  fen?: string;
  flipped?: boolean;
  onMove?: (from: string, to: string, san: string, fen: string) => void;
  disabled?: boolean;
  playerColor?: 'w' | 'b' | 'both';
  lastMove?: { from: string; to: string } | null;
  checkedKingSquare?: string | null;
  showCoords?: boolean;
  size?: number;
}

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1'];

export const ChessBoard: React.FC<ChessBoardProps> = ({
  fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  flipped = false,
  onMove,
  disabled = false,
  playerColor = 'both',
  lastMove = null,
  checkedKingSquare = null,
  showCoords = true,
  size = 480,
}) => {
  const [selected, setSelected] = useState<string | null>(null);
  const [legalMoves, setLegalMoves] = useState<string[]>([]);
  const [promotionPending, setPromotionPending] = useState<{ from: string; to: string } | null>(null);

  const chess = new Chess(fen);
  const board = chess.board();

  const files = flipped ? [...FILES].reverse() : FILES;
  const ranks = flipped ? [...RANKS].reverse() : RANKS;

  const squareToCoords = (sq: string) => {
    const file = sq.charCodeAt(0) - 97;
    const rank = 8 - parseInt(sq[1]);
    return { file, rank };
  };

  const getLegalMovesForSquare = useCallback((square: string): string[] => {
    const moves = chess.moves({ square: square as never, verbose: true });
    return moves.map((m) => (m as { to: string }).to);
  }, [fen]);

  const handleSquareClick = useCallback((square: string) => {
    if (disabled) return;

    const piece = chess.get(square as never);
    const currentTurn = chess.turn();

    if (playerColor !== 'both' && playerColor !== currentTurn) return;

    if (selected === square) {
      setSelected(null);
      setLegalMoves([]);
      return;
    }

    if (selected && legalMoves.includes(square)) {
      const moves = chess.moves({ square: selected as never, verbose: true }) as Array<{
        from: string; to: string; san: string; flags: string;
      }>;
      const move = moves.find((m) => m.to === square);
      if (!move) return;

      if (move.flags.includes('p')) {
        setPromotionPending({ from: selected, to: square });
        return;
      }

      executeMove(selected, square, 'q');
      return;
    }

    if (piece && piece.color === currentTurn) {
      if (playerColor === 'both' || piece.color === playerColor) {
        setSelected(square);
        setLegalMoves(getLegalMovesForSquare(square));
      }
    } else {
      setSelected(null);
      setLegalMoves([]);
    }
  }, [selected, legalMoves, disabled, fen, playerColor]);

  const executeMove = (from: string, to: string, promotion: string) => {
    const testChess = new Chess(fen);
    try {
      const result = testChess.move({ from: from as never, to: to as never, promotion: promotion as never });
      if (result && onMove) {
        onMove(from, to, result.san, testChess.fen());
      }
    } catch {
      // invalid move
    }
    setSelected(null);
    setLegalMoves([]);
    setPromotionPending(null);
  };

  const squareColor = (fileIdx: number, rankIdx: number): string => {
    const isLight = (fileIdx + rankIdx) % 2 === 0;
    return isLight ? '#E8D5B0' : '#8B6343';
  };

  const squareSize = size / 8;

  const renderSquare = (fileIdx: number, rankIdx: number) => {
    const actualFileIdx = flipped ? 7 - fileIdx : fileIdx;
    const actualRankIdx = flipped ? 7 - rankIdx : rankIdx;
    const file = FILES[actualFileIdx];
    const rank = RANKS[actualRankIdx];
    const square = `${file}${rank}`;
    const piece = board[actualRankIdx][actualFileIdx];

    const isSelected = selected === square;
    const isLegal = legalMoves.includes(square);
    const isLastMove = lastMove && (lastMove.from === square || lastMove.to === square);
    const isCheck = checkedKingSquare === square;
    const hasPiece = !!piece;

    let bg = squareColor(actualFileIdx, actualRankIdx);
    if (isLastMove) bg = (actualFileIdx + actualRankIdx) % 2 === 0 ? '#F6F669' : '#BBD34B';
    if (isSelected) bg = '#7B2FF7';
    if (isCheck) bg = '#FF3366';

    return (
      <div
        key={square}
        onClick={() => handleSquareClick(square)}
        style={{
          width: squareSize,
          height: squareSize,
          backgroundColor: bg,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: disabled ? 'default' : 'pointer',
          transition: 'background-color 0.15s ease',
        }}
      >
        {/* Last move highlight */}
        {isLastMove && !isSelected && (
          <div style={{
            position: 'absolute', inset: 0,
            backgroundColor: 'rgba(255, 215, 0, 0.25)',
            pointerEvents: 'none',
          }} />
        )}

        {/* Legal move indicator */}
        {isLegal && !hasPiece && (
          <div style={{
            position: 'absolute',
            width: '30%', height: '30%',
            borderRadius: '50%',
            backgroundColor: 'rgba(0, 255, 136, 0.5)',
            pointerEvents: 'none',
            zIndex: 1,
          }} />
        )}

        {/* Legal capture indicator */}
        {isLegal && hasPiece && (
          <div style={{
            position: 'absolute', inset: 0,
            border: '4px solid rgba(0, 255, 136, 0.5)',
            borderRadius: '4px',
            pointerEvents: 'none',
            zIndex: 1,
          }} />
        )}

        {/* Coordinates */}
        {showCoords && fileIdx === 0 && (
          <span style={{
            position: 'absolute', top: 2, left: 3,
            fontSize: squareSize * 0.2,
            fontWeight: 700,
            color: (actualFileIdx + actualRankIdx) % 2 === 0 ? '#8B6343' : '#E8D5B0',
            lineHeight: 1,
            zIndex: 2,
            userSelect: 'none',
          }}>
            {rank}
          </span>
        )}
        {showCoords && rankIdx === 7 && (
          <span style={{
            position: 'absolute', bottom: 2, right: 3,
            fontSize: squareSize * 0.2,
            fontWeight: 700,
            color: (actualFileIdx + actualRankIdx) % 2 === 0 ? '#8B6343' : '#E8D5B0',
            lineHeight: 1,
            zIndex: 2,
            userSelect: 'none',
          }}>
            {file}
          </span>
        )}

        {/* Piece */}
        {piece && (
          <div style={{
            width: '88%', height: '88%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative', zIndex: 3,
            transition: 'transform 0.1s ease',
            transform: isSelected ? 'scale(1.1)' : 'scale(1)',
          }}>
            <ChessPiece type={piece.type} color={piece.color} />
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      {/* Board */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(8, ${squareSize}px)`,
        gridTemplateRows: `repeat(8, ${squareSize}px)`,
        border: '3px solid rgba(123, 47, 247, 0.4)',
        borderRadius: '4px',
        boxShadow: '0 0 40px rgba(123, 47, 247, 0.3), 0 20px 60px rgba(0,0,0,0.6)',
        overflow: 'hidden',
      }}>
        {Array.from({ length: 8 }, (_, rankIdx) =>
          Array.from({ length: 8 }, (_, fileIdx) =>
            renderSquare(fileIdx, rankIdx)
          )
        )}
      </div>

      {/* Promotion modal */}
      {promotionPending && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'rgba(7,7,10,0.9)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          zIndex: 100,
          borderRadius: '4px',
        }}>
          <p style={{ color: '#F5F5F5', marginBottom: 16, fontSize: 14, letterSpacing: '0.1em' }}>
            PROMOTE PAWN
          </p>
          <div style={{ display: 'flex', gap: 12 }}>
            {['q', 'r', 'b', 'n'].map((p) => (
              <button
                key={p}
                onClick={() => executeMove(promotionPending.from, promotionPending.to, p)}
                style={{
                  width: squareSize,
                  height: squareSize,
                  background: 'rgba(123,47,247,0.2)',
                  border: '1px solid rgba(123,47,247,0.5)',
                  borderRadius: 8,
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s',
                }}
              >
                <ChessPiece type={p} color={chess.turn()} />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChessBoard;
