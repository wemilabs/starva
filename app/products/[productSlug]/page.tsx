import { notFound } from "next/navigation";
import { getProductBySlug } from "@/data/products";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogIn, ShoppingBasket } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { removeUnderscoreAndCapitalizeOnlyTheFirstChar } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
// import { ProductCard } from "@/components/products/product-card";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

export default async function ProductSlugPage(
  props: PageProps<"/products/[productSlug]">
) {
  const { productSlug } = await props.params;
  const result = await getProductBySlug(productSlug);

  if (!result) return notFound();

  if ("message" in result) {
    return (
      <div>
        <div>Product Slug Page {productSlug}</div>
        <div>{result.message}</div>
        <Card className="border border-dashed bg-sidebar">
          <CardContent className="flex flex-col gap-2">
            <p className="text-sm text-muted-foreground text-center">
              First, you need to sign in to purchase this product
            </p>
            <Button
              asChild
              className="w-full bg-primary text-primary-foreground"
            >
              <Link href="/sign-in" className="flex items-center gap-2">
                <LogIn />
                <span>Sign in</span>
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const price = new Intl.NumberFormat("rw-RW", {
    style: "currency",
    currency: "RWF",
    maximumFractionDigits: 0,
  }).format(Number(result.price));

  //  const relatedProducts = await getRelatedProducts(result.organizationId, result.id, 10);

  return (
    <div className="container mx-auto px-4 py-8 space-y-12">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div>
          <div className="aspect-square w-full overflow-hidden rounded-lg bg-muted">
            <Image
              src={
                result.imageUrl ??
                "https://hsl8jk540a.ufs.sh/f/JFF4Q8WebB6d89s9BRYhvCEDrKcu2HNpfYQo7eR4FUT8wVgS"
              }
              alt={result.name}
              className="h-full w-full object-cover"
              width={500}
              height={500}
              priority
            />
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              {result.name}
            </h1>
            {result.brand ? (
              <p className="mt-1 text-sm text-muted-foreground">
                by {result.brand}
              </p>
            ) : null}
          </div>

          <div className="text-2xl font-bold">{price}</div>

          <div className="prose max-w-none text-sm text-muted-foreground">
            <p>{result.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="rounded-md border p-4">
              <p className="text-muted-foreground">Status</p>
              <p className="mt-1 font-medium">
                {removeUnderscoreAndCapitalizeOnlyTheFirstChar(result.status)}
              </p>
            </div>
            <div className="rounded-md border p-4">
              <p className="text-muted-foreground">Calories</p>
              <p className="mt-1 font-medium">{result.calories ?? "N/A"}</p>
            </div>
            <div className="rounded-md border p-4">
              <p className="text-muted-foreground">Likes</p>
              <p className="mt-1 font-medium">{result.likesCount ?? 0}</p>
            </div>
            <div className="rounded-md border p-4">
              <p className="text-muted-foreground">From</p>
              <p className="mt-1 font-medium">
                <Link
                  className="underline underline-offset-4 hover:no-underline"
                  href={`/businesses/${result.organization.slug}`}
                >
                  {result.organization.name}
                </Link>
              </p>
            </div>
          </div>

          <div className="mt-2 flex flex-wrap gap-3">
            <Button>Order right away</Button>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline">
                  <ShoppingBasket className="size-4" />
                  Add to cart
                </Button>
              </SheetTrigger>
              <SheetContent className="flex flex-col gap-4">
                <SheetHeader className="text-left">
                  <SheetTitle>Add “{result.name}”</SheetTitle>
                  <SheetDescription>
                    Review item details, set quantity, and add to your cart.
                  </SheetDescription>
                </SheetHeader>

                <div className="space-y-4 px-4">
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
                </div>

                <SheetFooter className="gap-2 sm:justify-between">
                  <Button className="sm:w-auto">
                    <ShoppingBasket className="size-4" />
                    Make order — {price}
                  </Button>
                  <SheetClose asChild>
                    <Button variant="outline" className="sm:w-auto">
                      Close
                    </Button>
                  </SheetClose>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </div>
  );
}
