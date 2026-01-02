import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { z } from "zod";
import { productCategory } from "@/db/schema";
import { COUNTRIES, USD_TO_RWF } from "./constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ------------------------ String utils ------------------------
export const getInitials = (name?: string | null) => {
  if (!name) return "";
  return name
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
};

// export const slugify = (text: string): string => {
//   return text
//     .toLowerCase()
//     .trim()
//     .replace(/\s+/g, "-") // Replace spaces with hyphens
//     .replace(/[^\w-]+/g, "") // Remove non-alphanumeric characters except hyphens
//     .replace(/--+/g, "-") // Replace multiple hyphens with single hyphen
//     .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
// };
export const slugify = (text: string): string => {
  const Slug = z.string().slugify();
  return Slug.parse(text);
};

export const removeUnderscoreAndCapitalizeOnlyTheFirstChar = (
  text: string
): string => {
  const withSpaces = text.replace(/_/g, " ");
  return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1);
};

// ------------------------ Phone utils ------------------------
export const parsePhoneNumber = (fullPhone: string) => {
  if (!fullPhone) return { countryCode: COUNTRIES[0].code, phoneNumber: "" };
  const country = COUNTRIES.find((c) => fullPhone.startsWith(c.code));
  if (country) {
    return {
      countryCode: country.code,
      phoneNumber: fullPhone.substring(country.code.length).trim(),
    };
  }
  return { countryCode: COUNTRIES[0].code, phoneNumber: fullPhone };
};

// ------------------------ Date utils ------------------------
export const formatDate = (date: Date | string) => {
  const dateObj = date instanceof Date ? date : new Date(date);
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(dateObj);
};

export const formatDateShort = (date: Date | string) => {
  const dateObj = date instanceof Date ? date : new Date(date);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(dateObj);
};

export const formatTime = (time: string) => {
  const [hours, minutes] = time.split(":");
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
};

export const formatRelativeTime = (date: Date | string) => {
  const dateObj = date instanceof Date ? date : new Date(date);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  const units: { unit: Intl.RelativeTimeFormatUnit; seconds: number }[] = [
    { unit: "year", seconds: 31536000 },
    { unit: "month", seconds: 2592000 },
    { unit: "week", seconds: 604800 },
    { unit: "day", seconds: 86400 },
    { unit: "hour", seconds: 3600 },
    { unit: "minute", seconds: 60 },
    { unit: "second", seconds: 1 },
  ];

  for (const { unit, seconds } of units) {
    const interval = Math.floor(diffInSeconds / seconds);
    if (interval >= 1 || unit === "second") {
      return rtf.format(-interval, unit);
    }
  }

  return rtf.format(0, "second");
};

export const formatDistanceToNow = (date: Date): string => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "just now";
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths > 1 ? "s" : ""} ago`;
  }

  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears} year${diffInYears > 1 ? "s" : ""} ago`;
};

export const getDaysUntil = (date: Date | string): number => {
  const targetDate = date instanceof Date ? date : new Date(date);
  const now = new Date();
  // Reset time to start of day for accurate day calculation
  now.setHours(0, 0, 0, 0);
  targetDate.setHours(0, 0, 0, 0);
  const diffInMs = targetDate.getTime() - now.getTime();
  return Math.ceil(diffInMs / (1000 * 60 * 60 * 24));
};

// ------------------------ Price & phone utils ------------------------
export const formatPrice = (
  price: string | number,
  currency: string = "USD",
  locale: string = "en-US"
) => {
  const numPrice = typeof price === "string" ? parseFloat(price) : price;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numPrice);
};

// Temporarily keep this one because of existing places
// Will just automate it later on
export const formatPriceInRWF = (price: string | number) => {
  return formatPrice(price, "RWF", "en-RW");
};

export function convertUsdToRwf(usd: number): number {
  return Math.round(usd * USD_TO_RWF);
}

// Format phone number for Paypack API (07xxxxxxx format - 9 digits, no country code)
export function formatRwandanPhone(phone: string): string {
  let cleaned = phone.replace(/[\s-]/g, "");

  if (cleaned.startsWith("+250")) {
    cleaned = cleaned.slice(4);
  } else if (cleaned.startsWith("250")) {
    cleaned = cleaned.slice(3);
  } else if (cleaned.startsWith("0")) {
    cleaned = cleaned.slice(1);
  }

  if (cleaned.length !== 9) throw new Error("Invalid phone number format");

  return `0${cleaned}`;
}

// ------------------------ Product utils ------------------------
export const PRODUCT_CATEGORIES = productCategory.enumValues;

export function getCategoryLabel(key: string): string {
  const categoryMap: Record<string, string> = {
    "health-wellness": "Health & Wellness",
    "food-groceries": "Food & Groceries",
    clothing: "Clothing",
    "real-estate": "Real Estate",
    footwear: "Footwear",
    "beauty-personal-care": "Beauty & Personal Care",
    "jewelry-accessories": "Jewelry & Accessories",
    electronics: "Electronics",
    appliances: "Appliances",
    furniture: "Furniture",
    "books-media": "Books & Media",
    automotive: "Automotive",
    "toys-games": "Toys & Games",
    others: "Others",
  };
  return categoryMap[key] || key;
}

export function getCategoryOptions() {
  return PRODUCT_CATEGORIES.map((key) => ({
    value: key,
    label: getCategoryLabel(key),
  }));
}

export function getCategorySpecificationLabel(category: string): string {
  switch (category) {
    case "health-wellness":
      return "Dosage/Size";
    case "food-groceries":
      return "Calories";
    case "clothing":
      return "Sizes";
    case "real-estate":
      return "Area";
    case "footwear":
      return "Sizes";
    case "beauty-personal-care":
      return "Volume";
    case "jewelry-accessories":
      return "Material";
    case "electronics":
      return "Condition";
    case "appliances":
      return "Capacity";
    case "furniture":
      return "Dimensions";
    case "books-media":
      return "Pages";
    case "automotive":
      return "Year";
    case "toys-games":
      return "Age Range";
    default:
      return "Specifications";
  }
}

export function getCategorySpecificationPlaceholder(category: string): string {
  switch (category) {
    case "health-wellness":
      return "e.g., 500mg, 100ml";
    case "food-groceries":
      return "e.g., 250";
    case "clothing":
      return "S, M, L, XL, XXL";
    case "real-estate":
      return "e.g., 150 sqm, 3 bedrooms";
    case "footwear":
      return "e.g., 38, 39, 40, 41, 42";
    case "beauty-personal-care":
      return "e.g., 50ml, For dry skin";
    case "jewelry-accessories":
      return "e.g., Gold, Silver, 18K";
    case "electronics":
      return "New, Used, Refurbished";
    case "appliances":
      return "e.g., 10L, 1 year warranty";
    case "furniture":
      return "e.g., 200x150x80cm, Wood";
    case "books-media":
      return "e.g., 200-300 pages";
    case "automotive":
      return "e.g., 2020, 50,000 km";
    case "toys-games":
      return "e.g., 3-8 years";
    default:
      return "e.g., Key features or details";
  }
}
