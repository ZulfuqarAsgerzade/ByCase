import Link from "next/link";
import { Notice, PageHeader, linkBtn } from "@/components/admin/ui";
import { ProductsTable } from "@/components/admin/ProductsTable";
import { getDB } from "@/lib/store";

export const metadata = { title: "Məhsullar" };

export default async function AdminProductsPage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const [db, sp] = await Promise.all([getDB(), searchParams]);
  return (
    <>
      <PageHeader
        title="Məhsullar"
        text={`${db.products.length} məhsul`}
        action={
          <Link href="/admin/mehsullar/yeni" className={linkBtn("primary")}>
            + Yeni məhsul
          </Link>
        }
      />
      {sp.saved && (
        <div className="mb-4">
          <Notice kind="ok">Məhsul yadda saxlanıldı və saytda yeniləndi.</Notice>
        </div>
      )}
      <ProductsTable products={db.products} categories={db.categories} />
    </>
  );
}
