"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { logoutAction } from "@/app/admin/actions";
import { CloseIcon, MenuIcon } from "../icons";
import { Logo } from "../Logo";
import { adminSections, dashboardItem } from "./nav";

const items = [dashboardItem, ...adminSections];

function NavIcon({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={d} />
    </svg>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [openAt, setOpenAt] = useState<string | null>(null);
  const open = openAt === pathname;

  const nav = (
    <>
      <nav className="flex flex-1 flex-col gap-1" aria-label="Admin menyusu">
        {items.map((i) => {
          const active = i.href === "/admin" ? pathname === "/admin" : pathname.startsWith(i.href);
          return (
            <Link
              key={i.href}
              href={i.href}
              onClick={() => setOpenAt(null)}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-bold transition ${
                active ? "bg-white/15 text-white" : "text-brand-200 hover:bg-white/10 hover:text-white"
              }`}
            >
              <NavIcon d={i.icon} />
              {i.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-6 flex flex-col gap-1 border-t border-white/10 pt-4">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-xl px-3.5 py-3 text-sm font-bold text-brand-200 transition hover:bg-white/10 hover:text-white"
        >
          Sayta bax ↗
        </a>
        <form action={logoutAction}>
          <button className="w-full rounded-xl px-3.5 py-3 text-left text-sm font-bold text-brand-200 transition hover:bg-white/10 hover:text-white">
            Çıxış
          </button>
        </form>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[#f3f8f9] lg:pl-64">
      {/* Masaüstü sol menyu */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col bg-brand-900 p-4 lg:flex">
        <div className="px-2 pt-2 pb-6">
          <Logo light />
          <p className="mt-2 pl-1 text-xs font-bold tracking-wide text-sage-400 uppercase">Admin panel</p>
        </div>
        {nav}
      </aside>

      {/* Mobil üst panel */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between bg-brand-900 px-4 lg:hidden">
        <Logo light />
        <button
          aria-label={open ? "Menyunu bağla" : "Menyunu aç"}
          aria-expanded={open}
          onClick={() => setOpenAt(open ? null : pathname)}
          className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white"
        >
          {open ? <CloseIcon /> : <MenuIcon />}
        </button>
      </header>
      {open && (
        <div className="fixed inset-x-0 top-14 bottom-0 z-20 flex flex-col overflow-y-auto bg-brand-900 p-4 lg:hidden">{nav}</div>
      )}

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">{children}</main>
    </div>
  );
}
