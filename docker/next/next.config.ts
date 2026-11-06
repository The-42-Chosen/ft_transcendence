import type { NextConfig } from "next";

const serverIp = process.env.SERVER_IP?.trim();

const nextConfig: NextConfig = {
  allowedDevOrigins: serverIp ? [serverIp] : [],
  experimental: {
    agentFeedback: true,
  },
  output: "standalone",
  typescript: { ignoreBuildErrors: false },
};

export default nextConfig;
