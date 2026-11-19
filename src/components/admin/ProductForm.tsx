"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useRef, useState } from "react";
import { saveProductAction } from "@/app/admin/actions";
import type { PhoneBrand, Product, ProductColor, Category } from "@/data/types";
import { childrenOf, productKind, topLevel } from "@/lib/categories";
import { autoFit } from "@/lib/fit";
import { formatPrice } from "@/lib/format";
import { BADGES } from "@/lib/validate";
import { ProductArt } from "../ProductArt";
import { Button, Card, Field, Input, Notice, Select, Textarea, Toggle, linkBtn } from "./ui";

type Model = {
  name: string;
  category: string;
  short: string;
  description: string;
  price: string;
  oldPrice: string;
  badge: string;
  featured: boolean;
  active: boolean;
  fit: string;
  models: string[];
  colors: ProductColor[];
  art: NonNullable<Product["art"]>;
  images: string[];
  features: string[];
};

/** Yeni məhsul üçün ilkin kateqoriya: ilk alt kateqoriya (məhsul yalnız alt kateqoriyada ola bilər) */
function firstSelectable(categories: Category[]) {
  for (const t of topLevel(categories)) {
    const kid = childrenOf(categories, t.id)[0];
    if (kid) return kid.id;
  }
  return "";
}

function toModel(p: Product | undefined, categories: Category[], defaultCategory?: string): Model {
  return {
    name: p?.name ?? "",
    category: p?.category ?? categories.find((c) => c.id === defaultCategory && c.parentId)?.id ?? firstSelectable(categories),
    short: p?.short ?? "",
    description: p?.description ?? "",
    price: p ? String(p.price) : "",
    oldPrice: p?.oldPrice ? String(p.oldPrice) : "",
    badge: p?.badge ?? "",
    featured: p?.featured ?? false,
    active: p?.active ?? true,
    fit: p?.fit ?? "",
    models: p?.models ?? [],
    colors: p?.colors ?? [{ name: "Qara", hex: "#1f2328" }],
    art: p?.art ?? { pattern: "solid", camera: "pro" },
    images: p?.images ?? [],
    features: p?.features ?? [],
  };
}

