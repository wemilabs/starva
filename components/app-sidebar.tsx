"use client";

import Link from "next/link";
import {
  AudioWaveform,
  BookOpenText,
  // Bot,
  CircleQuestionMark,
  Clock,
  Command,
  Frame,
  GalleryVerticalEnd,
  LifeBuoy,
  LogIn,
  Map as MapIcon,
  PieChart,
  Send,
  // Settings2,
  // SquareTerminal,
  Star,
} from "lucide-react";

import { useSession } from "@/lib/auth-client";
import { Logo } from "@/components/logo";
// import { TeamSwitcher } from "@/components/team-switcher";
import { NavMain } from "@/components/nav-main";
// import { NavProjects } from "@/components/nav-projects";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenuButton,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { NavSecondary } from "@/components/nav-secondary";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// This is sample data.
const data = {
  teams: [
    {
      name: "Starva Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Starva Inc.",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Starva Pvt.",
      logo: Command,
      plan: "Free",
    },
  ],
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
    // {
    //   title: "Settings",
    //   url: "#",
    //   icon: Settings2,
    //   items: [
    //     {
    //       title: "General",
    //       url: "#",
    //     },
    //     {
    //       title: "Team",
    //       url: "#",
    //     },
    //     {
    //       title: "Billing",
    //       url: "#",
    //     },
    //     {
    //       title: "Limits",
    //       url: "#",
    //     },
    //   ],
    // },
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
          <Logo isSidebarCollapsed={sidebarState === "collapsed"} />
        </Link>
        {/* <TeamSwitcher teams={data.teams} /> */}
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
