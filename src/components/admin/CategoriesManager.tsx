"use client";

import Link from "next/link";
import { useActionState, useEffect, useState, useTransition } from "react";
import { deleteCategoryAction, moveCategoryAction, saveCategoryAction, updateCategoryAction } from "@/app/admin/actions";
import type { Category } from "@/data/types";
import { Modal } from "./Modal";
import { Button, Field, Input, Notice } from "./ui";

/**
 * Kateqoriya kartları (kliklənəndə həmin kateqoriyanın səhifəsinə keçir).
 * `subCounts` verilən (əsas) kateqoriyalarda alt kateqoriya sayı, qalanlarında məhsul sayı göstərilir.
 */
export function CategoriesList({
  categories,
  counts,
  subCounts = {},
  empty = "Hələ kateqoriya yoxdur. Yuxarıdakı düymə ilə əlavə edin.",
}: {
  categories: Category[];
  counts: Record<string, number>;
  subCounts?: Record<string, number>;
  empty?: string;
}) {
  if (categories.length === 0) {
    return (
      <p className="rounded-3xl border border-dashed border-brand-200 bg-white p-10 text-center text-sm font-semibold text-brand-600">
        {empty}
      </p>
    );
  }
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {categories.map((c) => {
        const n = counts[c.id] ?? 0;
        const isTop = c.id in subCounts; // əsas kateqoriya kartı: alt kateqoriya sayı göstərilir
        const subs = subCounts[c.id] ?? 0;
        return (
          <li key={c.id}>
            <Link
              href={`/admin/kateqoriyalar/${c.id}`}
              className="group flex h-full flex-col rounded-3xl border border-brand-100 bg-white p-5 shadow-soft transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-lift sm:p-6"
            >
              <h2 className="flex items-center justify-between gap-3 text-lg font-extrabold text-brand-900">
                {c.name}
                <span aria-hidden className="text-brand-300 transition group-hover:translate-x-1 group-hover:text-brand-600">→</span>
              </h2>
              {/* Əsas kateqoriyada izah məcburi deyil: yoxdursa yer boş qalır */}
              <p className="mt-1.5 flex-1 text-sm leading-relaxed text-brand-600">
                {c.blurb || (isTop ? "" : "Qısa izah yoxdur")}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {isTop ? (
                  <p className="inline-flex w-fit items-center gap-2 rounded-full bg-sage-100 px-3.5 py-1.5 text-sm font-bold text-brand-700">
                    {subs > 0 ? (
                      <>
                        <span className="text-base font-extrabold">{subs}</span> alt kateqoriya
                      </>
                    ) : (
                      "Alt kateqoriya yoxdur"
                    )}
                  </p>
                ) : (
                  <p className="inline-flex w-fit items-center gap-2 rounded-full bg-brand-50 px-3.5 py-1.5 text-sm font-bold text-brand-700">
                    <span className="text-base font-extrabold">{n}</span> məhsul
                  </p>
                )}
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function AddForm({ parentId, onDone, onCancel }: { parentId?: string; onDone: () => void; onCancel: () => void }) {
  const [state, action, pending] = useActionState(saveCategoryAction, undefined);

  useEffect(() => {
    if (state?.ok) onDone();
  }, [state, onDone]);

  return (
    <form action={action} className="space-y-4">
      {parentId && <input type="hidden" name="parentId" value={parentId} />}
      <Field label={parentId ? "Alt kateqoriyanın adı" : "Kateqoriya adı"}>
        <Input
          name="name"
          defaultValue={state?.values?.name ?? ""}
          placeholder={parentId ? "Məs. Dəri" : "Məs. Samsung qabları"}
          maxLength={60}
          autoFocus
          required
        />
      </Field>
      {/* Qısa izah yalnız alt kateqoriyalar üçündür */}
      {parentId && (
        <Field label="Qısa izah" hint="Saytda kateqoriya adının altında görünür.">
          <Input name="blurb" defaultValue={state?.values?.blurb ?? ""} placeholder="Məs. Galaxy modelləri üçün qablar" maxLength={120} />
        </Field>
      )}
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

/** "Kateqoriya əlavə et" (parent verilsə, "Alt kateqoriya əlavə et") düyməsi və açılan pəncərə */
export function AddCategoryDialog({ parent }: { parent?: { id: string; name: string } }) {
  return (
    <Modal
      trigger={parent ? "+ Alt kateqoriya əlavə et" : "+ Kateqoriya əlavə et"}
      title={parent ? "Yeni alt kateqoriya" : "Yeni kateqoriya"}
      description={
        parent
          ? `“${parent.name}” kateqoriyasının içinə əlavə olunacaq.`
          : "Kateqoriya əlavə olunan kimi saytda görünəcək."
      }
    >
      {({ close }) => <AddForm parentId={parent?.id} onDone={close} onCancel={close} />}
    </Modal>
  );
}

function EditForm({ category, onDone, onCancel }: { category: Category; onDone: () => void; onCancel: () => void }) {
  const [state, action, pending] = useActionState(updateCategoryAction, undefined);

  useEffect(() => {
    if (state?.ok) onDone();
  }, [state, onDone]);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="id" value={category.id} />
      <Field label="Kateqoriya adı">
        <Input name="name" defaultValue={state?.values?.name ?? category.name} maxLength={60} autoFocus required />
      </Field>
      <Field label="Qısa izah" hint="Saytda kateqoriya adının altında görünür. Boş ola bilər.">
        <Input name="blurb" defaultValue={state?.values?.blurb ?? category.blurb} maxLength={120} />
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

/**
 * Kateqoriya səhifəsinin idarəetmə düymələri: yuxarı/aşağı, düzəliş, sil.
 * Silmək yalnız boş kateqoriyada mümkündür (server də yoxlayır).
 */
export function CategoryTools({ category, hasContent }: { category: Category; hasContent: boolean }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState("");

  function remove() {
    if (!window.confirm(`“${category.name}” kateqoriyası silinsin? Bu əməliyyat geri qaytarılmır.`)) return;
    setError("");
    start(async () => {
      const res = await deleteCategoryAction(category.id);
      if (res?.error) setError(res.error);
    });
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex flex-wrap justify-end gap-2" aria-busy={pending}>
        <Button type="button" variant="secondary" aria-label="Yuxarı çək" title="Yuxarı çək" disabled={pending} onClick={() => start(() => moveCategoryAction(category.id, -1))}>
          ↑
        </Button>
        <Button type="button" variant="secondary" aria-label="Aşağı çək" title="Aşağı çək" disabled={pending} onClick={() => start(() => moveCategoryAction(category.id, 1))}>
          ↓
        </Button>
        <Modal trigger="Düzəliş et" title="Kateqoriyaya düzəliş" variant="secondary">
          {({ close }) => <EditForm category={category} onDone={close} onCancel={close} />}
        </Modal>
        <Button type="button" variant="danger" disabled={pending || hasContent} title={hasContent ? "Əvvəlcə içindəkiləri silin və ya köçürün" : undefined} onClick={remove}>
          Sil
        </Button>
      </div>
      {error && <Notice kind="error">{error}</Notice>}
    </div>
  );
}
