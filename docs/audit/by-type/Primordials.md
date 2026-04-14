# Primordials — 35 monsters

Generated: 2026-04-14T20:55:00.591Z

| Name | HD | TL | Armor | Zone | Actions | Abilities | Findings |
|---|---|---|---|---|---|---|---|
| Air Bubble | 6 | 1.6 | 0 as Unarmored | frontline | 1 | 3 | 4 |
| Assassin Vine | 4 | 2 | 0 as Unarmored | frontline | 2 | 0 | 0 |
| Black Pudding | 10 | 8.2 | 2 as (+1) Leather | frontline | 1 | 5 | 9 |
| Efreeti | 10 | 5.7 | 3 as Plate | frontline | 5 | 1 | 4 |
| Elemental, Air | 12 | 5.6 | 4 as (+1) Plate | midline | 1 | 2 | 0 |
| Elemental, Earth | 12 | 5.6 | 4 as (+1) Plate | frontline | 1 | 1 | 0 |
| Elemental, Fire | 12 | 5.9 | 4 as (+1) Armor | midline | 1 | 3 | 1 |
| Elemental, Greater Air | 16 | 7.3 | 5 as (+2) Plate | midline | 1 | 2 | 0 |
| Elemental, Greater Earth | 16 | 7.3 | 5 as (+2) Plate | frontline | 1 | 1 | 0 |
| Elemental, Greater Fire | 16 | 8.3 | 5 as (+2) Armor | midline | 1 | 3 | 1 |
| Elemental, Greater Water | 16 | 7.3 | 5 as (+2) Plate | midline | 1 | 1 | 0 |
| Elemental, Lesser Air | 8 | 3.9 | 3 as Plate | midline | 1 | 2 | 0 |
| Elemental, Lesser Earth | 8 | 3.9 | 3 as Plate | frontline | 1 | 1 | 0 |
| Elemental, Lesser Fire | 8 | 3.6 | 3 as Plate | midline | 1 | 3 | 1 |
| Elemental, Lesser Water | 8 | 3.9 | 3 as Plate | midline | 1 | 1 | 0 |
| Elemental, Water | 12 | 5.6 | 4 as (+1) Plate | midline | 1 | 1 | 0 |
| Firebat | 1 | 1 | 1 as Leather | midline | 1 | 2 | 4 |
| Gelatinous Cube | 4 | 1.3 | 0 as Unarmored | frontline | 1 | 3 | 3 |
| Grasping Goo | 1 | 0.7 | 0 as Unarmored | frontline | 1 | 4 | 5 |
| Green Slime | 2 | 1 | 0 as Unarmored | frontline | 0 | 3 | 5 |
| Grey Ooze | 3 | 1.9 | 0 as Unarmored | frontline | 1 | 2 | 0 |
| Hydrangean | 2 | 2 | 1 as Leather | frontline | 2 | 2 | 2 |
| Invisible Stalker | 8 | 4.1 | 3 as Plate | frontline | 1 | 1 | 2 |
| Kelpie | 5 | 2.4 | 2 as Chain | backline | 2 | 2 | 3 |
| Magmot | 3 | 6.4 | 3 as Plate | frontline | 2 | 2 | 2 |
| Ochre Jelly | 5 | 1.7 | 0 as Unarmored | frontline | 1 | 2 | 2 |
| Ooze, Blood | 5 | 1.7 | 1 as Leather | frontline | 1 | 1 | 1 |
| Ooze, Ectoplasmic | 5 | 1.7 | 1 as Leather | frontline | 1 | 1 | 2 |
| Ooze, Quicksilver | 5 | 1.7 | 1 as Leather | frontline | 1 | 2 | 1 |
| Shambling Mound | 9 | 5.5 | 3 as Plate | frontline | 2 | 2 | 1 |
| Treant | 8 | 5.3 | 4 as (+1) Plate | frontline | 3 | 0 | 0 |
| Triffid | 2 | 1.6 | 1 as Leather | midline | 1 | 1 | 2 |
| Violet Fungus | 3 | 1.7 | 1 as Leather | frontline | 2 | 0 | 0 |
| Vortex | 2 | 2.9 | 3 as Plate | frontline | 0 | 2 | 3 |
| Yellow Mould | 2 | 0.9 | 0 as Unarmored |  | 0 | 1 | 2 |

---

## Details

### Air Bubble

- UUID: `Compendium.vagabond.bestiary.Actor.nYO6xGYPRmtNuhV9`
- HD 6 · TL 1.6 · Armor 0 (as Unarmored) · large · Zone frontline · Morale 10 · Appearing 1
- Speed 20 / fly · Senses: Blindsense
- Immune: acid, blunt, slashing
- Status Immune: charmed, prone, blinded

**Actions (1)**

| Name | Type | Damage | Note | Recharge | Status |
|---|---|---|---|---|---|
| Engulf | melee | — | Melee Attack |  | restrained |

**Abilities (3)**

- **Seep** — It can enter the space of other Beings and openings as small as 1 inch without squeezing.
- **Engulfer** — Beings that share its space are Burning (2d4).
- **Sticky** — Hinders attempts to end being Restrained by it. Beings that make physical contact with it must pass [Endure] or be Restrained.

**Findings (4)**

