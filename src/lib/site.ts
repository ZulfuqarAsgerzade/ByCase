import type { Settings } from "@/data/types";

/** Dəyişməyən sayt məlumatları */
export const site = {
  name: "ByCase",
  tagline: "Telefon qabları və aksesuarları",
  description:
    "ByCase — Bakıda telefon qabları və aksesuarları. Real çəkilişlər, yüksək keyfiyyət, bütün ünvanlara çatdırılma. Sifariş üçün WhatsApp-da yazın.",
} as const;

/** Saytın əsas ünvanı (sonunda "/" olmadan). `.env.local`-da NEXT_PUBLIC_SITE_URL təyin edin. */
export const siteUrl = () => (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/+$/, "");

export const nav = [
  { href: "/", label: "Ana səhifə" },
  { href: "/mehsullar", label: "Məhsullar" },
  { href: "/#nece-sifaris", label: "Necə sifariş edim?" },
  { href: "/#elaqe", label: "Əlaqə" },
] as const;

/** İlk işə salınanda verilənlər bazasına yazılan ayarlar. Sonra admin paneldən dəyişir. */
export const defaultSettings: Settings = {
  whatsapp: "994554180716",
  phoneDisplay: "+994 55 418 07 16",
  address: "28 May, Xəqani küç. 84C, Bakı",
  businessName: "Bycase Baku & Creative Case",
  mapsLink: "https://maps.google.com/?cid=12694736296089396745",
  hours: "10:30 – 22:00",
  instagram: [
    { handle: "bycase.baku", title: "ByCase Baku", desc: "Bütün aksesuarlar, qablar və yeniliklər" },
    { handle: "bycase.premium", title: "ByCase Premium", desc: "Lüks kolleksiya və real çəkilişlər" },
  ],
};

export const instagramUrl = (handle: string) => `https://www.instagram.com/${handle}/`;
type MapPlace = Pick<Settings, "address" | "businessName" | "mapsLink">;

/** Xəritədə axtarılan mətn: biznesin adı + ünvan. Ad olanda Google dəqiq biznes kartını açır. */
const mapsQuery = (p: MapPlace) => [p.businessName, p.address].filter(Boolean).join(", ");

/** Google Maps linki verilibsə birbaşa biznes kartı açılır, yoxdursa ad + ünvanla axtarış */
export const mapsUrl = (p: MapPlace) =>
  p.mapsLink || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsQuery(p))}`;
export const mapsEmbed = (p: MapPlace) =>
  `https://www.google.com/maps?q=${encodeURIComponent(mapsQuery(p))}&output=embed`;
