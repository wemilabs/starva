"use client";

import { CalendarClock, Clock } from "lucide-react";
import { usePathname } from "next/navigation";
import { parseAsString, useQueryState } from "nuqs";
import { useState } from "react";

import { AddProductForm } from "@/components/forms/add-product-form";
import {
  EditBusinessTimetable,
  type TimetableData,
} from "@/components/forms/edit-business-timetable";
import { SearchForm } from "@/components/forms/search-form";
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
import { PRODUCT_STATUS_VALUES } from "@/lib/constants";
import { removeUnderscoreAndCapitalizeOnlyTheFirstChar } from "@/lib/utils";
import { ShareDialog } from "../share-dialog";
import { Button } from "../ui/button";

type ProductCatalogueControlsProps = {
  businessId: string;
  businessSlug: string;
  businessName?: string;
  timetable?: TimetableData;
  defaultStatus?: string;
};

export function ProductCatalogueControls({
  businessId,
  businessSlug,
  businessName,
  timetable,
  defaultStatus = "all",
}: ProductCatalogueControlsProps) {
  const [isBusinessHoursOpen, setIsBusinessHoursOpen] = useState(false);
  const pathname = usePathname();
  const [status, setStatus] = useQueryState(
    "status",
    parseAsString.withDefault(defaultStatus),
  );

  const isBusinessPage = pathname === `/businesses/${businessSlug}`;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold">Catalogue</h2>
          <p className="text-muted-foreground text-sm">
            {isBusinessPage
              ? "Manage your products here"
              : "View products here"}
          </p>
        </div>
        {isBusinessPage ? (
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
                  <DialogTitle className="flex items-center">
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

            <ShareDialog
              url={`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/merchants/${businessSlug}`}
              title={`Share ${businessName}`}
              description={`Share your business catalogue with others`}
              shareText={`Check out ${businessName || 'this amazing business'}! 🍽️\n\n${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/merchants/${businessSlug}`}
              className="border-none shadow-none bg-transparent hover:bg-muted"
            />
          </div>
        ) : null}
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 sm:gap-2">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Select a status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {PRODUCT_STATUS_VALUES.map(statusValue => (
                <SelectItem key={statusValue} value={statusValue}>
                  {removeUnderscoreAndCapitalizeOnlyTheFirstChar(statusValue)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <SearchForm
            formProps={{ className: "w-full md:w-[380px]" }}
            inputFieldOnlyClassName="h-9"
            placeholder="eg. burger, pizza, etc."
          />
        </div>
      </div>
    </div>
  );
}
