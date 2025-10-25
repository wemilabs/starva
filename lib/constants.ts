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

export const PRICING_PLANS = [
  {
    name: "Starter",
    description: "Perfect for food stalls & small kitchens",
    price: 8000,
    originalPrice: null,
    period: "month",
    orderLimit: 100,
    maxOrgs: 1,
    features: [
      "1 restaurant/food business",
      "Up to 30 products on menu",
      "Up to 100 orders/month",
      "Basic order management",
      "Order notifications (SMS/WhatsApp)",
      "Monthly sales reports",
      "Email support",
      "14-day free trial",
    ],
    highlighted: false,
    cta: "Start Free Trial",
  },
  {
    name: "Growth",
    description: "For established restaurants",
    price: 35000,
    originalPrice: null,
    period: "month",
    orderLimit: 500,
    maxOrgs: 3,
    features: [
      "3 restaurant locations",
      "Unlimited menu items",
      "Up to 500 orders/month",
      "Advanced order tracking",
      "Customer analytics",
      "Peak time insights",
      "Team management (up to 5)",
      "Priority support",
      "30-day data retention",
    ],
    highlighted: true,
    cta: "Start Free Trial",
  },
  {
    name: "Pro",
    description: "For busy restaurants & chains",
    price: 90000,
    originalPrice: null,
    period: "month",
    orderLimit: 2000,
    maxOrgs: 10,
    features: [
      "10 restaurant locations",
      "Unlimited menu items",
      "Up to 2,000 orders/month",
      "AI-powered demand forecasting",
      "Menu optimization insights",
      "Kitchen performance metrics",
      "Multi-location management",
      "Team collaboration (20 members)",
      "API access for integrations",
      "24/7 priority support",
      "90-day data retention",
    ],
    highlighted: false,
    cta: "Start Free Trial",
  },
  {
    name: "Enterprise",
    description: "For restaurant chains & cloud kitchens",
    price: null,
    originalPrice: null,
    period: "month",
    orderLimit: null,
    maxOrgs: null,
    features: [
      "Unlimited locations",
      "Unlimited orders",
      "White-label solutions",
      "Custom integrations",
      "Dedicated account manager",
      "Custom analytics & reporting",
      "Unlimited team members",
      "SLA guarantee",
      "Unlimited data retention",
    ],
    highlighted: false,
    cta: "Contact Sales",
  },
] as const;
