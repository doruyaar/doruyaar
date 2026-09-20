import type { NextConfig } from "next";

// Set by the GitHub Pages workflow from `actions/configure-pages`. It is ""
// for a user site and "/<repo>" for a project site; unset everywhere else.
const basePath = process.env.PAGES_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  // Emit a fully static site into `out/` for CDN hosting on Cloudflare Pages.
  output: "export",
  // The default image loader needs a server, which a static export has none of.
  images: { unoptimized: true },
  basePath,
  // `next/image` never prefixes `src` with `basePath`, so `asset()` does it by
  // hand and needs the value inlined into the client bundle.
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
};

export default nextConfig;
