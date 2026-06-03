import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      "bruneltalentmarketplace.com",
      "placehold.co",
      "static.wixstatic.com",
      "media.licdn.com",
    ],
  },

  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
}

export default nextConfig;
