import Image from "next/image";
import { notFound } from "next/navigation";
import { UpdateBusinessLogoForm } from "@/components/forms/update-business-logo";
import { ProductCatalogueSection } from "@/components/products/product-catalogue-section";
import { getBusinessBySlug } from "@/data/businesses";
import { getProductsPerBusiness } from "@/data/products";
import { updateBusinessLogo } from "@/server/businesses";

export default async function BusinessSlugPage(
  props: PageProps<"/businesses/[businessSlug]">
) {
  const { businessSlug } = await props.params;

  const business = await getBusinessBySlug(businessSlug);
  if (!business) return notFound();

  const resolvedSlug = business.slug ?? businessSlug;

  const productsPerBusiness = await getProductsPerBusiness(business.id);

  if ("message" in productsPerBusiness) {
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
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500" />
            )}
          </div>
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative z-10 px-6 py-16 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="text-white">
              <h1 className="text-3xl md:text-5xl font-semibold tracking-tight">
                {business.name}
              </h1>
              {business.slug ? (
                <p className="mt-2 text-white/80">@{business.slug}</p>
              ) : null}
            </div>

            <UpdateBusinessLogoForm
              action={updateBusinessLogo.bind(null, business.id, resolvedSlug)}
              className="bg-white/10 backdrop-blur rounded-lg p-3 ring-1 ring-white/15"
            />
          </div>
        </section>

        <section className="grid gap-6 mt-10">
          <div className="text-center py-10">
            <h2 className="text-lg font-semibold mb-2">
              Unable to load products
            </h2>
            <p className="text-muted-foreground">
              {productsPerBusiness.message}
            </p>
          </div>
        </section>
      </div>
    );
  }

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
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500" />
          )}
        </div>
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 px-6 py-16 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="text-white">
            <h1 className="text-3xl md:text-5xl font-semibold tracking-tight">
              {business.name}
            </h1>
            {business.slug ? (
              <p className="mt-2 text-white/80">@{business.slug}</p>
            ) : null}
          </div>

          <UpdateBusinessLogoForm
            action={updateBusinessLogo.bind(null, business.id, resolvedSlug)}
            className="bg-white/10 backdrop-blur rounded-lg p-3 ring-1 ring-white/15"
          />
        </div>
      </section>

      <section className="grid gap-6 mt-10">
        <ProductCatalogueSection
          products={productsPerBusiness}
          businessId={business.id}
          businessSlug={resolvedSlug}
        />
      </section>
    </div>
  );
}
