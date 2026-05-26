import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // allowedDevOrigins: ["192.168.68.66"],
  output: 'export',
  images: {
    unoptimized: true
  }
};

export default nextConfig;