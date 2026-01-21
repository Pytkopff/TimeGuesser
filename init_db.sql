-- TimeGuesser: Supabase schema (leaderboard + game tables)
-- This file assumes a clean database.

create extension if not exists pgcrypto;

-- Core users (shared with leaderboard + game)
create table users (
  canonical_user_id text primary key,
  farcaster_fid bigint,
  display_name text,
  avatar_url text,
  wallet text,
  created_at timestamptz default now()
);

-- Leaderboard entries (Snake-compatible modes)
create table leaderboard_entries (
  id uuid primary key default gen_random_uuid(),
  canonical_user_id text references users (canonical_user_id) on delete cascade,
  mode text not null check (mode in ('classic', 'walls', 'chill', 'apples')),
  score integer default 0,
  total_apples integer default 0,
  created_at timestamptz default now()
);

create index leaderboard_entries_mode_score_idx
  on leaderboard_entries (mode, score desc);

create index leaderboard_entries_mode_apples_idx
  on leaderboard_entries (mode, total_apples desc);

create index leaderboard_entries_user_idx
  on leaderboard_entries (canonical_user_id);

-- Photos bank
create table photos (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  year_true integer not null,
  title text,
  source text,
  license text,
  year_min integer,
  year_max integer,
  created_at timestamptz default now()
);

-- Game session (5 rounds)
create table games (
  id uuid primary key default gen_random_uuid(),
  canonical_user_id text references users (canonical_user_id) on delete set null,
  farcaster_fid bigint,
  frame_session_id text,
  started_at timestamptz default now(),
  ended_at timestamptz,
  total_score integer default 0,
  device text,
  locale text
);

create index games_user_ended_idx
  on games (canonical_user_id, ended_at desc);

-- Per-round results
create table rounds (
  id uuid primary key default gen_random_uuid(),
  game_id uuid references games (id) on delete cascade,
  photo_id uuid references photos (id),
  round_index smallint not null check (round_index between 1 and 5),
  year_guess integer,
  year_true integer not null,
  delta_years integer,
  score integer,
  answered_at timestamptz,
  created_at timestamptz default now()
);

create index rounds_game_idx on rounds (game_id);
create index rounds_photo_idx on rounds (photo_id);

-- On-chain mint tracking (Builder Score)
create table mints (
  id uuid primary key default gen_random_uuid(),
  game_id uuid references games (id) on delete cascade,
  tx_hash text unique,
  chain_id integer,
  token_id text,
  minted_at timestamptz default now(),
  status text not null default 'pending' check (status in ('pending', 'success', 'failed'))
);

create index mints_game_idx on mints (game_id);

-- Leaderboard views (Snake-style)
create view leaderboard_classic as
select
  u.canonical_user_id,
  u.display_name,
  u.avatar_url,
  max(e.score) as score
from leaderboard_entries e
join users u on u.canonical_user_id = e.canonical_user_id
where e.mode = 'classic'
group by u.canonical_user_id, u.display_name, u.avatar_url
order by score desc;

create view leaderboard_walls as
select
  u.canonical_user_id,
  u.display_name,
  u.avatar_url,
  max(e.score) as score
from leaderboard_entries e
join users u on u.canonical_user_id = e.canonical_user_id
where e.mode = 'walls'
group by u.canonical_user_id, u.display_name, u.avatar_url
order by score desc;

create view leaderboard_chill as
select
  u.canonical_user_id,
  u.display_name,
  u.avatar_url,
  max(e.score) as score
from leaderboard_entries e
join users u on u.canonical_user_id = e.canonical_user_id
where e.mode = 'chill'
group by u.canonical_user_id, u.display_name, u.avatar_url
order by score desc;

create view leaderboard_total_apples as
select
  u.canonical_user_id,
  u.display_name,
  u.avatar_url,
  sum(e.total_apples) as total_apples
from leaderboard_entries e
join users u on u.canonical_user_id = e.canonical_user_id
group by u.canonical_user_id, u.display_name, u.avatar_url
order by total_apples desc;

-- TimeGuesser leaderboards
create view leaderboard_top_score as
select
  u.canonical_user_id,
  u.display_name,
  u.avatar_url,
  max(g.total_score) as score
from games g
join users u on u.canonical_user_id = g.canonical_user_id
where g.ended_at is not null
group by u.canonical_user_id, u.display_name, u.avatar_url
order by score desc;

create view leaderboard_best_accuracy as
select
  u.canonical_user_id,
  u.display_name,
  u.avatar_url,
  round(avg(abs(r.delta_years))::numeric, 2) as avg_delta,
  round(avg(abs(r.delta_years))::numeric, 2) as score
from rounds r
join games g on g.id = r.game_id
join users u on u.canonical_user_id = g.canonical_user_id
where r.delta_years is not null
group by u.canonical_user_id, u.display_name, u.avatar_url
order by avg_delta asc;
