"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Calendar, CheckCircle, Clock, XCircle } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";

export function ConfirmOrderContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const { isLoading, error: queryError } = useQuery({
    queryKey: ["order", "confirm", token],
    queryFn: async () => {
      if (!token) throw new Error("Invalid confirmation link");

      const response = await fetch(`/api/orders/confirm/${token}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch order");
      }

      return null;
    },
    enabled: !!token,
    retry: false,
  });

  const confirmMutation = useMutation({
    mutationFn: async () => {
      if (!token) throw new Error("Missing confirmation token");

      const response = await fetch(`/api/orders/confirm/${token}`, {
        method: "POST",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to confirm order");
      }

      return response.json();
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["order", "confirm", token] }),
    onError: (error) => {
      setError(
        error instanceof Error ? error.message : "Failed to confirm order"
      );
    },
  });

  const handleConfirm = () => {
    confirmMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full size-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-muted-foreground font-mono tracking-tighter">
            Loading order details...
          </p>
        </div>
      </div>
    );
  }

  if (queryError || error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <XCircle className="size-12 text-red-500 mx-auto mb-2" />
            <CardTitle className="text-red-600">Error</CardTitle>
            <CardDescription className="font-mono tracking-tighter">
              {error ||
                (queryError instanceof Error
                  ? queryError.message
                  : "Failed to load order")}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Please contact support if you continue to experience issues.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (confirmMutation.isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CheckCircle className="size-12 text-green-500 mx-auto mb-2" />
            <CardTitle className="text-green-600">Order Confirmed!</CardTitle>
            <CardDescription className="font-mono tracking-tighter">
              Order has been confirmed successfully.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              The customer will be notified that their order is being prepared.
            </p>
            <Button
              onClick={() => window.close()}
              variant="outline"
              className="w-full"
            >
              Close Window
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 pt-16">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-medium mb-2">Confirm Order</h1>
          <p className="text-muted-foreground font-mono tracking-tighter">
            Review the order details below and confirm to start preparing
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Clock className="size-4 text-orange-500" />
                Order Confirmation
              </CardTitle>
              <Badge variant="secondary">Pending</Badge>
            </div>
            <CardDescription className="font-mono tracking-tighter">
              Confirm this order to start preparation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="size-4" />
              <span>{new Date().toLocaleString()}</span>
            </div>

            <Separator />

            <div className="flex justify-between items-center text-sm font-medium">
              <div className="flex items-center gap-2">
                <CheckCircle className="size-4" />
                Action Required
              </div>
              <span>Confirm Order</span>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button
            onClick={handleConfirm}
            disabled={confirmMutation.isPending}
            className="flex-1"
            variant="success"
            size="lg"
          >
            {confirmMutation.isPending ? (
              <>
                <Spinner />
                Confirming...
              </>
            ) : (
              <>
                <CheckCircle className="size-4 mr-2" />
                Confirm Order
              </>
            )}
          </Button>

          <Button onClick={() => window.close()} variant="outline" size="lg">
            Cancel
          </Button>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-4 font-mono tracking-tighter">
          By confirming, you agree to prepare this order for pickup/delivery.
        </p>
      </div>
    </div>
  );
}
