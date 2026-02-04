import { Lock, Warehouse } from "lucide-react";
import Link from "next/link";
import { verifySession } from "@/data/user-session";
import { Button } from "../ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "../ui/empty";
import { InventoryContent } from "./inventory-content";

export async function InventoryPageWrapper() {
  const sessionData = await verifySession();

  if (!sessionData.success)
    return (
      <Empty className="min-h-[400px]">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Lock className="size-6" />
          </EmptyMedia>
          <EmptyTitle>You are not yet signed in</EmptyTitle>
          <EmptyDescription className="font-mono tracking-tighter">
            Sign in first to access this service
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button asChild size="sm" className="w-full">
            <Link href="/sign-in">
              <span>Sign In</span>
            </Link>
          </Button>
        </EmptyContent>
      </Empty>
    );

  const activeOrgId = sessionData.session.session?.activeOrganizationId;

  if (!activeOrgId)
    return (
      <Empty className="min-h-[400px]">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Warehouse className="size-6" />
          </EmptyMedia>
          <EmptyTitle>No active stores</EmptyTitle>
          <EmptyDescription className="font-mono tracking-tighter">
            Please select or create a store from the top store switcher, to
            manage inventory.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          The store switcher is located at the top of the sidebar, right below
          the logo.
        </EmptyContent>
      </Empty>
    );

  return <InventoryContent activeOrgId={activeOrgId} />;
}
