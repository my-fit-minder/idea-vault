/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',  // Enable static export for S3/CloudFront deployment
  images: {
    unoptimized: true,  // Required for static export
  },
  trailingSlash: true,  // Better for S3 static website hosting
}

module.exports = nextConfig
