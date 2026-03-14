import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow images from any source for news thumbnails
  images: { unoptimized: true },
};

export default nextConfig;
