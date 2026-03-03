import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Garante que o Next.js saiba que o root do projeto é aqui
  // e não a pasta pai /home/orbit que tem outro package-lock.json
  outputFileTracingRoot: path.join(__dirname),

  // Silencia erros de TypeScript no build (a checagem TS da core-api
  // não deve bloquear o build do Next.js — elas têm tsconfigs separados)
  typescript: {
    ignoreBuildErrors: false,
  },

  // Ignora erros de ESLint no build de produção
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
