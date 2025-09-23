import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "hsl8jk540a.ufs.sh",
      },
    ],
  },
};

export default nextConfig;
