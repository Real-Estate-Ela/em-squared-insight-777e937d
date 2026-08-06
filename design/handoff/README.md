# Handoff: emlakmetric — pazarlama sitesi (Ana sayfa · Paketler · İletişim)

## Genel bakış
Emlakmetric, sahibinden.com ilan verisi ve konum verisini okuyup metrekare bazında sayıya çeviren bir "gayrimenkul analiz terminali". Bu paket, ürünün pazarlama sitesinin üç sayfasını içerir: **Ana sayfa** (hero + katmanlı anlatım + analiz terminali demosu + bölge ızgarası + araçlar + paketler şeridi + kullanıcı yorumları + SEO metni + SSS + CTA), **Paketler** (3 paket + karşılaştırma tablosu), **İletişim** (form + iletişim bilgileri).

## Tasarım dosyaları hakkında
Bu paketteki dosyalar **HTML ile üretilmiş tasarım referanslarıdır** — görünümü ve davranışı gösteren prototiplerdir, doğrudan production'a kopyalanacak kod değildir. Görev: bu tasarımları hedef kod tabanının kendi ortamında (Next.js/React, Vue, Astro, vb.) mevcut desenler ve kütüphanelerle **yeniden inşa etmek**. Ortam henüz yoksa proje için en uygun framework seçilip tasarımlar orada uygulanmalı.

Prototip tek dosyalık bir "Design Component" olarak yazıldı: `Emlakmetric.dc.html`. İçinde bir şablon (markup) ve bir mantık sınıfı (React class component mantığı) var; tüm stiller **inline**. React'e taşırken şablon JSX'e, mantık sınıfı da bir bileşene birebir çevrilebilir.

## Fidelity
**High-fidelity.** Renkler, tipografi, boşluklar, animasyon süreleri ve kopya metinler nihai. Pixel-perfect yeniden üretilmeli. Tek istisna: analiz sonuçları ve bölge fiyatları **demo veridir**, gerçek API'ye bağlanmalı.

## Teknoloji notları (React/Next.js önerisi)
- Sayfalar gerçek route olmalı: `/` , `/paketler`, `/iletisim` (prototipte tek dosyada state ile taklit edildi). SEO için ayrı route + ayrı `<title>`/`<meta description>` şart.
- Sayfa geçiş perdesi (7 sütunlu animasyon) route değişiminde çalışacak şekilde bir layout bileşenine taşınmalı (Next.js App Router: `template.tsx` + `framer-motion` ya da saf CSS animasyonu).
- Hero ve CTA'daki parçacık alanı bir `<canvas>` + `requestAnimationFrame` bileşeni (aşağıda algoritma var). `useEffect` içinde başlat, canvas DOM'dan koptuğunda döngü kendini bitirmeli.
- Kaydırmaya bağlı açılma efektleri **CSS scroll-driven animation** ile yazıldı: `animation-timeline: view(); animation-range: entry X% cover Y%;`. Desteklemeyen tarayıcılarda animasyon anında bitmiş durumda görünür (içerik kaybı yok). İsterseniz IntersectionObserver fallback eklenebilir.

## Tasarım token'ları
| Token | Değer | Kullanım |
| --- | --- | --- |
| Saf Beyaz | `#FFFFFF` | varsayılan zemin |
| Koyu Grafit | `#0E1116` | metin, koyu bölüm zemini, footer |
| Elektrik Mavi | `#1B4DFF` | birincil vurgu, CTA, aktif durum |
| Getiri Yeşili | `#00875A` | pozitif durum + analiz bölümü zemini |
| Risk Kırmızısı | `#E23D28` | negatif/risk durumu + paketler şeridi zemini |
| Açık mavi yüzey | `#F2F5FF` | ikincil açık zemin |
| Çizgi (açık zemin) | `rgba(14,17,22,.16)` | 1px ayırıcı |
| Çizgi (koyu zemin) | `rgba(255,255,255,.14–.18)` | 1px ayırıcı |

