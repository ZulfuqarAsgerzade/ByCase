"use client";

import Link from "next/link";
import { useActionState, useEffect, useState, useTransition } from "react";
import {
  addModelAction,
  deleteBrandAction,
  deleteModelAction,
  renameModelAction,
  saveBrandAction,
  updateBrandAction,
} from "@/app/admin/actions";
import type { PhoneBrand } from "@/data/types";
import { Modal } from "./Modal";
import { Button, Field, Input, Notice } from "./ui";

/** Brend kartları (kliklənəndə həmin brendin modellər siyahısına keçir) */
export function BrandsList({ brands, counts }: { brands: PhoneBrand[]; counts: Record<string, number> }) {
  if (brands.length === 0) {
    return (
      <p className="rounded-3xl border border-dashed border-brand-200 bg-white p-10 text-center text-sm font-semibold text-brand-600">
        Hələ brend yoxdur. Yuxarıdakı düymə ilə əlavə edin.
      </p>
    );
  }
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {brands.map((b) => {
        const shown = b.models.slice(0, 4);
        const rest = b.models.length - shown.length;
        return (
          <li key={b.id}>
            <Link
              href={`/admin/modeller/${b.id}`}
              className="group flex h-full flex-col rounded-3xl border border-brand-100 bg-white p-5 shadow-soft transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-lift sm:p-6"
            >
              <h2 className="flex items-center justify-between gap-3 text-lg font-extrabold text-brand-900">
                {b.name}
                <span aria-hidden className="text-brand-300 transition group-hover:translate-x-1 group-hover:text-brand-600">→</span>
              </h2>
              <p className="mt-1.5 text-sm font-semibold text-brand-500">{b.models.length} model</p>
              <div className="mt-3 flex flex-1 flex-wrap content-start gap-1.5">
                {shown.map((m) => (
                  <span key={m} className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700">
                    {m}
                  </span>
                ))}
                {rest > 0 && <span className="rounded-full px-2 py-1 text-xs font-bold text-brand-500">+{rest}</span>}
              </div>
              <p className="mt-5 inline-flex w-fit items-center gap-2 rounded-full bg-brand-50 px-3.5 py-1.5 text-sm font-bold text-brand-700">
                <span className="text-base font-extrabold">{counts[b.id] ?? 0}</span> məhsul
              </p>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function AddForm({ onDone, onCancel }: { onDone: () => void; onCancel: () => void }) {
  const [state, action, pending] = useActionState(saveBrandAction, undefined);

  useEffect(() => {
    if (state?.ok) onDone();
  }, [state, onDone]);

  return (
    <form action={action} className="space-y-4">
      <Field label="Brend adı">
        <Input name="name" defaultValue={state?.values?.name ?? ""} placeholder="Məs. Honor" maxLength={40} autoFocus required />
      </Field>
      {state?.error && <Notice kind="error">{state.error}</Notice>}
      <div className="flex justify-end gap-2 pt-1">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Ləğv et
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? "Əlavə olunur…" : "Əlavə et"}
        </Button>
      </div>
    </form>
  );
}

/** "Brend əlavə et" düyməsi və açılan pəncərə */
export function AddBrandDialog() {
  return (
    <Modal trigger="+ Brend əlavə et" title="Yeni brend" description="Brendi əlavə etdikdən sonra açıb modelləri əlavə edin. Model əlavə olunana qədər brend saytda görünməyəcək.">
      {({ close }) => <AddForm onDone={close} onCancel={close} />}
    </Modal>
  );
}

function AddModelForm({ brandId, onDone, onCancel }: { brandId: string; onDone: () => void; onCancel: () => void }) {
  const [state, action, pending] = useActionState(addModelAction, undefined);

  useEffect(() => {
    if (state?.ok) onDone();
  }, [state, onDone]);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="brandId" value={brandId} />
      <Field label="Modelin adı">
        <Input name="name" defaultValue={state?.values?.name ?? ""} placeholder="Məs. iPhone 18 Pro Max" maxLength={40} autoFocus required />
      </Field>
      {state?.error && <Notice kind="error">{state.error}</Notice>}
      <div className="flex justify-end gap-2 pt-1">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Ləğv et
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? "Əlavə olunur…" : "Əlavə et"}
        </Button>
      </div>
    </form>
  );
}

/** "Model əlavə et" düyməsi və açılan pəncərə */
export function AddModelDialog({ brandId, brandName }: { brandId: string; brandName: string }) {
  return (
    <Modal trigger="+ Model əlavə et" title="Yeni model" description={`${brandName} brendinə əlavə olunacaq və saytdakı “Telefonunu seç” bölməsində görünəcək.`}>
      {({ close }) => <AddModelForm brandId={brandId} onDone={close} onCancel={close} />}
    </Modal>
  );
}

/** Ad dəyişmə formu: brend (id verilir) və ya model (brandId + oldName verilir) üçün */
function RenameForm({
  action,
  hidden,
  label,
  initial,
  onDone,
  onCancel,
}: {
  action: typeof updateBrandAction;
  hidden: Record<string, string>;
  label: string;
  initial: string;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [state, run, pending] = useActionState(action, undefined);

  useEffect(() => {
    if (state?.ok) onDone();
  }, [state, onDone]);

  return (
    <form action={run} className="space-y-4">
      {Object.entries(hidden).map(([k, val]) => (
        <input key={k} type="hidden" name={k} value={val} />
      ))}
      <Field label={label}>
        <Input name="name" defaultValue={state?.values?.name ?? initial} maxLength={40} autoFocus required />
      </Field>
      {state?.error && <Notice kind="error">{state.error}</Notice>}
      <div className="flex justify-end gap-2 pt-1">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Ləğv et
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? "Saxlanılır…" : "Yadda saxla"}
        </Button>
      </div>
    </form>
  );
}

/** Brend səhifəsinin düymələri: adını dəyiş, brendi sil */
export function BrandTools({ brand }: { brand: PhoneBrand }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState("");

  function remove() {
    const extra = brand.models.length ? ` Onun ${brand.models.length} modeli də silinəcək və məhsullardan çıxarılacaq.` : "";
    if (!window.confirm(`“${brand.name}” brendi silinsin?${extra} Bu əməliyyat geri qaytarılmır.`)) return;
    setError("");
    start(async () => {
      const res = await deleteBrandAction(brand.id);
      if (res?.error) setError(res.error);
    });
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex flex-wrap justify-end gap-2">
        <Modal trigger="Adını dəyiş" title="Brendin adı" variant="secondary">
          {({ close }) => (
            <RenameForm action={updateBrandAction} hidden={{ id: brand.id }} label="Brend adı" initial={brand.name} onDone={close} onCancel={close} />
          )}
        </Modal>
        <Button type="button" variant="danger" disabled={pending} onClick={remove}>
          Brendi sil
        </Button>
      </div>
      {error && <Notice kind="error">{error}</Notice>}
    </div>
  );
}

/** Modelin sətri: ad, məhsul sayı, adını dəyiş, sil */
export function ModelRow({ brandId, model, productCount }: { brandId: string; model: string; productCount: number }) {
  const [pending, start] = useTransition();

  function remove() {
    const extra = productCount ? ` ${productCount} məhsuldan da çıxarılacaq.` : "";
    if (!window.confirm(`“${model}” modeli silinsin?${extra}`)) return;
    start(() => deleteModelAction(brandId, model));
  }

  return (
    <li
      className={`flex flex-wrap items-center justify-between gap-x-3 gap-y-2 rounded-2xl border border-brand-100 bg-white px-5 py-4 shadow-soft ${pending ? "opacity-60" : ""}`}
    >
      <div className="min-w-0">
        <span className="block truncate font-extrabold text-brand-900">{model}</span>
        <span className="mt-1 inline-block rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700">{productCount} məhsul</span>
      </div>
      <div className="flex gap-2">
        <Modal trigger="Dəyiş" title="Modelin adı" description="Ad bu modeli seçmiş bütün məhsullarda da dəyişəcək." variant="secondary" size="sm">
          {({ close }) => (
            <RenameForm action={renameModelAction} hidden={{ brandId, oldName: model }} label="Modelin adı" initial={model} onDone={close} onCancel={close} />
          )}
        </Modal>
        <Button type="button" variant="danger" size="sm" disabled={pending} onClick={remove}>
          Sil
        </Button>
      </div>
    </li>
  );
}
