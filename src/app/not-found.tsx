import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { SettingsProvider } from "@/components/SettingsProvider";
import { getSettings } from "@/lib/products";

export default async function NotFound() {
  const settings = await getSettings();
  return (
    <SettingsProvider settings={settings}>
      <Header />
      <main className="flex-1">
        <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-28 text-center">
          <p className="font-script text-7xl text-sage-500">404</p>
          <h1 className="mt-4 text-3xl font-extrabold text-brand-900">Səhifə tapılmadı</h1>
          <p className="mt-3 text-brand-700">Axtardığınız səhifə silinib və ya ünvan səhvdir.</p>
          <Link
            href="/mehsullar"
            className="mt-8 rounded-2xl bg-brand-600 px-7 py-3.5 text-sm font-bold text-white transition hover:bg-brand-700"
          >
            Məhsullara bax
          </Link>
        </div>
      </main>
      <Footer settings={settings} />
    </SettingsProvider>
  );
}
