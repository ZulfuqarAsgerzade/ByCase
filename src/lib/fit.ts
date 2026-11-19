/** Seçilmiş modellərdən kartda görünən qısa uyğunluq mətni yaradır */
export function autoFit(models: string[]): string {
  if (models.length === 0) return "";

  // Hamısı iPhone-dur: nömrəli modellərdən seriya aralığı çıxarılır ("iPhone Air" kimi nömrəsiz modellər aralığa təsir etmir)
  if (models.every((m) => /^iPhone\b/.test(m))) {
    const nums = [...new Set(models.map((m) => m.match(/^iPhone (\d+)/)?.[1]).filter((n): n is string => !!n).map(Number))].sort(
      (a, b) => a - b,
    );
    if (nums.length === 1) return `iPhone ${nums[0]} seriyası`;
    if (nums.length > 1) return `iPhone ${nums[0]} – ${nums[nums.length - 1]} seriyası`;
  }

  const galaxy = models.filter((m) => m.startsWith("Galaxy"));
  if (galaxy.length === models.length) {
    const series = [...new Set(galaxy.map((m) => m.match(/^Galaxy (S\d+)/)?.[1]).filter(Boolean))];
    if (series.length === 1) return `Galaxy ${series[0]} seriyası`;
  }

  if (models.length <= 2) return models.join(" / ");
  return `${models[0]} +${models.length - 1}`;
}