- ⚠️ `damageless-requiresDamage`: Air Bubble / "Engulf": causedStatus "restrained" has requiresDamage=true but the action deals no damage — status can never apply by that rule.
- ⚠️ `unimplemented-passive`: Ability "Engulfer" describes mechanical effects (burning) but has no automation in scripts/npc-abilities.mjs.
- ⚠️ `unimplemented-passive`: Ability "Sticky" describes mechanical effects (restrained, must-pass) but has no automation in scripts/npc-abilities.mjs.
- ⚠️ `ability-mentions-status-without-action`: Ability "Engulfer" on Air Bubble mentions Burning, but no action on this monster applies those statuses.

### Assassin Vine

- UUID: `Compendium.vagabond.bestiary.Actor.EjmMNTTsfwFpGdKW`
- HD 4 · TL 2 · Armor 0 (as Unarmored) · large · Zone frontline · Morale 12 · Appearing d4
- Speed 5 · Senses: Blindsight
- Weak: poison, slashing, fire
- Status Immune: sickened

**Actions (2)**

| Name | Type | Damage | Note | Recharge | Status |
|---|---|---|---|---|---|
| Constrain | melee | +9 2d8 | Melee Attack, Restrained Target |  | — |
| Vine | melee | +4 1d8 | Melee Attack, Near |  | restrained |

### Black Pudding

- UUID: `Compendium.vagabond.bestiary.Actor.RFENB7RObfPWSY34`
- HD 10 · TL 8.2 · Armor 2 (as (+1) Leather) · large · Zone frontline · Morale 12 · Appearing 1
- Speed 20 / cling · Senses: Blindsense
- Immune: acid, blunt, shock, slashing, cold
- Weak: fire
- Status Immune: charmed, frightened, prone, blinded

**Actions (1)**

| Name | Type | Damage | Note | Recharge | Status |
|---|---|---|---|---|---|
| Pseudopod | melee | +13 3d8 | Melee Attack |  | — |

**Abilities (5)**

- **Pudding Nature** — Is Dazed (1 Round) after being subjected to Cold.
- **Seep** — It can enter the space of other Beings and openings as small as 1 inch without squeezing.
- **Engulfer** — Beings that share a space with it are Burning 13 (3d8).
- **Pudding Split** — If it is larger than Small when subjected to Shock or Slash, it splits into two Black Puddings with half its current HP, round up, and are one size smaller. These deal 1 less d8 with its Pseudopod Action and Engulfer Ability.
- **Sticky** — Hinders attempts to end being Restrained by it. Beings that make physical contact with it must pass [Endure] or be Restrained.

**Findings (9)**

- ⚠️ `extraInfo-status-mismatch`: Black Pudding / "Pseudopod": extraInfo mentions Restrained but causedStatuses does not include these ids.
- ℹ️ `speed-ambiguous`: Black Pudding: speedTypes entry "cling" has no speed and speedValues.cling is 0. Implicit base speed? Intent unclear.
- ⚠️ `unimplemented-passive`: Ability "Engulfer" describes mechanical effects (burning) but has no automation in scripts/npc-abilities.mjs.
- ⚠️ `unimplemented-passive`: Ability "Pudding Nature" describes mechanical effects (dazed) but has no automation in scripts/npc-abilities.mjs.
- ⚠️ `unimplemented-passive`: Ability "Pudding Split" describes mechanical effects (deals-damage) but has no automation in scripts/npc-abilities.mjs.
- ⚠️ `unimplemented-passive`: Ability "Sticky" describes mechanical effects (restrained, must-pass) but has no automation in scripts/npc-abilities.mjs.
- ⚠️ `ability-mentions-status-without-action`: Ability "Engulfer" on Black Pudding mentions Burning, but no action on this monster applies those statuses.
- ⚠️ `ability-mentions-status-without-action`: Ability "Pudding Nature" on Black Pudding mentions Dazed, but no action on this monster applies those statuses.
- ⚠️ `ability-mentions-status-without-action`: Ability "Sticky" on Black Pudding mentions Restrained, but no action on this monster applies those statuses.

### Efreeti

- UUID: `Compendium.vagabond.bestiary.Actor.WPWcwr72e6bVPaAx`
- HD 10 · TL 5.7 · Armor 3 (as Plate) · large · Zone frontline · Morale 11 · Appearing 1
- Speed 80 / fly · Senses: Darksight
- Immune: fire

**Actions (5)**

| Name | Type | Damage | Note | Recharge | Status |
|---|---|---|---|---|---|
| Wall of Fire | castRanged | +0 | Cast, 60' Line \| Reflex | 3/Day | burning |
| Conjure Object | castRanged | +0 | Cast, Remote \| Reflex | 3/Day | — |
| Combo | melee | — |  |  | — |
| Fist | melee | +9 2d8 | Melee Attack |  | — |
| Invisibility | castClose | +0 | Cast, Touch \| Will |  | invisible |

**Abilities (1)**

- **Regenerate II** — Regains 9 (2d8) HP on each of its Turns.

**Findings (4)**

- ⚠️ `damageless-requiresDamage`: Efreeti / "Invisibility": causedStatus "invisible" has requiresDamage=true but the action deals no damage — status can never apply by that rule.
- ⚠️ `damageless-requiresDamage`: Efreeti / "Wall of Fire": causedStatus "burning" has requiresDamage=true but the action deals no damage — status can never apply by that rule.
- ℹ️ `save-mention-orphan`: Efreeti / "Conjure Object": note mentions save type(s) reflex but action has no causedStatuses and no damage.
- ⚠️ `unimplemented-passive`: Ability "Regenerate II" describes mechanical effects (regains-hp) but has no automation in scripts/npc-abilities.mjs.

