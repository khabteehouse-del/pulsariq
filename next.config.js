/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: { serverActions: { bodySizeLimit: "50mb" } },
  experimental: { serverActions: { bodySizeLimit: "50mb" } },
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  images: { remotePatterns: [{ protocol: "https", hostname: "*.supabase.co" }] },
  webpack: (config) => { config.resolve.alias.canvas = false; return config; },
};
module.exports = nextConfig;
