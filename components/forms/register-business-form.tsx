"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, LogIn } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { organization, useSession } from "@/lib/auth-client";
import { slugify } from "@/lib/utils";
import { Card, CardContent } from "../ui/card";

const formSchema = z.object({
  name: z.string().min(2).max(50),
  slug: z.string().min(2).max(50),
});

interface RegisterBusinessFormProps {
  onSuccess?: () => void;
}

export function RegisterBusinessForm({ onSuccess }: RegisterBusinessFormProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { data: session } = useSession();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      slug: "",
    },
  });
  const ownerId = session?.user?.id;

  const watchedName = form.watch("name");

  useEffect(() => {
    if (watchedName) {
      const slugValue = slugify(watchedName);
      form.setValue("slug", slugValue, { shouldValidate: true });
    } else {
      form.setValue("slug", "", { shouldValidate: false });
    }
  }, [watchedName, form]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      try {
        if (!ownerId) {
          toast.message("Please sign in first", {
            description: "You must be signed in to register a business.",
          });
          router.push("/sign-in");
          return;
        }

        await organization.create({
          name: values.name,
          slug: values.slug,
          ownerId,
        });
        toast.success("Success", {
          description: "A new business has successfully been registered ",
        });
        onSuccess?.();
      } catch (error: unknown) {
        const e = error as Error;
        console.error(e.message);
        toast.error("Failure", {
          description: e.message || "Failed to register business",
        });
      }
    });
  }

  return (
    <Form {...form}>
      {ownerId ? (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="My Business" {...field} />
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
                    placeholder="my-business"
                    readOnly
                    className="bg-muted cursor-not-allowed text-muted-foreground"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button disabled={isPending} type="submit">
            {isPending ? (
              <div className="flex items-center gap-2">
                <Loader2 className="size-4 animate-spin" />
                <p>Registering Business...</p>
              </div>
            ) : (
              "Register Business"
            )}
          </Button>
        </form>
      ) : (
        <Card className="border border-dashed bg-sidebar">
          <CardContent className="flex flex-col gap-2">
            <p className="text-sm text-muted-foreground text-center">
              First, you need to sign in to register your business
            </p>
            <Button
              asChild
              className="w-full bg-primary text-primary-foreground"
            >
              <Link href="/sign-in" className="flex items-center gap-2">
                <LogIn />
                <span>Sign in</span>
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </Form>
  );
}
