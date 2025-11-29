"use client";

import { FilteredStore } from "./filtered-store";

type StoreCatalogueSectionProps = {
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

export function StoreCatalogueSection({ data }: StoreCatalogueSectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <FilteredStore data={data} />
    </div>
  );
}