### Elemental, Air

- UUID: `Compendium.vagabond.bestiary.Actor.4tgJAUkCwHMUbh0L`
- HD 12 · TL 5.6 · Armor 4 (as (+1) Plate) · large · Zone midline · Morale 10 · Appearing 1
- Speed 0 / fly · Senses: Blindsense
- Immune: poison, shock, physical
- Status Immune: fatigued, sickened, prone

**Actions (1)**

| Name | Type | Damage | Note | Recharge | Status |
|---|---|---|---|---|---|
| Gust | ranged | +9 2d8 | Ranged Attack |  | — |

**Abilities (2)**

- **Living Gale** — Gusts surround it out to Near, Hindering Enemy Ranged Attacks Targeting those within.
- **Seep** — It can enter the space of other Beings and openings as small as 1 inch without squeezing.

### Elemental, Earth

- UUID: `Compendium.vagabond.bestiary.Actor.MgwGpLpfzFgXxgEz`
- HD 12 · TL 5.6 · Armor 4 (as (+1) Plate) · large · Zone frontline · Morale 10 · Appearing 1
- Speed 30 · Senses: Seismicsense
- Immune: shock, poison
- Weak: blunt
- Status Immune: sickened, fatigued

**Actions (1)**

| Name | Type | Damage | Note | Recharge | Status |
|---|---|---|---|---|---|
| Strike | melee | +9 2d8 | Melee Attack |  | — |

**Abilities (1)**

- **Burrower** — It ignores Difficult Terrain of sand, stone, and earth, and it can Move by quickly burrowing in them. However, it can't cross water deeper than its height.

### Elemental, Fire

- UUID: `Compendium.vagabond.bestiary.Actor.MVEkTMHMnNsf6rxz`
- HD 12 · TL 5.9 · Armor 4 (as (+1) Armor) · large · Zone midline · Morale 10 · Appearing 1
- Speed 0 / fly · Senses: Blindsense
- Immune: physical, fire, poison
- Status Immune: prone, sickened, fatigued

**Actions (1)**

| Name | Type | Damage | Note | Recharge | Status |
|---|---|---|---|---|---|
| Flame | ranged | +9 2d8 (fire) | Ranged Attack |  | burning |

**Abilities (3)**

- **Living Fire** — Close Beings are Burning (d8).
- **Illuminating** — Sheds Light out to Near.
- **Seep** — It can enter the space of other Beings and openings as small as 1 inch without squeezing.

**Findings (1)**

- ⚠️ `unimplemented-passive`: Ability "Living Fire" describes mechanical effects (burning) but has no automation in scripts/npc-abilities.mjs.

### Elemental, Greater Air

- UUID: `Compendium.vagabond.bestiary.Actor.7Q4CeeNTFsoyIvLJ`
- HD 16 · TL 7.3 · Armor 5 (as (+2) Plate) · huge · Zone midline · Morale 10 · Appearing 1
- Speed 0 / fly · Senses: Blindsense
- Immune: poison, shock, physical
- Status Immune: fatigued, sickened, prone

**Actions (1)**

| Name | Type | Damage | Note | Recharge | Status |
|---|---|---|---|---|---|
| Gust | ranged | +13 3d8 | Ranged Attack |  | — |

**Abilities (2)**

- **Living Gale** — Gusts surround it out to Near, Hindering Enemy Ranged Attacks Targeting those within.
- **Seep** — It can enter the space of other Beings and openings as small as 1 inch without squeezing.

### Elemental, Greater Earth

- UUID: `Compendium.vagabond.bestiary.Actor.xx33Zy89J7w2Jbmf`
- HD 16 · TL 7.3 · Armor 5 (as (+2) Plate) · huge · Zone frontline · Morale 10 · Appearing 1
- Speed 40 · Senses: Seismicsense
- Immune: shock, poison
- Weak: blunt
- Status Immune: sickened, fatigued

**Actions (1)**

| Name | Type | Damage | Note | Recharge | Status |
|---|---|---|---|---|---|
| Strike | melee | +13 3d8 | Melee Attack |  | — |

**Abilities (1)**

- **Burrower** — It ignores Difficult Terrain of sand, stone, and earth, and it can Move by quickly burrowing in them. However, it can't cross water deeper than its height.

### Elemental, Greater Fire

- UUID: `Compendium.vagabond.bestiary.Actor.XqPwjVW3k3xNa9Ht`
- HD 16 · TL 8.3 · Armor 5 (as (+2) Armor) · huge · Zone midline · Morale 10 · Appearing 1
- Speed 0 / fly · Senses: Blindsense
- Immune: physical, fire, poison
- Status Immune: prone, sickened, fatigued

**Actions (1)**

| Name | Type | Damage | Note | Recharge | Status |
|---|---|---|---|---|---|
| Flame | ranged | +13 3d8 (fire) | Ranged Attack |  | burning |

**Abilities (3)**

- **Living Fire** — Close Beings are Burning (d10).
- **Illuminating** — Sheds Light out to Near.
- **Seep** — It can enter the space of other Beings and openings as small as 1 inch without squeezing.

**Findings (1)**

