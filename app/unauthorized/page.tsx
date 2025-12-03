import { ShieldX } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="mx-auto flex max-w-md flex-col items-center text-center">
        <div className="mb-4 rounded-full bg-red-100 p-3">
          <ShieldX className="size-10 text-red-600" />
        </div>
        <h1 className="mb-2 text-2xl font-medium">Access Denied</h1>
        <p className="mb-6 text-muted-foreground font-mono tracking-tighter text-sm">
          You don't have permission to access this page. Please contact an
          administrator if you believe this is an error.
        </p>
        <Button asChild>
          <Link href="/">Go to Home</Link>
        </Button>
      </div>
    </div>
  );
}
