import { EnVogue } from "@/components/en-vogue";
import { Hero } from "@/components/hero";
import { Skeleton } from "@/components/ui/skeleton";
import { Suspense } from "react";

function SkeletonCard() {
  return (
    <div className="flex flex-col space-y-3">
      <Skeleton className="h-[200px] w-[335px] rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
    </div>
  );
}

export default async function Home() {
  return (
    <div>
      <Hero />
      <Suspense
        fallback={
          <section className="mx-auto flex w-full max-w-[1264px] flex-1 flex-col gap-4 mt-8">
            <div className="flex flex-col gap-1 py-2">
              <h2 className="font-medium tracking-tight">En Vogue</h2>
              <p className="text-xs text-pretty text-muted-foreground">
                Loading trending products...
              </p>
            </div>
            <div className="flex w-full flex-col gap-6 flex-1">
              <div className="flex-1 pt-4">
                <div className="grid grid-cols-1 justify-center gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                </div>
              </div>
            </div>
          </section>
        }
      >
        <EnVogue />
      </Suspense>
    </div>
  );
}
