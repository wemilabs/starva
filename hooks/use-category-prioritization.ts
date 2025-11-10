"use client";

import type { Product } from "@/db/schema";

type ProductWithOrg = Product & {
  organization?: {
    id: string;
    name: string;
    logo: string | null;
    slug: string;
  } | null;
  isLiked?: boolean;
  tags?: Array<{ id: string; slug: string; name: string }>;
};

type CategoryWithProducts = {
  category: string;
  products: ProductWithOrg[];
  totalCount: number;
  config: {
    label: string;
    icon: string;
    priority: number;
  };
};

export function useCategoryPrioritization(
  categories: CategoryWithProducts[],
  searchQuery: string = "",
) {
  const prioritizedCategories = (() => {
    if (!searchQuery.trim()) return categories;

    const searchLower = searchQuery.toLowerCase();

    // Calculate match data for each category
    const categoriesWithMatches = categories.map(category => {
      const matchingProducts = category.products.filter(product =>
        productMatchesSearch(product, searchLower),
      );

      return {
        ...category,
        matchingProducts,
        hasMatches: matchingProducts.length > 0,
        matchCount: matchingProducts.length,
      };
    });

    // Sort categories: those with matches first, then by match count, then by original priority
    return categoriesWithMatches.sort((a, b) => {
      // Categories with matches come first
      if (a.hasMatches && !b.hasMatches) return -1;
      if (!a.hasMatches && b.hasMatches) return 1;

      // If both have matches, sort by match count (more matches = higher priority)
      if (a.hasMatches && b.hasMatches) {
        if (a.matchCount !== b.matchCount) {
          return b.matchCount - a.matchCount;
        }
      }

      // Fall back to original category priority
      return a.config.priority - b.config.priority;
    });
  })();

  const totalMatches = (() => {
    if (!searchQuery.trim()) return 0;

    return prioritizedCategories.reduce(
      (total, category) =>
        total + (category as CategoryWithMatches).matchCount || 0,
      0,
    );
  })();

  return {
    prioritizedCategories: prioritizedCategories as CategoryWithMatches[],
    totalMatches,
    hasSearchQuery: searchQuery.trim().length > 0,
  };
}

function productMatchesSearch(
  product: ProductWithOrg,
  searchLower: string,
): boolean {
  return (
    product.name.toLowerCase().includes(searchLower) ||
    (product.description?.toLowerCase().includes(searchLower) ?? false) ||
    (product.organization?.name.toLowerCase().includes(searchLower) ?? false) ||
    (product.tags?.some(tag => tag.name.toLowerCase().includes(searchLower)) ??
      false) ||
    (product.brand?.toLowerCase().includes(searchLower) ?? false)
  );
}

export type CategoryWithMatches = CategoryWithProducts & {
  matchingProducts: ProductWithOrg[];
  hasMatches: boolean;
  matchCount: number;
};
