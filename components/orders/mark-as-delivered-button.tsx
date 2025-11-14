"use client";

import { CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { markOrderAsDelivered } from "@/server/orders";

export function MarkAsDeliveredButton({ orderId }: { orderId: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleMarkAsDelivered = () => {
    startTransition(async () => {
      const result = await markOrderAsDelivered({ orderId });

      if (result.ok) {
        toast.success("Order marked as delivered", {
          description: "Thanks for confirming you received your order.",
        });
        router.refresh();
      } else {
        toast.error("Could not mark as delivered", {
          description:
            result.error || "Something went wrong, please try again.",
        });
      }
    });
  };

  return (
    <Button
      variant="success"
      className="w-full"
      disabled={isPending}
      onClick={handleMarkAsDelivered}
    >
      <div className="flex items-center gap-2">
        {isPending ? (
          <>
            <Spinner />
            Marking as delivered...
          </>
        ) : (
          <>
            <CheckCircle2 className="size-4" />
            Mark as delivered
          </>
        )}
      </div>
    </Button>
  );
}
