"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Logo } from "./Logo";
import { CloseIcon, MenuIcon, WhatsAppIcon } from "./icons";
import { nav } from "@/lib/site";
import { useSettings } from "./SettingsProvider";
import { generalMessage, waLink } from "@/lib/whatsapp";

export function Header() {
  const pathname = usePathname();
  const settings = useSettings();
  const [openAt, setOpenAt] = useState<string | null>(null);
  const open = openAt === pathname; // başqa səhifəyə keçəndə menyu avtomatik bağlanır
  const setOpen = (v: boolean) => setOpenAt(v ? pathname : null);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

  // Aşağı scroll edəndə menyu gizlənir, yuxarı scroll edəndə qayıdır (səhifənin başında həmişə görünür)
  useEffect(() => {
    lastY.current = window.scrollY;
    const onScroll = () => {
      const y = Math.max(window.scrollY, 0); // iOS-da səhifənin başında "çəkmə" mənfi dəyər verə bilər
      setScrolled(y > 8);
      const delta = y - lastY.current;
      if (Math.abs(delta) < 6) return; // kiçik titrəmələrə reaksiya vermir
      setHidden(delta > 0 && y > 80);
      lastY.current = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={`sticky top-0 z-40 border-b transition duration-300 focus-within:translate-y-0 ${
        hidden && !open ? "-translate-y-full" : "translate-y-0"
      } ${
        scrolled || open
          ? "border-brand-100 bg-white/85 shadow-soft backdrop-blur-lg"
          : "border-transparent bg-white/60 backdrop-blur"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:h-[4.5rem] lg:px-8">
        <Logo />

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Əsas menyu">
          {nav.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href.split("#")[0]) && !item.href.includes("#");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  active ? "bg-brand-50 text-brand-700" : "text-brand-800/80 hover:bg-brand-50 hover:text-brand-700"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={waLink(settings.whatsapp, generalMessage)}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden items-center gap-2 rounded-full bg-wa px-4 py-2.5 text-sm font-bold text-white shadow-soft transition hover:bg-wa-dark sm:inline-flex"
          >
            <WhatsAppIcon className="h-4.5 w-4.5" width={18} height={18} />
            {settings.phoneDisplay}
          </a>
          <button
            type="button"
            aria-label={open ? "Menyunu bağla" : "Menyunu aç"}
            aria-expanded={open}
            onClick={() => setOpen(!open)}
            className="grid h-11 w-11 place-items-center rounded-full bg-brand-50 text-brand-700 transition hover:bg-brand-100 lg:hidden"
          >
            {open ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {/* Mobil menyu */}
      {open && (
        <div className="fixed inset-x-0 top-16 bottom-0 z-30 overflow-y-auto bg-white lg:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-6" aria-label="Mobil menyu">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-2xl px-4 py-4 text-lg font-bold text-brand-800 transition active:bg-brand-50"
              >
                {item.label}
              </Link>
            ))}
            <a
              href={waLink(settings.whatsapp, generalMessage)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center justify-center gap-2 rounded-2xl bg-wa px-5 py-4 text-base font-bold text-white"
            >
              <WhatsAppIcon width={22} height={22} />
              WhatsApp-da yaz
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
