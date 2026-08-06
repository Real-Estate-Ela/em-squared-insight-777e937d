-- ============================================================
-- emlakmetric — kayıt trigger'ını onar
--
-- SORUN: 003_terms_accepted.sql, handle_new_user() fonksiyonunu
-- yeniden tanımlarken yalnızca profil oluşturma kısmını yazdı.
-- 002_billing.sql'in eklediği abonelik ve kullanım dönemi
-- oluşturma adımları düştü.
--
-- SONUÇ: Bu migration'dan sonra kayıt olan kullanıcıların
-- aboneliği yok. consume_analysis() 'no active subscription'
-- hatası veriyor, yani hiç analiz yapamıyorlar.
--
-- Bu dosya üç işi de yapan tek bir trigger tanımlar ve
-- etkilenmiş kullanıcıları geriye dönük onarır.
-- ============================================================

-- ---------- 1. trigger'ı tam haliyle yeniden kur ------------
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
  -- (a) profil — 001_profiles.sql + 003_terms_accepted.sql davranışı
  insert into public.profiles (id, email, full_name, avatar_url, terms_accepted_at)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name',
             new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url',
    (new.raw_user_meta_data ->> 'terms_accepted_at')::timestamptz
  )
  on conflict (id) do nothing;

  -- (b) ücretsiz abonelik — 002_billing.sql davranışı
  select id into v_plan_id from public.plans where code = 'free';

  insert into public.subscriptions (user_id, plan_id)
  values (new.id, v_plan_id)
  on conflict do nothing
  returning id into v_sub_id;

  -- (c) ilk kullanım dönemi
  if v_sub_id is not null then
    insert into public.usage_periods (subscription_id, period_start, period_end)
    values (v_sub_id, now(), now() + interval '1 month')
    on conflict (subscription_id, period_start) do nothing;
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- 2. etkilenmiş kullanıcıları onar ----------------
-- Trigger bozukken kayıt olanların aboneliği yok. Bunlar
-- analiz yapamaz durumda; geriye dönük tamamla.

insert into public.subscriptions (user_id, plan_id)
select u.id, (select id from public.plans where code = 'free')
  from auth.users u
 where not exists (
   select 1 from public.subscriptions s where s.user_id = u.id
 );

insert into public.usage_periods (subscription_id, period_start, period_end)
select s.id, now(), now() + interval '1 month'
  from public.subscriptions s
 where not exists (
   select 1 from public.usage_periods p where p.subscription_id = s.id
 );

-- ---------- 3. doğrulama ------------------------------------
-- Üç sütun da true olmalı.
select prosrc like '%profiles%'      as profil,
       prosrc like '%subscriptions%' as abonelik,
       prosrc like '%usage_periods%' as donem
  from pg_proc where proname = 'handle_new_user';

-- Üç sayı da eşit olmalı.
select (select count(*) from auth.users)          as kullanicilar,
       (select count(*) from public.subscriptions) as abonelikler,
       (select count(*) from public.usage_periods) as donemler;
