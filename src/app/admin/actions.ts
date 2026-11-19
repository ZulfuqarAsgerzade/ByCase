"use server";

import { promises as fs } from "fs";
import path from "path";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  checkPassword,
  createSession,
  destroySession,
  loginLockedFor,
  recordLogin,
  requireAdmin,
} from "@/lib/auth";
import { childrenOf, productKind, topLevel } from "@/lib/categories";
import { mutateDB, UPLOAD_DIR } from "@/lib/store";
import { slugify, uniqueSlug } from "@/lib/slug";
import { parseProduct, type ProductInput } from "@/lib/validate";
import { formatPhone, normalizeWhatsapp } from "@/lib/whatsapp";
import type { Category, DB, Product } from "@/data/types";

/** `values` yalnız xəta olanda qaytarılır ki, istifadəçinin yazdıqları formadan silinməsin */
export type FormState = { error?: string; ok?: string; values?: Record<string, string> } | undefined;

/** Formadakı mətn sahələrini (React-in daxili sahələri istisna olmaqla) obyekt kimi qaytarır */
function formValues(formData: FormData) {
  const values: Record<string, string> = {};
  for (const [k, v] of formData.entries()) if (typeof v === "string" && !k.startsWith("$ACTION")) values[k] = v;
  return values;
}

/** İctimai saytın keşini təzələyir */
function refreshSite() {
  revalidatePath("/", "layout");
}

/**
 * Heç bir məhsulda istifadə olunmayan yüklənmiş şəkilləri diskdən silir.
 * Həm də formada yükləndiyi halda saxlanmamış (24 saatdan köhnə) şəkilləri süpürür.
 * (Müddət uzundur ki, formanı uzun açıq saxlayan adminin yüklədiyi şəkil başqa məhsul saxlananda silinməsin.)
 */
async function pruneUploads(db: DB, candidates: string[]) {
  const used = new Set(db.products.flatMap((p) => p.images ?? []));
  const remove = (file: string) => fs.unlink(path.join(UPLOAD_DIR, file)).catch(() => undefined);

  for (const url of candidates) {
    if (!used.has(url) && url.startsWith("/uploads/")) await remove(path.basename(url));
  }
  const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
  for (const file of await fs.readdir(UPLOAD_DIR).catch(() => [] as string[])) {
    if (used.has(`/uploads/${file}`)) continue;
    const stat = await fs.stat(path.join(UPLOAD_DIR, file)).catch(() => null);
    if (stat && stat.mtimeMs < dayAgo) await remove(file);
  }
}

/* ───────────── Giriş / çıxış ───────────── */

export async function loginAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const locked = await loginLockedFor();
  if (locked) return { error: `Çox sayda uğursuz cəhd. ${locked} dəqiqədən sonra yenidən yoxlayın.` };

  const ok = checkPassword(String(formData.get("password") ?? ""));
  await recordLogin(ok);
  if (!ok) return { error: "Parol səhvdir." };

  await createSession();
  redirect("/admin");
}

export async function logoutAction() {
  await destroySession();
  redirect("/admin/login");
}

/* ───────────── Məhsullar ───────────── */

export async function saveProductAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();

  let raw: ProductInput;
  try {
    raw = JSON.parse(String(formData.get("payload") ?? "{}"));
  } catch {
    return { error: "Məlumat oxunmadı. Səhifəni yeniləyib yenidən cəhd edin." };
  }
  const id = typeof raw.id === "string" ? raw.id : undefined;

  const result = await mutateDB(async (db) => {
    const existing = id ? db.products.find((p) => p.id === id) : undefined;
    if (id && !existing) return { ok: false as const, error: "Məhsul tapılmadı (silinmiş ola bilər)." };

    const parsed = parseProduct(raw, db, existing);
    if (!parsed.ok) return parsed;

    const removedImages = (existing?.images ?? []).filter((u) => !parsed.product.images?.includes(u));
    if (existing) db.products[db.products.indexOf(existing)] = parsed.product;
    else db.products.unshift(parsed.product);
    await pruneUploads(db, removedImages);
    return { ok: true as const };
  });

  if (!result.ok) return { error: result.error };
  refreshSite();
  redirect("/admin/mehsullar?saved=1");
}

export async function toggleProductAction(id: string, field: "active" | "featured") {
  await requireAdmin();
  await mutateDB((db) => {
    const p = db.products.find((x) => x.id === id);
    if (p) p[field] = !p[field];
  });
  refreshSite();
  revalidatePath("/admin", "layout");
}

