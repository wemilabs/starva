import Link from "next/link";
import { ModeToggle } from "@/components/mode-toggle";
import { NavBreadcrumbs } from "@/components/nav-breadcrumbs";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { verifySession } from "@/data/user-session";
import { cn } from "@/lib/utils";
import { getBusinesses } from "@/server/businesses";
import { RegisterBusinessForm } from "./forms/register-business-form";
// import { SearchForm } from "./forms/search-form";

export async function Header({
  baseCrumbs,
}: {
  baseCrumbs: { label: string; href: string }[];
}) {
  const { success } = await verifySession();
  const businesses = success ? await getBusinesses() : [];

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 px-4 justify-between transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 sticky top-0 z-11 border-b rounded-lg bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/50">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mr-2 data-[orientation=vertical]:h-4"
        />
        <NavBreadcrumbs base={baseCrumbs} />
      </div>
      {/* <div>
        <div>Search input drops here once scrolled at a certain level</div>
      </div> */}
      <div className="flex items-center gap-2">
        {!success ? (
          <Button asChild variant="default" size="sm">
            <Link href="/sign-in">
              <span>Sign In</span>
            </Link>
          </Button>
        ) : businesses?.length === 0 ? (
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm">Claim business</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Register Business</DialogTitle>
                <DialogDescription>
                  Register a new business to get started.
                </DialogDescription>
              </DialogHeader>
              <RegisterBusinessForm />
            </DialogContent>
          </Dialog>
        ) : null}

        <ModeToggle />
      </div>
    </header>
  );
}
