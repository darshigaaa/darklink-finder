import type { NextConfig } from 'next'

const config: NextConfig = {
  // This tells Vercel to ignore any linting errors during the build process.
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default config;
