import { ProtectedImage } from "@/components/ui/protected-image";

export const Logo = () => {
  return (
    <div className="flex items-center py-2 rounded-lg">
      <ProtectedImage
        src="https://hsl8jk540a.ufs.sh/f/JFF4Q8WebB6du5UdXxlTLMJtliDeN9nXqzs57GUH6RgZbryB"
        alt="Logo"
        width={200}
        height={200}
        className="size-12 object-cover rounded-lg"
      />

      <div className="group-data-[collapsible=icon]:hidden">
        <div className="flex flex-col">
          <span className="font-semibold leading-tight bg-linear-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
            starva
          </span>
          <span className="text-xs font-mono tracking-tighter text-muted-foreground">
            .shop
          </span>
        </div>
      </div>
    </div>
  );
};
