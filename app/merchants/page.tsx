import { Suspense } from "react";
import { Building2 } from "lucide-react";

import { BusinessCatalogueSection } from "@/components/businesses/business-catalogue section";
import { SkeletonBusinessCard } from "@/components/businesses/skeleton-business-card";
import { ExtractedRegisterBusinessDialog } from "@/components/forms/extracted-register-business-dialog";
import { SearchForm } from "@/components/forms/search-form";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { getAllBusinesses } from "@/data/businesses";

async function MerchantsList() {
  const merchants = await getAllBusinesses();

  if (!merchants || merchants.length === 0) {
    return (
      <Empty className="min-h-[400px]">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Building2 className="size-6" />
          </EmptyMedia>
          <EmptyTitle>No merchants yet</EmptyTitle>
          <EmptyDescription>
            Become a merchant and start selling your products.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <ExtractedRegisterBusinessDialog />
        </EmptyContent>
      </Empty>
    );
  }

  return <BusinessCatalogueSection data={merchants} />;
}

export default async function MerchantsPage() {
  return (
    <div className="container max-w-7xl py-7 space-y-7">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">All Merchants</h1>
          <p className="text-muted-foreground mt-0.5 text-sm">
            Engage with all current available merchants
          </p>
        </div>
      </div>

      <SearchForm
        formProps={{ className: "w-full md:w-[380px]" }}
        inputFieldOnlyClassName="h-9"
        placeholder="eg. prestige restaurant, a la baguee, etc."
      />

      <Suspense
        fallback={
          <>
            <div className="col-span-full text-sm text-pretty text-muted-foreground">
              Loading merchants...
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <SkeletonBusinessCard />
              <SkeletonBusinessCard />
              <SkeletonBusinessCard />
              <SkeletonBusinessCard />
              <SkeletonBusinessCard />
              <SkeletonBusinessCard />
            </div>
          </>
        }
      >
        <MerchantsList />
      </Suspense>
    </div>
  );
}
