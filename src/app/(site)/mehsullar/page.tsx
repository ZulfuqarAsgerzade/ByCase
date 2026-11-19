import type { Metadata } from "next";
import { Catalog, type CatalogFilters } from "@/components/Catalog";
import { getCategories, getPhoneBrands, getProducts } from "@/lib/products";

export const metadata: Metadata = {
  title: "Məhsullar",
  description: "Telefon qabları və aksesuarlar — silikon, şəffaf, MagSafe, lüks və dizaynlı qablar.",
};

export default async function ProductsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";
  const sortRaw = one(sp.sirala);

  const initial: CatalogFilters = {
    q: one(sp.q),
    cat: one(sp.kateqoriya),
    model: one(sp.model),
    sort: sortRaw === "price-asc" || sortRaw === "price-desc" ? sortRaw : "new",
  };

  const [products, categories, brands] = await Promise.all([getProducts(), getCategories(), getPhoneBrands()]);

  return (
    <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 sm:pt-12 lg:px-8">
      <header className="mb-8 max-w-2xl">
        <p className="text-sm font-bold tracking-wide text-brand-500 uppercase">Kataloq</p>
        <h1 className="mt-2 text-3xl font-extrabold text-brand-900 sm:text-5xl">Bütün məhsullar</h1>
        <p className="mt-3 text-brand-700">
          Telefon modelini seçin, sizə uyğun qabları göstərək. Bəyəndiyiniz məhsulu WhatsApp-da bir kliklə sifariş edin.
        </p>
      </header>
      <Catalog products={products} categories={categories} brands={brands} initial={initial} />
    </div>
  );
}
