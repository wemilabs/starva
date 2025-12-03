import { Suspense } from "react";
import { AdminUserManagement } from "@/components/admin/admin-user-management";
import { Skeleton } from "@/components/ui/skeleton";
import { requireAdmin } from "@/lib/admin-auth";

function AdminDashboardSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-28" />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
      <Skeleton className="h-96 w-full" />
    </div>
  );
}

export default async function AdminDashboardPage() {
  const session = await requireAdmin();
  const adminName = session.user.name || session.user.email;

  return (
    <div className="container mx-auto max-w-7xl py-7 space-y-7">
      <div>
        <h2 className="text-2xl font-medium tracking-tight">Admin Dashboard</h2>
        <p className="text-muted-foreground text-sm font-mono tracking-tighter mt-0.5">
          {adminName} admin session
        </p>
      </div>

      <Suspense fallback={<AdminDashboardSkeleton />}>
        <AdminUserManagement />
      </Suspense>
    </div>
  );
}
