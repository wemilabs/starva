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
import {
    getOrdersByOrganization,
    getOrdersByUser,
    getOrderStats,
} from "@/data/orders";
import { verifySession } from "@/data/user-session";
import { ScrollText } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

export default async function OrdersPage() {
  const sessionData = await verifySession();

  if (!sessionData.success || !sessionData.session) {
    return (
      <div className="container max-w-7xl py-7 space-y-7">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground mt-0.5 text-sm">
            Manage and track all your orders
          </p>
        </div>
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
      </div>
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
    <div className="container max-w-7xl py-7 space-y-7">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
        <p className="text-muted-foreground mt-0.5 text-sm">
          Manage and track all your orders
        </p>
      </div>
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
        <Suspense fallback={<div className="text-center text-muted-foreground">Loading orders...</div>}>
          <OrderTabs
            myOrders={myOrders}
            customerOrders={customerOrders}
            merchantStats={merchantStats}
            hasActiveBusiness={!!activeOrgId}
          />
        </Suspense>
      )}
    </div>
  );
}
