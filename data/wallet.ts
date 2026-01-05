import { eq, sql } from "drizzle-orm";
import { db } from "@/db/drizzle";
import { payment } from "@/db/schema";
import "server-only";

export async function getWalletBalance(organizationId: string) {
  const result = await db
    .select({
      totalCashin: sql<string>`COALESCE(SUM(CASE WHEN ${payment.kind} = 'CASHIN' AND ${payment.status} = 'successful' THEN ${payment.amount} ELSE 0 END), 0)`,
      totalCashout: sql<string>`COALESCE(SUM(CASE WHEN ${payment.kind} = 'CASHOUT' AND ${payment.status} = 'successful' THEN ${payment.amount} ELSE 0 END), 0)`,
      pendingCashout: sql<string>`COALESCE(SUM(CASE WHEN ${payment.kind} = 'CASHOUT' AND ${payment.status} = 'pending' THEN ${payment.amount} ELSE 0 END), 0)`,
    })
    .from(payment)
    .where(eq(payment.organizationId, organizationId));

  const { totalCashin, totalCashout, pendingCashout } = result[0] || {
    totalCashin: "0",
    totalCashout: "0",
    pendingCashout: "0",
  };

  const available =
    parseFloat(totalCashin) -
    parseFloat(totalCashout) -
    parseFloat(pendingCashout);

  return {
    totalCashin: parseFloat(totalCashin),
    totalCashout: parseFloat(totalCashout),
    pendingCashout: parseFloat(pendingCashout),
    available: Math.max(0, available),
  };
}

export async function getWalletTransactions(
  organizationId: string,
  limit = 50
) {
  const transactions = await db.query.payment.findMany({
    where: (p, { eq }) => eq(p.organizationId, organizationId),
    orderBy: (p, { desc }) => [desc(p.createdAt)],
    limit,
  });

  return transactions;
}

export async function getOrganizationForWallet(organizationId: string) {
  const org = await db.query.organization.findFirst({
    where: (o, { eq }) => eq(o.id, organizationId),
  });

  if (!org) return null;

  const metadata = org.metadata
    ? typeof org.metadata === "string"
      ? JSON.parse(org.metadata)
      : org.metadata
    : {};

  return {
    id: org.id,
    name: org.name,
    slug: org.slug,
    phoneForPayments: metadata.phoneForPayments || null,
  };
}
