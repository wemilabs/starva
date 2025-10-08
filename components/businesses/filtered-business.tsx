"use client";

import { usePathname } from "next/navigation";
import { useQueryState } from "nuqs";
import { BusinessCard } from "../forms/business-card";

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

export function FilteredBusiness({ data }: BusinessCatalogueSectionProps) {
  const [search] = useQueryState("search", { defaultValue: "" });
  const pathname = usePathname();

  const filteredBusinesses = data?.filter((business) => {
    const matchesSearch =
      business.name.toLowerCase().includes(search.toLowerCase()) ||
      business.slug.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  if (!filteredBusinesses?.length)
    return (
      <div className="col-span-full flex items-center justify-center min-h-[200px] border border-dashed border-muted-foreground/50 rounded-lg">
        <div className="text-muted-foreground text-center">
          <p className="text-sm">
            No {pathname === "/merchants" ? "merchants" : "businesses"} found
            matching your search
          </p>
        </div>
      </div>
    );

  return (
    <>
      {filteredBusinesses.map((business) => (
        <BusinessCard key={business.id} business={business} />
      ))}
    </>
  );
}
