"use client";

import { RealtimeProvider } from "@upstash/realtime/client";

export function UpstashRealtimeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RealtimeProvider>{children}</RealtimeProvider>;
}
