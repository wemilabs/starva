"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Calendar, Clock, XCircle } from "lucide-react";
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

export function RejectOrderContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const { isLoading, error: queryError } = useQuery({
    queryKey: ["order", "reject", token],
    queryFn: async () => {
      if (!token) throw new Error("Invalid rejection link");

      const response = await fetch(`/api/orders/reject/${token}`);
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

  const rejectMutation = useMutation({
    mutationFn: async () => {
      if (!token) throw new Error("Missing confirmation token");

      const response = await fetch(`/api/orders/reject/${token}`, {
        method: "POST",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to reject order");
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate the order query to trigger a refetch
      queryClient.invalidateQueries({ queryKey: ["order", "reject", token] });
    },
    onError: (error) => {
      setError(
        error instanceof Error ? error.message : "Failed to reject order"
      );
    },
  });

  const handleReject = () => {
    rejectMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full size-12 border-b-2 border-red-600 mx-auto mb-4"></div>
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

  if (rejectMutation.isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <XCircle className="size-12 text-red-500 mx-auto mb-2" />
            <CardTitle className="text-red-600">Order Rejected</CardTitle>
            <CardDescription>
              Order has been rejected successfully.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-gray-600 mb-4">
              The customer will be notified that their order could not be
              fulfilled.
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
          <AlertTriangle className="size-8 text-orange-500 mx-auto mb-2" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Reject Order
          </h1>
          <p className="text-gray-600">
            Review the order details below before rejecting
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Clock className="size-5 text-orange-500" />
                Order Rejection
              </CardTitle>
              <Badge variant="secondary">Pending</Badge>
            </div>
            <CardDescription>
              Reject this order if you cannot fulfill it
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
                <AlertTriangle className="size-5" />
                Action Required
              </div>
              <span>Reject Order</span>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6 border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="size-5 text-orange-600 mt-0.5" />
              <div>
                <p className="font-medium text-orange-900">Important Notice</p>
                <p className="text-sm text-orange-700 mt-1">
                  Rejecting this order will cancel it permanently. The customer
                  will be notified that their order could not be fulfilled. This
                  action cannot be undone.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button
            onClick={handleReject}
            disabled={rejectMutation.isPending}
            variant="destructive"
            className="flex-1"
            size="lg"
          >
            {rejectMutation.isPending ? (
              <>
                <div className="animate-spin rounded-full size-4 border-b-2 border-white mr-2"></div>
                Rejecting...
              </>
            ) : (
              <>
                <XCircle className="size-4 mr-2" />
                Reject Order
              </>
            )}
          </Button>

          <Button onClick={() => window.close()} variant="outline" size="lg">
            Cancel
          </Button>
        </div>

        <p className="text-center text-sm text-gray-500 mt-4">
          Only reject orders that you cannot fulfill. Consider confirming if
          possible.
        </p>
      </div>
    </div>
  );
}
