import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  outputFileTracingIncludes: {
    '/client-preview/gjl/[[...path]]': ['./private-previews/gjl.bundle.enc'],
  },
  async redirects() {
    return [
      { source: "/concepts/hs-flooring", destination: "/concepts/surefix-interiors", permanent: true },
      { source: "/previews/hs-flooring/index.html", destination: "/previews/surefix-interiors/index.html", permanent: true },
    ];
  },
  async headers() {
    return [{
      source: "/previews/:path*",
      headers: [
        { key: "Access-Control-Allow-Origin", value: "*" },
        { key: "Cross-Origin-Resource-Policy", value: "cross-origin" },
        { key: "X-Robots-Tag", value: "noindex, nofollow" },
        { key: "Content-Security-Policy", value: "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' data: https://fonts.gstatic.com; img-src 'self' data: blob: https:; media-src 'self' blob:; connect-src 'self'; frame-src 'none'; object-src 'none'; form-action 'none'; base-uri 'none'; frame-ancestors 'self'" },
      ],
    }];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i0.wp.com",
      },
    ],
  },
};

export default nextConfig;
