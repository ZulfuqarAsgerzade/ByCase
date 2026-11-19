/** Admin panelin bölmələri. Həm sol menyu, həm də idarə paneli kartları bundan istifadə edir. */
export const adminSections = [
  {
    href: "/admin/mehsullar",
    label: "Məhsullar",
    icon: "M4 7h16v13H4zM8 7V4h8v3M9 12h6",
    about: "Saytdakı qablar və aksesuarlar, qiymətlər, şəkillər, rənglər.",
  },
  {
    href: "/admin/kateqoriyalar",
    label: "Kateqoriyalar",
    icon: "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z",
    about: "Kataloqun bölmələri və hər birindəki məhsullar.",
  },
  {
    href: "/admin/modeller",
    label: "Telefon modelləri",
    icon: "M8 3h8a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1ZM11 18h2",
    about: "“Telefonunu seç” bölməsindəki brendlər və modellər.",
  },
  {
    href: "/admin/ayarlar",
    label: "Mağaza ayarları",
    icon: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM19 12a7 7 0 0 0-.1-1.2l2-1.5-2-3.4-2.3.9a7 7 0 0 0-2-1.2L14.2 3h-4l-.4 2.6a7 7 0 0 0-2 1.2l-2.3-.9-2 3.4 2 1.5A7 7 0 0 0 5 12c0 .4 0 .8.1 1.2l-2 1.5 2 3.4 2.3-.9a7 7 0 0 0 2 1.2l.4 2.6h4l.4-2.6a7 7 0 0 0 2-1.2l2.3.9 2-3.4-2-1.5c.1-.4.1-.8.1-1.2Z",
    about: "WhatsApp nömrəsi, ünvan, iş saatları, Instagram.",
  },
] as const;

export const dashboardItem = {
  href: "/admin",
  label: "İdarə paneli",
  icon: "M3 12 12 4l9 8M5 10v9h5v-5h4v5h5v-9",
} as const;
