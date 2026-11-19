import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { SettingsProvider } from "@/components/SettingsProvider";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";
import { getSettings } from "@/lib/products";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();
  return (
    <SettingsProvider settings={settings}>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer settings={settings} />
      <WhatsAppFloat />
    </SettingsProvider>
  );
}
