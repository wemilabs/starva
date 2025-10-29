import { CancelOrderButton } from "@/components/orders/cancel-order-button";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { OrderStatusSelect } from "@/components/orders/order-status-select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { getOrderById } from "@/data/orders";
import { verifySession } from "@/data/user-session";
import { formatDate, formatPriceInRWF } from "@/lib/utils";
import { ArrowLeft, Calendar, Package } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";

async function OrderContent({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;

  const session = await verifySession();
  if (!session?.session) {
    redirect("/sign-in");
  }

  const order = await getOrderById(orderId);
  if (!order) notFound();

  const isOwner = order.userId === session.session.user.id;
  const activeOrgId = session.session.session.activeOrganizationId;
  const isMerchant = order.organizationId === activeOrgId;

  const totalItems = order.orderItems.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );

  const orderNumber = isMerchant
    ? order.merchantOrderNumber
    : order.customerOrderNumber;

  return (
    <div className="container mx-auto max-w-7xl py-7 space-y-7">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/orders">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">
            Order #{orderNumber}
          </h1>
          <p className="text-muted-foreground mt-0.5 text-sm">
            Placed on {formatDate(order.createdAt)}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Order Items</CardTitle>
                  <CardDescription>
                    {totalItems} {totalItems === 1 ? "item" : "items"} in this
                    order
                  </CardDescription>
                </div>
                {isMerchant && (
                  <OrderStatusSelect
                    orderId={order.id}
                    currentStatus={order.status}
                    disabled={
                      order.status === "delivered" ||
                      order.status === "cancelled"
                    }
                  />
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.orderItems.map(item => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 p-3 rounded-lg border"
                  >
                    <div className="relative size-16 rounded-md overflow-hidden bg-muted">
                      {item.product.imageUrl ? (
                        <Image
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Package className="size-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm md:text-base">
                        {item.product.name}
                      </h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>
                          {formatPriceInRWF(item.priceAtOrder)} ×{" "}
                          {item.quantity}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm">
                        {formatPriceInRWF(item.subtotal)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              <div className="space-y-2">
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>{formatPriceInRWF(order.totalPrice)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {order.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Order Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">{order.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="size-12">
                  <AvatarImage src={order.user.image || undefined} />
                  <AvatarFallback>
                    {order.user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{order.user.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {order.user.email}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {order.organization && (
            <Card>
              <CardHeader>
                <CardTitle>Business</CardTitle>
              </CardHeader>
              <CardContent>
                <Link
                  href={`/businesses/${order.organization.slug}`}
                  className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                >
                  {order.organization.logo ? (
                    <div className="relative size-12 rounded-lg overflow-hidden">
                      <Image
                        src={order.organization.logo}
                        alt={order.organization.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="size-12 rounded-lg bg-linear-to-br from-orange-500 to-yellow-500" />
                  )}
                  <div>
                    <p className="font-medium">{order.organization.name}</p>
                    <p className="text-sm text-muted-foreground">
                      @{order.organization.slug}
                    </p>
                  </div>
                </Link>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Order Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="size-4 text-muted-foreground" />
                <span className="text-muted-foreground">Created:</span>
                <span className="font-medium">
                  {formatDate(order.createdAt)}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="size-4 text-muted-foreground" />
                <span className="text-muted-foreground">Updated:</span>
                <span className="font-medium">
                  {formatDate(order.updatedAt)}
                </span>
              </div>
            </CardContent>
          </Card>

          {(isOwner || isMerchant) &&
            order.status !== "delivered" &&
            order.status !== "cancelled" && (
              <CancelOrderButton orderId={order.id} />
            )}
        </div>
      </div>
    </div>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ orderId: string }>;
}): Promise<Metadata> {
  const { orderId } = await params;

  const order = await getOrderById(orderId);
  if (!order) {
    return {
      title: "Order Not Found - Starva",
      description: "The requested order could not be found.",
    };
  }

  const session = await verifySession();
  const activeOrgId = session?.session?.session.activeOrganizationId;
  const isMerchant = order.organizationId === activeOrgId;

  const orderNumber = isMerchant
    ? order.merchantOrderNumber
    : order.customerOrderNumber;

  const totalItems = order.orderItems.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );

  const firstItem = order.orderItems[0];
  const hasMultipleItems = order.orderItems.length > 1;

  const title = `Order #${orderNumber} - Starva`;
  const description = hasMultipleItems
    ? `Order #${orderNumber} with ${totalItems} items. Total: ${formatPriceInRWF(order.totalPrice)}. Placed on ${formatDate(order.createdAt)}. Status: ${order.status}.`
    : `Order #${orderNumber} for ${firstItem?.product.name || "items"}. Total: ${formatPriceInRWF(order.totalPrice)}. Placed on ${formatDate(order.createdAt)}. Status: ${order.status}.`;

  const images = [];
  if (firstItem?.product.imageUrl) {
    images.push({
      url: firstItem.product.imageUrl,
      width: 1200,
      height: 630,
      alt: firstItem.product.name,
    });
  } else {
    images.push({
      url: "https://hsl8jk540a.ufs.sh/f/JFF4Q8WebB6dacuUyMdwvZO8oJpYyFEwgT69CVIdltrHUQc7",
      width: 1200,
      height: 630,
      alt: "Starva app - A sure platform for local businesses and customers to meet. Easy, fast and reliable.",
    });
  }

  const orderUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/orders/${orderId}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: orderUrl,
      type: "website",
      images,
      siteName: "Starva",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: images.map(img => img.url),
    },
    alternates: {
      canonical: orderUrl,
    },
  };
}

export default async function OrderPage(props: PageProps<"/orders/[orderId]">) {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto max-w-7xl py-7 space-y-7">
          <div className="flex items-center gap-4">
            <Skeleton className="size-10" />
            <div className="flex-1">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="mt-2 h-4 w-32" />
            </div>
            <Skeleton className="h-6 w-20" />
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2 space-y-6">
              <div className="rounded-lg border p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="mt-1 h-4 w-24" />
                  </div>
                  <Skeleton className="h-10 w-32" />
                </div>

                <div className="space-y-4">
                  {[1, 2].map(i => (
                    <div
                      key={i}
                      className="flex items-center gap-4 p-3 rounded-lg border"
                    >
                      <Skeleton className="size-16 rounded-md" />
                      <div className="flex-1">
                        <Skeleton className="h-5 w-48" />
                        <Skeleton className="mt-2 h-4 w-24" />
                      </div>
                      <div className="text-right">
                        <Skeleton className="h-5 w-20 ml-auto" />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-5 w-24" />
                  </div>
                </div>
              </div>

              <div className="rounded-lg border p-6">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="mt-4 h-4 w-full" />
                <Skeleton className="mt-2 h-4 w-3/4" />
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-lg border p-6 space-y-4">
                <Skeleton className="h-6 w-24" />
                <div className="flex items-center gap-3">
                  <Skeleton className="size-12 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="mt-1 h-4 w-40" />
                  </div>
                </div>
              </div>

              <div className="rounded-lg border p-6 space-y-4">
                <Skeleton className="h-6 w-24" />
                <div className="flex items-center gap-3">
                  <Skeleton className="size-12 rounded-lg" />
                  <div className="flex-1">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="mt-1 h-4 w-24" />
                  </div>
                </div>
              </div>

              <div className="rounded-lg border p-6 space-y-3">
                <Skeleton className="h-6 w-32" />
                <div className="flex items-center gap-2">
                  <Skeleton className="size-4" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="size-4" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>

              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </div>
      }
    >
      <OrderContent params={props.params} />
    </Suspense>
  );
}
