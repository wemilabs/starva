import { CalendarClock, LogIn } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AddToCartButton } from "@/components/products/add-to-cart-button";
import { ProductLikeButton } from "@/components/products/product-like-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getProductBySlug } from "@/data/products";
import { removeUnderscoreAndCapitalizeOnlyTheFirstChar } from "@/lib/utils";

export default async function ProductSlugPage(
  props: PageProps<"/products/[productSlug]">,
) {
  const { productSlug } = await props.params;
  const result = await getProductBySlug(productSlug);

  if (!result) return notFound();

  if ("message" in result) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex min-h-[60vh] items-center justify-center">
          <Card className="w-full max-w-md border-2 shadow-lg">
            <CardContent className="flex flex-col items-center gap-6 p-8">
              <div className="rounded-full bg-primary/10 p-4">
                <LogIn className="size-8 text-primary" />
              </div>

              <div className="space-y-2 text-center">
                <h2 className="text-lg font-semibold">Sign in required</h2>
                <p className="text-sm text-muted-foreground max-w-sm">
                  You need to be signed in to view this product and make a
                  purchase
                </p>
              </div>

              <Button asChild size="lg" className="w-full">
                <Link href="/sign-in" className="flex items-center gap-2">
                  <LogIn className="size-4" />
                  <span>Sign in to continue</span>
                </Link>
              </Button>

              <p className="text-xs text-muted-foreground">
                Don't have an account?{" "}
                <Link
                  href="/sign-in"
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  Sign up
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
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

        <div className="flex flex-col gap-6">
          <h1 className="text-3xl font-semibold tracking-tight">
            {result.name}
          </h1>

          <div className="text-2xl font-bold">{price}</div>

          <div className="prose max-w-none text-sm text-muted-foreground">
            <p>{result.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="rounded-md border p-4">
              <p className="text-muted-foreground">Status</p>
              <Badge variant="available" className="mt-1">
                {removeUnderscoreAndCapitalizeOnlyTheFirstChar(result.status)}
              </Badge>
            </div>
            <div className="rounded-md border p-4">
              <p className="text-muted-foreground">Calories</p>
              <p className="mt-1 font-medium">{result.calories ?? "N/A"}</p>
            </div>
            <div className="rounded-md border p-4">
              <p className="text-muted-foreground mb-2">Likes</p>
              <ProductLikeButton
                productId={result.id}
                initialIsLiked={result.isLiked ?? false}
                initialLikesCount={result.likesCount ?? 0}
                revalidateTargetPath={`/products/${result.slug}`}
                variant="default"
              />
            </div>
            <div className="rounded-md border p-4">
              <p className="text-muted-foreground">From</p>
              <p className="mt-1 font-medium">
                <Link
                  className="underline underline-offset-4 hover:no-underline"
                  href={`/merchants/${result.organization.slug}`}
                >
                  {result.organization.name}
                </Link>
              </p>
            </div>
          </div>

          <div className="mt-2 flex flex-wrap gap-3">
            <AddToCartButton
              product={{
                id: result.id,
                name: result.name,
                slug: result.slug,
                price: result.price,
                imageUrl: result.imageUrl,
              }}
            />

            <Button variant="outline" disabled>
              <CalendarClock className="size-4" />
              <span className="hidden sm:block">Schedule delivery</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
