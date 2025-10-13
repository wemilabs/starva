import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Product } from "@/db/schema";
import { cn, removeUnderscoreAndCapitalizeOnlyTheFirstChar } from "@/lib/utils";
import { Heart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
// import { Activity } from "react";

import { DeleteProductForm } from "../forms/delete-product-form";
import { EditProductForm } from "../forms/edit-product-form";
import { AddToCartButton } from "./add-to-cart-button";

type Props = Product & {
  organization?: {
    id: string;
    name: string;
    logo: string | null;
    slug: string;
  } | null;
  href?: string;
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
}: Props) {
  const priceNumber = Number(price) || 0;

  const orgName = organization?.name ?? null;
  const orgLogo = organization?.logo ?? null;

  const customCardContent = (
    <>
      <div className="relative aspect-[16/9]">
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
        <div className="absolute inset-0 bg-gradient-to-tr from-black/70 via-black/30 to-transparent" />
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
            {new Intl.NumberFormat("rw-RW", {
              style: "currency",
              currency: "RWF",
              maximumFractionDigits: 0,
            }).format(priceNumber)}
          </div>
        </div>
        <h3 className="text-balance text-xl font-semibold leading-tight">
          {name}
        </h3>
        {/* <Activity mode={description ? "visible" : "hidden"}>
            <p className="mt-2 max-w-[46ch] text-xs text-white/80">
              {description}
            </p>
          </Activity> */}
        {description ? (
          <p className="mt-2 max-w-[46ch] text-xs text-white/80">
            {description}
          </p>
        ) : null}

        <div className="mt-4 flex items-center justify-between">
          <div className="inline-flex items-center gap-2 rounded-full bg-black/30 ring-1 ring-white/10 backdrop-blur-sm">
            <Avatar className="size-9 ring-1 ring-white/20">
              <AvatarImage
                src={orgLogo || ""}
                alt={orgName || ""}
                className="object-cover"
              />
              <AvatarFallback className="text-muted-foreground text-xs">
                {getInitials(orgName)}
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="inline-flex items-center gap-1.5 rounded-full bg-black/30 px-2.5 py-1 text-white/90 ring-1 ring-white/10 backdrop-blur-sm">
            <Heart className="size-3.5" aria-hidden="true" />
            <span className="text-[11px]">{likesCount ?? 0}</span>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card className="group relative overflow-hidden p-0">
          {customCardContent}
        </Card>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{name}</DialogTitle>
        </DialogHeader>
        <h1>General content with product info</h1>
        {/* <Activity mode={href ? "visible" : "hidden"}>
          <AddToCartButton
            product={{
              id,
              name,
              slug,
              price,
              imageUrl,
            }}
          />
          <Link href={`/products/${href}`}>View product</Link>
        </Activity> */}
        {href ? (
          <>
            <AddToCartButton
              product={{
                id,
                name,
                slug,
                price,
                imageUrl,
              }}
            />
            <Link href={`/products/${href}`}>View product</Link>
          </>
        ) : null}
      </DialogContent>
      {/* <Activity mode={!href ? "visible" : "hidden"}>
        <DialogFooter>
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
            className="shadow-sm hover:shadow"
          />
          <DeleteProductForm
            productId={id}
            organizationId={organization?.id || ""}
            businessSlug={organization?.slug || ""}
          />
        </DialogFooter>
      </Activity> */}
      {!href ? (
        <DialogFooter className="">
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
            className="shadow-sm hover:shadow"
          />
          <DeleteProductForm
            productId={id}
            organizationId={organization?.id || ""}
            businessSlug={organization?.slug || ""}
          />
        </DialogFooter>
      ) : null}
    </Dialog>
  );
}
