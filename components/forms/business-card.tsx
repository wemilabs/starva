"use client";

import { Trash2 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Organization } from "@/db/schema";
import { getInitials } from "@/lib/utils";
import { deleteBusiness } from "@/server/businesses";
import { Spinner } from "../ui/spinner";

export function BusinessCard({ business }: { business: Organization }) {
  const [isPending, startTransition] = useTransition();
  const pathname = usePathname();

  const [open, setOpen] = useState(false);

  const handleDelete = () => {
    startTransition(async () => {
      try {
        await deleteBusiness(business.id);
        setOpen(false);
        toast.success("Business deleted", {
          description: `${business.name} has been successfully deleted.`,
        });
      } catch (error) {
        console.error("Error deleting business:", error);
        toast.error("Failed to delete business", {
          description: "Please try again later.",
        });
      }
    });
  };

  const metadata = business.metadata
    ? (JSON.parse(business.metadata) as { description?: string })
    : null;

  return (
    <Card className="group transition-all hover:shadow-lg hover:border-primary/50">
      <CardHeader>
        <div className="flex items-start gap-4">
          <Avatar className="size-14 ring-2 ring-border transition-all group-hover:ring-primary/50">
            <AvatarImage alt={business.name} src={business.logo ?? ""} />
            <AvatarFallback className="bg-linear-to-br from-primary to-red-500 text-white text-base font-semibold">
              {getInitials(business.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <Link
              className="block hover:opacity-80 transition-opacity"
              href={
                pathname === "/businesses"
                  ? `/businesses/${business.slug}`
                  : `/merchants/${business.slug}`
              }
            >
              <CardTitle className="truncate md:text-lg mb-2">
                {business.name}
              </CardTitle>
              <CardDescription className="line-clamp-2 text-xs sm:text-sm font-mono tracking-tighter">
                {metadata?.description || "No description provided"}
              </CardDescription>
            </Link>
          </div>
        </div>
        {pathname === "/businesses" ? (
          <CardAction>
            <AlertDialog open={open} onOpenChange={setOpen}>
              <AlertDialogTrigger asChild>
                <Button
                  className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all opacity-0 group-hover:opacity-100"
                  disabled={isPending}
                  size="icon"
                  variant="ghost"
                >
                  <Trash2 className="size-4 text-destructive" />
                  <span className="sr-only">Delete {business.name}</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete {business.name}?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    the business and remove all associated data including
                    products, members, and settings.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive hover:bg-destructive/90"
                    disabled={isPending}
                    onClick={(e) => {
                      e.preventDefault();
                      handleDelete();
                    }}
                  >
                    {isPending ? (
                      <>
                        <Spinner /> Deleting...
                      </>
                    ) : (
                      "Yes, delete"
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardAction>
        ) : null}
      </CardHeader>
    </Card>
  );
}