**Kural:** gölge yok, gradyan yok (maske hariç), köşe yarıçapı yok — ayrım her yerde 1px çizgiyle kurulur. Bir ekranda tek mavi vurgu.

### Tipografi
- Başlık: **Space Grotesk** 500/700, `letter-spacing: -0.05em … -0.065em`, satır yükseklikleri .82–.98
- Gövde/veri/etiket: **Space Mono** 400/700, etiketlerde `letter-spacing: .16em–.34em`, hepsi UPPERCASE
- Google Fonts: `Space+Grotesk:wght@400;500;700&family=Space+Mono:wght@400;700`
- Ölçekler `clamp()` ile akışkan: H1 `clamp(32px, 6.2vw, 118px)`, H2 `clamp(28px, 4.4vw, 70px)`, H3 `clamp(20px, 2vw, 30px)`, gövde 12–16px, etiket 10–11px

### Boşluk
Bölüm dolgusu `clamp(64px, 8vw, 130px)` dikey, `clamp(16px, 4vw, 44px)` yatay. İçerik genişliği `max-width: 1560px; margin: 0 auto`. Kart dolgusu `clamp(22px, 3vw, 40px)`. Izgara boşlukları 1px (çizgi etkisi için `gap: 1px` + arka plan çizgi rengi).

## Marka işareti
- Kelime markası: "emlakmetric", Space Grotesk 700, tracking −6%
- İşaret: 1px çerçeve içinde `em²` (`em` + `<sup>2</sup>`), kare
- **Yasak:** ev silueti, çatı, anahtar, harita pini veya klasik emlak ikonu

## Ekranlar

### 1. Ana sayfa — Hero
- Yükseklik `min-height: 100vh`, beyaz zemin, dikeyde ortalanmış, üst dolgu 104px.
- **Parçacık alanı (imza görsel):** genişlik %100, yükseklik `clamp(250px, 46vh, 520px)` canvas. İçinde `em²` kelime markası noktalardan oluşur: off-screen canvas'a Space Grotesk 700 ile `em` + %33 boyutta `2` çizilir, alfa > 130 olan pikseller 3–4px adımla örneklenir (~2.500 nokta), her nokta rastgele konumdan hedefine `0.055` oranıyla yaklaşır ve `sin/cos` ile hafifçe salınır. İmleç 150px yakınına gelince noktalar 46px'e kadar itilir. Nokta rengi: %70 mavi `rgba(27,77,255,.34–.76)`, %30 grafit `rgba(14,17,22,.30–.60)`, %4 kırmızı `rgba(226,61,40,.8)`. Nokta boyutu 2×2px.
- **Yörünge katmanı:** 190 adet baloncuk, markanın merkezi çevresinde eliptik yörüngelerde (yarıçap `min(W,H)*0.52*(0.42–1.2)`), hız `±0.00012–0.00054 rad/ms`, boyut 1.4px (%12'si 2.4px), opaklık .12–.52; imleç 130px yakınında 40px'e kadar itilir.
- **Başlık:** "FİYAT BİR İDDİA." (grafit) / "M² BİR KANIT." (mavi, nokta kırmızı). Space Grotesk 700, `clamp(32px, 6.2vw, 118px)`, satır yüksekliği .86.
- **Alt metin:** Space Mono 13–16px, `max-width: 540px`, "İlanın hikâyesini değil medyanını okuyoruz…"
- **CTA:** mavi kutu "ANALİZ ET ↓", ok sonsuz döngüde aşağı kayıp geri gelir (`arrowLoop`, 1.6s).
- **Canlı yazan satır:** 1px üst çizgi, "> ŞİMDİ DENE" + `sahibinden.com/ilan/9931-daire` metni 95ms/karakter yazılıp geri silinir, kırmızı yanıp sönen imleç. Sağda "160 MS · 4 KAYNAK · ÜCRETSİZ".
- **Giriş animasyonu (rulebase tarzı):** her blok `lineIn` — `opacity 0→1`, `blur(12px)→0`, `translateY(26px)→0`, 1.15s, gecikmeler .15 / .38 / .95 / 1.15 / 1.4s.
- Altta ortada "AŞAĞI KAYDIR ↓".

### 2. Ana sayfa — Katmanlı anlatım (3 sticky kat)
`position: sticky; top: 0; height: 100vh; overflow: hidden` üç bölüm üst üste biner. **Hepsi opak olmalı.**
1. **01 / İLAN** — beyaz. "Emlakçının cümlesi var; bizde metrekare var." Alt metin: cümle vs ölçü karşıtlığı.
2. **02 / EMSAL** — `#1B4DFF`, beyaz metin. "312 komşu ilan, tek medyan."
3. **03 / SAYI** — `#0E1116`, beyaz metin. "Dört sayı. Bir yön." + 4 metrik şeridi (%6,4 · 15,6 yıl · −%9 · 78/100).
Her katta üstte `01 / İLAN ————— GİRDİ` biçiminde mono etiket + 1px çizgi. Başlıklar **kelime kelime** açılır: her kelime kendi `animation-range`'i ile (`entry 4% cover 26%`, sonra +5%'lik adımlar), `wordIn`: `opacity 0→1`, `blur(10px)→0`, `translateY(40%)→0`.

