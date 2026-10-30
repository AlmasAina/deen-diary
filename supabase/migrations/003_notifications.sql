-- Deen Diary: reminder preferences and notification history (run after 002_admin.sql).
-- Dashboard > SQL Editor > New query > paste > Run.

create table if not exists public.notification_prefs (
  user_id     uuid primary key references auth.users(id) on delete cascade,
  email_on    boolean not null default false,          -- master switch for optional emails
  daily_hour  int     not null default 20 check (daily_hour between 0 and 23),
  tz          text    not null default 'Asia/Karachi',
  cats        jsonb   not null default '{"quran":true,"azkar":true,"habits":true,"learning":true}'::jsonb,
  weekly      boolean not null default false,
  weekly_day  int     not null default 5 check (weekly_day between 0 and 6),   -- 0 = Sunday, 5 = Friday
  inactivity  boolean not null default false,
  quiet_from  int     not null default 22 check (quiet_from between 0 and 23),
  quiet_to    int     not null default 6  check (quiet_to between 0 and 23),
  unsub_token uuid    not null default gen_random_uuid(),
  updated_at  timestamptz not null default now()
);
alter table public.notification_prefs enable row level security;
drop policy if exists "own prefs" on public.notification_prefs;
create policy "own prefs" on public.notification_prefs for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- one row per sent notification; the unique key stops duplicates (one daily reminder per day, etc.)
create table if not exists public.notification_log (
  id       bigserial primary key,
  user_id  uuid not null references auth.users(id) on delete cascade,
  kind     text not null,              -- daily | weekly | inactive
  day      date not null,
  channel  text not null default 'email',
  title    text not null default '',
  body     text not null default '',
  read     boolean not null default false,
  sent_at  timestamptz not null default now(),
  unique (user_id, kind, day)
);
alter table public.notification_log enable row level security;
drop policy if exists "own log read" on public.notification_log;
drop policy if exists "own log mark read" on public.notification_log;
create policy "own log read" on public.notification_log for select to authenticated using (auth.uid() = user_id);
create policy "own log mark read" on public.notification_log for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Hourly schedule (run this part AFTER deploying the send-reminders function and setting its secrets).
-- 1) Store the service role key in the vault (Project Settings > API Keys > secret key). Paste it between the quotes:
--    select vault.create_secret('PASTE_SECRET_KEY_HERE', 'dd_service_key');
-- 2) Enable the pg_cron and pg_net extensions (Database > Extensions), then run:
--    select cron.schedule('deen-diary-reminders', '5 * * * *', $$
--      select net.http_post(
--        url := 'https://nzlmwilrqgdnflyoryxh.supabase.co/functions/v1/send-reminders',
--        headers := jsonb_build_object('Content-Type','application/json',
--                   'Authorization','Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'dd_service_key')),
--        body := '{}'::jsonb);
--    $$);
