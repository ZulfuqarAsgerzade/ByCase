import { PageHeader } from "@/components/admin/ui";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { getDB } from "@/lib/store";

export const metadata = { title: "Mağaza ayarları" };

export default async function SettingsPage() {
  const db = await getDB();
  return (
    <>
      <PageHeader title="Mağaza ayarları" text="WhatsApp nömrəsi, ünvan, iş saatları və sosial şəbəkələr." />
      <SettingsForm settings={db.settings} />
    </>
  );
}
