"use client";

import { Bell, Clock, Package } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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
import {
  getOrderNotifications,
  getUnreadOrderNotificationCount,
  markAllOrderNotificationsAsRead,
  markOrderNotificationAsRead,
} from "@/server/notifications";

interface OrderNotification {
  id: string;
  organizationId: string;
  orderId: string;
  type: "new" | "status_update";
  orderNumber: number;
  customerName: string | null;
  customerEmail: string | null;
  total: string | null;
  itemCount: number | null;
  createdAt: Date;
  read: boolean;
}

export function NotificationsDropdownMenu() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<OrderNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { data: activeStore } = useActiveOrganization();

  // Sync with database on mount and when organization changes
  useEffect(() => {
    if (!activeStore?.id) return;

    const orgId = activeStore.id;
    let ignore = false;

    async function loadNotifications() {
      try {
        const [notificationsData, unreadData] = await Promise.all([
          getOrderNotifications(orgId, 50),
          getUnreadOrderNotificationCount(orgId),
        ]);

        if (!ignore) {
          setNotifications(notificationsData);
          setUnreadCount(unreadData);
        }
      } catch (error) {
        console.error("Failed to load notifications:", error);
      }
    }

    loadNotifications();

    return () => {
      ignore = true;
    };
  }, [activeStore?.id]);

  // Mark notification as read when clicked
  const handleNotificationClick = async (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    try {
      await markOrderNotificationAsRead(notificationId);
    } catch (error: unknown) {
      const err = error as Error;
      console.error("Failed to mark notification as read:", err.message);
    }
  };

  // Clear all notifications
  const clearAllNotifications = async () => {
    if (!activeStore?.id) return;

    setNotifications([]);
    setUnreadCount(0);

    try {
      await markAllOrderNotificationsAsRead(activeStore.id);
    } catch (error: unknown) {
      const err = error as Error;
      console.error("Failed to mark all notifications as read:", err.message);
    }
  };

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
          organizationId: payload.data.organizationId,
          orderId: payload.data.orderId,
          type: "new",
          orderNumber: payload.data.orderNumber,
          customerName: payload.data.customerName,
          customerEmail: payload.data.customerEmail,
          total: payload.data.total,
          itemCount: payload.data.itemCount,
          createdAt: new Date(payload.data.createdAt),
          read: false,
        };

        setNotifications((prev) => [newNotification, ...prev].slice(0, 50));
        setUnreadCount((prev) => prev + 1);

        toast.success("New order received!", {
          description: `Order #${payload.data.orderNumber} from ${payload.data.customerName}`,
          action: {
            label: "View Order",
            onClick: () => {
              router.push(`/orders/${payload.data.orderId}`);
            },
          },
        });
      }
    },
  });

  const getNotificationIcon = (type: "new" | "status_update") => {
    switch (type) {
      case "new":
        return <Package className="size-4 text-orange-500" />;
      case "status_update":
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
            <p className="text-sm tracking-tighter font-mono">
              No new notifications
            </p>
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
                      {getNotificationIcon(notification.type)}
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
