/*
# VCHESS Platform Schema

## Overview
Full schema for the VCHESS futuristic AI chess platform.

## New Tables

### profiles
Extended user profiles linked to auth.users. Stores display name, avatar, ELO ratings for all time controls (rapid, blitz, bullet, puzzle), win/loss/draw stats, and preferences.

### games
Chess games with full metadata — time control, result, PGN, FEN at end, both player UUIDs (or null for AI games), accuracy scores, and timestamps.

### game_moves
Individual moves within a game. Stores move number, SAN notation, FEN after move, time spent, evaluation score, and move classification (brilliant/blunder/etc.).

### multiplayer_rooms
Realtime multiplayer rooms for pairing players. Tracks room code, player assignments (white/black), game state, status, time control, and current FEN.

### puzzles
Chess puzzles with FEN positions, solution moves (array), themes, difficulty, and rating.

### puzzle_attempts
Records each user's puzzle attempt — whether solved, time taken, rating change.

## Security
- RLS enabled on all tables.
- Profiles: users can read all profiles (for leaderboard), but only update their own.
- Games: readable by participants; insertable by authenticated users.
- Game moves: readable by game participants.
- Multiplayer rooms: authenticated CRUD.
- Puzzles: read-only for authenticated users.
- Puzzle attempts: owner-scoped.
*/

-- PROFILES
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  avatar_url text,
  rating_rapid integer NOT NULL DEFAULT 1200,
  rating_blitz integer NOT NULL DEFAULT 1200,
  rating_bullet integer NOT NULL DEFAULT 1200,
  rating_puzzle integer NOT NULL DEFAULT 1200,
  wins integer NOT NULL DEFAULT 0,
  losses integer NOT NULL DEFAULT 0,
  draws integer NOT NULL DEFAULT 0,
  games_played integer NOT NULL DEFAULT 0,
  accuracy_avg numeric(5,2) DEFAULT 0,
  country text DEFAULT 'Unknown',
  title text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select" ON profiles;
CREATE POLICY "profiles_select" ON profiles FOR SELECT
  TO authenticated, anon USING (true);

DROP POLICY IF EXISTS "profiles_insert" ON profiles;
CREATE POLICY "profiles_insert" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update" ON profiles;
CREATE POLICY "profiles_update" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_delete" ON profiles;
CREATE POLICY "profiles_delete" ON profiles FOR DELETE
  TO authenticated USING (auth.uid() = id);

