/**
 * Base path the site is served under - "" at the domain root, "/doruyaar" on
 * GitHub Pages. Inlined at build time by the `env` key in `next.config.ts`.
 */
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/**
 * Points a `public/` path at the current deployment. `next/link` applies
 * `basePath` by itself, but `next/image` leaves `src` alone, so anything handed
 * to it has to come through here or it 404s once the site moves off the root.
 */
export function asset(path: string) {
  return path.startsWith("/") ? `${BASE_PATH}${path}` : path;
}
