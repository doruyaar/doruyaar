import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Emit a fully static site into `out/` for CDN hosting on Cloudflare Pages.
  output: "export",
  // The default image loader needs a server, which a static export has none of.
  images: { unoptimized: true },
  // Set by the GitHub Pages workflow from `actions/configure-pages`. It is ""
  // for a user site and "/<repo>" for a project site; unset everywhere else.
  basePath: process.env.PAGES_BASE_PATH,
};

export default nextConfig;
