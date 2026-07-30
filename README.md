# emlakmetric

Gayrimenkul yatırım analiz terminali. İlan linkini yapıştır — getiri, çevre analizi ve yatırım kararı saniyeler içinde.

---

## Özellikler

- **İlan Analizi** — Sahibinden, Hepsiemlak, Emlakjet gibi platformlardan ilan linki ile otomatik analiz
- **Yatırım Kararı** — Kira getirisi, amortisman süresi, 5 yıllık ROI hesaplama
- **Çevre Analizi** — Yakın çevredeki mülklerin karşılaştırmalı fiyat analizi
- **Mülk Tipi Desteği** — Konut, arsa, dükkan/ticari mülk analizi
- **Animasyonlu Şehir Siluetleri** — 8 Türk şehrinin Catmull-Rom spline tabanlı sürekli çizgi animasyonu
- **Canlı Veri Şeridi** — Gerçek zamanlı piyasa verileri
- **Responsive Tasarım** — Mobil, tablet ve masaüstü uyumlu

## Teknoloji Yığını

### Çekirdek

| Teknoloji | Sürüm | Açıklama |
|-----------|--------|----------|
| [React](https://react.dev) | 19 | UI kütüphanesi |
| [TypeScript](https://www.typescriptlang.org) | 5.8 | Tip güvenliği |
| [Vite](https://vite.dev) | 8 | Build aracı ve geliştirme sunucusu |
| [Bun](https://bun.sh) | — | Paket yöneticisi ve çalışma zamanı |

### Framework & Yönlendirme

| Teknoloji | Açıklama |
|-----------|----------|
| [TanStack Start](https://tanstack.com/start) | SSR (Server-Side Rendering) framework |
| [TanStack Router](https://tanstack.com/router) | Dosya tabanlı tip-güvenli yönlendirme |
| [TanStack Query](https://tanstack.com/query) | Asenkron veri yönetimi ve önbellekleme |
| [Nitro](https://nitro.build) | Sunucu motoru (Cloudflare hedefi) |

### Stil & UI

| Teknoloji | Açıklama |
|-----------|----------|
| [Tailwind CSS](https://tailwindcss.com) v4 | CSS-first yapılandırma (@theme, @utility, @custom-variant) |
| [Radix UI](https://www.radix-ui.com) | 25+ erişilebilir headless bileşen |
| [Recharts](https://recharts.org) | Veri görselleştirme grafikleri |
| [Lucide React](https://lucide.dev) | İkon kütüphanesi |
| [class-variance-authority](https://cva.style) | Bileşen varyant yönetimi |
| [tailwind-merge](https://github.com/dcastil/tailwind-merge) | Tailwind sınıf çakışma çözümü |
| [tw-animate-css](https://github.com/Wombosvideo/tw-animate-css) | Tailwind animasyon yardımcıları |
| [Embla Carousel](https://www.embla-carousel.com) | Carousel/slider bileşeni |
| [Vaul](https://vaul.emilkowal.ski) | Drawer bileşeni |
| [Sonner](https://sonner.emilkowal.ski) | Toast bildirimleri |
| [cmdk](https://cmdk.paco.me) | Komut paleti bileşeni |

### Form & Doğrulama

| Teknoloji | Açıklama |
|-----------|----------|
| [React Hook Form](https://react-hook-form.com) | Performanslı form yönetimi |
| [Zod](https://zod.dev) | Şema tabanlı veri doğrulama |
| [@hookform/resolvers](https://github.com/react-hook-form/resolvers) | Zod-RHF entegrasyonu |

### Geliştirici Araçları

| Teknoloji | Açıklama |
|-----------|----------|
| [ESLint](https://eslint.org) 9 | Kod kalitesi ve linting |
| [Prettier](https://prettier.io) | Kod biçimlendirme |
| [vite-tsconfig-paths](https://github.com/aleclarson/vite-tsconfig-paths) | TypeScript path alias desteği |

## Tasarım Sistemi

- **Fontlar:** Space Grotesk (başlıklar), Space Mono (veri tabloları / terminal estetiği)
- **Renk Paleti:**
  - `#FFFFFF` — Zemin (Saf Beyaz)
  - `#0E1116` — Metin & Başlıklar (Koyu Grafit)
  - `#1B4DFF` — Vurgu / CTA (Elektrik Mavi)
  - `#00875A` — Olumlu / Getiri (Yeşil)
  - `#E23D28` — Riskli / Düşük Getiri (Kırmızı)
- **Renk Formatı:** oklch (CSS custom properties)
- **Stil:** Flat terminal estetiği, ince çizgi tablolar, gölgesiz minimalist yapı

## Kurulum

```bash
git clone https://github.com/Real-Estate-Ela/em-squared-insight-777e937d.git
cd em-squared-insight-777e937d
bun install
bun run dev
```

## Komutlar

| Komut | Açıklama |
|-------|----------|
| `bun run dev` | Geliştirme sunucusu |
| `bun run build` | Üretim derlemesi |
| `bun run preview` | Üretim önizlemesi |
| `bun run lint` | ESLint kontrolü |
| `bun run format` | Prettier biçimlendirme |

## Proje Yapısı

```
src/
├── components/          # UI bileşenleri
│   ├── ui/              # Radix UI tabanlı temel bileşenler
│   ├── CityMorphBackground.tsx  # Animasyonlu şehir silueti (SVG)
│   ├── Header.tsx       # Navigasyon başlığı
│   ├── Footer.tsx       # Alt bilgi
│   ├── LiveDataStrip.tsx # Canlı veri şeridi
│   ├── Charts.tsx       # Veri grafikleri
│   └── ...
├── routes/              # Sayfa yönlendirmeleri (dosya tabanlı)
│   ├── index.tsx        # Ana sayfa
│   ├── hakkimizda.tsx   # Hakkımızda
│   ├── iletisim.tsx     # İletişim
│   └── gorseller.tsx    # Görseller
├── styles.css           # Tasarım sistemi ve tema
└── lib/                 # Yardımcı fonksiyonlar
```

## Lisans

Tüm hakları saklıdır.
