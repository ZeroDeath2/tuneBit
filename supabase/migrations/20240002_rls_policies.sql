-- ============================================================
-- Row-Level Security Policies
-- ============================================================

-- Enable RLS on all tables
alter table public.profiles        enable row level security;
alter table public.categories      enable row level security;
alter table public.songs           enable row level security;
alter table public.daily_puzzles   enable row level security;
alter table public.game_sessions   enable row level security;
alter table public.game_guesses    enable row level security;
alter table public.user_stats      enable row level security;
alter table public.leaderboard_entries enable row level security;

-- ============================================================
-- profiles
-- ============================================================
create policy "Profiles are publicly readable"
  on public.profiles for select using (true);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- ============================================================
-- categories (public read-only)
-- ============================================================
create policy "Categories are publicly readable"
  on public.categories for select using (true);

-- ============================================================
-- songs (public read-only; writes via service role only)
-- ============================================================
create policy "Songs are publicly readable"
  on public.songs for select using (true);

-- ============================================================
-- daily_puzzles (public read for puzzle metadata, but NOT song_id before completion)
-- ============================================================
create policy "Daily puzzles are publicly readable"
  on public.daily_puzzles for select using (true);

-- ============================================================
-- game_sessions
-- ============================================================
create policy "Users can read their own sessions"
  on public.game_sessions for select
  using (
    user_id = auth.uid()
    or user_id is null  -- guest sessions are readable by anyone knowing the ID
  );

-- No direct client INSERT/UPDATE — service role only

-- ============================================================
-- game_guesses
-- ============================================================
create policy "Users can read guesses in their own sessions"
  on public.game_guesses for select
  using (
    session_id in (
      select id from public.game_sessions
      where user_id = auth.uid() or user_id is null
    )
  );

-- No direct client INSERT — service role only

-- ============================================================
-- user_stats
-- ============================================================
create policy "Users can read their own stats"
  on public.user_stats for select
  using (user_id = auth.uid());

-- No direct client INSERT/UPDATE — service role only

-- ============================================================
-- leaderboard_entries
-- ============================================================
create policy "Leaderboard entries are publicly readable"
  on public.leaderboard_entries for select using (true);

-- No direct client INSERT — service role only
