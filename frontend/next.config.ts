import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'export',
  images: {
    unoptimized: true,
  },
  // @ts-ignore - Next.js runtime requires this, but the TS types are lagging behind
  allowedDevOrigins: ['10.100.143.56', 'localhost'],
};

export default nextConfig;