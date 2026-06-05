import { Chess } from 'chess.js';

// Piece values
const PIECE_VALUES: Record<string, number> = {
  p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000,
};

// Piece-square tables for positional evaluation
const PST: Record<string, number[][]> = {
  p: [
    [ 0,  0,  0,  0,  0,  0,  0,  0],
    [50, 50, 50, 50, 50, 50, 50, 50],
    [10, 10, 20, 30, 30, 20, 10, 10],
    [ 5,  5, 10, 25, 25, 10,  5,  5],
    [ 0,  0,  0, 20, 20,  0,  0,  0],
    [ 5, -5,-10,  0,  0,-10, -5,  5],
    [ 5, 10, 10,-20,-20, 10, 10,  5],
    [ 0,  0,  0,  0,  0,  0,  0,  0],
  ],
  n: [
    [-50,-40,-30,-30,-30,-30,-40,-50],
    [-40,-20,  0,  0,  0,  0,-20,-40],
    [-30,  0, 10, 15, 15, 10,  0,-30],
    [-30,  5, 15, 20, 20, 15,  5,-30],
    [-30,  0, 15, 20, 20, 15,  0,-30],
    [-30,  5, 10, 15, 15, 10,  5,-30],
    [-40,-20,  0,  5,  5,  0,-20,-40],
    [-50,-40,-30,-30,-30,-30,-40,-50],
  ],
  b: [
    [-20,-10,-10,-10,-10,-10,-10,-20],
    [-10,  0,  0,  0,  0,  0,  0,-10],
    [-10,  0,  5, 10, 10,  5,  0,-10],
    [-10,  5,  5, 10, 10,  5,  5,-10],
    [-10,  0, 10, 10, 10, 10,  0,-10],
    [-10, 10, 10, 10, 10, 10, 10,-10],
    [-10,  5,  0,  0,  0,  0,  5,-10],
    [-20,-10,-10,-10,-10,-10,-10,-20],
  ],
  r: [
    [ 0,  0,  0,  0,  0,  0,  0,  0],
    [ 5, 10, 10, 10, 10, 10, 10,  5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [ 0,  0,  0,  5,  5,  0,  0,  0],
  ],
  q: [
    [-20,-10,-10, -5, -5,-10,-10,-20],
    [-10,  0,  0,  0,  0,  0,  0,-10],
    [-10,  0,  5,  5,  5,  5,  0,-10],
    [ -5,  0,  5,  5,  5,  5,  0, -5],
    [  0,  0,  5,  5,  5,  5,  0, -5],
    [-10,  5,  5,  5,  5,  5,  0,-10],
    [-10,  0,  5,  0,  0,  0,  0,-10],
    [-20,-10,-10, -5, -5,-10,-10,-20],
  ],
  k: [
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-20,-30,-30,-40,-40,-30,-30,-20],
    [-10,-20,-20,-20,-20,-20,-20,-10],
    [ 20, 20,  0,  0,  0,  0, 20, 20],
    [ 20, 30, 10,  0,  0, 10, 30, 20],
  ],
};

function getPSTValue(piece: string, color: string, row: number, col: number): number {
  const table = PST[piece.toLowerCase()];
  if (!table) return 0;
  const r = color === 'w' ? row : 7 - row;
  return table[r][col];
}

function evaluateBoard(chess: Chess): number {
  const board = chess.board();
  let score = 0;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (!piece) continue;
      const val = PIECE_VALUES[piece.type] + getPSTValue(piece.type, piece.color, r, c);
      score += piece.color === 'w' ? val : -val;
    }
  }
  return score;
}

function minimax(
  chess: Chess,
  depth: number,
  alpha: number,
  beta: number,
  maximizing: boolean
): number {
  if (depth === 0 || chess.isGameOver()) {
    if (chess.isCheckmate()) return maximizing ? -99999 : 99999;
    if (chess.isDraw()) return 0;
    return evaluateBoard(chess);
  }

  const moves = chess.moves({ verbose: false });
  if (maximizing) {
    let best = -Infinity;
    for (const move of moves) {
      chess.move(move);
      best = Math.max(best, minimax(chess, depth - 1, alpha, beta, false));
      chess.undo();
      alpha = Math.max(alpha, best);
      if (beta <= alpha) break;
    }
    return best;
  } else {
    let best = Infinity;
    for (const move of moves) {
      chess.move(move);
      best = Math.min(best, minimax(chess, depth - 1, alpha, beta, true));
      chess.undo();
      beta = Math.min(beta, best);
      if (beta <= alpha) break;
    }
    return best;
  }
}

export type AIDifficulty = 'beginner' | 'easy' | 'medium' | 'hard' | 'master';

const DEPTH_MAP: Record<AIDifficulty, number> = {
  beginner: 1,
  easy: 2,
  medium: 3,
  hard: 4,
  master: 5,
};

const RANDOM_MAP: Record<AIDifficulty, number> = {
  beginner: 0.8,
  easy: 0.5,
  medium: 0.2,
  hard: 0.05,
  master: 0,
};

export function getBestMove(fen: string, difficulty: AIDifficulty): string | null {
  const chess = new Chess(fen);
  if (chess.isGameOver()) return null;

  const moves = chess.moves({ verbose: false });
  if (moves.length === 0) return null;

  const randomChance = RANDOM_MAP[difficulty];
  if (Math.random() < randomChance) {
    return moves[Math.floor(Math.random() * moves.length)];
  }

  const depth = DEPTH_MAP[difficulty];
  const isMaximizing = chess.turn() === 'w';

  let bestMove = moves[0];
  let bestScore = isMaximizing ? -Infinity : Infinity;

  for (const move of moves) {
    chess.move(move);
    const score = minimax(chess, depth - 1, -Infinity, Infinity, !isMaximizing);
    chess.undo();

    if (isMaximizing ? score > bestScore : score < bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove;
}

export function getEvalScore(fen: string): number {
  const chess = new Chess(fen);
  if (chess.isCheckmate()) return chess.turn() === 'w' ? -50 : 50;
  if (chess.isDraw()) return 0;
  const raw = evaluateBoard(chess);
  return Math.max(-20, Math.min(20, raw / 100));
}

export function classifyMove(scoreBefore: number, scoreAfter: number, color: string): string {
  const delta = color === 'w' ? scoreAfter - scoreBefore : scoreBefore - scoreAfter;
  if (delta >= 3) return 'brilliant';
  if (delta >= 1) return 'great';
  if (delta >= -0.1) return 'best';
  if (delta >= -0.3) return 'excellent';
  if (delta >= -0.5) return 'good';
  if (delta >= -1) return 'inaccuracy';
  if (delta >= -2) return 'mistake';
  return 'blunder';
}

export function getOpeningName(pgn: string): string {
  const openings: Record<string, string> = {
    'e4 e5 Nf3 Nc6 Bb5': 'Ruy Lopez',
    'e4 e5 Nf3 Nc6 Bc4': 'Italian Game',
    'e4 c5': 'Sicilian Defense',
    'e4 e6': 'French Defense',
    'e4 c6': 'Caro-Kann Defense',
    'd4 d5 c4': "Queen's Gambit",
    'd4 Nf6 c4 g6': "King's Indian Defense",
    'e4 Nf6': "Alekhine's Defense",
    'e4 e5 Nf3 f6': 'Damiano Defense',
    'Nf3 d5 g3': "Reti Opening",
  };
  for (const [key, name] of Object.entries(openings)) {
    if (pgn.startsWith(key)) return name;
  }
  return 'Custom Opening';
}
