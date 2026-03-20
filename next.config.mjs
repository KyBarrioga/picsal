/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    localPatterns: [
      {
        pathname: "/gallery/**",
      },
      {
        pathname: "/static/imgs/**",
        pathname: "/static/**",
      },
    ],
  },
};

export default nextConfig;
