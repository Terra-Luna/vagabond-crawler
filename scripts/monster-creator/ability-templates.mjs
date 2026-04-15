/**
 * Monster Creator — Curated Ability Quick Picks
 *
 * 20 hand-curated ability templates covering the most-used monster abilities.
 * Tiered entries (Magic Ward, Terror, Regenerate) use level variants instead
 * of separate template entries. Variant entries (Pack) offer a "pick one of"
 * choice for mechanically-identical abilities that just have different names
 * in the compendium.
 *
 * Descriptions are the canonical compendium text (pulled from the original
 * standalone HTML Monster Creator for tiers I–IV, and from the audit at
 * docs/audit/abilities.json for higher tiers not present in the HTML).
 *
 * `automationStatus` comes from `scripts/npc-abilities.mjs PASSIVE_ABILITIES`
 * — mirrored by hand. Must be kept in sync when ability automation is
 * added/removed. The audit analyzer validates the mirror.
 *
 * Status values: `implemented` | `unimplemented` | `flavor`
 *
 * Shape of each entry:
 *   {
 *     name:              "Display name (or family name for tiered entries)",
 *     automationStatus:  "implemented" | "unimplemented" | "flavor",
 *     tiers?:            [{ label, description }],   // I/II/III levels
 *     variants?:         [{ label, description }],   // pick-one-of family
 *     description?:      "text"                      // when no tiers/variants
 *   }
 */

