import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function SkeletonProductCard() {
  return (
    <Card className="relative overflow-hidden p-0">
      <div className="relative aspect-[16/9]">
        <Skeleton className="absolute inset-0" />
      </div>
      <div className="absolute inset-0 flex flex-col justify-end p-6 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
        <Skeleton className="h-7 w-3/4" />
        <Skeleton className="h-10 w-full" />
        <div className="flex items-center justify-between">
          <Skeleton className="size-9 rounded-full" />
          <Skeleton className="h-8 w-16 rounded-full" />
        </div>
      </div>
    </Card>
  );
}
