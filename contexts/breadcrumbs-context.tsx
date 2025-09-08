"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Crumb = {
  label: string;
  href?: string;
};

type BreadcrumbsContextValue = {
  crumbs: Crumb[];
  setCrumbs: (items: Crumb[]) => void;
};

const BreadcrumbsContext = createContext<BreadcrumbsContextValue | null>(null);

export function BreadcrumbsProvider({ children }: { children: ReactNode }) {
  const [crumbs, setCrumbs] = useState<Crumb[]>([]);
  const value = useMemo(() => ({ crumbs, setCrumbs }), [crumbs]);
  return (
    <BreadcrumbsContext.Provider value={value}>
      {children}
    </BreadcrumbsContext.Provider>
  );
}

export function useBreadcrumbs() {
  const ctx = useContext(BreadcrumbsContext);
  if (!ctx)
    throw new Error("useBreadcrumbs must be used within BreadcrumbsProvider");
  return ctx;
}
