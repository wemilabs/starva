import { ourFileRouter } from "@/app/api/uploadthing/core";
import { AppSidebar } from "@/components/app-sidebar";
import { Header } from "@/components/header";
import { ThemeProvider } from "@/components/theme-provider";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { BreadcrumbsProvider } from "@/contexts/breadcrumbs-context";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { extractRouterConfig } from "uploadthing/server";
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
  title: "starva - The Right Place for Local Commerce",
  description:
    "A sure platform for local businesses and customers to meet. Easy, fast and reliable.",
  metadataBase: new URL("https://starva.vercel.app/"),
  keywords: [
    "starva",
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
    url: "https://starva.vercel.app/",
    title: "starva - The Right Place for Local Commerce",
    description:
      "A sure platform for local businesses and customers to meet. Easy, fast and reliable.",
    siteName: "Starva",
    images: [
      {
        url: "https://hsl8jk540a.ufs.sh/f/JFF4Q8WebB6dacuUyMdwvZO8oJpYyFEwgT69CVIdltrHUQc7",
        width: 1200,
        height: 630,
        alt: "Starva app - A sure platform for local businesses and customers to meet. Easy, fast and reliable.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "starva - The Right Place for Local Commerce",
    description:
      "A sure platform for local businesses and customers to meet. Easy, fast and reliable.",
    images: [
      "https://hsl8jk540a.ufs.sh/f/JFF4Q8WebB6dacuUyMdwvZO8oJpYyFEwgT69CVIdltrHUQc7",
    ],
    creator: "@DorianTho5",
  },
};

const baseCrumbs = [{ label: "Home", href: "/" }];

export default async function RootLayout({
  children,
  auth,
}: Readonly<{
  children: React.ReactNode;
  auth: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.className} ${geistMono.variable} antialiased`}
      >
        <NextSSRPlugin routerConfig={extractRouterConfig(ourFileRouter)} />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {auth}
          <BreadcrumbsProvider>
            <SidebarProvider>
              <AppSidebar />
              <SidebarInset>
                <Header baseCrumbs={baseCrumbs} />
                <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
                  <NuqsAdapter>{children}</NuqsAdapter>
                </main>
              </SidebarInset>
            </SidebarProvider>
          </BreadcrumbsProvider>
          <Toaster richColors />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
