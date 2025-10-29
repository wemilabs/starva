import { BarChart3, Sparkles } from "lucide-react";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const title = "Analytics Dashboard - Starva";
  const description =
    "Powerful insights and analytics to help you make data-driven decisions. Track sales, monitor performance, and grow your business with detailed metrics and reports.";

  const imageUrl =
    "https://hsl8jk540a.ufs.sh/f/JFF4Q8WebB6dacuUyMdwvZO8oJpYyFEwgT69CVIdltrHUQc7";
  const analyticsUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/analytics`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: analyticsUrl,
      type: "website",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: "Starva app - A sure platform for local businesses and customers to meet. Easy, fast and reliable.",
        },
      ],
      siteName: "Starva",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
    alternates: {
      canonical: analyticsUrl,
    },
  };
}

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="relative">
          <div className="absolute inset-0 bg-linear-to-r from-primary/20 to-purple-500/20 blur-3xl rounded-full" />
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
