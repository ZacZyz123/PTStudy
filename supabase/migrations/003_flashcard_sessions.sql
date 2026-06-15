-- Tracks flashcard deck completions so the "studied a flashcard deck" XP
-- reward (15 XP) can be awarded at most once per deck per day. The
-- session_date column defaults to the current date, and the unique
-- constraint makes the award idempotent for that day.

create table public.flashcard_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  content_id uuid references public.content(id) on delete cascade,
  session_date date default current_date,
  created_at timestamptz default now(),
  unique (user_id, content_id, session_date)
);

alter table public.flashcard_sessions enable row level security;

create policy "flashcard_sessions_select_own" on public.flashcard_sessions
  for select to authenticated using (user_id = auth.uid());
create policy "flashcard_sessions_insert_own" on public.flashcard_sessions
  for insert to authenticated with check (user_id = auth.uid());
