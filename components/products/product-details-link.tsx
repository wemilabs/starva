"use client";

import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { DialogClose } from "../ui/dialog";

export function ProductDetailsLink({ href }: { href: string | undefined }) {
  const router = useRouter();

  if (!href) return null;

  return (
    <DialogClose asChild>
      <Button
        type="button"
        variant="outline"
        onClick={() => router.push(`/products/${href}`)}
      >
        View product details
      </Button>
    </DialogClose>
  );
}
