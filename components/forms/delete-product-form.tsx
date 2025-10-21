import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteProduct } from "@/server/products";
import { Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Spinner } from "../ui/spinner";

const schema = z.object({
  productId: z.string().min(1),
  organizationId: z.string().min(1),
  revalidateTargetPath: z.string().min(1),
});

export function DeleteProductForm({
  productId,
  organizationId,
  businessSlug,
}: {
  productId: string;
  organizationId: string;
  businessSlug: string;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isDeletingPending, startDeletingTransition] = useTransition();

  const handleDelete = () => {
    startDeletingTransition(async () => {
      const payload = {
        productId,
        organizationId,
        revalidateTargetPath: `/businesses/${businessSlug}`,
      };
      const parsed = schema.safeParse(payload);
      if (!parsed.success) {
        const firstIssue = parsed.error.issues?.[0]?.message || "Invalid data";
        toast.error("Invalid request", { description: firstIssue });
        return;
      }

      try {
        await deleteProduct(parsed.data);
        toast.success("Done!", {
          description: "Product deleted successfully",
        });
        setDialogOpen(false);
      } catch (error: unknown) {
        const e = error as Error;
        console.error("Delete product error:", e.message);
        toast.error("Failure", {
          description: e.message || "Failed to delete product",
        });
      }
    });
  };

  return (
    <AlertDialog onOpenChange={setDialogOpen} open={dialogOpen}>
      <AlertDialogTrigger className="py-2 px-2.5 bg-destructive hover:bg-destructive/80 text-white rounded-md w-full flex-1">
        <Trash2 className="size-4 mx-auto" />
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. It will delete the product.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive hover:bg-destructive/80"
            disabled={isDeletingPending}
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
          >
            {isDeletingPending ? (
              <div className="flex items-center gap-2">
                <Spinner />
                Deleting...
              </div>
            ) : (
              "Yes, delete"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
