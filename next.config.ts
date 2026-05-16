import type { NextConfig } from "next";

// Reverse-proxying PostHog through our own origin keeps analytics requests
// first-party (improves capture accuracy against ad-blockers and ITP).
// Docs: https://posthog.com/docs/advanced/proxy/nextjs
const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/ingest/static/:path*",
        destination: "https://us-assets.i.posthog.com/static/:path*",
      },
      {
        source: "/ingest/:path*",
        destination: "https://us.i.posthog.com/:path*",
      },
      {
        source: "/ingest/decide",
        destination: "https://us.i.posthog.com/decide",
      },
    ];
  },
  // PostHog uses trailing slashes on some endpoints — keep them intact.
  skipTrailingSlashRedirect: true,
};

export default nextConfig;