- ⚠️ `unimplemented-passive`: Ability "Living Fire" describes mechanical effects (burning) but has no automation in scripts/npc-abilities.mjs.

### Elemental, Greater Water

- UUID: `Compendium.vagabond.bestiary.Actor.x6LlT39h6rhvtCQi`
- HD 16 · TL 7.3 · Armor 5 (as (+2) Plate) · huge · Zone midline · Morale 10 · Appearing 1
- Speed 0 / swim · Senses: Blindsense
- Immune: physical, acid, poison
- Status Immune: prone, sickened, fatigued

**Actions (1)**

| Name | Type | Damage | Note | Recharge | Status |
|---|---|---|---|---|---|
| Strike | melee | +13 3d8 | Melee Attack |  | — |

**Abilities (1)**

- **Waterbound** — Must stay Near a body of water.

### Elemental, Lesser Air

- UUID: `Compendium.vagabond.bestiary.Actor.G4yOOmYO0Wahx9d8`
- HD 8 · TL 3.9 · Armor 3 (as Plate) · medium · Zone midline · Morale 10 · Appearing 1
- Speed 0 / fly · Senses: Blindsense
- Immune: poison, shock, physical
- Status Immune: fatigued, sickened, prone

**Actions (1)**

| Name | Type | Damage | Note | Recharge | Status |
|---|---|---|---|---|---|
| Gust | ranged | +4 1d8 | Ranged Attack |  | — |

**Abilities (2)**

- **Living Gale** — Gusts surround it out to Near, Hindering Enemy Ranged Attacks Targeting those within.
- **Seep** — It can enter the space of other Beings and openings as small as 1 inch without squeezing.

### Elemental, Lesser Earth

- UUID: `Compendium.vagabond.bestiary.Actor.hK1ium0CxnRa06ba`
- HD 8 · TL 3.9 · Armor 3 (as Plate) · medium · Zone frontline · Morale 10 · Appearing 1
- Speed 20 · Senses: Seismicsense
- Immune: poison, shock
- Weak: blunt
- Status Immune: fatigued, sickened

**Actions (1)**

| Name | Type | Damage | Note | Recharge | Status |
|---|---|---|---|---|---|
| Strike | melee | +4 1d8 | Melee Attack |  | — |

**Abilities (1)**

- **Burrower** — It ignore Difficult Terrain of sand, stone, and earth, and it can Move by quickly burrowing in them. However, it can't cross water deeper than its height.

### Elemental, Lesser Fire

- UUID: `Compendium.vagabond.bestiary.Actor.FGTs80o3umSqJjZH`
- HD 8 · TL 3.6 · Armor 3 (as Plate) · medium · Zone midline · Morale 10 · Appearing 1
- Speed 0 / fly · Senses: Blindsense
- Immune: physical, fire, poison
- Status Immune: prone, sickened, fatigued

**Actions (1)**

| Name | Type | Damage | Note | Recharge | Status |
|---|---|---|---|---|---|
| Flame | ranged | +4 1d8 (fire) | Ranged Attack |  | burning |

**Abilities (3)**

- **Living Fire** — Close Beings are Burning (d6).
- **Illuminating** — Sheds Light out to Near.
- **Seep** — It can enter the space of other Beings and openings as small as 1 inch without squeezing.

**Findings (1)**

- ⚠️ `unimplemented-passive`: Ability "Living Fire" describes mechanical effects (burning) but has no automation in scripts/npc-abilities.mjs.

### Elemental, Lesser Water

- UUID: `Compendium.vagabond.bestiary.Actor.6LjwOPsMtm36DT2g`
- HD 8 · TL 3.9 · Armor 3 (as Plate) · medium · Zone midline · Morale 10 · Appearing 1
- Speed 0 / swim · Senses: Blindsense
- Immune: physical, acid, poison
- Weak: shock
- Status Immune: prone, sickened, fatigued

**Actions (1)**

| Name | Type | Damage | Note | Recharge | Status |
|---|---|---|---|---|---|
| Strike | melee | +4 1d8 | Melee Attack |  | — |

**Abilities (1)**

- **Waterbound** — Must stay Near a body of water.

### Elemental, Water

- UUID: `Compendium.vagabond.bestiary.Actor.1MdGIIKX4t4kz9Ok`
- HD 12 · TL 5.6 · Armor 4 (as (+1) Plate) · large · Zone midline · Morale 10 · Appearing 1
- Speed 0 / swim · Senses: Blindsense
- Immune: physical, acid, poison
- Status Immune: prone, sickened, fatigued

**Actions (1)**

| Name | Type | Damage | Note | Recharge | Status |
|---|---|---|---|---|---|
| Strike | melee | +9 2d8 | Melee Attack |  | — |

**Abilities (1)**

- **Waterbound** — Must stay Near a body of water.

### Firebat

- UUID: `Compendium.vagabond.bestiary.Actor.jrG1IUD7M1Fkv0Nl`
- HD 1 · TL 1 · Armor 1 (as Leather) · small · Zone midline · Morale 4 · Appearing 2d6
- Speed 40 / fly · Senses: Darksight
- Immune: fire, poison
- Weak: cold
- Status Immune: sickened, fatigued

**Actions (1)**

| Name | Type | Damage | Note | Recharge | Status |
|---|---|---|---|---|---|
| Bite | melee | — | Melee Attack |  | restrained |

**Abilities (2)**

