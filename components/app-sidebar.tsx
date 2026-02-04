"use client";

import {
  CircleQuestionMark,
  CreditCard,
  HandCoins,
  LogIn,
  Send,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import { StoreSwitcher } from "@/components/store-switcher";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenuButton,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { useSession } from "@/lib/auth-client";

const data = {
  navMain: [
    {
      title: "Point of Sales",
      url: "#",
      icon: HandCoins,
      items: [
        {
          title: "Orders",
          url: "/point-of-sales/orders",
        },
        {
          title: "Inventory",
          url: "/point-of-sales/inventory",
        },
        {
          title: "Analytics",
          url: "/point-of-sales/analytics",
        },
        {
          title: "Wallet",
          url: "/point-of-sales/wallet",
        },
      ],
    },
    {
      title: "Usage",
      url: "#",
      icon: CreditCard,
      items: [
        {
          title: "Billing",
          url: "/usage/billing",
        },
        {
          title: "Pricing",
          url: "/usage/pricing",
        },
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings,
      items: [
        {
          title: "General",
          url: "/settings",
        },
        {
          title: "Team",
          url: "#",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "About",
      url: "#",
      icon: CircleQuestionMark,
    },
    // {
    //   title: "Blog",
    //   url: "#",
    //   icon: BookOpenText,
    // },
    // {
    //   title: "Support",
    //   url: "#",
    //   icon: LifeBuoy,
    // },
    {
      title: "Feedback",
      url: "/feedback",
      icon: Send,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession();
  const user = session?.user;
  const { state: sidebarState } = useSidebar();

  return (
    <Sidebar collapsible="icon" variant="inset" {...props}>
      <SidebarHeader>
        <Link href="/">
          <Logo />
        </Link>

        <StoreSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        {user ? (
          <NavUser user={user} />
        ) : sidebarState === "collapsed" ? (
          <SidebarMenuButton
            asChild
            tooltip="Sign in"
            className="w-full bg-primary text-primary-foreground"
          >
            <Link href="/sign-in" className="flex items-center gap-2">
              <LogIn />
              <span>Sign in</span>
            </Link>
          </SidebarMenuButton>
        ) : (
          <Card className="border border-dashed border-muted-foreground/50 bg-sidebar">
            <CardContent className="flex flex-col gap-2">
              <p className="text-xs text-muted-foreground text-center font-mono tracking-tighter">
                Start this pleasant and better experience
              </p>
              <Button
                asChild
                className="w-full bg-primary text-primary-foreground"
              >
                <Link href="/sign-in" className="flex items-center gap-2">
                  <LogIn />
                  <span>Sign in</span>
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
