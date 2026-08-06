-- ============================================================
-- emlakmetric — bölge referans verisi
--
-- Kaynak gerçekliği (2026 itibarıyla doğrulanmış):
--   · TCMB KFE  : endeks, İBBS Düzey 2 bölge bazında (il değil)
--   · TCMB Birim: gerçek ₺/m², yalnız Türkiye ve İstanbul geneli
--   · TÜİK      : satış adedi, il bazında + İstanbul'da ilçe
--   · Mahalle bazlı m² fiyatı veren resmî kaynak YOK
--
-- Bu yüzden şema iki ayrı katman tutuyor:
--   1. resmî veri (region_metrics)  — kaynağı belli, denetlenebilir
--   2. türetilmiş tahmin (derived)  — resmîden hesaplanan, işaretli
--
-- İkisini karıştırma. Kullanıcıya hangisinin resmî hangisinin
-- tahmin olduğunu göstermek zorundayız, aksi halde doğrulanamayan
-- sayı yayınlamış oluruz.
-- ============================================================

-- ---------- 1. coğrafi hiyerarşi ----------------------------
create table if not exists public.regions (
  id          integer     primary key generated always as identity,
  code        text        not null unique,      -- 'TR10', '34', '34-KADIKOY'
  name        text        not null,
  level       text        not null
                check (level in ('country', 'nuts1', 'nuts2', 'province', 'district')),
  parent_id   integer     references public.regions(id) on delete restrict,
  -- konum eşlemesi için merkez koordinat
  lat         numeric(9,6),
  lng         numeric(9,6),
  created_at  timestamptz not null default now()
);

create index if not exists regions_parent_idx on public.regions (parent_id);
create index if not exists regions_level_idx  on public.regions (level);
create index if not exists regions_code_idx   on public.regions (code);

comment on table public.regions is
  'İBBS hiyerarşisi: ülke > Düzey1 > Düzey2 > il > ilçe. TCMB verisi nuts2''de, TÜİK il ve İstanbul ilçelerinde.';

-- ---------- 2. resmî ölçümler -------------------------------
create table if not exists public.region_metrics (
  id          bigint      primary key generated always as identity,
  region_id   integer     not null references public.regions(id) on delete cascade,
  metric      text        not null
                check (metric in (
                  'kfe_index',        -- TCMB konut fiyat endeksi (2023=100)
                  'ykfe_index',       -- yeni konutlar endeksi
                  'unit_price',       -- ₺/m² (yalnız TR ve İstanbul)
                  'rent_index',       -- yeni kiracı kira endeksi
                  'sales_count'       -- TÜİK satış adedi
                )),
  period      date        not null,            -- ayın ilk günü
  value       numeric(14,4) not null,
  source      text        not null
                check (source in ('TCMB_EVDS', 'TUIK')),
  series_code text,                            -- 'TP.HKFE01' gibi, izlenebilirlik için
  fetched_at  timestamptz not null default now(),

  constraint region_metrics_unique unique (region_id, metric, period)
);

create index if not exists region_metrics_lookup
  on public.region_metrics (region_id, metric, period desc);
create index if not exists region_metrics_period
  on public.region_metrics (period desc);

comment on column public.region_metrics.series_code is
  'Kaynak seri kodu. Bir değer tartışmalı olursa kaynağa geri gidebilmek için şart.';

-- ---------- 3. türetilmiş tahminler -------------------------
-- Resmî veri mahalle seviyesine inmiyor. Bu tabloda, resmî
-- bölge verisinden türetilen tahminler tutulur ve HER ZAMAN
-- tahmin olduğu belirtilerek gösterilir.
create table if not exists public.region_estimates (
  id            bigint      primary key generated always as identity,
  region_id     integer     not null references public.regions(id) on delete cascade,
  period        date        not null,
  median_m2     numeric(12,2),                 -- tahmini ₺/m² medyan
  q1_m2         numeric(12,2),
  q3_m2         numeric(12,2),
  yield_pct     numeric(5,2),                  -- tahmini brüt kira getirisi
  sample_size   integer     not null default 0, -- kaç gözleme dayanıyor
  method        text        not null
                  check (method in ('official_scaled', 'user_pool', 'blended')),
  confidence    text        not null default 'low'
                  check (confidence in ('low', 'medium', 'high')),
  computed_at   timestamptz not null default now(),

  constraint region_estimates_unique unique (region_id, period)
);

