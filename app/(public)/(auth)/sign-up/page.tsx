import { SignUpForm } from "@/components/forms/signup-form";

export default function SignUpPage() {
  return (
    <div className="bg-sidebar flex min-h-svh flex-col items-center justify-center gap-6">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <SignUpForm />
      </div>
    </div>
  );
}
