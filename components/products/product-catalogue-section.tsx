"use client";

import { FilteredProducts } from "@/components/products/filtered-products";
import type { Product } from "@/db/schema";

type ProductWithOrg = Product & {
  organization?: {
    id: string;
    name: string;
    logo: string | null;
    slug: string;
    metadata: string | null;
  } | null;
};

type ProductCatalogueSectionProps = {
  data: ProductWithOrg[];
};

export function ProductCatalogueSection({
  data,
}: ProductCatalogueSectionProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 py-6">
      <FilteredProducts data={data} />
    </div>
  );
}
