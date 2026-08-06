-- ============================================================
-- emlakmetric — bölge referans verisi (İBBS + 81 il)
-- Kaynak: TÜİK İstatistiki Bölge Birimleri Sınıflaması
-- 003_regions.sql çalıştırıldıktan SONRA uygulanmalı.
-- Yeniden çalıştırılabilir: code üzerinden upsert eder.
-- ============================================================

-- ülke
insert into public.regions (code, name, level, parent_id, lat, lng) values
  ('TR', 'Türkiye', 'country', null, 39.000000, 35.000000)
on conflict (code) do update set name = excluded.name;

-- Düzey 1
insert into public.regions (code, name, level, parent_id, lat, lng)
select v.code, v.name, 'nuts1', (select id from public.regions where code = 'TR'), null, null
from (values
  ('TR1', 'İstanbul'),
  ('TR2', 'Batı Marmara'),
  ('TR3', 'Ege'),
  ('TR4', 'Doğu Marmara'),
  ('TR5', 'Batı Anadolu'),
  ('TR6', 'Akdeniz'),
  ('TR7', 'Orta Anadolu'),
  ('TR8', 'Batı Karadeniz'),
  ('TR9', 'Doğu Karadeniz'),
  ('TRA', 'Kuzeydoğu Anadolu'),
  ('TRB', 'Ortadoğu Anadolu'),
  ('TRC', 'Güneydoğu Anadolu')
) as v(code, name)
on conflict (code) do update set name = excluded.name;

-- Düzey 2
insert into public.regions (code, name, level, parent_id, lat, lng)
select v.code, v.name, 'nuts2', p.id, null, null
from (values
  ('TR10', 'İstanbul', 'TR1'),
  ('TR21', 'Tekirdağ, Edirne, Kırklareli', 'TR2'),
  ('TR22', 'Balıkesir, Çanakkale', 'TR2'),
  ('TR31', 'İzmir', 'TR3'),
  ('TR32', 'Aydın, Denizli, Muğla', 'TR3'),
  ('TR33', 'Manisa, Afyonkarahisar, Kütahya, Uşak', 'TR3'),
  ('TR41', 'Bursa, Eskişehir, Bilecik', 'TR4'),
  ('TR42', 'Kocaeli, Sakarya, Düzce, Bolu, Yalova', 'TR4'),
  ('TR51', 'Ankara', 'TR5'),
  ('TR52', 'Konya, Karaman', 'TR5'),
  ('TR61', 'Antalya, Isparta, Burdur', 'TR6'),
  ('TR62', 'Adana, Mersin', 'TR6'),
  ('TR63', 'Hatay, Kahramanmaraş, Osmaniye', 'TR6'),
  ('TR71', 'Kırıkkale, Aksaray, Niğde, Nevşehir, Kırşehir', 'TR7'),
  ('TR72', 'Kayseri, Sivas, Yozgat', 'TR7'),
  ('TR81', 'Zonguldak, Karabük, Bartın', 'TR8'),
  ('TR82', 'Kastamonu, Çankırı, Sinop', 'TR8'),
  ('TR83', 'Samsun, Tokat, Çorum, Amasya', 'TR8'),
  ('TR90', 'Trabzon, Ordu, Giresun, Rize, Artvin, Gümüşhane', 'TR9'),
  ('TRA1', 'Erzurum, Erzincan, Bayburt', 'TRA'),
  ('TRA2', 'Ağrı, Kars, Iğdır, Ardahan', 'TRA'),
  ('TRB1', 'Malatya, Elazığ, Bingöl, Tunceli', 'TRB'),
  ('TRB2', 'Van, Muş, Bitlis, Hakkâri', 'TRB'),
  ('TRC1', 'Gaziantep, Adıyaman, Kilis', 'TRC'),
  ('TRC2', 'Şanlıurfa, Diyarbakır', 'TRC'),
  ('TRC3', 'Mardin, Batman, Şırnak, Siirt', 'TRC')
) as v(code, name, parent_code)
join public.regions p on p.code = v.parent_code
on conflict (code) do update set name = excluded.name;

