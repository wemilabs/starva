import type { Metadata } from "next";
import { cacheLife } from "next/cache";
import { PricingGrid } from "@/components/pricing/pricing-grid";
import { PRICING_PLANS } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Pricing - Starva.shop",
  description: "Start free. Upgrade as your needs grow.",
};

async function PricingHeader() {
  "use cache";
  cacheLife("weeks");

  return (
    <div className="text-center space-y-2 mt-2">
      <h1 className="text-3xl lg:text-4xl font-medium tracking-tight">
        Simple, Transparent Pricing
      </h1>
      <p className="text-muted-foreground text-sm md:text-base max-w-2xl mx-auto font-mono tracking-tighter">
        Generously free to start. Paid plans include a 14-day trial.
      </p>
    </div>
  );
}

async function PricingFooter() {
  "use cache";
  cacheLife("weeks");

  return (
    <div className="mt-16 text-center space-y-4 pt-8 max-w-7xl mx-auto border-t">
      <h2 className="text-2xl font-medium">Need a custom solution?</h2>
      <p className="text-muted-foreground text-sm md:text-base max-w-xl mx-auto font-mono tracking-tighter">
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
