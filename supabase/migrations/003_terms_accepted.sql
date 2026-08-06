-- Add terms acceptance timestamp to profiles.
-- The column is nullable: existing users keep NULL, new signups
-- get the timestamp from auth.users.raw_user_meta_data.
alter table public.profiles
  add column if not exists terms_accepted_at timestamptz;

-- Rewrite handle_new_user preserving ALL three steps from 002_billing.sql:
--   (a) profile creation
--   (b) free subscription
--   (c) first usage period
-- Only addition: terms_accepted_at read from user metadata.
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
  -- (a) profile — carried over from 001 + 002, now with terms_accepted_at
  insert into public.profiles (id, email, full_name, avatar_url, terms_accepted_at)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name',
             new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url',
    case
      when (new.raw_user_meta_data ->> 'terms_accepted_at') is not null
      then (new.raw_user_meta_data ->> 'terms_accepted_at')::timestamptz
      else null
    end
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

-- trigger already exists from 002; recreate to be safe
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