export async function deleteProductAction(id: string) {
  await requireAdmin();
  await mutateDB(async (db) => {
    const p = db.products.find((x) => x.id === id);
    if (!p) return;
    db.products = db.products.filter((x) => x.id !== id);
    await pruneUploads(db, p.images ?? []);
  });
  refreshSite();
  revalidatePath("/admin", "layout");
}

/** Məhsulun surətini yaradır. Surət saytda gizli açılır, admin düzəliş edib özü aktiv edir. */
export async function duplicateProductAction(id: string) {
  await requireAdmin();
  const newId = await mutateDB((db) => {
    const src = db.products.find((x) => x.id === id);
    if (!src) return null;
    const today = new Date().toISOString().slice(0, 10);
    const name = `${src.name} (kopya)`.slice(0, 120);
    const copy: Product = {
      ...structuredClone(src),
      id: `p${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`,
      slug: uniqueSlug(slugify(name), new Set(db.products.map((p) => p.slug))),
      name,
      featured: false,
      active: false,
      createdAt: today,
      updatedAt: today,
    };
    db.products.unshift(copy);
    return copy.id;
  });
  if (!newId) return;
  refreshSite();
  revalidatePath("/admin", "layout");
  redirect(`/admin/mehsullar/${newId}`);
}

/* ───────────── Kateqoriyalar ───────────── */

export async function saveCategoryAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const name = String(formData.get("name") ?? "").trim().slice(0, 60);
  const blurb = String(formData.get("blurb") ?? "").trim().slice(0, 120);
  const parentId = String(formData.get("parentId") ?? "");
  const values = formValues(formData);
  if (name.length < 2) return { error: "Kateqoriyanın adını yazın.", values };

  const error = await mutateDB((db) => {
    let parent: (typeof db.categories)[number] | undefined;
    if (parentId) {
      parent = db.categories.find((c) => c.id === parentId);
      if (!parent) return "Üst kateqoriya tapılmadı.";
      if (parent.parentId) return "Alt kateqoriyanın içində başqa alt kateqoriya yaratmaq olmaz.";
    }
    const siblings = db.categories.filter((c) => (c.parentId ?? "") === parentId);
    if (siblings.some((c) => c.name.toLocaleLowerCase("az") === name.toLocaleLowerCase("az"))) {
      return `“${name}” adlı kateqoriya artıq var.`;
    }
    const base = slugify(name) || "kateqoriya";
    let id = base;
    for (let i = 2; db.categories.some((c) => c.id === id); i++) id = `${base}-${i}`;

    const created = { id, name, blurb, ...(parent ? { parentId: parent.id } : {}) };
    if (parent) {
      // Alt kateqoriya üst kateqoriyanın qrupunun sonuna düşür
      const last = db.categories.reduce((acc, c, i) => (c.id === parent!.id || c.parentId === parent!.id ? i : acc), -1);
      db.categories.splice(last + 1, 0, created);
    } else {
      db.categories.push(created);
    }
    return null;
  });
  if (error) return { error, values };
  refreshSite();
  revalidatePath("/admin", "layout");
  return { ok: parentId ? "Alt kateqoriya əlavə olundu." : "Kateqoriya əlavə olundu." };
}

/** Kateqoriyanın adını və qısa izahını dəyişir (id və link dəyişmir) */
export async function updateCategoryAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim().slice(0, 60);
  const blurb = String(formData.get("blurb") ?? "").trim().slice(0, 120);
  const values = formValues(formData);
  if (name.length < 2) return { error: "Kateqoriyanın adını yazın.", values };

  const error = await mutateDB((db) => {
    const cat = db.categories.find((c) => c.id === id);
    if (!cat) return "Kateqoriya tapılmadı.";
    const siblings = db.categories.filter((c) => c.id !== id && (c.parentId ?? "") === (cat.parentId ?? ""));
    if (siblings.some((c) => c.name.toLocaleLowerCase("az") === name.toLocaleLowerCase("az"))) {
      return `“${name}” adlı kateqoriya artıq var.`;
    }
    cat.name = name;
    cat.blurb = blurb;
    // Məhsulun növü (qab / aksesuar) əsas kateqoriyanın adından təyin olunur, ona görə yenidən hesablanır
    for (const p of db.products) p.kind = productKind(db.categories, p.category);
    return null;
  });
  if (error) return { error, values };
  refreshSite();
  revalidatePath("/admin", "layout");
  return { ok: "Yadda saxlanıldı." };
}

/**
 * Kateqoriyanı bir pillə yuxarı (-1) və ya aşağı (+1) çəkir.
 * Əsas kateqoriyalar alt kateqoriyaları ilə birlikdə yerini dəyişir, alt kateqoriyalar öz qardaşları arasında.
 */
