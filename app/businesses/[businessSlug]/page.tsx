import Image from "next/image";
import { notFound } from "next/navigation";
import { UpdateBusinessLogoForm } from "@/components/forms/update-business-logo";
import { ProductCatalogueSection } from "@/components/products/product-catalogue-section";
import { getBusinessBySlug } from "@/data/businesses";
import { getProductsPerBusiness } from "@/data/products";
import { updateBusinessLogo } from "@/server/businesses";
import { EditableBusinessName } from "@/components/forms/editable-business-name";
import { updateBusinessName } from "@/server/businesses";
import { EditableBusinessDescription } from "@/components/forms/editable-business-desc";
import { updateBusinessDescription } from "@/server/businesses";

export default async function BusinessIdPage(
  props: PageProps<"/businesses/[businessSlug]">
) {
  const { businessSlug } = await props.params;

  const business = await getBusinessBySlug(businessSlug);
  if (!business) return notFound();

  const resolvedSlug = business.slug || businessSlug;

  const productsPerBusiness = await getProductsPerBusiness(business.id);

  // Parse metadata
  const metadata = business.metadata ? JSON.parse(business.metadata) : {};
  const description = metadata.description || "";

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
              <EditableBusinessName
                businessId={business.id}
                businessSlug={resolvedSlug}
                initialName={business.name}
                updateAction={updateBusinessName}
              />
              <p className="mt-2 text-white/80">@{resolvedSlug}</p>
              <EditableBusinessDescription
                businessId={business.id}
                businessSlug={resolvedSlug}
                initialDescription={description}
                updateAction={updateBusinessDescription}
              />
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
            <EditableBusinessName
              businessId={business.id}
              businessSlug={resolvedSlug}
              initialName={business.name}
              updateAction={updateBusinessName}
            />
            <p className="mt-2 text-white/80">@{resolvedSlug}</p>
            <EditableBusinessDescription
              businessId={business.id}
              businessSlug={resolvedSlug}
              initialDescription={description}
              updateAction={updateBusinessDescription}
            />
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
