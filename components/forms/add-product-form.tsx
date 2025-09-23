"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus } from "lucide-react";
import Image from "next/image";
import { useEffect, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
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
import { STATUS_VALUES } from "@/lib/constants";
import { UploadButton } from "@/lib/uploadthing";
import { slugify } from "@/lib/utils";
import { createProductAction } from "@/server/products";

const schema = z.object({
  name: z.string().min(2, "Name is too short").max(100),
  slug: z.string().min(2, "Slug required").max(120),
  price: z
    .string()
    .min(1, "Price is required")
    .refine(
      (v) => !Number.isNaN(Number(v)) && Number(v) >= 0,
      "Enter a valid price"
    ),
  imageUrl: z.url("Provide a valid URL").optional().or(z.literal("")),
  description: z.string().max(500).optional().or(z.literal("")),
  status: z.enum(STATUS_VALUES),
});

type Props = {
  organizationId: string;
  businessSlug: string;
  className?: string;
};

export function AddProductForm({
  organizationId,
  businessSlug,
  className,
}: Props) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      slug: "",
      price: "",
      imageUrl: "",
      description: "",
      status: STATUS_VALUES[0],
    },
  });

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
      const res = await createProductAction({
        organizationId,
        name: values.name,
        slug: values.slug,
        price: values.price,
        description: values.description || "",
        imageUrl: values.imageUrl || "",
        status: values.status,
        revalidateTargetPath: `/businesses/${businessSlug}`,
      });

      if (res.ok) {
        form.reset();
        // Dialog will auto-close because trigger is outside; keep simple UX
      } else {
        // basic error surfacing in form; you can wire sonner if desired
        const errors = res.error || {};
        (Object.keys(errors) as (keyof typeof errors)[]).forEach((key) => {
          const message = errors[key]?.join(", ") || "Invalid field";
          form.setError(key as any, { message });
        });
      }
    });
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className={className} size="sm">
          <Plus className="mr-2 size-4" /> Add product
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Add a new product</DialogTitle>
          <DialogDescription>
            Provide details below. Slug is auto-generated.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Grilled chicken" {...field} />
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
                      className="bg-muted cursor-not-allowed text-muted-foreground"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price (RWF)</FormLabel>
                    <FormControl>
                      <Input
                        inputMode="decimal"
                        placeholder="2500"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                          onClientUploadComplete={(res) => {
                            const url =
                              (res?.[0] &&
                                ((res[0] as any).ufsUrl ||
                                  (res[0] as any).url)) ||
                              "";
                            if (url)
                              form.setValue("imageUrl", url, {
                                shouldValidate: true,
                              });
                          }}
                          onUploadError={(err) => {
                            console.error(err);
                            toast.error(
                              err?.message || "Upload failed. Please try again."
                            );
                          }}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="Short description" {...field} />
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
                  <FormControl>
                    <select
                      className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      {...field}
                    >
                      {STATUS_VALUES.map((v) => (
                        <option key={v} value={v}>
                          {v.charAt(0).toUpperCase() + v.slice(1)}
                        </option>
                      ))}
                    </select>
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
                    Saving...
                  </span>
                ) : (
                  "Save product"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
