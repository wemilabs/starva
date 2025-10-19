"use client";

import { Suspense } from "react";
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
      <Suspense fallback={<div className="h-9 w-full md:w-[380px] animate-pulse bg-muted rounded-lg" />}>
        <SearchForm
          formProps={{ className: "w-full md:w-[380px]" }}
          inputFieldOnlyClassName="h-9"
        />
      </Suspense>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Suspense fallback={<div className="col-span-full text-center text-muted-foreground">Loading...</div>}>
          <FilteredBusiness data={data} />
        </Suspense>
      </div>
    </>
  );
}
