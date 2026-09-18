import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Emit a fully static site into `out/` for CDN hosting on Cloudflare Pages.
  output: "export",
  // The default image loader needs a server, which a static export has none of.
  images: { unoptimized: true },
};

export default nextConfig;
