import Image from "next/image";
import { darken, lighten, mix } from "@/lib/color";
import type { AccessoryKind, Camera, Pattern, Product, ProductColor } from "@/data/types";

/* ---------- Lens ---------- */
function Lens({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="#0d1117" stroke="rgba(255,255,255,.3)" strokeWidth="1.6" />
      <circle cx={cx} cy={cy} r={r * 0.6} fill="#1b2a3a" />
      <circle cx={cx} cy={cy} r={r * 0.28} fill="#0a0f16" />
      <circle cx={cx - r * 0.3} cy={cy - r * 0.3} r={r * 0.14} fill="#fff" opacity=".6" />
    </g>
  );
}

/* ---------- Case ---------- */
type CaseProps = {
  uid: string;
  color: string;
  color2?: string;
  pattern: Pattern;
  camera?: Camera;
  magsafe?: boolean;
};

function CaseArt({ uid, color, color2, pattern, camera = "pro", magsafe }: CaseProps) {
  const id = (n: string) => `${n}-${uid}`;
  const clear = pattern === "clear";
  const accent = color2 ?? "#ffffff";
  const light = lighten(color, 0.3);
  const dark = darken(color, 0.22);
  const gradEnd = color2 ?? mix(color, "#8b5cf6", 0.35);

  const bodyFill =
    pattern === "gradient"
      ? `url(#${id("grad")})`
      : clear
        ? `url(#${id("phone")})`
        : `url(#${id("body")})`;

  const camBox = clear ? "rgba(255,255,255,.35)" : "rgba(0,0,0,.28)";

  return (
    <svg viewBox="0 0 200 410" className="h-full w-auto" role="img" aria-hidden>
      <defs>
        <linearGradient id={id("body")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={light} />
          <stop offset=".5" stopColor={color} />
          <stop offset="1" stopColor={dark} />
        </linearGradient>
        <linearGradient id={id("grad")} x1=".15" y1="0" x2=".85" y2="1">
          <stop offset="0" stopColor={color} />
          <stop offset="1" stopColor={gradEnd} />
        </linearGradient>
        <linearGradient id={id("phone")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#e9edf1" />
          <stop offset="1" stopColor="#c4ccd4" />
        </linearGradient>
        <linearGradient id={id("shine")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".38" />
          <stop offset=".45" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <clipPath id={id("clip")}>
          <rect x="20" y="10" width="160" height="380" rx="40" />
        </clipPath>
        <pattern id={id("stripes")} width="26" height="26" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
          <rect width="13" height="26" fill={accent} opacity=".5" />
        </pattern>
        <pattern id={id("dots")} width="6" height="6" patternUnits="userSpaceOnUse">
          <circle cx="1.5" cy="1.5" r="1" fill="#000" opacity=".18" />
          <circle cx="4.5" cy="4.5" r=".7" fill="#fff" opacity=".12" />
        </pattern>
        <pattern id={id("checker")} width="40" height="40" patternUnits="userSpaceOnUse">
          <rect width="20" height="20" fill={accent} />
          <rect x="20" y="20" width="20" height="20" fill={accent} />
        </pattern>
        <filter id={id("blur")} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="9" />
        </filter>
        <filter id={id("blur2")} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="1.4" />
        </filter>
      </defs>

      <ellipse cx="100" cy="400" rx="62" ry="5" fill="#0c1f28" opacity=".14" />

      <g clipPath={`url(#${id("clip")})`}>
        <rect x="20" y="10" width="160" height="380" fill={bodyFill} />

        {pattern === "stripes" && <rect x="0" y="0" width="200" height="410" fill={`url(#${id("stripes")})`} />}
        {pattern === "checker" && <rect x="0" y="0" width="200" height="410" fill={`url(#${id("checker")})`} opacity=".9" />}
        {pattern === "leather" && <rect x="0" y="0" width="200" height="410" fill={`url(#${id("dots")})`} />}
        {pattern === "marble" && (
          <g>
            <ellipse cx="60" cy="140" rx="55" ry="38" fill={accent} opacity=".55" filter={`url(#${id("blur")})`} />
            <ellipse cx="140" cy="260" rx="60" ry="40" fill={accent} opacity=".5" filter={`url(#${id("blur")})`} />
            <ellipse cx="90" cy="350" rx="40" ry="26" fill={accent} opacity=".35" filter={`url(#${id("blur")})`} />
            <g fill="none" stroke={mix(color, "#000", 0.45)} strokeWidth="1.2" opacity=".55" filter={`url(#${id("blur2")})`}>
              <path d="M30 80c40 20 30 60 70 70s30 50 80 55" />
              <path d="M60 230c30-10 40 20 70 20s40 40 60 60" />
              <path d="M20 300c30 0 50-20 80-10" />
            </g>
          </g>
        )}
        {clear && (
          <g>
            {/* telefonun özü */}
            <rect x="30" y="20" width="140" height="360" rx="32" fill={`url(#${id("phone")})`} />
            <rect x="30" y="20" width="140" height="360" rx="32" fill={color} opacity=".4" />
            <circle cx="100" cy="210" r="14" fill="#fff" opacity=".55" />
          </g>
        )}

        {/* loqo yazısı */}
        {!clear && (
          <text
            x="100"
            y="352"
            textAnchor="middle"
            fontSize="22"
            fill="#fff"
            opacity=".55"
            style={{ fontFamily: "var(--font-script), cursive" }}
          >
            By Case
          </text>
        )}

        {/* MagSafe */}
        {magsafe && (
          <g fill="none" stroke={clear ? "rgba(20,48,60,.28)" : "rgba(255,255,255,.4)"}>
            <circle cx="100" cy="215" r="40" strokeWidth="2.4" />
            <circle cx="100" cy="215" r="30" strokeWidth="1" strokeDasharray="2 4" />
          </g>
        )}

        {/* Kamera */}
        {camera === "pro" && (
          <g>
            <rect x="34" y="24" width="76" height="76" rx="22" fill={camBox} />
            <Lens cx={56} cy={46} r={13} />
            <Lens cx={56} cy={78} r={13} />
            <Lens cx={88} cy={62} r={13} />
            <circle cx="92" cy="36" r="3.6" fill="#f6efd8" opacity=".9" />
          </g>
        )}
        {camera === "plain" && (
          <g>
            <rect x="34" y="24" width="48" height="80" rx="24" fill={camBox} />
            <Lens cx={58} cy={50} r={13} />
            <Lens cx={58} cy={80} r={13} />
          </g>
        )}
        {camera === "samsung" && (
          <g>
            <Lens cx={54} cy={52} r={13} />
            <Lens cx={54} cy={88} r={13} />
            <Lens cx={54} cy={124} r={13} />
            <circle cx="80" cy="52" r="3.4" fill="#f6efd8" opacity=".9" />
          </g>
        )}

        <polygon points="20,10 120,10 20,200" fill={`url(#${id("shine")})`} />
      </g>

      {/* kənar çərçivə */}
      <rect
        x="20"
        y="10"
        width="160"
        height="380"
        rx="40"
        fill="none"
        stroke={clear ? mix(color, "#fff", 0.2) : dark}
        strokeOpacity={clear ? 0.6 : 0.35}
        strokeWidth={clear ? 6 : 2.5}
      />
      <rect x="23" y="13" width="154" height="374" rx="37" fill="none" stroke="#fff" strokeOpacity={clear ? 0.5 : 0.25} strokeWidth="1" />
    </svg>
  );
}

/* ---------- Accessory ---------- */
function AccessoryArt({ kind, color, uid }: { kind: AccessoryKind; color: string; uid: string }) {
  const light = lighten(color, 0.25);
  const dark = darken(color, 0.2);
  const stroke = darken(color, 0.3);
  const gid = `acc-${uid}`;
  return (
    <svg viewBox="0 0 200 300" className="h-full w-auto" role="img" aria-hidden>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={light} />
          <stop offset="1" stopColor={dark} />
        </linearGradient>
      </defs>
      <ellipse cx="100" cy="280" rx="60" ry="5" fill="#0c1f28" opacity=".14" />

      {kind === "glass" && (
        <g>
          <rect x="40" y="20" width="120" height="250" rx="22" fill="rgba(180,215,224,.35)" stroke={stroke} strokeOpacity=".5" strokeWidth="3" />
          <rect x="52" y="32" width="96" height="226" rx="14" fill={color} fillOpacity=".25" />
          <path d="M62 250 148 70M62 190 120 62" stroke="#fff" strokeWidth="10" strokeLinecap="round" opacity=".5" />
          <rect x="82" y="26" width="36" height="7" rx="3.5" fill={stroke} opacity=".5" />
        </g>
      )}

      {kind === "charger" && (
        <g>
          <rect x="62" y="60" width="76" height="86" rx="16" fill={`url(#${gid})`} stroke={stroke} strokeOpacity=".3" strokeWidth="2" />
          <rect x="82" y="30" width="8" height="30" rx="2" fill="#aab4bd" />
          <rect x="110" y="30" width="8" height="30" rx="2" fill="#aab4bd" />
          <rect x="82" y="126" width="36" height="10" rx="5" fill={stroke} opacity=".55" />
          <path d="M70 146c0 50 60 40 60 90" fill="none" stroke={stroke} strokeOpacity=".7" strokeWidth="5" strokeLinecap="round" />
          <rect x="116" y="232" width="28" height="36" rx="6" fill={`url(#${gid})`} stroke={stroke} strokeOpacity=".4" strokeWidth="2" />
        </g>
      )}

      {kind === "cable" && (
        <g fill="none" strokeLinecap="round">
          <path d="M60 60c-30 10-20 50 20 50s70 10 70 40-40 40-70 40-30 40 20 50" stroke={stroke} strokeOpacity=".25" strokeWidth="10" />
          <path d="M60 60c-30 10-20 50 20 50s70 10 70 40-40 40-70 40-30 40 20 50" stroke={color} strokeWidth="6" />
          <rect x="50" y="38" width="28" height="30" rx="7" fill="#aab4bd" stroke="none" />
          <rect x="100" y="238" width="28" height="30" rx="7" fill="#aab4bd" stroke="none" />
        </g>
      )}

      {kind === "airpods" && (
        <g>
          <rect x="46" y="80" width="108" height="150" rx="40" fill={`url(#${gid})`} stroke={stroke} strokeOpacity=".3" strokeWidth="2" />
          <path d="M46 130h108" stroke={stroke} strokeOpacity=".45" strokeWidth="3" />
          <circle cx="100" cy="190" r="9" fill="none" stroke={stroke} strokeOpacity=".4" strokeWidth="3" />
          <path d="M100 80V52a14 14 0 1 1 14 14" fill="none" stroke="#aab4bd" strokeWidth="5" strokeLinecap="round" />
        </g>
      )}

      {kind === "holder" && (
        <g>
          <rect x="46" y="60" width="108" height="170" rx="22" fill={`url(#${gid})`} stroke={stroke} strokeOpacity=".3" strokeWidth="2" />
          <rect x="62" y="82" width="76" height="40" rx="8" fill="#fff" fillOpacity=".25" />
          <rect x="62" y="130" width="76" height="40" rx="8" fill="#fff" fillOpacity=".18" />
          <circle cx="100" cy="196" r="12" fill="none" stroke="#fff" strokeOpacity=".5" strokeWidth="3" />
        </g>
      )}
    </svg>
  );
}

/* ---------- Public component ---------- */
export function ProductArt({
  product,
  color,
  className = "",
  imageIndex = 0,
}: {
  product: Pick<Product, "id" | "name" | "kind" | "art" | "images" | "colors">;
  color?: ProductColor;
  className?: string;
  /** Real şəkillər olanda hansının göstəriləcəyi */
  imageIndex?: number;
}) {
  const col = color ?? product.colors[0];

  if (product.images?.length) {
    const src = product.images[Math.min(imageIndex, product.images.length - 1)];
    return (
      <div className={className}>
        <div className="relative h-full w-full">
          <Image src={src} alt={product.name} fill sizes="(min-width:1024px) 40vw, 60vw" className="object-contain" />
        </div>
      </div>
    );
  }

  const uid = `${product.id}-${col.hex.replace("#", "")}`;
  return (
    <div className={`flex items-center justify-center ${className}`}>
      {product.kind === "case" ? (
        <CaseArt
          uid={uid}
          color={col.hex}
          color2={col.hex2}
          pattern={product.art.pattern ?? "solid"}
          camera={product.art.camera}
          magsafe={product.art.magsafe}
        />
      ) : (
        <AccessoryArt uid={uid} kind={product.art.accessory ?? "holder"} color={col.hex} />
      )}
    </div>
  );
}
