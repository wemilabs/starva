import { Suspense } from "react";
import { FilteredProducts } from "@/components/products/filtered-products";
import { ProductFilters } from "@/components/products/product-filters";
import { SkeletonProductCard } from "@/components/products/skeleton-product-card";
import { getAllTagsWithProducts } from "@/data/tags";
import { getInStockProducts } from "@/data/products";

async function ProductsList() {
  const products = await getInStockProducts();
  return <FilteredProducts data={products} />;
}

export default async function ProductsPage() {
  const availableTags = await getAllTagsWithProducts();

  return (
    <div className="container mx-auto max-w-7xl py-7 space-y-7">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Browse Products</h1>
        <p className="text-sm text-muted-foreground">
          Discover a wide range of meals, fast-foods, and drinks from our local partners
        </p>
      </div>

      <div className="mb-8">
        <ProductFilters availableTags={availableTags} />
      </div>

      <div className="grid grid-cols-1 justify-center gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Suspense
          fallback={
            <>
              <div className="col-span-full text-sm text-pretty text-muted-foreground">
                Loading products...
              </div>
              <SkeletonProductCard />
              <SkeletonProductCard />
              <SkeletonProductCard />
              <SkeletonProductCard />
              <SkeletonProductCard />
              <SkeletonProductCard />
            </>
          }
        >
          <ProductsList />
        </Suspense>
      </div>
    </div>
  );
}