export async function moveCategoryAction(id: string, dir: -1 | 1) {
  await requireAdmin();
  await mutateDB((db) => {
    const cat = db.categories.find((c) => c.id === id);
    if (!cat) return;
    const tops = topLevel(db.categories);
    const swap = <T,>(arr: T[], i: number) => {
      const j = i + dir;
      if (i < 0 || j < 0 || j >= arr.length) return false;
      [arr[i], arr[j]] = [arr[j], arr[i]];
      return true;
    };

    const isTop = tops.some((t) => t.id === id);
    const groups: Category[][] = tops.map((t) => [t, ...childrenOf(db.categories, t.id)]);
    if (isTop) {
      if (!swap(groups, groups.findIndex((g) => g[0].id === id))) return;
    } else {
      const group = groups.find((g) => g[0].id === cat.parentId);
      if (!group) return;
      const kids = group.slice(1);
      if (!swap(kids, kids.findIndex((c) => c.id === id))) return;
      group.splice(1, group.length - 1, ...kids);
    }
    db.categories = groups.flat();
  });
  refreshSite();
  revalidatePath("/admin", "layout");
}

/** Boş kateqoriyanı silir. Alt kateqoriyası və ya məhsulu olan kateqoriya silinmir. */
export async function deleteCategoryAction(id: string): Promise<FormState> {
  await requireAdmin();
  let next = "/admin/kateqoriyalar";
  const error = await mutateDB((db) => {
    const cat = db.categories.find((c) => c.id === id);
    if (!cat) return "Kateqoriya tapılmadı.";
    const subs = db.categories.filter((c) => c.parentId === id).length;
    if (subs > 0) return `Bu kateqoriyanın ${subs} alt kateqoriyası var. Əvvəlcə onları silin.`;
    const count = db.products.filter((p) => p.category === id).length;
    if (count > 0) return `Bu kateqoriyada ${count} məhsul var. Əvvəlcə onları başqa kateqoriyaya keçirin və ya silin.`;
    if (cat.parentId && db.categories.some((c) => c.id === cat.parentId)) next = `/admin/kateqoriyalar/${cat.parentId}`;
    db.categories = db.categories.filter((c) => c.id !== id);
    return null;
  });
  if (error) return { error };
  refreshSite();
  revalidatePath("/admin", "layout");
  redirect(next);
}

/* ───────────── Telefon modelləri ───────────── */

const sameName = (a: string, b: string) => a.toLocaleLowerCase("az") === b.toLocaleLowerCase("az");
const cleanName = (v: FormDataEntryValue | null, max: number) => String(v ?? "").trim().replace(/\s+/g, " ").slice(0, max);

/** Yeni brend yaradır (modellər brendin səhifəsində əlavə olunur) */
export async function saveBrandAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const name = cleanName(formData.get("name"), 40);
  const values = formValues(formData);
  if (name.length < 2) return { error: "Brendin adını yazın.", values };

  const error = await mutateDB((db) => {
    if (db.brands.some((b) => sameName(b.name, name))) return `“${name}” brendi artıq var.`;
    const base = slugify(name) || "brend";
    let id = base;
    for (let i = 2; db.brands.some((b) => b.id === id); i++) id = `${base}-${i}`;
    db.brands.push({ id, name, models: [] });
    return null;
  });
  if (error) return { error, values };
  refreshSite();
  revalidatePath("/admin", "layout");
  return { ok: "Brend əlavə olundu." };
}

/** Brendin adını dəyişir */
export async function updateBrandAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const name = cleanName(formData.get("name"), 40);
  const values = formValues(formData);
  if (name.length < 2) return { error: "Brendin adını yazın.", values };

  const error = await mutateDB((db) => {
    const brand = db.brands.find((b) => b.id === id);
    if (!brand) return "Brend tapılmadı.";
    if (db.brands.some((b) => b.id !== id && sameName(b.name, name))) return `“${name}” brendi artıq var.`;
    brand.name = name;
    return null;
  });
  if (error) return { error, values };
  refreshSite();
  revalidatePath("/admin", "layout");
  return { ok: "Yadda saxlanıldı." };
}

/** Brendi və onun bütün modellərini silir (modellər məhsullardan da çıxarılır) */
export async function deleteBrandAction(id: string): Promise<FormState> {
  await requireAdmin();
  const error = await mutateDB((db) => {
    const brand = db.brands.find((b) => b.id === id);
    if (!brand) return "Brend tapılmadı.";
    for (const p of db.products) p.models = p.models.filter((m) => !brand.models.includes(m));
    db.brands = db.brands.filter((b) => b.id !== id);
    return null;
  });
  if (error) return { error };
  refreshSite();
  revalidatePath("/admin", "layout");
  redirect("/admin/modeller");
}

