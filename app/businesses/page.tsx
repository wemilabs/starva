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
import { getBusinessesPerUser } from "@/data/businesses";
import { verifySession } from "@/data/user-session";

export default async function BusinessesPage() {
  const { success } = await verifySession();
  const businessesPerUser = success ? await getBusinessesPerUser() : [];

  return (
    <div className="container max-w-7xl py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Businesses</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Manage and monitor all your businesses in one place
          </p>
        </div>
        <ExtractedRegisterBusinessDialog />
      </div>

      {businessesPerUser.length === 0 ? (
        <Empty className="min-h-[400px]">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Building2 className="size-6" />
            </EmptyMedia>
            <EmptyTitle>No businesses yet</EmptyTitle>
            <EmptyDescription>
              Get started by creating your first business. You'll be able to
              manage products, team members, and more.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <ExtractedRegisterBusinessDialog />
          </EmptyContent>
        </Empty>
      ) : (
        <BusinessCatalogueSection data={businessesPerUser} />
      )}
    </div>
  );
}
