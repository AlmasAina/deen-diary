-- Deen Diary: phone push tokens (run after 003_notifications.sql).
create table if not exists public.device_tokens (
  token      text primary key,
  user_id    uuid not null references auth.users(id) on delete cascade,
  platform   text not null default 'android',
  updated_at timestamptz not null default now()
);
alter table public.device_tokens enable row level security;
drop policy if exists "own tokens" on public.device_tokens;
create policy "own tokens" on public.device_tokens for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
alter table public.notification_prefs add column if not exists push_on boolean not null default true;
