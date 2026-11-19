import { formatPrice } from "./format";

export function waLink(number: string, text?: string) {
  const base = `https://wa.me/${number}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

export const generalMessage = "Salam! ByCase saytından yazıram. Məlumat almaq istəyirdim.";

export function productMessage(p: {
  name: string;
  model?: string;
  color?: string;
  price: number;
  url?: string;
}) {
  const lines = [
    "Salam! ByCase saytından yazıram. Bu məhsulla maraqlanıram:",
    "",
    `📱 ${p.name}`,
    p.model ? `Model: ${p.model}` : null,
    p.color ? `Rəng: ${p.color}` : null,
    `Qiymət: ${formatPrice(p.price)}`,
    p.url ? `🔗 ${p.url}` : null,
    "",
    "Mövcuddur?",
  ];
  return lines.filter((l) => l !== null).join("\n");
}

/** Əl ilə yazılmış nömrəni wa.me formatına salır: 055 418 07 16 → 994554180716 */
export function normalizeWhatsapp(input: string): string | null {
  let d = input.replace(/\D/g, "");
  if (d.startsWith("00")) d = d.slice(2);
  if (d.startsWith("0") && d.length === 10) d = "994" + d.slice(1);
  if (d.length === 9) d = "994" + d;
  return /^\d{11,15}$/.test(d) ? d : null;
}

/** 994554180716 → +994 55 418 07 16 */
export function formatPhone(digits: string) {
  const m = digits.match(/^994(\d{2})(\d{3})(\d{2})(\d{2})$/);
  return m ? `+994 ${m[1]} ${m[2]} ${m[3]} ${m[4]}` : `+${digits}`;
}
