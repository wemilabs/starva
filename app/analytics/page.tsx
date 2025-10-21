import { BarChart3, Sparkles } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-purple-500/20 blur-3xl rounded-full" />
          <div className="relative bg-background/80 backdrop-blur-sm border border-border/50 rounded-2xl p-12 shadow-lg">
            <div className="inline-flex items-center justify-center size-16 rounded-full bg-primary/10 mb-6">
              <BarChart3 className="size-8 text-primary" />
            </div>

            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 text-primary">
                <Sparkles className="size-4" />
                <span className="text-xs font-medium uppercase tracking-wider">
                  Coming Soon
                </span>
              </div>

              <h1 className="text-3xl font-bold tracking-tight">
                Analytics Dashboard
              </h1>

              <p className="text-muted-foreground text-sm leading-relaxed">
                We're building powerful insights and analytics to help you make
                data-driven decisions. Stay tuned for detailed metrics, charts,
                and reports.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
