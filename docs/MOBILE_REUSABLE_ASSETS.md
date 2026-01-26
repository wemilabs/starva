# Reusable Assets for Mobile App

This document lists assets from the web backend (`strv-web`) that can be reused or adapted for the mobile app.

---

## 1. Types (from `db/schema.ts`)

These TypeScript types can be extracted to a shared package or copied to mobile:

```typescript
// Core entities
Product;
Organization;
User;
Order;
OrderItem;
OrderStatus;

// Follow system (new)
UserFollowOrganization;
UserFollowUser;

// Other useful types
ProductCategory;
ProductStatus;
Tag;
ProductLike;
Notification;
NotificationType;
```

### API Response Types (to create for mobile)

```typescript
interface MerchantProfile {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  metadata: unknown;
  createdAt: Date;
  followerCount: number;
  productCount: number;
  isFollowing: boolean;
  products: Product[];
}

interface UserProfile {
  id: string;
  name: string;
  image: string | null;
  createdAt: Date;
  followerCount: number;
  followingCount: number;
  likesCount: number;
  isFollowing: boolean;
  isOwnProfile: boolean;
}

interface FollowingFeedResponse {
  products: ProductWithMeta[];
  total: number;
  hasMore: boolean;
  message?: string;
}

interface ProductWithMeta extends Product {
  tags: Tag[];
  isLiked: boolean;
  source: "followed_merchant" | "liked_by_followed";
}
```

---

## 2. Constants (from `lib/constants.ts`)

### Image URLs

```typescript
export const GENERAL_BRANDING_IMG_URL =
  "https://hsl8jk540a.ufs.sh/f/JFF4Q8WebB6du5UdXxlTLMJtliDeN9nXqzs57GUH6RgZbryB";

export const FALLBACK_PRODUCT_IMG_URL =
  "https://hsl8jk540a.ufs.sh/f/JFF4Q8WebB6d89s9BRYhvCEDrKcu2HNpfYQo7eR4FUT8wVgS";
```

### Status Values

```typescript
export const PRODUCT_STATUS_VALUES = [
  "draft",
  "in_stock",
  "out_of_stock",
  "archived",
] as const;

export const ORDER_STATUS_VALUES = [
  "pending",
  "confirmed",
  "preparing",
  "ready",
  "delivered",
  "cancelled",
] as const;

export const validTransitions: Record<OrderStatus, OrderStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["preparing", "cancelled"],
  preparing: ["ready", "cancelled"],
  ready: ["delivered", "cancelled"],
  delivered: [],
  cancelled: [],
};

export const statusLabels: Record<OrderStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  preparing: "Preparing",
  ready: "Ready",
  delivered: "Delivered",
  cancelled: "Cancelled",
};
```

### Countries (Phone Input)

```typescript
export const COUNTRIES = [
  { code: "+250", name: "Rwanda", flag: "🇷🇼" },
  { code: "+241", name: "Gabon", flag: "🇬🇦" },
  { code: "+243", name: "DRC", flag: "🇨🇩" },
  { code: "+254", name: "Kenya", flag: "🇰🇪" },
  { code: "+256", name: "Uganda", flag: "🇺🇬" },
  { code: "+255", name: "Tanzania", flag: "🇹🇿" },
  { code: "+234", name: "Nigeria", flag: "🇳🇬" },
  { code: "+27", name: "South Africa", flag: "🇿🇦" },
  { code: "+20", name: "Egypt", flag: "🇪🇬" },
  { code: "+212", name: "Morocco", flag: "🇲🇦" },
  { code: "+216", name: "Tunisia", flag: "🇹🇳" },
  { code: "+213", name: "Algeria", flag: "🇩🇿" },
  { code: "+251", name: "Ethiopia", flag: "🇪🇹" },
  { code: "+258", name: "Mozambique", flag: "🇲🇿" },
  { code: "+260", name: "Zambia", flag: "🇿🇲" },
  { code: "+263", name: "Zimbabwe", flag: "🇿🇼" },
  { code: "+233", name: "Ghana", flag: "🇬🇭" },
  { code: "+225", name: "Côte d'Ivoire", flag: "🇨🇮" },
  { code: "+221", name: "Senegal", flag: "🇸🇳" },
  { code: "+237", name: "Cameroon", flag: "🇨🇲" },
  { code: "+44", name: "United Kingdom", flag: "🇬🇧" },
  { code: "+33", name: "France", flag: "🇫🇷" },
  { code: "+49", name: "Germany", flag: "🇩🇪" },
  { code: "+39", name: "Italy", flag: "🇮🇹" },
  { code: "+34", name: "Spain", flag: "🇪🇸" },
  { code: "+46", name: "Sweden", flag: "🇸🇪" },
  { code: "+1", name: "United States", flag: "🇺🇸" },
  { code: "+1", name: "Canada", flag: "🇨🇦" },
] as const;
```

