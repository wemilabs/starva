import { Suspense } from "react";
import { requireAdmin } from "@/lib/admin-auth";

async function AdminAuthCheck({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return <>{children}</>;
}

export default async function AdminLayout(props: LayoutProps<"/admin">) {
  const { children } = props;
  return (
    <Suspense fallback={<div>Loading admin view...</div>}>
      <AdminAuthCheck>{children}</AdminAuthCheck>
    </Suspense>
  );
}
