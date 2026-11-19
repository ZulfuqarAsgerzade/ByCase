const map: Record<string, string> = {
  ə: "e", Ə: "e", ı: "i", İ: "i", I: "i", ö: "o", Ö: "o", ü: "u", Ü: "u",
  ş: "s", Ş: "s", ç: "c", Ç: "c", ğ: "g", Ğ: "g",
};

export function slugify(input: string) {
  return input
    .replace(/[əƏıİIöÖüÜşŞçÇğĞ]/g, (c) => map[c] ?? c)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** Mövcud slug-larla toqquşma olmasın deyə -2, -3 əlavə edir */
export function uniqueSlug(base: string, taken: Set<string>) {
  const root = base || "mehsul";
  let slug = root;
  let i = 2;
  while (taken.has(slug)) slug = `${root}-${i++}`;
  return slug;
}
