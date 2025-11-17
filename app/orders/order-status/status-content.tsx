"use client";

import {
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  XCircle,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function StatusContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const status = searchParams.get("status");

  const getErrorContent = (errorType: string) => {
    switch (errorType) {
      case "missing-token":
        return {
          icon: <XCircle className="size-12 text-red-500" />,
          title: "Invalid Link",
          description: "The confirmation link is missing or incomplete.",
        };
      case "invalid-token":
        return {
          icon: <XCircle className="size-12 text-red-500" />,
          title: "Invalid Link",
          description:
            "This confirmation link is not valid or has already been used.",
        };
      case "expired-token":
        return {
          icon: <Clock className="size-12 text-orange-500" />,
          title: "Link Expired",
          description: "This confirmation link has expired (48-hour limit).",
        };
      case "server-error":
        return {
          icon: <AlertTriangle className="size-12 text-red-500" />,
          title: "Server Error",
          description: "We encountered an error processing your request.",
        };
      default:
        return {
          icon: <XCircle className="size-12 text-red-500" />,
          title: "Error",
          description: "An unknown error occurred.",
        };
    }
  };

  const getStatusContent = (statusType: string) => {
    switch (statusType) {
      case "confirmed":
        return {
          icon: <CheckCircle className="size-12 text-green-500" />,
          title: "Order Already Confirmed",
          description:
            "This order has already been confirmed and is being prepared.",
        };
      case "cancelled":
        return {
          icon: <XCircle className="size-12 text-red-500" />,
          title: "Order Already Cancelled",
          description: "This order has already been cancelled.",
        };
      case "delivered":
        return {
          icon: <CheckCircle className="size-12 text-blue-500" />,
          title: "Order Already Delivered",
          description: "This order has already been delivered.",
        };
      default:
        return {
          icon: <Clock className="size-12 text-gray-500" />,
          title: "Order Processed",
          description: "This order has already been processed.",
        };
    }
  };

  const content = error
    ? getErrorContent(error)
    : getStatusContent(status || "unknown");

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2">{content.icon}</div>
          <CardTitle className={error ? "text-red-600" : "text-gray-900"}>
            {content.title}
          </CardTitle>
          <CardDescription>{content.description}</CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {error === "expired-token" && (
            <p className="text-sm text-gray-600">
              Please ask the customer to place a new order or contact them
              directly.
            </p>
          )}

          {error === "invalid-token" && (
            <p className="text-sm text-gray-600">
              Please check your WhatsApp messages for the correct link or
              contact support.
            </p>
          )}

          {error === "server-error" && (
            <p className="text-sm text-gray-600">
              Please try again in a few moments or contact support if the
              problem persists.
            </p>
          )}

          {status && (
            <p className="text-sm text-gray-600">
              You can check your dashboard for more order details.
            </p>
          )}

          <div className="flex gap-3">
            <Button
              onClick={() => window.close()}
              variant="outline"
              className="flex-1"
            >
              Close Window
            </Button>

            {error === "server-error" && (
              <Button
                onClick={() => window.location.reload()}
                variant="default"
                className="flex-1"
              >
                <RefreshCw className="size-4 mr-2" />
                Try Again
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
