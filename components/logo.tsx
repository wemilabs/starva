export const Logo = () => {
  return (
    <span className="flex items-center gap-1 py-2 rounded-lg">
      <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 justify-center rounded-lg text-lg font-semibold text-center">
        s.
      </div>

      <div className="group-data-[collapsible=icon]:hidden">
        <div className="flex flex-col">
          <span className="font-semibold leading-tight bg-linear-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
            starva
          </span>
          <span className="text-xs font-mono tracking-tighter text-muted-foreground leading-tight">
            .shop
          </span>
        </div>
      </div>
    </span>
  );
};
