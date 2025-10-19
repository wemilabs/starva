import { db } from "@/db/drizzle";
import { type OrderStatus, order } from "@/db/schema";
import { and, desc, eq, inArray, sql } from "drizzle-orm";
import "server-only";

export async function getOrdersByOrganization(organizationId: string) {
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
              imageUrl: true,
              price: true,
            },
          },
        },
      },
    },
    orderBy: [desc(order.createdAt)],
  });

  return orders;
}

export async function getOrderById(orderId: string) {
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
              imageUrl: true,
              price: true,
              description: true,
            },
          },
        },
      },
    },
  });

  return orderData;
}

export async function getOrdersByUser(userId: string) {
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
              imageUrl: true,
              price: true,
            },
          },
        },
      },
    },
    orderBy: [desc(order.createdAt)],
  });

  return orders;
}

export async function getOrdersByStatus(
  organizationId: string,
  status: OrderStatus | OrderStatus[],
) {
  const statuses = Array.isArray(status) ? status : [status];

  const orders = await db.query.order.findMany({
    where: and(
      eq(order.organizationId, organizationId),
      inArray(order.status, statuses),
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
              imageUrl: true,
              price: true,
            },
          },
        },
      },
    },
    orderBy: [desc(order.createdAt)],
  });

  return orders;
}

export async function getOrderStats(organizationId: string) {
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
}

export async function getRecentOrders(
  organizationId: string,
  limit: number = 10,
) {
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

  return orders;
}
