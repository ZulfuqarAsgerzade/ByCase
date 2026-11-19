import type { MetadataRoute } from "next";
import { getProducts } from "@/lib/products";
import { siteUrl } from "@/lib/site";

// Məhsullar admin paneldən dəyişir, ona görə hər sorğuda təzə siyahı qurulur
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const products = await getProducts();
  return [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/mehsullar`, changeFrequency: "daily", priority: 0.9 },
    ...products.map((p) => ({
      url: `${base}/mehsullar/${p.slug}`,
      lastModified: p.updatedAt ?? p.createdAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
