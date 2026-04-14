# Undead — 22 monsters

Generated: 2026-04-14T20:55:00.591Z

| Name | HD | TL | Armor | Zone | Actions | Abilities | Findings |
|---|---|---|---|---|---|---|---|
| Banshee | 7 | 3.6 | 4 as (+1) Plate | midline | 2 | 2 | 5 |
| Carrion Clump | 2 | 0.9 | 1 as Leather | frontline | 1 | 0 | 0 |
| Church Grim | 4 | 4.6 | 2 as Chain | frontline | 3 | 2 | 2 |
| Crawling Claw | 2 | 1 | 1 as Leather | frontline | 1 | 0 | 0 |
| Death Knight | 11 | 9.6 | 4 as (+2) Chain | frontline | 4 | 3 | 3 |
| Ghost | 10 | 3.8 | 4 as (+1) Plate | frontline | 2 | 2 | 6 |
| Ghoul | 2 | 2 | 1 as Leather | frontline | 3 | 1 | 0 |
| Grim Reaper | 1 | 0 | 8 as (+5) Heavy |  | 1 | 1 | 2 |
| Lich | 11 | 8.5 | 4 as (+1) Plate | frontline | 7 | 5 | 3 |
| Mummy | 6 | 2.8 | 3 as Plate | midline | 2 | 1 | 2 |
| Mummy Lord | 13 | 7 | 4 as (+1) Plate | backline | 2 | 3 | 2 |
| Shadow | 2 | 1.6 | 1 as Leather | frontline | 1 | 2 | 5 |
| Skeleton | 1 | 1.2 | 1 as Leather | midline | 1 | 1 | 2 |
| Skeleton, Blazing Bones | 1 | 1.6 | 1 as Leather | frontline | 2 | 1 | 2 |
| Skeleton, Giant | 6 | 4.7 | 2 as Chain | frontline | 3 | 1 | 2 |
| Vampire | 8 | 6.7 | 4 as (+1) Plate | midline | 4 | 4 | 4 |
| Wight | 4 | 2.2 | 2 as Chain | frontline | 2 | 1 | 2 |
| Wraith | 5 | 2.7 | 3 as Plate | frontline | 1 | 3 | 5 |
| Zombie | 2 | 0.9 | 0 as Unarmored | frontline | 1 | 2 | 2 |
| Zombie Dragon | 25 | 9.1 | 3 as (+2) Leather | frontline | 4 | 3 | 2 |
| Zombie, Boomer | 3 | 2 | 0 as Unarmored | frontline | 1 | 2 | 3 |
| Zombie, Drowner | 2 | 0.9 | 0 as Unarmored | frontline | 2 | 1 | 2 |

---

## Details

### Banshee

- UUID: `Compendium.vagabond.bestiary.Actor.6l3L0a8gHCSRGPlQ`
- HD 7 · TL 3.6 · Armor 4 (as (+1) Plate) · medium · Zone midline · Morale 12 · Appearing 1
- Speed 0 / fly, phase · Senses: All-Sight
- Immune: cold, poison, shock, physical
- Weak: silver
- Status Immune: charmed, fatigued, frightened, paralyzed, prone, sickened

**Actions (2)**

| Name | Type | Damage | Note | Recharge | Status |
|---|---|---|---|---|---|
| Wail | castClose | — | Action while in darkness, all Near who hear it \| Will | 1/Day | frightened |
| Chill Touch | melee | +4 1d8 (cold) | Melee Attack |  | — |

**Abilities (2)**

