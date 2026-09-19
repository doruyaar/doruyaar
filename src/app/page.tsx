import ParticlesPage from "./particles/page";

/**
 * Temporary: land on concept 01 until a concept is chosen.
 * Rendered directly rather than redirected so the root URL serves real HTML -
 * a static export can only perform `redirect()` client-side, which leaves
 * `/` blank for crawlers and link previews.
 */
export default ParticlesPage;
