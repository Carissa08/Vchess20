export type Section = 'hero' | 'dashboard' | 'arena' | 'multiplayer' | 'coach' | 'analysis' | 'training' | 'stats' | 'history';

export interface AuthUser {
  id: string;
  email: string;
  profile: import('../lib/supabase').Profile | null;
}

export interface ChessPieceData {
  type: string;
  color: string;
}

export interface BoardSquare {
  piece: ChessPieceData | null;
  row: number;
  col: number;
  file: string;
  rank: string;
}

export type MoveClassification = 'brilliant' | 'great' | 'best' | 'excellent' | 'good' | 'inaccuracy' | 'mistake' | 'blunder';

export interface AnalyzedMove {
  san: string;
  fen: string;
  eval: number;
  classification: MoveClassification;
  moveNumber: number;
  color: 'w' | 'b';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
}
