import { PageHeader } from "@/components/admin/ui";
import { ProductForm } from "@/components/admin/ProductForm";
import { getDB } from "@/lib/store";

export const metadata = { title: "Yeni məhsul" };

export default async function NewProductPage({ searchParams }: { searchParams: Promise<{ kateqoriya?: string }> }) {
  const [db, sp] = await Promise.all([getDB(), searchParams]);
  return (
    <>
      <PageHeader title="Yeni məhsul" text="Məlumatları doldurun, “Məhsulu əlavə et” düyməsinə basın — məhsul dərhal saytda görünəcək." />
      <ProductForm categories={db.categories} brands={db.brands} defaultCategory={sp.kateqoriya} />
    </>
  );
}
