"use client";

import {
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Payment } from "@/db/schema";
import { cn, formatPrice } from "@/lib/utils";

const statusConfig = {
  pending: {
    label: "Pending",
    icon: Clock,
    variant: "secondary" as const,
    className: "text-yellow-600",
  },
  successful: {
    label: "Completed",
    icon: CheckCircle2,
    variant: "default" as const,
    className: "text-green-600",
  },
  failed: {
    label: "Failed",
    icon: XCircle,
    variant: "destructive" as const,
    className: "text-red-600",
  },
  expired: {
    label: "Expired",
    icon: XCircle,
    variant: "outline" as const,
    className: "text-muted-foreground",
  },
};

export function TransactionList({ transactions }: { transactions: Payment[] }) {
  return (
    <div className="space-y-3">
      {transactions.map((tx) => {
        const isCashin = tx.kind === "CASHIN";
        const status = statusConfig[tx.status];
        const StatusIcon = status.icon;

        return (
          <Card key={tx.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "flex size-10 items-center justify-center rounded-full",
                      isCashin ? "bg-green-100" : "bg-blue-100"
                    )}
                  >
                    {isCashin ? (
                      <ArrowDownLeft className="size-5 text-green-600" />
                    ) : (
                      <ArrowUpRight className="size-5 text-blue-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">
                      {isCashin ? "Payment Received" : "Withdrawal"}
                    </p>
                    <p className="text-sm text-muted-foreground font-mono tracking-tighter">
                      {tx.phoneNumber}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p
                    className={cn(
                      "font-semibold",
                      isCashin ? "text-green-600" : "text-blue-600"
                    )}
                  >
                    {isCashin ? "+" : "-"}
                    {formatPrice(parseFloat(tx.amount))}
                  </p>
                  <div className="flex items-center justify-end gap-1.5 mt-1">
                    <StatusIcon className={cn("size-3.5", status.className)} />
                    <Badge variant={status.variant} className="text-xs">
                      {status.label}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t flex items-center justify-between text-xs text-muted-foreground">
                <span className="font-mono tracking-tighter">
                  {new Date(tx.createdAt).toLocaleDateString("en-RW", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                <span className="font-mono tracking-tighter truncate max-w-[150px]">
                  Ref: {tx.paypackRef?.slice(0, 8)}...
                </span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
