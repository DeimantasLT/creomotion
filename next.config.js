/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  // Static export for Vercel hosting of marketing pages
  output: 'export',
  distDir: 'dist',
  // Exclude API routes and dynamic pages from static export
  // These will not be available in the static build
  skipTrailingSlashRedirect: true,
  skipMiddlewareUrlNormalize: true,
};

module.exports = nextConfig;
