import type { FeedbackStatus, FeedbackType } from "@/db/schema";

export const GENERAL_BRANDING_IMG_URL =
  "https://hsl8jk540a.ufs.sh/f/JFF4Q8WebB6d29uSOKR1NjHfKprbQATzOds86omZkUBPnG2c";
export const FALLBACK_PRODUCT_IMG_URL =
  "https://hsl8jk540a.ufs.sh/f/JFF4Q8WebB6d89s9BRYhvCEDrKcu2HNpfYQo7eR4FUT8wVgS";
export const ERROR_PAGE_IMG_URL =
  "https://hsl8jk540a.ufs.sh/f/JFF4Q8WebB6db6Se9J5oPvMdz2Zcih1tWnNrgmwjYaRqfCuK";
export const NOTFOUND_PAGE_IMG_URL =
  "https://hsl8jk540a.ufs.sh/f/JFF4Q8WebB6dJdyQ7mebB6d1NpIUrVzHcsfFA7aEkjQ4oDvS";

export const PRODUCT_STATUS_VALUES = [
  "draft",
  "in_stock",
  "out_of_stock",
  "archived",
] as const;

export const COUNTRIES = [
  { code: "+250", name: "Rwanda", flag: "🇷🇼" },
  { code: "+241", name: "Gabon", flag: "🇬🇦" },
] as const;

export const ORDER_STATUS_VALUES = [
  "pending",
  "confirmed",
  "preparing",
  "ready",
  "delivered",
  "cancelled",
] as const;

export const DAYS = [
  { key: "monday", label: "Monday" },
  { key: "tuesday", label: "Tuesday" },
  { key: "wednesday", label: "Wednesday" },
  { key: "thursday", label: "Thursday" },
  { key: "friday", label: "Friday" },
  { key: "saturday", label: "Saturday" },
  { key: "sunday", label: "Sunday" },
] as const;

export const DEFAULT_HOURS = {
  open: "09:00",
  close: "17:00",
  closed: true,
} as const;

export const today = new Date()
  .toLocaleDateString("en-US", { weekday: "long" })
  .toLowerCase();

export const FEEDBACK_TYPE_LABELS = {
  bug: "🐛 Bug",
  feature: "✨ Feature",
  improvement: "📈 Improvement",
  general: "💬 General",
} as const;

export const FEEDBACK_STATUS_VARIANTS = {
  pending: "secondary",
  reviewing: "default",
  completed: "available",
  rejected: "destructive",
} as const;

export const FEEDBACK_TYPE_VALUES = [
  "bug",
  "feature",
  "improvement",
  "general",
] as const;

export const FEEDBACK_STATUS_VALUES = [
  "pending",
  "reviewing",
  "completed",
  "rejected",
] as const;

export const feedbackTypeOptions: {
  value: FeedbackType | "all";
  label: string;
}[] = [
  { value: "all", label: "All Types" },
  { value: "bug", label: "🐛 Bug" },
  { value: "feature", label: "✨ Feature" },
  { value: "improvement", label: "📈 Improvement" },
  { value: "general", label: "💬 General" },
];

export const feedbackStatusOptions: {
  value: FeedbackStatus | "all";
  label: string;
}[] = [
  { value: "all", label: "All Status" },
  { value: "pending", label: "Pending" },
  { value: "reviewing", label: "Reviewing" },
  { value: "completed", label: "Completed" },
  { value: "rejected", label: "Rejected" },
];

export type PricingPlan = {
  name: string;
  description: string;
  price: number | null;
  originalPrice: number | null;
  period: string;
  orderLimit: number | null;
  maxOrgs: number | null;
  maxProductsPerOrg: number | null;
  features: readonly string[];
  highlighted: boolean;
  cta: string;
};

export const PRICING_PLANS: PricingPlan[] = [
  {
    name: "Free",
    description: "Perfect for students & side hustlers",
    price: 0,
    originalPrice: null,
    period: "month",
    orderLimit: 50,
    maxOrgs: 2,
    maxProductsPerOrg: 12,
    features: [
      "2 businesses",
      "12 products per business",
      "50 orders/month",
      "Basic sales dashboard",
      "7-day data retention",
      "Community support",
      "Full transaction processing",
    ],
    highlighted: false,
    cta: "Get Started Free",
  },
  {
    name: "Growth",
    description: "For growing businesses & multiple locations",
    price: 90,
    originalPrice: null,
    period: "month",
    orderLimit: 500,
    maxOrgs: 10,
    maxProductsPerOrg: 50,
    features: [
      "10 businesses",
      "50 products per business",
      "500 orders/month",
      "Customer analytics",
      "Limited AI-powered insights",
      "30-day data retention",
      "Priority support",
    ],
    highlighted: true,
    cta: "Start Free Trial",
  },
  {
    name: "Pro",
    description: "For established businesses & large operations",
    price: 200,
    originalPrice: null,
    period: "month",
    orderLimit: 2000,
    maxOrgs: null,
    maxProductsPerOrg: null,
    features: [
      "Unlimited businesses",
      "Unlimited products",
      "2,000 orders/month",
      "Advanced analytics",
      "Full capacity AI-powered management",
      "90-day data retention",
      "24/7 priority support",
      "API access for integrations",
    ],
    highlighted: false,
    cta: "Start Free Trial",
  },
  {
    name: "Enterprise",
    description: "For large organizations and custom requirements",
    price: null,
    originalPrice: null,
    period: "month",
    orderLimit: null,
    maxOrgs: null,
    maxProductsPerOrg: null,
    features: [
      "Unlimited everything",
      "Custom integrations",
      "White-label solutions",
      "Dedicated account manager",
      "SLA guarantee",
      "Custom analytics & reporting",
      "Unlimited team members",
      "Unlimited data retention",
      "Priority feature requests",
    ],
    highlighted: false,
    cta: "Contact Sales",
  },
] as const;