- **Living Fire** — Close Beings are Burning (d4). It is Burning (d8) while in water.
- **Illuminating** — Sheds Light out to Near.

**Findings (4)**

- ⚠️ `damageless-requiresDamage`: Firebat / "Bite": causedStatus "restrained" has requiresDamage=true but the action deals no damage — status can never apply by that rule.
- ℹ️ `speed-ambiguous`: Firebat: speedTypes entry "fly" has no speed and speedValues.fly is 0. Implicit base speed? Intent unclear.
- ⚠️ `unimplemented-passive`: Ability "Living Fire" describes mechanical effects (burning) but has no automation in scripts/npc-abilities.mjs.
- ⚠️ `ability-mentions-status-without-action`: Ability "Living Fire" on Firebat mentions Burning, but no action on this monster applies those statuses.

### Gelatinous Cube

- UUID: `Compendium.vagabond.bestiary.Actor.FYjFBtN4C5lXvFLA`
- HD 4 · TL 1.3 · Armor 0 (as Unarmored) · large · Zone frontline · Morale 12 · Appearing 1
- Speed 10 · Senses: Blindsense
- Immune: acid, shock, cold
- Status Immune: prone, frightened, blinded, charmed

**Actions (1)**

| Name | Type | Damage | Note | Recharge | Status |
|---|---|---|---|---|---|
| Engulf | melee | — | Melee Attack |  | restrained |

**Abilities (3)**

- **Amorphous** — It can enter the space of other Beings and openings as small as 1 inch without squeezing.
- **Engulfer** — Beings that share its space are Burning (2d4).
- **Sticky** — Hinders attempts to end being Restrained by it. Beings that make physical contact with it must pass [Endure] or be Restrained.

**Findings (3)**

- ⚠️ `unimplemented-passive`: Ability "Engulfer" describes mechanical effects (burning) but has no automation in scripts/npc-abilities.mjs.
- ⚠️ `unimplemented-passive`: Ability "Sticky" describes mechanical effects (restrained, must-pass) but has no automation in scripts/npc-abilities.mjs.
- ⚠️ `ability-mentions-status-without-action`: Ability "Engulfer" on Gelatinous Cube mentions Burning, but no action on this monster applies those statuses.

### Grasping Goo

- UUID: `Compendium.vagabond.bestiary.Actor.31QN4EUQL9G9fOTj`
- HD 1 · TL 0.7 · Armor 0 (as Unarmored) · small · Zone frontline · Morale 12 · Appearing d4
- Speed 5 · Senses: Blindsense
- Immune: acid
- Weak: fire
- Status Immune: prone, blinded

**Actions (1)**

| Name | Type | Damage | Note | Recharge | Status |
|---|---|---|---|---|---|
| Pseudopod | melee | — | Melee Attack |  | restrained, burning |

**Abilities (4)**

- **Amorphous** — It can Move into occupied space as small as 1 inch without squeezing.
- **Freeze Susceptability** — It is Dazed (1 Round) after being harmed by cold.
- **Corroding** — Non-Relic metal Items that make contact with it corrode. When this happens, roll a d6 for each Item. On a roll of 1, the Item breaks. If the Item that breaks is larger than Medium, this destroys a 1-foot square hole that is 1-foot deep in it.
- **Sticky** — Hinders attempts to end being Restrained by it. Beings that make physical contact with it must pass [Endure] or be Restrained.

**Findings (5)**

- ⚠️ `damageless-requiresDamage`: Grasping Goo / "Pseudopod": causedStatus "burning" has requiresDamage=true but the action deals no damage — status can never apply by that rule.
- ⚠️ `damageless-requiresDamage`: Grasping Goo / "Pseudopod": causedStatus "restrained" has requiresDamage=true but the action deals no damage — status can never apply by that rule.
- ⚠️ `unimplemented-passive`: Ability "Freeze Susceptability" describes mechanical effects (dazed) but has no automation in scripts/npc-abilities.mjs.
- ⚠️ `unimplemented-passive`: Ability "Sticky" describes mechanical effects (restrained, must-pass) but has no automation in scripts/npc-abilities.mjs.
- ⚠️ `ability-mentions-status-without-action`: Ability "Freeze Susceptability" on Grasping Goo mentions Dazed, but no action on this monster applies those statuses.

### Green Slime

- UUID: `Compendium.vagabond.bestiary.Actor.9rpGK7YO9OfbXJoh`
- HD 2 · TL 1 · Armor 0 (as Unarmored) · medium · Zone frontline · Morale 12 · Appearing 1
- Speed 0 / cling · Senses: Blindsense
- Immune: acid, poison
- Weak: fire, cold
- Status Immune: prone, sickened, blinded

**Abilities (3)**

- **Amorphous** — It can Move into occupied space as small as 1 inch without squeezing.
- **Consume** — [Endure]: Beings in its space are Burning (2d8). A Being that dies this way is dissolved, and becomes another green slime.
- **Living Sick** — Sunlight and any effect that ends the Sickened Status or kills bacteria kills this Being.

**Findings (5)**

