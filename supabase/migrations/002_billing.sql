-- ============================================================
-- emlakmetric — billing & quota schema
--
-- Design notes worth knowing before you change anything:
--
-- 1. Quotas are enforced in ONE statement, not read-then-write.
--    `UPDATE ... WHERE used < quota RETURNING` is atomic, so two
--    concurrent requests can never both pass the same last slot.
--    A SELECT-then-INSERT would let a user double-spend.
--
-- 2. Usage lives in `usage_periods`, not on the subscription row.
--    Renewing a plan means inserting a new period, so history is
--    kept and a renewal can never silently wipe a counter.
--
-- 3. Users can read their own rows but cannot write any of them.
--    Every mutation goes through a SECURITY DEFINER function.
--    Without this, a user could PATCH their own plan_id from the
--    browser — Supabase exposes the REST API to the client.
-- ============================================================

-- ---------- 1. plans (reference data) -----------------------
create table if not exists public.plans (
  id              smallint primary key generated always as identity,
  code            text        not null unique
                    check (code in ('free', 'pro', 'enterprise')),
  name            text        not null,
  price_monthly   integer     not null default 0,   -- kuruş / minor units
  currency        char(3)     not null default 'TRY',
  analysis_quota  integer     not null check (analysis_quota >= 0),
  report_quota    integer     not null check (report_quota  >= 0),
  is_featured     boolean     not null default false,
  sort_order      smallint    not null default 0,
  created_at      timestamptz not null default now()
);

comment on table  public.plans is 'Package definitions. Reference data, edited by admins only.';
comment on column public.plans.price_monthly is 'Minor units (kuruş). 0 = free.';

-- exactly one plan may carry the "most popular" badge
create unique index if not exists plans_one_featured
  on public.plans ((is_featured)) where is_featured;

insert into public.plans (code, name, price_monthly, analysis_quota, report_quota, is_featured, sort_order)
values
  ('free',       'Free',        0,    3,    3, false, 1),
  ('pro',        'Pro',         0,  100,  100, true,  2),
  ('enterprise', 'Enterprise',  0, 1000, 1000, false, 3)
on conflict (code) do update
  set analysis_quota = excluded.analysis_quota,
      report_quota   = excluded.report_quota,
      is_featured    = excluded.is_featured,
      sort_order     = excluded.sort_order;

