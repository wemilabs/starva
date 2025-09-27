"use client";

import { useState } from "react";
import { AddProductForm } from "@/components/forms/add-product-form";
import { SearchForm } from "@/components/forms/search-form";
import { FilteredProducts } from "@/components/products/filtered-products";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Product } from "@/db/schema";
import { STATUS_VALUES } from "@/lib/constants";
import { removeUnderscoreAndCapitalize } from "@/lib/utils";

type ProductWithOrg = Product & {
  organization?: {
    id: string;
    name: string;
    logo: string | null;
    slug: string;
  } | null;
};

type ProductCatalogueSectionProps = {
  products: ProductWithOrg[];
  businessId: string;
  businessSlug: string;
};

export function ProductCatalogueSection({
  products,
  businessId,
  businessSlug,
}: ProductCatalogueSectionProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  return (
    <>
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between mt-3 mb-2">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold">Catalogue</h2>
            <p className="text-muted-foreground text-sm">
              Manage your products here
            </p>
          </div>
          <AddProductForm
            organizationId={businessId}
            businessSlug={businessSlug}
          />
        </div>

        <div className="flex items-center justify-between md:justify-start gap-3 w-full md:w-auto">
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Select a status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {STATUS_VALUES.map((status) => (
                <SelectItem key={status} value={status}>
                  {removeUnderscoreAndCapitalize(status)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <SearchForm
            formProps={{ className: "w-full md:w-[380px]" }}
            inputOnlyClassName="h-9"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <FilteredProducts data={products} filterByStatus={selectedStatus} />
      </div>
    </>
  );
}
