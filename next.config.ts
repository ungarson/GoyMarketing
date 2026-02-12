import type { NextConfig } from "next";

// NOTE:
// Host-conditional rewrites for the titles subdomain of blowup.digital
// These rewrites map:
//  - titles.blowup.digital/        → /titles
//  - titles.blowup.digital/:path*  → /titles/:path*
const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/",
        has: [
          { type: "host", value: "titles.blowup.digital" },
        ],
        destination: "/titles",
      },
      {
        source: "/:path*",
        has: [
          { type: "host", value: "titles.blowup.digital" },
        ],
        destination: "/titles/:path*",
      },
    ];
  },
};

export default nextConfig;
