"use client";

import {
  BookOpen,
  Car,
  ChevronRight,
  Footprints,
  Gamepad2,
  Gem,
  Heart,
  Home,
  MoreHorizontal,
  Shirt,
  ShoppingCart,
  Smartphone,
  Sofa,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useQueryState } from "nuqs";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import type { Product } from "@/db/schema";
import { useCategoryPrioritization } from "@/hooks/use-category-prioritization";
import { FilteredProducts } from "./filtered-products";

// Icon mapping for dynamic rendering
const ICON_MAP = {
  ShoppingCart,
  Heart,
  Smartphone,
  Shirt,
  Footprints,
  Sparkles,
  Gem,
  Home,
  Sofa,
  BookOpen,
  Car,
  Gamepad2,
  MoreHorizontal,
} as const;

function CategorySection({
  category,
  products,
  totalCount,
  config,
  matchingProducts,
  hasSearchQuery,
  matchCount,
}: {
  category: string;
  products: Product[];
  totalCount: number;
  config: {
    label: string;
    icon: keyof typeof ICON_MAP | string;
    priority: number;
  };
  matchingProducts?: Product[];
  hasSearchQuery?: boolean;
  matchCount?: number;
}) {
  const IconComponent =
    typeof config.icon === "string" && config.icon in ICON_MAP
      ? ICON_MAP[config.icon as keyof typeof ICON_MAP]
      : null;

  const displayProducts =
    hasSearchQuery && matchingProducts ? matchingProducts : products;
  const displayCount =
    hasSearchQuery && matchCount !== undefined ? matchCount : products.length;

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {IconComponent && (
            <IconComponent
              className={`size-5 transition-colors duration-300 ${
                hasSearchQuery && matchCount && matchCount > 0
                  ? "text-primary"
                  : "text-muted-foreground"
              }`}
            />
          )}
          <div className="flex items-center gap-2">
            <h3 className="font-medium tracking-tight text-lg">
              {config.label}
            </h3>
            {hasSearchQuery && matchCount !== undefined && matchCount > 0 && (
              <span className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full animate-in fade-in-0 slide-in-from-2 duration-300">
                {matchCount} match{matchCount > 1 ? "es" : ""}
              </span>
            )}
          </div>
          <span className="text-sm text-muted-foreground">
            {displayCount} of {totalCount}
          </span>
        </div>
        <Link
          href={`/products/category/${category}`}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary focus-visible:ring-primary transition-colors"
        >
          <span>Browse all</span>
          <ChevronRight className="size-4" />
        </Link>
      </div>

      <div className="flex w-full flex-col gap-6 flex-1">
        <div className="flex-1 pt-4">
          <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-4 overflow-x-auto scrollbar-hide sm:overflow-visible">
            <FilteredProducts
              data={displayProducts}
              layout="horizontal-scroll"
              highlightMatches={hasSearchQuery}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

type LatestProductsContentProps = {
  categoriesWithProducts: Array<{
    category: string;
    products: Product[];
    totalCount: number;
    config: {
      label: string;
      icon: keyof typeof ICON_MAP;
      priority: number;
    };
  }>;
};

export function LatestProductsContent({
  categoriesWithProducts,
}: LatestProductsContentProps) {
  const [searchQuery] = useQueryState("search", { defaultValue: "" });

  const { prioritizedCategories, totalMatches, hasSearchQuery } =
    useCategoryPrioritization(categoriesWithProducts, searchQuery);

  return (
    <section className="mx-auto flex w-full max-w-[1264px] flex-1 flex-col gap-4 mt-8">
      <div className="flex flex-col gap-1 py-2">
        <div className="flex items-center justify-between">
          <h2 className="font-medium tracking-tight text-xl">
            Latest Products
          </h2>
          {hasSearchQuery && (
            <span className="text-sm text-muted-foreground animate-in fade-in-0 slide-in-from-2 duration-300">
              {totalMatches} result{totalMatches !== 1 ? "s" : ""}
            </span>
          )}
        </div>
        <p className="text-xs text-pretty text-muted-foreground">
          {hasSearchQuery
            ? `Showing matching products for "${searchQuery}"`
            : "Discover the newest additions across all categories"}
        </p>

        <div className="w-full pt-6">
          {prioritizedCategories.length > 0 ? (
            <div className="space-y-12">
              {prioritizedCategories.map(
                (
                  {
                    category,
                    products,
                    totalCount,
                    config,
                    matchingProducts,
                    matchCount,
                  },
                  index
                ) => (
                  <div
                    key={category}
                    className={
                      hasSearchQuery
                        ? "animate-in fade-in-0 slide-in-from-4 duration-300"
                        : ""
                    }
                    style={{
                      animationDelay: hasSearchQuery
                        ? `${index * 50}ms`
                        : "0ms",
                    }}
                  >
                    <CategorySection
                      category={category}
                      products={products}
                      totalCount={totalCount}
                      config={config}
                      matchingProducts={matchingProducts}
                      hasSearchQuery={hasSearchQuery}
                      matchCount={matchCount}
                    />
                  </div>
                )
              )}
            </div>
          ) : (
            <Empty>
              <EmptyHeader>
                <EmptyTitle>No products found</EmptyTitle>
                <EmptyDescription>
                  Try adjusting your search terms
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </div>
      </div>
    </section>
  );
}
