"use client";

import { useQueryState } from "nuqs";
// import { Product } from "@/db/schema";
import { ProductCard } from "./product-card";

type ProductProps = {
  id: number;
  name: string;
  image: string;
  price: number;
  description: string;
  likes: number;
  orderedXTimes: number;
  itemFrom: {
    name: string;
    image: string;
  };
};

export function FilteredProducts({ data }: { data: ProductProps[] }) {
  const [search] = useQueryState("search", { defaultValue: "" });
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
        <ProductCard key={product.id} {...product} />
      ))}
    </>
  );
}
