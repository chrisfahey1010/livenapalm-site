import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  reactStrictMode: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "live.staticflickr.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
