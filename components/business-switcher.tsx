"use client";

import { Check, ChevronsUpDown, Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  useActiveOrganization,
  useListOrganizations,
  useSession,
} from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { RegisterBusinessForm } from "./forms/register-business-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "./ui/sidebar";

export function BusinessSwitcher() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const { data: businesses } = useListOrganizations();
  const { isMobile, state: sidebarState } = useSidebar();
  // const { data: activeBusiness } = useActiveOrganization();
  const { data: session } = useSession();

  const userId = session?.session?.userId;

  // const handleBusinessChange = async (organizationId: string) => {};

  // TODO: add logo for business so when collapsed sidebar it shows the logo

  return (
    <SidebarMenu className="group-data-[collapsible=icon]:mt-4">
      <SidebarMenuItem>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <SidebarMenuButton
              size="lg"
              role="combobox"
              aria-expanded={open}
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground justify-between"
            >
              {value
                ? businesses?.find((business) => business.name === value)?.name
                : "Select business..."}
              <ChevronsUpDown className="opacity-50 group-data-[collapsible=icon]:hidden" />
            </SidebarMenuButton>
          </PopoverTrigger>
          <PopoverContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg p-1"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <Command>
              <CommandInput placeholder="Search business..." className="h-9" />
              <CommandList>
                <CommandEmpty>No business found.</CommandEmpty>
                <CommandGroup>
                  {userId &&
                    businesses?.map((business, index) => (
                      <Link
                        key={business.id}
                        href={`/business/${business.slug}`}
                      >
                        <CommandItem
                          value={business.name}
                          onSelect={(currentValue) => {
                            setValue(
                              currentValue === value ? "" : currentValue
                            );
                            setOpen(false);
                          }}
                          className="py-2.5"
                        >
                          {business.name}
                          <Check
                            className={cn(
                              "ml-auto",
                              value === business.name
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          <span className="text-muted-foreground text-xs">
                            ⌘{index + 1}
                          </span>
                        </CommandItem>
                      </Link>
                    ))}
                </CommandGroup>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem className="pt-1.5 pb-0 px-0">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-muted-foreground hover:text-muted-foreground"
                        >
                          <div className="border rounded-md p-1">
                            <Plus className="size-4" />
                          </div>
                          Add business
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Register Business</DialogTitle>
                          <DialogDescription>
                            Register a new business to get started.
                          </DialogDescription>
                        </DialogHeader>
                        <RegisterBusinessForm />
                      </DialogContent>
                    </Dialog>
                  </CommandItem>
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
