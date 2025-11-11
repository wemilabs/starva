import { Sparkles, TrendingUp } from "lucide-react";
import type { Metadata } from "next";
import { GENERAL_BRANDING_IMG_URL } from "@/lib/constants";

export async function generateMetadata(): Promise<Metadata> {
  const title = "Trends & Insights - Starva";
  const description =
    "Discover what's trending in your area and gain valuable insights into customer preferences and market patterns.";

  const trendsUrl = `${
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  }/trends`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: trendsUrl,
      type: "website",
      images: [
        {
          url: GENERAL_BRANDING_IMG_URL,
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
      images: [GENERAL_BRANDING_IMG_URL],
    },
    alternates: {
      canonical: trendsUrl,
    },
  };
}

export default function TrendsPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="relative">
          <div className="absolute inset-0 bg-linear-to-r from-primary/20 to-purple-500/20 blur-3xl rounded-full" />
          <div className="relative bg-background/80 backdrop-blur-sm border border-border/50 rounded-2xl p-12 shadow-lg">
            <div className="inline-flex items-center justify-center size-16 rounded-full bg-primary/10 mb-6">
              <TrendingUp className="size-8 text-primary" />
            </div>

            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 text-primary">
                <Sparkles className="size-4" />
                <span className="text-xs font-medium uppercase tracking-wider">
                  Coming Soon
                </span>
              </div>

              <h1 className="text-3xl font-medium tracking-tight">
                Trends & Insights
              </h1>

              <p className="text-muted-foreground text-sm leading-relaxed font-mono tracking-tighter">
                Discover what's trending in your area and gain valuable insights
                into customer preferences and market patterns coming soon.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
