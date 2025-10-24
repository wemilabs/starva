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
    name: "Free",
    description: "Perfect for getting started",
    price: 0,
    originalPrice: null,
    period: "forever",
    features: [
      "1 organization",
      "Basic product management",
      "Up to 50 products",
      "Basic order tracking",
      "Community support",
      "7-day data retention",
    ],
    highlighted: false,
    cta: "Get Started",
  },
  {
    name: "Starter",
    description: "Ideal for small businesses",
    price: 15000,
    originalPrice: 25000,
    period: "month",
    features: [
      "3 organizations",
      "Unlimited products",
      "Advanced order management",
      "Sales reports (monthly/semester/annually)",
      "Basic insights & analytics",
      "Team collaboration (up to 5 members)",
      "Priority email support",
      "30-day data retention",
      "Export data to CSV",
    ],
    highlighted: true,
    cta: "Start Free Trial",
  },
  {
    name: "Pro",
    description: "For growing medium businesses",
    price: 190000,
    originalPrice: 270000,
    period: "month",
    features: [
      "10 organizations",
      "Everything in Starter, plus:",
      "Advanced insights & analytics dashboard",
      "Product performance tracking",
      "Team performance metrics",
      "AI-powered business strategies",
      "Sales forecasting & predictions",
      "Custom reports builder",
      "Team collaboration (up to 20 members)",
      "Multi-location support",
      "API access",
      "Priority support (24/7)",
      "90-day data retention",
    ],
    highlighted: false,
    cta: "Start Free Trial",
  },
  // {
  //   name: "Enterprise",
  //   description: "For large organizations",
  //   price: 540000,
  //   originalPrice: 1200000,
  //   period: "month",
  //   features: [
  //     "Unlimited organizations",
  //     "Everything in Pro, plus:",
  //     "White-label solutions",
  //     "Advanced AI-powered recommendations",
  //     "Predictive analytics & forecasting",
  //     "Custom integrations & webhooks",
  //     "Dedicated account manager",
  //     "Custom SLA & uptime guarantee",
  //     "Unlimited team members",
  //     "Advanced security & compliance",
  //     "Single Sign-On (SSO)",
  //     "Custom training & onboarding",
  //     "Unlimited data retention",
  //     "Custom contracts & invoicing",
  //   ],
  //   highlighted: false,
  //   cta: "Contact Sales",
  // },
] as const;
