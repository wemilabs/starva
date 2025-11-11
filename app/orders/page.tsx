import { ScrollText } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { OrdersPageSkeleton } from "@/components/orders/order-skeleton";
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
  getOrderStats,
  getOrdersByOrganization,
  getOrdersByUser,
} from "@/data/orders";
import { verifySession } from "@/data/user-session";
import { GENERAL_BRANDING_IMG_URL } from "@/lib/constants";

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
          <EmptyDescription className="font-mono tracking-tighter">
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
            <EmptyDescription className="font-mono tracking-tighter">
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

export async function generateMetadata(): Promise<Metadata> {
  const title = "Orders - Starva";
  const description =
    "Manage and track all your orders in one place. View order status, track deliveries, and manage customer orders with Starva's powerful order management system.";

  const ordersUrl = `${
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  }/orders`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: ordersUrl,
      type: "website",
      images: [
        {
          url: GENERAL_BRANDING_IMG_URL,
          width: 1200,
          height: 630,
          alt: "Starva app - A sure platform for local businesses and customers to meet. Easy, fast and reliable.",
        },
      ],
      siteName: "Starva",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [GENERAL_BRANDING_IMG_URL],
    },
    alternates: {
      canonical: ordersUrl,
    },
  };
}

export default async function OrdersPage() {
  return (
    <div className="container mx-auto max-w-7xl py-7 space-y-7">
      <div>
        <h1 className="text-2xl font-medium tracking-tight">Orders</h1>
        <p className="text-muted-foreground mt-0.5 text-sm text-pretty font-mono tracking-tighter">
          Manage and track all your orders
        </p>
      </div>
      <Suspense fallback={<OrdersPageSkeleton />}>
        <OrdersContent />
      </Suspense>
    </div>
  );
}
