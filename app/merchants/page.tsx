import { Building2 } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";

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
import { GENERAL_BRANDING_IMG_URL } from "@/lib/constants";

async function MerchantsList() {
  "use cache";
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

export async function generateMetadata(): Promise<Metadata> {
  const title = "Merchants - Starva";
  const description =
    "Discover and order from local merchants. Browse menus, find your favorite restaurants, and order delicious food from local kitchens.";

  const merchantsUrl = `${
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  }/merchants`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: merchantsUrl,
      type: "website",
      images: [
        {
          url: GENERAL_BRANDING_IMG_URL,
          width: 1200,
          height: 630,
          alt: "Starva app - A sure platform for local businesses and customers to meet. Easy, fast and reliable.",
        },
      ],
      siteName: "Starva",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [GENERAL_BRANDING_IMG_URL],
    },
    alternates: {
      canonical: merchantsUrl,
    },
  };
}

export default async function MerchantsPage() {
  return (
    <div className="container max-w-7xl py-7 space-y-7">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium tracking-tight">All Merchants</h1>
          <p className="text-muted-foreground mt-0.5 text-sm text-pretty font-mono tracking-tighter">
            Engage with all current available merchants
          </p>
        </div>
      </div>

      <Suspense
        fallback={
          <div className="w-full md:w-[380px] h-9 rounded-lg border shadow bg-background animate-pulse" />
        }
      >
        <SearchForm
          formProps={{ className: "w-full md:w-[380px]" }}
          inputFieldOnlyClassName="h-9"
          placeholder="eg. prestige restaurant, a la baguee, etc."
        />
      </Suspense>

      <Suspense
        fallback={
          <>
            <div className="col-span-full text-sm text-pretty text-muted-foreground font-mono tracking-tighter">
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
