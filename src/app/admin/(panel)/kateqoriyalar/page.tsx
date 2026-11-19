import { AddCategoryDialog, CategoriesList } from "@/components/admin/CategoriesManager";
import { PageHeader } from "@/components/admin/ui";
import { childrenOf, topLevel, withDescendants } from "@/lib/categories";
import { getDB } from "@/lib/store";

export const metadata = { title: "Kateqoriyalar" };

export default async function CategoriesPage() {
  const db = await getDB();
  const tops = topLevel(db.categories);

  // Əsas kateqoriyanın məhsul sayına alt kateqoriyalarındakılar da daxildir
  const counts: Record<string, number> = {};
  const subCounts: Record<string, number> = {};
  for (const c of tops) {
    const ids = withDescendants(db.categories, c.id);
    counts[c.id] = db.products.filter((p) => ids.includes(p.category)).length;
    subCounts[c.id] = childrenOf(db.categories, c.id).length;
  }
  const totalSubs = db.categories.length - tops.length;

  return (
    <>
      <PageHeader
        title="Kateqoriyalar"
        text={`${tops.length} kateqoriya${totalSubs ? ` · ${totalSubs} alt kateqoriya` : ""}`}
        action={<AddCategoryDialog />}
      />
      <CategoriesList categories={tops} counts={counts} subCounts={subCounts} />
    </>
  );
}
