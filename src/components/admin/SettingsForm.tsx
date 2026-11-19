"use client";

import { useActionState } from "react";
import { saveSettingsAction } from "@/app/admin/actions";
import type { Settings } from "@/data/types";
import { Button, Card, Field, Input, Notice } from "./ui";

export function SettingsForm({ settings }: { settings: Settings }) {
  const [state, action, pending] = useActionState(saveSettingsAction, undefined);
  const ig = [settings.instagram[0], settings.instagram[1]];
  // Xəta olanda forma təmizlənmir: istifadəçinin yazdıqları saxlanılır
  const v = (name: string, fallback: string) => state?.values?.[name] ?? fallback;

  return (
    <form action={action} className="space-y-6">
      <Card title="Əlaqə" hint="WhatsApp düyməsi və “Əlaqə” bölməsi bu məlumatlardan istifadə edir.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="WhatsApp nömrəsi" hint="Sifarişlər bu nömrəyə gələcək, saytda da bu nömrə göstəriləcək. Nümunə: 055 418 07 16">
            <Input name="whatsapp" defaultValue={v("whatsapp", `+${settings.whatsapp}`)} inputMode="tel" required />
          </Field>
          <Field
            label="Biznesin adı (xəritədə)"
            hint="Google Maps-də biznesinizin adı necə yazılıbsa, eynilə yazın. Xəritədə dəqiq nöqtə və ad bununla tapılır."
            className="sm:col-span-2"
          >
            <Input name="businessName" defaultValue={v("businessName", settings.businessName ?? "")} maxLength={80} placeholder="Məs. Bycase Baku & Creative Case" />
          </Field>
          <Field
            label="Google Maps linki"
            hint="Google Maps-də biznesinizi açın, “Paylaş” düyməsindən linki kopyalayıb bura yapışdırın. “Xəritədə aç” düyməsi birbaşa biznes kartına aparacaq. Boş buraxsanız ad və ünvanla axtarılır."
            className="sm:col-span-2"
          >
            <Input name="mapsLink" type="url" defaultValue={v("mapsLink", settings.mapsLink ?? "")} maxLength={300} placeholder="https://maps.app.goo.gl/..." />
          </Field>
          <Field label="Ünvan" hint="Xəritə və “Ünvan” bölməsi bundan istifadə edir." className="sm:col-span-2">
            <Input name="address" defaultValue={v("address", settings.address)} maxLength={160} required />
          </Field>
          <Field label="İş saatları">
            <Input name="hours" defaultValue={v("hours", settings.hours)} maxLength={60} placeholder="10:30 – 22:00" />
          </Field>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {[1, 2].map((n) => {
          const a = ig[n - 1];
          return (
            <Card key={n} title={`Instagram ${n}`} hint={n === 2 ? "İstəməsəniz boş buraxın." : undefined}>
              <div className="space-y-4">
                <Field label="İstifadəçi adı" hint="@ olmadan, məs. bycase.baku">
                  <Input name={`ig${n}_handle`} defaultValue={v(`ig${n}_handle`, a?.handle ?? "")} maxLength={40} />
                </Field>
                <Field label="Başlıq">
                  <Input name={`ig${n}_title`} defaultValue={v(`ig${n}_title`, a?.title ?? "")} maxLength={40} />
                </Field>
                <Field label="Qısa izah">
                  <Input name={`ig${n}_desc`} defaultValue={v(`ig${n}_desc`, a?.desc ?? "")} maxLength={100} />
                </Field>
              </div>
            </Card>
          );
        })}
      </div>

      {state?.error && <Notice kind="error">{state.error}</Notice>}
      {state?.ok && <Notice kind="ok">{state.ok}</Notice>}
      <Button type="submit" disabled={pending}>
        {pending ? "Saxlanılır…" : "Yadda saxla"}
      </Button>
    </form>
  );
}
