import Link from "next/link";

import { CartSheet } from "@/components/cart/cart-sheet";
import { RegisterStoreForm } from "@/components/forms/register-store-form";
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
import { getStoresPerUser } from "@/data/stores";
import { verifySession } from "@/data/user-session";

export async function Header() {
  const { success } = await verifySession();
  const stores = success ? await getStoresPerUser() : [];

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 px-4 justify-between transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 sticky top-0 z-11 border-b rounded-lg bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/50">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <Separator
          className="mr-2 data-[orientation=vertical]:h-4"
          orientation="vertical"
        />
        <NavBreadcrumbs base={[]} />
      </div>

      <div className="flex items-center gap-2 justify-between">
        {!success ? (
          <Button asChild size="sm" variant="default">
            <Link href="/sign-in">
              <span>Sign In</span>
            </Link>
          </Button>
        ) : stores?.length === 0 ? (
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm">Claim Store</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Register Store</DialogTitle>
                <DialogDescription>
                  Register a new store to get started.
                </DialogDescription>
              </DialogHeader>
              <RegisterStoreForm />
            </DialogContent>
          </Dialog>
        ) : null}

        <div className="flex items-center gap-0.5">
          <CartSheet />
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}
