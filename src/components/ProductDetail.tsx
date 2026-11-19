"use client";

import Image from "next/image";
import { useState } from "react";
import { ProductArt } from "./ProductArt";
import { CheckIcon, ShieldIcon, TruckIcon, WhatsAppIcon } from "./icons";
import { formatPrice } from "@/lib/format";
import { productMessage, waLink } from "@/lib/whatsapp";
import { useSettings } from "./SettingsProvider";
import type { Product } from "@/data/types";

export function ProductDetail({ product }: { product: Product }) {
  const { whatsapp } = useSettings();
  const [colorIdx, setColorIdx] = useState(0);
  const [imgIdx, setImgIdx] = useState(0);
  const photos = product.images ?? [];
  const hasPhotos = photos.length > 0;
  const [model, setModel] = useState("");
  const [needModel, setNeedModel] = useState(false);

  const color = product.colors[colorIdx];
  const hasModels = product.models.length > 0;

  function order() {
    if (hasModels && !model) {
      setNeedModel(true);
      document.getElementById("model-picker")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    const url = waLink(
      whatsapp,
      productMessage({
        name: product.name,
        model: model || undefined,
        color: product.colors.length > 1 ? color.name : undefined,
        price: product.price,
        url: window.location.href,
      }),
    );
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="grid gap-8 pb-20 lg:grid-cols-2 lg:gap-14 lg:pb-0">
      {/* Şəkil */}
      <div className="lg:sticky lg:top-28 lg:self-start">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-b from-brand-50 to-sage-100">
          {!hasPhotos && <div className="absolute inset-x-0 bottom-0 h-2/5 rounded-t-[50%] bg-sage-200/70" />}
          <ProductArt
            product={product}
            color={color}
            imageIndex={imgIdx}
            className={`relative aspect-[4/4.4] [&_svg]:max-h-full [&_svg]:drop-shadow-xl ${hasPhotos ? "p-3 sm:p-5" : "p-8 sm:p-12"}`}
          />
          {!hasPhotos && (
            <p className="absolute right-4 bottom-4 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-brand-600 backdrop-blur">
              {color.name}
            </p>
          )}
        </div>

        {photos.length > 1 && (
          <ul className="mt-3 flex gap-2.5 overflow-x-auto pb-1" aria-label="Şəkillər">
            {photos.map((src, i) => (
              <li key={src} className="shrink-0">
                <button
                  onClick={() => setImgIdx(i)}
                  aria-label={`Şəkil ${i + 1}`}
                  aria-current={i === imgIdx}
                  className={`relative h-20 w-20 overflow-hidden rounded-2xl border-2 bg-brand-50 transition ${
                    i === imgIdx ? "border-brand-600" : "border-transparent opacity-80 hover:opacity-100"
                  }`}
                >
                  <Image src={src} alt="" fill sizes="80px" className="object-cover" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Məlumat */}
      <div>
        <p className="text-sm font-bold text-brand-500">{product.fit}</p>
        <h1 className="mt-2 text-3xl leading-tight font-extrabold text-brand-900 sm:text-4xl">{product.name}</h1>
        <div className="mt-4 flex items-baseline gap-3">
          <span className="text-3xl font-extrabold text-brand-700">{formatPrice(product.price)}</span>
          {product.oldPrice && <span className="text-lg text-brand-400 line-through">{formatPrice(product.oldPrice)}</span>}
        </div>
        <p className="mt-5 leading-relaxed text-brand-800/90">{product.description}</p>

        {/* Rəng */}
        {product.colors.length > 1 && (
          <div className="mt-8">
            <p className="text-sm font-bold text-brand-900">
              Rəng: <span className="font-semibold text-brand-600">{color.name}</span>
            </p>
            <div className="mt-3 flex flex-wrap gap-3">
              {product.colors.map((c, i) => (
                <button
                  key={c.name}
                  onClick={() => setColorIdx(i)}
                  aria-label={c.name}
                  aria-pressed={i === colorIdx}
                  title={c.name}
                  className={`h-11 w-11 rounded-full border-2 p-0.5 transition ${
                    i === colorIdx ? "border-brand-600 scale-110" : "border-transparent hover:border-brand-300"
                  }`}
                >
                  <span
                    className="block h-full w-full rounded-full ring-1 ring-black/10"
                    style={{ background: c.hex2 ? `linear-gradient(135deg, ${c.hex} 50%, ${c.hex2} 50%)` : c.hex }}
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Model */}
        {hasModels && (
          <div className="mt-8 scroll-mt-32" id="model-picker">
            <p className="text-sm font-bold text-brand-900">
              Telefon modeli{" "}
              {needModel && !model && <span className="ml-1 font-semibold text-coral">— zəhmət olmasa seçin</span>}
            </p>
            <div className="mt-3 flex flex-wrap gap-2.5">
              {product.models.map((m) => (
                <button
                  key={m}
                  onClick={() => {
                    setModel(m);
                    setNeedModel(false);
                  }}
                  aria-pressed={m === model}
                  className={`rounded-full border px-4 py-2.5 text-sm font-semibold transition ${
                    m === model
                      ? "border-brand-600 bg-brand-600 text-white shadow-soft"
                      : needModel
                        ? "border-coral/60 bg-white text-brand-800 hover:border-brand-600"
                        : "border-brand-200 bg-white text-brand-800 hover:border-brand-500"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <button
          onClick={order}
          className="mt-9 inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-wa px-6 py-4 text-base font-extrabold text-white shadow-lift transition hover:bg-wa-dark active:scale-[0.99] sm:w-auto sm:min-w-80"
        >
          <WhatsAppIcon width={24} height={24} />
          WhatsApp-da sifariş et
        </button>
        <p className="mt-3 text-sm text-brand-600">
          Seçdiyiniz model və rəng mesaja avtomatik yazılacaq. Mövcudluq WhatsApp-da təsdiqlənir.
        </p>

        {/* Xüsusiyyətlər */}
        <ul className="mt-9 grid gap-3 sm:grid-cols-2">
          {product.features.map((f) => (
            <li key={f} className="flex items-center gap-3 text-sm font-semibold text-brand-800">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-sage-200 text-brand-700">
                <CheckIcon className="h-3.5 w-3.5" strokeWidth={3} />
              </span>
              {f}
            </li>
          ))}
        </ul>

        <div className="mt-9 grid gap-3 rounded-3xl bg-brand-50 p-5 sm:grid-cols-2">
          <div className="flex items-center gap-3 text-sm font-semibold text-brand-800">
            <TruckIcon className="h-6 w-6 text-brand-600" /> Bütün ünvanlara çatdırılma
          </div>
          <div className="flex items-center gap-3 text-sm font-semibold text-brand-800">
            <ShieldIcon className="h-6 w-6 text-brand-600" /> Keyfiyyət zəmanəti
          </div>
        </div>
      </div>

      {/* Mobil: yapışqan sifariş paneli */}
      <div className="fixed inset-x-0 bottom-0 z-30 flex items-center gap-3 border-t border-brand-100 bg-white/95 px-4 py-3 shadow-lift backdrop-blur lg:hidden">
        <div className="shrink-0">
          <p className="text-xs font-semibold text-brand-500">Qiymət</p>
          <p className="text-xl leading-none font-extrabold text-brand-700">{formatPrice(product.price)}</p>
        </div>
        <button
          onClick={order}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-wa py-3.5 text-[0.95rem] font-extrabold text-white active:bg-wa-dark"
        >
          <WhatsAppIcon width={20} height={20} />
          WhatsApp-da sifariş et
        </button>
      </div>
    </div>
  );
}
