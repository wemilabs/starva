import { Skeleton } from "../ui/skeleton";

export function ProductSlugSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-12">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <Skeleton className="aspect-square w-full rounded-lg" />

        <div className="flex flex-col gap-6">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-8 w-32" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-24 rounded-md" />
            <Skeleton className="h-24 rounded-md" />
            <Skeleton className="h-24 rounded-md" />
            <Skeleton className="h-24 rounded-md" />
          </div>

          <div className="flex gap-3">
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-10 w-40" />
          </div>
        </div>
      </div>
    </div>
  );
}
