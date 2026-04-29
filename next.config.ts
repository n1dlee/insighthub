import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Security headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options",           value: "DENY" },
          { key: "X-Content-Type-Options",     value: "nosniff" },
          { key: "Referrer-Policy",            value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy",         value: "camera=(), microphone=(), geolocation=()" },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",   // needed by Next.js dev
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https:",
              "connect-src 'self' ws: wss: https://newsapi.org https://*.pusher.com wss://*.pusher.com https://*.pusherapp.com",
            ].join("; "),
          },
        ],
      },
    ];
  },

  // Images: allow Vercel Blob and other external sources
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "https", hostname: "*.blob.vercel-storage.com" },
    ],
  },

  // Production: don't expose source maps
  productionBrowserSourceMaps: false,

  // Turbopack (dev) — enabled via CLI flag only

};

export default nextConfig;
