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

      // The API redirects to this page, so we need to handle the redirect
      // For now, we'll show a loading state and let the redirect happen
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
    onSuccess: () => {
      // Invalidate the order query to trigger a refetch
      queryClient.invalidateQueries({ queryKey: ["order", "confirm", token] });
    },
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full size-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (queryError || error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <XCircle className="size-12 text-red-500 mx-auto mb-2" />
            <CardTitle className="text-red-600">Error</CardTitle>
            <CardDescription>
              {error ||
                (queryError instanceof Error
                  ? queryError.message
                  : "Failed to load order")}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-gray-600 mb-4">
              Please contact support if you continue to experience issues.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (confirmMutation.isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CheckCircle className="size-12 text-green-500 mx-auto mb-2" />
            <CardTitle className="text-green-600">Order Confirmed!</CardTitle>
            <CardDescription>
              Order has been confirmed successfully.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-gray-600 mb-4">
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
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Confirm Order
          </h1>
          <p className="text-gray-600">
            Review the order details below and confirm to start preparing
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Clock className="size-5 text-orange-500" />
                Order Confirmation
              </CardTitle>
              <Badge variant="secondary">Pending</Badge>
            </div>
            <CardDescription>
              Confirm this order to start preparation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="size-4" />
              <span>{new Date().toLocaleString()}</span>
            </div>

            <Separator />

            <div className="flex justify-between items-center text-lg font-semibold">
              <div className="flex items-center gap-2">
                <CheckCircle className="size-5" />
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
            className="flex-1 bg-green-600 hover:bg-green-700"
            size="lg"
          >
            {confirmMutation.isPending ? (
              <>
                <div className="animate-spin rounded-full size-4 border-b-2 border-white mr-2"></div>
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

        <p className="text-center text-sm text-gray-500 mt-4">
          By confirming, you agree to prepare this order for pickup/delivery.
        </p>
      </div>
    </div>
  );
}
