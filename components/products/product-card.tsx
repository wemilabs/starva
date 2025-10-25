import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Product } from "@/db/schema";
import {
  cn,
  formatPriceInRWF,
  removeUnderscoreAndCapitalizeOnlyTheFirstChar,
} from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

import { Activity } from "react";
import { DeleteProductForm } from "../forms/delete-product-form";
import { EditProductForm } from "../forms/edit-product-form";
import { AddToCartButton } from "./add-to-cart-button";
import { ProductLikeButton } from "./product-like-button";

type Props = Product & {
  organization?: {
    id: string;
    name: string;
    logo: string | null;
    slug: string;
  } | null;
  href?: string;
  isLiked?: boolean;
};

function getInitials(name?: string | null) {
  if (!name) return "";
  return name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function ProductCard({
  id,
  name,
  slug,
  imageUrl,
  price,
  description,
  likesCount,
  status,
  organization,
  createdAt,
  updatedAt,
  calories,
  brand,
  organizationId,
  href,
  isLiked = false,
}: Props) {
  const priceNumber = Number(price) || 0;

  const orgName = organization?.name ?? null;
  const orgLogo = organization?.logo ?? null;

  const customCardContent = (
    <>
      <div className="relative aspect-video">
        <Image
          src={
            imageUrl ??
            "https://hsl8jk540a.ufs.sh/f/JFF4Q8WebB6d89s9BRYhvCEDrKcu2HNpfYQo7eR4FUT8wVgS"
          }
          alt={name}
          fill
          priority
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-linear-to-tr from-black/70 via-black/30 to-transparent" />
      </div>
      <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
        <div className="mb-2 flex items-center justify-between gap-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[10px] font-medium tracking-wide text-white/90 ring-1 ring-white/15 backdrop-blur-sm">
            <span
              className={cn("size-1.5 rounded-full", {
                "bg-green-600": status === "in_stock",
                "bg-red-600": status === "out_of_stock",
                "bg-gray-600": status === "archived",
              })}
            />
            {removeUnderscoreAndCapitalizeOnlyTheFirstChar(status)}
          </div>

          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[10px] font-medium tracking-wide text-white/90 ring-1 ring-white/15 backdrop-blur-sm">
            {formatPriceInRWF(priceNumber)}
          </div>
        </div>
        <h3 className="text-balance text-xl font-semibold leading-tight">
          {name}
        </h3>
        <Activity mode={description ? "visible" : "hidden"}>
          <p className="mt-2 max-w-[46ch] text-xs text-white/80">
            {description}
          </p>
        </Activity>

        <div className="mt-4 flex items-center justify-between">
          <Link
            href={`/merchants/${organization?.slug}`}
            className="inline-flex items-center gap-2 rounded-full bg-black/30 ring-1 ring-white/10 backdrop-blur-sm"
          >
            <Avatar className="size-9 ring-1 ring-white/20">
              <AvatarImage
                src={orgLogo ?? ""}
                alt={orgName ?? ""}
                className="object-cover"
              />
              <AvatarFallback className="text-muted-foreground text-xs">
                {getInitials(orgName)}
              </AvatarFallback>
            </Avatar>
          </Link>

          {href ? (
            <ProductLikeButton
              productId={id}
              initialIsLiked={isLiked}
              initialLikesCount={likesCount ?? 0}
              revalidateTargetPath="/"
              variant="compact"
            />
          ) : (
            <div className="inline-flex items-center gap-1.5 rounded-full bg-black/30 px-2.5 py-1 text-white/90 ring-1 ring-white/10 backdrop-blur-sm">
              <span className="text-[11px]">{likesCount ?? 0}</span>
            </div>
          )}
        </div>
      </div>
    </>
  );

  return (
    <div className="relative">
      <Dialog>
        <DialogTrigger asChild>
          <Card className="group relative overflow-hidden p-0">
            {customCardContent}
          </Card>
        </DialogTrigger>
        <DialogContent className="flex h-[calc(100vh-12rem)] flex-col gap-0 p-0 md:flex-row border-none md:h-[calc(100vh-25rem)]">
          <div className="relative aspect-square overflow-hidden md:aspect-auto md:w-1/2">
            <Image
              src={
                imageUrl ??
                "https://hsl8jk540a.ufs.sh/f/JFF4Q8WebB6d89s9BRYhvCEDrKcu2HNpfYQo7eR4FUT8wVgS"
              }
              alt={name}
              fill
              priority
              className="object-cover rounded-t-lg md:rounded-l-lg md:rounded-r-none"
              onContextMenu={(e) => e.preventDefault()}
            />
          </div>
          <div className="flex flex-1 flex-col gap-5 p-6 md:py-8">
            <div className="flex flex-col gap-2">
              {organization?.name && (
                <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                  {organization.name}
                </p>
              )}
              <DialogTitle className="text-balance text-2xl font-bold leading-tight tracking-tight line-clamp-2">
                {name}
              </DialogTitle>
              {description && (
                <p className="text-sm leading-relaxed text-muted-foreground line-clamp-1">
                  {description}
                </p>
              )}
            </div>

            <div className="flex items-center gap-4">
              <p className="text-3xl font-bold text-primary/90">
                {formatPriceInRWF(priceNumber)}
              </p>
              {/* {priceNumber > 0 && (
              <p className="text-sm text-muted-foreground line-through">
                {formatPriceInRWF(priceNumber * 1.13)}
              </p>
            )} */}
            </div>

            <Activity mode={href ? "visible" : "hidden"}>
              <div className="flex flex-col gap-3">
                <AddToCartButton
                  product={{
                    id,
                    name,
                    slug,
                    price,
                    imageUrl,
                  }}
                />
                <Link
                  href={`/products/${href}`}
                  className="text-center text-sm text-muted-foreground underline-offset-4 hover:underline"
                >
                  View product details
                </Link>
              </div>
            </Activity>
          </div>
        </DialogContent>
      </Dialog>

      <Activity mode={!href ? "visible" : "hidden"}>
        <div className="absolute -bottom-2 left-0 right-0 z-10 flex items-center justify-between gap-2 px-2">
          <EditProductForm
            product={{
              id,
              name,
              slug,
              price,
              imageUrl,
              description,
              status,
              likesCount,
              createdAt,
              organizationId,
              calories,
              updatedAt,
              brand,
            }}
            organizationId={organization?.id || ""}
            businessSlug={organization?.slug || ""}
            className="shadow-sm hover:shadow flex-1"
          />
          <DeleteProductForm
            productId={id}
            organizationId={organization?.id || ""}
            businessSlug={organization?.slug || ""}
          />
        </div>
      </Activity>
    </div>
  );
}
