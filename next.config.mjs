/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ['image/avif', 'image/webp'],
    // Next 15 only serves qualities named here. 62 is the working default for
    // photographs: on a phone-sized crop of ink on skin it is indistinguishable
    // from 75 and about a third smaller, which on a 400kbps link is a second
    // per image. 75 stays for the hero, which is the one people judge.
    qualities: [62, 75],
    deviceSizes: [360, 414, 640, 828, 1080, 1280, 1600, 1920],
    imageSizes: [64, 128, 256, 384],
  },
  experimental: {
    optimizePackageImports: ['framer-motion'],
  },
};

export default nextConfig;
