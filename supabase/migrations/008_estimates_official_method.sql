-- Add 'official' to region_estimates.method check constraint.
-- TR and İstanbul have real ₺/m² data from TCMB, not estimates.

alter table public.region_estimates
  drop constraint if exists region_estimates_method_check;

alter table public.region_estimates
  add constraint region_estimates_method_check
  check (method in ('official', 'official_scaled', 'user_pool', 'blended'));
