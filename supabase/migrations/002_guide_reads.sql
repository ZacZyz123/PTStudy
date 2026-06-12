-- Tracks which guides a user has read, so the "read a study guide" XP
-- reward (5 XP) can be awarded exactly once per guide.

create table public.guide_reads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  content_id uuid references public.content(id) on delete cascade,
  created_at timestamptz default now(),
  unique (user_id, content_id)
);

alter table public.guide_reads enable row level security;

create policy "guide_reads_select_own" on public.guide_reads
  for select to authenticated using (user_id = auth.uid());
create policy "guide_reads_insert_own" on public.guide_reads
  for insert to authenticated with check (user_id = auth.uid());
