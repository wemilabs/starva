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
import { getBusinessesPerUser } from "@/data/businesses";
import { verifySession } from "@/data/user-session";
import { GENERAL_BRANDING_IMG_URL } from "@/lib/constants";

async function BusinessesList() {
  const { success } = await verifySession();
  const businessesPerUser = success ? await getBusinessesPerUser() : [];

  if (businessesPerUser.length === 0) {
    return (
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
    );
  }

  return <BusinessCatalogueSection data={businessesPerUser} />;
}

export async function generateMetadata(): Promise<Metadata> {
  const title = "Businesses - Starva";
  const description =
    "Manage your businesses with Starva. Update products, track orders, and grow your business with powerful management tools.";

  const businessesUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/businesses`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: businessesUrl,
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
      canonical: businessesUrl,
    },
  };
}

export default async function BusinessesPage() {
  return (
    <div className="container mx-auto max-w-7xl py-7 space-y-7">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium tracking-tight">Businesses</h1>
          <p className="text-muted-foreground mt-0.5 text-sm text-pretty">
            Manage and monitor all your businesses in one place
          </p>
        </div>
        <ExtractedRegisterBusinessDialog />
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
            <div className="col-span-full text-sm text-pretty text-muted-foreground">
              Loading businesses...
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
        <BusinessesList />
      </Suspense>
    </div>
  );
}