### 3. Ana sayfa — Analiz terminali (sayfanın merkezi)
- Bölüm zemini **Getiri Yeşili `#00875A`**, beyaz başlık: "Yapıştır. Üç saniye. Kararın hazır." ("Üç saniye." grafit).
- Terminal paneli: beyaz zemin, 1px `rgba(14,17,22,.18)` çerçeve, köşe yarıçapı yok.
- Sekmeler: **İLAN LİNKİ** / **KONUM** — aktif olan mavi zemin beyaz metin, pasif `rgba(14,17,22,.5)`. Sağda "KAYNAKLAR CANLI · SON TARAMA 00:04" + yeşil nabız noktası.
- Giriş satırı: mono `>` işareti + input (placeholder sekmeye göre değişir) + mavi "ANALİZ ET" butonu (hover kırmızı). Enter da çalıştırır.
- **Tarama fazı (~2 s):** 4 kaynak kutusu (sahibinden.com, tapu bölge serisi, kiralık emsal, tüik endeksi) 380ms aralıkla "okunuyor…" → "OK" olur, altlarındaki 2px çubuk %100'e gider. Altında canlı log konsolu: 5 satır 380ms aralıkla akar (son 4 tutulur).
- **Sonuç fazı — sırayla açılır:** karar bloğu (0s) → 5 metrik satırı (0.06 / 0.16 / 0.26 / 0.36 / 0.46s) → m² barları (0.58 / 0.72 / 0.86 / 1.0s, `scaleX` büyür) → trend çizgisi (1.15s, `stroke-dasharray` çizilir) → değişim özeti (1.1s) → sonuç notu (1.35s). Hepsi `riseIn` .6–.7s.
- Karar bloğu: dev yeşil **"AL"** (`clamp(46px,7vw,104px)`) + "5 YIL TUT", yanında likidite halkası (r=38, `stroke-dasharray: 239`, `stroke-dashoffset = 239*(1 − skor/100)` → 78 için 52.6) ortasında skor, yanında kırmızı risk notu + ilan künyesi, sağda "312 EMSAL İLAN · 00:00,16".
- Metrik satırları (1px ayırıcı): brüt kira getirisi **%6,4** (yeşil) · amortisman süresi **15,6 yıl** · mahalle medyanına sapma **−%9,0** (yeşil) · likidite skoru · 90 gün **78/100** · bina yaşı riski **1999 · yüksek** (kırmızı). Sayılar 1.1s boyunca `1−(1−p)³` yumuşamasıyla 0'dan hedefe sayar.
- Barlar: bu ilan 71.400 (mavi, %74) · mahalle medyanı 78.500 (%81) · ilçe medyanı 96.400 (%100) · 12 ay önce 58.900 (kırmızı %61).
- Trend: 12 noktalı polyline, mavi 2px, son nokta kırmızı daire; sağda "+%33,3 · 12 AYLIK DEĞİŞİM".
- Mobilde metrik tablosu ve grafik kolonu tek kolona iner; kaynak ızgarası 2 kolona düşer.

