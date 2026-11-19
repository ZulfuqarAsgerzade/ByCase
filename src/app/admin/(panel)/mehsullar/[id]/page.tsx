import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/ui";
import { ProductForm } from "@/components/admin/ProductForm";
import { getDB } from "@/lib/store";

export const metadata = { title: "Məhsula düzəliş" };

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = await getDB();
  const product = db.products.find((p) => p.id === id);
  if (!product) notFound();

  return (
    <>
      <PageHeader title={product.name} text="Məhsula düzəliş" />
      <ProductForm key={product.id} product={product} categories={db.categories} brands={db.brands} />
    </>
  );
}
