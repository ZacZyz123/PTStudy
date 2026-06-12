-- PT Study — initial schema
-- Run via Supabase CLI (supabase db push) or paste into the SQL editor.

-- ============================================================
-- TABLES
-- ============================================================

create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  email text unique,
  role text default 'student' check (role in ('student', 'admin')),
  avatar_color text default '#38BDF8',
  stripe_customer_id text,
  stripe_subscription_id text,
  subscription_status text default 'inactive',
  xp integer default 0,
  streak_days integer default 0,
  last_active_date date,
  last_seen timestamptz default now(),
  created_at timestamptz default now()
);

create table public.content (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  class_name text not null,
  topic text not null,
  file_url text,
  file_type text,
  raw_text text,
  is_published boolean default false,
  is_exam_priority boolean default false,
  created_at timestamptz default now()
);

create table public.study_guides (
  id uuid primary key default gen_random_uuid(),
  content_id uuid references public.content(id) on delete cascade,
  guide_text text,
  created_at timestamptz default now()
);

create table public.flashcards (
  id uuid primary key default gen_random_uuid(),
  content_id uuid references public.content(id) on delete cascade,
  front text not null,
  back text not null,
  created_at timestamptz default now()
);

create table public.quiz_questions (
  id uuid primary key default gen_random_uuid(),
  content_id uuid references public.content(id) on delete cascade,
  question text not null,
  option_a text not null,
  option_b text not null,
  option_c text not null,
  option_d text not null,
  correct_answer text not null,
  explanation text,
  created_at timestamptz default now()
);

create table public.exams (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  exam_date date not null,
  topic_tags text[],
  created_at timestamptz default now()
);

create table public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  content_id uuid references public.content(id) on delete cascade,
  score integer,
  total_questions integer,
  xp_earned integer,
  completed_at timestamptz default now()
);

create table public.challenges (
  id uuid primary key default gen_random_uuid(),
  challenger_id uuid references public.profiles(id) on delete cascade,
  challenged_id uuid references public.profiles(id) on delete cascade,
  content_id uuid references public.content(id) on delete cascade,
  status text default 'pending' check (status in ('pending', 'accepted', 'in_progress', 'completed', 'declined', 'expired')),
  challenger_score integer,
  challenged_score integer,
  winner_id uuid references public.profiles(id),
  xp_awarded integer default 100,
  created_at timestamptz default now()
);

create table public.badges (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  icon text,
  xp_threshold integer
);

create table public.user_badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  badge_id uuid references public.badges(id) on delete cascade,
  earned_at timestamptz default now(),
  unique (user_id, badge_id)
);

create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  content_id uuid references public.content(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  message text not null,
  created_at timestamptz default now()
);

create table public.friendships (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid references public.profiles(id) on delete cascade,
  addressee_id uuid references public.profiles(id) on delete cascade,
  status text default 'pending' check (status in ('pending', 'accepted', 'declined', 'blocked')),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (requester_id, addressee_id),
  check (requester_id <> addressee_id)
);

create table public.direct_messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid references public.profiles(id) on delete cascade,
  receiver_id uuid references public.profiles(id) on delete cascade,
  message text not null,
  is_read boolean default false,
  created_at timestamptz default now()
);

-- Indexes for hot paths
create index idx_quiz_attempts_user on public.quiz_attempts(user_id);
create index idx_challenges_participants on public.challenges(challenger_id, challenged_id);
create index idx_dm_pair on public.direct_messages(sender_id, receiver_id, created_at);
create index idx_friendships_addressee on public.friendships(addressee_id, status);
create index idx_chat_messages_user_content on public.chat_messages(user_id, content_id, created_at);
create index idx_profiles_xp on public.profiles(xp desc);

-- ============================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  colors text[] := array['#38BDF8', '#7C3AED', '#10B981', '#F59E0B', '#EC4899', '#EF4444'];
begin
  insert into public.profiles (id, email, full_name, avatar_color)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    colors[1 + floor(random() * array_length(colors, 1))::int]
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.profiles enable row level security;
alter table public.content enable row level security;
alter table public.study_guides enable row level security;
alter table public.flashcards enable row level security;
alter table public.quiz_questions enable row level security;
alter table public.exams enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.challenges enable row level security;
alter table public.badges enable row level security;
alter table public.user_badges enable row level security;
alter table public.chat_messages enable row level security;
alter table public.friendships enable row level security;
alter table public.direct_messages enable row level security;

-- Helper: is the current user an admin?
create or replace function public.is_admin()
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- profiles: everyone signed in can read (leaderboard, friends), users update self
create policy "profiles_select_authenticated" on public.profiles
  for select to authenticated using (true);
create policy "profiles_update_own" on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- content: students read published, admins manage all
create policy "content_select_published" on public.content
  for select to authenticated using (is_published = true or public.is_admin());
