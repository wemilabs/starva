import { PricingGrid } from "@/components/pricing/pricing-grid";
import { PRICING_PLANS } from "@/lib/constants";
import { cacheLife } from "next/cache";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing Plans | Starva",
  description: "Choose the plan that best fits your needs. All plans include a 14-day free trial.",
};

async function PricingHeader() {
  "use cache";
  cacheLife("weeks");

  return (
    <div className="text-center space-y-2 mt-2">
      <h1 className="text-2xl md:text-4xl font-bold tracking-tight">
        Simple, Transparent Pricing
      </h1>
      <p className="text-muted-foreground md:text-lg max-w-2xl mx-auto">
        Choose the plan that best fits your needs, all of them including a
        14-day free trial.
      </p>
    </div>
  );
}

async function PricingFooter() {
  "use cache";
  cacheLife("weeks");

  return (
    <div className="mt-16 text-center space-y-4 py-8 border-t">
      <h2 className="text-2xl font-semibold">Need a custom solution?</h2>
      <p className="text-muted-foreground max-w-xl mx-auto">
        We offer tailored enterprise solutions with custom features, dedicated
        support, and flexible pricing. Contact our sales team to discuss your
        specific needs.
      </p>
    </div>
  );
}

export default function PricingPage() {
  return (
    <div className="container mx-auto max-w-7xl py-12 space-y-12">
      <PricingHeader />
      <PricingGrid plans={PRICING_PLANS} />
      <PricingFooter />
    </div>
  );
}
