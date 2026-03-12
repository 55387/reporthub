import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Enable image optimization for external sources if needed
  images: {
    remotePatterns: [],
  },
  // Suppress hydration warnings for theme switching
  reactStrictMode: true,
};

export default nextConfig;
