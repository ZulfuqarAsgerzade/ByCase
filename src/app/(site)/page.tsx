import Link from "next/link";
import { ModelFinder } from "@/components/ModelFinder";
import { ProductArt } from "@/components/ProductArt";
import { ProductCard } from "@/components/ProductCard";
import {
  ArrowRightIcon,
  CameraIcon,
  CardIcon,
  ClockIcon,
  InstagramIcon,
  MapPinIcon,
  ShieldIcon,
  TruckIcon,
  WhatsAppIcon,
} from "@/components/icons";
import { getCategories, getFeaturedProducts, getNewProducts, getPhoneBrands, getProducts, getSettings } from "@/lib/products";
import { instagramUrl, mapsEmbed, mapsUrl } from "@/lib/site";
import type { Product } from "@/data/types";
import { generalMessage, waLink } from "@/lib/whatsapp";

const demo = (id: string, art: Product["art"], hex: string, hex2?: string) =>
  ({ id, name: "", kind: "case", art, images: undefined, colors: [{ name: "", hex, hex2 }] }) satisfies Parameters<typeof ProductArt>[0]["product"];

// Hero şəkli sabitdir, admin paneldəki məhsullardan asılı deyil
const heroA = demo("hero-a", { pattern: "solid", camera: "pro" }, "#f2b8c6");
const heroB = demo("hero-b", { pattern: "leather", camera: "pro", magsafe: true }, "#8a5a3c");
const heroC = demo("hero-c", { pattern: "gradient", camera: "pro" }, "#ff9a76", "#c04d8f");

