# ByCase

Telefon qabları və aksesuarları mağazası üçün vitrin saytı və admin panel (Next.js + Tailwind CSS).
Onlayn ödəniş yoxdur — sifariş WhatsApp-a yönləndirilir.

## İşə salmaq

```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm start   # production
```

## Admin panel

Ünvan: **`/admin`** (axtarış motorlarından gizlədilib).

Giriş parolu və sessiya açarı **`.env.local`** faylındadır:

```
ADMIN_PASSWORD=...            # admin panelə giriş parolu
ADMIN_SESSION_SECRET=...      # ən azı 16 simvol, təsadüfi uzun mətn
```

Parolu dəyişmək üçün `ADMIN_PASSWORD` dəyərini dəyişib serveri yenidən başladın.
Bu faylı heç kimə göndərməyin və açıq yerə yükləməyin (`.gitignore`-dadır).
Canlı serverdə (hosting) bu iki dəyəri **mütləq yeni, güclü dəyərlərlə** təyin edin.

Paneldən idarə olunanlar:

| Bölmə | Nə edir |
| --- | --- |
| Məhsullar | əlavə et, düzəliş et, sil, kopyala, saytda göstər/gizlət, ana səhifədə seçilmiş et |
| Məhsul formu | şəkil yükləmə, rənglər, uyğun telefon modelləri, qiymət/endirim, nişan, xüsusiyyətlər, canlı önizləmə |
| Kateqoriyalar | əlavə et, adını dəyiş, yuxarı/aşağı sırala, sil (yalnız boş kateqoriyanı silmək olar) |
| Telefon modelləri | brend və model əlavə et, adını dəyiş, sil ("Telefonunu seç" bölməsi və filtr bundan istifadə edir). Modelin adı dəyişəndə və ya silinəndə məhsullarda da yenilənir. |
| Mağaza ayarları | WhatsApp nömrəsi, ünvan (xəritə), iş saatları, Instagram hesabları |

Hər dəyişiklik saytda dərhal görünür.

## Məlumatlar harada saxlanır

- **`data/db.json`** — məhsullar, kateqoriyalar, modellər, ayarlar
- **`data/uploads/`** — yüklənmiş şəkillər

Bu qovluq ilk işə salınanda `src/data/products.ts`-dəki nümunə məlumatlarla yaranır. Sonra yalnız admin paneldən dəyişir.
**Ehtiyat nüsxə üçün `data/` qovluğunu kopyalamaq kifayətdir.** Başqa yerdə saxlamaq üçün: `BYCASE_DATA_DIR=/yol/data`.

### Hosting haqqında vacib qeyd

Məlumatlar fayla yazılır, buna görə sayt **daimi diski olan** serverdə işləməlidir (VPS, Railway/Render + volume və s.).
Vercel / Netlify kimi "serverless" platformalarda fayl sistemi müvəqqətidir və dəyişikliklər itəcək.
Onlara keçmək lazım olsa, yalnız `src/lib/store.ts` (məlumat) və `src/app/api/admin/upload/route.ts` (şəkillər)
verilənlər bazası və bulud saxlancına keçirilir, qalan hər şey eyni qalır.

## Kodda nə haradadır

| Nə | Harada |
| --- | --- |
| Məlumat oxuma/yazma | `src/lib/store.ts` |
| Saytın məlumat funksiyaları | `src/lib/products.ts` |
| Giriş və sessiya | `src/lib/auth.ts` |
| Məhsul məlumatının yoxlanması | `src/lib/validate.ts` |
| Admin əməliyyatları (server actions) | `src/app/admin/actions.ts` |
| Admin səhifələri | `src/app/admin/` |
| Rənglər | `src/app/globals.css` (`@theme`) |

Saytın real ünvanını `.env.local` faylına əlavə edin (canlı serverdə mütləq lazımdır):

```
NEXT_PUBLIC_SITE_URL=https://sizin-sayt.az
```

Bu ünvan üç yerdə istifadə olunur: məhsul kartından göndərilən WhatsApp mesajındakı link, `/robots.txt` və `/sitemap.xml`
(Google üçün; sitemap məhsullar dəyişdikcə avtomatik yenilənir). Təyin olunmasa `http://localhost:3000` götürülür.

## Qeydlər

- **Layihəni iCloud Drive-ın sinxronlaşdırdığı qovluqda (məs. Masaüstü/Desktop) saxlamayın.** macOS faylları buluda çıxarır və
  `node_modules` oxunarkən `ETIMEDOUT` ilə server ilişir. `~/Developer/ByCase` kimi qovluq seçin.
- Admin girişində 5 yanlış cəhddən sonra IP 10 dəqiqə bloklanır; ümumi limit də var (bütün IP-lərdən cəmi 40 yanlış cəhd).
  Bloku sıfırlamaq üçün serveri yenidən başladın.
- Yüklənib heç bir məhsula bağlanmamış şəkillər 24 saatdan sonra avtomatik silinir.