export const CATEGORY_CONTENT: Record<
  string,
  {
    title: string;
    description: string;
    keywords: string[];
  }
> = {
  "health-wellness": {
    title: "Health & Wellness",
    description:
      "Discover vitamins, supplements, and wellness products from local partners",
    keywords: [
      "health",
      "wellness",
      "vitamins",
      "supplements",
      "fitness",
      "natural",
    ],
  },
  "food-groceries": {
    title: "Food & Groceries",
    description:
      "Fresh food, groceries, and meal ingredients from our local partners",
    keywords: ["food", "groceries", "fresh", "meals", "ingredients", "local"],
  },
  clothing: {
    title: "Clothing & Fashion",
    description:
      "Browse clothing, apparel, and fashion items from our local partners",
    keywords: ["clothing", "fashion", "apparel", "style", "outfits", "local"],
  },
  "real-estate": {
    title: "Real Estate & Property",
    description: "Find properties, apartments, and real estate services",
    keywords: [
      "real estate",
      "property",
      "apartments",
      "homes",
      "rentals",
      "housing",
    ],
  },
  footwear: {
    title: "Footwear & Shoes",
    description:
      "Discover shoes, sneakers, and footwear from our local partners",
    keywords: ["shoes", "footwear", "sneakers", "boots", "sandals", "local"],
  },
  "beauty-personal-care": {
    title: "Beauty & Personal Care",
    description: "Find beauty products, skincare, and personal care items",
    keywords: [
      "beauty",
      "skincare",
      "cosmetics",
      "personal care",
      "makeup",
      "grooming",
    ],
  },
  "jewelry-accessories": {
    title: "Jewelry & Accessories",
    description: "Browse jewelry, watches, and fashion accessories",
    keywords: [
      "jewelry",
      "accessories",
      "watches",
      "necklaces",
      "rings",
      "fashion",
    ],
  },
  electronics: {
    title: "Electronics & Gadgets",
    description: "Discover electronics, gadgets, and tech products",
    keywords: [
      "electronics",
      "gadgets",
      "tech",
      "devices",
      "computers",
      "phones",
    ],
  },
  appliances: {
    title: "Home Appliances",
    description: "Find home appliances and kitchen equipment",
    keywords: [
      "appliances",
      "home",
      "kitchen",
      "electronics",
      "equipment",
      "household",
    ],
  },
  furniture: {
    title: "Furniture & Home Decor",
    description: "Browse furniture, home decor, and interior items",
    keywords: [
      "furniture",
      "home decor",
      "interior",
      "sofas",
      "tables",
      "chairs",
    ],
  },
  "books-media": {
    title: "Books & Media",
    description: "Discover books, music, movies, and media content",
    keywords: ["books", "media", "music", "movies", "reading", "entertainment"],
  },
  automotive: {
    title: "Automotive & Vehicle Parts",
    description: "Find car parts, accessories, and automotive services",
    keywords: [
      "automotive",
      "cars",
      "vehicles",
      "parts",
      "accessories",
      "services",
    ],
  },
  "toys-games": {
    title: "Toys & Games",
    description: "Browse toys, games, and entertainment for all ages",
    keywords: ["toys", "games", "entertainment", "kids", "play", "fun"],
  },
  others: {
    title: "Other Products",
    description: "Discover unique products and miscellaneous items",
    keywords: [
      "miscellaneous",
      "unique",
      "special",
      "other",
      "various",
      "diverse",
    ],
  },
} as const;

