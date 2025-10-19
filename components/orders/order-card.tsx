import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { Order, OrderItem } from "@/db/schema";
import { formatPriceInRWF, formatRelativeTime } from "@/lib/utils";
import { Clock, Package, Wallet2 } from "lucide-react";
import Link from "next/link";
import { OrderStatusBadge } from "./order-status-badge";

interface OrderCardProps {
  order: Order & {
    user?: {
      id: string;
      name: string;
      email: string;
      image: string | null;
    };
    organization?: {
      id: string;
      name: string;
      slug: string;
      logo: string | null;
    };
    orderItems: (OrderItem & {
      product: {
        id: string;
        name: string;
        imageUrl: string | null;
        price: string;
      };
    })[];
  };
  variant?: "customer" | "merchant";
}

export function OrderCard({ order, variant = "merchant" }: OrderCardProps) {
  const itemCount = order.orderItems.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );

  return (
    <Link href={`/orders/${order.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-lg">#{order.orderNumber}</h3>
                <OrderStatusBadge status={order.status} />
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="size-3" />
                  {formatRelativeTime(order.createdAt)}
                </div>
                <div className="flex items-center gap-1">
                  <Package className="size-3" />
                  {itemCount} item{itemCount <= 1 ? "" : "s"}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 font-semibold text-lg">
                <Wallet2 className="size-4" />
                {formatPriceInRWF(order.totalPrice)}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {variant === "merchant" && order.user ? (
                <>
                  <Avatar className="size-8">
                    <AvatarImage src={order.user.image || undefined} />
                    <AvatarFallback>
                      {order.user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{order.user.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {order.user.email}
                    </p>
                  </div>
                </>
              ) : variant === "customer" && order.organization ? (
                <>
                  <Avatar className="size-8">
                    <AvatarImage src={order.organization.logo || undefined} />
                    <AvatarFallback>
                      {order.organization.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">
                      {order.organization.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Business
                    </p>
                  </div>
                </>
              ) : null}
            </div>
          </div>

          {order.notes && (
            <div className="mt-3 p-2 bg-muted rounded-md">
              <p className="text-xs text-muted-foreground">
                <span className="font-medium">Note:</span> {order.notes}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
