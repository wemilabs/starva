"use client";

import { parseAsArrayOf, parseAsString, useQueryStates } from "nuqs";

interface DynamicHeadingProps {
  initialSearch?: string;
  initialTags?: string[];
}

export function DynamicHeading({
  initialSearch,
  initialTags,
}: DynamicHeadingProps) {
  const [{ search, tags }] = useQueryStates(
    {
      search: parseAsString.withDefault(""),
      tags: parseAsArrayOf(parseAsString).withDefault([]),
    },
    {
      shallow: false,
      throttleMs: 300,
    },
  );

  // Dynamic heading based on filters
  let heading = "Browse Products";
  let subheading =
    "Discover a wide range of meals, fast-foods, and drinks from our local partners";

  // Use client-side values if available, otherwise fall back to initial values
  const currentSearch = search || initialSearch || "";
  const currentTags = tags.length > 0 ? tags : initialTags || [];

  if (currentSearch) {
    heading = `Search results for "${currentSearch}"`;
    subheading = `Find products matching "${currentSearch}" from our local partners`;
  }

  if (currentTags && currentTags.length > 0) {
    const tagLabels = currentTags.join(", ");
    if (currentSearch) {
      heading += ` in ${tagLabels}`;
      subheading += ` in ${tagLabels} categories`;
    } else {
      heading = `${tagLabels} products`;
      subheading = `Browse "${tagLabels}" products from our local partners`;
    }
  }

  return (
    <div className="mb-8">
      <h1 className="text-2xl font-bold mb-2">{heading}</h1>
      <p className="text-sm text-muted-foreground">{subheading}</p>
    </div>
  );
}
