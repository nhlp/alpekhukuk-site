# Alpek Hukuk ve Arabuluculuk — Web Sitesi

Next.js (App Router) tabanlı, Supabase (PostgreSQL) veritabanlı hukuk bürosu web sitesi. Randevu yönetimi, avukatların kendi makalelerini yazabildiği bir yönetim paneli ve otomatik SEO (meta etiketler, sitemap, JSON-LD) içerir.

## Teknoloji

- **Next.js 16** (App Router, Turbopack) + TypeScript + Tailwind CSS 4
- **Prisma 7** + Supabase (PostgreSQL) — `@prisma/adapter-pg` sürücü adaptörü ile
- Oturum yönetimi: `jose` (JWT) + httpOnly cookie tabanlı özel kimlik doğrulama (NextAuth kullanılmıyor)
- Zengin metin editörü: Tiptap

## Kurulum

```bash
npm install
```

`.env` dosyasında şu değişkenler tanımlı olmalı:

- `DATABASE_URL` — Supabase bağlantı adresi. **Önemli:** Bu makine/ağ IPv6 desteklemiyorsa "Direct connection" (`db.<proje>.supabase.co:5432`) çalışmaz; Supabase panelinden **Session pooler** adresini kullanın (`aws-0-<region>.pooler.supabase.com:5432`, kullanıcı adı `postgres.<proje-ref>` formatında).
- `SESSION_SECRET` — oturum imzalama anahtarı (rastgele, gizli bir değer).
- `NEXT_PUBLIC_SITE_URL` — sitenin canlı adresi (SEO/sitemap için).

Veritabanı şemasını uygulamak için:

```bash
npx prisma db push
```

Örnek verileri (3 avukat hesabı + 6 çalışma alanı) yüklemek için:

```bash
npm run db:seed
```

## Geliştirme

```bash
npm run dev
```

## Varsayılan Giriş Bilgileri (seed verisi)

Şifre: `AlpekHukuk2026!` — **ilk girişten sonra Profilim sayfasından mutlaka değiştirin.**

| E-posta | Rol |
|---|---|
| kadir@alpekhukuk.com.tr | Yönetici (site ayarları + tüm makaleler) |
| bengisu@alpekhukuk.com.tr | Avukat |
| kursat@alpekhukuk.com.tr | Avukat |

Rolleri, avukat hesaplarını ve bu varsayılan atamayı **Site Ayarları > Ekip Üyeleri** bölümünden dilediğiniz gibi değiştirebilirsiniz.

## Yönetim Paneli (`/admin`)

- **Randevular** — gelen randevu taleplerini görüntüleme, durum güncelleme (bekliyor/onaylandı/tamamlandı/iptal), dahili not ekleme.
- **Makaleler** — avukatlar kendi makalelerini yazar/düzenler (taslak veya yayımla); SEO meta başlık/açıklama başlıktan otomatik önerilir, dilenirse elle düzenlenebilir.
- **Profilim** — avukatın "Avukatlarımız" sayfasında görünen bilgileri (biyografi, fotoğraf, iletişim) ve şifresi.
- **Site Ayarları** (yalnızca Yönetici) — iletişim bilgileri, ana sayfa metinleri, çalışma alanları (ekle/düzenle/sil), ekip üyesi hesapları (ekle, şifre sıfırla, pasifleştir).

## SEO

- Her makale için otomatik meta başlık/açıklama önerisi (`generateSeoMeta`), elle override edilebilir.
- `/sitemap.xml` ve `/robots.txt` veritabanındaki güncel içerikten otomatik üretilir.
- Her sayfa için JSON-LD yapılandırılmış veri: `LegalService` (site geneli), `Person` (avukatlar), `Article` (makaleler), `BreadcrumbList`.

## Vercel + Supabase Dağıtımı

1. Vercel projesine Supabase entegrasyonunu bağlayın (Marketplace) veya `DATABASE_URL`'i manuel ortam değişkeni olarak ekleyin.
2. **Üretimde** Transaction Pooler (`:6543`, `?pgbouncer=true`) kullanmak, serverless fonksiyonların veritabanı bağlantı limitini aşmamasını sağlar — ancak bu proje geliştirme sırasında IPv6 kısıtlaması nedeniyle Session Pooler ile kuruldu. Vercel'in sunucuları IPv6 destekler, bu yüzden orada Transaction Pooler tercih edilebilir; sorun yaşarsanız Session Pooler de üretimde çalışır.
3. `SESSION_SECRET` için üretimde farklı ve güçlü bir değer belirleyin.
4. `NEXT_PUBLIC_SITE_URL` değerini gerçek alan adına (`https://www.alpekhukuk.com.tr`) göre ayarlayın.
5. İlk dağıtımdan sonra `npx prisma db push` ve `npm run db:seed` üretim veritabanına karşı çalıştırılmalı (yalnızca ilk kurulumda).
