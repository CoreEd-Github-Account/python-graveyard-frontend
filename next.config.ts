import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Produces a minimal, self-contained .next/standalone build that the
  // Docker image copies instead of the full node_modules folder -
  // dramatically smaller image, faster deploys. Only affects `next build`
  // output; `next dev` behaves exactly as before.
  output: "standalone",
};

export default nextConfig;