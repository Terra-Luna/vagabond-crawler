/**
 * Vagabond Crawler — Flanking Checker
 *
 * Automatic flanking detection during combat.
 * If 2+ allied tokens are Close (within 5 ft) to a foe, and the foe is
 * no more than one size larger than the allies, the foe is Vulnerable.
 *
 * Bidirectional: heroes can flank NPCs and NPCs can flank heroes.
 * Only the GM client runs the evaluation to avoid race conditions.
 *
 * Uses actor flag `flankedBy` to track flanking-applied Vulnerable so
 * we never remove Vulnerable that was applied by other means.
 */

import { MODULE_ID } from "./vagabond-crawler.mjs";

// ── Size hierarchy ──────────────────────────────────────────────────────────

const SIZE_ORDER = { small: 0, medium: 1, large: 2, huge: 3, giant: 4, colossal: 5 };

function _getSizeValue(actor) {
  if (!actor) return 1; // default medium
  // Characters: actor.system.attributes.size
  // NPCs:       actor.system.size
  const key = actor.system?.attributes?.size ?? actor.system?.size ?? "medium";
  return SIZE_ORDER[key] ?? 1;
}

// ── Distance helpers ────────────────────────────────────────────────────────

/**
 * Edge-to-edge Chebyshev distance between two tokens in feet.
 * Supports multi-square tokens (Large 2×2, Huge 3×3, etc.).
 */
function _distanceFt(tokenA, tokenB) {
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

// ── Flanking Checker ────────────────────────────────────────────────────────

export const FlankingChecker = {

  _debounceTimer: null,

  init() {
    // Re-evaluate flanking whenever any token moves
    Hooks.on("updateToken", (doc, changes) => {
      if (!game.user.isGM || !game.combat) return;
      if (!game.settings.get(MODULE_ID, "flankingEnabled")) return;
      if (changes.x === undefined && changes.y === undefined) return;
      this._scheduleEvaluate();
    });

    // Also catch token refreshes (v13 animated/ruler movement may not fire updateToken reliably)
    Hooks.on("refreshToken", (token) => {
      if (!game.user.isGM || !game.combat) return;
      if (!game.settings.get(MODULE_ID, "flankingEnabled")) return;
      this._scheduleEvaluate();
    });

    // Evaluate when combat starts
    Hooks.on("combatStart", () => this._scheduleEvaluate());

    // Evaluate on turn/round changes
    Hooks.on("updateCombat", (combat, changes) => {
      if (changes.round !== undefined || changes.turn !== undefined) {
        this._scheduleEvaluate();
      }
    });

    // Re-evaluate when a combatant is added or removed
    Hooks.on("createCombatant", () => this._scheduleEvaluate());
    Hooks.on("deleteCombatant", () => this._scheduleEvaluate());

    // Re-evaluate when a combatant is defeated/undefeated
    Hooks.on("updateCombatant", (combatant, changes) => {
      if (changes.defeated !== undefined) this._scheduleEvaluate();
    });

    // Clean up all flanking Vulnerable when combat ends
    Hooks.on("deleteCombat", () => this._cleanupAll());
  },

  // ── Scheduling ────────────────────────────────────────────────────────────

  _scheduleEvaluate() {
    if (!game.user.isGM) return;
    clearTimeout(this._debounceTimer);
    this._debounceTimer = setTimeout(() => this._evaluate(), 250);
  },

  // ── Core evaluation ───────────────────────────────────────────────────────

  async _evaluate() {
    if (!game.user.isGM || !game.combat) return;
    if (!game.settings.get(MODULE_ID, "flankingEnabled")) return;

    // Gather all non-defeated combat tokens on the canvas
    const combatTokens = [];
    for (const c of game.combat.combatants) {
      if (c.defeated) continue;
      const token = canvas.tokens?.get(c.tokenId);
      if (!token?.actor) continue;
      combatTokens.push(token);
    }

    // For each token, determine if it should be flanked
    for (const target of combatTokens) {
      const targetDisp = target.document.disposition;
      const targetSize = _getSizeValue(target.actor);

      // Find all enemies within 5 ft
      let closeEnemyCount = 0;
      let smallestEnemySize = Infinity;

      for (const other of combatTokens) {
        if (other.id === target.id) continue;
        // Must be opposed disposition
        if (other.document.disposition === targetDisp) continue;
        // Must be Close (adjacent — bounding boxes touching or overlapping)
        if (_distanceFt(target, other) > 0) continue;

        closeEnemyCount++;
        const otherSize = _getSizeValue(other.actor);
        if (otherSize < smallestEnemySize) smallestEnemySize = otherSize;
      }

      // Flanking: 2+ enemies close AND foe no more than one size larger than allies
      const shouldBeFlanked = closeEnemyCount >= 2 && targetSize <= smallestEnemySize + 1;
      const currentlyFlanked = !!target.actor.getFlag(MODULE_ID, "flankedBy");

      if (shouldBeFlanked && !currentlyFlanked) {
        await this._applyFlanked(target.actor);
      } else if (!shouldBeFlanked && currentlyFlanked) {
        await this._removeFlanked(target.actor);
      }
    }
  },

  // ── Apply / Remove ────────────────────────────────────────────────────────

  /** The ActiveEffect data for Vulnerable (Flanked) with full mechanical changes. */
  _makeEffectData() {
    return {
      name:     "Vulnerable (Flanked)",
      img:      "icons/svg/downgrade.svg",
      statuses: ["vulnerable"],
      origin:   `module.${MODULE_ID}.flanking`,
      changes: [
        { key: "system.favorHinder",              mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE, value: "hinder" },
        { key: "system.incomingAttacksModifier",   mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE, value: "favor"  },
        { key: "system.outgoingSavesModifier",     mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE, value: "favor"  },
      ],
    };
  },

  async _applyFlanked(actor) {
    await actor.setFlag(MODULE_ID, "flankedBy", true);
    // Only apply if we haven't already created the flanking effect
    const existing = actor.effects.find(e => e.origin === `module.${MODULE_ID}.flanking`);
    if (!existing) {
      await actor.createEmbeddedDocuments("ActiveEffect", [this._makeEffectData()]);
    }
  },

  async _removeFlanked(actor) {
    const hadFlag = !!actor.getFlag(MODULE_ID, "flankedBy");
    await actor.unsetFlag(MODULE_ID, "flankedBy");
    // Only remove the effect we created (matched by origin)
    if (hadFlag) {
      const effect = actor.effects.find(e => e.origin === `module.${MODULE_ID}.flanking`);
      if (effect) {
        await effect.delete();
      }
    }
  },

  // ── Cleanup ───────────────────────────────────────────────────────────────

  async _cleanupAll() {
    if (!game.user.isGM) return;
    // Remove flanking Vulnerable from all actors that have the flag
    for (const actor of game.actors) {
      if (actor.getFlag(MODULE_ID, "flankedBy")) {
        await this._removeFlanked(actor);
      }
    }
  },
};
