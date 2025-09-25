"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { getLastUsedLoginMethod, signIn } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { signInUser } from "@/server/users";
import { Badge } from "../ui/badge";

const formSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

export const SignInForm = ({
  className,
  ...props
}: React.ComponentProps<"div">) => {
  const router = useRouter();
  const lastLoginMethod = getLastUsedLoginMethod();

  const [_, startTransition] = useTransition();
  const [isGooglePending, startGoogleTransition] = useTransition();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const response = await signInUser(values.email, values.password);
      if (response.success) {
        toast.success(response.message);
        startTransition(() => {
          router.push("/dashboard");
        });
      } else {
        toast.error(response.message);
      }
    } catch (error: unknown) {
      const e = error as Error;
      console.error(e.message);
      toast.error("Something went wrong. Please try again later.");
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="border-none shadow-none">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome back</CardTitle>
          <CardDescription>Sign in with your Google account</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="flex flex-col gap-6">
                <Button
                  variant="outline"
                  className="relative"
                  onClick={() =>
                    startGoogleTransition(async () => {
                      try {
                        await signIn.social({
                          provider: "google",
                          callbackURL: "/",
                          errorCallbackURL: "/error",
                        });
                      } catch (error: unknown) {
                        const e = error as Error;
                        console.error(e.message);
                        toast.error(
                          "Something went wrong. Please try again later."
                        );
                      }
                    })
                  }
                  type="button"
                  disabled={isGooglePending}
                >
                  {isGooglePending ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="size-4 animate-spin" />
                      Signing in...
                    </div>
                  ) : (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                          fill="currentColor"
                        />
                      </svg>
                      Sign in with Google{" "}
                    </>
                  )}
                  {lastLoginMethod === "google" && (
                    <Badge
                      variant="outline"
                      className="absolute -right-[1.5px] -top-2 bg-primary text-primary-foreground text-[9px] border-none"
                    >
                      last used
                    </Badge>
                  )}
                </Button>

                <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                  <span className="bg-card text-muted-foreground relative z-10 px-2">
                    Or continue with
                  </span>
                </div>

                <div className="grid gap-3">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between">
                          <FormLabel>Email</FormLabel>
                          {lastLoginMethod === "email" && (
                            <Badge
                              variant="outline"
                              className="bg-primary text-primary-foreground text-[9px] border-none"
                            >
                              last used
                            </Badge>
                          )}
                        </div>
                        <FormControl>
                          <Input
                            placeholder="m@example.com"
                            disabled
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid gap-3">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center">
                          <FormLabel>Password</FormLabel>
                          <Link
                            href={"/forgot-password" as Route}
                            className="ml-auto inline-block text-xs underline-offset-4 hover:underline"
                          >
                            Forgot your password?
                          </Link>
                        </div>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="********"
                            disabled
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex flex-col gap-3">
                  <Button
                    type="submit"
                    // disabled={form.formState.isSubmitting}
                    disabled
                  >
                    {form.formState.isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="size-4 animate-spin" /> Signing
                        in...
                      </div>
                    ) : (
                      "Sign in"
                    )}
                  </Button>
                </div>
              </div>
              <div className="mt-4 text-center text-sm">
                Don&apos;t have an account?{" "}
                <Link
                  href={"/sign-up" as Route}
                  className="underline underline-offset-4"
                >
                  Sign up
                </Link>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};
