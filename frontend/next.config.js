/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === "production" ? "https://satyacheck-backend.onrender.com/api" : "http://localhost:4000/api"),
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || (process.env.NODE_ENV === "production" ? "https://satyacheck.mayankiitj.in" : "http://localhost:3000"),
  },
};

module.exports = nextConfig;
