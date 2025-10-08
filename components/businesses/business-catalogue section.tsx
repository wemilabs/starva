"use client";

import { SearchForm } from "../forms/search-form";
import { FilteredBusiness } from "./filtered-business";

type BusinessCatalogueSectionProps = {
  data:
    | {
        id: string;
        name: string;
        createdAt: Date;
        slug: string;
        logo: string | null;
        metadata: string | null;
      }[]
    | null;
};

export function BusinessCatalogueSection({
  data,
}: BusinessCatalogueSectionProps) {
  return (
    <>
      <SearchForm
        formProps={{ className: "w-full md:w-[380px]" }}
        inputFieldOnlyClassName="h-9"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <FilteredBusiness data={data} />
      </div>
    </>
  );
}
