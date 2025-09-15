"use client";

import {
  BookOpenText,
  // Bot,
  CircleQuestionMark,
  Clock,
  Frame,
  LifeBuoy,
  LogIn,
  Map as MapIcon,
  PieChart,
  Send,
  Settings,
  // SquareTerminal,
  Star,
} from "lucide-react";
import Link from "next/link";

import { BusinessSwitcher } from "@/components/business-switcher";
import { Logo } from "@/components/logo";
import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
// import { NavProjects } from "@/components/nav-projects";
import { NavUser } from "@/components/nav-user";
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

// This is sample data.
const data = {
  navMain: [
    // {
    //   title: "Playground",
    //   url: "#",
    //   icon: SquareTerminal,
    //   isActive: true,
    //   items: [
    //     {
    //       title: "History",
    //       url: "#",
    //     },
    //     {
    //       title: "Starred",
    //       url: "#",
    //     },
    //     {
    //       title: "Settings",
    //       url: "#",
    //     },
    //   ],
    // },
    {
      title: "History",
      url: "#",
      icon: Clock,
      items: [
        {
          title: "Genesis",
          url: "#",
        },
        {
          title: "Explorer",
          url: "#",
        },
        {
          title: "Quantum",
          url: "#",
        },
      ],
    },
    {
      title: "Favorites",
      url: "#",
      icon: Star,
      items: [
        {
          title: "Genesis",
          url: "#",
        },
        {
          title: "Explorer",
          url: "#",
        },
        {
          title: "Quantum",
          url: "#",
        },
      ],
    },
    // {
    //   title: "Documentation",
    //   url: "#",
    //   icon: BookOpen,
    //   items: [
    //     {
    //       title: "Introduction",
    //       url: "#",
    //     },
    //     {
    //       title: "Get Started",
    //       url: "#",
    //     },
    //     {
    //       title: "Tutorials",
    //       url: "#",
    //     },
    //     {
    //       title: "Changelog",
    //       url: "#",
    //     },
    //   ],
    // },
    {
      title: "Settings",
      url: "#",
      icon: Settings,
      items: [
        {
          title: "General",
          url: "#",
        },
        {
          title: "Team",
          url: "#",
        },
        {
          title: "Billing",
          url: "#",
        },
        {
          title: "Limits",
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
    {
      title: "Blog",
      url: "#",
      icon: BookOpenText,
    },
    {
      title: "Support",
      url: "#",
      icon: LifeBuoy,
    },
    {
      title: "Feedback",
      url: "#",
      icon: Send,
    },
  ],
  projects: [
    {
      name: "Design Engineering",
      url: "#",
      icon: Frame,
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Travel",
      url: "#",
      icon: MapIcon,
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

        <BusinessSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {/* <NavProjects projects={data.projects} /> */}
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
          <Card className="border border-dashed bg-sidebar">
            <CardContent className="flex flex-col gap-2">
              <p className="text-xs text-muted-foreground text-center">
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
