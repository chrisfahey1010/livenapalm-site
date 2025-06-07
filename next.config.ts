import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "livenapalm-photos.s3.us-west-2.amazonaws.com",
        port: "",        // leave blank
        pathname: "/**", // allow any path under the bucket
      },
    ],
  },
};

export default nextConfig;
