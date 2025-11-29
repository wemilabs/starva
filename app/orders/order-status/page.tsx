import type { Metadata } from "next";
import { Suspense } from "react";
import { OrderConfirmationLoader } from "@/components/orders/order-confirmation-loader";
import { StatusContent } from "./status-content";

export const metadata: Metadata = {
  title: "Order Status | Starva.shop",
  description:
    "Check the status of your order confirmation or rejection. Real-time order tracking for local stores.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function OrderStatusPage() {
  return (
    <Suspense fallback={<OrderConfirmationLoader />}>
      <StatusContent />
    </Suspense>
  );
}
