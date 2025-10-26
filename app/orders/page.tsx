import { OrderTabs } from "@/components/orders/order-tabs";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getOrdersByOrganization,
  getOrdersByUser,
  getOrderStats,
} from "@/data/orders";
import { verifySession } from "@/data/user-session";
import { ScrollText } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

async function OrdersContent() {
  const sessionData = await verifySession();

  if (!sessionData.success || !sessionData.session) {
    return (
      <Empty className="min-h-[400px]">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <ScrollText className="size-6" />
          </EmptyMedia>
          <EmptyTitle>You are not yet signed in</EmptyTitle>
          <EmptyDescription>
            Sign in first in order to access this service
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button asChild size="sm" className="w-full">
            <Link href="/sign-in">
              <span>Sign In</span>
            </Link>
          </Button>
        </EmptyContent>
      </Empty>
    );
  }

  const userId = sessionData.session.user?.id;
  const activeOrgId = sessionData.session.session?.activeOrganizationId;

  const [myOrders, customerOrders, merchantStats] = await Promise.all([
    getOrdersByUser(userId),
    activeOrgId ? getOrdersByOrganization(activeOrgId) : Promise.resolve([]),
    activeOrgId ? getOrderStats(activeOrgId) : Promise.resolve([]),
  ]);

  return (
    <div className="space-y-7">
      {myOrders.length === 0 ? (
        <Empty className="min-h-[400px]">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ScrollText className="size-6" />
            </EmptyMedia>
            <EmptyTitle>No orders yet</EmptyTitle>
            <EmptyDescription>
              Start shopping from businesses to place your first order. Your
              order history will appear here.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <OrderTabs
          myOrders={myOrders}
          customerOrders={customerOrders}
          merchantStats={merchantStats}
          hasActiveBusiness={!!activeOrgId}
        />
      )}
    </div>
  );
}

function OrdersPageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Tabs List Skeleton */}
      <div className="w-full max-w-md mx-auto">
        <div className="grid grid-cols-2 gap-1 p-1 bg-muted rounded-lg">
          <div className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-md bg-background shadow-sm">
            <Skeleton className="size-4" />
            <Skeleton className="h-4 w-8" />
            <Skeleton className="h-5 w-6 rounded-full" />
          </div>
          <div className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-md">
            <Skeleton className="size-4" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-5 w-6 rounded-full" />
          </div>
        </div>
      </div>

      {/* Tab Content Skeleton */}
      <div className="space-y-6">
        {/* Order Stats Skeleton */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-lg border p-4 space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-8 w-12" />
            </div>
          ))}
        </div>

        {/* Order List Skeleton */}
        <div className="space-y-4">
          <div className="text-center text-muted-foreground py-8">
            Loading orders...
          </div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-lg border p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="size-10 rounded-full" />
                  <div className="space-y-1">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <Skeleton className="h-5 w-20 ml-auto" />
                  <Skeleton className="h-4 w-16 ml-auto" />
                </div>
              </div>
              <div className="border-t pt-4">
                <div className="space-y-3">
                  {[1, 2].map((j) => (
                    <div key={j} className="flex items-center gap-3">
                      <Skeleton className="size-12 rounded-md" />
                      <div className="flex-1 space-y-1">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                      <Skeleton className="h-4 w-16" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default async function OrdersPage() {
  return (
    <div className="container mx-auto max-w-7xl py-7 space-y-7">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
        <p className="text-muted-foreground mt-0.5 text-sm">
          Manage and track all your orders
        </p>
      </div>
      <Suspense fallback={<OrdersPageSkeleton />}>
        <OrdersContent />
      </Suspense>
    </div>
  );
}
