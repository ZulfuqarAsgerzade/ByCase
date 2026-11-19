/** Kateqoriya identifikatoru (admin paneldən yaradılır, məs. "silikon") */
export type CategoryId = string;

export type Pattern =
  | "solid"
  | "gradient"
  | "stripes"
  | "marble"
  | "clear"
  | "leather"
  | "checker";

export type Camera = "pro" | "plain" | "samsung";

export type AccessoryKind = "glass" | "charger" | "cable" | "airpods" | "holder";

export type Badge = "new" | "bestseller" | "sale";

export type ProductColor = { name: string; hex: string; hex2?: string };

export type ProductArtConfig = {
  pattern?: Pattern;
  camera?: Camera;
  magsafe?: boolean;
  accessory?: AccessoryKind;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  short: string;
  description: string;
  category: CategoryId;
  kind: "case" | "accessory";
  /** AZN */
  price: number;
  oldPrice?: number;
  badge?: Badge;
  featured?: boolean;
  /** Saytda göstərilir. false olanda məhsul gizlədilir. */
  active: boolean;
  /** Kartda göstərilən qısa uyğunluq mətni, məs. "iPhone 17 seriyası" */
  fit: string;
  /** Uyğun telefon modelləri */
  models: string[];
  colors: ProductColor[];
  /** Real şəkil olmadıqda göstərilən illüstrasiya parametrləri */
  art: ProductArtConfig;
  /** Real şəkillər ("/uploads/..."). Boşdursa illüstrasiya göstərilir. */
  images?: string[];
  features: string[];
  createdAt: string;
  updatedAt?: string;
};

export type Category = {
  id: CategoryId;
  name: string;
  blurb: string;
  /** Alt kateqoriyadırsa, üst kateqoriyanın id-si. Yoxdursa, əsas kateqoriyadır (iki səviyyə). */
  parentId?: CategoryId;
};

export type PhoneBrand = {
  id: string;
  name: string;
  models: string[];
};

export type InstagramAccount = {
  handle: string;
  title: string;
  desc: string;
};

export type Settings = {
  /** Beynəlxalq formatda, + və boşluqsuz: 994554180716 */
  whatsapp: string;
  phoneDisplay: string;
  address: string;
  /** Biznesin Google Maps-dəki adı. Xəritədə dəqiq nöqtə və ad bununla tapılır. */
  businessName?: string;
  /** Google Maps-də biznesin linki ("Paylaş" düyməsindən). "Xəritədə aç" düyməsi birbaşa bura aparır. */
  mapsLink?: string;
  hours: string;
  instagram: InstagramAccount[];
};

export type DB = {
  version: 1;
  settings: Settings;
  categories: Category[];
  brands: PhoneBrand[];
  products: Product[];
};
