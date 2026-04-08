/**
 * Vagabond Crawler — Combat Helpers
 *
 * Shared utilities for combat-related subsystems.
 */

/**
 * Chebyshev (grid) distance in feet between two tokens, accounting for
 * bounding-box size.  Returns 0 when boxes touch or overlap (adjacent).
 */
export function distanceFt(tokenA, tokenB) {
  const scene = canvas.scene;
  if (!scene) return Infinity;
  const gridSize = scene.grid?.size ?? 100;
  const gridDist = scene.grid?.distance ?? 5;

  const ax = tokenA.document.x / gridSize;
  const ay = tokenA.document.y / gridSize;
  const aw = tokenA.document.width;
  const ah = tokenA.document.height;

  const bx = tokenB.document.x / gridSize;
  const by = tokenB.document.y / gridSize;
  const bw = tokenB.document.width;
  const bh = tokenB.document.height;

  // Gap between bounding boxes in grid squares (0 = touching/overlapping)
  const gapX = Math.max(0, Math.max(ax, bx) - Math.min(ax + aw, bx + bw));
  const gapY = Math.max(0, Math.max(ay, by) - Math.min(ay + ah, by + bh));

  return Math.max(gapX, gapY) * gridDist;
}
