import Link from "next/link";
import { PageHeader } from "@/components/admin/ui";
import { adminSections } from "@/components/admin/nav";
import { topLevel } from "@/lib/categories";
import { getDB } from "@/lib/store";

export const metadata = { title: "İdarə paneli" };

type Stat = { label: string; value: string | number };

/** Mətn dəyərləri olan bölmələr kiçik qutular əvəzinə "ad — dəyər" sətirləri ilə göstərilir */
const rowSections = new Set(["/admin/ayarlar"]);

export default async function DashboardPage() {
  const db = await getDB();

  const active = db.products.filter((p) => p.active);
  const top = [
    { label: "Cəmi məhsul", value: db.products.length },
    { label: "Saytda görünən", value: active.length },
    { label: "Gizli", value: db.products.length - active.length },
    { label: "Seçilmiş (ana səhifə)", value: db.products.filter((p) => p.featured).length },
  ];

  // ── Bölməyə xas statistikalar ──
  const tops = topLevel(db.categories);
  const leaves = db.categories.filter((c) => !db.categories.some((x) => x.parentId === c.id));
  const emptyLeaves = leaves.filter((c) => !db.products.some((p) => p.category === c.id)).length;
  const allModels = db.brands.flatMap((b) => b.models);
  const modelsWithoutProducts = allModels.filter((m) => !db.products.some((p) => p.models.includes(m))).length;

  const stats: Record<string, Stat[]> = {
    "/admin/mehsullar": [
      { label: "Qab", value: db.products.filter((p) => p.kind === "case").length },
      { label: "Aksesuar", value: db.products.filter((p) => p.kind === "accessory").length },
      { label: "Endirimdə", value: db.products.filter((p) => p.oldPrice).length },
    ],
    "/admin/kateqoriyalar": [
      { label: "Kateqoriya", value: tops.length },
      { label: "Alt kateqoriya", value: db.categories.length - tops.length },
      { label: "Boş kateqoriya", value: emptyLeaves },
    ],
    "/admin/modeller": [
      { label: "Brend", value: db.brands.length },
      { label: "Model", value: allModels.length },
      { label: "Məhsulsuz model", value: modelsWithoutProducts },
    ],
    "/admin/ayarlar": [
      { label: "WhatsApp", value: db.settings.phoneDisplay },
      { label: "İş saatları", value: db.settings.hours || "—" },
      { label: "Instagram", value: `${db.settings.instagram.length} hesab` },
    ],
  };

  return (
    <>
      <PageHeader
        title="Xoş gəldiniz 👋"
        text="Saytdakı məhsulları, kateqoriyaları və mağaza məlumatlarını buradan idarə edin."
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {top.map((s) => (
          <div key={s.label} className="rounded-3xl border border-brand-100 bg-white p-5 shadow-soft">
            <p className="text-3xl font-extrabold text-brand-700">{s.value}</p>
            <p className="mt-1 text-sm font-semibold text-brand-600">{s.label}</p>
          </div>
        ))}
      </div>

      <h2 className="mt-10 mb-4 text-lg font-extrabold text-brand-900">Bölmələr</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {adminSections.map((s) => (
          <section key={s.href} className="flex flex-col rounded-3xl border border-brand-100 bg-white p-5 shadow-soft sm:p-6">
            <div className="flex items-start gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand-600">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d={s.icon} />
                </svg>
              </span>
              <div className="min-w-0">
                <h3 className="text-lg font-extrabold text-brand-900">{s.label}</h3>
                <p className="mt-0.5 text-sm leading-snug text-brand-600">{s.about}</p>
              </div>
            </div>

            {rowSections.has(s.href) ? (
              <ul className="mt-5 flex-1 divide-y divide-brand-100 rounded-2xl bg-brand-50/70 px-4">
                {stats[s.href].map((st) => (
                  <li key={st.label} className="flex items-center justify-between gap-4 py-3 text-sm">
                    <span className="font-semibold text-brand-500">{st.label}</span>
                    <span className="text-right font-extrabold text-brand-800">{st.value}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="mt-5 grid flex-1 grid-cols-3 gap-2.5">
                {stats[s.href].map((st) => (
                  <div key={st.label} className="min-w-0 rounded-2xl bg-brand-50/70 px-3.5 py-3">
                    <p className="text-lg font-extrabold text-brand-800">{st.value}</p>
                    <p className="mt-0.5 text-xs leading-snug font-semibold text-brand-500">{st.label}</p>
                  </div>
                ))}
              </div>
            )}

            <Link
              href={s.href}
              className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 text-sm font-bold text-white shadow-soft transition hover:bg-brand-700"
            >
              Ətraflı <span aria-hidden>→</span>
            </Link>
          </section>
        ))}
      </div>
    </>
  );
}
