"use client";

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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <FilteredBusiness data={data} />
    </div>
  );
}
