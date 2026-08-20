import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Produces `.next/standalone` output that can be shipped without the full source repo.
  // Note: this is NOT true source protection (JS can be reverse-engineered), but it's a clean deploy artifact.
  // output: "standalone",
  // Disable Server Components HMR cache to prevent stale data
  experimental: {
    serverComponentsHmrCache: false, // defaults to true
    // Rewrites barrel imports to the underlying module (`@classytic/fluid/formkit`
    // is a 44-module barrel, `/document` 14) so a route only compiles what it
    // actually names. Most of our fluid imports are already granular subpaths,
    // so this is a modest win, not a rescue.
    optimizePackageImports: ["@classytic/fluid"],
  },
  output: "standalone",
  // `fluid` consumes host-provided base UI components, so the host bundler has
  // to resolve those imports against this app's module graph.
  transpilePackages: ["@classytic/fluid"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
