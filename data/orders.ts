import { and, desc, eq, inArray, lt, or, sql } from "drizzle-orm";
import { cacheLife } from "next/cache";
import { cache } from "react";
import { db } from "@/db/drizzle";
import { type OrderStatus, order } from "@/db/schema";
import { decrypt } from "@/lib/encryption";
import "server-only";

function decryptOrderItems<
  T extends { priceAtOrder: string; subtotal: string }
>(items: T[]): T[] {
  return items.map((item) => ({
    ...item,
    priceAtOrder: decrypt(item.priceAtOrder),
    subtotal: decrypt(item.subtotal),
  }));
}

function decryptOrder<T extends { totalPrice: string }>(ord: T): T {
  return {
    ...ord,
    totalPrice: decrypt(ord.totalPrice),
  };
}

async function calculateMerchantOrderNumberPerOrg(
  organizationId: string,
  orderCreatedAt: Date
): Promise<number> {
  const result = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(order)
    .where(
      and(
        eq(order.organizationId, organizationId),
        or(
          lt(order.createdAt, orderCreatedAt),
          and(eq(order.createdAt, orderCreatedAt))
        )
      )
    );
  return result[0]?.count || 0;
}

async function calculateCustomerOrderNumberPerUserPerOrg(
  userId: string,
  organizationId: string,
  orderCreatedAt: Date
): Promise<number> {
  const result = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(order)
    .where(
      and(
        eq(order.userId, userId),
        eq(order.organizationId, organizationId),
        or(
          lt(order.createdAt, orderCreatedAt),
          and(eq(order.createdAt, orderCreatedAt))
        )
      )
    );
  return result[0]?.count || 0;
}

export const getOrdersByOrganization = cache(async (organizationId: string) => {
  const orders = await db.query.order.findMany({
    where: eq(order.organizationId, organizationId),
    with: {
      user: {
        columns: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
      orderItems: {
        with: {
          product: {
            columns: {
              id: true,
              name: true,
              imageUrls: true,
              price: true,
            },
          },
        },
      },
    },
    orderBy: [desc(order.createdAt)],
  });

  const ordersWithNumbers = await Promise.all(
    orders.map(async (ord) => {
      const merchantOrderNumber = await calculateMerchantOrderNumberPerOrg(
        organizationId,
        ord.createdAt
      );
      return {
        ...decryptOrder(ord),
        orderItems: decryptOrderItems(ord.orderItems),
        merchantOrderNumber,
      };
    })
  );

  return ordersWithNumbers;
});

export const getOrderById = cache(async (orderId: string) => {
  const orderData = await db.query.order.findFirst({
    where: eq(order.id, orderId),
    with: {
      user: {
        columns: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
      organization: {
        columns: {
          id: true,
          name: true,
          slug: true,
          logo: true,
        },
      },
      orderItems: {
        with: {
          product: {
            columns: {
              id: true,
              name: true,
              imageUrls: true,
              price: true,
              description: true,
            },
          },
        },
      },
    },
  });

  if (!orderData) return null;

  const [merchantOrderNumber, customerOrderNumber] = await Promise.all([
    calculateMerchantOrderNumberPerOrg(
      orderData.organizationId,
      orderData.createdAt
    ),
    calculateCustomerOrderNumberPerUserPerOrg(
      orderData.userId,
      orderData.organizationId,
      orderData.createdAt
    ),
  ]);

  return {
    ...decryptOrder(orderData),
    orderItems: decryptOrderItems(orderData.orderItems),
    merchantOrderNumber,
    customerOrderNumber,
  };
});

export const getOrdersByUser = cache(async (userId: string) => {
  const orders = await db.query.order.findMany({
    where: eq(order.userId, userId),
    with: {
      organization: {
        columns: {
          id: true,
          name: true,
          slug: true,
          logo: true,
        },
      },
      orderItems: {
        with: {
          product: {
            columns: {
              id: true,
              name: true,
              imageUrls: true,
              price: true,
            },
          },
        },
      },
    },
    orderBy: [desc(order.createdAt)],
  });

  const ordersWithNumbers = await Promise.all(
    orders.map(async (ord) => {
      const customerOrderNumber =
        await calculateCustomerOrderNumberPerUserPerOrg(
          userId,
          ord.organizationId,
          ord.createdAt
        );
      return {
        ...decryptOrder(ord),
        orderItems: decryptOrderItems(ord.orderItems),
        customerOrderNumber,
      };
    })
  );

  return ordersWithNumbers;
});

export const getOrdersByStatus = cache(
  async (organizationId: string, status: OrderStatus | OrderStatus[]) => {
    const statuses = Array.isArray(status) ? status : [status];

    const orders = await db.query.order.findMany({
      where: and(
        eq(order.organizationId, organizationId),
        inArray(order.status, statuses)
      ),
      with: {
        user: {
          columns: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        orderItems: {
          with: {
            product: {
              columns: {
                id: true,
                name: true,
                imageUrls: true,
                price: true,
              },
            },
          },
        },
      },
      orderBy: [desc(order.createdAt)],
    });

    const ordersWithNumbers = await Promise.all(
      orders.map(async (ord) => {
        const merchantOrderNumber = await calculateMerchantOrderNumberPerOrg(
          organizationId,
          ord.createdAt
        );
        return {
          ...decryptOrder(ord),
          orderItems: decryptOrderItems(ord.orderItems),
          merchantOrderNumber,
        };
      })
    );

    return ordersWithNumbers;
  }
);

export const getOrderStats = cache(async (organizationId: string) => {
  "use cache";
  cacheLife("minutes");

  const orders = await db.query.order.findMany({
    where: eq(order.organizationId, organizationId),
    columns: {
      status: true,
      totalPrice: true,
    },
  });

  const statsByStatus = orders.reduce((acc, ord) => {
    const status = ord.status;
    if (!acc[status]) {
      acc[status] = { status, count: 0, totalRevenue: 0 };
    }
    acc[status].count += 1;
    acc[status].totalRevenue += Number(decrypt(ord.totalPrice) || 0);
    return acc;
  }, {} as Record<string, { status: OrderStatus; count: number; totalRevenue: number }>);

  return Object.values(statsByStatus).map((s) => ({
    status: s.status,
    count: s.count,
    totalRevenue: String(s.totalRevenue),
  }));
});

export const getRecentOrders = cache(
  async (organizationId: string, limit: number = 10) => {
    "use cache";
    cacheLife("seconds");

    const orders = await db.query.order.findMany({
      where: eq(order.organizationId, organizationId),
      with: {
        user: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
        orderItems: {
          with: {
            product: {
              columns: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: [desc(order.createdAt)],
      limit,
    });

    const ordersWithNumbers = await Promise.all(
      orders.map(async (ord) => {
        const merchantOrderNumber = await calculateMerchantOrderNumberPerOrg(
          organizationId,
          ord.createdAt
        );
        return {
          ...decryptOrder(ord),
          orderItems: decryptOrderItems(ord.orderItems),
          merchantOrderNumber,
        };
      })
    );

    return ordersWithNumbers;
  }
);
