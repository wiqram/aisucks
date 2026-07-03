import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  allowedDevOrigins: ['127.0.0.1', 'localhost'],
  // Pin the Turbopack workspace root to this project (Next can otherwise
  // mis-infer it in a multi-project IdeaProjects tree and fail to resolve modules).
  turbopack: { root: import.meta.dirname }
};

export default nextConfig;
