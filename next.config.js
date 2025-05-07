/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    YOUTUBE_API_KEY: process.env.YOUTUBE_API_KEY,
  },
};

module.exports = nextConfig; 