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
import { getBusinessesPerUser } from "@/data/businesses";
import { verifySession } from "@/data/user-session";
import { RegisterBusinessForm } from "./forms/register-business-form";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
// import { removeUnderscoreAndCapitalizeOnlyTheFirstChar } from "@/lib/utils";
// import { Label } from "@/components/ui/label";
import { ShoppingBag } from "lucide-react";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { SearchForm } from "./forms/search-form";

export async function Header({
  baseCrumbs,
}: {
  baseCrumbs: { label: string; href: string }[];
}) {
  const { success } = await verifySession();
  const businesses = success ? await getBusinessesPerUser() : [];

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 px-4 justify-between transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 sticky top-0 z-11 border-b rounded-lg bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/50">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <Separator
          className="mr-2 data-[orientation=vertical]:h-4"
          orientation="vertical"
        />
        <NavBreadcrumbs base={baseCrumbs} />
      </div>
      {/* <div>
        <div>Search input drops here once scrolled at a certain level</div>
      </div> */}
      <div className="flex items-center gap-0.5">
        {!success ? (
          <Button asChild size="sm" variant="default">
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

        <Sheet>
          <SheetTrigger asChild>
            <Button
              className="relative border-none shadow-none bg-transparent hover:bg-muted"
              size="sm"
              variant="outline"
            >
              <ShoppingBag className="size-4" />
            </Button>
          </SheetTrigger>
          <SheetContent className="flex flex-col gap-4">
            <SheetHeader className="text-left">
              <SheetTitle>Cart</SheetTitle>
              <SheetDescription>
                Review item details, set quantity, and confirm your order.
              </SheetDescription>
            </SheetHeader>

            {/* <div className="space-y-4 px-4">
                  <div className="flex items-start gap-4">
                    <div className="relative size-16 overflow-hidden rounded-md bg-muted">
                      <Image
                        src={
                          result.imageUrl ??
                          "https://hsl8jk540a.ufs.sh/f/JFF4Q8WebB6d89s9BRYhvCEDrKcu2HNpfYQo7eR4FUT8wVgS"
                        }
                        alt={result.name}
                        width={64}
                        height={64}
                        className="size-fit object-cover"
                        priority
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{result.name}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <Badge variant="secondary">
                          {removeUnderscoreAndCapitalizeOnlyTheFirstChar(
                            result.status
                          )}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {price}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid gap-3">
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      name="quantity"
                      type="number"
                      min={1}
                      defaultValue={1}
                      className="w-28"
                    />
                  </div>

                  <div className="grid gap-3">
                    <Label htmlFor="notes">Special instructions</Label>
                    <Textarea
                      id="notes"
                      name="notes"
                      rows={4}
                      placeholder="Add a note..."
                      className="placeholder:text-sm"
                    />
                  </div>
                </div> */}

            <SheetFooter className="gap-2 sm:justify-between">
              <Button className="sm:w-auto">
                <ShoppingBag className="size-4" />
                {/* Make order — {price} */}
                Place order
              </Button>
              <SheetClose asChild>
                <Button className="sm:w-auto" variant="outline">
                  Close
                </Button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
        <ModeToggle />
      </div>
    </header>
  );
}
