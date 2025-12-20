"use client";

import { Bell, CheckCircle, Clock, Package, XCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRealtime } from "@/hooks/use-realtime";
import { useActiveOrganization } from "@/lib/auth-client";
import { formatPriceInRWF, formatRelativeTime } from "@/lib/utils";

interface OrderNotification {
  id: string;
  type: "new" | "status";
  orderNumber: number;
  customerName?: string;
  customerEmail?: string;
  total?: string;
  status?: string;
  itemCount?: number;
  createdAt: string;
  read: boolean;
}

export function NotificationsDropdownMenu() {
  const [notifications, setNotifications] = useState<OrderNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { data: activeStore } = useActiveOrganization();

  // Listen for new orders
  useRealtime({
    channels: activeStore ? [`org:${activeStore.id}`] : [],
    events: ["orders.new"],
    onData: (payload) => {
      if (
        payload.event === "orders.new" &&
        payload.data.organizationId === activeStore?.id
      ) {
        const newNotification: OrderNotification = {
          id: payload.data.orderId,
          type: "new",
          orderNumber: payload.data.orderNumber,
          customerName: payload.data.customerName,
          customerEmail: payload.data.customerEmail,
          total: payload.data.total,
          itemCount: payload.data.itemCount,
          createdAt: payload.data.createdAt,
          read: false,
        };

        setNotifications((prev) => [newNotification, ...prev].slice(0, 50)); // Keep last 50
        setUnreadCount((prev) => prev + 1);

        // Show toast notification
        toast.success("New order received!", {
          description: `Order #${payload.data.orderNumber} from ${payload.data.customerName}`,
          action: {
            label: "View Order",
            onClick: () => {
              window.location.href = `/orders/${payload.data.orderId}`;
            },
          },
        });
      }
    },
  });

  // Mark notification as read when clicked
  const handleNotificationClick = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  // Clear all notifications
  const clearAllNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="size-4 text-green-500" />;
      case "cancelled":
        return <XCircle className="size-4 text-red-500" />;
      case "preparing":
        return <Clock className="size-4 text-blue-500" />;
      default:
        return <Package className="size-4 text-orange-500" />;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="relative border-none shadow-none bg-transparent hover:bg-muted"
        >
          <Bell className="size-4" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -right-0.5 -top-0.5 size-4 flex items-center justify-center text-xs"
              title="Notifications count"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-96" align="end">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {notifications.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllNotifications}
              className="text-xs"
            >
              Clear all
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            <Package className="size-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No new notifications</p>
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            {notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className="p-3 cursor-pointer focus:bg-accent"
                asChild
              >
                <Link
                  href={`/orders/${notification.id}`}
                  onClick={() => handleNotificationClick(notification.id)}
                >
                  <div className="flex items-start gap-3 w-full">
                    <div className="mt-0.5">
                      {getStatusIcon(notification.status)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm">
                          {notification.type === "new"
                            ? "New Order"
                            : `Order Update`}
                        </p>
                        {!notification.read && (
                          <div className="size-2 bg-blue-500 rounded-full" />
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <p className="text-xs text-muted-foreground">
                          Order #{notification.orderNumber}
                        </p>
                        {notification.type === "new" &&
                          notification.customerName && (
                            <>
                              <p className="text-xs text-muted-foreground">
                                from {notification.customerName} |{" "}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {notification.itemCount ?? 0} item
                                {(notification.itemCount ?? 0) > 1
                                  ? "s"
                                  : ""} •{" "}
                                {notification.total &&
                                  formatPriceInRWF(Number(notification.total))}
                              </p>
                            </>
                          )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatRelativeTime(notification.createdAt)}
                      </p>
                    </div>
                  </div>
                </Link>
              </DropdownMenuItem>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
