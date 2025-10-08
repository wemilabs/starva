import { Building2 } from "lucide-react";

import { BusinessCatalogueSection } from "@/components/businesses/business-catalogue section";
import { ExtractedRegisterBusinessDialog } from "@/components/forms/extracted-register-business-dialog";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { getAllBusinesses } from "@/data/businesses";

export default async function MerchantsPage() {
  const merchants = await getAllBusinesses();

  return (
    <div className="container max-w-7xl py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">All Merchants</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Engage with all current available merchants
          </p>
        </div>
      </div>

      {merchants?.length === 0 ? (
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
      ) : (
        <BusinessCatalogueSection data={merchants} />
      )}
    </div>
  );
}
