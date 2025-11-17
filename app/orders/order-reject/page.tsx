import type { Metadata } from "next";
import { Suspense } from "react";
import { OrderConfirmationLoader } from "@/components/orders/order-confirmation-loader";
import { RejectOrderContent } from "./reject-order-content";

export const metadata: Metadata = {
  title: "Reject Order | Starva",
  description:
    "Review and reject an order if you cannot fulfill it. Secure order management for local businesses.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function OrderRejectPage() {
  return (
    <Suspense fallback={<OrderConfirmationLoader />}>
      <RejectOrderContent />
    </Suspense>
  );
}
