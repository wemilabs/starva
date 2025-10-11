export const STATUS_VALUES = ["in_stock", "out_of_stock", "archived"] as const;
export type StatusValue = (typeof STATUS_VALUES)[number];

export const COUNTRIES = [
  { code: "+250", name: "Rwanda", flag: "🇷🇼" },
  { code: "+241", name: "Gabon", flag: "🇬🇦" },
] as const;