create index if not exists region_estimates_lookup
  on public.region_estimates (region_id, period desc);

comment on table public.region_estimates is
  'TAHMİN verisi. Resmî değil. Arayüzde mutlaka "tahmini" ibaresiyle gösterilmeli.';
comment on column public.region_estimates.method is
  'official_scaled: resmî endeksten ölçeklendi · user_pool: kullanıcı girdilerinden · blended: ikisi';
comment on column public.region_estimates.confidence is
  'sample_size ve yönteme göre. low ise arayüzde uyarı gösterilmeli.';

-- ---------- 4. veri çekme kayıtları -------------------------
create table if not exists public.ingest_runs (
  id          bigint      primary key generated always as identity,
  source      text        not null,
  status      text        not null check (status in ('running', 'ok', 'failed')),
  rows_upsert integer     not null default 0,
  error       text,
  started_at  timestamptz not null default now(),
  finished_at timestamptz
);

create index if not exists ingest_runs_recent on public.ingest_runs (started_at desc);

-- ---------- RLS ---------------------------------------------
-- Referans verisi herkese açık okunur, yazma yalnız service_role.
alter table public.regions          enable row level security;
alter table public.region_metrics   enable row level security;
alter table public.region_estimates enable row level security;
alter table public.ingest_runs      enable row level security;

drop policy if exists regions_read on public.regions;
create policy regions_read on public.regions
  for select to anon, authenticated using (true);

drop policy if exists region_metrics_read on public.region_metrics;
create policy region_metrics_read on public.region_metrics
  for select to anon, authenticated using (true);

drop policy if exists region_estimates_read on public.region_estimates;
create policy region_estimates_read on public.region_estimates
  for select to anon, authenticated using (true);

-- ingest_runs yalnız service_role görür: politika tanımlanmadı,
-- RLS açık olduğu için anon/authenticated hiçbir satır göremez.

-- ---------- 5. konumdan bölge bulma -------------------------
-- Kullanıcı konum paylaşınca en yakın merkeze sahip bölgeyi döndürür.
-- PostGIS gerektirmez; haversine yeterli, il/ilçe merkezleri arasında
-- seçim yapıyoruz, metre hassasiyeti aranmıyor.
create or replace function public.nearest_region(
  p_lat numeric,
  p_lng numeric,
  p_level text default 'province'
)
returns public.regions
language sql
stable
as $$
  select *
    from public.regions
   where level = p_level and lat is not null and lng is not null
   order by
     6371 * acos(
       least(1, greatest(-1,
         cos(radians(p_lat)) * cos(radians(lat)) *
         cos(radians(lng) - radians(p_lng)) +
         sin(radians(p_lat)) * sin(radians(lat))
       ))
     )
   limit 1;
$$;

grant execute on function public.nearest_region(numeric, numeric, text) to anon, authenticated;

-- ---------- 6. arayüzün çağıracağı tek fonksiyon ------------
create or replace function public.region_snapshot(p_region_id integer)
returns table (
  region_name    text,
  region_level   text,
  median_m2      numeric,
  yield_pct      numeric,
  confidence     text,
  is_estimate    boolean,
  kfe_index      numeric,
  kfe_yoy_pct    numeric,
  period         date
)
language sql
stable
as $$
  with est as (
    select * from public.region_estimates
     where region_id = p_region_id
     order by period desc limit 1
  ),
  kfe_now as (
    select value, period from public.region_metrics
     where region_id = p_region_id and metric = 'kfe_index'
     order by period desc limit 1
  ),
  kfe_prev as (
    select m.value from public.region_metrics m, kfe_now n
     where m.region_id = p_region_id and m.metric = 'kfe_index'
       and m.period = (n.period - interval '12 months')::date
  )
  select r.name, r.level,
         est.median_m2, est.yield_pct, est.confidence,
         true,                                  -- median_m2 her zaman tahmindir
         kfe_now.value,
         case when kfe_prev.value is not null and kfe_prev.value <> 0
              then round((kfe_now.value / kfe_prev.value - 1) * 100, 1)
         end,
         coalesce(est.period, kfe_now.period)
    from public.regions r
    left join est on true
    left join kfe_now on true
    left join kfe_prev on true
   where r.id = p_region_id;
$$;

grant execute on function public.region_snapshot(integer) to anon, authenticated;
