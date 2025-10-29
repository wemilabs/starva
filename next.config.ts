import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  devIndicators: {
    position: "top-left",
  },
  experimental: {
    turbopackFileSystemCacheForDev: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "hsl8jk540a.ufs.sh",
      },
    ],
  },
  reactCompiler: true,
  typedRoutes: true,
};

export default nextConfig;
