# EmlakMetric Terminal

Lütfen aşağıdaki marka kimliği, logo/favicon kuralları, renk paleti ve sayfa yapılarına %100 sadık kalarak modern, minimalist ve veri odaklı bir Web Sitesi Arayüz Tasarımı (UI/UX) oluştur.

### 1. MARKA KİMLİĞİ, LOGO VE FAVICON

- Marka Adı: emlakmetric

- Ana Logo: İlk görseldeki gibi tamamen tipografik "emlakmetric" yazısı kullanılacak (küçük harflerle, Space Grotesk / kalın ve minimalist yapıda). Kesinlikle "ev" veya klasik emlak ikonu KULLANILMAYACAK.

- Favicon / Uygulama İkonu: İkinci görseldeki "em²" ("em" + metrekare üssü 2) sembolü kullanılacak. Kare zemin üzerinde (siyah, beyaz veya elektrik mavi zeminli "em²" varyasyonları) kompakt ikon olarak yer alacak.

- Konsept: Sadece konut değil; arsa, dükkan, ticari mülk gibi tüm gayrimenkul türlerinin değerini, ROI (amortisman / getiri oranı) hesaplamasını ve çevre analizini yapan finansal/teknik bir gayrimenkul analiz terminali.

### 2. RENK PALETİ VE KULLANIM KURALLARI

Renk Paleti Hiyerarşisi (Sadece görseldeki renkler kullanılacak):

- İLK 3 RENK (ANA RENKLER):

  1. Zemin / Background: #FFFFFF (Saf Beyaz)

  2. Grafit / Metin & Başlıklar: #0E1116 (Koyu Grafit)

  3. Vurgu / Accent (Tek Keskin Renk): #1B4DFF (Elektrik Mavi - Arama butonları, aktif sekmeler, CTA)

- YAN / YARDIMCI RENKLER (Yalnızca durum/durum analiz göstergelerinde kullanılacak):

  4. Olumlu / Getiri: #00875A (Yeşil)

  5. Riskli / Düşük Getiri: #E23D28 (Kırmızı)

### 3. TIPOGRAFİ VE TASARIM STİLİ

- Başlıklar (Headings): Space Grotesk (Modern, keskin, teknolojik)

- Gövde Metinleri ve Veri Tabloları: Space Mono (Terminal / Analiz aracı hissi veren monospaced font)

- Tasarım Üslubu: Sıkı harf aralığı, tek keskin mavi vurgu, ince çizgi tablolar, gölgesiz düz (flat) terminal estetiği.

### 4. GEZİNTİ (NAVIGATION) VE MENÜ YAPISI

Header/Menü Alanı:

- Sol Taraf: "emlakmetric" ana logosu ve yanında "em²" ikonik rozeti.

- Menü Bağlantıları:

  * Ana Sayfa

  * Hakkımızda

  * İletişim

  * Görseller

- Sağ Taraf CTA: #1B4DFF Mavi renkli "İlan Analiz Et" butonu.

### 5. SAYFA YAPILARI VE İÇERİKLERİ

#### A) ANA SAYFA (HOME PAGE)

1. Hero Bölümü (Terminal / Input Alanı):

   - Başlık / Slogan: "İlan linkini yapıştır. Getiri, çevre analizi ve yatırım kararı 20 saniyede."

   - Arama / Terminal Kutusu: sahibinden.com, hepsiemlak, emlakjet gibi sitelerden yapıştırılan ilan linkleri için giriş alanı. Örnek: `> emlakjet.com/ilan/9931-daire` ve yanında Mavi `#1B4DFF` renkli "ANALİZ ET" butonu.

   - Mülk Tipi Seçicileri (Tab'ler): Konut, Arsa, Dükkan/Ticari.

2. Örnek Live Terminal/Karar Kartı:

   - Karar Vurgusu: #00875A Yeşil font ile "AL — 5 yıl tut"

   - Alt Metin: "Bölge fiyat artışı son 24 ayda %38. İlan, mahalle medyanının %9 altında listelenmiş."

   - İnce Çizgili Veri Tablosu (Space Mono font ile):

     * kira getirisi: %6,4

     * amortisman: 15,6 yıl

     * 5 yıl roi: %41

3. Karşılaştırma & Yakın Yerler Özelliği:

   - Sahibinden, Hepsiemlak, Emlakjet gibi farklı platformlardaki benzer mülklerin linklerini ve fiyatlarını karşılaştıran liste görünümü.

   - Yakın çevredeki arsa, ev ve dükkan mülklerinin konumlarını ve analizlerini gösteren kartlar.

#### B) HAKKIMIZDA (ABOUT US)

- Gayrimenkul yatırımlarında şeffaf, veri odaklı ve yapay zeka destekli analizlerin önemini vurgulayan minimalist ve finansal odaklı sayfa düzeni.

#### C) İLETİŞİM (CONTACT)

- Temiz, minimalist iletişim formu (Ad Soyad, E-posta, Mesaj) ve veri entegrasyon duyuruları.

#### D) GÖRSELLER / MÜLK GALERİSİ (VISUALS)

- Analiz edilen mülklerin görselleri, harita görünümü ve çevre analizi grafiklerini sunan modern grid galeri yapısı.

### 6. TEKNİK TASARIM BEKLENTİSİ

Tasarımın responsive (Mobil, Tablet ve Masaüstü uyumlu), SaaS / FinTech terminal havasında son derece sade, şık ve göz yormayan bir yapıda olmasını sağla.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://em-squared-insight.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/59e38256-b99a-4bae-b7a6-e7b8712b241e).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
