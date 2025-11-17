import type { Metadata } from "next";
import { Suspense } from "react";
import { OrderConfirmationLoader } from "@/components/orders/order-confirmation-loader";
import { ConfirmOrderContent } from "./confirm-order-content";

export const metadata: Metadata = {
  title: "Confirm Order | Starva",
  description:
    "Review and confirm your order to start preparation. Fast and secure order confirmation for local businesses.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function OrderConfirmPage() {
  return (
    <Suspense fallback={<OrderConfirmationLoader />}>
      <ConfirmOrderContent />
    </Suspense>
  );
}
