import { Badge } from "@/components/ui/badge";
import type { OrderStatus } from "@/db/schema";
import {
  Clock,
  CheckCircle2,
  ChefHat,
  Package,
  CheckCheck,
  XCircle,
} from "lucide-react";

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

const statusConfig = {
  pending: {
    label: "Pending",
    variant: "secondary" as const,
    icon: Clock,
    className:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  },
  confirmed: {
    label: "Confirmed",
    variant: "default" as const,
    icon: CheckCircle2,
    className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  },
  preparing: {
    label: "Preparing",
    variant: "default" as const,
    icon: ChefHat,
    className:
      "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  },
  ready: {
    label: "Ready",
    variant: "default" as const,
    icon: Package,
    className:
      "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  },
  delivered: {
    label: "Delivered",
    variant: "default" as const,
    icon: CheckCheck,
    className:
      "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  },
  cancelled: {
    label: "Cancelled",
    variant: "destructive" as const,
    icon: XCircle,
    className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  },
};

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className={config.className}>
      <Icon className="mr-1 h-3 w-3" />
      {config.label}
    </Badge>
  );
}
