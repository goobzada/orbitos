import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Garante que o Next.js use o diretório correto como root
  // (evita confusão com package-lock.json em /home/orbit/)
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
