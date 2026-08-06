-- Add terms acceptance timestamp to profiles
alter table public.profiles
  add column terms_accepted_at timestamptz;

-- Update the signup trigger to populate terms_accepted_at from user metadata
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url, terms_accepted_at)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url',
    case
      when (new.raw_user_meta_data ->> 'terms_accepted_at') is not null
      then (new.raw_user_meta_data ->> 'terms_accepted_at')::timestamptz
      else null
    end
  );
  return new;
end;
$$;
