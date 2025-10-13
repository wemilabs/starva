"use client";

import type { Product } from "@/db/schema";
import { usePathname } from "next/navigation";
import { useQueryState } from "nuqs";
import { ProductCard } from "./product-card";

type ProductWithOrg = Product & {
  organization?: {
    id: string;
    name: string;
    logo: string | null;
    slug: string;
  } | null;
};

type FilteredProductsProps = {
  data: ProductWithOrg[];
  filterByStatus?: string;
  filterByTag?: string[];
};

export function FilteredProducts({
  data,
  // filterByTag,
  filterByStatus,
}: FilteredProductsProps) {
  const [search] = useQueryState("search", { defaultValue: "" });
  const pathname = usePathname();
  const filteredProducts = data?.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.organization?.name.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      !filterByStatus ||
      filterByStatus === "all" ||
      product.status === filterByStatus;

    return matchesSearch && matchesStatus;
  });

  if (!filteredProducts?.length)
    return (
      <div className="col-span-full flex items-center justify-center min-h-[200px] border border-dashed border-muted-foreground/50 rounded-lg">
        <div className="text-muted-foreground text-center">
          <p className="text-sm">No products found</p>
        </div>
      </div>
    );

  const isBusinessesPage =
    pathname === `/businesses/${data[0].organization?.slug}`;

  return (
    <>
      {filteredProducts?.map((product) => (
        <div key={product.id}>
          <ProductCard
            {...product}
            href={!isBusinessesPage ? product.slug : undefined}
          />
        </div>
      ))}
    </>
  );
}
