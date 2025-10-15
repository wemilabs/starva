import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { COUNTRIES } from "./constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export const extractInitials = (text: string) => {
  return text
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
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
  const country = COUNTRIES.find((c) => fullPhone.startsWith(c.code));
  if (country) {
    return {
      countryCode: country.code,
      phoneNumber: fullPhone.substring(country.code.length).trim(),
    };
  }
  return { countryCode: COUNTRIES[0].code, phoneNumber: fullPhone };
};
