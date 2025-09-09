"use client";

import { useRouter } from "next/navigation";

import { SignInForm } from "@/components/forms/signin-form";
import { Logo } from "@/components/logo";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function SignInModal() {
  const router = useRouter();
  return (
    <Dialog
      defaultOpen
      onOpenChange={(open) => {
        if (!open) {
          router.back();
        }
      }}
    >
      <DialogContent
        className="sm:max-w-[425px]"
        aria-description="Sign in to your account"
      >
        <DialogHeader className="hidden">
          <DialogTitle className="self-center">
            <Logo />
          </DialogTitle>
        </DialogHeader>
        <SignInForm />
      </DialogContent>
    </Dialog>
  );
}
