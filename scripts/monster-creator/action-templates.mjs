/**
 * Monster Creator — Curated Action Quick Picks
 *
 * 20 hand-curated action templates covering the 90% case of monster authoring.
 * Tiered entries (Claw, Bite, Horn, Breath Attack) use power-tier variants
 * instead of separate template entries to cut duplication.
 *
 * Damage and note values are pulled from the original standalone HTML Monster
 * Creator (F:\Vagabond\vagabond-monster-creator.html), preserving Vagabond
 * canon. The full 245-action catalog remains available via the audit-backed
 * "Catalog" tab in the Creator UI.
 *
 * Shape of each entry (matches `actor.system.actions[]` with add-ons):
 *   {
 *     name:         "Display name shown in the Quick Picks grid",
 *     category:     "melee" | "ranged" | "castClose" | "castRanged",
 *     tiers?:       [{ label, rollDamage, flatDamage, damageType?, note?, recharge? }],
 *     defaults?:    { rollDamage, flatDamage, damageType, note, recharge } // when no tiers
 *     damageTypeOptions?: ["fire", "cold", ...]    // optional picker for elemental attacks
 *   }
 *
 * When the user picks a template (and optionally a tier), the Creator merges
 * the tier/default values into a full action entry with `name`, `attackType`
 * (from `category`), `rollDamage`, `flatDamage`, `damageType`, `note`,
 * `recharge`, and empty `causedStatuses` / `critCausedStatuses` arrays.
 */

