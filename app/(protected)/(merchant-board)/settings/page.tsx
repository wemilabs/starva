import { Lock, Warehouse } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AccountSettings } from "@/components/settings/account-settings";
import { DangerZone } from "@/components/settings/danger-zone";
import { StoreSettings } from "@/components/settings/store-settings";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { verifySession } from "@/data/user-session";
import { GENERAL_BRANDING_IMG_URL } from "@/lib/constants";
import { getOrganizationDetails } from "@/server/organizations";

export const metadata: Metadata = {
  title: "Settings - Starva.shop",
  description: "Manage your account and store preferences.",
  keywords: [
    "settings",
    "account settings",
    "store settings",
    "preferences",
    "account management",
    "store management",
    "user settings",
    "organization settings",
    "profile settings",
    "user preferences",
    "store preferences",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://Starva.shop/settings",
    title: "Settings - Starva.shop",
    description: "Manage your account and store preferences.",
    siteName: "Starva.shop",
    images: [
      {
        url: GENERAL_BRANDING_IMG_URL,
        width: 1200,
        height: 630,
        alt: "Starva.shop - Settings",
      },
    ],
  },
};

async function SettingsContent() {
  const sessionData = await verifySession();

  if (!sessionData.success || !sessionData.session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6">
        <Empty className="max-w-md w-full">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Lock className="size-6" />
            </EmptyMedia>
            <EmptyTitle>You are not yet signed in</EmptyTitle>
            <EmptyDescription className="font-mono tracking-tighter">
              Sign in first to access settings.
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
      </div>
    );
  }

  const userId = sessionData.session.user?.id;
  const activeOrgId = sessionData.session.session?.activeOrganizationId;

  if (!activeOrgId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6">
        <Empty className="max-w-md w-full">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Warehouse className="size-6" />
            </EmptyMedia>
            <EmptyTitle>No active store</EmptyTitle>
            <EmptyDescription className="font-mono tracking-tighter">
              Please select or create a store from the top store switcher, to
              access settings.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            The store switcher is located at the top of the sidebar, right below
            the logo.
          </EmptyContent>
        </Empty>
      </div>
    );
  }

  const { slug: activeOrgSlug = "", metadata } =
    (await getOrganizationDetails(activeOrgId)) || {};
  const currentTimezone =
    (typeof metadata === "string" ? JSON.parse(metadata) : metadata)
      ?.timezone || "Africa/Kigali";

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-8">
      <div>
        <h1 className="text-2xl font-medium tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-0.5 text-sm text-pretty font-mono tracking-tighter">
          Manage your account and store preferences.
        </p>
      </div>
      <div className="space-y-8">
        <StoreSettings
          orgId={activeOrgId}
          orgSlug={activeOrgSlug}
          initialTimezone={currentTimezone}
        />
        <AccountSettings />
        <DangerZone userId={userId} />
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full md:w-3xl mx-auto py-6 space-y-8">
          <div>
            <h1 className="text-2xl font-medium tracking-tight">Settings</h1>
            <p className="text-muted-foreground mt-0.5 text-sm text-pretty font-mono tracking-tighter">
              Manage your account and store preferences.
            </p>
          </div>
          <div className="space-y-8">
            <div className="border rounded-lg p-6 space-y-2">
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <Skeleton className="size-4" />
                  <Skeleton className="h-6 w-64" />
                </div>
                <Skeleton className="h-4 w-full max-w-md mt-2" />
              </div>
              <div className="space-y-3 pt-4">
                <div>
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-4 w-48" />
                </div>
                <Skeleton className="h-10 w-full max-w-md" />
                <div className="flex gap-2">
                  <Skeleton className="h-9 w-28" />
                  <Skeleton className="h-9 w-16" />
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-6 space-y-6">
              <div className="flex items-center gap-2">
                <Skeleton className="size-4" />
                <Skeleton className="h-6 w-40" />
              </div>
              <Skeleton className="h-4 w-full max-w-lg" />
            </div>

            <div className="border border-red-200 rounded-lg p-6 space-y-6">
              <div className="flex items-center gap-2">
                <Skeleton className="size-4" />
                <Skeleton className="h-6 w-32" />
              </div>
              <div className="space-y-6">
                <div className="border border-orange-200 rounded-lg p-4 space-y-4">
                  <div className="flex items-center gap-2">
                    <Skeleton className="size-4" />
                    <Skeleton className="h-5 w-32" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-10 w-32" />
                </div>
                <div className="border border-red-200 rounded-lg p-4 space-y-4">
                  <div className="flex items-center gap-2">
                    <Skeleton className="size-4" />
                    <Skeleton className="h-5 w-32" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-10 w-32" />
                </div>
              </div>
            </div>
          </div>
        </div>
      }
    >
      <SettingsContent />
    </Suspense>
  );
}
