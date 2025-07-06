/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '**'
      },
    ],
  },
  // Add any other existing configuration here
};

export default nextConfig;
