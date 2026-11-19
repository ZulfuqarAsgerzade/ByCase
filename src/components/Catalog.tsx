"use client";

import { useMemo, useState } from "react";
import { ProductCard } from "./ProductCard";
import { SearchIcon, WhatsAppIcon, ChevronDownIcon } from "./icons";
import { childrenOf, isTopLevel, topLevel, withDescendants } from "@/lib/categories";
import { generalMessage, waLink } from "@/lib/whatsapp";
import { useSettings } from "./SettingsProvider";
import type { Category, PhoneBrand, Product } from "@/data/types";

type Sort = "new" | "price-asc" | "price-desc";

export type CatalogFilters = {
  q: string;
  cat: string;
  model: string;
  sort: Sort;
};

const sortLabels: Record<Sort, string> = {
  new: "Ən yenilər",
  "price-asc": "Qiymət: ucuzdan bahaya",
  "price-desc": "Qiymət: bahadan ucuza",
};

export function Catalog({
  products,
  categories,
  brands,
  initial,
}: {
  products: Product[];
  categories: Category[];
  brands: PhoneBrand[];
  initial: CatalogFilters;
}) {
  const { whatsapp } = useSettings();
  const [f, setF] = useState<CatalogFilters>(initial);

  function update(patch: Partial<CatalogFilters>) {
    const next = { ...f, ...patch };
    setF(next);
    const sp = new URLSearchParams();
    if (next.q) sp.set("q", next.q);
    if (next.cat) sp.set("kateqoriya", next.cat);
    if (next.model) sp.set("model", next.model);
    if (next.sort !== "new") sp.set("sirala", next.sort);
    const qs = sp.toString();
    window.history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname);
  }

  const results = useMemo(() => {
    const q = f.q.trim().toLocaleLowerCase("az");
    let list = products.filter((p) => {
      if (f.cat && !withDescendants(categories, f.cat).includes(p.category)) return false;
      if (f.model && !(p.models.includes(f.model) || p.models.length === 0)) return false;
      if (q) {
        const hay = `${p.name} ${p.short} ${p.fit} ${p.models.join(" ")}`.toLocaleLowerCase("az");
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    list = [...list];
    if (f.sort === "price-asc") list.sort((a, b) => a.price - b.price);
    else if (f.sort === "price-desc") list.sort((a, b) => b.price - a.price);
    else list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return list;
  }, [products, categories, f]);

  const hasFilters = !!(f.q || f.cat || f.model);
  const catCount = (id: string) => {
    const ids = withDescendants(categories, id);
    return products.filter((p) => ids.includes(p.category)).length;
  };

  // Seçilmiş kateqoriyanın əsas (üst) kateqoriyası və onun alt kateqoriyaları
  const selected = categories.find((c) => c.id === f.cat);
  const activeTop = selected ? (isTopLevel(categories, selected) ? selected.id : selected.parentId!) : "";
  // Boş kateqoriyalar müştəriyə göstərilmir (seçilmiş olanlar istisna)
  const visible = (id: string) => catCount(id) > 0 || f.cat === id;
  const subs = activeTop ? childrenOf(categories, activeTop).filter((c) => visible(c.id)) : [];

  return (
    <div>
      {/* Axtarış + sıralama */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <label className="relative flex-1">
          <span className="sr-only">Məhsul axtar</span>
          <SearchIcon className="pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-brand-400" />
          <input
            type="search"
            value={f.q}
            onChange={(e) => update({ q: e.target.value })}
            placeholder="Məhsul axtar… (məs. silikon, iPhone 17)"
            className="h-12 w-full rounded-2xl border border-brand-200 bg-white pr-4 pl-12 text-[0.95rem] font-medium text-brand-900 shadow-soft transition outline-none placeholder:text-brand-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
          />
        </label>

        <Select
          label="Telefon modeli"
          value={f.model}
          onChange={(v) => update({ model: v })}
          className="sm:w-60"
        >
          <option value="">Bütün modellər</option>
          {brands.map((b) => (
            <optgroup key={b.id} label={b.name}>
              {b.models.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </optgroup>
          ))}
        </Select>

        <Select label="Sırala" value={f.sort} onChange={(v) => update({ sort: v as Sort })} className="sm:w-56">
          {Object.entries(sortLabels).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </Select>
      </div>

      {/* Kateqoriyalar */}
      <div className="scrollbar-none -mx-4 mt-5 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0" role="group" aria-label="Kateqoriyalar">
        <Chip active={!f.cat} onClick={() => update({ cat: "" })}>
          Hamısı <span className="opacity-60">{products.length}</span>
        </Chip>
        {topLevel(categories).filter((c) => visible(c.id) || activeTop === c.id).map((c) => (
          <Chip key={c.id} active={activeTop === c.id} onClick={() => update({ cat: f.cat === c.id ? "" : c.id })}>
            {c.name} <span className="opacity-60">{catCount(c.id)}</span>
          </Chip>
        ))}
      </div>

      {/* Alt kateqoriyalar */}
      {subs.length > 0 && (
        <div className="scrollbar-none -mx-4 mt-2.5 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0" role="group" aria-label="Alt kateqoriyalar">
          <Chip sub active={f.cat === activeTop} onClick={() => update({ cat: activeTop })}>
            Hamısı
          </Chip>
          {subs.map((c) => (
            <Chip sub key={c.id} active={f.cat === c.id} onClick={() => update({ cat: f.cat === c.id ? activeTop : c.id })}>
              {c.name} <span className="opacity-60">{catCount(c.id)}</span>
            </Chip>
          ))}
        </div>
      )}

      {/* Nəticə sayı */}
      <div className="mt-6 flex items-center justify-between gap-4 text-sm">
        <p className="font-semibold text-brand-700" aria-live="polite">
          {results.length} məhsul tapıldı
          {f.model && <span className="font-medium text-brand-500"> · {f.model}</span>}
        </p>
        {hasFilters && (
          <button
            onClick={() => update({ q: "", cat: "", model: "" })}
            className="font-bold text-brand-600 underline-offset-4 hover:underline"
          >
            Filtrləri təmizlə
          </button>
        )}
      </div>

      {results.length > 0 ? (
        <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
          {results.map((p) => (
            <ProductCard key={p.id} product={p} whatsapp={whatsapp} />
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-[2rem] border border-dashed border-brand-200 bg-white px-6 py-16 text-center">
          <p className="text-lg font-bold text-brand-900">Axtardığınız məhsulu tapa bilmədik</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-brand-600">
            Bəlkə mağazada var, sadəcə saytda hələ yoxdur. Bizə yazın, kömək edək.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href={waLink(
                whatsapp,
                f.model ? `Salam! ${f.model} üçün qab axtarıram. Mövcuddur?` : generalMessage,
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-2xl bg-wa px-6 py-3 text-sm font-bold text-white transition hover:bg-wa-dark"
            >
              <WhatsAppIcon width={18} height={18} /> WhatsApp-da soruş
            </a>
            <button
              onClick={() => update({ q: "", cat: "", model: "" })}
              className="rounded-2xl bg-brand-50 px-6 py-3 text-sm font-bold text-brand-700 transition hover:bg-brand-100"
            >
              Filtrləri təmizlə
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Chip({
  active,
  onClick,
  sub = false,
  children,
}: {
  active: boolean;
  onClick: () => void;
  /** Alt kateqoriya düyməsi (daha kiçik və yumşaq) */
  sub?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`shrink-0 rounded-full border font-bold whitespace-nowrap transition ${
        sub ? "px-3.5 py-1.5 text-xs" : "px-4 py-2 text-sm"
      } ${
        active
          ? sub
            ? "border-brand-300 bg-brand-100 text-brand-800"
            : "border-brand-600 bg-brand-600 text-white shadow-soft"
          : sub
            ? "border-transparent bg-white text-brand-700 hover:bg-brand-50"
            : "border-brand-200 bg-white text-brand-800 hover:border-brand-400"
      }`}
    >
      {children}
    </button>
  );
}

function Select({
  label,
  value,
  onChange,
  className = "",
  children,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={`relative block ${className}`}>
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-12 w-full appearance-none rounded-2xl border border-brand-200 bg-white pr-10 pl-4 text-[0.95rem] font-semibold text-brand-900 shadow-soft transition outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
      >
        {children}
      </select>
      <ChevronDownIcon className="pointer-events-none absolute top-1/2 right-3.5 h-5 w-5 -translate-y-1/2 text-brand-500" />
    </label>
  );
}
