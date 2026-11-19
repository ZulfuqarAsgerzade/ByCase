import Link from "next/link";
import { notFound } from "next/navigation";
import { AddCategoryDialog, CategoriesList, CategoryTools } from "@/components/admin/CategoriesManager";
import { PageHeader, linkBtn } from "@/components/admin/ui";
import { ProductsTable } from "@/components/admin/ProductsTable";
import { childrenOf } from "@/lib/categories";
import { getDB } from "@/lib/store";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const c = (await getDB()).categories.find((x) => x.id === id);
  return { title: c?.name ?? "Kateqoriya" };
}

export default async function CategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = await getDB();
  const category = db.categories.find((c) => c.id === id);
  if (!category) notFound();

  const parent = category.parentId ? db.categories.find((c) => c.id === category.parentId) : undefined;
  const isTop = !parent;
  const subs = childrenOf(db.categories, category.id);
  const products = db.products.filter((p) => p.category === category.id);

  const subCounts: Record<string, number> = {};
  for (const s of subs) subCounts[s.id] = db.products.filter((p) => p.category === s.id).length;

  const info = [category.blurb, isTop ? `${subs.length} alt kateqoriya` : `${products.length} məhsul`]
    .filter(Boolean)
    .join(" · ");

  return (
    <>
      <Link
        href={parent ? `/admin/kateqoriyalar/${parent.id}` : "/admin/kateqoriyalar"}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-bold text-brand-600 hover:text-brand-800"
      >
        ← {parent ? parent.name : "Bütün kateqoriyalar"}
      </Link>
      <PageHeader
        title={category.name}
        text={info}
        action={
          <div className="flex flex-wrap items-start justify-end gap-2">
            <CategoryTools category={category} hasContent={subs.length > 0 || products.length > 0} />
            {isTop ? (
              <AddCategoryDialog parent={{ id: category.id, name: category.name }} />
            ) : (
              <Link href={`/admin/mehsullar/yeni?kateqoriya=${category.id}`} className={linkBtn("primary")}>
                + Məhsul əlavə et
              </Link>
            )}
          </div>
        }
      />

      {isTop && (
        <section>
          <h2 className="mb-4 text-lg font-extrabold text-brand-900">Alt kateqoriyalar</h2>
          <CategoriesList
            categories={subs}
            counts={subCounts}
            empty="Hələ alt kateqoriya yoxdur. Məhsul əlavə etmək üçün əvvəlcə yuxarıdakı düymə ilə alt kateqoriya yaradın."
          />
        </section>
      )}

      {/* Əsas kateqoriyada birbaşa məhsul olmamalıdır. Əgər varsa (köhnə məlumat), xəbərdarlıqla göstərilir. */}
      {isTop && products.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-1 text-lg font-extrabold text-brand-900">Alt kateqoriyasız məhsullar</h2>
          <p className="mb-4 text-sm text-brand-600">
            Məhsullar alt kateqoriyada olmalıdır. Hər məhsulu açıb alt kateqoriya seçin.
          </p>
          <ProductsTable products={products} categories={db.categories} fixedCategory />
        </section>
      )}

      {!isTop &&
        (products.length === 0 ? (
          <p className="rounded-3xl border border-dashed border-brand-200 bg-white p-10 text-center text-sm font-semibold text-brand-600">
            Bu kateqoriyada hələ məhsul yoxdur.
          </p>
        ) : (
          <ProductsTable products={products} categories={db.categories} fixedCategory />
        ))}
    </>
  );
}