- **Nightwalker** — Can’t Move or Target over lines of salt or in areas illuminated by Sunlight. It is Incapacitated and Burning (d8) while in Sunlight.
- **Terror II** — [Enemies' first time seeing it and on their Turns \| Will]: Frightened until they pass this Check on a subsequent Turn, or for Cd6 after.

**Findings (5)**

- ⚠️ `damageless-requiresDamage`: Banshee / "Wail": causedStatus "frightened" has requiresDamage=true but the action deals no damage — status can never apply by that rule.
- ℹ️ `speed-ambiguous`: Banshee: speedTypes entry "phase" has no speed and speedValues.phase is 0. Implicit base speed? Intent unclear.
- ⚠️ `unimplemented-passive`: Ability "Nightwalker" describes mechanical effects (burning, incapacitated) but has no automation in scripts/npc-abilities.mjs.
- ⚠️ `unimplemented-passive`: Ability "Terror II" describes mechanical effects (frightened) but has no automation in scripts/npc-abilities.mjs.
- ⚠️ `ability-mentions-status-without-action`: Ability "Nightwalker" on Banshee mentions Burning, Incapacitated, but no action on this monster applies those statuses.

### Carrion Clump

- UUID: `Compendium.vagabond.bestiary.Actor.IK2zXCOyRBKU8rS2`
- HD 2 · TL 0.9 · Armor 1 (as Leather) · medium · Zone frontline · Morale 12 · Appearing d6
- Speed 10 · Senses: Blindsight
- Immune: poison
- Weak: acid, silver
- Status Immune: charmed, fatigued, sickened

**Actions (1)**

| Name | Type | Damage | Note | Recharge | Status |
|---|---|---|---|---|---|
| Viscera Sling | ranged | +3 1d6 | Ranged Attack |  | sickened |

### Church Grim

- UUID: `Compendium.vagabond.bestiary.Actor.TeXpYvmYgkwz7Rkd`
- HD 4 · TL 4.6 · Armor 2 (as Chain) · medium · Zone frontline · Morale 12 · Appearing 1
- Speed 40 · Senses: Darksight
- Immune: physical
- Weak: silver
- Status Immune: charmed, fatigued, sickened

**Actions (3)**

| Name | Type | Damage | Note | Recharge | Status |
|---|---|---|---|---|---|
| Combo | melee | — |  |  | — |
| Bite | melee | +4 1d8 | Melee Attack |  | — |
| Claws | melee | +3 1d6 | Melee Attack |  | — |

**Abilities (2)**

- **Bloodthirst** — It is Berserk and Beings at or below half HP make Checks against it as if Vulnerable.
- **Grim Resurrection** — It dies instantly if its original corpse is destroyed. If it drops to 0 HP and its original corpse is not destroyed, it vanishes in a puff of smoke and reapparates in its church of origin in the next Scene at full HP.

**Findings (2)**

- ⚠️ `unimplemented-passive`: Ability "Bloodthirst" describes mechanical effects (berserk, vulnerable) but has no automation in scripts/npc-abilities.mjs.
- ⚠️ `ability-mentions-status-without-action`: Ability "Bloodthirst" on Church Grim mentions Berserk, Vulnerable, but no action on this monster applies those statuses.

### Crawling Claw

- UUID: `Compendium.vagabond.bestiary.Actor.15zTuWanUAXWX4Ee`
- HD 2 · TL 1 · Armor 1 (as Leather) · small · Zone frontline · Morale 12 · Appearing d20
- Speed 25 · Senses: Blindsight
- Immune: poison
- Status Immune: charmed, fatigued, sickened

**Actions (1)**

| Name | Type | Damage | Note | Recharge | Status |
|---|---|---|---|---|---|
| Claw | melee | +2 1d4 | Melee Attack |  | — |

### Death Knight

- UUID: `Compendium.vagabond.bestiary.Actor.AJp7YGvfDGB2C1Yp`
- HD 11 · TL 9.6 · Armor 4 (as (+2) Chain) · medium · Zone frontline · Morale 12 · Appearing 1
- Speed 25 · Senses: Allsight, Darksight
- Immune: fire, poison, physical
- Status Immune: fatigued, frightened, sickened

**Actions (4)**

| Name | Type | Damage | Note | Recharge | Status |
|---|---|---|---|---|---|
| Stun | castRanged | — | Cast, all who hear it \| Will | 1/Day | paralyzed |
| Combo | melee | — |  |  | — |
| (+2) Longsword | melee | +6 1d8+2 | Melee Attack |  | — |
| Hellfire | castRanged | +35 10d6 (fire) | Cast, 20-foot Sphere \| Reflex | 1/Day | burning |

**Abilities (3)**

- **Fear Aura** — [Aura Near \| Will]: Frightened until they pass this Check on a subsequent Turn, or Cd6 after.
- **Dispel** — It can end a Spell affecting it at the start of its Turns.
- **Zombie** — It can't be reduced below 1 HP unless damaged by a Crit, damage it is Weak to, or while in Sunlight.

**Findings (3)**

- ⚠️ `damageless-requiresDamage`: Death Knight / "Stun": causedStatus "paralyzed" has requiresDamage=true but the action deals no damage — status can never apply by that rule.
- ⚠️ `unimplemented-passive`: Ability "Fear Aura" describes mechanical effects (frightened) but has no automation in scripts/npc-abilities.mjs.
- ⚠️ `ability-mentions-status-without-action`: Ability "Fear Aura" on Death Knight mentions Frightened, but no action on this monster applies those statuses.

### Ghost

- UUID: `Compendium.vagabond.bestiary.Actor.7t0wb4hi6Oh7vAK1`
- HD 10 · TL 3.8 · Armor 4 (as (+1) Plate) · medium · Zone frontline · Morale 12 · Appearing 1
- Speed 0 / fly, phase · Senses: Darksight
- Immune: acid, cold, fire, poison, shock, physical
- Weak: silver
- Status Immune: charmed, fatigued, paralyzed, prone, sickened

**Actions (2)**

| Name | Type | Damage | Note | Recharge | Status |
|---|---|---|---|---|---|
| Chill Touch | castClose | +3 1d6 (cold) | Cast, Touch \| Endure |  | — |
| Possession | castRanged | — | Cast, Remote \| Will | Cd6 | — |

**Abilities (2)**

- **Aging Terror II** — [Enemies' first time seeing it and on their Turns \| Will]: Frightened (Cd6) and aged 10 (d20) years.
- **Nightwalker** — Can’t Move or Target over lines of salt or in areas illuminated by Sunlight. It is Incapacitated and Burning (d8) while in Sunlight.

**Findings (6)**

- ℹ️ `save-mention-orphan`: Ghost / "Possession": note mentions save type(s) will but action has no causedStatuses and no damage.
- ℹ️ `speed-ambiguous`: Ghost: speedTypes entry "phase" has no speed and speedValues.phase is 0. Implicit base speed? Intent unclear.
- ⚠️ `unimplemented-passive`: Ability "Aging Terror II" describes mechanical effects (frightened) but has no automation in scripts/npc-abilities.mjs.
- ⚠️ `unimplemented-passive`: Ability "Nightwalker" describes mechanical effects (burning, incapacitated) but has no automation in scripts/npc-abilities.mjs.
- ⚠️ `ability-mentions-status-without-action`: Ability "Aging Terror II" on Ghost mentions Frightened, but no action on this monster applies those statuses.
- ⚠️ `ability-mentions-status-without-action`: Ability "Nightwalker" on Ghost mentions Burning, Incapacitated, but no action on this monster applies those statuses.

### Ghoul

- UUID: `Compendium.vagabond.bestiary.Actor.s62GZ293jOYSyOzO`
- HD 2 · TL 2 · Armor 1 (as Leather) · medium · Zone frontline · Morale 12 · Appearing 2d6
- Speed 30 · Senses: Darksight
- Immune: poison
- Weak: silver
- Status Immune: charmed, frightened, sickened

**Actions (3)**

| Name | Type | Damage | Note | Recharge | Status |
|---|---|---|---|---|---|
| Combo | melee | — |  |  | — |
| Bite | melee | +2 1d4 | Melee Attack |  | paralyzed |
| Claw | melee | +2 1d4 | Melee Attack |  | paralyzed |

**Abilities (1)**

- **Zombie** — It can't be reduced below 1 HP unless damaged by a Crit, damage it is Weak to, or while in Sunlight.

### Grim Reaper

- UUID: `Compendium.vagabond.bestiary.Actor.veGvTkYC104yHS0D`
- HD 1 · TL 0 · Armor 8 (as (+5) Heavy) · medium · Zone  · Morale 12 · Appearing 
- Speed 60 / fly, phase · Senses: Allsight, Darksight
- Immune: cold, fire, poison, shock
- Weak: silver
- Status Immune: charmed, confused, frightened, paralyzed, restrained, sickened

**Actions (1)**

| Name | Type | Damage | Note | Recharge | Status |
|---|---|---|---|---|---|
| Scythe | melee | +9 2d8 |  |  | — |

**Abilities (1)**

- **Inevitable** — Its attacks can't be Blocked or Dodged.

**Findings (2)**

- ℹ️ `speed-ambiguous`: Grim Reaper: speedTypes entry "fly" has no speed and speedValues.fly is 0. Implicit base speed? Intent unclear.
- ℹ️ `speed-ambiguous`: Grim Reaper: speedTypes entry "phase" has no speed and speedValues.phase is 0. Implicit base speed? Intent unclear.

### Lich

- UUID: `Compendium.vagabond.bestiary.Actor.eIjbp2eHJHXPG5kI`
- HD 11 · TL 8.5 · Armor 4 (as (+1) Plate) · medium · Zone frontline · Morale 8 · Appearing 1
- Speed 20 / fly · Senses: All-Sight
- Immune: poison
- Status Immune: berserk, charmed, confused, fatigued, frightened, paralyzed, sickened, suffocating, unconscious

**Actions (7)**

| Name | Type | Damage | Note | Recharge | Status |
|---|---|---|---|---|---|
| Dominator | melee | — | 2 Actions as below (d6 to determine) |  | — |
| 1 - Anti-Life Drain | castRanged | +10 3d6 | Cast, Remote \| Endure |  | — |
| 2 -Disintegrate | castRanged | +21 6d6 | Cast, Remote \| Endure | Cd4 | — |
| 3 - Raise | ranged | — | Cast, a corpse in Far |  | — |
| 4 - Death Touch | melee | +5 d10 | Cast, Remote \| Endure |  | paralyzed |
| 5 - Fear | castRanged | — | Cast, Aura Far \| Will |  | frightened |
| 6 - Life Disruption | melee | +10 3d6 | Cast, Aura Near \| Endure |  | — |

**Abilities (5)**

- **Fear Aura** — [Aura Near \| Will]: Frightened until they pass this Check on a subsequent Turn, or Cd6 after.
- **Indomitable** — It can't be transformed.
- **Grim Harvester** — Whenever a Being dies within Far, this Being regains HP equal to that Being's HD or Level.
- **Magic Ward V** — The first time it is unwillingly affected by a Spell each Round, the Caster must spend an extra 5 Mana to affect it.
- **Soul Jar** — It can't die if it has a Soul Jar intact.

**Findings (3)**

- ⚠️ `damageless-requiresDamage`: Lich / "5 - Fear": causedStatus "frightened" has requiresDamage=true but the action deals no damage — status can never apply by that rule.
- ℹ️ `speed-ambiguous`: Lich: speedTypes entry "fly" has no speed and speedValues.fly is 0. Implicit base speed? Intent unclear.
- ⚠️ `unimplemented-passive`: Ability "Fear Aura" describes mechanical effects (frightened) but has no automation in scripts/npc-abilities.mjs.

### Mummy

- UUID: `Compendium.vagabond.bestiary.Actor.bPJsV7dXotbgPIH8`
- HD 6 · TL 2.8 · Armor 3 (as Plate) · medium · Zone midline · Morale 12 · Appearing 2d4
- Speed 25 · Senses: Darksight
- Immune: poison, physical
- Weak: fire, silver
- Status Immune: berserk, charmed, confused, fatigued, frightened, sickened

**Actions (2)**

| Name | Type | Damage | Note | Recharge | Status |
|---|---|---|---|---|---|
| Glare | castRanged | — | Cast, Sight \| Will | Cd4 | frightened, paralyzed |
| Cursed Touch | melee | +3 1d6 | Melee Attack |  | — |

**Abilities (1)**

- **** — The first time it is unwillingly affected by a Spell each Round, the Caster must spend an extra 1 Mana to affect it.

**Findings (2)**

- ⚠️ `damageless-requiresDamage`: Mummy / "Glare": causedStatus "frightened" has requiresDamage=true but the action deals no damage — status can never apply by that rule.
- ⚠️ `damageless-requiresDamage`: Mummy / "Glare": causedStatus "paralyzed" has requiresDamage=true but the action deals no damage — status can never apply by that rule.

### Mummy Lord

- UUID: `Compendium.vagabond.bestiary.Actor.wvnFUicXjGnzt7w6`
- HD 13 · TL 7 · Armor 4 (as (+1) Plate) · medium · Zone backline · Morale 12 · Appearing 1
- Speed 30 · Senses: Darksight
- Immune: poison, physical
- Weak: fire, silver
- Status Immune: berserk, charmed, confused, fatigued, frightened, sickened

**Actions (2)**

| Name | Type | Damage | Note | Recharge | Status |
|---|---|---|---|---|---|
| Glare | castRanged | — | Cast, Sight \| Will | Cd4 | frightened, paralyzed |
| Cursed Touch | melee | +10 3d6 | Melee Attack |  | — |

**Abilities (3)**

- **Magic Ward II** — The first time it is unwillingly affected by a Spell each Round, the Caster must spend an extra 2 Mana to affect it.
- **Doom Magnet** — Near Enemies can't gain Favor.
- **Zombie** — It can't be reduced below 1 HP unless damaged by a Crit, damage it is Weak to, or while in Sunlight.

**Findings (2)**

- ⚠️ `damageless-requiresDamage`: Mummy Lord / "Glare": causedStatus "frightened" has requiresDamage=true but the action deals no damage — status can never apply by that rule.
- ⚠️ `damageless-requiresDamage`: Mummy Lord / "Glare": causedStatus "paralyzed" has requiresDamage=true but the action deals no damage — status can never apply by that rule.

### Shadow

- UUID: `Compendium.vagabond.bestiary.Actor.zJTSUTgRHCA1233u`
- HD 2 · TL 1.6 · Armor 1 (as Leather) · medium · Zone frontline · Morale 12 · Appearing 2d6
- Speed 30 / phase · Senses: Darksight
- Immune: poison, physical
- Weak: silver
- Status Immune: charmed, fatigued, frightened, paralyzed, prone, sickened, unconscious

**Actions (1)**

| Name | Type | Damage | Note | Recharge | Status |
|---|---|---|---|---|---|
| Life Drain | melee | +5 2d4 | Melee Attack |  | — |

**Abilities (2)**

- **Nightwalker** — Can’t Move or Target over lines of salt or in areas illuminated by Sunlight. It is Incapacitated and Burning (d8) while in Sunlight.
- **Shadow Stealth** — It is Invisible in the Dark.

**Findings (5)**

- ℹ️ `speed-ambiguous`: Shadow: speedTypes entry "phase" has no speed and speedValues.phase is 0. Implicit base speed? Intent unclear.
- ⚠️ `unimplemented-passive`: Ability "Nightwalker" describes mechanical effects (burning, incapacitated) but has no automation in scripts/npc-abilities.mjs.
- ⚠️ `unimplemented-passive`: Ability "Shadow Stealth" describes mechanical effects (invisible) but has no automation in scripts/npc-abilities.mjs.
- ⚠️ `ability-mentions-status-without-action`: Ability "Nightwalker" on Shadow mentions Burning, Incapacitated, but no action on this monster applies those statuses.
- ⚠️ `ability-mentions-status-without-action`: Ability "Shadow Stealth" on Shadow mentions Invisible, but no action on this monster applies those statuses.

### Skeleton

- UUID: `Compendium.vagabond.bestiary.Actor.IcbNlle1cmGen0Kk`
- HD 1 · TL 1.2 · Armor 1 (as Leather) · medium · Zone midline · Morale 12 · Appearing d6
- Speed 30
- Immune: piercing, poison, slashing
- Weak: blunt, silver
- Status Immune: fatigued, sickened, unconscious

**Actions (1)**

| Name | Type | Damage | Note | Recharge | Status |
|---|---|---|---|---|---|
| Weapon | melee | +3 1d6 | Melee Attack |  | — |

**Abilities (1)**

- **Nightwalker** — Can’t Move or Target over lines of salt or in areas illuminated by Sunlight. It is Incapacitated and Burning (d8) while in Sunlight.

**Findings (2)**

- ⚠️ `unimplemented-passive`: Ability "Nightwalker" describes mechanical effects (burning, incapacitated) but has no automation in scripts/npc-abilities.mjs.
- ⚠️ `ability-mentions-status-without-action`: Ability "Nightwalker" on Skeleton mentions Burning, Incapacitated, but no action on this monster applies those statuses.

### Skeleton, Blazing Bones

- UUID: `Compendium.vagabond.bestiary.Actor.56Wb96lj19hGzOB9`
- HD 1 · TL 1.6 · Armor 1 (as Leather) · medium · Zone frontline · Morale 12 · Appearing 1
- Speed 30
- Immune: fire, piercing, poison, slashing
- Weak: blunt, silver
- Status Immune: fatigued, sickened

**Actions (2)**

| Name | Type | Damage | Note | Recharge | Status |
|---|---|---|---|---|---|
| Hurl Fire | castRanged | +3 1d6 (fire) | Cast, Bolt \| Reflex |  | burning |
| Grapple | melee | — | Melee Attack |  | restrained |

**Abilities (1)**

- **Flame Aura** — Close Beings are Burning (d6).

**Findings (2)**

- ⚠️ `damageless-requiresDamage`: Skeleton, Blazing Bones / "Grapple": causedStatus "restrained" has requiresDamage=true but the action deals no damage — status can never apply by that rule.
- ⚠️ `unimplemented-passive`: Ability "Flame Aura" describes mechanical effects (burning) but has no automation in scripts/npc-abilities.mjs.

### Skeleton, Giant

- UUID: `Compendium.vagabond.bestiary.Actor.FTyGaeKSe3Hhi2aw`
- HD 6 · TL 4.7 · Armor 2 (as Chain) · huge · Zone frontline · Morale 12 · Appearing 1
- Speed 30
- Immune: piercing, poison, slashing
- Weak: blunt, silver
- Status Immune: fatigued, sickened, unconscious

**Actions (3)**

| Name | Type | Damage | Note | Recharge | Status |
|---|---|---|---|---|---|
| Combo | melee | — |  |  | — |
| Colossal Sword | melee | +9 2d8 | Melee Attack |  | — |
| Weapon | melee | +7 2d6 | Melee Attack |  | — |

**Abilities (1)**

- **Nightwalker** — Can’t Move or Target over lines of salt or in areas illuminated by Sunlight. It is Incapacitated and Burning (d8) while in Sunlight.

**Findings (2)**

- ⚠️ `unimplemented-passive`: Ability "Nightwalker" describes mechanical effects (burning, incapacitated) but has no automation in scripts/npc-abilities.mjs.
- ⚠️ `ability-mentions-status-without-action`: Ability "Nightwalker" on Skeleton, Giant mentions Burning, Incapacitated, but no action on this monster applies those statuses.

### Vampire

- UUID: `Compendium.vagabond.bestiary.Actor.UGMhE8UODeuZf3Ms`
- HD 8 · TL 6.7 · Armor 4 (as (+1) Plate) · medium · Zone midline · Morale 12 · Appearing d4
- Speed 35 / fly · Senses: Darksight, Telepathy
- Immune: cold, poison, physical
- Weak: silver
- Status Immune: charmed, fatigued, paralyzed, sickened

**Actions (4)**

| Name | Type | Damage | Note | Recharge | Status |
|---|---|---|---|---|---|
| Enthrall | castRanged | — | Cast, all Beings that can see it \| Will | Cd6 | charmed |
| Combo | melee | — |  |  | — |
| Bite | melee | +7 2d6 | Melee Attack |  | — |
| Claw | melee | +7 3d4 | Melee Attack |  | — |

**Abilities (4)**

- **Magic Ward II** — The first time it is unwillingly affected by a Spell each Round, the Caster must spend an extra 2 Mana to affect it.
- **Shapeshift** — It can use its Action to change into a bat, owl, rat, or wolf. It typically does so to retreat.
- **Sunlight Hypersensitivity** — It is Burning (d8) while illuminated by Sunlight.
- **Vampiric** — It regenerates 3 HP at the start of its Turn unless it is in Sunlight. If it is killed, it reforms in its resting place after 1 Day unless either: A wooden stake is stabbed through its heart; It dies in Sunlight or while doused in holy water; It consumes garlic.

**Findings (4)**

- ⚠️ `damageless-requiresDamage`: Vampire / "Enthrall": causedStatus "charmed" has requiresDamage=true but the action deals no damage — status can never apply by that rule.
- ℹ️ `speed-ambiguous`: Vampire: speedTypes entry "fly" has no speed and speedValues.fly is 0. Implicit base speed? Intent unclear.
- ⚠️ `unimplemented-passive`: Ability "Sunlight Hypersensitivity" describes mechanical effects (burning) but has no automation in scripts/npc-abilities.mjs.
- ⚠️ `ability-mentions-status-without-action`: Ability "Sunlight Hypersensitivity" on Vampire mentions Burning, but no action on this monster applies those statuses.

### Wight

- UUID: `Compendium.vagabond.bestiary.Actor.Dq3ik1JY5uCLzUDV`
- HD 4 · TL 2.2 · Armor 2 (as Chain) · medium · Zone frontline · Morale 12 · Appearing 2d8
- Speed 25 · Senses: Darksight
- Immune: poison, physical
- Weak: silver
- Status Immune: berserk, charmed, confused, fatigued, frightened, sickened

**Actions (2)**

| Name | Type | Damage | Note | Recharge | Status |
|---|---|---|---|---|---|
| Energy Drain | castClose | +3 1d6 (necrotic) | Cast, Touch \| Reflex |  | — |
| Longsword | melee | +4 1d8 | Melee Attack |  | — |

**Abilities (1)**

- **Nightwalker** — Can’t Move or Target over lines of salt or in areas illuminated by Sunlight. It is Incapacitated and Burning (d8) while in Sunlight.

**Findings (2)**

- ⚠️ `unimplemented-passive`: Ability "Nightwalker" describes mechanical effects (burning, incapacitated) but has no automation in scripts/npc-abilities.mjs.
- ⚠️ `ability-mentions-status-without-action`: Ability "Nightwalker" on Wight mentions Burning, Incapacitated, but no action on this monster applies those statuses.

### Wraith

- UUID: `Compendium.vagabond.bestiary.Actor.m8Q6WWcR8LGOFJde`
- HD 5 · TL 2.7 · Armor 3 (as Plate) · medium · Zone frontline · Morale 12 · Appearing 2d6
- Speed 30 / phase · Senses: Darksight
- Immune: physical
- Weak: silver
- Status Immune: charmed, fatigued, frightened, paralyzed, prone, sickened

**Actions (1)**

| Name | Type | Damage | Note | Recharge | Status |
|---|---|---|---|---|---|
| Energy Drain | castClose | +3 1d6 (necrotic) | Cast, Touch |  | — |

**Abilities (3)**

- **Nightwalker** — Can’t Move or Target over lines of salt or in areas illuminated by Sunlight. It is Incapacitated and Burning (d8) while in Sunlight.
- **Incorporeal** — It can Move into occupied space.
- **Shadow Stealth** — It is Invisible in the Dark.

**Findings (5)**

- ℹ️ `speed-ambiguous`: Wraith: speedTypes entry "phase" has no speed and speedValues.phase is 0. Implicit base speed? Intent unclear.
- ⚠️ `unimplemented-passive`: Ability "Nightwalker" describes mechanical effects (burning, incapacitated) but has no automation in scripts/npc-abilities.mjs.
- ⚠️ `unimplemented-passive`: Ability "Shadow Stealth" describes mechanical effects (invisible) but has no automation in scripts/npc-abilities.mjs.
- ⚠️ `ability-mentions-status-without-action`: Ability "Nightwalker" on Wraith mentions Burning, Incapacitated, but no action on this monster applies those statuses.
- ⚠️ `ability-mentions-status-without-action`: Ability "Shadow Stealth" on Wraith mentions Invisible, but no action on this monster applies those statuses.

### Zombie

- UUID: `Compendium.vagabond.bestiary.Actor.wNK06vFyHkFkvgLO`
- HD 2 · TL 0.9 · Armor 0 (as Unarmored) · medium · Zone frontline · Morale 12 · Appearing 3d8
- Speed 20 · Senses: Darksight
- Immune: poison
- Weak: silver
- Status Immune: berserk, charmed, confused, fatigued, frightened, sickened

**Actions (1)**

| Name | Type | Damage | Note | Recharge | Status |
|---|---|---|---|---|---|
| Bite | melee | +3 1d6 | Melee Attack |  | — |

**Abilities (2)**

- **Nightwalker** — Can’t Move or Target over lines of salt or in areas illuminated by Sunlight. It is Incapacitated and Burning (d8) while in Sunlight.
- **Zombie** — It can't be reduced below 1 HP unless damaged by a Crit, damage it is Weak to, or while in Sunlight.

**Findings (2)**

- ⚠️ `unimplemented-passive`: Ability "Nightwalker" describes mechanical effects (burning, incapacitated) but has no automation in scripts/npc-abilities.mjs.
- ⚠️ `ability-mentions-status-without-action`: Ability "Nightwalker" on Zombie mentions Burning, Incapacitated, but no action on this monster applies those statuses.

### Zombie Dragon

- UUID: `Compendium.vagabond.bestiary.Actor.4pxjze1TRnSTeGxV`
- HD 25 · TL 9.1 · Armor 3 (as (+2) Leather) · giant · Zone frontline · Morale 12 · Appearing 1
- Speed 30 / fly · Senses: Blindsight
- Immune: cold, poison, physical
- Weak: silver
- Status Immune: berserk, charmed, confused, fatigued, frightened, sickened

**Actions (4)**

| Name | Type | Damage | Note | Recharge | Status |
|---|---|---|---|---|---|
| Multi-Attack | melee | — |  |  | — |
| Gore Spray | castRanged | +7 2d6 | Attack, Far Cone | Cd4 | sickened |
| Bite | melee | +9 2d8 | Melee Attack |  | — |
| (+1) Claw | melee | +4 1d6+1 | Melee Attack |  | — |

**Abilities (3)**

- **Grim Harvester** — Whenever a Being dies within Far, this Being regains HP equal to that Being's HD or Level.
- **Terror III** — [Enemies' first time seeing it and on their Turns \| Will]: Frightened until they pass this Save on a subsequent Turn, or for Cd8 after.
- **Zombie** — It can't be reduced below 1 HP unless dealt by a Crit, damage it is Weak to, or while in Sunlight.

**Findings (2)**

- ⚠️ `unimplemented-passive`: Ability "Terror III" describes mechanical effects (frightened, must-pass) but has no automation in scripts/npc-abilities.mjs.
- ⚠️ `ability-mentions-status-without-action`: Ability "Terror III" on Zombie Dragon mentions Frightened, but no action on this monster applies those statuses.

### Zombie, Boomer

- UUID: `Compendium.vagabond.bestiary.Actor.hLO69Zjvz7WaJAmO`
- HD 3 · TL 2 · Armor 0 (as Unarmored) · medium · Zone frontline · Morale 12 · Appearing d8
- Speed 20 · Senses: Darksight
- Immune: poison
- Weak: silver
- Status Immune: berserk, charmed, confused, fatigued, frightened, sickened

**Actions (1)**

| Name | Type | Damage | Note | Recharge | Status |
|---|---|---|---|---|---|
| Boom | castClose | +7 2d6 | Action, Aura Near \| Reflex |  | — |

**Abilities (2)**

- **Nightwalker** — Can’t Move or Target over lines of salt or in areas illuminated by Sunlight. It is Incapacitated and Burning (d8) while in Sunlight.
- **Zombie** — It can't be reduced below 1 HP unless damaged by a Crit, damage it is Weak to, or while in Sunlight.

**Findings (3)**

- ⚠️ `extraInfo-status-mismatch`: Zombie, Boomer / "Boom": extraInfo mentions Sickened but causedStatuses does not include these ids.
- ⚠️ `unimplemented-passive`: Ability "Nightwalker" describes mechanical effects (burning, incapacitated) but has no automation in scripts/npc-abilities.mjs.
- ⚠️ `ability-mentions-status-without-action`: Ability "Nightwalker" on Zombie, Boomer mentions Burning, Incapacitated, but no action on this monster applies those statuses.

### Zombie, Drowner

- UUID: `Compendium.vagabond.bestiary.Actor.4k5nmsYtlwGLqqdM`
- HD 2 · TL 0.9 · Armor 0 (as Unarmored) · medium · Zone frontline · Morale 12 · Appearing 3d8
- Speed 20 / swim · Senses: Darksight
- Immune: poison
- Weak: shock, silver
- Status Immune: berserk, charmed, confused, fatigued, frightened, sickened

**Actions (2)**

| Name | Type | Damage | Note | Recharge | Status |
|---|---|---|---|---|---|
| Bite | melee | +3 1d6 | Melee Attack, a Restrained Being |  | — |
| Grasp | melee | — | Melee Attack |  | restrained |

**Abilities (1)**

- **Zombie** — It can't be reduced below 1 HP unless dealt by a Crit, damage it is Weak to, or while in Sunlight.

**Findings (2)**

- ⚠️ `damageless-requiresDamage`: Zombie, Drowner / "Grasp": causedStatus "restrained" has requiresDamage=true but the action deals no damage — status can never apply by that rule.
- ℹ️ `speed-ambiguous`: Zombie, Drowner: speedTypes entry "swim" has no speed and speedValues.swim is 0. Implicit base speed? Intent unclear.
