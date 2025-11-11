"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LogIn } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
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
import { organization, useSession } from "@/lib/auth-client";
import { COUNTRIES } from "@/lib/constants";
import { slugify } from "@/lib/utils";
import { Card, CardContent } from "../ui/card";
import { Spinner } from "../ui/spinner";
import { Textarea } from "../ui/textarea";

const formSchema = z.object({
  name: z.string().min(2).max(50),
  slug: z.string().min(2).max(50),
  description: z.string().min(2).max(100).optional(),
  countryCode: z.string(),
  phoneNumber: z
    .string()
    .min(6, "Phone number must be at least 6 digits")
    .max(15, "Phone number must be at most 15 digits")
    .regex(/^[0-9]+$/, "Phone number must contain only digits"),
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
      description: "",
      countryCode: "+250",
      phoneNumber: "",
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
          metadata: {
            description: values.description,
            phone: `${values.countryCode}${values.phoneNumber}`,
          },
        });
        toast.success("Success", {
          description: "A new business has successfully been registered ",
        });
        onSuccess?.();
        router.refresh();
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
                  <Input
                    placeholder="My Business"
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
                    placeholder="my-business"
                    readOnly
                    className="bg-muted cursor-not-allowed text-muted-foreground placeholder:text-sm"
                    {...field}
                  />
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
                  <Textarea
                    placeholder="Could simply be the slogan of your business."
                    className="placeholder:text-sm"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-2">
            <FormLabel>
              Phone Number{" "}
              <span className="text-muted-foreground text-xs font-mono tracking-tighter">
                (for Payments and Notifications)
              </span>
            </FormLabel>
            <ButtonGroup>
              <FormField
                control={form.control}
                name="countryCode"
                render={({ field }) => (
                  <FormItem>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="min-w-[100px] rounded-r-none">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {COUNTRIES.map((country) => (
                          <SelectItem key={country.code} value={country.code}>
                            <div className="flex items-center gap-2">
                              <span>{country.flag}</span>
                              <span>{country.code}</span>
                            </div>
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
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input
                        className="rounded-l-none placeholder:text-sm"
                        placeholder="123456789"
                        type="tel"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </ButtonGroup>
          </div>

          <Button disabled={isPending} type="submit" className="w-full mt-2">
            {isPending ? (
              <div className="flex items-center gap-2">
                <Spinner />
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
            <p className="text-sm text-muted-foreground text-center font-mono tracking-tighter">
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
