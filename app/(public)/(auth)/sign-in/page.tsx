import { SignInForm } from "@/components/forms/signin-form";

export default function SignInPage() {
  return (
    <div className="bg-sidebar flex min-h-svh flex-col items-center justify-center gap-6">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <SignInForm />
      </div>
    </div>
  );
}
