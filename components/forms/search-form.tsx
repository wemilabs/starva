"use client";

import { Search, X } from "lucide-react";
import { useQueryState } from "nuqs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function SearchForm({
  formProps,
  inputOnlyClassName,
}: {
  formProps?: React.ComponentProps<"form">;
  inputOnlyClassName?: string;
}) {
  const [search, setSearch] = useQueryState("search", { defaultValue: "" });

  return (
    <form {...formProps}>
      <div className="bg-background has-[input:focus]:ring-muted relative grid grid-cols-[1fr_auto] items-center rounded-lg border shadow shadow-zinc-950/5 has-[input:focus]:ring-2">
        <Label htmlFor="search" className="sr-only">
          Search
        </Label>
        <Input
          id="search"
          type="search"
          placeholder="e.g. thiep, vosgienne, calaba, etc."
          className={cn(
            "w-full bg-transparent pl-10 focus:outline-none rounded-lg placeholder:text-xs md:placeholder:text-sm text-xs md:text-sm",
            inputOnlyClassName
          )}
          value={search}
          onChange={(e) => setSearch(e.target.value || null)}
        />

        {search ? (
          <button
            type="reset"
            onClick={() => setSearch("")}
            className="absolute top-1/2 right-3.5 -translate-y-1/2"
          >
            <X className="size-4 opacity-50" />
          </button>
        ) : null}
        <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 opacity-50 select-none" />
      </div>
    </form>
  );
}
