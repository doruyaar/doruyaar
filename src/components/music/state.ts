/**
 * Shared store between scroll (GSAP) and the 2D canvas renderer.
 * GSAP writes, the render loop reads and smooths.
 */
export const musicState = {
  /** 0 = hero, 1 = noise, 2 = rhythm, 3 = harmony, 4 = performance, 5 = ambient, 6 = coda */
  shape: 0,
  opacity: 1,
  velocity: 0,
  /**
   * Where the coda wave sits, in units of viewport height; 0 until measured.
   * `MusicStory` parks it in the gap between the contact CTA and the footer,
   * so the wave passes under the mail address instead of through it.
   */
  codaCy: 0,
};

export const MUSIC_SHAPES = 7;
