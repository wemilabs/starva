"use client";

import { AddProductForm } from "@/components/forms/add-product-form";
import { EditBusinessTimetable } from "@/components/forms/edit-business-timetable";
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
import { CalendarClock, Clock } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "../ui/button";

type ProductWithOrg = Product & {
  organization?: {
    id: string;
    name: string;
    logo: string | null;
    slug: string;
    metadata: string | null;
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
  const [isBusinessHoursOpen, setIsBusinessHoursOpen] = useState(false);
  const pathname = usePathname();

  const metadata = data[0]?.organization?.metadata
    ? typeof data[0].organization.metadata === "string"
      ? JSON.parse(data[0].organization.metadata)
      : data[0].organization.metadata
    : {};
  const timetable = metadata.timetable || undefined;

  return (
    <>
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between mb-2">
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

              <Dialog
                open={isBusinessHoursOpen}
                onOpenChange={setIsBusinessHoursOpen}
              >
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
                    <DialogTitle className="flex items-center gap-2">
                      <Clock className="size-5" />
                      Business Hours
                    </DialogTitle>
                    <DialogDescription>
                      Set your business operating hours for each day of the week
                    </DialogDescription>
                  </DialogHeader>
                  <EditBusinessTimetable
                    businessId={businessId}
                    businessSlug={businessSlug}
                    initialTimetable={timetable}
                    onSuccess={() => setIsBusinessHoursOpen(false)}
                  />
                </DialogContent>
              </Dialog>
            </div>
          ) : null}
        </div>

        <div className="flex items-center justify-between gap-2">
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
          <div className="text-sm">TagFilter</div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 py-6">
        <FilteredProducts data={data} filterByStatus={selectedStatus} />
      </div>
    </>
  );
}
