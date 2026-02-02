import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['@coinbase/onchainkit'],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
      },
    ],
  },
  webpack: (config, { isServer }) => {
    // Ignore optional React Native dependencies that are not needed in browser
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        '@react-native-async-storage/async-storage': false,
        'pino-pretty': false,
      };
    }
    return config;
  },
};

export default nextConfig;
