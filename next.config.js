/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'github.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'p16-sign-va.tiktokcdn.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'yt3.ggpht.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'upcdn.io',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'replicate.delivery',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'pbxt.replicate.delivery',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'vidnarrate.com',
        pathname: '**',
      },
    ],
  },
  eslint: {
    // Disable ESLint checks during production builds
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Disable type checking during production builds
    ignoreBuildErrors: true,
  },
  experimental: {
    serverComponentsExternalPackages: [
      '@react-email/components',
      '@react-email/render',
      '@react-email/tailwind'
    ]
  }
}

module.exports = nextConfig
