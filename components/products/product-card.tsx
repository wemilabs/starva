import { Heart, Users } from "lucide-react";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";

type ProductCardProps = {
  id: number;
  name: string;
  image: string;
  price: number;
  description: string;
  likes: number;
  orderedXTimes: number;
  itemFrom: {
    name: string;
    image: string;
  };
};

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

export function ProductCard({
  name,
  image,
  price,
  description,
  likes,
  orderedXTimes,
  itemFrom,
}: ProductCardProps) {
  return (
    <Card className="group relative overflow-hidden p-0">
      <div className="relative aspect-[16/9]">
        <Image
          src={image}
          alt={name}
          fill
          priority
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-black/70 via-black/30 to-transparent" />
      </div>
      <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
        <div className="mb-2 flex items-center justify-between gap-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[10px] font-medium tracking-wide text-white/90 ring-1 ring-white/15 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-orange-400" />
            {itemFrom.name}
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[10px] font-medium tracking-wide text-white/90 ring-1 ring-white/15 backdrop-blur-sm">
            {new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "RWF",
              maximumFractionDigits: 0,
            }).format(price)}
          </div>
        </div>
        <h3 className="text-balance text-xl font-semibold leading-tight">
          {name}
        </h3>
        <p className="mt-2 max-w-[46ch] text-xs text-white/80">{description}</p>
        <div className="mt-4 flex items-center justify-between">
          <div className="inline-flex items-center gap-2 rounded-full bg-black/30 ring-1 ring-white/10 backdrop-blur-sm">
            <Avatar className="size-9 ring-1 ring-white/20">
              <AvatarImage
                src={itemFrom.image}
                alt={itemFrom.name}
                className="object-cover"
              />
              <AvatarFallback className="text-muted-foreground text-xs">
                {getInitials(itemFrom.name)}
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-black/30 px-2.5 py-1 text-white/90 ring-1 ring-white/10 backdrop-blur-sm">
              <Users className="size-3.5" aria-hidden="true" />
              <span className="text-[11px]">{orderedXTimes}</span>
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-black/30 px-2.5 py-1 text-white/90 ring-1 ring-white/10 backdrop-blur-sm">
              <Heart className="size-3.5" aria-hidden="true" />
              <span className="text-[11px]">{likes}</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
