-- Create daily_gauntlets table
CREATE TABLE IF NOT EXISTS public.daily_gauntlets (
  id uuid primary key default gen_random_uuid(),
  gauntlet_date date not null,
  language text not null check (language in ('english', 'malayalam', 'all')),
  song_ids uuid[] not null,
  created_at timestamptz not null default now(),
  unique (gauntlet_date, language)
);

CREATE INDEX IF NOT EXISTS daily_gauntlets_date_idx ON public.daily_gauntlets(gauntlet_date);

-- Modify game_sessions
ALTER TABLE public.game_sessions ADD COLUMN IF NOT EXISTS gauntlet_id uuid references public.daily_gauntlets(id) on delete cascade;
ALTER TABLE public.game_sessions ADD COLUMN IF NOT EXISTS round_number integer default 1 check (round_number >= 1 and round_number <= 3);
ALTER TABLE public.game_sessions ADD COLUMN IF NOT EXISTS total_score integer default 0;

-- Modify game_guesses to support multiple rounds in the same session
ALTER TABLE public.game_guesses ADD COLUMN IF NOT EXISTS round_number integer default 1 check (round_number >= 1 and round_number <= 3);
ALTER TABLE public.game_guesses DROP CONSTRAINT IF EXISTS game_guesses_session_id_attempt_number_key;
ALTER TABLE public.game_guesses ADD CONSTRAINT game_guesses_session_round_attempt_key UNIQUE (session_id, round_number, attempt_number);

-- Modify leaderboard_entries
ALTER TABLE public.leaderboard_entries ADD COLUMN IF NOT EXISTS gauntlet_id uuid references public.daily_gauntlets(id) on delete cascade;

-- Remove old constraint
ALTER TABLE public.leaderboard_entries DROP CONSTRAINT IF EXISTS leaderboard_entries_user_id_puzzle_id_key;

-- Add new constraint
ALTER TABLE public.leaderboard_entries ADD CONSTRAINT leaderboard_entries_user_id_gauntlet_id_key UNIQUE (user_id, gauntlet_id);

-- Make puzzle_id nullable since we will rely on gauntlet_id for daily games
ALTER TABLE public.leaderboard_entries ALTER COLUMN puzzle_id DROP NOT NULL;

-- Update the attempts limit to allow up to 18 (3 rounds * 6 max attempts)
ALTER TABLE public.leaderboard_entries DROP CONSTRAINT IF EXISTS leaderboard_entries_attempts_check;
ALTER TABLE public.leaderboard_entries ADD CONSTRAINT leaderboard_entries_attempts_check CHECK (attempts >= 1 and attempts <= 18);
