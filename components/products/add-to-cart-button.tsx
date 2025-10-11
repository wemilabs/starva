"use client";

import { ShoppingBag } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/cart-store";

interface AddToCartButtonProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price: string;
    imageUrl: string | null;
  };
  quantity?: number;
  variant?: "default" | "outline" | "ghost";
  className?: string;
}

export function AddToCartButton({
  product,
  quantity = 1,
  variant = "default",
  className,
}: AddToCartButtonProps) {
  const [isAdding, setIsAdding] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = () => {
    setIsAdding(true);

    addItem({
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      productImage: product.imageUrl,
      price: product.price,
      quantity,
    });

    toast.success(`${product.name} added to cart`, {
      description: `Quantity: ${quantity}`,
    });

    setTimeout(() => setIsAdding(false), 500);
  };

  return (
    <Button
      onClick={handleAddToCart}
      disabled={isAdding}
      variant={variant}
      className={className}
    >
      <ShoppingBag className="size-4" />
      {isAdding ? "Adding..." : "Add to Cart"}
    </Button>
  );
}
