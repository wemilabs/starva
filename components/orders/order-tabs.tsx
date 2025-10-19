"use client";

import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Order, OrderItem } from "@/db/schema";
import { ORDER_STATUS_VALUES } from "@/lib/constants";
import { ShoppingBag, Store } from "lucide-react";
import { OrderList } from "./order-list";
import { OrderStats } from "./order-stats";

type OrderWithUser = Order & {
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
  organization?: {
    id: string;
    name: string;
    slug: string;
    logo: string | null;
  };
  orderItems: (OrderItem & {
    product: {
      id: string;
      name: string;
      imageUrl: string | null;
      price: string;
    };
  })[];
};

type OrderWithOrganization = Order & {
  user?: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
  organization: {
    id: string;
    name: string;
    slug: string;
    logo: string | null;
  };
  orderItems: (OrderItem & {
    product: {
      id: string;
      name: string;
      imageUrl: string | null;
      price: string;
    };
  })[];
};

interface OrderTabsProps {
  myOrders: OrderWithOrganization[];
  customerOrders: OrderWithUser[];
  merchantStats: {
    status: string;
    count: number;
    totalRevenue: string | null;
  }[];
  hasActiveBusiness: boolean;
}

export function OrderTabs({
  myOrders,
  customerOrders,
  merchantStats,
  hasActiveBusiness,
}: OrderTabsProps) {
  const myOrdersStats = calculateOrderStats(myOrders);

  return (
    <Tabs defaultValue="my-orders" className="w-full">
      <TabsList className="grid w-full max-w-md grid-cols-2 mx-auto">
        <TabsTrigger value="my-orders" className="gap-1.5">
          <ShoppingBag className="size-4" />
          Mine
          {myOrders.length > 0 && (
            <Badge variant="secondary">
              {myOrders.length}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="customer-orders" className="gap-1.5">
          <Store className="size-4" />
          From Customers
          {customerOrders.length > 0 && (
            <Badge variant="secondary">
              {customerOrders.length}
            </Badge>
          )}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="my-orders" className="space-y-6 mt-6">
        <OrderStats stats={myOrdersStats} />
        <OrderList orders={myOrders} variant="customer" />
      </TabsContent>

      <TabsContent value="customer-orders" className="space-y-6 mt-6">
        {hasActiveBusiness ? (
          <>
            <OrderStats stats={merchantStats} />
            <OrderList orders={customerOrders} variant="merchant" />
          </>
        ) : (
          <div className="text-center py-12 flex flex-col items-center justify-center border border-dashed rounded-md">
            <Store className="size-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Business Selected</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              Please select a business to view and manage orders from your
              customers
            </p>
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}

function calculateOrderStats(orders: OrderWithOrganization[]) {
  const statusCounts = orders.reduce(
    (acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return ORDER_STATUS_VALUES.map((status) => ({
    status,
    count: statusCounts[status] || 0,
    totalRevenue:
      orders
        .filter((o) => o.status === status)
        .reduce((sum, o) => sum + parseFloat(o.totalPrice), 0)
        .toString() || "0",
  }));
}