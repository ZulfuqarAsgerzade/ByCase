import type { Category } from "@/data/types";

/** Kateqoriyalar iki səviyyəlidir: əsas kateqoriya → alt kateqoriya */

export const isTopLevel = (cats: Category[], c: Category) => !c.parentId || !cats.some((x) => x.id === c.parentId);

export const topLevel = (cats: Category[]) => cats.filter((c) => isTopLevel(cats, c));

export const childrenOf = (cats: Category[], id: string) => cats.filter((c) => c.parentId === id);

/** Kateqoriyanın özü və bütün alt kateqoriyalarının id-ləri */
export const withDescendants = (cats: Category[], id: string) => [id, ...childrenOf(cats, id).map((c) => c.id)];

/** "Qablar › Silikon" */
export function categoryPath(cats: Category[], id: string) {
  const c = cats.find((x) => x.id === id);
  if (!c) return "—";
  const parent = c.parentId ? cats.find((x) => x.id === c.parentId) : undefined;
  return parent ? `${parent.name} › ${c.name}` : c.name;
}

/**
 * Məhsulun növü kateqoriyadan təyin olunur: əsas kateqoriyasının adı "Aksesuar..." ilə
 * başlayırsa aksesuar, qalan hallarda telefon qabı. (Növ yalnız şəkil olmayanda göstərilən
 * illüstrasiyanı və model seçimi izahını müəyyən edir.)
 */
export function productKind(cats: Category[], categoryId: string): "case" | "accessory" {
  const c = cats.find((x) => x.id === categoryId);
  const top = c?.parentId ? cats.find((x) => x.id === c.parentId) : c;
  return top && /^aksesuar/i.test(top.name) ? "accessory" : "case";
}
