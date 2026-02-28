/**
 * next.config.mjs
 *
 * Next.js configuration for CineNest.
 * - Enables image optimization for Cloudinary domains
 * - Sets up environment variables accessible on client
 * - Configures redirects for SEO
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        // Cloudinary CDN for all theater and gallery images
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        // Placeholder images for development
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
    ],
  },
  // Environment variables exposed to the browser (non-secret only)
  env: {
    NEXT_PUBLIC_APP_NAME: 'CineNest',
    NEXT_PUBLIC_APP_TAGLINE: 'Your Private Theater Experience',
  },
  // Redirect legacy-style paths to canonical paths for SEO
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
