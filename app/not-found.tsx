import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { NotFoundRouteForm } from "@/components/forms/notfound-route-form";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { NOTFOUND_PAGE_IMG_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "404 Not Found | Starva.shop",
  description: "The page you're looking for doesn't exist.",
};

export default function NotFound() {
  return (
    <Empty>
      <EmptyHeader>
        <Image
          src={NOTFOUND_PAGE_IMG_URL}
          alt="404 Not Found"
          width={200}
          height={200}
          className="rounded-md"
        />
        <EmptyTitle>404 - Not Found</EmptyTitle>
        <EmptyDescription>
          The page you&apos;re looking for doesn&apos;t exist.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <NotFoundRouteForm />
        <EmptyDescription>
          Need help? <Link href="/support">Contact support</Link>
        </EmptyDescription>
      </EmptyContent>
    </Empty>
  );
}