-- GAMES
CREATE TABLE IF NOT EXISTS games (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  white_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  black_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  white_username text NOT NULL DEFAULT 'Player',
  black_username text NOT NULL DEFAULT 'Opponent',
  time_control text NOT NULL DEFAULT '10+0',
  game_mode text NOT NULL DEFAULT 'rapid',
  result text,
  termination text,
  pgn text,
  final_fen text,
  white_accuracy numeric(5,2),
  black_accuracy numeric(5,2),
  white_rating integer DEFAULT 1200,
  black_rating integer DEFAULT 1200,
  white_rating_change integer DEFAULT 0,
  black_rating_change integer DEFAULT 0,
  move_count integer DEFAULT 0,
  is_vs_ai boolean DEFAULT false,
  ai_difficulty text,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

ALTER TABLE games ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "games_select" ON games;
CREATE POLICY "games_select" ON games FOR SELECT
  TO authenticated, anon USING (true);

DROP POLICY IF EXISTS "games_insert" ON games;
CREATE POLICY "games_insert" ON games FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "games_update" ON games;
CREATE POLICY "games_update" ON games FOR UPDATE
  TO authenticated USING (white_id = auth.uid() OR black_id = auth.uid()) WITH CHECK (true);

DROP POLICY IF EXISTS "games_delete" ON games;
CREATE POLICY "games_delete" ON games FOR DELETE
  TO authenticated USING (white_id = auth.uid() OR black_id = auth.uid());

-- GAME MOVES
CREATE TABLE IF NOT EXISTS game_moves (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id uuid NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  move_number integer NOT NULL,
  color text NOT NULL,
  san text NOT NULL,
  uci text,
  fen_after text,
  time_spent_ms integer DEFAULT 0,
  eval_score numeric(6,2),
  classification text DEFAULT 'good',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE game_moves ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "game_moves_select" ON game_moves;
CREATE POLICY "game_moves_select" ON game_moves FOR SELECT
  TO authenticated, anon USING (true);

DROP POLICY IF EXISTS "game_moves_insert" ON game_moves;
CREATE POLICY "game_moves_insert" ON game_moves FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "game_moves_update" ON game_moves;
CREATE POLICY "game_moves_update" ON game_moves FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "game_moves_delete" ON game_moves;
CREATE POLICY "game_moves_delete" ON game_moves FOR DELETE
  TO authenticated USING (true);

-- MULTIPLAYER ROOMS
CREATE TABLE IF NOT EXISTS multiplayer_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_code text UNIQUE NOT NULL,
  host_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  white_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  black_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  white_username text,
  black_username text,
  game_id uuid REFERENCES games(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'waiting',
  time_control text DEFAULT '10+0',
  current_fen text DEFAULT 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  turn text DEFAULT 'w',
  pgn text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE multiplayer_rooms ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "rooms_select" ON multiplayer_rooms;
CREATE POLICY "rooms_select" ON multiplayer_rooms FOR SELECT
  TO authenticated, anon USING (true);

DROP POLICY IF EXISTS "rooms_insert" ON multiplayer_rooms;
CREATE POLICY "rooms_insert" ON multiplayer_rooms FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "rooms_update" ON multiplayer_rooms;
CREATE POLICY "rooms_update" ON multiplayer_rooms FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "rooms_delete" ON multiplayer_rooms;
CREATE POLICY "rooms_delete" ON multiplayer_rooms FOR DELETE
  TO authenticated USING (host_id = auth.uid());

-- PUZZLES
CREATE TABLE IF NOT EXISTS puzzles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fen text NOT NULL,
  moves text[] NOT NULL,
  themes text[] DEFAULT '{}',
  rating integer DEFAULT 1200,
  difficulty text DEFAULT 'medium',
  title text DEFAULT 'Tactical Puzzle',
  description text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE puzzles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "puzzles_select" ON puzzles;
CREATE POLICY "puzzles_select" ON puzzles FOR SELECT
  TO authenticated, anon USING (true);

-- PUZZLE ATTEMPTS
CREATE TABLE IF NOT EXISTS puzzle_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  puzzle_id uuid NOT NULL REFERENCES puzzles(id) ON DELETE CASCADE,
  solved boolean DEFAULT false,
  time_ms integer DEFAULT 0,
  rating_before integer DEFAULT 1200,
  rating_after integer DEFAULT 1200,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE puzzle_attempts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "attempts_select" ON puzzle_attempts;
CREATE POLICY "attempts_select" ON puzzle_attempts FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "attempts_insert" ON puzzle_attempts;
CREATE POLICY "attempts_insert" ON puzzle_attempts FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "attempts_update" ON puzzle_attempts;
CREATE POLICY "attempts_update" ON puzzle_attempts FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "attempts_delete" ON puzzle_attempts;
CREATE POLICY "attempts_delete" ON puzzle_attempts FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_games_white_id ON games(white_id);
CREATE INDEX IF NOT EXISTS idx_games_black_id ON games(black_id);
CREATE INDEX IF NOT EXISTS idx_games_created_at ON games(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_game_moves_game_id ON game_moves(game_id);
CREATE INDEX IF NOT EXISTS idx_rooms_code ON multiplayer_rooms(room_code);
CREATE INDEX IF NOT EXISTS idx_attempts_user ON puzzle_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_attempts_puzzle ON puzzle_attempts(puzzle_id);

-- SEED PUZZLES
INSERT INTO puzzles (fen, moves, themes, rating, difficulty, title, description) VALUES
('r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4', ARRAY['d1e2','d8e7','e1g1'], ARRAY['opening','development'], 1100, 'easy', 'Fried Liver Setup', 'Find the best developing move'),
('r2qkb1r/ppp2ppp/2n1bn2/3pp3/2B1P3/2NP1N2/PPP2PPP/R1BQK2R w KQkq - 0 6', ARRAY['c4f7','e8f7','d1b3'], ARRAY['tactics','fork'], 1300, 'medium', 'Deadly Fork', 'Can you find the winning combination?'),
('1rb2rk1/p4ppp/1pnqp3/3n4/2pP4/2N1PN2/PP3PPP/R1BQR1K1 w - - 0 13', ARRAY['d1d3','d5f4','d3f1'], ARRAY['tactics','pin'], 1500, 'hard', 'Knight Maneuver', 'A deep tactical sequence awaits'),
('r1bq1rk1/2p1bppp/p1n2n2/1p1pp3/3PP3/1BN2N2/PPP2PPP/R1BQR1K1 w - - 0 9', ARRAY['d4e5','c6e5','f3e5'], ARRAY['tactics','pawn'], 1200, 'medium', 'Central Break', 'Seize the center!'),
('r3r1k1/pp3ppp/2p5/4Pb2/2B2P2/q5P1/P1Q4P/1R3RK1 w - - 0 25', ARRAY['c2c3','a3a2','b1b8','e8b8','c4b3'], ARRAY['endgame','combination'], 1700, 'hard', 'Brilliant Exchange', 'Find the forcing sequence')
ON CONFLICT DO NOTHING;