### Category Config

```typescript
export const CATEGORY_CONFIG = {
  "food-groceries": {
    label: "Food & Groceries",
    icon: "ShoppingCart",
    priority: 1,
  },
  clothing: { label: "Clothing", icon: "Shirt", priority: 2 },
  "real-estate": { label: "Real Estate", icon: "Home", priority: 3 },
  electronics: { label: "Electronics", icon: "Smartphone", priority: 4 },
  "health-wellness": { label: "Health & Wellness", icon: "Heart", priority: 5 },
  footwear: { label: "Footwear", icon: "Footprints", priority: 6 },
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
  appliances: { label: "Appliances", icon: "Refrigerator", priority: 9 },
  furniture: { label: "Furniture", icon: "Sofa", priority: 10 },
  "books-media": { label: "Books & Media", icon: "BookOpen", priority: 11 },
  automotive: { label: "Automotive", icon: "Car", priority: 12 },
  "toys-games": { label: "Toys & Games", icon: "Gamepad2", priority: 13 },
  others: { label: "Others", icon: "MoreHorizontal", priority: 14 },
} as const;
```

### Pricing

```typescript
export const USD_TO_RWF = 1457.39;
export const TRIAL_DAYS = 14;
export const ANNUAL_DISCOUNT_PERCENT = 10;

export const TRANSACTION_FEES = {
  PAYPACK_CASHIN_RATE: 0.03,
  PAYPACK_CASHOUT_RATE: 0.03,
  PLATFORM_RATE: 0.014,
  get TOTAL_RATE() {
    return (
      this.PAYPACK_CASHIN_RATE + this.PAYPACK_CASHOUT_RATE + this.PLATFORM_RATE
    );
  },
} as const;
```

### Timezones

```typescript
export const TIMEZONES = [
  { value: "Africa/Kigali", label: "Rwanda Time (Kigali, GMT+2)" },
  { value: "Africa/Nairobi", label: "East Africa Time (Nairobi, GMT+3)" },
  { value: "Africa/Lagos", label: "West Africa Time (Lagos, GMT+1)" },
  { value: "Europe/London", label: "Greenwich Mean Time (London, GMT+0)" },
  { value: "Europe/Paris", label: "Central European Time (Paris, GMT+1)" },
  { value: "America/New_York", label: "Eastern Time (New York, GMT-5)" },
  { value: "America/Los_Angeles", label: "Pacific Time (LA, GMT-8)" },
] as const;
```

---

## 3. Utility Functions (from `lib/utils.ts`)

### String Utils

```typescript
getInitials(name: string | null): string
slugify(text: string): string
```

### Date Utils

```typescript
formatDate(date: Date | string): string           // "Jan 24, 2026, 1:58 PM"
formatDateShort(date: Date | string): string      // "Jan 24, 2026"
formatTime(time: string): string                  // "1:58 PM"
formatRelativeTime(date: Date | string): string   // "2 hours ago"
getDaysUntil(date: Date | string): number
```

### Price Utils

```typescript
formatPrice(price: number, currency?: string, locale?: string): string
formatPriceInRWF(price: number): string
convertUsdToRwf(usd: number): number
calculateOrderFees(baseAmount: number): FeeBreakdown
```

### Phone Utils

```typescript
parsePhoneNumber(fullPhone: string): { countryCode: string; phoneNumber: string }
formatRwandanPhone(phone: string): string  // For Paypack API
```

### Category Utils

```typescript
getCategoryLabel(key: string): string
getCategoryOptions(): { value: string; label: string }[]
getCategorySpecificationLabel(category: string): string
getCategorySpecificationPlaceholder(category: string): string
```

---

## 4. Color Scheme (from `globals.css`)

### Light Mode

| Token                  | OKLCH Value                  | Usage             |
| ---------------------- | ---------------------------- | ----------------- |
| `--primary`            | `oklch(0.705 0.213 47.604)`  | Brand orange      |
| `--primary-foreground` | `oklch(0.98 0.016 73.684)`   | Text on primary   |
| `--background`         | `oklch(1 0 0)`               | White background  |
| `--foreground`         | `oklch(0.141 0.005 285.823)` | Dark text         |
| `--muted`              | `oklch(0.967 0.001 286.375)` | Muted backgrounds |
| `--muted-foreground`   | `oklch(0.552 0.016 285.938)` | Secondary text    |
| `--destructive`        | `oklch(0.577 0.245 27.325)`  | Error/danger red  |
| `--border`             | `oklch(0.92 0.004 286.32)`   | Border color      |

