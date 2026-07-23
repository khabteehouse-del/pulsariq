/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  experimental: { serverActions: { bodySizeLimit: "50mb" } },
  images: { remotePatterns: [{ protocol: "https", hostname: "*.supabase.co" }] },
  webpack: (config) => { config.resolve.alias.canvas = false; return config; },
};
module.exports = nextConfig;
