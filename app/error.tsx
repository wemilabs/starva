"use client";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <Empty>
      <EmptyHeader>
        <Image
          src="https://hsl8jk540a.ufs.sh/f/JFF4Q8WebB6db6Se9J5oPvMdz2Zcih1tWnNrgmwjYaRqfCuK"
          alt="Error occurred"
          width={200}
          height={200}
          className="rounded-md"
        />
        <EmptyTitle>Something went wrong!</EmptyTitle>
        <EmptyDescription>
          We encountered an unexpected error. Please try again or contact
          support if the problem persists.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button onClick={reset} variant="default">
            Try again
          </Button>
          <Button asChild variant="outline">
            <Link href="/">Let&apos;s go Home buddy</Link>
          </Button>
        </div>
        <EmptyDescription className="text-xs">
          Error ID: {error.digest || "unknown"}
        </EmptyDescription>
        <EmptyDescription>
          Need help? <Link href="/support">Contact support</Link>
        </EmptyDescription>
      </EmptyContent>
    </Empty>
  );
}
