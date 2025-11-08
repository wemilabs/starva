import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { getLatestProductsByCategory } from "@/data/products";
import type { Product } from "@/db/schema";
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
import { FilteredProducts } from "./products/filtered-products";

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
}: {
  category: string;
  products: Product[];
  totalCount: number;
  config: {
    label: string;
    icon: keyof typeof ICON_MAP;
    priority: number;
  };
}) {
  const IconComponent = ICON_MAP[config.icon];

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {IconComponent && (
            <IconComponent className="size-5 text-muted-foreground" />
          )}
          <h3 className="font-medium tracking-tight text-lg">{config.label}</h3>
          <span className="text-sm text-muted-foreground">
            {products.length} of {totalCount}
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
          <div className="grid grid-cols-1 justify-center gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* <ScrollArea className="w-full whitespace-nowrap"> */}
            <FilteredProducts data={products} />
            {/* <ScrollBar orientation="horizontal" /> */}
            {/* </ScrollArea> */}
          </div>
        </div>
      </div>

      {/* <ScrollArea className="w-full whitespace-nowrap">
        <div className="grid grid-flow-col auto-cols-[320px] gap-4 pb-4">
          <FilteredProducts data={products} />
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea> */}
    </div>
  );
}

export async function LatestProducts() {
  const categoriesWithProducts = await getLatestProductsByCategory();
  return (
    <section className="mx-auto flex w-full max-w-[1264px] flex-1 flex-col gap-4 mt-8">
      <div className="flex flex-col gap-1 py-2">
        <div className="flex items-center justify-between">
          <h2 className="font-medium tracking-tight text-xl">
            Latest Products
          </h2>
        </div>
        <p className="text-xs text-pretty text-muted-foreground">
          Discover the newest additions across all categories
        </p>

        <div className="w-full pt-6">
          {categoriesWithProducts.length > 0 ? (
            categoriesWithProducts.map(
              ({ category, products, totalCount, config }) => (
                <CategorySection
                  key={category}
                  category={category}
                  products={products}
                  totalCount={totalCount}
                  config={config}
                />
              ),
            )
          ) : (
            <Empty>
              <EmptyHeader>
                <EmptyTitle>No latest products available yet</EmptyTitle>
                <EmptyDescription>
                  More categories coming soon!
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </div>
      </div>
    </section>
  );
}
