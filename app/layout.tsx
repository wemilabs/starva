import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { AppSidebar } from "@/components/app-sidebar";
import { ModeToggle } from "@/components/mode-toggle";
import { NavBreadcrumbs } from "@/components/nav-breadcrumbs";
import { ThemeProvider } from "@/components/theme-provider";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { BreadcrumbsProvider } from "@/contexts/breadcrumbs-context";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/header";

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

export default function RootLayout({
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
                {/* <header className="flex h-16 shrink-0 items-center gap-2 px-4 justify-between transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 sticky top-0 z-10 border-b rounded-lg bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/50">
                  <div className="flex items-center gap-2">
                    <SidebarTrigger className="-ml-1" />
                    <Separator
                      orientation="vertical"
                      className="mr-2 data-[orientation=vertical]:h-4"
                    />
                    <NavBreadcrumbs base={baseCrumbs} />
                  </div>
                  <div className="flex items-center gap-2">
                  <ModeToggle />
                  <Button asChild size="sm">
                  <Link href="/sign-in">
                    <span>Sign In</span>
                  </Link>
                </Button>
                  </div>
                </header> */}
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
