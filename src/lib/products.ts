/**
 * Saytın ictimai tərəfi üçün məlumat qatı. Hamısı data/db.json-dan (src/lib/store.ts) oxuyur
 * və yalnız aktiv (gizlədilməmiş) məhsulları qaytarır.
 */
import "server-only";
import type { Category, PhoneBrand, Product, Settings } from "@/data/types";
import { getDB } from "./store";

export async function getProducts(): Promise<Product[]> {
  const db = await getDB();
  return db.products.filter((p) => p.active);
}

export async function getProduct(slug: string): Promise<Product | undefined> {
  return (await getProducts()).find((p) => p.slug === slug);
}

export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  const list = await getProducts();
  const picked = list.filter((p) => p.featured || p.badge === "bestseller");
  // Seçilmişlər azdırsa, qalan yerləri ən yeni məhsullarla doldur
  if (picked.length < limit) {
    const rest = [...list]
      .filter((p) => !picked.includes(p))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    picked.push(...rest.slice(0, limit - picked.length));
  }
  return picked.slice(0, limit);
}

export async function getNewProducts(limit = 4): Promise<Product[]> {
  return [...(await getProducts())].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, limit);
}

export async function getRelated(product: Product, limit = 4): Promise<Product[]> {
  const list = (await getProducts()).filter((p) => p.id !== product.id);
  return [...list.filter((p) => p.category === product.category), ...list.filter((p) => p.category !== product.category)].slice(
    0,
    limit,
  );
}

export async function getCategories(): Promise<Category[]> {
  return (await getDB()).categories;
}

export async function getPhoneBrands(): Promise<PhoneBrand[]> {
  return (await getDB()).brands.filter((b) => b.models.length > 0);
}

export async function getSettings(): Promise<Settings> {
  return (await getDB()).settings;
}
