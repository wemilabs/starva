import { cn } from "@/lib/utils";

export const Logo = ({
  isSidebarCollapsed,
}: {
  isSidebarCollapsed?: boolean;
}) => {
  return (
    <span className="flex items-center gap-2 py-2 rounded-lg">
      <span className="text-2xl bg-primary rounded-lg">🥘</span>
      <span
        className={cn(
          "font-mono font-bold text-lg",
          isSidebarCollapsed ? "hidden" : ""
        )}
      >
        starva
      </span>
    </span>
  );
};
