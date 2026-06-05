import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  username: string;
  avatar_url: string | null;
  rating_rapid: number;
  rating_blitz: number;
  rating_bullet: number;
  rating_puzzle: number;
  wins: number;
  losses: number;
  draws: number;
  games_played: number;
  accuracy_avg: number;
  country: string;
  title: string;
  created_at: string;
};

export type Game = {
  id: string;
  white_id: string | null;
  black_id: string | null;
  white_username: string;
  black_username: string;
  time_control: string;
  game_mode: string;
  result: string | null;
  termination: string | null;
  pgn: string | null;
  white_accuracy: number | null;
  black_accuracy: number | null;
  white_rating: number;
  black_rating: number;
  move_count: number;
  is_vs_ai: boolean;
  ai_difficulty: string | null;
  created_at: string;
  completed_at: string | null;
};

export type MultiplayerRoom = {
  id: string;
  room_code: string;
  host_id: string | null;
  white_id: string | null;
  black_id: string | null;
  white_username: string | null;
  black_username: string | null;
  game_id: string | null;
  status: string;
  time_control: string;
  current_fen: string;
  turn: string;
  pgn: string;
  created_at: string;
  updated_at: string;
};

export type Puzzle = {
  id: string;
  fen: string;
  moves: string[];
  themes: string[];
  rating: number;
  difficulty: string;
  title: string;
  description: string | null;
};
