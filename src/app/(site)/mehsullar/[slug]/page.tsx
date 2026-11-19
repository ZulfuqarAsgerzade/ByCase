import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/ProductCard";
import { ProductDetail } from "@/components/ProductDetail";
import { getCategories, getProduct, getProducts, getRelated, getSettings } from "@/lib/products";

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return {};
  return { title: product.name, description: product.short };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const [categories, related, settings] = await Promise.all([getCategories(), getRelated(product), getSettings()]);
  const category = categories.find((c) => c.id === product.category);
  const parentCategory = category?.parentId ? categories.find((c) => c.id === category.parentId) : undefined;

  return (
    <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 sm:pt-10 lg:px-8">
      <nav aria-label="Naviqasiya" className="mb-6 flex flex-wrap items-center gap-2 text-sm font-semibold text-brand-500">
        <Link href="/" className="hover:text-brand-700">Ana səhifə</Link>
        <span aria-hidden>/</span>
        <Link href="/mehsullar" className="hover:text-brand-700">Məhsullar</Link>
        {parentCategory && (
          <>
            <span aria-hidden>/</span>
            <Link href={`/mehsullar?kateqoriya=${parentCategory.id}`} className="hover:text-brand-700">
              {parentCategory.name}
            </Link>
          </>
        )}
        {category && (
          <>
            <span aria-hidden>/</span>
            <Link href={`/mehsullar?kateqoriya=${category.id}`} className="hover:text-brand-700">
              {category.name}
            </Link>
          </>
        )}
      </nav>

      <ProductDetail product={product} />

      {related.length > 0 && (
        <section className="mt-20" aria-labelledby="related">
          <h2 id="related" className="text-2xl font-extrabold text-brand-900 sm:text-3xl">
            Bunlar da xoşunuza gələ bilər
          </h2>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} whatsapp={settings.whatsapp} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
