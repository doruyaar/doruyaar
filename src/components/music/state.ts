/**
 * Shared store between scroll (GSAP) and the 2D canvas renderer.
 * GSAP writes, the render loop reads and smooths.
 */
export const musicState = {
  /** 0 = hero, 1 = noise, 2 = rhythm, 3 = harmony, 4 = performance, 5 = ambient, 6 = coda */
  shape: 0,
  opacity: 1,
  velocity: 0,
};

export const MUSIC_SHAPES = 7;
