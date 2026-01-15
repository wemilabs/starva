import { eq } from "drizzle-orm";
import { db } from "@/db/drizzle";
import { payment } from "@/db/schema";
import { decrypt } from "@/lib/encryption";
import "server-only";

function decryptPayment<T extends { amount: string; phoneNumber: string }>(
  p: T
): T {
  return {
    ...p,
    amount: decrypt(p.amount),
    phoneNumber: decrypt(p.phoneNumber),
  };
}

export async function getWalletBalance(organizationId: string) {
  const payments = await db.query.payment.findMany({
    where: eq(payment.organizationId, organizationId),
    columns: {
      kind: true,
      status: true,
      amount: true,
    },
  });

  let totalCashin = 0;
  let totalCashout = 0;
  let pendingCashout = 0;

  for (const p of payments) {
    const amount = parseFloat(decrypt(p.amount) || "0");
    if (p.kind === "CASHIN" && p.status === "successful") {
      totalCashin += amount;
    } else if (p.kind === "CASHOUT" && p.status === "successful") {
      totalCashout += amount;
    } else if (p.kind === "CASHOUT" && p.status === "pending") {
      pendingCashout += amount;
    }
  }

  const available = totalCashin - totalCashout - pendingCashout;

  return {
    totalCashin,
    totalCashout,
    pendingCashout,
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

  return transactions.map(decryptPayment);
}

export async function getTransactionById(transactionId: string) {
  const transaction = await db.query.payment.findFirst({
    where: (p, { eq }) => eq(p.id, transactionId),
    with: {
      organization: true,
      order: true,
    },
  });

  if (!transaction) return null;

  return {
    ...decryptPayment(transaction),
    order: transaction.order
      ? {
          ...transaction.order,
          totalPrice: decrypt(transaction.order.totalPrice),
        }
      : null,
  };
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
