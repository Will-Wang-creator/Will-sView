import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["sql.js"],
  outputFileTracingIncludes: {
    "/api/**/*": ["./node_modules/sql.js/dist/**"],
  },
};

export default nextConfig;
