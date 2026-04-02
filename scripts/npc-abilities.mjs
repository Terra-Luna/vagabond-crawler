/**
 * NPC Passive Abilities — Automation hooks for monster abilities
 *
 * Extensible system: add entries to PASSIVE_ABILITIES keyed by the exact
 * ability name string found in actor.system.abilities[].name.
 *
 * Currently implemented:
 *   - Magic Ward I   — d4 penalty baked into Cast Check rolls
 *   - Magic Ward II  — d6 penalty (future-proof)
 *   - Magic Ward III — d8 penalty (future-proof)
 *
 * Also patches the system's missing target-modifier check for spell casts
 * (Vulnerable incomingAttacksModifier → Favor on cast checks).
 */

const MODULE_ID = "vagabond-crawler";

/* ──────────────────────────────────────────────────────────────────────────────
 * PASSIVE ABILITIES TABLE
 * ──────────────────────────────────────────────────────────────────────────── */

const PASSIVE_ABILITIES = {
  "Magic Ward I": {
    type: "castPenalty",
    penaltyDie: "1d4",
    label: "Magic Ward I",
  },
  "Magic Ward II": {
    type: "castPenalty",
    penaltyDie: "1d6",
    label: "Magic Ward II",
  },
  "Magic Ward III": {
    type: "castPenalty",
    penaltyDie: "1d8",
    label: "Magic Ward III",
  },
  "Pack Instincts": { type: "packInstincts" },
  "Pack Tactics":   { type: "packInstincts" },
};

/* ──────────────────────────────────────────────────────────────────────────────
 * HELPERS
 * ──────────────────────────────────────────────────────────────────────────── */

function getPassiveAbilities(actor, type) {
  const abilities = actor?.system?.abilities;
  if (!Array.isArray(abilities)) return [];

  const matches = [];
  for (const ability of abilities) {
    const def = PASSIVE_ABILITIES[ability.name];
    if (def && def.type === type) {
      matches.push(def);
    }
  }
  return matches;
}

function strongestCastPenalty(penalties) {
  if (!penalties.length) return null;
  const dieOrder = { "1d4": 1, "1d6": 2, "1d8": 3, "1d10": 4, "1d12": 5 };
  return penalties.reduce((best, cur) =>
    (dieOrder[cur.penaltyDie] ?? 0) > (dieOrder[best.penaltyDie] ?? 0) ? cur : best
  );
}

function getActiveWardFromTargets() {
  const targets = game.user?.targets;
  if (!targets?.size) return null;

  let allPenalties = [];
  for (const token of targets) {
    const actor = token.actor;
    if (!actor) continue;
    const p = getPassiveAbilities(actor, "castPenalty");
    if (p.length) allPenalties.push(...p);
  }
  return strongestCastPenalty(allPenalties);
}

/**
 * Check all current targets for incomingAttacksModifier and adjust
 * the caster's favorHinder accordingly.  Mirrors item.mjs logic for
 * weapon attacks, but the system never does this for spell casts.
 */
function applyTargetModifiers(favorHinder) {
  for (const token of game.user.targets) {
    const mod = token.actor?.system?.incomingAttacksModifier;
    if (!mod || mod === "none") continue;

    console.log(`${MODULE_ID} | Target "${token.name}" incomingAttacksModifier = "${mod}"`);

    if (mod === "favor") {
      if (favorHinder === "hinder") favorHinder = "none";
      else if (favorHinder === "none") favorHinder = "favor";
    } else if (mod === "hinder") {
      if (favorHinder === "favor") favorHinder = "none";
      else if (favorHinder === "none") favorHinder = "hinder";
    }
  }
  return favorHinder;
}

/* ──────────────────────────────────────────────────────────────────────────────
 * MAGIC WARD + VULNERABLE — INLINE ROLL INJECTION
 *
 * Strategy:
 *   1. Wrap SpellHandler.prototype.castSpell to set a module-scope flag
 *      so we know the next d20 roll is a Cast Check.
 *   2. Wrap VagabondRollBuilder.buildAndEvaluateD20WithRollData to:
 *      a) Check targets for incomingAttacksModifier → adjust favor/hinder
 *      b) Check targets for Magic Ward → inject penalty die into formula
 * ──────────────────────────────────────────────────────────────────────────── */

/** Module-scope flag: true while a Cast Check roll is in progress. */
let _isCastCheck = false;

/** Allow external callers (e.g. crawl-strip spell dialog) to bracket
 *  their own cast-check rolls with the same flag.                    */
export function setCastCheckFlag(val) { _isCastCheck = !!val; }

