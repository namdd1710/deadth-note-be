create table if not exists public.names (
  id bigint generated always as identity primary key,
  name text not null check (char_length(name) between 1 and 100),
  created_at timestamptz not null default now()
);

alter table public.names enable row level security;
