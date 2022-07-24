/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['ui-avatars.com', 'flagcdn.com'],
  },
  swcMinify: false,
}

module.exports = nextConfig