export function registerNpcAbilityHooks() {
  _wrapSystemClasses();
  _registerPackInstinctsCleanup();
  console.log(`${MODULE_ID} | NPC ability hooks registered (Magic Ward, Pack Instincts).`);
}

/** @deprecated Alias kept for backwards-compat — prefer registerNpcAbilityHooks(). */
export { registerNpcAbilityHooks as registerMagicWardHook };

async function _wrapSystemClasses() {
  // ── 1. Import the system classes ──────────────────────────────────────────
  let SpellHandler, VagabondRollBuilder;
  try {
    ({ SpellHandler } = await import(
      "../../../systems/vagabond/module/sheets/handlers/_module.mjs"
    ));
    ({ VagabondRollBuilder } = await import(
      "../../../systems/vagabond/module/helpers/roll-builder.mjs"
    ));
  } catch (err) {
    console.error(`${MODULE_ID} | Cast-check wrap: failed to import system classes`, err);
    return;
  }

  if (!SpellHandler?.prototype?.castSpell) {
    console.error(`${MODULE_ID} | SpellHandler.prototype.castSpell not found — cannot wrap`);
    return;
  }
  if (!VagabondRollBuilder?.buildAndEvaluateD20WithRollData) {
    console.error(`${MODULE_ID} | RollBuilder.buildAndEvaluateD20WithRollData not found — cannot wrap`);
    return;
  }

  // ── 2. Wrap SpellHandler.prototype.castSpell ──────────────────────────────
  const origCastSpell = SpellHandler.prototype.castSpell;
  SpellHandler.prototype.castSpell = async function (event, target) {
    _isCastCheck = true;
    console.log(`${MODULE_ID} | castSpell wrapper: _isCastCheck = true`);
    try {
      return await origCastSpell.call(this, event, target);
    } finally {
      _isCastCheck = false;
    }
  };
  console.log(`${MODULE_ID} | ✓ Wrapped SpellHandler.castSpell`);

  // ── 3. Wrap VagabondRollBuilder.buildAndEvaluateD20WithRollData ───────────
  const origBuild = VagabondRollBuilder.buildAndEvaluateD20WithRollData;
  VagabondRollBuilder.buildAndEvaluateD20WithRollData = async function (
    rollData,
    favorHinder,
    baseFormula = null
  ) {
    console.log(`${MODULE_ID} | buildAndEvaluateD20WithRollData wrapper called — _isCastCheck=${_isCastCheck}, favorHinder="${favorHinder}"`);

    if (_isCastCheck) {
      // ── A. Target incomingAttacksModifier (Vulnerable, etc.) ──────────
      const origFH = favorHinder;
      favorHinder = applyTargetModifiers(favorHinder);
      if (favorHinder !== origFH) {
        console.log(`${MODULE_ID} | Favor/Hinder adjusted: "${origFH}" → "${favorHinder}" (target modifier)`);
      }

      // ── B. Magic Ward penalty die ─────────────────────────────────────
      const ward = getActiveWardFromTargets();
      if (ward) {
        const dice = CONFIG.VAGABOND?.homebrew?.dice;
        const base = baseFormula ?? dice?.baseCheck ?? "1d20";
        baseFormula = `${base} - ${ward.penaltyDie}[${ward.label}]`;

        const targetNames = Array.from(game.user.targets)
          .filter((t) => getPassiveAbilities(t.actor, "castPenalty").length > 0)
          .map((t) => t.name)
          .join(", ");

        ui.notifications.info(
          `${ward.label}: Cast Check penalised by ${ward.penaltyDie} (${targetNames})`
        );
        console.log(`${MODULE_ID} | Magic Ward: formula="${baseFormula}"`);
      }
    }

    return origBuild.call(this, rollData, favorHinder, baseFormula);
  };
  console.log(`${MODULE_ID} | ✓ Wrapped RollBuilder.buildAndEvaluateD20WithRollData`);

  // ── 4. Wrap VagabondChatCard.npcAction for Pack Instincts ────────────────
  //    Works from both actor sheet clicks AND crawl strip action menu.
  let VagabondChatCard;
  try {
    ({ VagabondChatCard } = await import(
      "../../../systems/vagabond/module/helpers/chat-card.mjs"
    ));
  } catch (err) {
    console.warn(`${MODULE_ID} | Could not import VagabondChatCard — Pack Instincts wrap skipped`, err);
  }
  if (VagabondChatCard?.npcAction) {
    const origNpcAction = VagabondChatCard.npcAction;
    VagabondChatCard.npcAction = async function (actor, action, actionIndex, targetsAtRollTime = []) {
      await applyPackInstincts(actor);
      return origNpcAction.call(this, actor, action, actionIndex, targetsAtRollTime);
    };
    console.log(`${MODULE_ID} | ✓ Wrapped VagabondChatCard.npcAction (Pack Instincts)`);
  }
}