### 4. Ana sayfa — Veri (02)
Beyaz. Başlık kelime kelime: "Tahmin üretmiyoruz. Veriyi okuyup sayıya çeviriyoruz." ("üretmiyoruz." kırmızı). Altında 3 kolon (1px ayırıcı): 01 TOPLAMA / 02 NORMALİZASYON / 03 SAYI — her biri başlık + paragraf + `>` ile başlayan 3 mono madde. Kolonlar 0 / 6% / 12% `entry` gecikmeleriyle açılır.

### 5. Ana sayfa — Bölge (03)
Grafit zemin. 4×3 ızgara, 12 ilçe kartı: il etiketi (mono) + ilçe adı (Space Grotesk 19–27px) + "96.400 ₺/m²" ve değişim yüzdesi (artış yeşil, düşüş kırmızı). **İmleç ızgarada gezerken** her hücrenin merkezine uzaklığa göre mavi dolgu `rgba(27,77,255, t²·0.85)`, 320px yarıçap. Altında havadan görsel alanı (kullanıcı doldurur), üstünde açıklama satırı.

### 6. Ana sayfa — Araçlar (04)
Beyaz, 3 kart (KARŞILAŞTIR / PORTFÖY / BÖLGE RAPORU). Hover'da kart grafite döner, metin beyazlaşır (200ms).

### 7. Ana sayfa — Paketler şeridi (05)
**Risk Kırmızısı `#E23D28`** zemin, beyaz başlık "Ücretsiz başla. Analiz sayısı arttıkça yükselt." + siyah "PAKETLERİ GÖR →" butonu (hover beyaz zemin, kırmızı metin).

### 8. Ana sayfa — Kullanıcı yorumları (06)
Beyaz, 3 alıntı kartı (yatırımcı / danışman / ilk ev alıcısı). Kartlar `flipIn` ile gelir: `perspective(900px) rotateX(-14deg) + translateY(46px) + blur(8px)` → normal, 1.05s, 0 / 5% / 10% gecikmelerle. Hover: `translateY(-8px)` + kart zemini sırasıyla grafit / kırmızı / mavi, metin beyaz. Alıntı Space Grotesk 500 18–26px, imza mono 11px.

### 9. Ana sayfa — SEO metni + SSS
İki kolon. Solda h2 + 3 paragraf (anahtar kelimeler `<strong>`): gayrimenkul analiz terminali, m² fiyatı, konuma göre ev değeri sorgulama, kira getirisi hesaplama, amortisman süresi. Sağda 4 `<details>`: her satırda 1px çerçeveli mavi "+" işareti, hover'da satır maviye döner ve zemin `rgba(27,77,255,.05)` olur; satırlar kademeli açılır. Sayfada ayrıca **FAQPage JSON-LD** var — mutlaka taşınmalı.

### 10. Ana sayfa — CTA
Mavi zemin. Solda "Bir link. Bir sayı." Sağda 1px çerçeveli panel: içinde **em² parçacık alanının küçüğü** (beyaz noktalar, 64 yörünge baloncuğu), altında "İMLECİ GEZDİR → m² · em² CANLI". Panelin sağ üstünde 22s'de bir tur dönen dairesel yazı rozeti ("HER M² BİR SAYIDIR · em² ·", `textPath`). Altta: açıklama + siyah "ÜCRETSİZ KAYIT OL" + "İLETİŞİM →".

