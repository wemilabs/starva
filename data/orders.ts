import { and, desc, eq, inArray, lt, or, sql } from "drizzle-orm";
import { cacheLife } from "next/cache";
import { cache } from "react";
import { db } from "@/db/drizzle";
import { type OrderStatus, order } from "@/db/schema";
import "server-only";

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
        ...ord,
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
    ...orderData,
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
        ...ord,
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
          ...ord,
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

  const stats = await db
    .select({
      status: order.status,
      count: sql<number>`count(*)::int`,
      totalRevenue: sql<string>`sum(${order.totalPrice})`,
    })
    .from(order)
    .where(eq(order.organizationId, organizationId))
    .groupBy(order.status);

  return stats;
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
          ...ord,
          merchantOrderNumber,
        };
      })
    );

    return ordersWithNumbers;
  }
);
