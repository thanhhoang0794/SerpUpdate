/** @type {import('next').NextConfig} */
const { version } = require('./package.json')

const nextConfig = {
  reactStrictMode: false,
  output: 'standalone',
  trailingSlash: false,
  publicRuntimeConfig: {
    version
  },
  images: {
    domains: ['www.google.com', 'icons.duckduckgo.com']
  },
  experimental: {
    optimizePackageImports: ['@chakra-ui/react']
  },

  rewrites: () => [
    {
      source: '/admin/:path*',
      destination: '/api/admin/:path*'
    }
  ],
  env: {
    NEXT_PUBLIC_APP_URL: process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : String(process.env.NEXT_PUBLIC_APP_URL)?.includes('https')
        ? process.env.NEXT_PUBLIC_APP_URL
        : 'http://localhost:3000'
  },
  async headers() {
    return [
      {
        // matching all API routes
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          {
            key: 'Access-Control-Allow-Headers',
            value:
              'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
          }
        ]
      }
    ]
  }
}

module.exports = nextConfig
