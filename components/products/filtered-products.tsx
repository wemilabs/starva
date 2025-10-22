"use client";

import type { Product } from "@/db/schema";
import { usePathname } from "next/navigation";
import { parseAsArrayOf, parseAsString, useQueryStates } from "nuqs";
import { ProductCard } from "./product-card";

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

type FilteredProductsProps = {
  data: ProductWithOrg[];
};

export function FilteredProducts({ data }: FilteredProductsProps) {
  const [{ search, tags, sort, status }] = useQueryStates(
    {
      search: parseAsString.withDefault(""),
      tags: parseAsArrayOf(parseAsString).withDefault([]),
      sort: parseAsString.withDefault("newest"),
      status: parseAsString.withDefault("all"),
    },
    { shallow: false },
  );

  const pathname = usePathname();

  let filteredProducts = data?.filter((product) => {
    const matchesSearch =
      !search ||
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.description?.toLowerCase().includes(search.toLowerCase()) ||
      product.organization?.name.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      !status ||
      status === "all" ||
      product.status === status;

    const matchesTags =
      tags.length === 0 ||
      (product.tags?.some((tag) => tags.includes(tag.slug)) ?? false);

    return matchesSearch && matchesStatus && matchesTags;
  });

  filteredProducts = filteredProducts.sort((a, b) => {
    switch (sort) {
      case "oldest":
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      case "price_low":
        return Number(a.price) - Number(b.price);
      case "price_high":
        return Number(b.price) - Number(a.price);
      case "popular":
        return (b.likesCount ?? 0) - (a.likesCount ?? 0);
      default:
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }
  });

  const isBusinessesPage =
    pathname === `/businesses/${data[0]?.organization?.slug}`;
  const isProductsPage =
    pathname === "/products" || pathname === "/products?search=";

  if (!filteredProducts?.length)
    return (
      <>
        {isProductsPage && (
          <p className="col-span-full text-sm text-muted-foreground mb-4">
            Showing 0 product
          </p>
        )}
        <div className="col-span-full flex items-center justify-center min-h-[200px] border border-dashed border-muted-foreground/50 rounded-lg">
          <div className="text-muted-foreground text-center">
            <p className="text-sm">No products found</p>
          </div>
        </div>
      </>
    );

  return (
    <>
      {isProductsPage && (
        <div className="col-span-full text-sm text-pretty text-muted-foreground">
          Showing {filteredProducts.length} product
          {filteredProducts.length <= 1 ? "" : "s"}
        </div>
      )}
      {filteredProducts?.map((product) => (
        <ProductCard
          key={product.id}
          {...product}
          href={!isBusinessesPage ? product.slug : undefined}
        />
      ))}
    </>
  );
}
