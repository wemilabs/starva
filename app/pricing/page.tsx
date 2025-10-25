"use client";

import { PricingCard } from "@/components/pricing/pricing-card";
import { useUserSubscription } from "@/hooks/use-user-subscription";
import { useSession } from "@/lib/auth-client";
import { PRICING_PLANS } from "@/lib/constants";
import { createSubscription, updateSubscription } from "@/server/subscription";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function PricingPage() {
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

    setLoadingPlan(planName);

    try {
      if (currentPlanName) {
        await updateSubscription(session.user.id, planName);
        toast.success(`Successfully switched to ${planName} plan!`);
      } else {
        await createSubscription(session.user.id, planName);
        toast.success(
          `Welcome to ${planName} plan! Your 14-day free trial has started.`,
        );
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
    <div className="container mx-auto max-w-7xl py-12 space-y-12">
      <div className="text-center space-y-2 mt-2">
        <h1 className="text-2xl md:text-4xl font-bold tracking-tight">
          Simple, Transparent Pricing
        </h1>
        <p className="text-muted-foreground md:text-lg max-w-2xl mx-auto">
          Choose the plan that best fits your needs, all of them including a
          14-day free trial.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-4 gap-8 md:gap-6 mt-14">
        {PRICING_PLANS.map((plan) => (
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

      <div className="mt-16 text-center space-y-4 py-8 border-t">
        <h2 className="text-2xl font-semibold">Need a custom solution?</h2>
        <p className="text-muted-foreground max-w-xl mx-auto">
          We offer tailored enterprise solutions with custom features, dedicated
          support, and flexible pricing. Contact our sales team to discuss your
          specific needs.
        </p>
      </div>
    </div>
  );
}