-- ---------- 2. subscriptions --------------------------------
create table if not exists public.subscriptions (
  id            uuid        primary key default gen_random_uuid(),
  user_id       uuid        not null references auth.users(id) on delete cascade,
  plan_id       smallint    not null references public.plans(id) on delete restrict,
  status        text        not null default 'active'
                  check (status in ('active', 'past_due', 'canceled')),
  started_at    timestamptz not null default now(),
  canceled_at   timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- a user may keep old canceled rows, but only one live subscription
create unique index if not exists subscriptions_one_active
  on public.subscriptions (user_id) where status = 'active';
create index if not exists subscriptions_plan_id_idx on public.subscriptions (plan_id);
create index if not exists subscriptions_user_id_idx on public.subscriptions (user_id);

-- ---------- 3. usage periods --------------------------------
create table if not exists public.usage_periods (
  id              uuid        primary key default gen_random_uuid(),
  subscription_id uuid        not null references public.subscriptions(id) on delete cascade,
  period_start    timestamptz not null default now(),
  period_end      timestamptz not null,
  analyses_used   integer     not null default 0 check (analyses_used >= 0),
  reports_used    integer     not null default 0 check (reports_used  >= 0),
  created_at      timestamptz not null default now(),
  constraint usage_periods_range check (period_end > period_start)
);

-- one period per subscription per window; the partial unique index below
-- is what makes "get or create current period" safe under concurrency
create unique index if not exists usage_periods_current
  on public.usage_periods (subscription_id, period_start);
create index if not exists usage_periods_lookup
  on public.usage_periods (subscription_id, period_end desc);

-- ---------- 4. analyses -------------------------------------
create table if not exists public.analyses (
  id           uuid        primary key default gen_random_uuid(),
  user_id      uuid        not null references auth.users(id) on delete cascade,
  period_id    uuid        not null references public.usage_periods(id) on delete restrict,
  listing_url  text        not null,
  kind         text        not null default 'konut'
                 check (kind in ('konut', 'arsa', 'ticari')),
  result       jsonb,
  created_at   timestamptz not null default now()
);

create index if not exists analyses_user_created_idx
  on public.analyses (user_id, created_at desc);
create index if not exists analyses_period_idx on public.analyses (period_id);
-- listing lookups and the "already analysed this" check
create index if not exists analyses_url_idx on public.analyses (user_id, listing_url);

-- ---------- 5. reports --------------------------------------
create table if not exists public.reports (
  id          uuid        primary key default gen_random_uuid(),
  analysis_id uuid        not null references public.analyses(id) on delete cascade,
  user_id     uuid        not null references auth.users(id) on delete cascade,
  period_id   uuid        not null references public.usage_periods(id) on delete restrict,
  format      text        not null default 'pdf' check (format in ('pdf', 'xlsx')),
  created_at  timestamptz not null default now()
);

create index if not exists reports_user_created_idx
  on public.reports (user_id, created_at desc);
create index if not exists reports_analysis_idx on public.reports (analysis_id);
create index if not exists reports_period_idx   on public.reports (period_id);

-- ============================================================
-- Row level security
-- Read your own rows; write nothing. All mutations go through
-- the SECURITY DEFINER functions below.
-- ============================================================
alter table public.plans          enable row level security;
alter table public.subscriptions  enable row level security;
alter table public.usage_periods  enable row level security;
alter table public.analyses       enable row level security;
alter table public.reports        enable row level security;

-- the pricing page must render for logged-out visitors too
drop policy if exists plans_readable on public.plans;
create policy plans_readable on public.plans
  for select to anon, authenticated using (true);

drop policy if exists subscriptions_own on public.subscriptions;
create policy subscriptions_own on public.subscriptions
  for select to authenticated using (user_id = (select auth.uid()));

drop policy if exists usage_own on public.usage_periods;
create policy usage_own on public.usage_periods
  for select to authenticated using (
    exists (select 1 from public.subscriptions s
            where s.id = subscription_id and s.user_id = (select auth.uid()))
  );

drop policy if exists analyses_own on public.analyses;
create policy analyses_own on public.analyses
  for select to authenticated using (user_id = (select auth.uid()));

drop policy if exists reports_own on public.reports;
create policy reports_own on public.reports
  for select to authenticated using (user_id = (select auth.uid()));

-- ============================================================
-- Signup hook.
--
-- 001_profiles.sql already defines handle_new_user() and the
-- on_auth_user_created trigger. Replacing it would silently stop
-- profile creation, so this version does BOTH jobs: profile first,
-- then the free subscription and its first usage period.
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_plan_id smallint;
  v_sub_id  uuid;
begin
  -- (a) profile — behaviour carried over from 001_profiles.sql
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name',
             new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;

  -- (b) free subscription
  select id into v_plan_id from public.plans where code = 'free';

  insert into public.subscriptions (user_id, plan_id)
  values (new.id, v_plan_id)
  on conflict do nothing
  returning id into v_sub_id;

  -- (c) first usage period
  if v_sub_id is not null then
    insert into public.usage_periods (subscription_id, period_start, period_end)
    values (v_sub_id, now(), now() + interval '1 month')
    on conflict (subscription_id, period_start) do nothing;
  end if;

  return new;
end;
$$;

-- the trigger from 001 already points at this function; recreate only
-- to be certain it exists and fires after insert
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- Current period, rolled forward if it has expired.
-- ============================================================
create or replace function public.current_period(p_user uuid)
returns public.usage_periods
language plpgsql
security definer
set search_path = public
as $$
declare
  v_sub public.subscriptions;
  v_per public.usage_periods;
begin
  select * into v_sub from public.subscriptions
   where user_id = p_user and status = 'active';
  if not found then
    raise exception 'no active subscription' using errcode = 'P0002';
  end if;

  select * into v_per from public.usage_periods
   where subscription_id = v_sub.id
   order by period_end desc limit 1;

  -- expired (or missing): open the next window
  if v_per is null or v_per.period_end <= now() then
    insert into public.usage_periods (subscription_id, period_start, period_end)
    values (v_sub.id, now(), now() + interval '1 month')
    on conflict (subscription_id, period_start) do nothing
    returning * into v_per;

    if v_per is null then
      select * into v_per from public.usage_periods
       where subscription_id = v_sub.id
       order by period_end desc limit 1;
    end if;
  end if;

  return v_per;
end;
$$;

-- ============================================================
-- Consume one analysis. Atomic: the UPDATE either wins a slot
-- or returns nothing. No read-then-write race.
-- ============================================================
create or replace function public.consume_analysis(
  p_listing_url text,
  p_kind        text default 'konut'
)
returns public.analyses
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user  uuid := (select auth.uid());
  v_per   public.usage_periods;
  v_quota integer;
  v_ok    uuid;
  v_row   public.analyses;
begin
  if v_user is null then
    raise exception 'not authenticated' using errcode = '28000';
  end if;

  v_per := public.current_period(v_user);

  select p.analysis_quota into v_quota
    from public.subscriptions s
    join public.plans p on p.id = s.plan_id
   where s.id = v_per.subscription_id;

  update public.usage_periods
     set analyses_used = analyses_used + 1
   where id = v_per.id
     and analyses_used < v_quota
  returning id into v_ok;

  if v_ok is null then
    raise exception 'analysis quota exhausted' using errcode = 'P0001';
  end if;

  insert into public.analyses (user_id, period_id, listing_url, kind)
  values (v_user, v_per.id, p_listing_url, p_kind)
  returning * into v_row;

  return v_row;
end;
$$;

-- ============================================================
-- Consume one report download.
-- ============================================================
create or replace function public.consume_report(
  p_analysis_id uuid,
  p_format      text default 'pdf'
)
returns public.reports
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user  uuid := (select auth.uid());
  v_per   public.usage_periods;
  v_quota integer;
  v_ok    uuid;
  v_row   public.reports;
begin
  if v_user is null then
    raise exception 'not authenticated' using errcode = '28000';
  end if;

  -- you may only export your own analysis
  if not exists (select 1 from public.analyses
                  where id = p_analysis_id and user_id = v_user) then
    raise exception 'analysis not found' using errcode = 'P0002';
  end if;

  v_per := public.current_period(v_user);

  select p.report_quota into v_quota
    from public.subscriptions s
    join public.plans p on p.id = s.plan_id
   where s.id = v_per.subscription_id;

  update public.usage_periods
     set reports_used = reports_used + 1
   where id = v_per.id
     and reports_used < v_quota
  returning id into v_ok;

  if v_ok is null then
    raise exception 'report quota exhausted' using errcode = 'P0001';
  end if;

  insert into public.reports (analysis_id, user_id, period_id, format)
  values (p_analysis_id, v_user, v_per.id, p_format)
  returning * into v_row;

  return v_row;
end;
$$;

-- ============================================================
-- One call for the UI: plan, quotas, used, remaining.
-- ============================================================
create or replace function public.my_entitlements()
returns table (
  plan_code        text,
  plan_name        text,
  period_end       timestamptz,
  analysis_quota   integer,
  analyses_used    integer,
  analyses_left    integer,
  report_quota     integer,
  reports_used     integer,
  reports_left     integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := (select auth.uid());
  v_per  public.usage_periods;
begin
  if v_user is null then
    raise exception 'not authenticated' using errcode = '28000';
  end if;

  v_per := public.current_period(v_user);

  return query
  select p.code, p.name, v_per.period_end,
         p.analysis_quota, v_per.analyses_used,
         greatest(p.analysis_quota - v_per.analyses_used, 0),
         p.report_quota,   v_per.reports_used,
         greatest(p.report_quota   - v_per.reports_used, 0)
    from public.subscriptions s
    join public.plans p on p.id = s.plan_id
   where s.id = v_per.subscription_id;
end;
$$;

revoke all on function public.current_period(uuid) from anon, authenticated;
grant execute on function public.consume_analysis(text, text) to authenticated;
grant execute on function public.consume_report(uuid, text)   to authenticated;
grant execute on function public.my_entitlements()            to authenticated;

-- ============================================================
-- Fix for 001_profiles.sql: the two admin policies query
-- public.profiles from inside a policy ON public.profiles, which
-- Postgres rejects with "infinite recursion detected in policy"
-- (42P17). Any admin read currently fails.
--
-- The fix is a SECURITY DEFINER helper: it bypasses RLS, so the
-- lookup does not re-enter the policy.
-- ============================================================
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
     where id = (select auth.uid()) and role = 'admin'
  );
$$;

create or replace function public.my_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = (select auth.uid());
$$;

grant execute on function public.my_role() to authenticated;

revoke all on function public.is_admin() from anon;
grant execute on function public.is_admin() to authenticated;

drop policy if exists "Admins can read all profiles"   on public.profiles;
drop policy if exists "Admins can update all profiles" on public.profiles;
drop policy if exists "Users can update own profile"   on public.profiles;

create policy "Admins can read all profiles"
  on public.profiles for select to authenticated
  using (public.is_admin());

create policy "Admins can update all profiles"
  on public.profiles for update to authenticated
  using (public.is_admin());

-- users may edit their own profile but never their own role
create policy "Users can update own profile"
  on public.profiles for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id and role = public.my_role());

