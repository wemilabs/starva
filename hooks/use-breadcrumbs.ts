"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { type Crumb, useBreadcrumbs } from "@/contexts/breadcrumbs-context";

const routeConfig: Record<string, (params: string[]) => Crumb[]> = {
  // Static routes
  "/": () => [],
  "/sign-in": () => [{ label: "Sign In" }],
  "/dashboard": () => [{ label: "Dashboard" }],
  "/stores": () => [{ label: "Stores" }],
  "/merchants": () => [{ label: "Merchants" }],
  "/products": () => [{ label: "Products" }],
  "/orders": () => [{ label: "Orders" }],
  "/usage/pricing": () => [{ label: "Pricing" }],
  "/analytics": () => [{ label: "Analytics" }],
  "/transactions": () => [{ label: "Transactions" }],
  "/trends": () => [{ label: "Trends" }],
  "/support": () => [{ label: "Support" }],
  "/feedback": () => [{ label: "Feedback" }],
  "/unauthorized": () => [{ label: "Unauthorized" }],

  // Admin routes
  "/admin": () => [{ label: "Admin" }],
  "/admin/user-management": () => [
    { label: "Admin", href: "/admin" },
    { label: "User Management" },
  ],
  "/admin/feedback": () => [
    { label: "Admin", href: "/admin" },
    { label: "Feedback" },
  ],

  // Dynamic routes
  "/stores/[storeSlug]": (params) => [
    { label: "Stores", href: "/stores" },
    { label: formatStoreName(params[0]) },
  ],
  "/merchants/[merchantSlug]": (params) => [
    { label: "Merchants", href: "/merchants" },
    { label: formatStoreName(params[0]) },
  ],
  "/products/[productSlug]": (params) => [
    { label: "Products", href: "/products" },
    { label: formatProductName(params[0]) },
  ],
  "/orders/[orderId]": (params) => [
    { label: "Orders", href: "/orders" },
    { label: `Order #${params[0]?.slice(-8) || params[0]}` },
  ],
  "/usage/billing": () => [{ label: "Billing" }],
};

// Helper functions to format dynamic segments
function formatStoreName(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatProductName(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// Find matching route configuration
function findRouteConfig(
  pathname: string
): { config: (params: string[]) => Crumb[]; params: string[] } | null {
  // First try exact matches
  if (routeConfig[pathname]) {
    return { config: routeConfig[pathname], params: [] };
  }

  // Then try dynamic routes
  const segments = pathname.split("/").filter(Boolean);

  for (const [route, config] of Object.entries(routeConfig)) {
    const routeSegments = route.split("/").filter(Boolean);

    if (segments.length !== routeSegments.length) continue;

    const params: string[] = [];
    let isMatch = true;

    for (let i = 0; i < routeSegments.length; i++) {
      const routeSegment = routeSegments[i];
      const pathSegment = segments[i];

      if (routeSegment.startsWith("[") && routeSegment.endsWith("]")) {
        params.push(pathSegment);
      } else if (routeSegment !== pathSegment) {
        isMatch = false;
        break;
      }
    }

    if (isMatch) {
      return { config, params };
    }
  }

  return null;
}

// Generate breadcrumbs from pathname as fallback
function generateBreadcrumbsFromPath(pathname: string): Crumb[] {
  const segments = pathname.split("/").filter(Boolean);
  const crumbs: Crumb[] = [];

  segments.forEach((segment, index) => {
    const href = `/${segments.slice(0, index + 1).join("/")}`;
    const label = segment
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    crumbs.push({
      label,
      href: index === segments.length - 1 ? undefined : href,
    });
  });

  return crumbs;
}

export function useAutoBreadcrumbs() {
  const pathname = usePathname();
  const { setCrumbs } = useBreadcrumbs();

  const routeMatch = findRouteConfig(pathname);

  const computedCrumbs = routeMatch
    ? pathname === "/"
      ? [{ label: "Home" }]
      : [{ label: "Home", href: "/" }, ...routeMatch.config(routeMatch.params)]
    : pathname === "/"
    ? [{ label: "Home" }]
    : [{ label: "Home", href: "/" }, ...generateBreadcrumbsFromPath(pathname)];

  // Update context with computed breadcrumbs
  useEffect(() => {
    setCrumbs(computedCrumbs);
  }, [computedCrumbs, setCrumbs]);
}
