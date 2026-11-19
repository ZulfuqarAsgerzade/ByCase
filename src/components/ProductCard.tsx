import Link from "next/link";
import { ProductArt } from "./ProductArt";
import { WhatsAppIcon } from "./icons";
import { formatPrice } from "@/lib/format";
import { productMessage, waLink } from "@/lib/whatsapp";
import type { Product } from "@/data/types";

const badgeStyle: Record<NonNullable<Product["badge"]>, { label: string; cls: string }> = {
  new: { label: "Yeni", cls: "bg-brand-600 text-white" },
  bestseller: { label: "Çox satılan", cls: "bg-coral text-white" },
  sale: { label: "Endirim", cls: "bg-wa-dark text-white" },
};

export function ProductCard({ product, whatsapp }: { product: Product; whatsapp: string }) {
  const badge = product.badge ? badgeStyle[product.badge] : null;
  const msg = productMessage({
    name: product.name,
    price: product.price,
    url: process.env.NEXT_PUBLIC_SITE_URL
      ? `${process.env.NEXT_PUBLIC_SITE_URL}/mehsullar/${product.slug}`
      : undefined,
  });

  return (
    <article className="group flex flex-col overflow-hidden rounded-3xl border border-brand-100 bg-white shadow-soft transition duration-300 hover:-translate-y-1 hover:shadow-lift">
      <Link href={`/mehsullar/${product.slug}`} className="flex flex-1 flex-col" aria-label={product.name}>
        <div className="relative aspect-[4/5] overflow-hidden bg-gradient-to-b from-brand-50 to-sage-100">
          <div className="absolute inset-x-0 bottom-0 h-1/2 rounded-t-[50%] bg-sage-200/60" />
          {badge && (
            <span className={`absolute top-3 left-3 z-10 rounded-full px-3 py-1 text-xs font-bold ${badge.cls}`}>
              {badge.label}
            </span>
          )}
          <ProductArt
            product={product}
            className="absolute inset-0 p-6 pb-7 transition duration-500 group-hover:scale-105 [&_svg]:max-h-full"
          />
        </div>

        <div className="flex flex-1 flex-col gap-1.5 p-4">
          <p className="text-xs font-semibold text-brand-500">{product.fit}</p>
          <h3 className="text-[0.95rem] leading-snug font-bold text-brand-900">{product.name}</h3>
          <div className="mt-auto flex items-end justify-between gap-2 pt-2">
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-extrabold text-brand-700">{formatPrice(product.price)}</span>
              {product.oldPrice && (
                <span className="text-sm text-brand-400 line-through">{formatPrice(product.oldPrice)}</span>
              )}
            </div>
            <div className="flex -space-x-1.5" aria-label={`${product.colors.length} rəng`}>
              {product.colors.slice(0, 4).map((c) => (
                <span
                  key={c.name}
                  title={c.name}
                  className="h-5 w-5 rounded-full border-2 border-white shadow-sm"
                  style={{ background: c.hex2 ? `linear-gradient(135deg, ${c.hex} 50%, ${c.hex2} 50%)` : c.hex }}
                />
              ))}
              {product.colors.length > 4 && (
                <span className="grid h-5 min-w-5 place-items-center rounded-full border-2 border-white bg-brand-100 px-1 text-[10px] font-bold text-brand-700">
                  +{product.colors.length - 4}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>

      <div className="px-4 pb-4">
        <WhatsAppButton number={whatsapp} message={msg} productName={product.name} />
      </div>
    </article>
  );
}

function WhatsAppButton({ number, message, productName }: { number: string; message: string; productName: string }) {
  return (
    <a
      href={waLink(number, message)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${productName} — WhatsApp-da sifariş et`}
      className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-wa/10 py-2.5 text-sm font-bold text-wa-dark transition hover:bg-wa hover:text-white"
    >
      <WhatsAppIcon width={18} height={18} />
      Sifariş et
    </a>
  );
}
