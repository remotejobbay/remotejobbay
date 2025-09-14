import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "remotejobbay.com" }], // redirect non-www → www
        destination: "https://www.remotejobbay.com/:path*",
        permanent: true,
      },
      {
        source: "/:path*",
        has: [{ type: "host", value: "http://:path*" }], // redirect http → https
        destination: "https://www.remotejobbay.com/:path*",
        permanent: true,
      },
      {
        source: "/login",
        destination: "/auth",
        permanent: true, // 301 redirect for /login → /auth
      },
    ];
  },
};

export default nextConfig;