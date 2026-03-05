import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "remotejobbay.com" }],
        destination: "https://www.remotejobbay.com/:path*",
        permanent: true,
      },
      {
        source: "/login",
        destination: "/auth",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
