import { Check, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn, formatPrice } from "@/lib/utils";
import { Spinner } from "../ui/spinner";

interface PricingCardProps {
  name: string;
  description: string;
  price: number | null;
  originalPrice: number | null;
  period: string;
  features: readonly string[];
  highlighted?: boolean;
  cta: string;
  onSelect?: () => void;
  isLoading?: boolean;
  isCurrentPlan?: boolean;
}

export function PricingCard({
  name,
  description,
  price,
  originalPrice,
  period,
  features,
  highlighted = false,
  cta,
  onSelect,
  isLoading = false,
  isCurrentPlan = false,
}: PricingCardProps) {
  const discountPercentage =
    originalPrice && price
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : 0;

  return (
    <Card
      className={cn(
        "relative flex flex-col h-full transition-all duration-300 hover:shadow-lg",
        highlighted && "border-primary shadow-lg ring-2 ring-primary/20"
      )}
    >
      {highlighted && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <Badge className="gap-1 px-3 py-1 text-xs font-semibold">
            <Sparkles className="size-3" />
            Most Popular
          </Badge>
        </div>
      )}

      {discountPercentage > 0 && (
        <div className="absolute -top-3 -right-3">
          <Badge
            variant="destructive"
            className="rounded-full px-3 py-1 text-xs"
          >
            Save {discountPercentage}%
          </Badge>
        </div>
      )}

      <CardHeader className="text-center pb-6">
        <CardTitle className="text-xl md:text-2xl font-medium">
          {name}
        </CardTitle>
        <CardDescription className="font-mono tracking-tighter line-clamp-2">
          {description}
        </CardDescription>

        <div className="mt-4 flex flex-col items-center gap-1">
          {originalPrice && (
            <p className="text-sm text-muted-foreground line-through">
              {formatPrice(originalPrice)}
            </p>
          )}
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-medium tracking-tight">
              {price === null ? "Custom" : formatPrice(price)}
            </span>
            {price !== null && price > 0 && (
              <span className="text-muted-foreground font-mono tracking-tighter">
                /{period}
              </span>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 pt-6 border-t">
        <ul className="space-y-2">
          {features.map((feature) => (
            <li key={feature} className="flex items-start gap-2">
              <Check
                className={cn(
                  "size-5 shrink-0 mt-0.5",
                  highlighted ? "text-primary" : "text-muted-foreground"
                )}
              />
              <span
                className={cn(
                  "text-sm",
                  feature.includes("Everything in")
                    ? "font-semibold"
                    : "text-muted-foreground font-mono tracking-tighter"
                )}
              >
                {feature}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter className="pt-6">
        <Button
          className="w-full"
          size="lg"
          variant={highlighted ? "default" : "outline"}
          onClick={onSelect}
          disabled={isLoading || isCurrentPlan}
        >
          {isCurrentPlan ? (
            "Current Plan"
          ) : isLoading ? (
            <>
              <Spinner />
              Processing...
            </>
          ) : (
            cta
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
