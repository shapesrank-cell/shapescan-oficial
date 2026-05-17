import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Aumenta o limite do body de API Routes para 5MB
  // (necessário para receber fotos em base64)
  serverExternalPackages: [],
  experimental: {
    serverActions: {
      bodySizeLimit: "5mb",
    },
  },
};

export default nextConfig;
