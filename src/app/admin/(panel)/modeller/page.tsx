import { AddBrandDialog, BrandsList } from "@/components/admin/BrandsManager";
import { PageHeader } from "@/components/admin/ui";
import { getDB } from "@/lib/store";

export const metadata = { title: "Telefon modelləri" };

export default async function ModelsPage() {
  const db = await getDB();
  // Brendə aid məhsul = ən azı bir modeli həmin brendin modelləri arasında olan məhsul
  const counts: Record<string, number> = {};
  for (const b of db.brands) {
    counts[b.id] = db.products.filter((p) => p.models.some((m) => b.models.includes(m))).length;
  }

  return (
    <>
      <PageHeader
        title="Telefon modelləri"
        text={`${db.brands.length} brend`}
        action={<AddBrandDialog />}
      />
      <BrandsList brands={db.brands} counts={counts} />
    </>
  );
}
