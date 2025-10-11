import Image from "next/image";
import { notFound } from "next/navigation";

import { ProductCatalogueSection } from "@/components/products/product-catalogue-section";
import { getBusinessBySlug } from "@/data/businesses";
import { getProductsPerBusinessWithoutAuth } from "@/data/products";

export default async function MerchantSlugPage(
  props: PageProps<"/merchants/[merchantSlug]">,
) {
  const { merchantSlug } = await props.params;

  const merchant = await getBusinessBySlug(merchantSlug);
  if (!merchant) return notFound();

  const resolvedSlug = merchant.slug || merchantSlug;

  const productsPerMerchant = await getProductsPerBusinessWithoutAuth(
    merchant.id,
  );

  const metadata = merchant.metadata ? JSON.parse(merchant.metadata) : {};
  const description = metadata.description || "";
  const phone = metadata.phone || "";

  return (
    <div className="space-y-8">
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

      <section className="grid gap-6 mt-10">
        {Array.isArray(productsPerMerchant) &&
        productsPerMerchant.length > 0 ? (
          <ProductCatalogueSection
            data={productsPerMerchant}
            businessId={merchant.id}
            businessSlug={resolvedSlug}
            defaultStatus="in_stock"
          />
        ) : (
          <div className="text-center py-10 border border-dashed border-muted-foreground/50 rounded-lg">
            <h2 className="font-semibold">No products available</h2>
            <p className="text-muted-foreground text-sm">
              This merchant has no products yet.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