- ℹ️ `speed-ambiguous`: Green Slime: speedTypes entry "cling" has no speed and speedValues.cling is 0. Implicit base speed? Intent unclear.
- ⚠️ `unimplemented-passive`: Ability "Consume" describes mechanical effects (burning) but has no automation in scripts/npc-abilities.mjs.
- ⚠️ `unimplemented-passive`: Ability "Living Sick" describes mechanical effects (sickened) but has no automation in scripts/npc-abilities.mjs.
- ⚠️ `ability-mentions-status-without-action`: Ability "Consume" on Green Slime mentions Burning, but no action on this monster applies those statuses.
- ⚠️ `ability-mentions-status-without-action`: Ability "Living Sick" on Green Slime mentions Sickened, but no action on this monster applies those statuses.

### Grey Ooze

- UUID: `Compendium.vagabond.bestiary.Actor.JiYcX0LZZZCqhyrq`
- HD 3 · TL 1.9 · Armor 0 (as Unarmored) · medium · Zone frontline · Morale 12 · Appearing d3
- Speed 5 · Senses: Blindsense
- Immune: acid, fire, cold
- Weak: shock
- Status Immune: prone, frightened, blinded, charmed

**Actions (1)**

| Name | Type | Damage | Note | Recharge | Status |
|---|---|---|---|---|---|
| Pseudopod | melee | +9 2d8 | Melee Attack |  | — |

**Abilities (2)**

- **Amorphous** — It can Move into occupied space as small as 1 inch without squeezing.
- **Corroding** — Non-Relic metal Items that make contact with it corrode. When this happens, roll a d6 for each Item. On a roll of 1, the Item breaks. If the Item that breaks is larger than Medium, this destroys a 1-foot square hole that is 1-foot deep in it.

### Hydrangean

- UUID: `Compendium.vagabond.bestiary.Actor.Rq6JPBgL5v88JAd0`
- HD 2 · TL 2 · Armor 1 (as Leather) · medium · Zone frontline · Morale 8 · Appearing d6
- Speed 5
- Weak: slashing, poison, fire

**Actions (2)**

| Name | Type | Damage | Note | Recharge | Status |
|---|---|---|---|---|---|
| Combo | melee | — |  |  | — |
| Bite | melee | +2 1d4 | Melee Attack, Near |  | — |

**Abilities (2)**

- **Multi-Headed** — It starts with 3 Heads. Targetting an area that could behead it causes a -3 penalty to the Check, but severs it if at least 2 damage is dealt in a single damage instance.
- **Hydra Regrowth** — Regains 4 HP at the start of its Turns. If it is missing one of its heads when this happens, two Heads sprout. This Ability doesn't work if it took damage from fire since its last Turn.

**Findings (2)**

- ⚠️ `unimplemented-passive`: Ability "Hydra Regrowth" describes mechanical effects (regains-hp) but has no automation in scripts/npc-abilities.mjs.
- ⚠️ `unimplemented-passive`: Ability "Multi-Headed" describes mechanical effects (—) but has no automation in scripts/npc-abilities.mjs.

### Invisible Stalker

- UUID: `Compendium.vagabond.bestiary.Actor.oUsPWK1hrCZ0C7SP`
- HD 8 · TL 4.1 · Armor 3 (as Plate) · medium · Zone frontline · Morale 12 · Appearing d4
- Speed 40 · Senses: Blindsense
- Immune: poison
- Status Immune: paralyzed, sickened, unconscious, fatigued, prone

**Actions (1)**

| Name | Type | Damage | Note | Recharge | Status |
|---|---|---|---|---|---|
| Blow | melee | +10 4d4 | Melee Attack |  | — |

**Abilities (1)**

- **Invisible** — All Beings that can't detect invisibility act as Blinded when Targeting this Being and defending against its attacks.

**Findings (2)**

- ⚠️ `unimplemented-passive`: Ability "Invisible" describes mechanical effects (blinded) but has no automation in scripts/npc-abilities.mjs.
- ⚠️ `ability-mentions-status-without-action`: Ability "Invisible" on Invisible Stalker mentions Blinded, but no action on this monster applies those statuses.

### Kelpie

- UUID: `Compendium.vagabond.bestiary.Actor.6374iY64VLoDAtDV`
- HD 5 · TL 2.4 · Armor 2 (as Chain) · medium · Zone backline · Morale 4 · Appearing d4
- Speed 30 / swim
- Weak: shock

**Actions (2)**

| Name | Type | Damage | Note | Recharge | Status |
|---|---|---|---|---|---|
| Entangle | melee | +0 | Grapple, an Enemy in Water |  | restrained |
| Enlure | castRanged | +0 | Cast, Sight \| Will (-2 penalty) | 1/Day | charmed |

**Abilities (2)**

- **Amphibious** — It can breathe air and water.
- **Shapechange** — It can skip its Move to turn into a green woman, or an aquatic horse (use the hippocampus statblock). It maintains its HP in these forms.

**Findings (3)**

- ⚠️ `damageless-requiresDamage`: Kelpie / "Enlure": causedStatus "charmed" has requiresDamage=true but the action deals no damage — status can never apply by that rule.
- ⚠️ `damageless-requiresDamage`: Kelpie / "Entangle": causedStatus "restrained" has requiresDamage=true but the action deals no damage — status can never apply by that rule.
- ℹ️ `speed-ambiguous`: Kelpie: speedTypes entry "swim" has no speed and speedValues.swim is 0. Implicit base speed? Intent unclear.

### Magmot

- UUID: `Compendium.vagabond.bestiary.Actor.pjgK1vqOzpVobYj0`
- HD 3 · TL 6.4 · Armor 3 (as Plate) · large · Zone frontline · Morale 9 · Appearing d2
- Speed 10 / burrow
- Immune: fire
- Weak: cold

