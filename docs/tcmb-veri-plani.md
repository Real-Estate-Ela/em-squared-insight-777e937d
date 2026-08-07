# TCMB EVDS Veri Hattı — Uygulama Planı

## Doğrulanmış seri kodları

**Konut Fiyat Endeksi (aylık, 2017=100 civarı)**

| Seri kodu | Bölge | Bizim `regions.code` |
|---|---|---|
| `TP_KFE_TR` | Türkiye | `TR` |
| `TP_KFE_TR10` | İstanbul | `TR10` |
| `TP_KFE_TR21` | Tekirdağ, Edirne, Kırklareli | `TR21` |
| `TP_KFE_TR22` | Balıkesir, Çanakkale | `TR22` |
| `TP_KFE_TR31` | İzmir | `TR31` |
| `TP_KFE_TR32` | Aydın, Denizli, Muğla | `TR32` |
| `TP_KFE_TR33` | Manisa, Afyon, Kütahya, Uşak | `TR33` |
| `TP_KFE_TR41` | Bursa, Eskişehir, Bilecik | `TR41` |
| `TP_KFE_TR42` | Kocaeli, Sakarya, Düzce, Bolu, Yalova | `TR42` |
| `TP_KFE_TR51` | Ankara | `TR51` |
| `TP_KFE_TR52` | Konya, Karaman | `TR52` |
| `TP_KFE_TR61` | Antalya, Isparta, Burdur | `TR61` |
| `TP_KFE_TR62` | Adana, Mersin | `TR62` |
| `TP_KFE_TR63` | Hatay, K.Maraş, Osmaniye | `TR63` |
| `TP_KFE_TR7` | Orta Anadolu (Düzey 1) | `TR7` |
| `TP_KFE_TR8` | Batı Karadeniz (Düzey 1) | `TR8` |
| `TP_KFE_TR9` | Doğu Karadeniz (Düzey 1) | `TR9` |
| `TP_KFE_TRA` | Kuzeydoğu Anadolu (Düzey 1) | `TRA` |
| `TP_KFE_TRB` | Ortadoğu Anadolu (Düzey 1) | `TRB` |
| `TP_KFE_TRC` | Güneydoğu Anadolu (Düzey 1) | `TRC` |

**Konut Birim Fiyatları (çeyreklik, gerçek ₺/m²)**

| Seri kodu | Bölge |
|---|---|
| `TP_BIRIMFIYAT_TR` | Türkiye |
| `TP_BIRIMFIYAT_IST` | İstanbul |

## Kapsama gerçeği

TCMB endeksi 26 Düzey 2 bölgesinin **13'ünü doğrudan** veriyor. Kalan 13'ü
yalnızca Düzey 1 çözünürlüğünde:

| Düzey 2 bölgemiz | Hangi seriden besleniyor |
|---|---|
| TR71, TR72 | `TR7` |
| TR81, TR82, TR83 | `TR8` |
| TR90 | `TR9` |
| TRA1, TRA2 | `TRA` |
| TRB1, TRB2 | `TRB` |
| TRC1, TRC2, TRC3 | `TRC` |

Yani Kayseri'nin verisi TR72 değil, TR7 (Orta Anadolu geneli) üzerinden gelir.
Bu bilgi arayüzde gösterilmeli — kullanıcı hangi çözünürlükte veri gördüğünü
bilmeli.

---

## KRİTİK: Tahmin formülü düzeltmesi

İlk planımız şuydu: `bölge_₺/m² = TR_birim_fiyat × bölge_endeksi / TR_endeksi`

**Bu formül yanlış.** Gerçek veriyle çapraz kontrol ettik:

| | Değer |
|---|---|
| İstanbul gerçek birim fiyatı (2026-2Ç) | 87.301 ₺/m² |
| Formülün ürettiği | 48.626 ₺/m² |
| **Sapma** | **−%44** |

