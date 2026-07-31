# Cloudflare Pages ile Deploy

emlakmetric projesini `emlakmetric.pages.dev` adresinde yayınlamak için adım adım rehber.

## Neden Cloudflare Pages?

- Proje zaten Nitro ile Cloudflare hedefli build yapıyor
- Ücretsiz plan: sınırsız bandwidth, 500 build/ay
- Otomatik SSL sertifikası
- Global CDN (edge network)
- SSR (Server-Side Rendering) desteği
- İleride `emlakmetric.com` gibi özel domain bağlanabilir

## Adımlar

### 1. Cloudflare Hesabı Oluştur

1. [dash.cloudflare.com/sign-up](https://dash.cloudflare.com/sign-up) adresine git
2. E-posta ve şifre ile kayıt ol (ücretsiz)

### 2. Cloudflare Pages Projesi Oluştur

1. Cloudflare Dashboard'da sol menüden **Workers & Pages** seçeneğine tıkla
2. **Create** butonuna bas
3. **Pages** sekmesini seç
4. **Connect to Git** butonuna tıkla

### 3. GitHub Repo'yu Bağla

1. GitHub hesabını Cloudflare'a bağla (yetkilendirme isteyecek)
2. `Real-Estate-Ela/em-squared-insight-777e937d` repo'sunu seç
3. **Production branch** olarak `main` seç

### 4. Build Ayarları

Aşağıdaki ayarları gir:

| Ayar | Değer |
|------|-------|
| **Framework preset** | None |
| **Build command** | `bun run build` |
| **Build output directory** | `.output/public` |
| **Root directory** | `/` (boş bırak) |

#### Environment Variables (Ortam Değişkenleri)

| Değişken | Değer |
|----------|-------|
| `NODE_VERSION` | `22` |
| `BUN_VERSION` | `1` |

### 5. Deploy Et

1. **Save and Deploy** butonuna tıkla
2. İlk build 2-3 dakika sürebilir
3. Tamamlandığında `<proje-adı>.pages.dev` URL'ini alacaksın

### 6. Proje Adını Değiştir (emlakmetric.pages.dev)

Varsayılan proje adı repo adından gelir. Değiştirmek için:

1. Cloudflare Dashboard → Workers & Pages → projeyi seç
2. **Settings** sekmesine git
3. **General** bölümünde proje adını `emlakmetric` olarak değiştir
4. Artık URL: **emlakmetric.pages.dev**

### 7. (Opsiyonel) Özel Domain Bağlama — emlakmetric.com

Domain satın aldıktan sonra:

1. Cloudflare Dashboard → projeyi seç → **Custom domains** sekmesi
2. **Set up a custom domain** butonuna tıkla
3. `emlakmetric.com` yaz ve **Continue** de
4. Cloudflare DNS'i otomatik yapılandıracak (domain Cloudflare'da ise)
5. Farklı registrar'da ise, verilen CNAME kaydını DNS'e ekle:
   - **Tip:** CNAME
   - **Ad:** `@` veya `emlakmetric.com`
   - **Hedef:** `emlakmetric.pages.dev`
6. SSL sertifikası otomatik oluşturulacak (birkaç dakika sürer)

## Otomatik Deploy

GitHub'a `main` branch'ine her push yapıldığında Cloudflare Pages otomatik build ve deploy yapacak. Pull request'ler için de preview URL'leri oluşturulur.

## Sorun Giderme

### Build hatası alıyorum

```bash
# Lokalde build'i test et
bun run build
```

Build çıktısı `.output/` klasöründe olmalı.

### SSR çalışmıyor

Cloudflare Pages Functions'ın aktif olduğundan emin ol. Nitro otomatik olarak Cloudflare Workers uyumlu server-side kod üretir.

### Environment variable eksik

Cloudflare Dashboard → Settings → Environment variables bölümünden ekle. Production ve Preview için ayrı ayrı tanımlanabilir.
