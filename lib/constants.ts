import type { FeedbackStatus, FeedbackType } from "@/db/schema";

export const PRODUCT_STATUS_VALUES = [
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
