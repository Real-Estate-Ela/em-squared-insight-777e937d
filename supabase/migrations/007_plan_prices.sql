-- ============================================================
-- emlakmetric — paket fiyatlarını güncelle
--
-- price_monthly alanı KURUŞ cinsindendir (minor units).
-- Kuruş kullanmamızın sebebi: para tutarını ondalıklı sayıda
-- tutmak yuvarlama hatası üretir, tam sayı üretmez.
--   ₺1.500  →  150000 kuruş
--   ₺3.000  →  300000 kuruş
-- ============================================================

update public.plans set price_monthly = 0      where code = 'free';
update public.plans set price_monthly = 150000 where code = 'pro';
update public.plans set price_monthly = 300000 where code = 'enterprise';

-- doğrulama: fiyatlar TL olarak görünsün
select code,
       name,
       price_monthly                        as kurus,
       (price_monthly / 100.0)              as tl,
       analysis_quota,
       report_quota,
       is_featured
  from public.plans
 order by sort_order;