-- 81 il (merkez koordinatlarıyla)
insert into public.regions (code, name, level, parent_id, lat, lng)
select v.code, v.name, 'province', p.id, v.lat, v.lng
from (values
  ('01', 'Adana', 'TR62', 37.000000, 35.321300),
  ('02', 'Adıyaman', 'TRC1', 37.764800, 38.278600),
  ('03', 'Afyonkarahisar', 'TR33', 38.750700, 30.556700),
  ('04', 'Ağrı', 'TRA2', 39.719100, 43.050300),
  ('05', 'Amasya', 'TR83', 40.649900, 35.835300),
  ('06', 'Ankara', 'TR51', 39.933400, 32.859700),
  ('07', 'Antalya', 'TR61', 36.896900, 30.713300),
  ('08', 'Artvin', 'TR90', 41.182800, 41.818300),
  ('09', 'Aydın', 'TR32', 37.856000, 27.841600),
  ('10', 'Balıkesir', 'TR22', 39.648400, 27.882600),
  ('11', 'Bilecik', 'TR41', 40.145100, 29.979900),
  ('12', 'Bingöl', 'TRB1', 38.885400, 40.496600),
  ('13', 'Bitlis', 'TRB2', 38.400600, 42.109500),
  ('14', 'Bolu', 'TR42', 40.735000, 31.606100),
  ('15', 'Burdur', 'TR61', 37.720300, 30.290800),
  ('16', 'Bursa', 'TR41', 40.188500, 29.061000),
  ('17', 'Çanakkale', 'TR22', 40.155300, 26.414200),
  ('18', 'Çankırı', 'TR82', 40.601300, 33.613400),
  ('19', 'Çorum', 'TR83', 40.550600, 34.955600),
  ('20', 'Denizli', 'TR32', 37.776500, 29.086400),
  ('21', 'Diyarbakır', 'TRC2', 37.914400, 40.230600),
  ('22', 'Edirne', 'TR21', 41.681800, 26.562300),
  ('23', 'Elazığ', 'TRB1', 38.681000, 39.226400),
  ('24', 'Erzincan', 'TRA1', 39.750000, 39.500000),
  ('25', 'Erzurum', 'TRA1', 39.900000, 41.270000),
  ('26', 'Eskişehir', 'TR41', 39.776700, 30.520600),
  ('27', 'Gaziantep', 'TRC1', 37.066200, 37.383300),
  ('28', 'Giresun', 'TR90', 40.912800, 38.389500),
  ('29', 'Gümüşhane', 'TR90', 40.438600, 39.508600),
  ('30', 'Hakkâri', 'TRB2', 37.574400, 43.740800),
  ('31', 'Hatay', 'TR63', 36.202500, 36.160600),
  ('32', 'Isparta', 'TR61', 37.764800, 30.556600),
  ('33', 'Mersin', 'TR62', 36.812100, 34.641500),
  ('34', 'İstanbul', 'TR10', 41.008200, 28.978400),
  ('35', 'İzmir', 'TR31', 38.423700, 27.142800),
  ('36', 'Kars', 'TRA2', 40.601300, 43.097500),
  ('37', 'Kastamonu', 'TR82', 41.388700, 33.782700),
  ('38', 'Kayseri', 'TR72', 38.731200, 35.478700),
  ('39', 'Kırklareli', 'TR21', 41.733300, 27.216700),
  ('40', 'Kırşehir', 'TR71', 39.142500, 34.170900),
  ('41', 'Kocaeli', 'TR42', 40.853300, 29.881500),
  ('42', 'Konya', 'TR52', 37.874600, 32.493200),
  ('43', 'Kütahya', 'TR33', 39.424200, 29.983300),
  ('44', 'Malatya', 'TRB1', 38.355200, 38.309500),
  ('45', 'Manisa', 'TR33', 38.619100, 27.428900),
  ('46', 'Kahramanmaraş', 'TR63', 37.585800, 36.937100),
  ('47', 'Mardin', 'TRC3', 37.321200, 40.724500),
  ('48', 'Muğla', 'TR32', 37.215300, 28.363600),
  ('49', 'Muş', 'TRB2', 38.946200, 41.753900),
  ('50', 'Nevşehir', 'TR71', 38.693900, 34.685700),
  ('51', 'Niğde', 'TR71', 37.966700, 34.683300),
  ('52', 'Ordu', 'TR90', 40.983900, 37.876400),
  ('53', 'Rize', 'TR90', 41.020100, 40.523400),
  ('54', 'Sakarya', 'TR42', 40.694000, 30.435800),
  ('55', 'Samsun', 'TR83', 41.286700, 36.330000),
  ('56', 'Siirt', 'TRC3', 37.933300, 41.950000),
  ('57', 'Sinop', 'TR82', 42.023100, 35.153100),
  ('58', 'Sivas', 'TR72', 39.747700, 37.017900),
  ('59', 'Tekirdağ', 'TR21', 40.983300, 27.516700),
  ('60', 'Tokat', 'TR83', 40.316700, 36.550000),
  ('61', 'Trabzon', 'TR90', 41.001500, 39.717800),
  ('62', 'Tunceli', 'TRB1', 39.107900, 39.540100),
  ('63', 'Şanlıurfa', 'TRC2', 37.159100, 38.796900),
  ('64', 'Uşak', 'TR33', 38.682300, 29.408200),
  ('65', 'Van', 'TRB2', 38.489100, 43.408900),
  ('66', 'Yozgat', 'TR72', 39.818100, 34.814700),
  ('67', 'Zonguldak', 'TR81', 41.456400, 31.798700),
  ('68', 'Aksaray', 'TR71', 38.368700, 34.037000),
  ('69', 'Bayburt', 'TRA1', 40.255200, 40.224900),
  ('70', 'Karaman', 'TR52', 37.175900, 33.228700),
  ('71', 'Kırıkkale', 'TR71', 39.846800, 33.515300),
  ('72', 'Batman', 'TRC3', 37.881200, 41.135100),
  ('73', 'Şırnak', 'TRC3', 37.418700, 42.491800),
  ('74', 'Bartın', 'TR81', 41.581100, 32.461000),
  ('75', 'Ardahan', 'TRA2', 41.110500, 42.702200),
  ('76', 'Iğdır', 'TRA2', 39.923700, 44.045000),
  ('77', 'Yalova', 'TR42', 40.650000, 29.266700),
  ('78', 'Karabük', 'TR81', 41.206100, 32.620400),
  ('79', 'Kilis', 'TRC1', 36.718400, 37.121200),
  ('80', 'Osmaniye', 'TR63', 37.074200, 36.246400),
  ('81', 'Düzce', 'TR42', 40.843800, 31.156500)
) as v(code, name, parent_code, lat, lng)
join public.regions p on p.code = v.parent_code
on conflict (code) do update
  set name = excluded.name, parent_id = excluded.parent_id,
      lat = excluded.lat, lng = excluded.lng;

-- doğrulama
select level, count(*) from public.regions group by level order by level;
