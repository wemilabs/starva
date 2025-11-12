import { Warehouse } from "lucide-react";
import { redirect } from "next/navigation";
import { verifySession } from "@/data/user-session";
import { InventoryContent } from "./inventory-content";

export async function InventoryPageWrapper() {
  const sessionData = await verifySession();

  if (!sessionData.success || !sessionData.session) {
    redirect("/sign-in");
  }

  const activeOrgId = sessionData.session.session.activeOrganizationId;

  if (!activeOrgId) {
    return (
      <div className="py-12">
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          <Warehouse className="size-16 text-muted-foreground" />
          <div>
            <h2 className="text-2xl font-semibold">No Active Organization</h2>
            <p className="text-muted-foreground mt-2">
              Please select or create an organization to manage inventory.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <InventoryContent activeOrgId={activeOrgId} />;
}
