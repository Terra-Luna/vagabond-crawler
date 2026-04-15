/**
 * Vagabond Crawler — Combat Helpers
 *
 * Shared utilities for combat-related subsystems.
 */

/**
 * Movement mode → ICON key in icons.mjs. `walk` is the fallback.
 * Centralized here so the tracker and the strip pick the same icon.
 */
export const MOVEMENT_MODE_ICON = {
  walk:   "walking",
  fly:    "flying",
  swim:   "swimming",
  climb:  "climbing",
  phase:  "phasing",
  cling:  "clinging",
};

/**
 * Parse a single `system.speedTypes` entry into `{ mode, inlineSpeed }`.
 * Supports both "fly 80" (inline) and "fly" (bare, use speedValues.fly) forms.
 * Returns `null` if the entry is not recognizable.
 */
function _parseSpeedTypeEntry(entry) {
  const raw = String(entry ?? "").trim().toLowerCase();
  if (!raw) return null;
  const [mode, inline] = raw.split(/\s+/);
  if (!mode) return null;
  const n = Number(inline);
  return { mode, inlineSpeed: Number.isFinite(n) && n > 0 ? n : 0 };
}

/**
 * Speed in feet for a specific movement mode on an actor.
 * Walk → `system.speed` (NPCs: number; PCs: `{ base, crawl }` — base branch).
 * Other modes: inline number in `system.speedTypes` if present, else
 * `system.speedValues[mode]`, else walk speed as last-resort fallback
 * (covers legacy data where `speedTypes: ["fly"]` means "fly at base speed").
 * Returns 0 when the mode isn't available on the actor.
 */
export function getSpeedForMode(actor, mode) {
  if (!actor || !mode) return 0;
  const sys = actor.system ?? {};
  if (mode === "walk") {
    const s = sys.speed;
    if (typeof s === "object") return Number(s?.base ?? 0) || 0;
    return Number(s ?? 0) || 0;
  }
  const types  = Array.isArray(sys.speedTypes) ? sys.speedTypes : [];
  const values = sys.speedValues ?? {};
  for (const entry of types) {
    const parsed = _parseSpeedTypeEntry(entry);
    if (!parsed || parsed.mode !== mode) continue;
    if (parsed.inlineSpeed > 0) return parsed.inlineSpeed;
    const sv = Number(values[mode] ?? 0);
    if (sv > 0) return sv;
    // Bare type with no inline and no speedValues — fall back to walk speed.
    return getSpeedForMode(actor, "walk");
  }
  return 0;
}

/**
 * Effective combat movement budget + mode for an actor/token pair.
 *
 * Resolution order:
 *   1. If `tokenDoc.movementAction` is set to a mode the actor has, use it
 *      (GM's explicit override via the token HUD).
 *   2. Otherwise, pick the FASTEST available mode: walk + every entry in
 *      `system.speedTypes`, whichever gives the highest speed.
 *
 * Returns `{ speed, mode }`. Fly-capable creatures default to their fly
 * speed so the tracker and display match how flyers actually move.
 */
export function getEffectiveMovement(actor, tokenDoc = null) {
  if (!actor) return { speed: 0, mode: "walk" };

  // 1. Explicit GM override via token HUD
  const overrideMode = tokenDoc?.movementAction;
  if (overrideMode) {
    const s = getSpeedForMode(actor, overrideMode);
    if (s > 0) return { speed: s, mode: overrideMode };
  }

  // 2. Fastest available mode
  const walkSpeed = getSpeedForMode(actor, "walk");
  let best = { speed: walkSpeed, mode: "walk" };
  const types = Array.isArray(actor.system?.speedTypes) ? actor.system.speedTypes : [];
  for (const entry of types) {
    const parsed = _parseSpeedTypeEntry(entry);
    if (!parsed) continue;
    const s = getSpeedForMode(actor, parsed.mode);
    if (s > best.speed) best = { speed: s, mode: parsed.mode };
  }
  return best;
}

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
