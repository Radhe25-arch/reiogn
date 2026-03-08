/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',

  // ✅ Fix: moved out of experimental in Next.js 14.2+
  serverExternalPackages: ['@prisma/client', 'bcryptjs', 'ioredis'],

  images: {
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
    dangerouslyAllowSVG: true,
  },

  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [...(config.externals || []), 'bcryptjs', '@prisma/client']
    }
    return config
  },
}

module.exports = nextConfig