### Dark Mode

| Token           | OKLCH Value                  | Usage                 |
| --------------- | ---------------------------- | --------------------- |
| `--primary`     | `oklch(0.646 0.222 41.116)`  | Brand orange (darker) |
| `--background`  | `oklch(0.141 0.005 285.823)` | Dark background       |
| `--foreground`  | `oklch(0.985 0 0)`           | Light text            |
| `--card`        | `oklch(0.21 0.006 285.885)`  | Card background       |
| `--muted`       | `oklch(0.274 0.006 286.033)` | Muted backgrounds     |
| `--destructive` | `oklch(0.704 0.191 22.216)`  | Error/danger red      |

### For React Native (converted to hex approximations)

```typescript
export const colors = {
  light: {
    primary: "#E07020", // Brand orange
    primaryForeground: "#FFF8F0",
    background: "#FFFFFF",
    foreground: "#1A1A1A",
    muted: "#F5F5F5",
    mutedForeground: "#737373",
    destructive: "#DC2626",
    border: "#E5E5E5",
    card: "#FFFFFF",
  },
  dark: {
    primary: "#D45A10",
    primaryForeground: "#FFF8F0",
    background: "#1A1A1A",
    foreground: "#FAFAFA",
    muted: "#2A2A2A",
    mutedForeground: "#A3A3A3",
    destructive: "#EF4444",
    border: "#333333",
    card: "#262626",
  },
};
```

---

## 5. API Endpoints Reference

### Products

| Endpoint                                       | Method | Description                           |
| ---------------------------------------------- | ------ | ------------------------------------- |
| `/api/mobile/products`                         | GET    | List with filters, search, pagination |
| `/api/mobile/products/[slug]`                  | GET    | Single product details                |
| `/api/mobile/products/category/[categorySlug]` | GET    | By category                           |
| `/api/mobile/products/store/[organizationId]`  | GET    | By store                              |
| `/api/mobile/products/featured`                | GET    | Featured products grouped by category |
| `/api/mobile/products/following`               | GET    | Following feed (new)                  |

### Merchants

| Endpoint                              | Method | Description                 |
| ------------------------------------- | ------ | --------------------------- |
| `/api/mobile/merchants/[slug]`        | GET    | Merchant profile + products |
| `/api/mobile/merchants/[slug]/follow` | POST   | Follow merchant             |
| `/api/mobile/merchants/[slug]/follow` | DELETE | Unfollow merchant           |

### Users

| Endpoint                            | Method | Description   |
| ----------------------------------- | ------ | ------------- |
| `/api/mobile/users/[userId]`        | GET    | User profile  |
| `/api/mobile/users/[userId]/follow` | POST   | Follow user   |
| `/api/mobile/users/[userId]/follow` | DELETE | Unfollow user |

### Orders

| Endpoint                  | Method   | Description                |
| ------------------------- | -------- | -------------------------- |
| `/api/mobile/orders`      | GET/POST | List orders / Create order |
| `/api/mobile/orders/[id]` | GET      | Order details              |

---

## 6. Shared Validation Schemas

Consider extracting Zod schemas for:

- Product filters/search params
- Order creation payload
- Phone number validation
- Price validation

---

## 7. Icon Mapping (Lucide → React Native)

The web uses Lucide icons. For React Native, use `lucide-react-native` or map to equivalent:

```typescript
const categoryIcons = {
  "food-groceries": "ShoppingCart",
  clothing: "Shirt",
  "real-estate": "Home",
  electronics: "Smartphone",
  "health-wellness": "Heart",
  footwear: "Footprints",
  "beauty-personal-care": "Sparkles",
  "jewelry-accessories": "Gem",
  appliances: "Refrigerator",
  furniture: "Sofa",
  "books-media": "BookOpen",
  automotive: "Car",
  "toys-games": "Gamepad2",
  others: "MoreHorizontal",
};
```

---

## 8. Recommended Shared Package Structure

```
packages/
  shared/
    src/
      types/
        index.ts          # All shared types
        product.ts
        order.ts
        user.ts
        follow.ts
      constants/
        index.ts
        categories.ts
        countries.ts
        status.ts
      utils/
        index.ts
        date.ts
        price.ts
        phone.ts
        string.ts
      theme/
        colors.ts
        spacing.ts
```

This allows both web and mobile to import from `@strv/shared`.
