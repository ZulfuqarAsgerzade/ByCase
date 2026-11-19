"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { deleteProductAction, duplicateProductAction, toggleProductAction } from "@/app/admin/actions";
import type { Category, Product } from "@/data/types";
import { categoryPath, childrenOf, topLevel, withDescendants } from "@/lib/categories";
import { formatPrice } from "@/lib/format";
import { ProductArt } from "../ProductArt";
import { SearchIcon } from "../icons";
import { Button, Select, Toggle, inputCls, linkBtn } from "./ui";

export function ProductsTable({
  products,
  categories,
  fixedCategory = false,
  scopeId,
}: {
  products: Product[];
  /** Bütün kateqoriyalar (üst-alt əlaqəsi və adları üçün) */
  categories: Category[];
  /** true olanda kateqoriya filtri göstərilmir (siyahı artıq bir kateqoriyaya aiddir) */
  fixedCategory?: boolean;
  /** Verilsə, filtr yalnız bu kateqoriyanın alt kateqoriyalarını təklif edir */
  scopeId?: string;
}) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [status, setStatus] = useState("");
  const [pending, start] = useTransition();

  const catName = (id: string) => categoryPath(categories, id);

  const options = useMemo(() => {
    if (scopeId) return childrenOf(categories, scopeId).map((c) => ({ value: c.id, label: c.name }));
    return topLevel(categories).flatMap((t) => {
      const kids = childrenOf(categories, t.id);
      if (kids.length === 0) return [{ value: t.id, label: t.name }];
      return [
        { value: t.id, label: `${t.name} (hamısı)` },
        ...kids.map((k) => ({ value: k.id, label: `${t.name} › ${k.name}` })),
      ];
    });
  }, [categories, scopeId]);
  const showCategoryFilter = !fixedCategory && options.length > 0;

  const list = useMemo(() => {
    const needle = q.trim().toLocaleLowerCase("az");
    return products.filter((p) => {
      if (cat && !withDescendants(categories, cat).includes(p.category)) return false;
      if (status === "active" && !p.active) return false;
      if (status === "hidden" && p.active) return false;
      if (needle && !`${p.name} ${p.slug}`.toLocaleLowerCase("az").includes(needle)) return false;
      return true;
    });
  }, [products, categories, q, cat, status]);

  function remove(p: Product) {
    if (window.confirm(`“${p.name}” silinsin? Bu əməliyyat geri qaytarılmır.`)) {
      start(() => deleteProductAction(p.id));
    }
  }

  return (
    <div>
      <div className={`mb-4 grid gap-3 ${showCategoryFilter ? "sm:grid-cols-[1fr_14rem_10rem]" : "sm:grid-cols-[1fr_10rem]"}`}>
        <label className="relative">
          <span className="sr-only">Axtar</span>
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3.5 h-5 w-5 -translate-y-1/2 text-brand-400" />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Məhsul axtar…"
            className={`${inputCls} h-11 pl-11`}
          />
        </label>
        {showCategoryFilter && (
          <Select value={cat} onChange={(e) => setCat(e.target.value)} aria-label="Kateqoriya">
            <option value="">Bütün kateqoriyalar</option>
            {options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        )}
        <Select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Status">
          <option value="">Hamısı</option>
          <option value="active">Saytda görünən</option>
          <option value="hidden">Gizli</option>
        </Select>
      </div>

      {list.length === 0 ? (
        <p className="rounded-3xl border border-dashed border-brand-200 bg-white p-10 text-center text-sm font-semibold text-brand-600">
          Məhsul tapılmadı.
        </p>
      ) : (
        <ul className={`space-y-3 ${pending ? "opacity-60" : ""}`} aria-busy={pending}>
          {list.map((p) => (
            <li
              key={p.id}
              className="flex flex-wrap items-center gap-x-4 gap-y-3 rounded-3xl border border-brand-100 bg-white p-4 shadow-soft"
            >
              <Link href={`/admin/mehsullar/${p.id}`} className="flex min-w-0 flex-1 basis-64 items-center gap-4">
                <span className="relative grid h-16 w-14 shrink-0 place-items-center overflow-hidden rounded-2xl bg-gradient-to-b from-brand-50 to-sage-100">
                  <ProductArt product={p} className="relative h-14 w-11 [&_svg]:h-full" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-extrabold text-brand-900">{p.name}</span>
                  <span className="block truncate text-xs font-semibold text-brand-500">
                    {catName(p.category)} · {p.fit || "—"}
                  </span>
                  <span className="mt-1 flex items-center gap-2 text-sm">
                    <b className="text-brand-700">{formatPrice(p.price)}</b>
                    {p.oldPrice && <s className="text-brand-400">{formatPrice(p.oldPrice)}</s>}
                  </span>
                </span>
              </Link>

              <div className="flex items-center gap-5">
                <label className="flex items-center gap-2 text-xs font-bold text-brand-700">
                  Saytda
                  <Toggle
                    checked={p.active}
                    label={`${p.name}: saytda göstər`}
                    onChange={() => start(() => toggleProductAction(p.id, "active"))}
                  />
                </label>
                <label className="flex items-center gap-2 text-xs font-bold text-brand-700">
                  Seçilmiş
                  <Toggle
                    checked={!!p.featured}
                    label={`${p.name}: ana səhifədə seçilmiş`}
                    onChange={() => start(() => toggleProductAction(p.id, "featured"))}
                  />
                </label>
              </div>

              <div className="flex flex-wrap gap-2">
                <Link href={`/admin/mehsullar/${p.id}`} className={linkBtn("primary", "sm")}>
                  Düzəliş
                </Link>
                {p.active && (
                  <a href={`/mehsullar/${p.slug}`} target="_blank" rel="noopener noreferrer" className={linkBtn("secondary", "sm")}>
                    Saytda bax ↗
                  </a>
                )}
                <Button variant="secondary" size="sm" onClick={() => start(() => duplicateProductAction(p.id))}>
                  Kopyala
                </Button>
                <Button variant="danger" size="sm" onClick={() => remove(p)}>
                  Sil
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