**Actions (2)**

| Name | Type | Damage | Note | Recharge | Status |
|---|---|---|---|---|---|
| Combo | melee | — |  |  | — |
| Slam | melee | +7 2d6 | Melee Attack |  | burning |

**Abilities (2)**

- **Burrow Burst** — If it breaches the ground after moving at least 20' on the same Turn, its first Slam deals 18 (4d8) instead.
- **Tunneler** — It can Move by burrowing in the ground at 30' per Round.

**Findings (2)**

- ℹ️ `speed-ambiguous`: Magmot: speedTypes entry "burrow" has no speed and speedValues.burrow is 0. Implicit base speed? Intent unclear.
- ⚠️ `unimplemented-passive`: Ability "Burrow Burst" describes mechanical effects (deals-damage) but has no automation in scripts/npc-abilities.mjs.

### Ochre Jelly

- UUID: `Compendium.vagabond.bestiary.Actor.YCnTX125wazTwDGe`
- HD 5 · TL 1.7 · Armor 0 (as Unarmored) · medium · Zone frontline · Morale 12 · Appearing 1
- Speed 10 / cling · Senses: Blindsense
- Immune: shock, piercing, acid
- Status Immune: frightened, charmed, blinded, prone

**Actions (1)**

| Name | Type | Damage | Note | Recharge | Status |
|---|---|---|---|---|---|
| Pseudopod | melee | +7 2d6 | Melee Attack |  | — |

**Abilities (2)**

- **Amorphous** — It can Move into occupied space as small as 1 inch without squeezing.
- **Pudding Split** — If it is larger than Small and subjected to Shock or Slash, it splits into two Ochre Jellies that have half its current HP, round up, and are one size smaller. Their Pseudopod attacks deal 3 (d6) instead.

**Findings (2)**

- ℹ️ `speed-ambiguous`: Ochre Jelly: speedTypes entry "cling" has no speed and speedValues.cling is 0. Implicit base speed? Intent unclear.
- ⚠️ `unimplemented-passive`: Ability "Pudding Split" describes mechanical effects (deals-damage) but has no automation in scripts/npc-abilities.mjs.

### Ooze, Blood

- UUID: `Compendium.vagabond.bestiary.Actor.SvrccBltWb6a6zqw`
- HD 5 · TL 1.7 · Armor 1 (as Leather) · medium · Zone frontline · Morale 12 · Appearing 1
- Speed 10 / cling · Senses: Blindsense
- Immune: piercing, acid
- Status Immune: frightened, charmed, blinded, prone

**Actions (1)**

| Name | Type | Damage | Note | Recharge | Status |
|---|---|---|---|---|---|
| Pseudopod | melee | +7 2d6 | Melee Attack |  | — |

**Abilities (1)**

- **Amorphous** — It can Move into occupied space as small as 1 inch without squeezing.

**Findings (1)**

- ℹ️ `speed-ambiguous`: Ooze, Blood: speedTypes entry "cling" has no speed and speedValues.cling is 0. Implicit base speed? Intent unclear.

### Ooze, Ectoplasmic

- UUID: `Compendium.vagabond.bestiary.Actor.1w5VfFT6iJ7890ac`
- HD 5 · TL 1.7 · Armor 1 (as Leather) · medium · Zone frontline · Morale 12 · Appearing 1
- Speed 10 / cling, phase · Senses: Blindsense
- Immune: cold, acid, poison, physical
- Status Immune: frightened, charmed, blinded, prone

**Actions (1)**

| Name | Type | Damage | Note | Recharge | Status |
|---|---|---|---|---|---|
| Pseudopod | melee | +7 2d6 | Melee Attack |  | — |

**Abilities (1)**

- **Amorphous** — It can Move into occupied space as small as 1 inch without squeezing.

**Findings (2)**

- ℹ️ `speed-ambiguous`: Ooze, Ectoplasmic: speedTypes entry "cling" has no speed and speedValues.cling is 0. Implicit base speed? Intent unclear.
- ℹ️ `speed-ambiguous`: Ooze, Ectoplasmic: speedTypes entry "phase" has no speed and speedValues.phase is 0. Implicit base speed? Intent unclear.

### Ooze, Quicksilver

- UUID: `Compendium.vagabond.bestiary.Actor.gpu0T0RHM0TvQO5U`
- HD 5 · TL 1.7 · Armor 1 (as Leather) · medium · Zone frontline · Morale 12 · Appearing 1
- Speed 10 / cling · Senses: Blindsense
- Immune: piercing, magical, slashing
- Status Immune: frightened, charmed, blinded, prone

**Actions (1)**

| Name | Type | Damage | Note | Recharge | Status |
|---|---|---|---|---|---|
| Pseudopod | melee | +7 2d6 | Melee Attack |  | — |

**Abilities (2)**

- **Amorphous** — It can Move into occupied space as small as 1 inch without squeezing.
- **Mercurial Reflection** — Spells that Target it are reflected at a different randomly-determined Target.

**Findings (1)**

- ℹ️ `speed-ambiguous`: Ooze, Quicksilver: speedTypes entry "cling" has no speed and speedValues.cling is 0. Implicit base speed? Intent unclear.

### Shambling Mound

