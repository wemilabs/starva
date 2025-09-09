import Link from "next/link";
import { ModeToggle } from "@/components/mode-toggle";
import { NavBreadcrumbs } from "@/components/nav-breadcrumbs";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

export function Header({
  baseCrumbs,
}: {
  baseCrumbs: { label: string; href: string }[];
}) {
  return (
    <header className="flex h-16 shrink-0 items-center gap-2 px-4 justify-between transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 sticky top-0 z-10 border-b rounded-lg bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/50">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mr-2 data-[orientation=vertical]:h-4"
        />
        <NavBreadcrumbs base={baseCrumbs} />
      </div>
      <div className="flex items-center gap-2">
        <Button asChild variant="outline" size="sm">
          <Link href="/sign-in">
            <span>Sign In</span>
          </Link>
        </Button>
        <Button asChild size="sm">
          <Link href="/claim-business">
            <span>Claim business</span>
          </Link>
        </Button>
        <ModeToggle />
      </div>
    </header>
  );
}
