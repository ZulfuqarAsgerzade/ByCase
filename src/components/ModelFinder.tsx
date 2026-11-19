"use client";

import Link from "next/link";
import { useState } from "react";
import type { PhoneBrand } from "@/data/types";

export function ModelFinder({ brands }: { brands: PhoneBrand[] }) {
  const [active, setActive] = useState(brands[0].id);
  const brand = brands.find((b) => b.id === active) ?? brands[0];

  return (
    <div className="rounded-[2rem] border border-brand-100 bg-white p-5 shadow-soft sm:p-8">
      {/* Brend çox olanda telefonda səhifəni genişləndirmir, üfüqi sürüşür */}
      <div role="tablist" aria-label="Telefon brendi" className="scrollbar-none flex w-fit max-w-full overflow-x-auto rounded-full bg-brand-50 p-1">
        {brands.map((b) => (
          <button
            key={b.id}
            role="tab"
            aria-selected={b.id === active}
            onClick={() => setActive(b.id)}
            className={`shrink-0 rounded-full px-5 py-2 text-sm font-bold whitespace-nowrap transition ${
              b.id === active ? "bg-brand-600 text-white shadow-soft" : "text-brand-700 hover:text-brand-900"
            }`}
          >
            {b.name}
          </button>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap gap-2.5" role="tabpanel">
        {brand.models.map((m) => (
          <Link
            key={m}
            href={`/mehsullar?model=${encodeURIComponent(m)}`}
            className="rounded-full border border-brand-200 bg-white px-4 py-2.5 text-sm font-semibold text-brand-800 transition hover:-translate-y-0.5 hover:border-brand-600 hover:bg-brand-600 hover:text-white"
          >
            {m}
          </Link>
        ))}
      </div>
    </div>
  );
}