export async function addModelAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const brandId = String(formData.get("brandId") ?? "");
  const name = cleanName(formData.get("name"), 40);
  const values = formValues(formData);
  if (name.length < 2) return { error: "Modelin adını yazın.", values };

  const error = await mutateDB((db) => {
    const brand = db.brands.find((b) => b.id === brandId);
    if (!brand) return "Brend tapılmadı.";
    if (db.brands.some((b) => b.models.some((m) => sameName(m, name)))) return `“${name}” modeli artıq siyahıdadır.`;
    brand.models.unshift(name); // yeni model siyahının əvvəlində
    return null;
  });
  if (error) return { error, values };
  refreshSite();
  revalidatePath("/admin", "layout");
  return { ok: "Model əlavə olundu." };
}

/** Modelin adını dəyişir. Bu modeli seçmiş bütün məhsullarda da yenilənir. */
export async function renameModelAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const brandId = String(formData.get("brandId") ?? "");
  const oldName = String(formData.get("oldName") ?? "");
  const name = cleanName(formData.get("name"), 40);
  const values = formValues(formData);
  if (name.length < 2) return { error: "Modelin adını yazın.", values };

  const error = await mutateDB((db) => {
    const brand = db.brands.find((b) => b.id === brandId);
    const at = brand ? brand.models.indexOf(oldName) : -1;
    if (!brand || at < 0) return "Model tapılmadı.";
    const taken = db.brands.some((b) => b.models.some((m) => m !== oldName && sameName(m, name)));
    if (taken) return `“${name}” modeli artıq siyahıdadır.`;
    brand.models[at] = name;
    for (const p of db.products) p.models = p.models.map((m) => (m === oldName ? name : m));
    return null;
  });
  if (error) return { error, values };
  refreshSite();
  revalidatePath("/admin", "layout");
  return { ok: "Yadda saxlanıldı." };
}

/** Modeli siyahıdan və onu seçmiş məhsullardan silir */
export async function deleteModelAction(brandId: string, model: string) {
  await requireAdmin();
  await mutateDB((db) => {
    const brand = db.brands.find((b) => b.id === brandId);
    if (!brand) return;
    brand.models = brand.models.filter((m) => m !== model);
    for (const p of db.products) p.models = p.models.filter((m) => m !== model);
  });
  refreshSite();
  revalidatePath("/admin", "layout");
}

/* ───────────── Ayarlar ───────────── */

export async function saveSettingsAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const field = (k: string, max: number) => String(formData.get(k) ?? "").trim().slice(0, max);
  // Xəta olanda yazılanlar geri qaytarılır, forma təmizlənib istifadəçinin işi itmir
  const values = formValues(formData);
  const fail = (error: string): FormState => ({ error, values });

  const whatsapp = normalizeWhatsapp(field("whatsapp", 30));
  if (!whatsapp) return fail("WhatsApp nömrəsi düzgün deyil. Nümunə: 055 418 07 16 və ya +994 55 418 07 16");
  const address = field("address", 160);
  const businessName = field("businessName", 80);
  const mapsLink = field("mapsLink", 300);
  if (mapsLink && !/^https:\/\/(www\.google\.[a-z.]+\/maps|maps\.google\.[a-z.]+|maps\.app\.goo\.gl|goo\.gl\/maps)/i.test(mapsLink)) {
    return fail("Google Maps linki düzgün deyil. Google Maps-dən “Paylaş” düyməsi ilə kopyalanmış link yazın.");
  }
  const hours = field("hours", 60);
  if (!address) return fail("Ünvanı yazın.");

  const instagram = [1, 2]
    .map((i) => ({
      handle: field(`ig${i}_handle`, 40).replace(/^@/, "").replace(/[^a-zA-Z0-9._]/g, ""),
      title: field(`ig${i}_title`, 40),
      desc: field(`ig${i}_desc`, 100),
    }))
    .filter((a) => a.handle);

  await mutateDB((db) => {
    db.settings = {
      whatsapp,
      phoneDisplay: formatPhone(whatsapp),
      address,
      businessName,
      mapsLink,
      hours,
      instagram: instagram.map((a) => ({ ...a, title: a.title || a.handle })),
    };
  });
  refreshSite();
  revalidatePath("/admin/ayarlar");
  return { ok: "Ayarlar yadda saxlanıldı." };
}
