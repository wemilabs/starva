import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { FoodItemCard } from "@/components/food/food-item-card";
import { fallbackFoodData } from "@/data/fallback-food-data";

export function EnVogue() {
  return (
    <section className="mx-auto flex w-full max-w-[1264px] flex-1 flex-col gap-4 mt-8">
      <div className="flex flex-col gap-1 py-2">
        <div className="flex items-center justify-between">
          <h2 className="font-medium tracking-tight">En Vogue</h2>
          <Link
            href="/trends"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary focus-visible:ring-primary"
          >
            <span>Browse all</span>
            <ChevronRight className="size-4" />
          </Link>
        </div>
        <p className="text-xs text-pretty text-muted-foreground">
          Explore what's trending
        </p>

        <div className="flex w-full flex-col gap-6 flex-1">
          <div className="flex-1 pt-4">
            <div className="grid grid-cols-1 justify-center gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {fallbackFoodData.map((food) => (
                <FoodItemCard key={food.id} {...food} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
