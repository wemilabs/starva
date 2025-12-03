import { cacheLife } from "next/cache";
import { Suspense } from "react";
import { requireAdmin } from "@/lib/admin-auth";

async function AdminAuthCheck({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return <>{children}</>;
}

export default async function AdminLayout(props: LayoutProps<"/admin">) {
  const { children } = props;

  return (
    <div className="container mx-auto max-w-7xl py-7 space-y-7">
      <Suspense fallback={<div>Loading admin view...</div>}>
        <AdminHeader />
        <AdminAuthCheck>{children}</AdminAuthCheck>
      </Suspense>
    </div>
  );
}

async function AdminHeader() {
  "use cache: private";
  cacheLife("max");

  const session = await requireAdmin();
  const adminName = session.user.name || session.user.email;

  return (
    <div>
      <h2 className="text-2xl font-medium tracking-tight">Admin Board</h2>
      <p className="text-muted-foreground text-sm font-mono tracking-tighter mt-0.5">
        {adminName} admin session
      </p>
    </div>
  );
}
