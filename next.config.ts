import type { NextConfig } from "next";

// NOTE:
// Host-conditional rewrites for the tricks subdomain of blowup.digital
// These rewrites map:
//  - tricks.blowup.digital/        → /tricks
//  - tricks.blowup.digital/:path*  → /tricks/:path*
const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/",
        has: [
          { type: "host", value: "tricks.blowup.digital" },
        ],
        destination: "/tricks",
      },
      {
        source: "/:path*",
        has: [
          { type: "host", value: "tricks.blowup.digital" },
        ],
        destination: "/tricks/:path*",
      },
    ];
  },
};

export default nextConfig;
