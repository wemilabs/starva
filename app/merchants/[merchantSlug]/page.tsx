import { Clock } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { ProductCatalogueControls } from "@/components/products/product-catalogue-controls";
import { ProductCatalogueSection } from "@/components/products/product-catalogue-section";
import { SkeletonProductCard } from "@/components/products/skeleton-product-card";
import { ShareDialog } from "@/components/share-dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { getBusinessBySlug } from "@/data/businesses";
import { getProductsPerBusinessWithoutAuth } from "@/data/products";
import { DAYS, DEFAULT_IMG_URL, today } from "@/lib/constants";
import { formatTime } from "@/lib/utils";

async function ProductsList({
  merchantId,
  defaultStatus,
}: {
  merchantId: string;
  defaultStatus?: string;
}) {
  "use cache";
  const productsPerMerchant =
    await getProductsPerBusinessWithoutAuth(merchantId);

  if (!Array.isArray(productsPerMerchant) || productsPerMerchant.length === 0) {
    return (
      <div className="text-center py-10 border border-dashed border-muted-foreground/50 rounded-lg">
        <h2 className="font-semibold">No products available</h2>
        <p className="text-muted-foreground text-sm">
          This merchant has no products yet.
        </p>
      </div>
    );
  }

  return (
    <ProductCatalogueSection
      data={productsPerMerchant}
      defaultStatus={defaultStatus}
    />
  );
}

async function MerchantContent({
  params,
}: {
  params: Promise<{ merchantSlug: string }>;
}) {
  const { merchantSlug } = await params;

  const merchant = await getBusinessBySlug(merchantSlug);
  if (!merchant) return notFound();

  const resolvedSlug = merchant.slug || merchantSlug;
  const metadata = merchant.metadata ? JSON.parse(merchant.metadata) : {};
  const description = metadata.description || "";
  const phone = metadata.phone || "";
  const timetable = metadata.timetable || {};

  const hasTimetable =
    timetable &&
    typeof timetable === "object" &&
    Object.keys(timetable).length > 0;

  return (
    <div className="space-y-4">
      <section className="relative overflow-hidden rounded-xl border">
        <div className="absolute inset-0">
          {merchant.logo ? (
            <Image
              src={merchant.logo}
              alt={`${merchant.name} logo`}
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
            <h1 className="text-3xl md:text-5xl font-semibold tracking-tight">
              {merchant.name}
            </h1>
            <p className="mt-2 text-white/80">@{resolvedSlug}</p>
            <p className="text-white/80 text-sm leading-relaxed">
              {description}
            </p>
            <p className="text-white/80 text-sm leading-relaxed">{phone}</p>
          </div>
          <div className="flex items-center gap-3 justify-end">
            <ShareDialog
              url={`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/merchants/${resolvedSlug}`}
              buttonTitle="Share"
              title={`Share ${merchant.name}`}
              description={`Copy the link to share this business catalogue with others`}
            />
          </div>
        </div>
      </section>

      {hasTimetable ? (
        <section className="grid gap-6">
          <Accordion type="single" collapsible defaultValue="">
            <AccordionItem value="business-hours">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-2">
                  <Clock className="size-4" />
                  <span className="font-semibold">Opening Hours</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3 pb-4">
                  {DAYS.map(day => {
                    const dayData = timetable[day.key];
                    const isToday = day.key === today;
                    const isClosed = !dayData || dayData.closed;

                    return (
                      <div
                        key={day.key}
                        className={`flex justify-between items-center py-2 px-3 rounded-md transition-colors ${
                          isToday
                            ? "bg-primary/10 border border-primary/20"
                            : "hover:bg-muted/50"
                        }`}
                      >
                        <span
                          className={`font-medium ${
                            isToday ? "text-primary" : "text-foreground"
                          }`}
                        >
                          {day.label}
                          {isToday && (
                            <span className="ml-2 text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                              Today
                            </span>
                          )}
                        </span>
                        <span
                          className={`text-sm ${
                            isClosed
                              ? "text-muted-foreground italic"
                              : "text-foreground"
                          }`}
                        >
                          {isClosed
                            ? "Closed"
                            : `${formatTime(dayData.open)} - ${formatTime(
                                dayData.close,
                              )}`}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>
      ) : (
        <div className="text-muted-foreground text-sm text-center py-10 border border-dashed border-muted-foreground/50 rounded-lg max-w-2xl mx-auto">
          This merchant has not yet set a timetable
        </div>
      )}

      <section className="grid gap-x-6">
        <Suspense
          fallback={
            <div className="h-20 rounded-lg border bg-background animate-pulse mb-6" />
          }
        >
          <ProductCatalogueControls
            businessId={merchant.id}
            businessSlug={resolvedSlug}
            timetable={timetable}
            defaultStatus="in_stock"
          />
        </Suspense>
        <Suspense
          fallback={
            <>
              <div className="col-span-full text-sm text-pretty text-muted-foreground mb-4">
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
          <ProductsList merchantId={merchant.id} defaultStatus="in_stock" />
        </Suspense>
      </section>
    </div>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ merchantSlug: string }>;
}): Promise<Metadata> {
  const { merchantSlug } = await params;

  const merchant = await getBusinessBySlug(merchantSlug);
  if (!merchant) {
    return {
      title: "Merchant Not Found - Starva",
      description: "The requested merchant could not be found.",
    };
  }

  const resolvedSlug = merchant.slug ?? merchantSlug;
  const metadata = merchant.metadata ? JSON.parse(merchant.metadata) : {};
  const description =
    metadata.description ??
    `Browse products and menu items from ${merchant.name}. Order delicious food from local kitchens.`;

  const images = [];
  if (merchant.logo) {
    images.push({
      url: merchant.logo,
      width: 1200,
      height: 630,
      alt: `${merchant.name} logo`,
    });
  } else {
    images.push({
      url: DEFAULT_IMG_URL,
      width: 1200,
      height: 630,
      alt: "Starva app - A sure platform for local businesses and customers to meet. Easy, fast and reliable.",
    });
  }

  const merchantUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/merchants/${resolvedSlug}`;

  return {
    title: `${merchant.name} - Starva`,
    description,
    openGraph: {
      title: `${merchant.name} - Starva`,
      description,
      url: merchantUrl,
      type: "website",
      images,
      siteName: "Starva",
    },
    twitter: {
      card: "summary_large_image",
      title: `${merchant.name} - Starva`,
      description,
      images: images.map(img => img.url),
    },
    alternates: {
      canonical: merchantUrl,
    },
  };
}

export default async function MerchantSlugPage(
  props: PageProps<"/merchants/[merchantSlug]">,
) {
  return (
    <Suspense
      fallback={
        <div className="space-y-4">
          <div className="relative overflow-hidden rounded-xl border">
            <div className="h-64 bg-linear-to-br from-orange-500 via-amber-500 to-yellow-500 animate-pulse" />
          </div>
          <div className="text-muted-foreground text-sm text-center py-10 border border-dashed border-muted-foreground/50 rounded-lg max-w-2xl mx-auto">
            Loading merchant details...
          </div>
          <div className="h-20 rounded-lg border bg-background animate-pulse mb-6" />
          <div className="col-span-full text-sm text-pretty text-muted-foreground mb-4">
            Loading products...
          </div>
        </div>
      }
    >
      <MerchantContent params={props.params} />
    </Suspense>
  );
}