export const ACTION_QUICK_PICKS = [

  // ── Natural melee weapons ───────────────────────────────────────────────

  {
    name: "Bite",
    category: "melee",
    tiers: [
      { label: "Small",  rollDamage: "1d6",  flatDamage: "3",  note: "Melee Attack" },
      { label: "Medium", rollDamage: "2d6",  flatDamage: "7",  note: "Melee Attack" },
      { label: "Heavy",  rollDamage: "3d6",  flatDamage: "10", note: "Melee Attack" },
      { label: "Boss",   rollDamage: "1d8+1", flatDamage: "5", note: "Melee Attack" },
    ],
  },
  {
    name: "Claw",
    category: "melee",
    tiers: [
      { label: "Light",   rollDamage: "1d4",   flatDamage: "2", note: "Melee Attack" },
      { label: "Medium",  rollDamage: "2d4",   flatDamage: "2", note: "Melee Attack" },
      { label: "Heavy",   rollDamage: "2d6+1", flatDamage: "8", note: "Melee Attack" },
    ],
  },
  {
    name: "Tail",
    category: "melee",
    defaults: { rollDamage: "1d12", flatDamage: "6", damageType: "-", note: "Melee Attack 10'", recharge: "" },
  },
  {
    name: "Slam",
    category: "melee",
    defaults: { rollDamage: "2d10", flatDamage: "11", damageType: "-", note: "Melee Attack", recharge: "" },
  },
  {
    name: "Horn",
    category: "melee",
    tiers: [
      { label: "Single (Horn)",  rollDamage: "3d6",  flatDamage: "10", note: "Melee Attack" },
      { label: "Multi (Horns)",  rollDamage: "3d10", flatDamage: "16", note: "Melee Attack" },
    ],
  },
  {
    name: "Hoof",
    category: "melee",
    defaults: { rollDamage: "1d4", flatDamage: "2", damageType: "-", note: "Melee Attack", recharge: "" },
  },
  {
    name: "Talon",
    category: "melee",
    defaults: { rollDamage: "2d6", flatDamage: "7", damageType: "-", note: "Melee Attack", recharge: "" },
  },
  {
    name: "Tentacle",
    category: "melee",
    defaults: { rollDamage: "1d4", flatDamage: "2", damageType: "-", note: "Melee Attack, Near", recharge: "" },
  },
  {
    name: "Sting",
    category: "melee",
    defaults: { rollDamage: "2d4", flatDamage: "5", damageType: "-", note: "Melee Attack", recharge: "" },
  },
  {
    name: "Pseudopod",
    category: "melee",
    defaults: { rollDamage: "2d6", flatDamage: "7", damageType: "-", note: "Melee Attack", recharge: "" },
  },
  {
    name: "Gore",
    category: "melee",
    defaults: { rollDamage: "3d4", flatDamage: "7", damageType: "-", note: "Melee Attack", recharge: "" },
  },
  {
    name: "Grasp",
    category: "melee",
    defaults: { rollDamage: "1d8", flatDamage: "4", damageType: "-", note: "Melee Attack", recharge: "" },
  },
  {
    name: "Drain",
    category: "melee",
    defaults: { rollDamage: "1d4", flatDamage: "2", damageType: "-", note: "Melee Attack, Restrained Being", recharge: "" },
  },

  // ── Weapon-holding humanoid ─────────────────────────────────────────────

  {
    name: "Weapon",
    category: "melee",
    defaults: { rollDamage: "1d6", flatDamage: "3", damageType: "-", note: "Melee Attack", recharge: "" },
  },

  // ── Ranged ──────────────────────────────────────────────────────────────

  {
    name: "Rock",
    category: "ranged",
    defaults: { rollDamage: "2d6", flatDamage: "9", damageType: "-", note: "Ranged Attack", recharge: "" },
  },
  {
    name: "Fireball",
    category: "ranged",
    defaults: { rollDamage: "1d6", flatDamage: "3", damageType: "fire", note: "Ranged Attack", recharge: "Cd4" },
    damageTypeOptions: ["fire", "cold", "poison", "acid", "shock", "necrotic"],
  },

  // ── Cast (close / ranged) ───────────────────────────────────────────────

  {
    name: "Breath Attack",
    category: "castClose",
    tiers: [
      { label: "Small", rollDamage: "2d6", flatDamage: "7",  damageType: "fire", note: "Attack, Near Cone | Endure or Reflex | Half damage on a pass", recharge: "Cd4" },
      { label: "Medium", rollDamage: "4d6", flatDamage: "14", damageType: "fire", note: "Attack, Far Cone | Endure or Reflex | Half damage on a pass", recharge: "Cd4" },
      { label: "Heavy",  rollDamage: "6d6", flatDamage: "21", damageType: "fire", note: "Attack, Far Cone | Endure or Reflex | Half damage on a pass", recharge: "Cd4" },
    ],
    damageTypeOptions: ["fire", "cold", "poison", "acid", "shock", "necrotic"],
  },
  {
    name: "Cast (Close)",
    category: "castClose",
    defaults: { rollDamage: "2d6", flatDamage: "7", damageType: "-", note: "Cast, Close | Endure", recharge: "" },
  },
  {
    name: "Cast (Ranged)",
    category: "castRanged",
    defaults: { rollDamage: "1d6", flatDamage: "3", damageType: "-", note: "Cast, Remote | Endure", recharge: "" },
  },
  {
    name: "Glare",
    category: "castRanged",
    defaults: { rollDamage: "1d4+1", flatDamage: "3", damageType: "-", note: "Cast, a Humanlike that can see it | Will", recharge: "Cd8" },
  },

];

/**
 * Resolve a quick-pick + optional tier selection into a full Vagabond action
 * object ready to push onto `actor.system.actions[]`.
 */
export function materializeAction(quickPick, tierLabel = null, overrides = {}) {
  const base = {
    name:              quickPick.name,
    attackType:        quickPick.category,
    rollDamage:        "",
    flatDamage:        "",
    damageType:        "-",
    note:              "",
    recharge:          "",
    extraInfo:         "",
    causedStatuses:    [],
    critCausedStatuses:[],
  };
  let tier = null;
  if (quickPick.tiers?.length) {
    tier = quickPick.tiers.find((t) => t.label === tierLabel) ?? quickPick.tiers[0];
  }
  const source = { ...quickPick.defaults, ...tier, ...overrides };
  for (const k of ["name", "rollDamage", "flatDamage", "damageType", "note", "recharge"]) {
    if (source[k] !== undefined) base[k] = source[k];
  }
  return base;
}
