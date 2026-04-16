// scripts/animation-fx-defaults.mjs
// Default Animation FX preset data, ported from vagabond-item-fx default-config.mjs.
// Paths use the JB2A library root resolved at runtime via jb2aRoot().
// All presets use the unified { hit: {...}, miss?: {...} } schema.

/**
 * Returns the root path for the installed JB2A module, or null if neither is active.
 * Prefers the Patreon version over the free DnD5e version.
 * @returns {string|null}
 */
export function jb2aRoot() {
  if (game.modules.get("jb2a_patreon")?.active) return "modules/jb2a_patreon/Library";
  if (game.modules.get("JB2A_DnD5e")?.active) return "modules/JB2A_DnD5e/Library";
  return null;
}

/**
 * Build the full default animation FX config using the current JB2A root.
 * Returns null if JB2A is not installed/active.
 * @returns {object|null}
 */
export function buildDefaultAnimationFxConfig() {
  const R = jb2aRoot();
  if (!R) return null;

  return {

    weapons: {
      sword: {
        label: "Sword",
        patterns: "sword|rapier|scimitar|cutlass|saber|katana|falchion|poleblade",
        type: "onToken",
        target: "target",
        hit: {
          file: `${R}/Generic/Weapon_Attacks/Melee/Sword01_01_Regular_White_800x600.webm`,
          scale: 8,
          duration: 600,
        },
      },
      dagger: {
        label: "Dagger / Knife",
        patterns: "dagger|knife|stiletto|dirk|garotte|garrote|kris|shiv",
        type: "onToken",
        target: "target",
        hit: {
          file: `${R}/Generic/Weapon_Attacks/Melee/Dagger02_01_Regular_White_800x600.webm`,
          scale: 8,
          duration: 500,
        },
      },
      axe: {
        label: "Axe",
        patterns: "\\baxe\\b|battleaxe|greataxe|handaxe|hatchet",
        type: "onToken",
        target: "target",
        hit: {
          file: `${R}/Generic/Weapon_Attacks/Melee/Sword01_01_Regular_White_800x600.webm`,
          scale: 8,
          duration: 600,
        },
      },
      hammer: {
        label: "Hammer / Mace / Club",
        patterns: "hammer|mace|club|flail|morningstar|maul|warhammer|greatclub",
        type: "onToken",
        target: "target",
        hit: {
          file: `${R}/Generic/Weapon_Attacks/Melee/DmgBludgeoning_01_Regular_Yellow_1Handed_800x600.webm`,
          scale: 8,
          duration: 500,
        },
      },
      polearm: {
        label: "Polearm / Spear / Staff",
        patterns: "lance|pike|lucerne|halberd|glaive|spear|staff|partisan|trident",
        type: "onToken",
        target: "target",
        hit: {
          file: `${R}/Generic/Weapon_Attacks/Melee/DmgPiercing_01_Regular_Yellow_1Handed_800x600.webm`,
          scale: 8,
          duration: 600,
        },
      },
      whip: {
        label: "Whip",
        patterns: "whip",
        type: "onToken",
        target: "target",
        hit: {
          file: `${R}/Generic/Weapon_Attacks/Melee/DmgSlashing_01_Regular_Yellow_1Handed_800x600.webm`,
          scale: 8,
          duration: 600,
        },
      },
      fist: {
        label: "Fist / Gauntlet / Unarmed",
        patterns: "caestus|gauntlet|katar|unarmed|cestus",
        type: "onToken",
        target: "target",
        hit: {
          file: `${R}/Generic/Unarmed_Attacks/Unarmed_Strike/UnarmedStrike_01_Regular_Blue_Physical01_800x600.webm`,
          scale: 8,
          duration: 500,
        },
      },
      shield: {
        label: "Shield Bash",
        patterns: "shield|buckler",
        type: "onToken",
        target: "target",
        hit: {
          file: `${R}/Generic/Unarmed_Attacks/Unarmed_Strike/UnarmedStrike_01_Regular_Yellow_Physical01_800x600.webm`,
          scale: 8,
          duration: 500,
        },
      },
      bow: {
        label: "Bow",
        patterns: "\\bbow\\b|longbow|shortbow",
        type: "projectile",
        target: "target",
        hit: {
          file: "jb2a.arrow.physical.white",
          scale: 1,
          duration: 800,
        },
      },
      crossbow: {
        label: "Crossbow",
        patterns: "crossbow|arbalest",
        type: "projectile",
        target: "target",
        hit: {
          file: "jb2a.bolt.physical.white",
          scale: 1,
          duration: 600,
        },
      },
      firearm: {
        label: "Firearm",
        patterns: "handgun|rifle|shotgun|pistol|musket|blunderbuss",
        type: "projectile",
        target: "target",
        hit: {
          file: "jb2a.bullet.01.orange",
          scale: 1,
          duration: 400,
        },
      },
      thrown: {
        label: "Thrown Weapon",
        patterns: "javelin|net\\b|bottle|throwing",
        type: "projectile",
        target: "target",
        hit: {
          file: "jb2a.dagger.throw",
          scale: 1,
          duration: 600,
        },
      },
      sling: {
        label: "Sling",
        patterns: "\\bsling\\b",
        type: "projectile",
        target: "target",
        hit: {
          file: "jb2a.bullet.01.orange",
          scale: 1,
          duration: 500,
        },
      },
    },

    weaponSkillFallbacks: {
      melee: {
        label: "Melee (generic)",
        type: "onToken",
        target: "target",
        hit: {
          file: `${R}/Generic/Weapon_Attacks/Melee/GenericSlash01_01_Regular_BluePurple_800x600.webm`,
          scale: 8,
          duration: 600,
        },
      },
      finesse: {
        label: "Finesse (generic)",
        type: "onToken",
        target: "target",
        hit: {
          file: `${R}/Generic/Weapon_Attacks/Melee/GenericSlash01_01_Regular_Orange_800x600.webm`,
          scale: 8,
          duration: 500,
        },
      },
      brawl: {
        label: "Brawl (generic)",
        type: "onToken",
        target: "target",
        hit: {
          file: `${R}/Generic/Unarmed_Attacks/Unarmed_Strike/UnarmedStrike_01_Regular_Blue_Physical01_800x600.webm`,
          scale: 8,
          duration: 500,
        },
      },
      ranged: {
        label: "Ranged (generic)",
        type: "projectile",
        target: "target",
        hit: {
          file: "jb2a.arrow.physical.white",
          scale: 1,
          duration: 800,
        },
      },
      _default: {
        label: "Default Weapon",
        type: "onToken",
        target: "target",
        hit: {
          file: `${R}/Generic/Weapon_Attacks/Melee/GenericSlash01_01_Regular_BluePurple_800x600.webm`,
          scale: 8,
          duration: 600,
        },
      },
    },

    alchemical: {
      "alchemist's fire": {
        label: "Alchemist's Fire",
        type: "projectile",
        target: "target",
        hit: { file: "jb2a.fire_bolt.orange", scale: 1, duration: 800 },
      },
      "acid": {
        label: "Acid",
        type: "projectile",
        target: "target",
        hit: { file: "jb2a.fire_bolt.green", scale: 1, duration: 800 },
      },
      "alkahest": {
        label: "Alkahest",
        type: "projectile",
        target: "target",
        hit: { file: "jb2a.fire_bolt.green", scale: 1, duration: 800 },
      },
      "frigid azote": {
        label: "Frigid Azote",
        type: "projectile",
        target: "target",
        hit: { file: "jb2a.ray_of_frost.blue", scale: 1, duration: 800 },
      },
      "levin shell": {
        label: "Levin Shell",
        type: "projectile",
        target: "target",
        hit: { file: "jb2a.chain_lightning.primary.blue", scale: 1, duration: 800 },
      },
      "thunderstone": {
        label: "Thunderstone",
        type: "projectile",
        target: "target",
        hit: { file: "jb2a.fire_bolt.blue", scale: 1, duration: 600 },
      },
      "tanglefoot": {
        label: "Tanglefoot Bag",
        type: "projectile",
        target: "target",
        hit: { file: "jb2a.fire_bolt.green", scale: 1, duration: 600 },
      },
      "holy water": {
        label: "Holy Water",
        type: "projectile",
        target: "target",
        hit: { file: "jb2a.fire_bolt.blue", scale: 1, duration: 800 },
      },
      "gravebane": {
        label: "Gravebane",
        type: "projectile",
        target: "target",
        hit: { file: "jb2a.fire_bolt.blue", scale: 1, duration: 800 },
      },
      "splash catalyst": {
        label: "Splash Catalyst",
        type: "projectile",
        target: "target",
        hit: { file: "jb2a.fire_bolt.orange", scale: 1, duration: 600 },
      },
      "smoke": {
        label: "Smoke Stick / Bomb",
        type: "onToken",
        target: "self",
        hit: {
          file: `${R}/Generic/Smoke/SmokePuff01_01_Regular_Grey_400x400.webm`,
          scale: 8,
          duration: 1500,
        },
      },
      "dwarfblind": {
        label: "Dwarfblind Stone",
        type: "onToken",
        target: "self",
        hit: {
          file: `${R}/Generic/Explosion/Explosion_01_Blue_400x400.webm`,
          scale: 8,
          duration: 1500,
        },
      },
      "healing": {
        label: "Healing Potion",
        type: "onToken",
        target: "self",
        hit: {
          file: `${R}/Generic/Healing/HealingAbility_01_Blue_400x400.webm`,
          scale: 8,
          duration: 1500,
        },
      },
      "mana": {
        label: "Mana Potion",
        type: "onToken",
        target: "self",
        hit: {
          file: `${R}/Generic/Healing/HealingAbility_01_Blue_400x400.webm`,
          scale: 8,
          duration: 1500,
        },
      },
      "regeneration": {
        label: "Regeneration Potion",
        type: "onToken",
        target: "self",
        hit: {
          file: `${R}/Generic/Healing/HealingAbility_01_Blue_400x400.webm`,
          scale: 8,
          duration: 1500,
        },
      },
      "antitoxin": {
        label: "Antitoxin",
        type: "onToken",
        target: "self",
        hit: {
          file: `${R}/Generic/Healing/HealingAbility_01_Blue_400x400.webm`,
          scale: 8,
          duration: 1500,
        },
      },
      "speed": {
        label: "Speed Potion",
        type: "onToken",
        target: "self",
        hit: {
          file: `${R}/Generic/Smoke/SmokePuff01_01_Regular_Grey_400x400.webm`,
          scale: 8,
          duration: 1000,
        },
      },
      "anger": {
        label: "Anger Potion",
        type: "onToken",
        target: "self",
        hit: {
          file: `${R}/Generic/Explosion/Explosion_01_Orange_400x400.webm`,
          scale: 8,
          duration: 1500,
        },
      },
      "resistance": {
        label: "Resistance Potion",
        type: "onToken",
        target: "self",
        hit: {
          file: `${R}/Generic/Healing/HealingAbility_01_Blue_400x400.webm`,
          scale: 8,
          duration: 1500,
        },
      },
      "invulnerability": {
        label: "Invulnerability Potion",
        type: "onToken",
        target: "self",
        hit: {
          file: `${R}/Generic/Healing/HealingAbility_01_Blue_400x400.webm`,
          scale: 8,
          duration: 1500,
        },
      },
      "smelling salts": {
        label: "Smelling Salts",
        type: "onToken",
        target: "self",
        hit: {
          file: `${R}/Generic/Smoke/SmokePuff01_01_Regular_Grey_400x400.webm`,
          scale: 6,
          duration: 800,
        },
      },
      "oil": {
        label: "Oil (applied)",
        type: "onToken",
        target: "self",
        hit: {
          file: `${R}/Generic/Smoke/SmokePuff01_01_Regular_Grey_400x400.webm`,
          scale: 6,
          duration: 800,
        },
      },
      "poison": {
        label: "Poison (applied)",
        type: "onToken",
        target: "self",
        hit: {
          file: `${R}/Generic/Smoke/SmokePuff01_01_Regular_Grey_400x400.webm`,
          scale: 6,
          duration: 800,
        },
      },
      "potion": {
        label: "Generic Potion",
        type: "onToken",
        target: "self",
        hit: {
          file: `${R}/Generic/Healing/HealingAbility_01_Blue_400x400.webm`,
          scale: 8,
          duration: 1500,
        },
      },
      "_default": {
        label: "Generic Alchemical (thrown)",
        type: "projectile",
        target: "target",
        hit: { file: "jb2a.fire_bolt.orange", scale: 1, duration: 600 },
      },
    },

    gear: {
      torch: {
        label: "Torch",
        type: "onToken",
        target: "self",
        persist: true,
        hit: {
          file: `${R}/Generic/Fire/GroundCrackLoop_03_Regular_Orange_600x600.webm`,
          scale: 4,
          duration: 0,
        },
      },
      lantern: {
        label: "Lantern",
        type: "onToken",
        target: "self",
        persist: true,
        hit: {
          file: `${R}/Generic/Fire/GroundCrackLoop_03_Regular_Orange_600x600.webm`,
          scale: 4,
          duration: 0,
        },
      },
      sunrod: {
        label: "Sunrod",
        type: "onToken",
        target: "self",
        persist: true,
        hit: {
          file: `${R}/Generic/Fire/GroundCrackLoop_03_Regular_Orange_600x600.webm`,
          scale: 4,
          duration: 0,
        },
      },
    },

    npcActions: {
      bite: {
        label: "Bite",
        patterns: "bite|chomp|gnaw|maw",
        type: "onToken",
        target: "target",
        hit: {
          file: `${R}/Generic/Weapon_Attacks/Melee/Bite01_01_Regular_Red_800x600.webm`,
          scale: 8,
          duration: 800,
        },
      },
      claw: {
        label: "Claw",
        patterns: "claw|slash|rake|rend",
        type: "onToken",
        target: "target",
        hit: {
          file: `${R}/Generic/Weapon_Attacks/Melee/Claw01_01_Regular_Red_800x600.webm`,
          scale: 8,
          duration: 800,
        },
      },
      slam: {
        label: "Slam",
        patterns: "slam|smash|pound|crush|bash",
        type: "onToken",
        target: "target",
        hit: {
          file: `${R}/Generic/Weapon_Attacks/Melee/DmgBludgeoning_01_Regular_Yellow_1Handed_800x600.webm`,
          scale: 8,
          duration: 800,
        },
      },
      tail: {
        label: "Tail",
        patterns: "tail|sting|whip",
        type: "onToken",
        target: "target",
        hit: {
          file: `${R}/Generic/Weapon_Attacks/Melee/DmgSlashing_01_Regular_Yellow_1Handed_800x600.webm`,
          scale: 8,
          duration: 700,
        },
      },
      stomp: {
        label: "Stomp",
        patterns: "stomp|trample|crush underfoot",
        type: "onToken",
        target: "target",
        hit: {
          file: `${R}/Generic/Weapon_Attacks/Melee/DmgBludgeoning_01_Regular_Yellow_1Handed_800x600.webm`,
          scale: 10,
          duration: 900,
        },
      },
      breath: {
        label: "Breath Weapon",
        patterns: "breath|exhale|spray|cone of",
        type: "cone",
        target: "target",
        hit: {
          file: "jb2a.breath_weapons.fire.line.orange",
          scale: 1,
          duration: 1500,
        },
      },
      _default: {
        label: "Generic NPC Action",
        type: "onToken",
        target: "target",
        hit: {
          file: `${R}/Generic/Weapon_Attacks/Melee/GenericSlash01_01_Regular_BluePurple_800x600.webm`,
          scale: 8,
          duration: 800,
        },
      },
    },

  };
}

/**
 * Static default config object for use as the settings default value.
 * Built using a lazy-evaluated getter so it resolves the JB2A root at access time
 * (i.e., after modules are loaded in Foundry's ready hook).
 *
 * Falls back to an empty-category structure if JB2A is not installed, so the
 * settings registration never throws.
 */
export const DEFAULT_ANIMATION_FX_CONFIG = {
  weapons: {},
  weaponSkillFallbacks: {},
  alchemical: {},
  gear: {},
  npcActions: {},
};
