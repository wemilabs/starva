"use client";

import { TagInput } from "@/components/forms/tag-input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Product, Tag } from "@/db/schema";
import { PRODUCT_STATUS_VALUES } from "@/lib/constants";
import { UploadButton } from "@/lib/uploadthing";
import {
  getCategoryOptions,
  removeUnderscoreAndCapitalizeOnlyTheFirstChar,
  slugify,
} from "@/lib/utils";
import { updateProduct } from "@/server/products";
import { getAllTags, getProductTags } from "@/server/tags";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Pencil } from "lucide-react";
import Image from "next/image";
import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { ScrollArea } from "../ui/scroll-area";

const schema = z.object({
  name: z.string().min(2, "Name is too short").max(100),
  slug: z.string().min(2, "Slug required").max(120),
  price: z
    .string()
    .min(1, "Price is required")
    .refine(
      v => !Number.isNaN(Number(v)) && Number(v) >= 0,
      "Enter a valid price",
    ),
  imageUrl: z.url("Provide a valid URL").optional().or(z.literal("")),
  description: z.string().max(500).optional().or(z.literal("")),
  status: z.enum(PRODUCT_STATUS_VALUES),
  category: z.string().min(1, "Category is required"),
  tags: z.array(z.custom<Tag>()),
});

export function EditProductForm({
  product,
  organizationId,
  businessSlug,
  productTags = [],
  className,
}: {
  product: Product;
  organizationId: string;
  businessSlug: string;
  productTags?: Tag[];
  className?: string;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: product.name || "",
      slug: product.slug || "",
      price: product.price || "",
      imageUrl: product.imageUrl || "",
      description: product.description || "",
      status:
        (product.status as (typeof PRODUCT_STATUS_VALUES)[number]) ||
        PRODUCT_STATUS_VALUES[0],
      category: product.category || "",
      tags: productTags,
    },
  });

  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open);

    if (open) {
      Promise.all([getAllTags(), getProductTags(product.id)]).then(
        ([allTagsResult, productTagsResult]) => {
          if (allTagsResult.ok) {
            setAvailableTags(allTagsResult.tags);
          }
          if (productTagsResult.ok) {
            form.reset({
              name: product.name || "",
              slug: product.slug || "",
              price: product.price || "",
              imageUrl: product.imageUrl || "",
              description: product.description || "",
              status:
                (product.status as (typeof PRODUCT_STATUS_VALUES)[number]) ||
                PRODUCT_STATUS_VALUES[0],
              category: product.category || "",
              tags: productTagsResult.tags,
            });
          }
        },
      );
    }
  };

  const watchedName = form.watch("name");
  useEffect(() => {
    if (watchedName) {
      const s = slugify(watchedName);
      form.setValue("slug", s, { shouldValidate: true });
    } else {
      form.setValue("slug", "", { shouldValidate: false });
    }
  }, [watchedName, form]);

  function onSubmit(values: z.infer<typeof schema>) {
    startTransition(async () => {
      try {
        await updateProduct({
          productId: product.id,
          organizationId,
          name: values.name,
          slug: values.slug,
          price: values.price,
          description: values.description || "",
          imageUrl: values.imageUrl || "",
          status: values.status,
          category: values.category,
          tagNames: values.tags.map(t => t.name),
          revalidateTargetPath: `/businesses/${businessSlug}`,
        });
        toast.success("Success", {
          description: "The product has successfully been updated",
        });
        setDialogOpen(false);
      } catch (error: unknown) {
        const e = error as Error;
        console.error(e);
        toast.error("Failure", {
          description: e.message || "Failed to update product",
        });
      }
    });
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className={className}>
          <Pencil className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Edit product</DialogTitle>
          <DialogDescription>
            Provide details below. Slug is auto-generated.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[calc(100vh-15rem)]">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Grilled chicken"
                        className="placeholder:text-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="grilled-chicken"
                        readOnly
                        className="bg-muted cursor-not-allowed text-muted-foreground placeholder:text-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:justify-items-end">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price (RF)</FormLabel>
                      <FormControl>
                        <Input
                          inputMode="decimal"
                          placeholder="2500"
                          className="placeholder:text-sm"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {getCategoryOptions().map(category => (
                            <SelectItem
                              key={category.value}
                              value={category.value}
                            >
                              {category.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image</FormLabel>
                    <FormControl>
                      <div className="flex flex-col gap-3">
                        {field.value ? (
                          <div className="flex items-center gap-3">
                            <div className="relative h-20 w-20 overflow-hidden rounded-md border">
                              <Image
                                src={field.value}
                                alt={form.getValues("name") || "Product image"}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                form.setValue("imageUrl", "", {
                                  shouldValidate: true,
                                })
                              }
                            >
                              Remove
                            </Button>
                          </div>
                        ) : null}

                        <UploadButton
                          endpoint="productImage"
                          className="ut-button:bg-primary ut-button:ut-readying:bg-primary/50"
                          onClientUploadComplete={res => {
                            const url = res?.[0]?.ufsUrl || "";
                            if (url)
                              form.setValue("imageUrl", url, {
                                shouldValidate: true,
                              });
                          }}
                          onUploadError={err => {
                            console.error(err);
                            toast.error(
                              err?.message ||
                                "Upload failed. Please try again.",
                            );
                          }}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Short description"
                        className="placeholder:text-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Status of the product" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PRODUCT_STATUS_VALUES.map(v => (
                          <SelectItem key={v} value={v}>
                            {removeUnderscoreAndCapitalizeOnlyTheFirstChar(v)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags</FormLabel>
                    <FormControl>
                      <TagInput
                        availableTags={availableTags}
                        selectedTags={field.value}
                        onTagsChangeAction={field.onChange}
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="submit" disabled={isPending}>
                  {isPending ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="size-4 animate-spin" />
                      Updating...
                    </span>
                  ) : (
                    "Update product"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
