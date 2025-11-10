"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { OrderStatus } from "@/db/schema";
import { ORDER_STATUS_VALUES } from "@/lib/constants";
import { updateOrderStatus } from "@/server/orders";
import { Spinner } from "../ui/spinner";

interface OrderStatusSelectProps {
  orderId: string;
  currentStatus: OrderStatus;
  disabled?: boolean;
}

const statusOptions: { value: OrderStatus; label: string }[] =
  ORDER_STATUS_VALUES.map((status) => ({
    value: status,
    label: status.charAt(0).toUpperCase() + status.slice(1),
  }));

export function OrderStatusSelect({
  orderId,
  currentStatus,
  disabled,
}: OrderStatusSelectProps) {
  const [isPending, startTransition] = useTransition();
  const [selectedStatus, setSelectedStatus] = useState(currentStatus);

  const handleStatusChange = (newStatus: OrderStatus) => {
    setSelectedStatus(newStatus);
    startTransition(async () => {
      const result = await updateOrderStatus({
        orderId,
        status: newStatus,
      });

      if (result.ok) {
        toast.success("Order status updated successfully");
      } else {
        toast.error(result.error || "Failed to update order status");
        setSelectedStatus(currentStatus);
      }
    });
  };

  return (
    <div className="flex items-center gap-2">
      <Select
        value={selectedStatus}
        onValueChange={handleStatusChange}
        disabled={disabled || isPending}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {statusOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {isPending && <Spinner />}
    </div>
  );
}