export const CATEGORY_CONFIG = {
  "food-groceries": {
    label: "Food & Groceries",
    icon: "ShoppingCart",
    priority: 1,
  },
  clothing: {
    label: "Clothing",
    icon: "Shirt",
    priority: 2,
  },
  "real-estate": {
    label: "Real Estate",
    icon: "Home",
    priority: 3,
  },
  electronics: {
    label: "Electronics",
    icon: "Smartphone",
    priority: 4,
  },
  "health-wellness": {
    label: "Health & Wellness",
    icon: "Heart",
    priority: 5,
  },
  footwear: {
    label: "Footwear",
    icon: "Footprints",
    priority: 6,
  },
  "beauty-personal-care": {
    label: "Beauty & Personal Care",
    icon: "Sparkles",
    priority: 7,
  },
  "jewelry-accessories": {
    label: "Jewelry & Accessories",
    icon: "Gem",
    priority: 8,
  },
  appliances: {
    label: "Appliances",
    icon: "Refrigerator",
    priority: 9,
  },
  furniture: {
    label: "Furniture",
    icon: "Sofa",
    priority: 10,
  },
  "books-media": {
    label: "Books & Media",
    icon: "BookOpen",
    priority: 11,
  },
  automotive: {
    label: "Automotive",
    icon: "Car",
    priority: 12,
  },
  "toys-games": {
    label: "Toys & Games",
    icon: "Gamepad2",
    priority: 13,
  },
  others: {
    label: "Others",
    icon: "MoreHorizontal",
    priority: 14,
  },
} as const;

export const HERO_IMAGES = [
  {
    src: "https://hsl8jk540a.ufs.sh/f/JFF4Q8WebB6dWgCq0iLAZB6Qo3FrkqV8SYhsv4eu9Oi2jMPf",
    alt: "Healthy nigerian food showcasing ready-eat delicious meals",
  },
  {
    src: "https://hsl8jk540a.ufs.sh/f/JFF4Q8WebB6dbJAZ4ZX5oPvMdz2Zcih1tWnNrgmwjYaRqfCu",
    alt: "A set of diverse colored shirts showcasing clothing",
  },
  {
    src: "https://hsl8jk540a.ufs.sh/f/JFF4Q8WebB6dvbJOADIQPkhj1f2AYaXbVmvCu3Row6eDlJxE",
    alt: "Antique Golden Jewelery from Ancient Egypt",
  },
  {
    src: "https://hsl8jk540a.ufs.sh/f/JFF4Q8WebB6dschy7bxjUQJANPlGO1ZFogVMpIn4Y05zyWDr",
    alt: "House with a beautiful garden showcasing real estate",
  },
  {
    src: "https://hsl8jk540a.ufs.sh/f/JFF4Q8WebB6dAKKAPiDqbEWlKLtN1oeBTCR4PGIhX0O2m6VU",
    alt: "A mix of diverse shoes showcasing footwear",
  },
  {
    src: "https://hsl8jk540a.ufs.sh/f/JFF4Q8WebB6dXSKPW7FrDwsIL6SElt8PgWAcRu57BaQqbkjo",
    alt: "Beauty and personal care products",
  },
  {
    src: "https://hsl8jk540a.ufs.sh/f/JFF4Q8WebB6dKhhdT3F4pzfmF7e8cGUbILY2sRTlaynxgkZV",
    alt: "Phones and gadgets showcasing electronics",
  },
  {
    src: "https://hsl8jk540a.ufs.sh/f/JFF4Q8WebB6d5p1u7dHQDYgawe3pLMcSzA2BRrmUC7In0yNG",
    alt: "Appliances",
  },
  {
    src: "https://hsl8jk540a.ufs.sh/f/JFF4Q8WebB6dGKinkxQ39wuqkW71FtJiLjgBns5eZO2mM8hT",
    alt: "Books and media",
  },
  {
    src: "https://hsl8jk540a.ufs.sh/f/JFF4Q8WebB6du6Y0vA8lTLMJtliDeN9nXqzs57GUH6RgZbry",
    alt: "Beautiful home furnitures",
  },
  {
    src: "https://hsl8jk540a.ufs.sh/f/JFF4Q8WebB6dSIZ3mZ4MCDtSP4O75M2BIcxXKWVmwyqoRTHd",
    alt: "Games and toys",
  },
  {
    src: "https://hsl8jk540a.ufs.sh/f/JFF4Q8WebB6dcbh1MBmIArhnvfDRX0Z6MmjGTiPByVkcOxHe",
    alt: "Cars and automotive",
  },
] as const;

export const TIMEZONES = [
  { value: "Africa/Kigali", label: "Rwanda Time (Kigali, GMT+2)" },
  { value: "Africa/Nairobi", label: "East Africa Time (Nairobi, GMT+3)" },
  { value: "Africa/Lagos", label: "West Africa Time (Lagos, GMT+1)" },
  { value: "Europe/London", label: "Greenwich Mean Time (London, GMT+0)" },
  { value: "Europe/Paris", label: "Central European Time (Paris, GMT+1)" },
  { value: "America/New_York", label: "Eastern Time (New York, GMT-5)" },
  { value: "America/Los_Angeles", label: "Pacific Time (LA, GMT-8)" },
] as const;
