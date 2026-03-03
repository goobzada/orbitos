import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Evita warning de workspace root quando há múltiplos package-lock.json na VPS
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
