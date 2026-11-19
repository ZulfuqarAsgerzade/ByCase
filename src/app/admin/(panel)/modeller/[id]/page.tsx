import Link from "next/link";
import { notFound } from "next/navigation";
import { AddModelDialog, BrandTools, ModelRow } from "@/components/admin/BrandsManager";
import { PageHeader } from "@/components/admin/ui";
import { getDB } from "@/lib/store";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const b = (await getDB()).brands.find((x) => x.id === id);
  return { title: b?.name ?? "Brend" };
}

export default async function BrandModelsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = await getDB();
  const brand = db.brands.find((b) => b.id === id);
  if (!brand) notFound();

  const productCount = (model: string) => db.products.filter((p) => p.models.includes(model)).length;

  return (
    <>
      <Link href="/admin/modeller" className="mb-4 inline-flex items-center gap-1.5 text-sm font-bold text-brand-600 hover:text-brand-800">
        ← Bütün brendlər
      </Link>
      <PageHeader
        title={brand.name}
        text={`${brand.models.length} model`}
        action={
          <div className="flex flex-wrap items-start justify-end gap-2">
            <BrandTools brand={brand} />
            <AddModelDialog brandId={brand.id} brandName={brand.name} />
          </div>
        }
      />

      {brand.models.length === 0 ? (
        <p className="rounded-3xl border border-dashed border-brand-200 bg-white p-10 text-center text-sm font-semibold text-brand-600">
          Bu brendə hələ model əlavə olunmayıb.
        </p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {brand.models.map((m) => (
            <ModelRow key={m} brandId={brand.id} model={m} productCount={productCount(m)} />
          ))}
        </ul>
      )}
    </>
  );
}
