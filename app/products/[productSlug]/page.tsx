import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { AddToCartButton } from "@/components/products/add-to-cart-button";
import { ProductLikeButton } from "@/components/products/product-like-button";
import { ProductSlugSkeleton } from "@/components/products/product-slug-skeleton";
import { ShareDialog } from "@/components/share-dialog";
import { Badge } from "@/components/ui/badge";
import { ProtectedImage } from "@/components/ui/protected-image";
import { getProductBySlug } from "@/data/products";
import { FALLBACK_PRODUCT_IMG_URL } from "@/lib/constants";
import {
	formatPriceInRWF,
	removeUnderscoreAndCapitalizeOnlyTheFirstChar,
} from "@/lib/utils";

async function ProductDisplay({ productSlug }: { productSlug: string }) {
	const product = await getProductBySlug(productSlug);

	if (!product) return notFound();

	//  const relatedProducts = await getRelatedProducts(product.organizationId, product.id, 10);

	return (
		<div className="container mx-auto px-4 py-8 space-y-12">
			<div className="grid grid-cols-1 gap-8 md:grid-cols-2">
				<div className="aspect-square w-full overflow-hidden rounded-lg bg-muted">
					<ProtectedImage
						src={product.imageUrl ?? FALLBACK_PRODUCT_IMG_URL}
						alt={product.name}
						className="h-full w-full object-cover"
						width={500}
						height={500}
						preload
					/>
				</div>

				<div className="flex flex-col gap-6">
					<h1 className="text-3xl font-semibold tracking-tight">
						{product.name}
					</h1>

					<div className="text-2xl font-bold">
						{formatPriceInRWF(product.price)}
					</div>

					<div className="prose max-w-none text-sm text-muted-foreground">
						<p>{product.description}</p>
					</div>

					<div className="grid grid-cols-2 gap-4 text-sm">
						<div className="rounded-md border p-4">
							<p className="text-muted-foreground">Status</p>
							<Badge variant="available" className="mt-1">
								{removeUnderscoreAndCapitalizeOnlyTheFirstChar(product.status)}
							</Badge>
						</div>
						<div className="rounded-md border p-4">
							<p className="text-muted-foreground">Calories</p>
							<p className="mt-1 font-medium">{product.calories ?? "N/A"}</p>
						</div>
						<div className="rounded-md border p-4">
							<p className="text-muted-foreground mb-2">Likes</p>
							<ProductLikeButton
								productId={product.id}
								initialIsLiked={product.isLiked ?? false}
								initialLikesCount={product.likesCount ?? 0}
								revalidateTargetPath={`/products/${product.slug}`}
								variant="default"
							/>
						</div>
						<div className="rounded-md border p-4">
							<p className="text-muted-foreground">From</p>
							<p className="mt-1 font-medium">
								<Link
									className="underline underline-offset-4 hover:no-underline"
									href={`/merchants/${product.organization.slug}`}
								>
									{product.organization.name}
								</Link>
							</p>
						</div>
					</div>

					<div className="mt-2 flex flex-wrap gap-3">
						<AddToCartButton
							product={{
								id: product.id,
								name: product.name,
								slug: product.slug,
								price: product.price,
								imageUrl: product.imageUrl,
							}}
						/>

						{/* <Button variant="outline" disabled>
              <CalendarClock className="size-4" />
              <span className="hidden sm:block">Schedule delivery</span>
            </Button> */}

						<ShareDialog
							url={`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/products/${product.slug}`}
							buttonTitle="Share"
							title={`Share ${product.name}`}
							description={`Share this product with others`}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}

async function ProductContent({
	params,
}: {
	params: Promise<{ productSlug: string }>;
}) {
	const { productSlug } = await params;
	return <ProductDisplay productSlug={productSlug} />;
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ productSlug: string }>;
}): Promise<Metadata> {
	const { productSlug } = await params;

	const product = await getProductBySlug(productSlug);
	if (!product) {
		return {
			title: "Product Not Found - Starva",
			description: "The requested product could not be found.",
		};
	}

	const resolvedSlug = product.slug ?? productSlug;
	const title = `${product.name} - Starva`;
	const description = `${product.name}${product.description ? ` - ${product.description}` : ""}. Price: ${formatPriceInRWF(product.price)}. Available from ${product.organization.name}. Order now for delivery.`;

	const images = [];
	if (product.imageUrl) {
		images.push({
			url: product.imageUrl,
			width: 1200,
			height: 630,
			alt: product.name,
		});
	} else {
		images.push({
			url: FALLBACK_PRODUCT_IMG_URL,
			width: 1200,
			height: 630,
			alt: "Starva app - A sure platform for local businesses and customers to meet. Easy, fast and reliable.",
		});
	}

	const productUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/products/${resolvedSlug}`;

	return {
		title,
		description,
		openGraph: {
			title,
			description,
			url: productUrl,
			type: "website",
			images,
			siteName: "Starva",
		},
		twitter: {
			card: "summary_large_image",
			title,
			description,
			images: images.map((img) => img.url),
		},
		alternates: {
			canonical: productUrl,
		},
	};
}

export default async function ProductSlugPage(
	props: PageProps<"/products/[productSlug]">,
) {
	return (
		<Suspense fallback={<ProductSlugSkeleton />}>
			<ProductContent params={props.params} />
		</Suspense>
	);
}
