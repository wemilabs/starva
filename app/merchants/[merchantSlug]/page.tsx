import { Suspense } from "react";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Clock } from "lucide-react";

import { ProductCatalogueControls } from "@/components/products/product-catalogue-controls";
import { ProductCatalogueSection } from "@/components/products/product-catalogue-section";
import { SkeletonProductCard } from "@/components/products/skeleton-product-card";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { getBusinessBySlug } from "@/data/businesses";
import { getProductsPerBusinessWithoutAuth } from "@/data/products";
import { DAYS, today } from "@/lib/constants";
import { formatTime } from "@/lib/utils";

async function ProductsList({ merchantId }: { merchantId: string }) {
  const productsPerMerchant = await getProductsPerBusinessWithoutAuth(
    merchantId,
  );

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

  return <ProductCatalogueSection data={productsPerMerchant} />;
}

export default async function MerchantSlugPage(
  props: PageProps<"/merchants/[merchantSlug]">,
) {
  const { merchantSlug } = await props.params;

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
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500" />
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
                  {DAYS.map((day) => {
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
        <ProductCatalogueControls
          businessId={merchant.id}
          businessSlug={resolvedSlug}
          timetable={timetable}
          defaultStatus="in_stock"
        />
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
          <ProductsList merchantId={merchant.id} />
        </Suspense>
      </section>
    </div>
  );
}