export function ProductForm({
  product,
  categories,
  brands,
  defaultCategory,
}: {
  product?: Product;
  categories: Category[];
  brands: PhoneBrand[];
  /** Yeni məhsulda əvvəlcədən seçilən kateqoriya */
  defaultCategory?: string;
}) {
  const [m, setM] = useState<Model>(() => toModel(product, categories, defaultCategory));
  // Kateqoriya (əsas) seçimi. Alt kateqoriya siyahısı ona görə süzülür.
  const [topId, setTopId] = useState(() => {
    const cat = categories.find((c) => c.id === m.category);
    return cat?.parentId ?? cat?.id ?? topLevel(categories).find((t) => childrenOf(categories, t.id).length)?.id ?? topLevel(categories)[0]?.id ?? "";
  });
  const [previewColor, setPreviewColor] = useState(0);
  const [uploading, setUploading] = useState(0);
  const [uploadError, setUploadError] = useState("");
  const [state, action, pending] = useActionState(saveProductAction, undefined);
  const fileRef = useRef<HTMLInputElement>(null);

  const set = <K extends keyof Model>(k: K, v: Model[K]) => setM((cur) => ({ ...cur, [k]: v }));

  // Növ (qab / aksesuar) kateqoriyadan təyin olunur
  const kind = productKind(categories, m.category);
  const subOptions = childrenOf(categories, topId);

  const payload = JSON.stringify({
    id: product?.id,
    ...m,
    price: m.price === "" ? NaN : Number(m.price),
    // Köhnə qiymət yalnız "Endirim" nişanı ilə birlikdə göndərilir
    oldPrice: m.badge === "sale" && m.oldPrice !== "" ? Number(m.oldPrice) : null,
    art: kind === "case" ? { ...m.art, accessory: undefined } : { accessory: m.art.accessory ?? "holder" },
  });

  /* ---- Şəkillər ---- */
  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setUploadError("");
    for (const file of Array.from(files)) {
      if (m.images.length >= 10) {
        setUploadError("Ən çoxu 10 şəkil əlavə etmək olar.");
        break;
      }
      setUploading((n) => n + 1);
      try {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) setUploadError(`${file.name}: ${json.error ?? "yüklənmədi"}`);
        else setM((cur) => ({ ...cur, images: [...cur.images, json.url] }));
      } catch {
        setUploadError(`${file.name}: şəbəkə xətası`);
      } finally {
        setUploading((n) => n - 1);
      }
    }
    if (fileRef.current) fileRef.current.value = "";
  }

  /* ---- Rənglər ---- */
  const setColor = (i: number, patch: Partial<ProductColor>) =>
    setM((cur) => ({ ...cur, colors: cur.colors.map((c, idx) => (idx === i ? { ...c, ...patch } : c)) }));

  /* ---- Modellər ---- */
  const toggleModel = (name: string) =>
    setM((cur) => ({
      ...cur,
      models: cur.models.includes(name) ? cur.models.filter((x) => x !== name) : [...cur.models, name],
    }));
  const setBrandModels = (brand: PhoneBrand, on: boolean) =>
    setM((cur) => ({
      ...cur,
      models: on ? [...new Set([...cur.models, ...brand.models])] : cur.models.filter((x) => !brand.models.includes(x)),
    }));

  const previewProduct = {
    id: "preview",
    name: m.name || "Məhsul",
    kind,
    art: kind === "case" ? m.art : { accessory: m.art.accessory ?? "holder" },
    images: m.images,
    colors: m.colors.length ? m.colors : [{ name: "", hex: "#cccccc" }],
  };
  const pc = previewProduct.colors[Math.min(previewColor, previewProduct.colors.length - 1)];

  return (
    <form action={action} className="grid gap-6 lg:grid-cols-[1fr_20rem]">
      <input type="hidden" name="payload" value={payload} />

      <div className="space-y-6">
        {/* ───── Əsas ───── */}
        <Card title="Əsas məlumat">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Məhsulun adı" className="sm:col-span-2">
              <Input
                value={m.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="Məs. Soft Touch silikon qab"
                maxLength={120}
                required
              />
            </Field>
            <Field label="Kateqoriya">
              <Select
                value={topId}
                onChange={(e) => {
                  setTopId(e.target.value);
                  // Alt kateqoriya yenidən seçilməlidir: yeni kateqoriyanın ilk alt kateqoriyası təklif olunur
                  set("category", childrenOf(categories, e.target.value)[0]?.id ?? "");
                }}
                required
              >
                {topLevel(categories).map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field
              label="Alt kateqoriya"
              hint={subOptions.length === 0 ? "Bu kateqoriyada hələ alt kateqoriya yoxdur. Əvvəlcə Kateqoriyalar bölməsində yaradın." : undefined}
            >
              <Select value={m.category} onChange={(e) => set("category", e.target.value)} disabled={subOptions.length === 0} required>
                {!m.category && (
                  <option value="" disabled>
                    Seçin…
                  </option>
                )}
                {subOptions.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Qısa təsvir" hint="Kartda və axtarışda görünür" className="sm:col-span-2">
              <Input value={m.short} onChange={(e) => set("short", e.target.value)} maxLength={200} />
            </Field>
            <Field label="Ətraflı təsvir" className="sm:col-span-2">
              <Textarea rows={5} value={m.description} onChange={(e) => set("description", e.target.value)} maxLength={2000} />
            </Field>
          </div>
        </Card>

        {/* ───── Qiymət ───── */}
        <Card title="Qiymət və görünüş">
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Qiymət (₼)">
              <Input type="number" inputMode="decimal" min="0" step="0.01" value={m.price} onChange={(e) => set("price", e.target.value)} required />
            </Field>
            <Field label="Nişan">
              <Select
                value={m.badge}
                onChange={(e) =>
                  setM((cur) => ({
                    ...cur,
                    badge: e.target.value,
                    // Endirim nişanı götürüləndə köhnə qiymət də təmizlənir
                    oldPrice: e.target.value === "sale" ? cur.oldPrice : "",
                  }))
                }
              >
                {BADGES.map((b) => (
                  <option key={b.value} value={b.value}>
                    {b.label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Köhnə qiymət (₼)" hint={m.badge === "sale" ? "Endirimdən əvvəlki qiymət. Üstü xətlə görünür." : "Yalnız “Endirim” nişanı seçiləndə aktiv olur."}>
              <Input
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                value={m.oldPrice}
                onChange={(e) => set("oldPrice", e.target.value)}
                disabled={m.badge !== "sale"}
              />
            </Field>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="flex items-center justify-between rounded-2xl bg-brand-50 p-4">
              <span>
                <span className="block text-sm font-bold text-brand-900">Saytda göstər</span>
                <span className="block text-xs text-brand-500">Söndürsəniz məhsul gizlənir</span>
              </span>
              <Toggle checked={m.active} onChange={(v) => set("active", v)} label="Saytda göstər" />
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-brand-50 p-4">
              <span>
                <span className="block text-sm font-bold text-brand-900">Ana səhifədə seçilmiş</span>
                <span className="block text-xs text-brand-500">“Ən çox sevilənlər” bölməsi</span>
              </span>
              <Toggle checked={m.featured} onChange={(v) => set("featured", v)} label="Ana səhifədə seçilmiş" />
            </div>
          </div>
        </Card>

        {/* ───── Şəkillər ───── */}
        <Card title="Şəkillər" hint="İlk şəkil əsas şəkildir. JPG, PNG, WebP və ya GIF, hər biri ən çoxu 8 MB.">
          {m.images.length > 0 && (
            <ul className="mb-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
              {m.images.map((url, i) => (
                <li key={url} className="group relative aspect-square overflow-hidden rounded-2xl border border-brand-100 bg-brand-50">
                  <Image src={url} alt={`Şəkil ${i + 1}`} fill sizes="160px" className="object-cover" unoptimized />
                  {i === 0 && (
                    <span className="absolute top-1.5 left-1.5 rounded-full bg-brand-600 px-2 py-0.5 text-[10px] font-bold text-white">Əsas</span>
                  )}
                  <div className="absolute inset-x-0 bottom-0 flex justify-between gap-1 bg-gradient-to-t from-black/60 to-transparent p-1.5">
                    {i > 0 ? (
                      <button
                        type="button"
                        onClick={() => set("images", [url, ...m.images.filter((u) => u !== url)])}
                        className="rounded-lg bg-white/90 px-2 py-1 text-[11px] font-bold text-brand-800"
                      >
                        Əsas et
                      </button>
                    ) : (
                      <span />
                    )}
                    <button
                      type="button"
                      aria-label="Şəkli sil"
                      onClick={() => set("images", m.images.filter((u) => u !== url))}
                      className="rounded-lg bg-white/90 px-2 py-1 text-[11px] font-bold text-red-700"
                    >
                      Sil
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <label
            className="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-brand-200 bg-brand-50/60 px-4 py-8 text-center transition hover:border-brand-400 hover:bg-brand-50"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              upload(e.dataTransfer.files);
            }}
          >
            <span className="text-sm font-bold text-brand-700">{uploading > 0 ? `Yüklənir… (${uploading})` : "Şəkil seçmək üçün toxunun və ya buraya atın"}</span>
            <span className="text-xs text-brand-500">Bir neçə şəkli eyni anda seçə bilərsiniz</span>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple className="sr-only" onChange={(e) => upload(e.target.files)} />
          </label>
          {uploadError && (
            <div className="mt-3">
              <Notice kind="error">{uploadError}</Notice>
            </div>
          )}
        </Card>

        {/* ───── Rənglər ───── */}
        <Card title="Rənglər" hint="Müştəri rəng seçəndə saytda məhsulun görünüşü dəyişir.">
          <ul className="space-y-3">
            {m.colors.map((c, i) => (
              <li key={i} className="flex flex-wrap items-center gap-3 rounded-2xl bg-brand-50/70 p-3">
                <input
                  type="color"
                  value={c.hex}
                  onChange={(e) => setColor(i, { hex: e.target.value })}
                  aria-label={`${c.name || "Rəng"}: rəng seç`}
                  className="h-11 w-12 shrink-0 cursor-pointer rounded-lg border border-brand-200 bg-white p-1"
                />
                <Input
                  value={c.name}
                  onChange={(e) => setColor(i, { name: e.target.value })}
                  placeholder="Rəngin adı (məs. Çəhrayı)"
                  maxLength={40}
                  className="min-w-40 flex-1"
                  aria-label="Rəngin adı"
                />
                {c.hex2 !== undefined ? (
                  <span className="flex items-center gap-2">
                    <input
                      type="color"
                      value={c.hex2 || "#ffffff"}
                      onChange={(e) => setColor(i, { hex2: e.target.value })}
                      aria-label="İkinci rəng"
                      className="h-11 w-12 cursor-pointer rounded-lg border border-brand-200 bg-white p-1"
                    />
                    <Button type="button" variant="secondary" size="sm" onClick={() => setColor(i, { hex2: undefined })}>
                      2-ci rəngi sil
                    </Button>
                  </span>
                ) : (
                  <Button type="button" variant="secondary" size="sm" onClick={() => setColor(i, { hex2: "#ffffff" })}>
                    + 2-ci rəng
                  </Button>
                )}
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  disabled={m.colors.length === 1}
                  onClick={() => {
                    set("colors", m.colors.filter((_, idx) => idx !== i));
                    setPreviewColor(0);
                  }}
                >
                  Sil
                </Button>
              </li>
            ))}
          </ul>
          <Button
            type="button"
            variant="secondary"
            className="mt-3"
            disabled={m.colors.length >= 20}
            onClick={() => set("colors", [...m.colors, { name: "", hex: "#2a6178" }])}
          >
            + Rəng əlavə et
          </Button>
          <p className="mt-2 text-xs text-brand-500">“2-ci rəng” gradient, zolaqlı, mərmər və şaxmat naxışlarında ikinci ton kimi istifadə olunur.</p>
        </Card>

        {/* ───── Modellər ───── */}
        <Card
          title="Uyğun telefon modelləri"
          hint={
            kind === "accessory"
              ? "Aksesuar bütün telefonlara uyğundursa, heç nə seçməyin."
              : "Müştəri modelinə görə süzəndə məhsul yalnız seçdiyiniz modellərdə görünəcək."
          }
        >
          <div className="space-y-5">
            {brands.map((b) => {
              const selected = b.models.filter((x) => m.models.includes(x)).length;
              return (
                <div key={b.id}>
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-extrabold text-brand-900">
                      {b.name} <span className="font-semibold text-brand-500">({selected}/{b.models.length})</span>
                    </p>
                    <span className="flex gap-2">
                      <Button type="button" variant="secondary" size="sm" onClick={() => setBrandModels(b, true)}>Hamısını seç</Button>
                      <Button type="button" variant="secondary" size="sm" onClick={() => setBrandModels(b, false)}>Təmizlə</Button>
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {b.models.map((name) => {
                      const on = m.models.includes(name);
                      return (
                        <button
                          key={name}
                          type="button"
                          aria-pressed={on}
                          onClick={() => toggleModel(name)}
                          className={`rounded-full border px-3.5 py-2 text-xs font-bold transition ${
                            on ? "border-brand-600 bg-brand-600 text-white" : "border-brand-200 bg-white text-brand-800 hover:border-brand-400"
                          }`}
                        >
                          {name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
            {brands.length === 0 && (
              <p className="text-sm text-brand-600">
                Hələ telefon modeli yoxdur. <Link href="/admin/modeller" className="font-bold underline">Modellər bölməsində</Link> əlavə edin.
              </p>
            )}
          </div>

          <div className="mt-6 flex flex-wrap items-end gap-3">
            <Field label="Kartda görünən uyğunluq mətni" hint="Boş buraxsanız seçilmiş modellərdən avtomatik yaranır." className="min-w-60 flex-1">
              <Input value={m.fit} onChange={(e) => set("fit", e.target.value)} placeholder={autoFit(m.models) || "məs. iPhone 17 seriyası"} maxLength={60} />
            </Field>
            <Button type="button" variant="secondary" onClick={() => set("fit", autoFit(m.models))} disabled={m.models.length === 0}>
              Avtomatik doldur
            </Button>
          </div>
        </Card>

        {/* ───── Xüsusiyyətlər ───── */}
        <Card title="Xüsusiyyətlər" hint="Məhsul səhifəsində işarələnmiş siyahı kimi görünür (məs. “MagSafe dəstəyi”).">
          <ul className="space-y-2">
            {m.features.map((f, i) => (
              <li key={i} className="flex gap-2">
                <Input
                  value={f}
                  onChange={(e) => set("features", m.features.map((x, idx) => (idx === i ? e.target.value : x)))}
                  maxLength={80}
                  aria-label={`Xüsusiyyət ${i + 1}`}
                />
                <Button type="button" variant="danger" onClick={() => set("features", m.features.filter((_, idx) => idx !== i))}>
                  Sil
                </Button>
              </li>
            ))}
          </ul>
          <Button type="button" variant="secondary" className="mt-3" disabled={m.features.length >= 12} onClick={() => set("features", [...m.features, ""])}>
            + Xüsusiyyət əlavə et
          </Button>
        </Card>
      </div>

      {/* ───── Önizləmə + saxla ───── */}
      <aside className="lg:sticky lg:top-6 lg:self-start">
        <div className="space-y-4">
          <Card title="Önizləmə" className="!p-4">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-brand-50 to-sage-100">
              <div className="absolute inset-x-0 bottom-0 h-1/2 rounded-t-[50%] bg-sage-200/60" />
              <ProductArt product={previewProduct} color={pc} className="relative aspect-[4/5] p-6 [&_svg]:max-h-full" />
            </div>
            <div className="mt-3">
              <p className="text-xs font-semibold text-brand-500">{m.fit || autoFit(m.models) || "—"}</p>
              <p className="font-bold text-brand-900">{m.name || "Məhsulun adı"}</p>
              <p className="mt-1 font-extrabold text-brand-700">{m.price ? formatPrice(Number(m.price)) : "— ₼"}</p>
            </div>
            {m.colors.length > 1 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {m.colors.map((c, i) => (
                  <button
                    key={i}
                    type="button"
                    title={c.name}
                    aria-label={c.name || `Rəng ${i + 1}`}
                    onClick={() => setPreviewColor(i)}
                    className={`h-7 w-7 rounded-full border-2 ${i === previewColor ? "border-brand-600" : "border-white"} shadow ring-1 ring-black/10`}
                    style={{ background: c.hex2 ? `linear-gradient(135deg, ${c.hex} 50%, ${c.hex2} 50%)` : c.hex }}
                  />
                ))}
              </div>
            )}
          </Card>

          {state?.error && <Notice kind="error">{state.error}</Notice>}
          <div className="sticky bottom-3 z-10 flex gap-2 rounded-2xl bg-white/90 p-2 shadow-lift backdrop-blur lg:static lg:bg-transparent lg:p-0 lg:shadow-none">
            <Button type="submit" disabled={pending || uploading > 0} className="flex-1">
              {pending ? "Saxlanılır…" : uploading > 0 ? "Şəkil yüklənir…" : product ? "Yadda saxla" : "Məhsulu əlavə et"}
            </Button>
            <Link href="/admin/mehsullar" className={linkBtn("secondary")}>
              Ləğv et
            </Link>
          </div>
        </div>
      </aside>
    </form>
  );
}
