import type { NextConfig } from "next";

const serverIp = process.env.SERVER_IP?.trim();

type NextConfigAgentFeedback = NextConfig & {
  experimental?: NonNullable<NextConfig["experimental"] > & {
    agentFeedback?: boolean;
  };
};

const nextConfig: NextConfigAgentFeedback = {
  allowedDevOrigins: serverIp ? [serverIp] : [],
  experimental: {
    agentFeedback: true,
  },
  output: "standalone",
  typescript: { ignoreBuildErrors: false },
};

export default nextConfig;
