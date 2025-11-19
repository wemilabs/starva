import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { EditableBusinessDescription } from "@/components/forms/editable-business-desc";
import { EditableBusinessName } from "@/components/forms/editable-business-name";
import { EditableBusinessPhone } from "@/components/forms/editable-business-phone";
import { UpdateBusinessLogoForm } from "@/components/forms/update-business-logo";
import { ProductCatalogueControls } from "@/components/products/product-catalogue-controls";
import { ProductCatalogueSection } from "@/components/products/product-catalogue-section";
import { SkeletonProductCard } from "@/components/products/skeleton-product-card";
import { getBusinessBySlug } from "@/data/businesses";
import { getProductsPerBusiness } from "@/data/products";
import { GENERAL_BRANDING_IMG_URL } from "@/lib/constants";
import {
  updateBusinessDescription,
  updateBusinessLogo,
  updateBusinessName,
  updateBusinessPhone,
} from "@/server/businesses";

async function ProductsList({ businessId }: { businessId: string }) {
  const productsPerBusiness = await getProductsPerBusiness(businessId);

  if ("message" in productsPerBusiness) {
    return (
      <div className="text-center py-10">
        <h2 className="text-lg font-semibold mb-2">Unable to load products</h2>
        <p className="text-muted-foreground font-mono tracking-tighter">
          {productsPerBusiness.message}
        </p>
      </div>
    );
  }

  return <ProductCatalogueSection data={productsPerBusiness} />;
}

async function BusinessContent({
  params,
}: {
  params: Promise<{ businessSlug: string }>;
}) {
  const { businessSlug } = await params;

  const business = await getBusinessBySlug(businessSlug);
  if (!business) return notFound();

  const resolvedSlug = business.slug || businessSlug;

  const metadata = business.metadata ? JSON.parse(business.metadata) : {};
  const description = metadata.description || "";
  const phoneForNotifications = metadata.phoneForNotifications || "";
  const phoneForPayments = metadata.phoneForPayments || "";

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-xl border">
        <div className="absolute inset-0">
          {business.logo ? (
            <Image
              src={business.logo}
              alt={`${business.name} logo`}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="absolute inset-0 bg-linear-to-br from-orange-500 via-amber-500 to-yellow-500" />
          )}
        </div>
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 px-6 py-16 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="text-white flex flex-col gap-2">
            <EditableBusinessName
              businessId={business.id}
              businessSlug={resolvedSlug}
              initialName={business.name}
              updateAction={updateBusinessName}
            />
            <p className="text-white/80 text-sm font-mono tracking-tighter">
              @{resolvedSlug}
            </p>
            <EditableBusinessDescription
              businessId={business.id}
              businessSlug={resolvedSlug}
              initialDescription={description}
              updateAction={updateBusinessDescription}
            />
            <EditableBusinessPhone
              businessId={business.id}
              businessSlug={resolvedSlug}
              phoneType="notifications"
              initialPhone={phoneForNotifications}
              updateAction={updateBusinessPhone}
            />
            <EditableBusinessPhone
              businessId={business.id}
              businessSlug={resolvedSlug}
              phoneType="payments"
              initialPhone={phoneForPayments}
              updateAction={updateBusinessPhone}
            />
          </div>

          <UpdateBusinessLogoForm
            action={updateBusinessLogo.bind(null, business.id, resolvedSlug)}
            className="bg-white/10 backdrop-blur rounded-lg p-3 ring-1 ring-white/15"
          />
        </div>
      </section>

      <section className="grid gap-6 mt-10">
        <Suspense
          fallback={
            <div className="h-20 rounded-lg border bg-background animate-pulse mb-6" />
          }
        >
          <ProductCatalogueControls
            businessId={business.id}
            businessSlug={resolvedSlug}
            businessName={business.name}
            timetable={metadata.timetable}
            defaultStatus="all"
          />
        </Suspense>
        <Suspense
          fallback={
            <>
              <div className="col-span-full text-sm text-pretty text-muted-foreground mb-4 font-mono tracking-tighter">
                Loading products...
              </div>
              <div className="grid grid-cols-1 justify-center gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <SkeletonProductCard />
                <SkeletonProductCard />
                <SkeletonProductCard />
                <SkeletonProductCard />
                <SkeletonProductCard />
                <SkeletonProductCard />
              </div>
            </>
          }
        >
          <ProductsList businessId={business.id} />
        </Suspense>
      </section>
    </div>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ businessSlug: string }>;
}): Promise<Metadata> {
  const { businessSlug } = await params;

  const business = await getBusinessBySlug(businessSlug);
  if (!business) {
    return {
      title: "Business Not Found - Starva.shop",
      description: "The requested business could not be found.",
    };
  }

  const resolvedSlug = business.slug ?? businessSlug;
  const metadata = business.metadata ? JSON.parse(business.metadata) : {};
  const description =
    metadata.description ??
    `Manage your business ${business.name}. Update products, track orders, and grow your business with Starva.shop.`;

  const images = [];
  if (business.logo) {
    images.push({
      url: business.logo,
      width: 1200,
      height: 630,
      alt: `${business.name} logo`,
    });
  } else {
    images.push({
      url: GENERAL_BRANDING_IMG_URL,
      width: 1200,
      height: 630,
      alt: "Starva.shop app - A sure platform for local businesses and customers to meet. Easy, fast and reliable.",
    });
  }

  const businessUrl = `${
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  }/businesses/${resolvedSlug}`;

  return {
    title: `${business.name} - Starva.shop`,
    description,
    openGraph: {
      title: `${business.name} - Starva.shop`,
      description,
      url: businessUrl,
      type: "website",
      images,
      siteName: "Starva.shop",
    },
    twitter: {
      card: "summary_large_image",
      title: `${business.name} - Starva.shop`,
      description,
      images: images.map((img) => img.url),
    },
    alternates: {
      canonical: businessUrl,
    },
  };
}

export default async function BusinessSlugPage(
  props: PageProps<"/businesses/[businessSlug]">
) {
  return (
    <Suspense
      fallback={
        <div className="space-y-8">
          <div className="relative overflow-hidden rounded-xl border">
            <div className="h-64 bg-linear-to-br from-orange-500 via-amber-500 to-yellow-500 animate-pulse" />
          </div>
          <div className="grid gap-6 mt-10">
            <div className="h-20 rounded-lg border bg-background animate-pulse mb-6" />
            <div className="col-span-full text-sm text-pretty text-muted-foreground mb-4 font-mono tracking-tighter">
              Loading business details...
            </div>
          </div>
        </div>
      }
    >
      <BusinessContent params={props.params} />
    </Suspense>
  );
}