Sebep: Endeks bir **değişim ölçüsüdür**, fiyat seviyesi değil. İstanbul'un
endeksi (216,92) Türkiye ortalamasından (231,46) düşük — yani daha yavaş
artmış. Ama fiyat **seviyesi** Türkiye ortalamasının 1,68 katı. Endeks bunu
söylemez, söyleyemez.

### Doğru yaklaşım

Elimizde iki gerçek seviye noktası var: Türkiye ve İstanbul. Bunlardan
**seviye oranı** çıkarılır:

```
istanbul_carpani = TP_BIRIMFIYAT_IST / TP_BIRIMFIYAT_TR   // ≈ 1,68
```

Buradan üç kural:

**1. Türkiye ve İstanbul için tahmin yok — gerçek veri var.**
`region_metrics.metric = 'unit_price'` olarak doğrudan kaydedilir.
`region_estimates` tablosuna yazılmaz.

**2. Diğer bölgeler için seviye bilinmiyor.**
Elimizde o bölgenin fiyat seviyesini veren hiçbir resmî kaynak yok.
Endeksten türetmek, yukarıda gösterildiği gibi %44'e varan hata üretir.

Bu bölgelerde `median_m2` **hesaplanmamalı ve gösterilmemeli.**
Gösterilecek olan: endeks değeri ve yıllık değişim yüzdesi — bunlar gerçek.

**3. Bölge için gösterilebilecek dürüst bilgi:**
- Konut fiyat endeksi (gerçek, TCMB)
- Son 12 aylık değişim yüzdesi (endeksten hesaplanır, doğru)
- "Türkiye ortalamasına göre şu kadar hızlı/yavaş artıyor" (endeks
  karşılaştırması, doğru)
- Türkiye geneli birim fiyat, referans olarak (gerçek)

Gösterilemeyecek olan: o bölgeye özel ₺/m² rakamı.

### Sonuç

`region_estimates` tablosu şimdilik **yalnızca TR ve TR10 için** doldurulur ve
`method = 'official'`, `confidence = 'high'` olur — çünkü bunlar tahmin değil,
gerçek ölçüm.

Diğer bölgeler için satır yazılmaz. Arayüz, o bölgelerde m² fiyatı yerine
endeks ve değişim oranını gösterir.

Mahalle veya il bazlı ₺/m² için gerçek kaynak gerekir — kullanıcı girdilerinden
havuz oluşturmak veya ticari veri sağlayıcı.

---

## API çağrısı

```
GET https://evds2.tcmb.gov.tr/service/evds/
    series=TP_KFE_TR-TP_KFE_TR10-...
    &startDate=01-01-2020
    &endDate=31-12-2026
    &type=json
    &frequency=5          // 5 = aylık, 6 = çeyreklik
```

Anahtar **header** ile gönderilir:
```
key: {EVDS_API_KEY}
```

Seriler tire (`-`) ile ayrılır. Endeks ve birim fiyat farklı frekanslarda
olduğu için **iki ayrı çağrı** yapılmalı.

## Veri dönüşümü — doğrulanmış

**Tarih biçimleri** (ikisi de geliyor):

| EVDS | Dönüşüm |
|---|---|
| `2026-06` (aylık) | `2026-06-01` |
| `2026-2Ç` (çeyreklik) | `2026-04-01` |
| `2020-01` | `2020-01-01` |

Çeyrek → ay: `(çeyrek - 1) * 3 + 1`

**Sayı biçimi:** Binlik ayracı virgül, ondalık nokta. `"51,885.90"` → `51885.9`
Virgülleri temizle, sonra `Number()`. `null`, `""` ve sayıya çevrilemeyen
değerleri **atla**, sıfır olarak kaydetme.

## Doğrulanmış örnek değerler

2026 Haziran endeksi: TR 231,46 · TR10 216,92 · TR51 255,52 · TRB 291,09
2026 2. çeyrek birim fiyat: TR 51.885,90 ₺/m² · İstanbul 87.301,00 ₺/m²