/* ──────────────────────────────────────────────────────────────────────────────
 * PACK INSTINCTS
 *
 * "If one of its Allies is within 5 feet of a Target of this Being's Attack,
 *  that Target is Vulnerable against the Attack."
 *
 * Applied as a temporary ActiveEffect before the attack; cleaned up on turn change.
 * ──────────────────────────────────────────────────────────────────────────── */

const PACK_INSTINCTS_ORIGIN = `module.${MODULE_ID}.packInstincts`;

/** Edge-to-edge Chebyshev distance in feet (supports multi-square tokens). */
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

  const gapX = Math.max(0, Math.max(ax, bx) - Math.min(ax + aw, bx + bw));
  const gapY = Math.max(0, Math.max(ay, by) - Math.min(ay + ah, by + bh));
  return Math.max(gapX, gapY) * gridDist;
}

/**
 * Apply Vulnerable (Pack Instincts) to each targeted token if the attacker
 * has Pack Instincts and an ally is within 5 ft of the target.
 * Call this before firing an NPC action or weapon attack.
 */
export async function applyPackInstincts(attacker) {
  if (!game.user.isGM) return;
  const packAbilities = getPassiveAbilities(attacker, "packInstincts");
  if (!packAbilities.length) return;
  const abilityName = attacker.system?.abilities
    ?.find(a => PASSIVE_ABILITIES[a.name]?.type === "packInstincts")?.name ?? "Pack Instincts";

  const targets = game.user?.targets;
  if (!targets?.size) return;

  // Find the attacker's token on canvas
  const attackerToken = attacker.token?.object ?? attacker.getActiveTokens(true)[0];
  if (!attackerToken) return;
  const attackerDisp = attackerToken.document.disposition;

  // Gather ally tokens (same disposition, not the attacker)
  const allies = canvas.tokens.placeables.filter(t =>
    t.id !== attackerToken.id
    && t.document.disposition === attackerDisp
    && t.actor?.system?.health?.value > 0
  );
  if (!allies.length) return;

  let applied = false;
  for (const targetToken of targets) {
    const targetActor = targetToken.actor;
    if (!targetActor) continue;

    // Check if any ally is Close (adjacent) to this target
    const hasAdjacentAlly = allies.some(ally => _distanceFt(ally, targetToken) <= 0);
    if (!hasAdjacentAlly) continue;

    applied = true;
    ChatMessage.create({
      content: `<strong>${abilityName}:</strong> ${targetActor.name} is Vulnerable against the attack (ally adjacent). Saves are Hindered.`,
      speaker: ChatMessage.getSpeaker({ actor: attacker }),
    });
    console.log(`${MODULE_ID} | Pack Instincts: ${targetActor.name} — saves vs this attacker hindered`);
  }

  // Attacker: saves against this NPC's attacks are Hindered.
  // Use the world actor (game.actors) because the save system resolves the
  // source via game.actors.get(actorId), not the synthetic token actor.
  if (applied) {
    const worldActor = game.actors.get(attacker.id) ?? attacker;
    if (!worldActor.effects.some(e => e.origin === PACK_INSTINCTS_ORIGIN)) {
      await worldActor.createEmbeddedDocuments("ActiveEffect", [{
        name:     "Pack Instincts (active)",
        img:      "icons/svg/downgrade.svg",
        origin:   PACK_INSTINCTS_ORIGIN,
        changes: [
          { key: "system.outgoingSavesModifier", mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE, value: "hinder" },
        ],
      }]);
    }
  }
}

/** Remove all Pack Instincts Vulnerable effects from every actor. */
export async function cleanupPackInstincts() {
  if (!game.user.isGM) return;
  for (const actor of game.actors) {
    const effect = actor.effects.find(e => e.origin === PACK_INSTINCTS_ORIGIN);
    if (effect) await effect.delete();
  }
  // Also check synthetic (unlinked) token actors on the current scene
  for (const token of canvas.tokens?.placeables ?? []) {
    if (token.actor?.isToken) {
      const effect = token.actor.effects.find(e => e.origin === PACK_INSTINCTS_ORIGIN);
      if (effect) await effect.delete();
    }
  }
}

function _registerPackInstinctsCleanup() {
  Hooks.on("updateCombat", (combat, changes) => {
    if (changes.round !== undefined || changes.turn !== undefined) {
      cleanupPackInstincts();
    }
  });
  Hooks.on("deleteCombat", () => cleanupPackInstincts());
}