- UUID: `Compendium.vagabond.bestiary.Actor.NI1b4rIPgJKsLKQJ`
- HD 9 · TL 5.5 · Armor 3 (as Plate) · large · Zone frontline · Morale 12 · Appearing d4
- Speed 20 / swim · Senses: Blindsight
- Immune: fire, cold

**Actions (2)**

| Name | Type | Damage | Note | Recharge | Status |
|---|---|---|---|---|---|
| Combo | melee | — |  |  | — |
| Slam | melee | +9 2d8 | Melee Attack |  | restrained, suffocating |

**Abilities (2)**

- **Amphibious** — It can breathe air and water.
- **Shock-Absorb** — It treats all Shock damage as healing

**Findings (1)**

- ℹ️ `speed-ambiguous`: Shambling Mound: speedTypes entry "swim" has no speed and speedValues.swim is 0. Implicit base speed? Intent unclear.

### Treant

- UUID: `Compendium.vagabond.bestiary.Actor.mRKPp10Yiq0n7ddR`
- HD 8 · TL 5.3 · Armor 4 (as (+1) Plate) · huge · Zone frontline · Morale 9 · Appearing d8
- Speed 20
- Weak: fire, slashing, poison

**Actions (3)**

| Name | Type | Damage | Note | Recharge | Status |
|---|---|---|---|---|---|
| Animate Trees | castRanged | +0 | Cast, a tree in Far |  | — |
| Combo | melee | — |  |  | — |
| Slam | melee | +7 2d6 | Melee Attack |  | — |

### Triffid

- UUID: `Compendium.vagabond.bestiary.Actor.yw0kCRbsAd5SyI2D`
- HD 2 · TL 1.6 · Armor 1 (as Leather) · medium · Zone midline · Morale 4 · Appearing 2d6
- Speed 10 · Senses: Echolocation
- Weak: fire, poison

**Actions (1)**

| Name | Type | Damage | Note | Recharge | Status |
|---|---|---|---|---|---|
| Whorl | melee | +2 1d4 (poison) | Melee Attack, Near |  | sickened |

**Abilities (1)**

- **Blinded** — Blinded without its Echolocation.

**Findings (2)**

- ⚠️ `unimplemented-passive`: Ability "Blinded" describes mechanical effects (blinded) but has no automation in scripts/npc-abilities.mjs.
- ⚠️ `ability-mentions-status-without-action`: Ability "Blinded" on Triffid mentions Blinded, but no action on this monster applies those statuses.

### Violet Fungus

- UUID: `Compendium.vagabond.bestiary.Actor.LWsvMezQ9BvCYFfJ`
- HD 3 · TL 1.7 · Armor 1 (as Leather) · medium · Zone frontline · Morale 12 · Appearing d4
- Speed 5 · Senses: Blindsight, Telepathy (Far, mushrooms only)
- Immune: poison
- Weak: fire
- Status Immune: sickened

**Actions (2)**

| Name | Type | Damage | Note | Recharge | Status |
|---|---|---|---|---|---|
| Combo | melee | — |  |  | — |
| Tendril | melee | +5 2d4 | Melee Attack |  | sickened |

### Vortex

- UUID: `Compendium.vagabond.bestiary.Actor.xwAfbjZqqVzOyEAI`
- HD 2 · TL 2.9 · Armor 3 (as Plate) · medium · Zone frontline · Morale 12 · Appearing d8
- Speed 40 / fly · Senses: Blindsense
- Immune: physical, shock, poison
- Status Immune: sickened, fatigued, prone

**Abilities (2)**

- **Living Gale** — Gusts surround it out to Near, Hindering Enemy Ranged Attacks Targeting those within.
- **Whirlwind** — Medium or smaller Close Beings must pass [Endure] against being Restrained at the start of their Turns or be thrown 25 (d10x5) feet in the air.

**Findings (3)**

- ℹ️ `speed-ambiguous`: Vortex: speedTypes entry "fly" has no speed and speedValues.fly is 0. Implicit base speed? Intent unclear.
- ⚠️ `unimplemented-passive`: Ability "Whirlwind" describes mechanical effects (restrained, must-pass) but has no automation in scripts/npc-abilities.mjs.
- ⚠️ `ability-mentions-status-without-action`: Ability "Whirlwind" on Vortex mentions Restrained, but no action on this monster applies those statuses.

### Yellow Mould

- UUID: `Compendium.vagabond.bestiary.Actor.OXIrSQsloN8IRgfA`
- HD 2 · TL 0.9 · Armor 0 (as Unarmored) · large · Zone  · Morale 12 · Appearing d4
- Speed 0 · Senses: Blindsight, Telepathy (fungus only)
- Immune: physical, poison, shock, acid, cold
- Weak: fire
- Status Immune: charmed, confused, berserk, sickened, unconscious, frightened, prone

**Abilities (1)**

- **Spore Cloud** — [When Touched, Aura Close \| Endure]: 3 (d6) and pass [Endure] or become Sickened (Cd8, +1 Fatigue each Round).

**Findings (2)**

- ⚠️ `unimplemented-passive`: Ability "Spore Cloud" describes mechanical effects (sickened, adds-fatigue) but has no automation in scripts/npc-abilities.mjs.
- ⚠️ `ability-mentions-status-without-action`: Ability "Spore Cloud" on Yellow Mould mentions Sickened, but no action on this monster applies those statuses.
