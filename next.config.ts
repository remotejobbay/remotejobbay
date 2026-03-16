import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allows Next.js to load images from your Supabase bucket
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ozwpvhnivymheuhgleqx.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/**", 
      },
    ],
  },
  
  // Your existing redirects
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