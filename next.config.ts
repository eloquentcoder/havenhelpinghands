import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)

const nextConfig: NextConfig = {
  images: {
    // Setting localPatterns restricts EVERY local image, not just the ones
    // listed — so the static brand assets need entries too, or next/image
    // rejects them with "Invalid src prop".
    localPatterns: [
      { pathname: '/api/media/file/**' },
      { pathname: '/media/**' },
      { pathname: '/logo.png' },
      { pathname: '/logo-mark.png' },
    ],
  },
  // Serve uploads at a clean public path. Payload stores them on disk in
  // storage/media and serves them through this route, which reads from disk per
  // request — unlike Next's public folder, whose contents are fixed at startup.
  async rewrites() {
    return [{ source: '/media/:path*', destination: '/api/media/file/:path*' }]
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
  turbopack: {
    root: path.resolve(dirname),
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
