"use client";

import { Badge } from "@/components/ui/badge";
import { useUserSubscription } from "@/hooks/use-user-subscription";
import { Crown, Zap, Sparkles } from "lucide-react";

export function SubscriptionBadge() {
  const { planName, isTrial, daysUntilTrialEnd, isLoading } =
    useUserSubscription();

  if (isLoading) {
    return null;
  }

  const icon =
    planName === "Enterprise" ? (
      <Crown className="size-3" />
    ) : planName === "Pro" ? (
      <Sparkles className="size-3" />
    ) : planName === "Starter" ? (
      <Zap className="size-3" />
    ) : null;

  const variant =
    planName === "Enterprise"
      ? "default"
      : planName === "Pro"
        ? "default"
        : planName === "Starter"
          ? "secondary"
          : "outline";

  return (
    <Badge variant={variant} className="gap-1">
      {icon}
      {planName}
      {isTrial && daysUntilTrialEnd !== null && (
        <span className="text-xs opacity-80">
          (Trial: {daysUntilTrialEnd}d left)
        </span>
      )}
    </Badge>
  );
}
