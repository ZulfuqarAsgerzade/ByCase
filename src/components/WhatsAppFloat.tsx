"use client";

import { usePathname } from "next/navigation";
import { WhatsAppIcon } from "./icons";
import { useSettings } from "./SettingsProvider";
import { generalMessage, waLink } from "@/lib/whatsapp";

export function WhatsAppFloat() {
  const pathname = usePathname();
  const { whatsapp } = useSettings();
  // Məhsul səhifəsinin mobil versiyasında alt sifariş paneli var, üzən düymə lazım deyil
  const onProduct = pathname.startsWith("/mehsullar/");

  return (
    <a
      href={waLink(whatsapp, generalMessage)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="WhatsApp-da yaz"
      className={`fixed right-4 bottom-4 z-30 place-items-center rounded-full bg-wa text-white shadow-lift transition hover:scale-105 hover:bg-wa-dark sm:right-6 sm:bottom-6 h-14 w-14 ${
        onProduct ? "hidden lg:grid" : "grid"
      }`}
    >
      <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-wa/40 [animation-duration:2.6s]" />
      <WhatsAppIcon width={28} height={28} />
    </a>
  );
}
