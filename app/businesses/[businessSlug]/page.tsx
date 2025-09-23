import Image from "next/image";
import { notFound } from "next/navigation";
import { AddProductForm } from "@/components/forms/add-product-form";
import { SearchForm } from "@/components/forms/search-form";
import { UpdateBusinessLogoForm } from "@/components/forms/update-business-logo";
import { FilteredProducts } from "@/components/products/filtered-products";
import { getBusinessBySlug } from "@/data/businesses";
import { getProductsPerBusiness } from "@/data/products";
import { updateBusinessLogo } from "@/server/businesses";

export default async function BusinessSlugPage(
  props: PageProps<"/businesses/[businessSlug]">
) {
  const { businessSlug } = await props.params;

  const business = await getBusinessBySlug(businessSlug);
  if (!business) return notFound();

  const businessId = business.id;
  const resolvedSlug = business.slug ?? businessSlug;

  const products = await getProductsPerBusiness(businessId);

  const heroBg = business.logo ? (
    <Image
      src={business.logo}
      alt={`${business.name} logo`}
      fill
      className="object-cover"
      priority
    />
  ) : (
    <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500" />
  );

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-xl border">
        <div className="absolute inset-0">{heroBg}</div>
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
            action={updateBusinessLogo.bind(null, businessId, resolvedSlug)}
            className="bg-white/10 backdrop-blur rounded-lg p-3 ring-1 ring-white/15"
          />
        </div>
      </section>

      <section className="grid gap-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h2 className="text-lg font-semibold">Catalogue</h2>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <SearchForm className="flex-1 md:w-[380px]" />
            <AddProductForm
              organizationId={businessId}
              businessSlug={resolvedSlug}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <FilteredProducts data={products} />
        </div>
      </section>
    </div>
  );
}
