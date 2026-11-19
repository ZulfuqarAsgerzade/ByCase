/** 18 → "18 ₼", 19.9 → "19.90 ₼" (kəsr olanda həmişə iki rəqəm) */
export const formatPrice = (n: number) => `${Number.isInteger(n) ? n : n.toFixed(2)} ₼`;
