import { Suspense } from "react";
import { AdminEmailManagement } from "@/components/admin/email-management/admin-email-management";
import { Skeleton } from "@/components/ui/skeleton";

export default async function EmailManagementPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 space-y-4 pt-6">
          <div className="flex items-center justify-between space-y-2">
            <Skeleton className="h-9 w-64" />
            <Skeleton className="h-10 w-24" />
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
          <div className="grid gap-4 md:grid-cols-[300px_1fr]">
            <div className="space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
              <Skeleton className="h-[600px] w-full" />
            </div>
            <Skeleton className="h-[600px] w-full" />
          </div>
        </div>
      }
    >
      <AdminEmailManagement />
    </Suspense>
  );
}
