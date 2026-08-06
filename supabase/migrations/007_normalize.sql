-- 007: Normalize tables — fix missing triggers, redundant indexes, missing constraints.

-- ─────────────────────────────────────────────
-- 1. updated_at auto-update trigger (profiles, subscriptions)
-- ─────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger trg_subscriptions_updated_at
  before update on public.subscriptions
  for each row execute function public.set_updated_at();

-- ─────────────────────────────────────────────
-- 2. Sync profiles.email when auth.users.email changes
-- ─────────────────────────────────────────────
create or replace function public.sync_profile_email()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.email is distinct from old.email then
    update public.profiles set email = new.email where id = new.id;
  end if;
  return new;
end;
$$;

create trigger on_auth_user_email_changed
  after update of email on auth.users
  for each row execute function public.sync_profile_email();

-- ─────────────────────────────────────────────
-- 3. Index on profiles.email for lookups
-- ─────────────────────────────────────────────
create index if not exists profiles_email_idx on public.profiles (email);

-- ─────────────────────────────────────────────
-- 4. Drop redundant regions.code index (UNIQUE constraint already creates one)
-- ─────────────────────────────────────────────
drop index if exists public.regions_code_idx;

-- ─────────────────────────────────────────────
-- 5. CHECK constraint on ingest_runs.source (matches region_metrics.source)
-- ─────────────────────────────────────────────
alter table public.ingest_runs
  add constraint ingest_runs_source_check
  check (source in ('TCMB_EVDS', 'TUIK'));

-- ─────────────────────────────────────────────
-- 6. region_estimates: require at least median_m2
-- ─────────────────────────────────────────────
alter table public.region_estimates
  alter column median_m2 set not null;
