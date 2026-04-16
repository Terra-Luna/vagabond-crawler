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
      arbalest: {
        label: "Arbalest",
        patterns: "arbalest",
        type: "projectile",
        target: "target",
        hit: {
          file: "modules/JB2A_DnD5e/Library/Generic/Weapon_Attacks/Ranged/Bolt01_01_Regular_Orange_Physical_15ft_1000x400.webm",
          scale: 1,
          sound: "modules/psfx/library/ranged-weapons/longbow/v1/longbow-003-60ft.ogg",
          soundVolume: 0.6,
        },
      },
      battleaxe: {
        label: "Battleaxe",
        patterns: "battleaxe|battle axe",
        type: "onToken",
        target: "target",
        hit: {
          file: "modules/JB2A_DnD5e/Library/Generic/Weapon_Attacks/Melee/Group02/MeleeAttack02_BattleAxe01_02_800x600.webm",
          scale: 1,
          duration: 800,
          sound: "modules/psfx/library/impacts/slashing/v1/meleeattack-impacts-slashing-00.ogg",
          soundVolume: 0.6,
        },
      },
      bottle_glass: {
        label: "Bottle, glass",
        patterns: "bottle.*glass|glass.*bottle|\\bbottle\\b",
        type: "projectile",
        target: "target",
        hit: {
          file: "modules/JB2A_DnD5e/Library/Generic/Weapon_Attacks/Ranged/ThrowFlask01_01_Regular_Orange_05ft_600x400.webm",
          scale: 1,
          sound: "modules/psfx/library/impacts/magicaleffects/generic/002/impact-magicaleffects-generic-001-03.ogg",
          soundVolume: 0.6,
        },
      },
      buckler: {
        label: "Buckler",
        patterns: "\\bbuckler\\b",
        type: "onToken",
        target: "target",
        hit: {
          file: "modules/JB2A_DnD5e/Library/Generic/Weapon_Attacks/Melee/Group06/MeleeAttack06_Shield01_01_Regular_White_800x600.webm",
          scale: 1,
          duration: 800,
          sound: "modules/psfx/library/impacts/bludgeoning/v1/meleeattack-impacts-bludgeoning-00.ogg",
          soundVolume: 0.6,
        },
      },
      caestus: {
        label: "Caestus",
        patterns: "caestus|cestus",
        type: "onToken",
        target: "target",
        hit: {
          file: "modules/JB2A_DnD5e/Library/Generic/Creature/Fist/CreatureAttackFist_001_001_Red_800x600.webm",
          scale: 1,
          duration: 800,
          sound: "modules/psfx/library/impacts/slashing/v1/meleeattack-impacts-slashing-01.ogg",
          soundVolume: 0.6,
        },
      },
      club: {
        label: "Club",
        patterns: "\\bclub\\b",
        type: "onToken",
        target: "target",
        hit: {
          file: "modules/JB2A_DnD5e/Library/Generic/Weapon_Attacks/Melee/Club01_05_Regular_White_800x600.webm",
          scale: 1,
          duration: 800,
          sound: "modules/psfx/library/impacts/bludgeoning/v1/meleeattack-impacts-bludgeoning-01.ogg",
          soundVolume: 0.6,
        },
      },
      crossbow: {
        label: "Crossbow",
        patterns: "\\bcrossbow\\b(?!.*light)",
        type: "projectile",
        target: "target",
        hit: {
          file: "modules/JB2A_DnD5e/Library/Generic/Weapon_Attacks/Ranged/Bolt01_01_Regular_Orange_Physical_15ft_1000x400.webm",
          scale: 1,
          sound: "modules/psfx/library/ranged-weapons/longbow/v1/longbow-003-60ft.ogg",
          soundVolume: 0.6,
        },
      },
      crossbow_light: {
        label: "Crossbow, light",
        patterns: "crossbow.*light|light.*crossbow",
        type: "projectile",
        target: "target",
        hit: {
          file: "modules/JB2A_DnD5e/Library/Generic/Weapon_Attacks/Ranged/Bolt01_01_Regular_Orange_Physical_15ft_1000x400.webm",
          scale: 1,
          sound: "modules/psfx/library/ranged-weapons/longbow/v1/longbow-003-60ft.ogg",
          soundVolume: 0.6,
        },
      },
      dagger: {
        label: "Dagger",
        patterns: "\\bdagger\\b(?!.*thrown|.*finesse)",
        type: "onToken",
        target: "target",
        hit: {
          file: "modules/JB2A_DnD5e/Library/Generic/Weapon_Attacks/Melee/Dagger02_01_Regular_White_800x600.webm",
          scale: 1,
          duration: 800,
          sound: "modules/psfx/library/impacts/slashing/v1/meleeattack-impacts-slashing-02.ogg",
          soundVolume: 0.6,
        },
      },
      dagger_finesse: {
        label: "Dagger (Finesse)",
        patterns: "dagger.*finesse|finesse.*dagger",
        type: "onToken",
        target: "target",
        hit: {
          file: "modules/JB2A_DnD5e/Library/Generic/Weapon_Attacks/Melee/Dagger02_01_Regular_White_800x600.webm",
          scale: 1,
          duration: 800,
          sound: "modules/psfx/library/impacts/slashing/v1/meleeattack-impacts-slashing-02.ogg",
          soundVolume: 0.6,
        },
      },
      dagger_thrown: {
        label: "Dagger (Thrown)",
        patterns: "dagger.*thrown|thrown.*dagger",
        type: "projectile",
        target: "target",
        hit: {
          file: "modules/JB2A_DnD5e/Library/Generic/Weapon_Attacks/Ranged/Dagger01_01_Regular_White_15ft_1000x400.webm",
          scale: 1,
          sound: "modules/psfx/library/impacts/slashing/v1/meleeattack-impacts-slashing-02.ogg",
          soundVolume: 0.6,
        },
      },
      flail: {
        label: "Flail",
        patterns: "\\bflail\\b",
        type: "onToken",
        target: "target",
        hit: {
          file: "modules/JB2A_DnD5e/Library/Generic/Weapon_Attacks/Melee/Mace01_06_Regular_White_800x600.webm",
          scale: 1,
          duration: 800,
          sound: "modules/psfx/library/impacts/bludgeoning/v1/meleeattack-impacts-bludgeoning-02.ogg",
          soundVolume: 0.6,
        },
      },
      garotte_wire: {
        label: "Garotte wire",
        patterns: "garotte|garrote",
        type: "onToken",
        target: "target",
        hit: {
          file: "modules/JB2A_DnD5e/Library/Generic/Unarmed_Attacks/Unarmed_Strike/UnarmedStrike_01_Regular_Blue_Physical02_800x600.webm",
          scale: 1,
          duration: 800,
          sound: "modules/psfx/library/impacts/bludgeoning/v1/meleeattack-impacts-bludgeoning-03.ogg",
          soundVolume: 0.6,
        },
      },
      gauntlet: {
        label: "Gauntlet",
        patterns: "\\bgauntlet\\b",
        type: "onToken",
        target: "target",
        hit: {
          file: "modules/JB2A_DnD5e/Library/Generic/Creature/Fist/CreatureAttackFist_002_001_Blue_800x600.webm",
          scale: 1,
          duration: 800,
          sound: "modules/psfx/library/impacts/bludgeoning/v1/meleeattack-impacts-bludgeoning-00.ogg",
          soundVolume: 0.6,
        },
      },
      greataxe: {
        label: "Greataxe",
        patterns: "greataxe|great axe",
        type: "onToken",
        target: "target",
        hit: {
          file: "modules/JB2A_DnD5e/Library/Generic/Weapon_Attacks/Melee/GreatAxe01_01_Regular_White_800x600.webm",
          scale: 1,
          duration: 800,
          sound: "modules/psfx/library/impacts/slashing/v1/meleeattack-impacts-slashing-03.ogg",
          soundVolume: 0.6,
        },
      },
      greatclub: {
        label: "Greatclub",
        patterns: "greatclub|great club",
        type: "onToken",
        target: "target",
        hit: {
          file: "modules/JB2A_DnD5e/Library/Generic/Weapon_Attacks/Melee/GreatClub01_01_Regular_White_800x600.webm",
          scale: 1,
          duration: 800,
          sound: "modules/psfx/library/impacts/bludgeoning/v1/meleeattack-impacts-bludgeoning-01.ogg",
          soundVolume: 0.6,
        },
      },
      greatshield: {
        label: "Greatshield",
        patterns: "greatshield|great shield",
        type: "onToken",
        target: "target",
        hit: {
          file: "modules/JB2A_DnD5e/Library/Generic/Weapon_Attacks/Melee/Group06/MeleeAttack06_Shield01_01_Regular_White_800x600.webm",
          scale: 1,
          duration: 800,
          sound: "modules/psfx/library/impacts/bludgeoning/v1/meleeattack-impacts-bludgeoning-02.ogg",
          soundVolume: 0.6,
        },
      },
      greatsword: {
        label: "Greatsword",
        patterns: "greatsword|great sword",
        type: "onToken",
        target: "target",
        hit: {
          file: "modules/JB2A_DnD5e/Library/Generic/Weapon_Attacks/Melee/GreatSword01_01_Regular_White_800x600.webm",
          scale: 1,
          duration: 800,
          sound: "modules/psfx/library/impacts/slashing/v1/meleeattack-impacts-slashing-00.ogg",
          soundVolume: 0.6,
        },
      },
      handaxe: {
        label: "Handaxe",
        patterns: "handaxe(?!.*thrown)|hand axe(?!.*thrown)",
        type: "onToken",
        target: "target",
        hit: {
          file: "modules/JB2A_DnD5e/Library/Generic/Weapon_Attacks/Melee/HandAxe02_01_Regular_White_800x600.webm",
          scale: 1,
          duration: 800,
          sound: "modules/psfx/library/impacts/slashing/v1/meleeattack-impacts-slashing-01.ogg",
          soundVolume: 0.6,
        },
      },
      handaxe_thrown: {
        label: "Handaxe (Thrown)",
        patterns: "handaxe.*thrown|thrown.*handaxe|hand axe.*thrown",
        type: "projectile",
        target: "target",
        hit: {
          file: "modules/JB2A_DnD5e/Library/Generic/Weapon_Attacks/Ranged/Dagger01_01_Regular_White_15ft_1000x400.webm",
          scale: 1,
          sound: "modules/psfx/library/impacts/slashing/v1/meleeattack-impacts-slashing-01.ogg",
          soundVolume: 0.6,
        },
      },
      handgun: {
        label: "Handgun",
        patterns: "handgun|pistol",
        type: "projectile",
        target: "target",
        hit: {
          file: "modules/JB2A_DnD5e/Library/Generic/Weapon_Attacks/Ranged/Bullet_01_Regular_Orange_15ft_1000x400.webm",
          scale: 1,
          sound: "modules/psfx/library/ranged-weapons/guns/revolver/single-fire/revolver-single-fire-001-03.ogg",
          soundVolume: 0.6,
        },
      },
      javelin: {
        label: "Javelin",
        patterns: "javelin(?!.*thrown)",
        type: "onToken",
        target: "target",
        hit: {
          file: "modules/JB2A_DnD5e/Library/Generic/Weapon_Attacks/Melee/Spear01_04_Regular_White_800x600.webm",
          scale: 1,
          duration: 800,
          sound: "modules/psfx/library/impacts/bludgeoning/v1/meleeattack-impacts-bludgeoning-03.ogg",
          soundVolume: 0.6,
        },
      },
      javelin_thrown: {
        label: "Javelin (Thrown)",
        patterns: "javelin.*thrown|thrown.*javelin",
        type: "projectile",
        target: "target",
        hit: {
          file: "modules/JB2A_DnD5e/Library/Generic/Weapon_Attacks/Ranged/Dagger01_01_Regular_White_15ft_1000x400.webm",
          scale: 1,
          sound: "modules/psfx/library/impacts/bludgeoning/v1/meleeattack-impacts-bludgeoning-03.ogg",
          soundVolume: 0.6,
        },
      },
      katar: {
        label: "Katar",
        patterns: "\\bkatar\\b",
        type: "onToken",
        target: "target",
        hit: {
          file: "modules/JB2A_DnD5e/Library/Generic/Weapon_Attacks/Melee/Dagger02_01_Regular_White_800x600.webm",
          scale: 1,
          duration: 800,
          sound: "modules/psfx/library/impacts/bludgeoning/v1/meleeattack-impacts-bludgeoning-00.ogg",
          soundVolume: 0.6,
        },
      },
      lance: {
        label: "Lance",
        patterns: "\\blance\\b",
        type: "onToken",
        target: "target",
        hit: {
          file: "modules/JB2A_DnD5e/Library/Generic/Weapon_Attacks/Melee/Spear01_01_Regular_White_800x600.webm",
          scale: 1,
          duration: 800,
          sound: "modules/psfx/library/impacts/slashing/v1/meleeattack-impacts-slashing-02.ogg",
          soundVolume: 0.6,
        },
      },
      light_hammer: {
        label: "Light hammer",
        patterns: "light hammer(?!.*thrown)|light.*hammer(?!.*thrown)",
        type: "onToken",
        target: "target",
        hit: {
          file: "modules/JB2A_DnD5e/Library/Generic/Weapon_Attacks/Melee/Group02/MeleeAttack02_Hammer01_01_800x600.webm",
          scale: 1,
          duration: 800,
          sound: "modules/psfx/library/impacts/bludgeoning/v1/meleeattack-impacts-bludgeoning-01.ogg",
          soundVolume: 0.6,
        },
      },
      light_hammer_thrown: {
        label: "Light hammer (Thrown)",
        patterns: "light hammer.*thrown|thrown.*light hammer",
        type: "onToken",
        target: "target",
        hit: {
          file: "modules/JB2A_DnD5e/Library/Generic/Weapon_Attacks/Melee/Group02/MeleeAttack02_Hammer01_01_800x600.webm",
          scale: 1,
          duration: 800,
          sound: "modules/psfx/library/impacts/bludgeoning/v1/meleeattack-impacts-bludgeoning-01.ogg",
          soundVolume: 0.6,
        },
      },
      longbow: {
        label: "Longbow",
        patterns: "longbow|long bow",
        type: "projectile",
        target: "target",
        hit: {
          file: "modules/JB2A_DnD5e/Library/Generic/Weapon_Attacks/Ranged/Arrow01_01_Regular_White_15ft_1000x400.webm",
          scale: 1,
          sound: "modules/psfx/library/ranged-weapons/longbow/v1/longbow-003-60ft.ogg",
          soundVolume: 0.6,
        },
      },
      longsword: {
        label: "Longsword",
        patterns: "longsword|long sword",
        type: "onToken",
        target: "target",
        hit: {
          file: "modules/JB2A_DnD5e/Library/Generic/Weapon_Attacks/Melee/Sword01_05_Regular_White_800x600.webm",
          scale: 1,
          duration: 800,
          sound: "modules/psfx/library/impacts/slashing/v1/meleeattack-impacts-slashing-03.ogg",
          soundVolume: 0.6,
        },
      },
      lucerne: {
        label: "Lucerne",
        patterns: "\\blucerne\\b",
        type: "onToken",
        target: "target",
        hit: {
          file: "modules/JB2A_DnD5e/Library/Generic/Weapon_Attacks/Melee/Warhammer01_05_Regular_White_800x600.webm",
          scale: 1,
          duration: 800,
          sound: "modules/psfx/library/impacts/bludgeoning/v1/meleeattack-impacts-bludgeoning-02.ogg",
          soundVolume: 0.6,
        },
      },
      mace: {
        label: "Mace",
        patterns: "\\bmace\\b",
        type: "onToken",
        target: "target",
        hit: {
          file: "modules/JB2A_DnD5e/Library/Generic/Weapon_Attacks/Melee/Mace01_01_Regular_White_800x600.webm",
          scale: 1,
          duration: 800,
          sound: "modules/psfx/library/impacts/bludgeoning/v1/meleeattack-impacts-bludgeoning-03.ogg",
          soundVolume: 0.6,
        },
      },
      morningstar: {
        label: "Morningstar",
        patterns: "morningstar|morning star",
        type: "onToken",
        target: "target",
        hit: {
          file: "modules/JB2A_DnD5e/Library/Generic/Weapon_Attacks/Melee/Mace01_06_Regular_White_800x600.webm",
          scale: 1,
          duration: 800,
          sound: "modules/psfx/library/impacts/bludgeoning/v1/meleeattack-impacts-bludgeoning-00.ogg",
          soundVolume: 0.6,
        },
      },
      net: {
        label: "Net",
        patterns: "\\bnet\\b",
        type: "onToken",
        target: "target",
        hit: {
          file: "modules/JB2A_DnD5e/Library/Generic/Marker/MarkerChainSpectralStandard01_02_Regular_Blue_Complete_400x400.webm",
          scale: 1,
          duration: 800,
          sound: "modules/psfx/library/impacts/bludgeoning/v1/meleeattack-impacts-bludgeoning-01.ogg",
          soundVolume: 0.6,
        },
      },
      pike: {
        label: "Pike",
        patterns: "\\bpike\\b",
        type: "onToken",
        target: "target",
        hit: {
          file: "modules/JB2A_DnD5e/Library/Generic/Weapon_Attacks/Melee/Group03/TrailAttack03_01_01_Regular_BlueYellow_800x600.webm",
          scale: 1,
          duration: 800,
          sound: "modules/psfx/library/impacts/slashing/v1/meleeattack-impacts-slashing-00.ogg",
          soundVolume: 0.6,
        },
      },
      poleblade: {
        label: "Poleblade",
        patterns: "poleblade|pole blade",
        type: "onToken",
        target: "target",
        hit: {
          file: "modules/JB2A_DnD5e/Library/Generic/Weapon_Attacks/Melee/Group04/TrailAttack04_01_04_Regular_BlueYellow_800x600.webm",
          scale: 1,
          duration: 800,
          sound: "modules/psfx/library/impacts/slashing/v1/meleeattack-impacts-slashing-01.ogg",
          soundVolume: 0.6,
        },
      },
      rifle: {
        label: "Rifle",
        patterns: "\\brifle\\b",
        type: "projectile",
        target: "target",
        hit: {
          file: "modules/JB2A_DnD5e/Library/Generic/Weapon_Attacks/Ranged/Snipe_01_Regular_Blue_15ft_1000x400.webm",
          scale: 1,
          sound: "modules/psfx/library/ranged-weapons/guns/revolver/single-fire/revolver-single-fire-001-03.ogg",
          soundVolume: 0.6,
        },
      },
      shortbow: {
        label: "Shortbow",
        patterns: "shortbow|short bow",
        type: "projectile",
        target: "target",
        hit: {
          file: "modules/JB2A_DnD5e/Library/Generic/Weapon_Attacks/Ranged/Arrow01_01_Regular_White_15ft_1000x400.webm",
          scale: 1,
          sound: "modules/psfx/library/ranged-weapons/longbow/v1/longbow-003-60ft.ogg",
          soundVolume: 0.6,
        },
      },
      shortsword: {
        label: "Shortsword",
        patterns: "shortsword|short sword",
        type: "onToken",
        target: "target",
        hit: {
          file: "modules/JB2A_DnD5e/Library/Generic/Weapon_Attacks/Melee/Shortsword01_03_Regular_White_800x600.webm",
          scale: 1,
          duration: 800,
          sound: "modules/psfx/library/impacts/slashing/v1/meleeattack-impacts-slashing-02.ogg",
          soundVolume: 0.6,
        },
      },
      shotgun: {
        label: "Shotgun",
        patterns: "shotgun(?!.*sawed|.*sawn)",
        type: "projectile",
        target: "target",
        hit: {
          file: "modules/JB2A_DnD5e/Library/Generic/Weapon_Attacks/Ranged/Bullet_02_Regular_Orange_05ft_600x400.webm",
          scale: 1,
          sound: "modules/psfx/library/ranged-weapons/guns/revolver/single-fire/revolver-single-fire-001-03.ogg",
          soundVolume: 0.6,
        },
      },
      shotgun_sawed_off: {
        label: "Shotgun, sawed-off",
        patterns: "shotgun.*sawed|shotgun.*sawn|sawed.off shotgun",
        type: "projectile",
        target: "target",
        hit: {
          file: "modules/JB2A_DnD5e/Library/Generic/Weapon_Attacks/Ranged/Bullet_02_Regular_Orange_05ft_600x400.webm",
          scale: 1,
          sound: "modules/psfx/library/ranged-weapons/guns/revolver/single-fire/revolver-single-fire-001-03.ogg",
          soundVolume: 0.6,
        },
      },
      sling: {
        label: "Sling",
        patterns: "\\bsling\\b",
        type: "projectile",
        target: "target",
        hit: {
          file: "modules/JB2A_DnD5e/Library/Generic/Weapon_Attacks/Ranged/Bullet_03_Regular_Blue_15ft_1000x400.webm",
          scale: 1,
          sound: "modules/psfx/library/ranged-weapons/guns/revolver/single-fire/revolver-single-fire-001-03.ogg",
          soundVolume: 0.6,
        },
      },
      spear: {
        label: "Spear",
        patterns: "\\bspear\\b(?!.*thrown)",
        type: "onToken",
        target: "target",
        hit: {
          file: "modules/JB2A_DnD5e/Library/Generic/Weapon_Attacks/Melee/Spear01_01_Regular_White_800x600.webm",
          scale: 1,
          duration: 800,
          sound: "modules/psfx/library/impacts/slashing/v1/meleeattack-impacts-slashing-03.ogg",
          soundVolume: 0.6,
        },
      },
      spear_thrown: {
        label: "Spear (Thrown)",
        patterns: "spear.*thrown|thrown.*spear",
        type: "onToken",
        target: "target",
        hit: {
          file: "modules/JB2A_DnD5e/Library/Generic/Weapon_Attacks/Melee/Spear01_01_Regular_White_800x600.webm",
          scale: 1,
          duration: 800,
          sound: "modules/psfx/library/impacts/slashing/v1/meleeattack-impacts-slashing-03.ogg",
          soundVolume: 0.6,
        },
      },
      staff: {
        label: "Staff",
        patterns: "\\bstaff\\b|quarterstaff",
        type: "onToken",
        target: "target",
        hit: {
          file: "modules/JB2A_DnD5e/Library/Generic/Weapon_Attacks/Melee/Quarterstaff01_03_Regular_White_800x600.webm",
          scale: 1,
          duration: 800,
          sound: "modules/psfx/library/impacts/bludgeoning/v1/meleeattack-impacts-bludgeoning-02.ogg",
          soundVolume: 0.6,
        },
      },
      standard_shield: {
        label: "Standard shield",
        patterns: "standard shield|\\bshield\\b(?!.*great|.*buckler)",
        type: "onToken",
        target: "target",
        hit: {
          file: "modules/JB2A_DnD5e/Library/Generic/Weapon_Attacks/Melee/Group06/MeleeAttack06_Shield01_01_Regular_White_800x600.webm",
          scale: 1,
          duration: 800,
          sound: "modules/psfx/library/impacts/bludgeoning/v1/meleeattack-impacts-bludgeoning-03.ogg",
          soundVolume: 0.6,
        },
      },
      unarmed: {
        label: "Unarmed",
        patterns: "unarmed|unarmed strike",
        type: "onToken",
        target: "target",
        hit: {
          file: "modules/JB2A_DnD5e/Library/Generic/Unarmed_Attacks/Unarmed_Strike/UnarmedStrike_01_Regular_Blue_Physical01_800x600.webm",
          scale: 1,
          duration: 800,
          sound: "modules/psfx/library/impacts/bludgeoning/v1/meleeattack-impacts-bludgeoning-00.ogg",
          soundVolume: 0.6,
        },
      },
      warhammer: {
        label: "Warhammer",
        patterns: "warhammer|war hammer",
        type: "onToken",
        target: "target",
        hit: {
          file: "modules/JB2A_DnD5e/Library/Generic/Weapon_Attacks/Melee/Warhammer01_05_Regular_White_800x600.webm",
          scale: 1,
          duration: 800,
          sound: "modules/psfx/library/impacts/bludgeoning/v1/meleeattack-impacts-bludgeoning-01.ogg",
          soundVolume: 0.6,
        },
      },
      whip_chain: {
        label: "Whip, chain",
        patterns: "whip.*chain|chain.*whip",
        type: "onToken",
        target: "target",
        hit: {
          file: "modules/JB2A_DnD5e/Library/Generic/RangedSpell/02/RangedInstant02_01_Regular_Yellow_30ft_1600x400.webm",
          scale: 1,
          duration: 800,
          sound: "modules/psfx/library/impacts/bludgeoning/v1/meleeattack-impacts-bludgeoning-02.ogg",
          soundVolume: 0.6,
        },
      },
      whip_leather: {
        label: "Whip, leather",
        patterns: "whip.*leather|leather.*whip|\\bwhip\\b(?!.*chain)",
        type: "onToken",
        target: "target",
        hit: {
          file: "modules/JB2A_DnD5e/Library/Generic/RangedSpell/03/RangedProjectile03_01_Regular_BlueGreen_30ft_1600x400.webm",
          scale: 1,
          duration: 800,
          sound: "modules/psfx/library/impacts/bludgeoning/v1/meleeattack-impacts-bludgeoning-03.ogg",
          soundVolume: 0.6,
        },
      },
    },

    weaponSkillFallbacks: {
      // melee → longsword
      melee: {
        label: "Melee (generic)",
        type: "onToken",
        target: "target",
        hit: {
          file: "modules/JB2A_DnD5e/Library/Generic/Weapon_Attacks/Melee/Sword01_05_Regular_White_800x600.webm",
          scale: 1,
          duration: 800,
          sound: "modules/psfx/library/impacts/slashing/v1/meleeattack-impacts-slashing-03.ogg",
          soundVolume: 0.6,
        },
      },
      // finesse → dagger
      finesse: {
        label: "Finesse (generic)",
        type: "onToken",
        target: "target",
        hit: {
          file: "modules/JB2A_DnD5e/Library/Generic/Weapon_Attacks/Melee/Dagger02_01_Regular_White_800x600.webm",
          scale: 1,
          duration: 800,
          sound: "modules/psfx/library/impacts/slashing/v1/meleeattack-impacts-slashing-02.ogg",
          soundVolume: 0.6,
        },
      },
      // brawl → unarmed
      brawl: {
        label: "Brawl (generic)",
        type: "onToken",
        target: "target",
        hit: {
          file: "modules/JB2A_DnD5e/Library/Generic/Unarmed_Attacks/Unarmed_Strike/UnarmedStrike_01_Regular_Blue_Physical01_800x600.webm",
          scale: 1,
          duration: 800,
          sound: "modules/psfx/library/impacts/bludgeoning/v1/meleeattack-impacts-bludgeoning-00.ogg",
          soundVolume: 0.6,
        },
      },
      // ranged → longbow
      ranged: {
        label: "Ranged (generic)",
        type: "projectile",
        target: "target",
        hit: {
          file: "modules/JB2A_DnD5e/Library/Generic/Weapon_Attacks/Ranged/Arrow01_01_Regular_White_15ft_1000x400.webm",
          scale: 1,
          sound: "modules/psfx/library/ranged-weapons/longbow/v1/longbow-003-60ft.ogg",
          soundVolume: 0.6,
        },
      },
      // _default → longsword
      _default: {
        label: "Default Weapon",
        type: "onToken",
        target: "target",
        hit: {
          file: "modules/JB2A_DnD5e/Library/Generic/Weapon_Attacks/Melee/Sword01_05_Regular_White_800x600.webm",
          scale: 1,
          duration: 800,
          sound: "modules/psfx/library/impacts/slashing/v1/meleeattack-impacts-slashing-03.ogg",
          soundVolume: 0.6,
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
          file: `${R}/Generic/Creature/Bite_01_Regular_Red_400x400.webm`,
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
          file: `${R}/Generic/Creature/Claw/CreatureAttackClaw_001_001_Red_800x600.webm`,
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
