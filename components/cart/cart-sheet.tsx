"use client";

import { ShoppingBag, Trash2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "@/lib/auth-client";
import { useCartStore } from "@/lib/cart-store";
import { FALLBACK_PRODUCT_IMG_URL } from "@/lib/constants";
import { formatPriceInRWF } from "@/lib/utils";
import { placeOrder } from "@/server/orders";
import { Separator } from "../ui/separator";
import { Spinner } from "../ui/spinner";

export function CartSheet() {
  const router = useRouter();
  const { data: session } = useSession();
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const [orderNotes, setOrderNotes] = useState("");
  const [mounted, setMounted] = useState(false);

  const {
    items,
    removeItem,
    updateQuantity,
    updateNotes,
    clearCart,
    getTotalPrice,
    getItemCount,
  } = useCartStore();

  const totalPrice = getTotalPrice();
  const itemCount = getItemCount();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handlePlaceOrder = () => {
    if (items.length === 0) {
      toast.error("Cart is empty");
      return;
    }

    if (!session?.user) {
      toast.error("Unauthorized access", {
        description: "You will be redirected to sign in to place an order",
      });
      router.push("/sign-in");
      return;
    }

    startTransition(async () => {
      const result = await placeOrder({
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          notes: item.notes,
        })),
        notes: orderNotes,
      });

      if (!result.ok) {
        console.error(result.error);
        toast.error("Failed to place order", {
          description:
            typeof result.error === "string"
              ? result.error
              : "Please try again later.",
        });
        return;
      }

      if (result.whatsappUrl) {
        clearCart();
        setIsOpen(false);
        setOrderNotes("");

        const isSafari = /^((?!chrome|android).)*safari/i.test(
          navigator.userAgent
        );

        if (isSafari) {
          toast.success("Order placed! Redirecting to WhatsApp...");
          window.location.href = result.whatsappUrl;
        } else {
          const newWindow = window.open(result.whatsappUrl, "_blank");

          if (
            !newWindow ||
            newWindow.closed ||
            typeof newWindow.closed === "undefined"
          ) {
            toast.success("Order placed! Redirecting to WhatsApp...");
            window.location.href = result.whatsappUrl;
          } else {
            toast.success("Order placed! Opening WhatsApp...");
          }
        }
      } else {
        console.error(result.error);
        toast.error("Failed to place order", {
          description: "WhatsApp not configured for this merchant",
        });
      }
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="relative border-none shadow-none bg-transparent hover:bg-muted"
        >
          <ShoppingBag className="size-4" />
          {mounted && itemCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -right-0.5 -top-0.5 size-4 flex items-center justify-center text-xs"
              title="Items in cart"
            >
              {itemCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="flex h-full flex-col">
        <SheetHeader className="text-left">
          <SheetTitle>Shopping Cart</SheetTitle>
          <SheetDescription className="font-mono tracking-tighter">
            {itemCount === 0
              ? "Your cart is empty"
              : `${itemCount} item${itemCount > 1 ? "s" : ""} in your cart`}
          </SheetDescription>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
            <ShoppingBag className="size-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground font-mono tracking-tighter">
              Your cart is empty. Start adding products!
            </p>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 h-[calc(100%-24rem)] px-4">
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.productId}
                    className="space-y-3 rounded-lg border p-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative size-16 overflow-hidden rounded-md bg-muted">
                        <Image
                          src={item.productImage || FALLBACK_PRODUCT_IMG_URL}
                          alt={item.productName}
                          width={64}
                          height={64}
                          className="size-full object-cover"
                        />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium leading-tight">
                            {item.productName}
                          </p>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 shrink-0"
                            onClick={() => removeItem(item.productId)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground font-mono tracking-tighter">
                          {formatPriceInRWF(item.price)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="size-8"
                          onClick={() =>
                            updateQuantity(item.productId, item.quantity - 1)
                          }
                        >
                          -
                        </Button>
                        <Input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={(e) =>
                            updateQuantity(
                              item.productId,
                              Number.parseInt(e.target.value, 10) || 1
                            )
                          }
                          className="w-16 text-center"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          className="size-8"
                          onClick={() =>
                            updateQuantity(item.productId, item.quantity + 1)
                          }
                        >
                          +
                        </Button>
                      </div>
                      <p className="ml-auto text-sm font-medium font-mono tracking-tighter">
                        {formatPriceInRWF(Number(item.price) * item.quantity)}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor={`notes-${item.productId}`}
                        className="text-xs"
                      >
                        Item note{" "}
                        <span className="text-muted-foreground font-mono tracking-tighter">
                          (optional)
                        </span>
                      </Label>
                      <Textarea
                        id={`notes-${item.productId}`}
                        value={item.notes || ""}
                        onChange={(e) =>
                          updateNotes(item.productId, e.target.value)
                        }
                        placeholder="Special instructions..."
                        rows={2}
                        className="text-sm"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <Separator />

            <div className="space-y-2 px-4">
              <div className="space-y-2">
                <Label htmlFor="order-notes" className="text-sm">
                  Order notes{" "}
                  <span className="text-muted-foreground font-mono tracking-tighter text-xs">
                    (optional)
                  </span>
                </Label>
                <Textarea
                  id="order-notes"
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder="Any special instructions for the entire order..."
                  rows={3}
                  className="text-sm"
                />
              </div>
              <div className="flex items-center justify-between rounded-lg bg-muted px-3 py-2">
                <span className="font-medium">Total</span>
                <span className="text-lg font-medium font-mono tracking-tighter">
                  {formatPriceInRWF(totalPrice)}
                </span>
              </div>
            </div>

            <Separator />

            <SheetFooter>
              <Button
                onClick={handlePlaceOrder}
                disabled={isPending || items.length === 0}
                className="flex-1"
              >
                {isPending ? (
                  <>
                    <Spinner />
                    Placing order...
                  </>
                ) : (
                  <>
                    <ShoppingBag className="size-4" />
                    Place Order
                  </>
                )}
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
