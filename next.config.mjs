/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ['image/avif', 'image/webp'],
    // Next 15 only serves qualities named here, and one entry is the point:
    // every quality is a separate URL and a separate cache entry, so a second
    // value silently doubles the download for any photograph used twice — the
    // hero is also a gallery piece, and asking 75 in one place and 62 in the
    // other fetched the same picture twice. One value makes that impossible.
    //
    // Every <Image> must then pass quality={62} explicitly, because Next's own
    // default is 75 and would be rejected. There are three: Frame, Hero, Crest.
    qualities: [62],
    deviceSizes: [360, 414, 640, 828, 1080, 1280, 1600, 1920],
    imageSizes: [64, 128, 256, 384],
  },
  experimental: {
    optimizePackageImports: ['framer-motion'],
  },
};

export default nextConfig;
