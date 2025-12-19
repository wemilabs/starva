import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  experimental: { typedEnv: true },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "hsl8jk540a.ufs.sh",
      },
    ],
  },
  reactCompiler: true,
  serverExternalPackages: ["prettier"], // This package is required by @react-email/components, so we externalize it instead of installing it as a dependency
  typedRoutes: true,
};

export default nextConfig;
