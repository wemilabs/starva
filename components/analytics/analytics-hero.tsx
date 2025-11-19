import { BarChart3, Sparkles } from "lucide-react";

export const AnalyticsHero = ({ planName }: { planName: string }) => {
  return (
    <div className="max-w-3xl mx-auto text-center space-y-6">
      <div className="inline-flex items-center gap-2 rounded-full border bg-muted/60 px-3 py-1 text-xs font-mono tracking-tighter text-muted-foreground">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        <span>Analytics preview</span>
        <span className="text-[10px] uppercase tracking-wider border-l pl-2 ml-2">
          Current plan: {planName}
        </span>
      </div>

      <div className="relative mt-4">
        <div className="absolute inset-0 bg-linear-to-r from-primary/20 to-purple-500/20 blur-3xl rounded-full" />
        <div className="relative bg-background/80 backdrop-blur-sm border border-border/50 rounded-2xl p-10 shadow-lg">
          <div className="inline-flex items-center justify-center size-16 rounded-full bg-primary/10 mb-6">
            <BarChart3 className="size-8 text-primary" />
          </div>

          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 text-primary">
              <Sparkles className="size-4" />
              <span className="text-xs font-medium uppercase tracking-wider">
                Analytics Dashboard
              </span>
            </div>

            <h1 className="text-3xl font-medium tracking-tight">
              Understand how your business is performing
            </h1>

            <p className="text-muted-foreground text-sm leading-relaxed font-mono tracking-tighter">
              Free plan gives you a quick pulse. Growth and Pro unlock deeper
              trends, breakdowns, and multi-business insights.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
