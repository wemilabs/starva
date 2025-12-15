import { Suspense } from "react";
import { ResetPasswordForm } from "@/components/forms/reset-password-form";
import { Skeleton } from "@/components/ui/skeleton";

function ResetPasswordFallback() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <Skeleton className="h-7 w-32 mx-auto" />
        <Skeleton className="h-4 w-48 mx-auto" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="text-center">
        <Skeleton className="h-4 w-48 mx-auto" />
      </div>
      <div className="text-center">
        <Skeleton className="h-3 w-64 mx-auto" />
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="bg-sidebar flex min-h-svh flex-col items-center justify-center gap-6">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Suspense fallback={<ResetPasswordFallback />}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