export default async function HomePage() {
  const [all, featured, fresh, categories, brands, settings] = await Promise.all([
    getProducts(),
    getFeaturedProducts(8),
    getNewProducts(4),
    getCategories(),
    getPhoneBrands(),
    getSettings(),
  ]);

  const wa = (text?: string) => waLink(settings.whatsapp, text);
  // Ana səhifədə alt kateqoriyası olmayan (konkret) kateqoriyalar göstərilir: Silikon, Şəffaf, Aksesuarlar...
  const shownCategories = categories.filter(
    (c) => !categories.some((x) => x.parentId === c.id) && all.some((p) => p.category === c.id),
  );

  return (
    <>
      {/* ───────── HERO ───────── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-100/70 via-brand-50 to-[#fbfdfd]">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 pt-10 pb-16 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:gap-6 lg:px-8 lg:pt-16 lg:pb-24">
          <div className="animate-rise">
            <p className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-bold text-brand-700 shadow-soft sm:text-sm">
              <span className="h-2 w-2 rounded-full bg-wa" />
              Bakıda · bütün ünvanlara çatdırılma
            </p>
            <h1 className="mt-6 text-[2.5rem] leading-[1.05] font-extrabold tracking-tight text-brand-900 sm:text-6xl lg:text-[4.25rem]">
              Telefonun üçün <span className="font-script px-1.5 text-[0.95em] font-normal text-brand-600">ən gözəl</span> qablar
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-brand-800/85">
              Silikon, şəffaf, MagSafe və lüks qablar, üstəlik şarj və aksesuarlar. Real çəkilişlər, yüksək keyfiyyət.
              Bəyən, WhatsApp-da yaz, qapında qarşıla.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/mehsullar"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-600 px-7 py-4 text-base font-bold text-white shadow-lift transition hover:bg-brand-700"
              >
                Məhsullara bax <ArrowRightIcon className="h-5 w-5" />
              </Link>
              <a
                href={wa(generalMessage)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-7 py-4 text-base font-bold text-wa-dark shadow-soft transition hover:bg-wa hover:text-white"
              >
                <WhatsAppIcon width={22} height={22} /> WhatsApp-da yaz
              </a>
            </div>

            <ul className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-sm font-bold text-brand-800">
              <li className="flex items-center gap-2"><ShieldIcon className="h-5 w-5 text-brand-500" /> Orijinal məhsullar</li>
              <li className="flex items-center gap-2"><CameraIcon className="h-5 w-5 text-brand-500" /> Real şəkillər</li>
              <li className="flex items-center gap-2"><CardIcon className="h-5 w-5 text-brand-500" /> Kredit imkanı</li>
            </ul>
          </div>

          {/* Hero kompozisiyası */}
          <div className="relative mx-auto h-[26rem] w-full max-w-md sm:h-[34rem] sm:max-w-lg lg:h-[36rem]" aria-hidden>
            <div className="absolute bottom-[2%] left-1/2 aspect-square w-[88%] -translate-x-1/2 overflow-hidden rounded-full bg-sage-300/60">
              <svg viewBox="0 0 400 400" className="absolute inset-0 h-full w-full text-brand-600/20">
                <path d="M40 400 200 130 360 400M110 400 200 250M290 400 200 250" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            <div className="absolute bottom-[8%] left-[2%] h-[62%] [--r:-9deg] animate-float-slow [animation-delay:-2s]">
              <ProductArt product={heroA} color={heroA.colors[0]} className="h-full drop-shadow-xl [&_svg]:h-full" />
            </div>
            <div className="absolute right-[1%] bottom-[10%] h-[58%] [--r:8deg] animate-float [animation-delay:-4s]">
              <ProductArt product={heroC} color={heroC.colors[0]} className="h-full drop-shadow-xl [&_svg]:h-full" />
            </div>
            <div className="absolute bottom-[3%] left-1/2 z-10 h-[78%] -translate-x-1/2 animate-float">
              <ProductArt product={heroB} color={heroB.colors[0]} className="h-full drop-shadow-2xl [&_svg]:h-full" />
            </div>
          </div>
        </div>
      </section>

      {/* ───────── TELEFONUNU SEÇ ───────── */}
      <section className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8" aria-labelledby="finder">
        <SectionHead
          id="finder"
          eyebrow="Sürətli axtarış"
          title="Telefonunu seç, uyğun qabları gör"
          text="Modelinizə uyğun olmayan qab almaq problemi bitdi."
        />
        <div className="mt-8">
          <ModelFinder brands={brands} />
        </div>
      </section>

      {/* ───────── KATEQORİYALAR ───────── */}
      <section className="mx-auto max-w-7xl px-4 pt-20 sm:px-6 lg:px-8" aria-labelledby="cats">
        <SectionHead id="cats" eyebrow="Kateqoriyalar" title="Nə axtarırsan?" />
        <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-6">
          {shownCategories.map((c) => {
            const rep = all.find((p) => p.category === c.id)!;
            const count = all.filter((p) => p.category === c.id).length;
            return (
              <Link
                key={c.id}
                href={`/mehsullar?kateqoriya=${c.id}`}
                className="group relative flex flex-col overflow-hidden rounded-3xl border border-brand-100 bg-white p-4 shadow-soft transition duration-300 hover:-translate-y-1 hover:shadow-lift"
              >
                <div className="relative -mx-4 -mt-4 mb-3 h-32 overflow-hidden bg-gradient-to-b from-brand-50 to-sage-100">
                  <ProductArt
                    product={rep}
                    className="absolute inset-0 translate-y-5 rotate-6 p-3 transition duration-500 group-hover:translate-y-2 group-hover:rotate-3 [&_svg]:max-h-full"
                  />
                </div>
                {c.parentId && (
                  <p className="mb-0.5 text-[11px] font-bold tracking-wide text-brand-400 uppercase">
                    {categories.find((x) => x.id === c.parentId)?.name}
                  </p>
                )}
                <h3 className="text-sm font-extrabold text-brand-900">{c.name}</h3>
                <p className="mt-0.5 text-xs leading-snug text-brand-600">{c.blurb}</p>
                <p className="mt-3 text-xs font-bold text-brand-500">{count} məhsul</p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ───────── ÇOX SATILANLAR ───────── */}
      <section className="mx-auto max-w-7xl px-4 pt-20 sm:px-6 lg:px-8" aria-labelledby="featured">
        <SectionHead
          id="featured"
          eyebrow="Seçilmişlər"
          title="Ən çox sevilən məhsullar"
          action={{ href: "/mehsullar", label: "Hamısına bax" }}
        />
        <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} whatsapp={settings.whatsapp} />
          ))}
        </div>
      </section>

      {/* ───────── BANNER ───────── */}
      <section className="mx-auto mt-20 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[2rem] bg-brand-600 px-6 py-12 text-white sm:px-12 sm:py-16">
          <div className="pointer-events-none absolute -right-20 -bottom-40 h-96 w-96 rounded-full bg-sage-400/30" />
          <div className="pointer-events-none absolute -top-24 -left-16 h-64 w-64 rounded-full bg-brand-500/50" />
          <div className="relative max-w-2xl">
            <p className="font-script text-2xl text-sage-300">Modelin tapılmadı?</p>
            <h2 className="mt-2 text-3xl font-extrabold sm:text-4xl">Axtardığın qab saytda yoxdur? Bizə yaz.</h2>
            <p className="mt-4 text-brand-100">
              Mağazada daha çox çeşid var. Telefon modelini yaz, sənə uyğun variantların real şəkillərini göndərək.
            </p>
            <a
              href={wa("Salam! Telefonuma uyğun qab axtarıram. Model: ")}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-wa px-7 py-4 font-bold text-white shadow-lift transition hover:bg-wa-dark"
            >
              <WhatsAppIcon width={22} height={22} /> WhatsApp-da yaz
            </a>
          </div>
        </div>
      </section>

      {/* ───────── YENİ GƏLƏNLƏR ───────── */}
      <section className="mx-auto max-w-7xl px-4 pt-20 sm:px-6 lg:px-8" aria-labelledby="new">
        <SectionHead
          id="new"
          eyebrow="Təzə"
          title="Yeni gələnlər"
          action={{ href: "/mehsullar", label: "Kataloqa keç" }}
        />
        <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          {fresh.map((p) => (
            <ProductCard key={p.id} product={p} whatsapp={settings.whatsapp} />
          ))}
        </div>
      </section>

      {/* ───────── NİYƏ BİZ ───────── */}
      <section className="mx-auto max-w-7xl px-4 pt-20 sm:px-6 lg:px-8" aria-labelledby="why">
        <SectionHead id="why" eyebrow="Niyə ByCase?" title="Rahat, etibarlı, sürətli" />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: CameraIcon, title: "Real çəkilişlər", text: "Gördüyünüz məhsul, əldə etdiyiniz məhsuldur. Şəkillər mağazamızda çəkilir." },
            { icon: ShieldIcon, title: "Orijinal və keyfiyyətli", text: "Yoxlanılmış material, dəqiq kəsim, uzun ömürlü istifadə." },
            { icon: TruckIcon, title: "Çatdırılma", text: "Bakı daxili və digər ünvanlara sürətli çatdırılma." },
            { icon: CardIcon, title: "Kredit imkanı", text: "Seçilmiş məhsullar üçün kreditlə almaq mümkündür." },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-3xl border border-brand-100 bg-white p-6 shadow-soft">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-50 text-brand-600">
                <Icon className="h-6 w-6" />
              </span>
              <h3 className="mt-5 text-lg font-extrabold text-brand-900">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-brand-700">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ───────── NECƏ SİFARİŞ ───────── */}
      <section id="nece-sifaris" className="mx-auto max-w-7xl scroll-mt-24 px-4 pt-20 sm:px-6 lg:px-8" aria-labelledby="how">
        <SectionHead id="how" eyebrow="Sifariş" title="3 addımda necə sifariş edim?" />
        <ol className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            { t: "Məhsulu seç", d: "Telefon modelinə uyğun qabı və rəngi seç." },
            { t: "WhatsApp-da yaz", d: "“Sifariş et” düyməsinə bas — model və rəng mesajda hazır olacaq." },
            { t: "Təhvil al", d: "Mağazadan götür, ya da ünvanına çatdıraq." },
          ].map((s, i) => (
            <li key={s.t} className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-50 to-sage-100 p-7">
              <span className="font-script text-7xl leading-none text-brand-600/25">{i + 1}</span>
              <h3 className="mt-2 text-xl font-extrabold text-brand-900">{s.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-brand-700">{s.d}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ───────── INSTAGRAM ───────── */}
      <section className="mx-auto max-w-7xl px-4 pt-20 sm:px-6 lg:px-8" aria-labelledby="ig">
        <SectionHead id="ig" eyebrow="Sosial media" title="Yenilikləri Instagram-da izlə" />
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {settings.instagram.map((i) => (
            <a
              key={i.handle}
              href={instagramUrl(i.handle)}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-4 rounded-3xl border border-brand-100 bg-white p-5 shadow-soft transition hover:-translate-y-1 hover:shadow-lift sm:gap-5 sm:p-6"
            >
              <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-brand-600 to-sage-400 text-white">
                <InstagramIcon className="h-8 w-8" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-lg font-extrabold break-words text-brand-900">@{i.handle}</span>
                <span className="mt-0.5 block text-sm break-words text-brand-600">{i.desc}</span>
              </span>
              <ArrowRightIcon className="h-5 w-5 shrink-0 text-brand-400 transition group-hover:translate-x-1 group-hover:text-brand-700" />
            </a>
          ))}
        </div>
      </section>

      {/* ───────── ƏLAQƏ ───────── */}
      <section id="elaqe" className="mx-auto max-w-7xl scroll-mt-24 px-4 pt-20 sm:px-6 lg:px-8" aria-labelledby="contact">
        <div className="grid overflow-hidden rounded-[2rem] border border-brand-100 bg-white shadow-soft lg:grid-cols-2">
          <div className="p-7 sm:p-10">
            <p className="text-sm font-bold tracking-wide text-brand-500 uppercase">Əlaqə</p>
            <h2 id="contact" className="mt-2 text-3xl font-extrabold text-brand-900">Mağazaya gəl</h2>
            <ul className="mt-8 space-y-6">
              <li className="flex gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand-600"><MapPinIcon className="h-5 w-5" /></span>
                <div>
                  <p className="text-sm font-bold text-brand-500">Ünvan</p>
                  {settings.businessName && <p className="font-extrabold text-brand-900">{settings.businessName}</p>}
                  <p className="font-semibold text-brand-900">{settings.address}</p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand-600"><ClockIcon className="h-5 w-5" /></span>
                <div>
                  <p className="text-sm font-bold text-brand-500">İş saatları</p>
                  <p className="font-semibold text-brand-900">{settings.hours}</p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand-600"><WhatsAppIcon className="h-5 w-5" /></span>
                <div>
                  <p className="text-sm font-bold text-brand-500">WhatsApp</p>
                  <p className="font-semibold text-brand-900">{settings.phoneDisplay}</p>
                </div>
              </li>
            </ul>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a
                href={wa(generalMessage)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-wa px-6 py-3.5 text-sm font-bold text-white transition hover:bg-wa-dark"
              >
                <WhatsAppIcon width={20} height={20} /> WhatsApp-da yaz
              </a>
              <a
                href={mapsUrl(settings)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-50 px-6 py-3.5 text-sm font-bold text-brand-700 transition hover:bg-brand-100"
              >
                <MapPinIcon className="h-5 w-5" /> Xəritədə aç
              </a>
            </div>
          </div>
          <div className="min-h-72 bg-brand-50">
            <iframe
              title="ByCase mağazasının xəritədəki yeri"
              src={mapsEmbed(settings)}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-full min-h-72 w-full border-0"
            />
          </div>
        </div>
      </section>
    </>
  );
}

function SectionHead({
  id,
  eyebrow,
  title,
  text,
  action,
}: {
  id: string;
  eyebrow: string;
  title: string;
  text?: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div className="max-w-2xl">
        <p className="text-sm font-bold tracking-wide text-brand-500 uppercase">{eyebrow}</p>
        <h2 id={id} className="mt-2 text-2xl font-extrabold text-brand-900 sm:text-4xl">
          {title}
        </h2>
        {text && <p className="mt-2 text-brand-700">{text}</p>}
      </div>
      {action && (
        <Link
          href={action.href}
          className="hidden shrink-0 items-center gap-1.5 text-sm font-bold text-brand-600 transition hover:text-brand-800 sm:inline-flex"
        >
          {action.label} <ArrowRightIcon className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}