export const ABILITY_QUICK_PICKS = [

  // ── Implemented (green badge in UI) ─────────────────────────────────────

  {
    name: "Magic Ward",
    automationStatus: "implemented",
    tiers: [
      { label: "I",   description: "The first time it is unwillingly affected by a Spell each Round, the Caster must spend an extra 1 Mana to affect it." },
      { label: "II",  description: "The first time it is unwillingly affected by a Spell each Round, the Caster must spend an extra 2 Mana to affect it." },
      { label: "III", description: "The first time it is unwillingly affected by a Spell each Round, the Caster must spend an extra 3 Mana to affect it." },
      { label: "IV",  description: "The first time it is unwillingly affected by a Spell each Round, the Caster must spend an extra 4 Mana to affect it." },
      { label: "V",   description: "The first time it is unwillingly affected by a Spell each Round, the Caster must spend an extra 5 Mana to affect it." },
      { label: "VI",  description: "The first time it is unwillingly affected by a Spell each Round, the Caster must spend an extra 6 Mana to affect it." },
    ],
  },
  {
    name: "Pack",
    automationStatus: "implemented",
    variants: [
      { label: "Instincts", description: "If one of its Allies is within 5 feet of a Target of this Being's Attack, that Target is Vulnerable against the Attack." },
      { label: "Tactics",   description: "If one of its Allies is within 5 feet of a Target of this Being's Attack, that Target is Vulnerable against the Attack." },
      { label: "Hunter",    description: "Targets within 5 feet of one of this Being's Allies are Vulnerable to its attacks." },
    ],
  },
  {
    name: "Nimble",
    automationStatus: "implemented",
    description: "Attacks against it can't be Favored if it can Move.",
  },
  {
    name: "Soft Underbelly",
    automationStatus: "implemented",
    description: "Its Armor is 0 while it is Prone.",
  },

  // ── Unimplemented but mechanical (yellow badge) ─────────────────────────

  {
    name: "Terror",
    automationStatus: "unimplemented",
    tiers: [
      { label: "I",   description: "Enemies that can see it for the first time and at the start of their Turns must pass [Will] or be Frightened (Cd4)." },
      { label: "II",  description: "[Enemies' first time seeing it and on their Turns | Will]: Frightened until they pass this Check on a subsequent Turn, or for Cd6 after." },
      { label: "III", description: "[Enemies' first time seeing it and on their Turns | Will]: Frightened until they pass this Save on a subsequent Turn, or for Cd8 after." },
    ],
  },
  {
    name: "Regenerate",
    automationStatus: "unimplemented",
    tiers: [
      { label: "I",   description: "Regains 9 (2d8) HP on its Turns." },
      { label: "II",  description: "Regains 9 (2d8) HP on each of its Turns." },
      { label: "III", description: "Regains 13 (3d8) HP on each of its Turns." },
    ],
  },
  {
    name: "Pounce",
    automationStatus: "unimplemented",
    description: "If it moves at least 20' immediately before hitting with an attack on the same Turn, the Target is also knocked Prone.",
  },
  {
    name: "Fear Aura",
    automationStatus: "unimplemented",
    description: "[Aura Near | Will]: Frightened until they pass this Check on a subsequent Turn, or Cd6 after.",
  },
  {
    name: "Bloodthirst",
    automationStatus: "unimplemented",
    description: "It is Berserk and Beings at or below half HP make Checks against it as if Vulnerable.",
  },
  {
    name: "Cloaking",
    automationStatus: "unimplemented",
    description: "While it has a Target Restrained, attack damage dealt to it is halved and also dealt to the Target.",
  },
  {
    name: "Shadow Stealth",
    automationStatus: "unimplemented",
    description: "It is Invisible in the Dark.",
  },
  {
    name: "Antimagic Vulnerability",
    automationStatus: "unimplemented",
    description: "It is Dazed for Cd4 if affected by the Dispel Spell or other antimagic.",
  },
  {
    name: "Nightwalker",
    automationStatus: "unimplemented",
    description: "Can't Move or Target over lines of salt or in areas illuminated by Sunlight. It is Incapacitated and Burning (d8) while in Sunlight.",
  },
  {
    name: "Sun-Averse",
    automationStatus: "unimplemented",
    description: "Is Vulnerable while in Sunlight.",
  },
  {
    name: "Multi-Headed",
    automationStatus: "unimplemented",
    description: "It starts with 3 Heads. Targetting an area that could behead it causes a -3 penalty to the Check, but severs it if at least 2 damage is dealt in a single damage instance.",
  },
  {
    name: "Hydra Regrowth",
    automationStatus: "unimplemented",
    description: "Regains 4 HP at the start of its Turns. If it is missing one of its heads when this happens, two Heads sprout. This Ability doesn't work if it took damage from fire since its last Turn.",
  },

  // ── Flavor (gray badge) — narrative only, GM-interpreted ────────────────

  {
    name: "Amphibious",
    automationStatus: "flavor",
    description: "Can breathe air or water.",
  },
  {
    name: "Burrower",
    automationStatus: "flavor",
    description: "It ignores Difficult Terrain of sand, stone, and earth, and it can Move by quickly burrowing in them. However, it can't cross water deeper than its height.",
  },
  {
    name: "Tunneler",
    automationStatus: "flavor",
    description: "It can Move at full Speed through solid earth and stone by digging.",
  },
  {
    name: "Immutable",
    automationStatus: "flavor",
    description: "It can't be transformed.",
  },

];

/**
 * Resolve a quick-pick + optional tier/variant label into a full Vagabond
 * ability entry ready to push onto `actor.system.abilities[]`.
 */
export function materializeAbility(quickPick, selectedLabel = null) {
  if (quickPick.tiers?.length) {
    const tier = quickPick.tiers.find((t) => t.label === selectedLabel) ?? quickPick.tiers[0];
    return { name: `${quickPick.name} ${tier.label}`, description: tier.description };
  }
  if (quickPick.variants?.length) {
    const v = quickPick.variants.find((x) => x.label === selectedLabel) ?? quickPick.variants[0];
    // Family name ("Pack") + variant label ("Hunter") → "Pack Hunter"
    return { name: `${quickPick.name} ${v.label}`, description: v.description };
  }
  return { name: quickPick.name, description: quickPick.description ?? "" };
}
