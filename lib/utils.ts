import { productCategory } from "@/db/schema";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { COUNTRIES } from "./constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export const getInitials = (name?: string | null) => {
  if (!name) return "";
  return name
    .split(" ")
    .filter(Boolean)
    .map(word => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
};

export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/[^\w-]+/g, "") // Remove non-alphanumeric characters except hyphens
    .replace(/--+/g, "-") // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
};

export const removeUnderscoreAndCapitalizeOnlyTheFirstChar = (
  text: string,
): string => {
  const withSpaces = text.replace(/_/g, " ");
  return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1);
};

export const parsePhoneNumber = (fullPhone: string) => {
  if (!fullPhone) return { countryCode: COUNTRIES[0].code, phoneNumber: "" };
  const country = COUNTRIES.find(c => fullPhone.startsWith(c.code));
  if (country) {
    return {
      countryCode: country.code,
      phoneNumber: fullPhone.substring(country.code.length).trim(),
    };
  }
  return { countryCode: COUNTRIES[0].code, phoneNumber: fullPhone };
};

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

export const formatPriceInRWF = (price: string | number) => {
  const numPrice = typeof price === "string" ? parseFloat(price) : price;
  return new Intl.NumberFormat("en-RW", {
    style: "currency",
    currency: "RWF",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numPrice);
};

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
  return PRODUCT_CATEGORIES.map(key => ({
    value: key,
    label: getCategoryLabel(key),
  }));
}
