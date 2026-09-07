-- ============================================================
-- TuneBit Initial Schema
-- ============================================================

-- Enable required extensions
create extension if not exists "pgcrypto";
create extension if not exists "uuid-ossp";

-- ============================================================
-- profiles
-- ============================================================
create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  display_name  text,
  avatar_url    text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Automatically create a profile row when a user signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- categories
-- ============================================================
create table if not exists public.categories (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  label       text not null,
  description text,
  created_at  timestamptz not null default now()
);

insert into public.categories (slug, label, description) values
  ('all',        'All Genres',   'Mix of all genres'),
  ('pop',        'Pop',          'Popular music'),
  ('hiphop',     'Hip-Hop',      'Hip-hop and rap'),
  ('rock',       'Rock',         'Rock music'),
  ('electronic', 'Electronic',   'Electronic and dance music'),
  ('rnb',        'R&B',          'Rhythm and blues')
on conflict (slug) do nothing;

-- ============================================================
-- songs
-- ============================================================
create table if not exists public.songs (
  id            uuid primary key default gen_random_uuid(),
  soundcloud_id text not null unique,
  title         text not null,
  artist        text not null,
  album         text,
  artwork_url   text,
  genre         text,
  duration_secs integer,
  streamable    boolean not null default true,
  category_id   uuid references public.categories(id) on delete set null,
  created_at    timestamptz not null default now()
);

create index if not exists songs_category_idx on public.songs(category_id);
create index if not exists songs_streamable_idx on public.songs(streamable);

-- ============================================================
-- daily_puzzles
-- ============================================================
create table if not exists public.daily_puzzles (
  id          uuid primary key default gen_random_uuid(),
  puzzle_date date not null,
  category_id uuid not null references public.categories(id) on delete cascade,
  song_id     uuid not null references public.songs(id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique (puzzle_date, category_id)
);

create index if not exists daily_puzzles_date_idx on public.daily_puzzles(puzzle_date);

-- ============================================================
-- game_sessions
-- ============================================================
create table if not exists public.game_sessions (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid references auth.users(id) on delete set null,
  puzzle_id            uuid references public.daily_puzzles(id) on delete set null,
  mode                 text not null check (mode in ('daily', 'practice')),
  status               text not null default 'playing' check (status in ('playing', 'won', 'lost')),
  attempts_used        integer not null default 0 check (attempts_used >= 0 and attempts_used <= 6),
  current_reveal_stage integer not null default 0 check (current_reveal_stage >= 0 and current_reveal_stage <= 5),
  started_at           timestamptz not null default now(),
  completed_at         timestamptz,
  created_at           timestamptz not null default now()
);

create index if not exists game_sessions_user_idx on public.game_sessions(user_id);
create index if not exists game_sessions_puzzle_idx on public.game_sessions(puzzle_id);

-- ============================================================
-- game_guesses
-- ============================================================
create table if not exists public.game_guesses (
  id              uuid primary key default gen_random_uuid(),
  session_id      uuid not null references public.game_sessions(id) on delete cascade,
  guessed_song_id uuid references public.songs(id) on delete set null,
  attempt_number  integer not null check (attempt_number >= 1 and attempt_number <= 6),
  is_correct      boolean not null default false,
  created_at      timestamptz not null default now(),
  unique (session_id, attempt_number)
);

create index if not exists game_guesses_session_idx on public.game_guesses(session_id);

-- ============================================================
-- user_stats
-- ============================================================
create table if not exists public.user_stats (
  user_id          uuid primary key references auth.users(id) on delete cascade,
  games_played     integer not null default 0,
  games_won        integer not null default 0,
  current_streak   integer not null default 0,
  best_streak      integer not null default 0,
  average_attempts numeric(5,2) not null default 0,
  last_played_date date,
  updated_at       timestamptz not null default now()
);

-- ============================================================
-- leaderboard_entries
-- ============================================================
create table if not exists public.leaderboard_entries (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  puzzle_id    uuid not null references public.daily_puzzles(id) on delete cascade,
  attempts     integer not null check (attempts >= 1 and attempts <= 6),
  score        integer not null default 0,
  completed_at timestamptz not null default now(),
  unique (user_id, puzzle_id)
);

create index if not exists leaderboard_user_idx on public.leaderboard_entries(user_id);
create index if not exists leaderboard_puzzle_idx on public.leaderboard_entries(puzzle_id);
create index if not exists leaderboard_score_idx on public.leaderboard_entries(score desc);
create index if not exists leaderboard_completed_idx on public.leaderboard_entries(completed_at desc);
