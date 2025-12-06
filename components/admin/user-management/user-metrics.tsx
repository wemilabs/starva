import { Activity, Eye, TrendingDown, TrendingUp, Users } from "lucide-react";
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { UserMetricsData } from "@/server/admin/user-metrics";

// Metric card component
function MetricCard({
  title,
  value,
  change,
  icon: Icon,
  format = "number",
}: {
  title: string;
  value: number;
  change: number;
  icon: React.ComponentType<{ className?: string }>;
  format?: "number" | "percentage";
}) {
  const isPositive = change > 0;
  const formattedValue =
    format === "percentage" ? `${value}%` : value.toLocaleString();

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{formattedValue}</p>
            <div className="flex items-center mt-1">
              {isPositive ? (
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
              )}
              <span
                className={`text-sm font-medium ${
                  isPositive ? "text-green-500" : "text-red-500"
                }`}
              >
                {isPositive ? "+" : ""}
                {change}%
              </span>
              <span className="text-sm text-muted-foreground ml-1">
                from last period
              </span>
            </div>
          </div>
          <Icon className="h-8 w-8 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  );
}

// Chart component
function ActivityChart({
  data,
}: {
  data: Array<{ hour: string; visitors: number }>;
}) {
  const chartConfig = {
    visitors: {
      label: "Visitors",
      theme: {
        light: "hsl(var(--chart-1))",
        dark: "hsl(var(--chart-1))",
      },
    },
  };

  return (
    <Card>
      <CardHeader>{/* <CardTitle>Activity Over Time</CardTitle> */}</CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ left: 0, right: 0, top: 10, bottom: 0 }}
            >
              <XAxis
                dataKey="hour"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12 }}
                ticks={[
                  "12AM",
                  "3AM",
                  "6AM",
                  "9AM",
                  "12PM",
                  "3PM",
                  "6PM",
                  "9PM",
                ]}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12 }}
                domain={[0, "dataMax + 5"]}
                ticks={[0, 5, 10, 15, 20]}
              />
              <ChartTooltip
                content={<ChartTooltipContent hideLabel indicator="line" />}
                cursor={{
                  stroke: "var(--color-visitors)",
                  strokeWidth: 1,
                  strokeDasharray: "5 5",
                }}
              />
              <Line
                type="monotone"
                dataKey="visitors"
                stroke="var(--color-visitors)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

export function UserMetrics({ metrics }: { metrics: UserMetricsData }) {
  return (
    <div className="space-y-6">
      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          title="Visitors"
          value={metrics.visitors.current}
          change={metrics.visitors.change}
          icon={Users}
        />
        <MetricCard
          title="Page Views"
          value={metrics.pageViews.current}
          change={metrics.pageViews.change}
          icon={Eye}
        />
        <MetricCard
          title="Bounce Rate"
          value={metrics.bounceRate.current}
          change={metrics.bounceRate.change}
          icon={Activity}
          format="percentage"
        />
      </div>

      {/* Activity Chart */}
      <ActivityChart data={metrics.hourlyActivity} />
    </div>
  );
}
