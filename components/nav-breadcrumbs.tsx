"use client";

import { Fragment } from "react";
import { useBreadcrumbs, type Crumb } from "@/contexts/breadcrumbs-context";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export function NavBreadcrumbs({ base }: { base: Crumb[] }) {
  const { crumbs } = useBreadcrumbs();
  const all = [...base, ...crumbs];

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {all.map((c, idx) => (
          <Fragment key={`${c.label}-${idx}`}>
            <BreadcrumbItem>
              {c.href ? (
                <BreadcrumbLink href={c.href}>{c.label}</BreadcrumbLink>
              ) : (
                <BreadcrumbPage>{c.label}</BreadcrumbPage>
              )}
            </BreadcrumbItem>
            {idx !== all.length - 1 && <BreadcrumbSeparator />}
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
