import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";

export function HeaderSkeleton() {
  return (
    <header className="flex h-16 shrink-0 items-center gap-2 px-4 justify-between transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 sticky top-0 z-11 border-b rounded-lg bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/50">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <Separator
          className="mr-2 data-[orientation=vertical]:h-4"
          orientation="vertical"
        />
        <Skeleton className="h-4 w-32" />
      </div>

      <div className="flex items-center gap-2">
        <Skeleton className="size-9 rounded-full" />
        <Skeleton className="size-9 rounded-full" />
      </div>
    </header>
  );
}
