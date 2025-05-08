/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    YOUTUBE_API_KEY: process.env.YOUTUBE_API_KEY,
  },
  images: {
    domains: ['img.youtube.com', 'i.ytimg.com'],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('sqlite3');
    }
    return config;
  },
  experimental: {
    serverComponentsExternalPackages: ['sqlite3']
  }
};

module.exports = nextConfig; 