create policy "content_admin_all" on public.content
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- study_guides / flashcards / quiz_questions: readable when parent content is published
create policy "guides_select" on public.study_guides
  for select to authenticated using (
    exists (select 1 from public.content c where c.id = content_id and (c.is_published or public.is_admin()))
  );
create policy "guides_admin_all" on public.study_guides
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "flashcards_select" on public.flashcards
  for select to authenticated using (
    exists (select 1 from public.content c where c.id = content_id and (c.is_published or public.is_admin()))
  );
create policy "flashcards_admin_all" on public.flashcards
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "quiz_questions_select" on public.quiz_questions
  for select to authenticated using (
    exists (select 1 from public.content c where c.id = content_id and (c.is_published or public.is_admin()))
  );
create policy "quiz_questions_admin_all" on public.quiz_questions
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- exams: all students read, admin writes
create policy "exams_select" on public.exams
  for select to authenticated using (true);
create policy "exams_admin_all" on public.exams
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- quiz_attempts: own rows only (XP/score writes go through server API with service role)
create policy "attempts_select_own" on public.quiz_attempts
  for select to authenticated using (user_id = auth.uid());
create policy "attempts_insert_own" on public.quiz_attempts
  for insert to authenticated with check (user_id = auth.uid());

-- challenges: participants only
create policy "challenges_select_participant" on public.challenges
  for select to authenticated using (challenger_id = auth.uid() or challenged_id = auth.uid());
create policy "challenges_insert_challenger" on public.challenges
  for insert to authenticated with check (challenger_id = auth.uid());
create policy "challenges_update_participant" on public.challenges
  for update to authenticated using (challenger_id = auth.uid() or challenged_id = auth.uid());

-- badges: readable by all
create policy "badges_select" on public.badges
  for select to authenticated using (true);

-- user_badges: readable by all (profile pages), awarded server-side
create policy "user_badges_select" on public.user_badges
  for select to authenticated using (true);

-- chat_messages (AI tutor): own rows only
create policy "chat_select_own" on public.chat_messages
  for select to authenticated using (user_id = auth.uid());
create policy "chat_insert_own" on public.chat_messages
  for insert to authenticated with check (user_id = auth.uid());

-- friendships: involved parties only
create policy "friendships_select_involved" on public.friendships
  for select to authenticated using (requester_id = auth.uid() or addressee_id = auth.uid());
create policy "friendships_insert_requester" on public.friendships
  for insert to authenticated with check (requester_id = auth.uid());
create policy "friendships_update_involved" on public.friendships
  for update to authenticated using (requester_id = auth.uid() or addressee_id = auth.uid());
create policy "friendships_delete_involved" on public.friendships
  for delete to authenticated using (requester_id = auth.uid() or addressee_id = auth.uid());

-- direct_messages: sender or receiver only; receiver may mark read
create policy "dm_select_involved" on public.direct_messages
  for select to authenticated using (sender_id = auth.uid() or receiver_id = auth.uid());
create policy "dm_insert_sender" on public.direct_messages
  for insert to authenticated with check (
    sender_id = auth.uid()
    and exists (
      select 1 from public.friendships f
      where f.status = 'accepted'
        and ((f.requester_id = auth.uid() and f.addressee_id = receiver_id)
          or (f.addressee_id = auth.uid() and f.requester_id = receiver_id))
    )
  );
create policy "dm_update_receiver_read" on public.direct_messages
  for update to authenticated using (receiver_id = auth.uid()) with check (receiver_id = auth.uid());

-- ============================================================
-- STORAGE BUCKET (lecture uploads)
-- ============================================================

insert into storage.buckets (id, name, public)
values ('lecture-files', 'lecture-files', false)
on conflict (id) do nothing;

create policy "lecture_files_admin_all" on storage.objects
  for all to authenticated
  using (bucket_id = 'lecture-files' and public.is_admin())
  with check (bucket_id = 'lecture-files' and public.is_admin());

-- ============================================================
-- REALTIME
-- ============================================================

alter publication supabase_realtime add table public.direct_messages;
alter publication supabase_realtime add table public.challenges;
alter publication supabase_realtime add table public.friendships;
alter publication supabase_realtime add table public.profiles;

-- ============================================================
-- SEED BADGES
-- ============================================================

insert into public.badges (name, description, icon, xp_threshold) values
  ('First Quiz', 'Complete your first quiz', 'ti-brain', null),
  ('Quiz Streak', '3 days in a row', 'ti-flame', null),
  ('Challenge Champion', 'Win 5 challenges', 'ti-trophy', null),
  ('Top of Class', 'Reach #1 on leaderboard', 'ti-crown', null),
  ('Knowledge Beast', 'Earn 1,000 XP', 'ti-bolt', 1000),
  ('7-Day Grind', '7-day login streak', 'ti-calendar-check', null),
  ('Social Butterfly', 'Add 5 friends', 'ti-users', null),
  ('Perfect Score', 'Get 100% on a quiz', 'ti-star', null);
