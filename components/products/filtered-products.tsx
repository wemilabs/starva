"use client";

import { useQueryState } from "nuqs";
import { usePathname } from "next/navigation";
import type { Product } from "@/db/schema";
import { ProductCard } from "./product-card";
import { EditProductForm } from "../forms/edit-product-form";
import { DeleteProductForm } from "../forms/delete-product-form";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

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
};

export function FilteredProducts({ data }: FilteredProductsProps) {
  const [search] = useQueryState("search", { defaultValue: "" });
  const pathname = usePathname();
  const filteredProducts = data?.filter((product) =>
    product.name.toLowerCase().includes(search.toLowerCase())
  );

  if (!filteredProducts?.length)
    return (
      <div className="col-span-full flex items-center justify-center min-h-[200px] border border-dashed border-muted-foreground/50 rounded-lg">
        <div className="text-muted-foreground text-center">
          <p className="text-sm">No products found</p>
        </div>
      </div>
    );

  return (
    <>
      {filteredProducts?.map((product) => (
        <div key={product.id}>
          <ProductCard {...product} />
          <div className="mt-3 rounded-xl border border-amber-200/70 bg-amber-50/40 p-3 shadow-sm transition-colors dark:border-amber-900/40 dark:bg-amber-950/20">
            {pathname === `/businesses/${product.organization?.slug}` ? (
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-medium text-amber-800/80 dark:text-amber-200/80">
                  Manage this product
                </span>
                <div className="flex items-center gap-2">
                  <EditProductForm
                    product={product}
                    organizationId={product.organizationId}
                    businessSlug={product.organization?.slug || ""}
                    className="shadow-sm hover:shadow"
                  />
                  <DeleteProductForm
                    productId={product.id}
                    organizationId={product.organizationId}
                    businessSlug={product.organization?.slug || ""}
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3">
                <div className="text-xs text-muted-foreground">
                  Interested in this item?
                </div>
                <Button size="sm" variant="secondary" className="group">
                  <span className="inline-flex items-center gap-1">
                    View details
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Button>
              </div>
            )}
          </div>
        </div>
      ))}
    </>
  );
}
