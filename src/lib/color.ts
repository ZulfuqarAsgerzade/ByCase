function parse(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  return [
    parseInt(full.slice(0, 2), 16),
    parseInt(full.slice(2, 4), 16),
    parseInt(full.slice(4, 6), 16),
  ];
}

/** a rəngini b rəngi ilə t (0..1) nisbətində qarışdırır */
export function mix(a: string, b: string, t: number) {
  const [r1, g1, b1] = parse(a);
  const [r2, g2, b2] = parse(b);
  const m = (x: number, y: number) => Math.round(x + (y - x) * t);
  const to = (n: number) => n.toString(16).padStart(2, "0");
  return `#${to(m(r1, r2))}${to(m(g1, g2))}${to(m(b1, b2))}`;
}

export const lighten = (hex: string, t: number) => mix(hex, "#ffffff", t);
export const darken = (hex: string, t: number) => mix(hex, "#000000", t);

/** Rəngin parlaq olub-olmadığını yoxlayır (mətn rəngi seçmək üçün) */
export function isLight(hex: string) {
  const [r, g, b] = parse(hex);
  return (r * 299 + g * 587 + b * 114) / 1000 > 160;
}