### 11. Paketler sayfası
Başlık "Analiz başına ödeme yok." + 3 paket kartı (1px ızgara): **Başlangıç ₺0** (5 analiz/ay, mahalle medyanı, 12 aylık trend; portföy ve PDF yok — kırmızı "−" satırları), **Analist ₺349/ay** (grafit kart, mavi "EN ÇOK SEÇİLEN" etiketi, 250 analiz, sınırsız konum, karşılaştırma, 50 ilan portföy, PDF rapor), **Kurumsal ₺1.490/ay** (sınırsız analiz, API 10.000 çağrı, CSV toplu yükleme, özel rapor, hesap yöneticisi, SSO). Altında 7 satırlık karşılaştırma tablosu (grafit başlık satırı; ✓ yeşil, ✕ kırmızı). Not: "Yıllık ödemede iki ay ücretsiz".

### 12. İletişim sayfası
Başlık "Sayıyı konuşalım." İki kolon. Solda form: AD SOYAD · ŞİRKET · E-POSTA · TELEFON (2×2 ızgara, alt çizgili inputlar), KONU çipleri (KURUMSAL PAKET / API ENTEGRASYONU / BÖLGE RAPORU / DESTEK — seçili olan mavi), MESAJ (textarea, 1px çerçeve), mavi "GÖNDER →" + KVKK notu. Sağda 1px çerçeveli bilgi bloğu: e-posta, telefon, ofis, çalışma saatleri (hafta sonu satırı kırmızı) + görsel alanı. **Form backend'e bağlanmalı** (prototipte sadece buton etiketi "GÖNDERİLDİ" olur).

## Appbar (tüm sayfalar)
- `position: fixed`, **çizgi yok**, "bulut" hissi: her zaman `backdrop-filter: blur(20px) saturate(130%)` + alt kenarda maske ile erime (`mask-image: linear-gradient(180deg, #000 62%, rgba(0,0,0,.45) 86%, transparent)`).
- Zemin ve metin rengi, bar'ın altındaki bölüme göre değişir: `document.elementsFromPoint(innerWidth/2, 54)` ile en üstteki `[data-bg]` bölümü bulunur (sticky katmanlarda da doğru çalışır), bulunamazsa geometrik kontrole düşülür. Açık bölümde grafit metin + `rgba(255,255,255,.4–.6)` zemin; koyu bölümde beyaz metin + `rgba(14,17,22,.28–.45)`; mavi bölümde beyaz metin + `rgba(27,77,255,.3–.5)`. Kaydırıldığında dolgu 17px → 10px.
- Sol: em² işareti + "emlakmetric". Orta/sağ: ANALİZ · VERİ · BÖLGE · PAKETLER · İLETİŞİM. Sağ: çerçeveli "GİRİŞ YAP" + mavi "KAYIT OL" (hover kırmızı).
- < 900px: menü linkleri gizlenir, hamburger açılır; tam ekran grafit menü + iki buton.

## Etkileşimler & davranış
- **Sayfa geçişi:** ekranı 7 dikey sütun kaplar (beyaz · mavi · yeşil · grafit · kırmızı · mavi · beyaz), her biri 45ms gecikmeli, `translateY(-101%) → 0 → 101%`, 1.15s `cubic-bezier(.76,0,.24,1)`. Ortada em² + "emlakmetric" + sayfa adı görünür. İçerik değişimi 480ms'de yapılır (perde kapalıyken), sayfa başına `scrollTo(0,0)`.
- **Yumuşak kaydırma:** aynı sayfadaki bağlantılar `easeInOutCubic` ile 1100–1200ms'de kaydırır (native `scroll-behavior` kullanılmaz), hedefin 60px üstünde durur.
- **Giriş/Kayıt modalı:** sekmeli (GİRİŞ YAP / KAYIT OL), kayıt modunda AD SOYAD alanı eklenir; arka plan `rgba(14,17,22,.72)` + blur; panel `riseIn` 320ms ile gelir; dışa tıklama kapatır.
- **Analiz demosu:** bölüm görünür alanın %30'una girince bir kez otomatik çalışır (IntersectionObserver), sonra buton "TEKRAR ÇALIŞTIR" olur.

