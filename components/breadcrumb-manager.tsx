"use client";

import { useAutoBreadcrumbs } from "@/hooks/use-breadcrumbs";

export function BreadcrumbManager() {
  useAutoBreadcrumbs();
  return null;
}
