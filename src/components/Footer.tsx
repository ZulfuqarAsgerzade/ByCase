import Link from "next/link";
import { Logo } from "./Logo";
import { ClockIcon, InstagramIcon, MapPinIcon, WhatsAppIcon } from "./icons";
import { instagramUrl, mapsUrl, nav } from "@/lib/site";
import type { Settings } from "@/data/types";
import { generalMessage, waLink } from "@/lib/whatsapp";

export function Footer({ settings }: { settings: Settings }) {
  return (
    <footer className="mt-24 bg-brand-900 text-brand-100">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1.2fr] lg:px-8">
        <div>
          <Logo light />
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-brand-200">
            Telefon qabları və aksesuarlar. Real çəkilişlər, yüksək keyfiyyət və sürətli çatdırılma.
          </p>
          <div className="mt-6 flex gap-3">
            {/* Altbilgidə yalnız birinci Instagram hesabı göstərilir */}
            {settings.instagram.slice(0, 1).map((i) => (
              <a
                key={i.handle}
                href={instagramUrl(i.handle)}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Instagram: @${i.handle}`}
                className="grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white transition hover:bg-[linear-gradient(45deg,#f9ce34,#ee2a7b,#6228d7)] hover:shadow-lift"
              >
                <InstagramIcon className="h-5 w-5" />
              </a>
            ))}
            <a
              href={waLink(settings.whatsapp, generalMessage)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className="grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white transition hover:bg-wa hover:shadow-lift"
            >
              <WhatsAppIcon width={20} height={20} />
            </a>
          </div>
        </div>

        <div>
          <h2 className="text-sm font-bold tracking-wide text-white uppercase">Səhifələr</h2>
          <ul className="mt-5 space-y-3 text-sm">
            {nav.map((n) => (
              <li key={n.href}>
                <Link href={n.href} className="text-brand-200 transition hover:text-white">
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-bold tracking-wide text-white uppercase">Əlaqə</h2>
          <ul className="mt-5 space-y-4 text-sm text-brand-200">
            <li className="flex gap-3">
              <MapPinIcon className="mt-0.5 h-5 w-5 shrink-0 text-sage-400" />
              <a href={mapsUrl(settings)} target="_blank" rel="noopener noreferrer" className="transition hover:text-white">
                {settings.address}
              </a>
            </li>
            <li className="flex gap-3">
              <ClockIcon className="mt-0.5 h-5 w-5 shrink-0 text-sage-400" />
              <span>{settings.hours}</span>
            </li>
            <li className="flex gap-3">
              <WhatsAppIcon className="mt-0.5 h-5 w-5 shrink-0 text-sage-400" />
              <a href={waLink(settings.whatsapp)} target="_blank" rel="noopener noreferrer" className="transition hover:text-white">
                {settings.phoneDisplay}
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-xs text-brand-300 sm:flex-row sm:justify-between sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} ByCase. Bütün hüquqlar qorunur.</p>
          <p>Qiymətlər və mövcudluq WhatsApp-da təsdiqlənir.</p>
        </div>
      </div>
    </footer>
  );
}
