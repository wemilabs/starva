"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { PricingCard } from "@/components/pricing/pricing-card";
import { useUserSubscription } from "@/hooks/use-user-subscription";
import { useSession } from "@/lib/auth-client";
import type { PricingPlan } from "@/lib/constants";
import { createSubscription, updateSubscription } from "@/server/subscription";

interface PricingGridProps {
  plans: readonly PricingPlan[];
}

export function PricingGrid({ plans }: PricingGridProps) {
  const { data: session } = useSession();
  const {
    planName: currentPlanName,
    isLoading: isLoadingSubscription,
    refetch,
  } = useUserSubscription();
  const router = useRouter();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleSelectPlan = async (planName: string) => {
    if (!session?.user) {
      toast.info("Please sign in to subscribe");
      router.push("/sign-in");
      return;
    }

    if (planName === currentPlanName) {
      toast.info("You're already on this plan");
      return;
    }

    // Don't allow selecting free plan if user already has any subscription
    if (planName === "Free" && currentPlanName) {
      toast.info(
        "You already have a subscription. Use the account settings to downgrade."
      );
      return;
    }

    setLoadingPlan(planName);

    try {
      if (currentPlanName) {
        await updateSubscription(session.user.id, planName);
        toast.success(`Successfully switched to ${planName} plan!`);
      } else {
        await createSubscription(session.user.id, planName);
        const plan = plans.find((p) => p.name === planName);
        if (plan?.price === 0) {
          toast.success(`Welcome to ${planName} plan! Get started right away.`);
        } else {
          toast.success(
            `Welcome to ${planName} plan! Your 14-day free trial has started.`
          );
        }
      }
      refetch();
    } catch (error) {
      console.error("Subscription error:", error);
      toast.error("Failed to update subscription. Please try again.");
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-4 gap-8 md:gap-6 mt-14">
      {plans.map((plan) => (
        <PricingCard
          key={plan.name}
          name={plan.name}
          description={plan.description}
          price={plan.price}
          originalPrice={plan.originalPrice}
          period={plan.period}
          features={plan.features}
          highlighted={plan.highlighted}
          cta={plan.cta}
          onSelect={() => handleSelectPlan(plan.name)}
          isLoading={loadingPlan === plan.name}
          isCurrentPlan={
            !isLoadingSubscription && currentPlanName === plan.name
          }
        />
      ))}
    </div>
  );
}
