"use client";

import { Check, ChevronsUpDown, Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  const [dialogOpen, setDialogOpen] = useState(false);
  const [value, setValue] = useState("");
  const { data: businesses } = useListOrganizations();
  const { isMobile, state: sidebarState } = useSidebar();
  // const { data: activeBusiness } = useActiveOrganization();
  const { data: session } = useSession();

  const userId = session?.session?.userId;

  // const handleBusinessChange = async (organizationId: string) => {};

  // TODO: Once we hover a business, the ordered number changes to edit and delete icons, like the list in windsurf board

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
              {(() => {
                const selected = businesses?.find((b) => b.name === value);
                const label = selected?.name ?? "Select business...";
                return (
                  <div className="flex w-full items-center gap-2">
                    <Avatar className="size-6">
                      <AvatarImage
                        src={
                          (selected?.logo as string | undefined) ?? undefined
                        }
                        alt={selected?.name ?? "Business logo"}
                      />
                      <AvatarFallback>
                        {(selected?.name ?? "B").slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="truncate group-data-[collapsible=icon]:hidden">
                      {label}
                    </span>
                    <ChevronsUpDown className="ml-auto opacity-50 group-data-[collapsible=icon]:hidden size-4" />
                  </div>
                );
              })()}
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
                        href={`/businesses/${business.slug}`}
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
                          <div className="flex w-full items-center gap-2">
                            <Avatar className="size-6">
                              <AvatarImage
                                src={
                                  (business.logo as string | undefined) ??
                                  undefined
                                }
                                alt={business.name}
                              />
                              <AvatarFallback>
                                {business.name.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="truncate">{business.name}</span>
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
                          </div>
                        </CommandItem>
                      </Link>
                    ))}
                </CommandGroup>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem className="pt-1.5 pb-0 px-0">
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-muted-foreground hover:text-muted-foreground"
                          onClick={() => setDialogOpen(true)}
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
                        <RegisterBusinessForm
                          onSuccess={() => setDialogOpen(false)}
                        />
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
