-- Deen Diary: "we miss you" emails every 24 hours away, on by default (run after 003_notifications.sql).
alter table public.notification_prefs add column if not exists last_seen timestamptz;
alter table public.notification_prefs alter column inactivity set default true;
update public.notification_prefs set inactivity = true where inactivity = false;
