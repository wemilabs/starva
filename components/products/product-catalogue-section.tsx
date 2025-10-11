"use client";

import { AddProductForm } from "@/components/forms/add-product-form";
import { SearchForm } from "@/components/forms/search-form";
import { FilteredProducts } from "@/components/products/filtered-products";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Product } from "@/db/schema";
import { STATUS_VALUES, type StatusValue } from "@/lib/constants";
import { removeUnderscoreAndCapitalizeOnlyTheFirstChar } from "@/lib/utils";
import { CalendarClock } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "../ui/button";

type ProductWithOrg = Product & {
  organization?: {
    id: string;
    name: string;
    logo: string | null;
    slug: string;
  } | null;
};

type ProductCatalogueSectionProps = {
  data: ProductWithOrg[];
  businessId: string;
  businessSlug: string;
  defaultStatus?: StatusValue;
};

export function ProductCatalogueSection({
  data,
  businessId,
  businessSlug,
  defaultStatus,
}: ProductCatalogueSectionProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>(
    defaultStatus || "all",
  );
  const pathname = usePathname();

  return (
    <>
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between mt-3 mb-2">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold">Catalogue</h2>
            <p className="text-muted-foreground text-sm">
              {pathname === `/business/${businessSlug}`
                ? "Manage your products here"
                : "View products here"}
            </p>
          </div>
          {pathname === `/businesses/${businessSlug}` ? (
            <div className="flex items-center gap-2">
              <AddProductForm
                organizationId={businessId}
                businessSlug={businessSlug}
              />
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-none shadow-none bg-transparent hover:bg-muted"
                    type="button"
                  >
                    <CalendarClock className="size-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Setting time</DialogTitle>
                    <DialogDescription>
                      Define your business timetable
                    </DialogDescription>
                  </DialogHeader>
                  <div className="text-center text-sm text-muted-foreground py-4">
                    Coming soon...
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          ) : null}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 sm:gap-2">
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Select a status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {STATUS_VALUES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {removeUnderscoreAndCapitalizeOnlyTheFirstChar(status)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <SearchForm
              formProps={{ className: "w-full md:w-[380px]" }}
              inputFieldOnlyClassName="h-9"
            />
          </div>
          <div className="text-sm">Filter by Tag</div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <FilteredProducts data={data} filterByStatus={selectedStatus} />
      </div>
    </>
  );
}
