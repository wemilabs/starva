import { Clock, DollarSign, ShoppingCart, TrendingUp } from "lucide-react";
import { formatPriceInRWF } from "@/lib/utils";

interface MetricsCardsProps {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  peakHour: number;
  peakHourOrders: number;
}

export function MetricsCards({
  totalOrders,
  totalRevenue,
  averageOrderValue,
  peakHour,
  peakHourOrders,
}: MetricsCardsProps) {
  const formatHour = (hour: number) => {
    const period = hour >= 12 ? "PM" : "AM";
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:00 ${period}`;
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        icon={ShoppingCart}
        label="Total Orders"
        value={totalOrders.toString()}
        className="border-blue-200 dark:border-blue-900"
      />
      <MetricCard
        icon={DollarSign}
        label="Total Revenue"
        value={formatPriceInRWF(totalRevenue)}
        className="border-emerald-200 dark:border-emerald-900"
      />
      <MetricCard
        icon={TrendingUp}
        label="Average Order Value"
        value={formatPriceInRWF(averageOrderValue)}
        className="border-purple-200 dark:border-purple-900"
      />
      <MetricCard
        icon={Clock}
        label="Peak Hour"
        value={formatHour(peakHour)}
        subValue={`${peakHourOrders} orders`}
        className="border-orange-200 dark:border-orange-900"
      />
    </div>
  );
}

interface MetricCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  subValue?: string;
  className?: string;
}

function MetricCard({
  icon: Icon,
  label,
  value,
  subValue,
  className,
}: MetricCardProps) {
  return (
    <div className={`rounded-xl border-2 bg-card p-4 shadow-sm ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-mono tracking-tighter text-muted-foreground">
          {label}
        </p>
        <Icon className="size-4 text-muted-foreground" />
      </div>
      <div>
        <p className="text-2xl font-semibold tracking-tight">{value}</p>
        {subValue && (
          <p className="text-xs text-muted-foreground font-mono tracking-tighter mt-1">
            {subValue}
          </p>
        )}
      </div>
    </div>
  );
}