## State (prototipteki karşılıkları)
`route` ('home' | 'paketler' | 'iletisim') · `turning` + `turnLabel` (geçiş perdesi) · `menu` · `auth` (null | 'giris' | 'kayit') · `tab` ('link' | 'konum') · `query` · `phase` ('idle' | 'scan' | 'done') · `step` (0–4 kaynak) · `logs` (son 4 satır) · `kira/amort/sapma/skor` (sayan değerler) · `theme` + `scrolled` (appbar) · `konu` (iletişim çipi) · `sent` · `typed` (hero yazan satır).

## Gerçek veri bağlanacak yerler
1. Analiz sorgusu: ilan URL'i veya konum → m² fiyatı, mahalle/ilçe medyanı, 12 aylık seri, kira emsali, likidite skoru, bina yaşı, karar (AL / BEKLE / RİSKLİ) ve risk notları.
2. Bölge ızgarası: 12 ilçe için medyan m² + 12 aylık değişim.
3. İletişim formu ve kayıt/giriş akışı.
4. Paket fiyatları ve limitler (tek bir yapılandırmadan beslenmeli).

## SEO gereksinimleri
- Her route için ayrı `<title>` + `<meta name="description">`; ana sayfa başlığı: "emlakmetric — sahibinden ilan analizi, m² fiyat ve kira getirisi sorgulama".
- H1 her sayfada tek; ana sayfada "FİYAT BİR İDDİA. M² BİR KANIT.".
- FAQPage JSON-LD (4 soru) korunmalı; paketler için `Product/Offer`, kurum için `Organization` şeması eklenebilir.
- Anahtar kelimeler metin içinde doğal geçiyor: sahibinden ilan analizi, m² fiyat sorgulama, konuma göre ev değeri, kira getirisi hesaplama, amortisman süresi, bölge m² raporu, arsa emsal analizi.
- Canvas dekoratiftir; ekran okuyucu için `aria-hidden="true"` verilmeli. Tüm anlamlı içerik DOM'da metin olarak durmalı.

## Erişilebilirlik
- Analiz sonucundaki renk kodları (yeşil/kırmızı) her zaman metinle birlikte veriliyor — bu korunmalı.
- Hareketi azaltma tercihi için `@media (prefers-reduced-motion: reduce)` ile parçacık döngüsü, dönen rozet ve kaydırma animasyonları kapatılmalı (prototipte yok, production'da eklenmeli).
- Odak görünürlüğü: prototipte inputlarda `outline: none` var; production'da görünür focus stili eklenmeli.

## Mobil / responsive
Ölçekleme `clamp()` ile akışkan; 900px altında: appbar linkleri gizlenir (hamburger), 3–4 kolonlu ızgaralar tek veya iki kolona iner, yan yana bloklar dikey yığılır, analiz paneli sekmeler ve buton tam genişliğe geçer. Yatay taşma sıfır olmalı (kontrol edildi).

## Varlıklar
Prototipte gerçek fotoğraf yok. İki yerde kullanıcı-doldurmalı görsel alanı var: **Bölge** bölümündeki havadan görsel (21:7) ve **İletişim** sayfasındaki ofis/harita görseli (4:3). Marka vektörleri (`emlakmetric-wordmark.svg`, `em2-mark.svg`, `em2-mark-white.svg`, favicon, app icon) marka dosyasında mevcut — yeniden çizilmemeli.

## Dosyalar
- `Emlakmetric.dc.html` — nihai tasarım (tüm sayfalar, tüm animasyonlar, mantık sınıfı dahil)
- `Emlakmetric v1.dc.html` — ilk sürüm (referans/arşiv)
- `image-slot.js` — görsel alanı bileşeni (production'da kendi görsel bileşeninizle değiştirilir)
