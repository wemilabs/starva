import { Suspense } from "react";
import { AdminSkeleton } from "@/components/admin/admin-skeleton";
import { AdminUserManagement } from "@/components/admin/user-management/admin-user-management";

export default async function UserManagementPage() {
  return (
    <Suspense fallback={<AdminSkeleton />}>
      <AdminUserManagement />
    </Suspense>
  );
}
