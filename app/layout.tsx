import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { connection } from "next/server";
import "./globals.css";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { extractRouterConfig } from "uploadthing/server";
import { ourFileRouter } from "@/app/api/uploadthing/core";
import { AppSidebar } from "@/components/app-sidebar";
import { Header } from "@/components/header";
import { ThemeProvider } from "@/components/theme-provider";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { BreadcrumbsProvider } from "@/contexts/breadcrumbs-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Starva",
  description:
    "A businesses search engine and suite of tools for customers and solopreneurs.",
};

const baseCrumbs = [{ label: "Home", href: "/" }];

export default async function RootLayout({
  children,
  auth,
}: Readonly<{
  children: React.ReactNode;
  auth: React.ReactNode;
}>) {
  await connection();
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
      </body>
    </html>
  );
}
