-- Deen Diary: admin role, question bank, audit log and admin-only statistics.
-- Run once in Supabase: Dashboard > SQL Editor > New query > paste > Run (after 001_user_data.sql).
-- To add another admin later:  insert into public.admin_emails(email) values ('someone@example.com');

-- 1. Admins are listed by email. RLS is on with no policies, so the app can never write here;
--    only the project owner (SQL editor) can add or remove admins.
create table if not exists public.admin_emails (
  email text primary key,
  added_at timestamptz not null default now()
);
alter table public.admin_emails enable row level security;
insert into public.admin_emails(email) values ('almasaina2003@gmail.com') on conflict do nothing;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_emails a
    join auth.users u on lower(u.email) = lower(a.email)
    where u.id = auth.uid() and u.email_confirmed_at is not null
  );
$$;
grant execute on function public.is_admin() to authenticated;

-- 2. Question bank managed from the admin panel.
--    A row whose id matches a built-in question replaces it; status 'hidden' removes it from the app.
create table if not exists public.questions (
  id          text primary key default ('q' || substr(md5(random()::text || clock_timestamp()::text), 1, 10)),
  cat         text not null,
  difficulty  text not null default 'easy' check (difficulty in ('easy','medium','hard')),
  status      text not null default 'draft' check (status in ('draft','review','published','hidden')),
  q           jsonb not null,                -- {"en":..,"roman":..,"ur":..}
  options     jsonb not null,                -- [{"en":..,"roman":..,"ur":..} x4]
  correct     int  not null check (correct between 0 and 3),
  expl        jsonb not null default '{}'::jsonb,
  ref         text not null default '',
  src         text not null default 'seerah' check (src in ('quran','hadith','seerah','history','meta')),
  topic       text not null default '',
  points      int  not null default 10 check (points between 0 and 100),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  created_by  uuid default auth.uid()
);
alter table public.questions enable row level security;

drop policy if exists "read published questions" on public.questions;
drop policy if exists "admins manage questions" on public.questions;
create policy "read published questions" on public.questions for select to anon, authenticated
  using (status in ('published','hidden') or public.is_admin());
create policy "admins manage questions" on public.questions for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- quality gate: a published question needs four options, an explanation and a source
create or replace function public.questions_guard()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  if new.status = 'published' then
    if jsonb_typeof(new.options) <> 'array' or jsonb_array_length(new.options) <> 4 then
      raise exception 'A published question needs exactly four options';
    end if;
    if coalesce(new.q->>'en','') = '' or coalesce(new.expl->>'en','') = '' or coalesce(new.ref,'') = '' then
      raise exception 'A published question needs an English question, an explanation and a source';
    end if;
  end if;
  return new;
end;
$$;
drop trigger if exists questions_guard on public.questions;
create trigger questions_guard before insert or update on public.questions
  for each row execute function public.questions_guard();

-- 3. Audit log of admin actions on questions and accounts.
create table if not exists public.admin_log (
  id      bigserial primary key,
  at      timestamptz not null default now(),
  admin   uuid default auth.uid(),
  action  text not null,
  target  text not null default '',
  detail  text not null default ''
);
alter table public.admin_log enable row level security;
drop policy if exists "admins read log" on public.admin_log;
create policy "admins read log" on public.admin_log for select to authenticated using (public.is_admin());

create or replace function public.log_question_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.admin_log(action, target, detail)
  values (lower(tg_op) || ' question', coalesce(new.id, old.id), coalesce(new.status, old.status));
  return coalesce(new, old);
end;
$$;
drop trigger if exists questions_log on public.questions;
create trigger questions_log after insert or update or delete on public.questions
  for each row execute function public.log_question_change();

-- 4. Admin-only statistics. Never returns journals, period data or passwords.
create or replace function public.admin_stats()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare r jsonb;
begin
  if not public.is_admin() then raise exception 'forbidden'; end if;
  with att as (
    select a.key as qid, a.value as v
    from public.user_data d, jsonb_each(case when jsonb_typeof(d.data->'quiz'->'att') = 'object' then d.data->'quiz'->'att' else '{}'::jsonb end) a
  )
  select jsonb_build_object(
    'users',     (select count(*) from auth.users),
    'verified',  (select count(*) from auth.users where email_confirmed_at is not null),
    'new7',      (select count(*) from auth.users where created_at > now() - interval '7 days'),
    'new30',     (select count(*) from auth.users where created_at > now() - interval '30 days'),
    'active1',   (select count(*) from public.user_data where updated_at > now() - interval '1 day'),
    'active7',   (select count(*) from public.user_data where updated_at > now() - interval '7 days'),
    'suspended', (select count(*) from auth.users where banned_until > now()),
    'questions', (select coalesce(jsonb_object_agg(status, n), '{}'::jsonb) from (select status, count(*) n from public.questions group by status) s),
    'attempts',  (select count(*) from att),
    'correct',   (select count(*) from att where (v->>'ok')::boolean),
    'perq',      (select coalesce(jsonb_agg(x), '[]'::jsonb) from (
                    select qid as id, count(*) as n, count(*) filter (where (v->>'ok')::boolean) as ok
                    from att group by qid order by count(*) desc limit 300) x),
    'percat',    (select coalesce(jsonb_agg(x), '[]'::jsonb) from (
                    select coalesce(v->>'cat','?') as cat, count(*) as n, count(*) filter (where (v->>'ok')::boolean) as ok
                    from att group by 1 order by 2 desc) x),
    'challenges',(select coalesce(sum((c.value->>'done')::int), 0) from public.user_data d,
                    jsonb_each(case when jsonb_typeof(d.data->'quiz'->'ch') = 'object' then d.data->'quiz'->'ch' else '{}'::jsonb end) c
                    where c.value ? 'done')
  ) into r;
  return r;
end;
$$;
grant execute on function public.admin_stats() to authenticated;

create or replace function public.admin_users(search text default '')
returns table(id uuid, email text, name text, created_at timestamptz, last_sign_in_at timestamptz,
              confirmed boolean, suspended boolean, last_active timestamptz)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then raise exception 'forbidden'; end if;
  return query
    select u.id, u.email::text, coalesce(u.raw_user_meta_data->>'full_name',''), u.created_at, u.last_sign_in_at,
           u.email_confirmed_at is not null, coalesce(u.banned_until > now(), false), d.updated_at
    from auth.users u left join public.user_data d on d.user_id = u.id
    where coalesce(search,'') = '' or u.email ilike '%' || search || '%' or (u.raw_user_meta_data->>'full_name') ilike '%' || search || '%'
    order by u.created_at desc
    limit 300;
end;
$$;
grant execute on function public.admin_users(text) to authenticated;

create or replace function public.admin_set_suspended(target uuid, suspend boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then raise exception 'forbidden'; end if;
  if target = auth.uid() then raise exception 'You cannot suspend your own account'; end if;
  update auth.users set banned_until = case when suspend then now() + interval '100 years' else null end where id = target;
  insert into public.admin_log(action, target) values (case when suspend then 'suspend user' else 'reactivate user' end, target::text);
end;
$$;
grant execute on function public.admin_set_suspended(uuid, boolean) to authenticated;

revoke execute on function public.admin_stats(), public.admin_users(text), public.admin_set_suspended(uuid, boolean) from anon;
