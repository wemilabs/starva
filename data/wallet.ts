import { and, eq } from "drizzle-orm";
import { db } from "@/db/drizzle";
import { member, payment } from "@/db/schema";
import { decrypt } from "@/lib/encryption";
import "server-only";
import { verifySession } from "./user-session";

function decryptPayment<T extends { amount: string; phoneNumber: string }>(
  p: T,
): T {
  return {
    ...p,
    amount: decrypt(p.amount),
    phoneNumber: decrypt(p.phoneNumber),
  };
}

export async function getWalletBalance(organizationId: string) {
  const verified = await verifySession();
  if (!verified.success)
    return { ok: false as const, error: "Unauthorized", balance: null };

  const { session } = verified;

  const membership = await db.query.member.findFirst({
    where: and(
      eq(member.organizationId, organizationId),
      eq(member.userId, session.user.id),
    ),
  });

  if (!membership)
    return { ok: false as const, error: "Unauthorized", balance: null };

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
    ok: true as const,
    balance: {
      totalCashin,
      totalCashout,
      pendingCashout,
      available: Math.max(0, available),
    },
  };
}

export async function getWalletTransactions(
  organizationId: string,
  limit = 50,
) {
  const verified = await verifySession();
  if (!verified.success)
    return { ok: false as const, error: "Unauthorized", transactions: [] };

  const { session } = verified;

  const membership = await db.query.member.findFirst({
    where: and(
      eq(member.organizationId, organizationId),
      eq(member.userId, session.user.id),
    ),
  });

  if (!membership)
    return {
      ok: false as const,
      error: "Only organization members can view wallet transactions",
      transactions: [],
    };

  const transactions = await db.query.payment.findMany({
    where: (p, { eq }) => eq(p.organizationId, organizationId),
    orderBy: (p, { desc }) => [desc(p.createdAt)],
    limit,
  });

  return { ok: true as const, transactions: transactions.map(decryptPayment) };
}

export async function getTransactionById(transactionId: string) {
  const verified = await verifySession();
  if (!verified.success)
    return { ok: false as const, error: "Unauthorized", transaction: null };

  const { session } = verified;

  const transaction = await db.query.payment.findFirst({
    where: (p, { eq }) => eq(p.id, transactionId),
    with: {
      organization: true,
      order: true,
    },
  });

  if (!transaction)
    return {
      ok: false as const,
      error: "Transaction not found",
      transaction: null,
    };

  if (transaction.organizationId) {
    const membership = await db.query.member.findFirst({
      where: and(
        eq(member.organizationId, transaction.organizationId),
        eq(member.userId, session.user.id),
      ),
    });

    if (!membership)
      return {
        ok: false as const,
        error: "Only organization members can view this transaction",
        transaction: null,
      };
  } else if (transaction.userId !== session.user.id) {
    return {
      ok: false as const,
      error: "You can only view your own transactions",
      transaction: null,
    };
  }

  return {
    ok: true as const,
    transaction: {
      ...decryptPayment(transaction),
      order: transaction.order
        ? {
            ...transaction.order,
            totalPrice: decrypt(transaction.order.totalPrice),
          }
        : null,
    },
  };
}

export async function getOrganizationForWallet(organizationId: string) {
  const verified = await verifySession();
  if (!verified.success)
    return { ok: false as const, error: "Unauthorized", organization: null };

  const { session } = verified;

  const membership = await db.query.member.findFirst({
    where: and(
      eq(member.organizationId, organizationId),
      eq(member.userId, session.user.id),
    ),
  });

  if (!membership)
    return {
      ok: false as const,
      error: "Only organization members can access wallet settings",
      organization: null,
    };

  const org = await db.query.organization.findFirst({
    where: (o, { eq }) => eq(o.id, organizationId),
  });

  if (!org)
    return {
      ok: false as const,
      error: "Organization not found",
      organization: null,
    };

  const metadata = org.metadata
    ? typeof org.metadata === "string"
      ? JSON.parse(org.metadata)
      : org.metadata
    : {};

  return {
    ok: true as const,
    organization: {
      id: org.id,
      name: org.name,
      slug: org.slug,
      phoneForPayments: metadata.phoneForPayments || null,
    },
  };
}
