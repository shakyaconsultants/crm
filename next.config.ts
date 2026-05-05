import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Ensure Cloudinary Node SDK is not incorrectly bundled for serverless uploads
  serverExternalPackages: ['cloudinary'],
}

export default nextConfig
