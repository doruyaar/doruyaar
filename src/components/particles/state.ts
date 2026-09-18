/**
 * Tiny shared store between the scroll (GSAP) side and the render (R3F)
 * side. GSAP tweens these numbers; useFrame reads them every frame.
 */
export const particleState = {
  /** 0 = name, 1 = chaos, 2 = warehouse, 3 = network, 4 = 3D graph, 5 = ambient, 6 = initials */
  shape: 0,
  opacity: 1,
  /** Horizontal offset (world units) so shapes sit beside text on desktop. */
  offsetX: 0,
  /** Scroll velocity feed for a bit of extra turbulence. */
  velocity: 0,
};

export const SHAPE_COUNT = 7;
