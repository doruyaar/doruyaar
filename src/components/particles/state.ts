/**
 * Tiny shared store between the scroll (GSAP) side and the render (R3F)
 * side. GSAP tweens these numbers; useFrame reads them every frame.
 */
export const particleState = {
  /** 0 = name, 1 = chaos, 2 = warehouse, 3 = network, 4 = 3D graph, 5 = ambient, 6 = initials */
  shape: 0,
  opacity: 1,
  /** Horizontal offset (world units) so shapes sit beside text on landscape screens. */
  offsetX: 0,
  /** Scroll velocity feed for a bit of extra turbulence. */
  velocity: 0,
  /**
   * Landscape screens: while a story stage is pinned the shapes sit to the
   * right of the copy column; the scene keeps them clear of it and inside
   * the screen, shrinking them on short/narrow landscape screens (phones).
   */
  landscape: {
    /** Right edge of the copy column, fraction of the viewport width (measured). */
    textRight: 0.38,
    /** 0 → 1: how much the shapes should sit beside the copy right now. */
    beside: 0,
  },
  /**
   * Portrait screens (phones, tablets held upright): the copy sits at the
   * bottom of each screen and the particles must stay above it. The story
   * measures the free zone and describes it here; the scene positions and
   * scales the shapes to fit. All fractions are of the viewport.
   */
  portrait: {
    /** Vertical centre of the shapes, fraction of the viewport height from the top. */
    centerY: 0.3,
    /** Box the shapes must fit into, fractions of viewport width / height. */
    boxW: 0.9,
    boxH: 0.35,
    /** Nominal extent (world units) of the shape being shown, for fitting. */
    shapeW: 13,
    shapeH: 7,
    /**
     * 0 → 1: ignore the box and show the shape at full size instead, like
     * landscape does - the ambient backdrop behind the work sections must
     * cover the whole screen, not fit into the story's free band.
     */
    cover: 0,
  },
};

export const SHAPE_COUNT = 7;
