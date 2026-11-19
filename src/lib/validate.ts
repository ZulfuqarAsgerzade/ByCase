import type { AccessoryKind, Badge, Camera, DB, Pattern, Product, ProductColor } from "@/data/types";
import { autoFit } from "./fit";
import { productKind } from "./categories";
import { slugify, uniqueSlug } from "./slug";

export const PATTERNS: { value: Pattern; label: string }[] = [
  { value: "solid", label: "Düz rəng" },
  { value: "clear", label: "Şəffaf" },
  { value: "gradient", label: "Gradient" },
  { value: "stripes", label: "Zolaqlı" },
  { value: "marble", label: "Mərmər" },
  { value: "leather", label: "Dəri" },
  { value: "checker", label: "Şaxmat" },
];
export const CAMERAS: { value: Camera; label: string }[] = [
  { value: "pro", label: "iPhone Pro (3 lens)" },
  { value: "plain", label: "iPhone / Xiaomi (2 lens)" },
  { value: "samsung", label: "Samsung (şaquli)" },
];
export const ACCESSORIES: { value: AccessoryKind; label: string }[] = [
  { value: "glass", label: "Qoruyucu şüşə" },
  { value: "charger", label: "Şarj adapteri" },
  { value: "cable", label: "Kabel" },
  { value: "airpods", label: "AirPods qabı" },
  { value: "holder", label: "Tutacaq / cüzdan" },
];
export const BADGES: { value: Badge | ""; label: string }[] = [
  { value: "", label: "Yoxdur" },
  { value: "new", label: "Yeni" },
  { value: "bestseller", label: "Çox satılan" },
  { value: "sale", label: "Endirim" },
];

const HEX = /^#[0-9a-fA-F]{6}$/;
const IMAGE_URL = /^\/uploads\/[a-f0-9]{16,64}\.(jpg|png|webp|gif)$/;

const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export type ProductInput = Record<string, unknown>;

export function parseProduct(
  raw: ProductInput,
  db: DB,
  existing?: Product,
): { ok: true; product: Product } | { ok: false; error: string } {
  const name = str(raw.name, 120);
  if (name.length < 2) return { ok: false, error: "Məhsulun adını yazın." };

  const category = str(raw.category, 60);
  const cat = db.categories.find((c) => c.id === category);
  if (!cat) return { ok: false, error: "Kateqoriya seçin." };
  // Məhsul yalnız alt kateqoriyaya aid ola bilər (Qablar → Silikon kimi)
  if (!cat.parentId || !db.categories.some((c) => c.id === cat.parentId)) {
    return { ok: false, error: "Məhsul alt kateqoriyaya əlavə olunmalıdır. Kateqoriyalar bölməsində alt kateqoriya yaradın." };
  }

  const kind = productKind(db.categories, category);
  const badge = BADGES.some((b) => b.value === raw.badge && b.value !== "") ? (raw.badge as Badge) : undefined;

  const price = Number(raw.price);
  if (!Number.isFinite(price) || price <= 0 || price > 100000) return { ok: false, error: "Qiyməti düzgün yazın." };
  // Köhnə qiymət yalnız "Endirim" nişanı seçiləndə nəzərə alınır
  let oldPrice: number | undefined;
  if (badge === "sale" && raw.oldPrice !== null && raw.oldPrice !== "" && raw.oldPrice !== undefined) {
    oldPrice = Number(raw.oldPrice);
    if (!Number.isFinite(oldPrice) || oldPrice <= price) {
      return { ok: false, error: "Köhnə qiymət (endirimdən əvvəlki) cari qiymətdən böyük olmalıdır." };
    }
  }

  const colorsIn = Array.isArray(raw.colors) ? raw.colors : [];
  const colors: ProductColor[] = [];
  for (const c of colorsIn.slice(0, 20)) {
    const o = c as Record<string, unknown>;
    const cname = str(o.name, 40);
    const hex = str(o.hex, 7);
    const hex2 = str(o.hex2, 7);
    if (!cname || !HEX.test(hex)) return { ok: false, error: "Hər rəngin adı və düzgün rəng kodu olmalıdır." };
    if (hex2 && !HEX.test(hex2)) return { ok: false, error: "İkinci rəng kodu düzgün deyil." };
    colors.push(hex2 ? { name: cname, hex, hex2 } : { name: cname, hex });
  }
  if (colors.length === 0) return { ok: false, error: "Ən azı bir rəng əlavə edin." };

  const allModels = new Set(db.brands.flatMap((b) => b.models));
  const models = (Array.isArray(raw.models) ? raw.models : [])
    .filter((m): m is string => typeof m === "string" && allModels.has(m));

  const images = (Array.isArray(raw.images) ? raw.images : [])
    .filter((u): u is string => typeof u === "string" && IMAGE_URL.test(u))
    .slice(0, 10);

  const artIn = (raw.art ?? {}) as Record<string, unknown>;
  const art: Product["art"] = {};
  if (PATTERNS.some((p) => p.value === artIn.pattern)) art.pattern = artIn.pattern as Pattern;
  if (CAMERAS.some((p) => p.value === artIn.camera)) art.camera = artIn.camera as Camera;
  if (ACCESSORIES.some((p) => p.value === artIn.accessory)) art.accessory = artIn.accessory as AccessoryKind;
  if (artIn.magsafe === true) art.magsafe = true;

  const features = (Array.isArray(raw.features) ? raw.features : [])
    .map((f) => str(f, 80))
    .filter(Boolean)
    .slice(0, 12);

  // Səhifə linki addan avtomatik yaranır. Mövcud məhsulun linki dəyişmir (köhnə linklər işləməyə davam etsin).
  const taken = new Set(db.products.filter((p) => p.id !== existing?.id).map((p) => p.slug));
  const slug = existing?.slug ?? uniqueSlug(slugify(name), taken);

  const today = new Date().toISOString().slice(0, 10);
  const product: Product = {
    id: existing?.id ?? `p${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`,
    slug,
    name,
    short: str(raw.short, 200),
    description: str(raw.description, 2000),
    category,
    kind,
    price: Math.round(price * 100) / 100,
    ...(oldPrice ? { oldPrice: Math.round(oldPrice * 100) / 100 } : {}),
    ...(badge ? { badge } : {}),
    featured: raw.featured === true,
    active: raw.active !== false,
    fit: str(raw.fit, 60) || autoFit(models),
    models,
    colors,
    art,
    ...(images.length ? { images } : {}),
    features,
    createdAt: existing?.createdAt ?? today,
    updatedAt: today,
  };
  return { ok: true, product };
}
