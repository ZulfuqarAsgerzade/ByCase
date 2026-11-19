import Link from "next/link";

/** Loqonun yarımdairə + V xətli işarəsi */
export function LogoMark({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 40" className={className} aria-hidden>
      <path d="M2 38A30 30 0 0 1 62 38Z" fill="var(--color-sage-400)" />
      <path
        d="M10 38 32 12.5 54 38M18 38 32 22M46 38 32 22"
        fill="none"
        stroke="var(--color-brand-600)"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="25" y="9" width="14" height="10" rx="2" fill="none" stroke="#fff" strokeWidth="1.6" />
      <rect x="22.5" y="13" width="6" height="8" rx="1.4" fill="var(--color-sage-400)" stroke="#fff" strokeWidth="1.4" />
      <rect x="37" y="14" width="4" height="7" rx="1.2" fill="var(--color-sage-400)" stroke="#fff" strokeWidth="1.4" />
    </svg>
  );
}

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className="group inline-flex items-center gap-2.5" aria-label="ByCase — ana səhifə">
      <span className="grid place-items-center rounded-xl bg-brand-600 p-1.5 transition group-hover:bg-brand-700">
        <LogoMark className="h-7 w-10" />
      </span>
      <span
        className={`font-script text-[1.7rem] leading-none ${light ? "text-brand-100" : "text-brand-600"}`}
      >
        By Case
      </span>
    </Link>
  );
}
