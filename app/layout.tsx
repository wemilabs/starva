import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Suspense } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { BreadcrumbManager } from "@/components/breadcrumb-manager";
import { Header } from "@/components/header";
import { HeaderSkeleton } from "@/components/header-skeleton";
import { QueryProvider } from "@/components/query-client-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { UploadThingProvider } from "@/components/uploadthing-provider";
import { BreadcrumbsProvider } from "@/contexts/breadcrumbs-context";
import { GENERAL_BRANDING_IMG_URL } from "@/lib/constants";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "The Right Place for Local Commerce - Starva.shop",
  description: "Search. Shop. Smile.",
  metadataBase: new URL("https://starva.shop/"),
  keywords: [
    "starva",
    "Starva.shop",
    "business",
    "customer",
    "meeting",
    "local business",
    "local customer",
    "business customer",
    "food",
    "fast-food",
    "restaurant",
    "dress-up",
    "clothing",
    "housing",
    "real-estate",
    "rental",
    "rental property",
    "jewelry",
    "cars",
  ],
  authors: [
    {
      name: "Mr T",
      url: "https://cuttypiedev.vercel.app/",
    },
  ],
  creator: "Mr T",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://starva.shop/",
    title: "The Right Place for Local Commerce - Starva.shop",
    description: "Search. Shop. Smile.",
    siteName: "Starva.shop",
    images: [
      {
        url: GENERAL_BRANDING_IMG_URL,
        width: 1200,
        height: 630,
        alt: "Starva.shop - Search. Shop. Smile.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Right Place for Local Commerce - Starva.shop",
    description: "Search. Shop. Smile.",
    images: [GENERAL_BRANDING_IMG_URL],
    creator: "@DorianTho5",
  },
};

export default async function RootLayout(props: LayoutProps<"/">) {
  const { children, auth } = props;
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.className} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {auth}
          <QueryProvider>
            <BreadcrumbsProvider>
              <SidebarProvider>
                <AppSidebar />
                <SidebarInset>
                  <Suspense fallback={<HeaderSkeleton />}>
                    <Header />
                  </Suspense>
                  <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
                    <Suspense fallback={null}>
                      <BreadcrumbManager />
                    </Suspense>
                    <NuqsAdapter>
                      <Suspense>
                        <UploadThingProvider />
                      </Suspense>
                      {children}
                    </NuqsAdapter>
                  </main>
                </SidebarInset>
              </SidebarProvider>
            </BreadcrumbsProvider>
            <Toaster richColors />
          </QueryProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
