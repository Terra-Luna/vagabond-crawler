# Artificials — 24 monsters

Generated: 2026-04-14T20:55:00.591Z

| Name | HD | TL | Armor | Zone | Actions | Abilities | Findings |
|---|---|---|---|---|---|---|---|
| Animated Armor | 2 | 2.4 | 3 as Plate | frontline | 1 | 2 | 2 |
| Animated Armor | 2 | 2.4 | 3 as Plate | frontline | 1 | 2 | 2 |
| Crawling Wall | 13 | 6.1 | 3 as Plate | frontline | 3 | 1 | 0 |
| Dungeonheart | 10 | 1.7 | 1 as Leather |  | 7 | 0 | 0 |
| Flying Spellbook | 1 | 0.7 | 0 as Unarmored | backline | 2 | 2 | 2 |
| Flying Sword | 1 | 2.3 | 3 as Plate | frontline | 1 | 2 | 3 |
| Gargoyle | 4 | 2.6 | 2 as Chain | frontline | 3 | 1 | 1 |
| Golem, Bone | 8 | 4.3 | 2 as Chain | frontline | 2 | 3 | 1 |
| Golem, Clay | 12 | 9.5 | 0 as Unarmored | frontline | 2 | 4 | 3 |
| Golem, Flesh | 9 | 4.7 | 0 as Unarmored | frontline | 2 | 3 | 5 |
| Golem, Iron | 18 | 8.9 | 5 as (+2) Plate | frontline | 3 | 3 | 1 |
| Golem, Stone | 13 | 7.5 | 3 as (+1) Chain | frontline | 3 | 2 | 2 |
| Homunculus | 1 | 0.9 | 0 as Unarmored | midline | 2 | 0 | 1 |
| Joust Guardian | 6 | 6.3 | 3 as Plate | frontline | 3 | 1 | 0 |
| Living Statue, Crystal | 3 | 2.6 | 3 as (+1) Chain | frontline | 1 | 1 | 0 |
| Living Statue, Iron | 4 | 2.7 | 3 as Plate | frontline | 1 | 2 | 1 |
| Living Statue, Rock | 5 | 5 | 3 as (+1) Chain | frontline | 2 | 1 | 0 |
| Necrophidius | 2 | 2 | 2 as Chain | frontline | 2 | 1 | 1 |
| Potead, Large | 8 | 3.4 | 2 as Chain | frontline | 1 | 1 | 0 |
| Potead, Medium | 5 | 2.3 | 2 as Chain | frontline | 1 | 1 | 0 |
| Potead, Small | 1 | 1.5 | 2 as Chain | frontline | 1 | 1 | 0 |
| Ripworm | 4 | 3.1 | 3 as Plate | frontline | 1 | 2 | 0 |
| Scarecrow | 5 | 2.2 | 1 as Leather | frontline | 3 | 1 | 2 |
| Stone Colossus | 25 | 11.7 | 6 as (+3) Plate | frontline | 3 | 4 | 2 |

---

## Details

### Animated Armor

- UUID: `Compendium.vagabond.bestiary.Actor.0PP2iH12NZJB7VoH`
- HD 2 · TL 2.4 · Armor 3 (as Plate) · medium · Zone frontline · Morale  · Appearing d4
- Speed 30
- Immune: poison
- Status Immune: blinded, charmed, fatigued, frightened, paralyzed, sickened, suffocating

**Actions (1)**

| Name | Type | Damage | Note | Recharge | Status |
|---|---|---|---|---|---|
| Weapon | melee | +3 d6 | Melee Attack |  | — |

**Abilities (2)**

- **Antimagic Vulnerability** — It is Dazed for Cd4 if affected by the Dispel Spell or other antimagic.
- **Immutable** — It can't be transformed.

**Findings (2)**

- ⚠️ `unimplemented-passive`: Ability "Antimagic Vulnerability" describes mechanical effects (dazed) but has no automation in scripts/npc-abilities.mjs.
- ⚠️ `ability-mentions-status-without-action`: Ability "Antimagic Vulnerability" on Animated Armor mentions Dazed, but no action on this monster applies those statuses.

### Animated Armor

- UUID: `Compendium.vagabond.bestiary.Actor.IWiL8vs9JwuriDcX`
- HD 2 · TL 2.4 · Armor 3 (as Plate) · medium · Zone frontline · Morale  · Appearing d4
- Speed 30
- Immune: poison
- Status Immune: blinded, charmed, fatigued, frightened, paralyzed, sickened, suffocating

**Actions (1)**

| Name | Type | Damage | Note | Recharge | Status |
|---|---|---|---|---|---|
| Weapon | melee | +3 1d6 | Melee Attack |  | — |

**Abilities (2)**

- **Antimagic Vulnerability** — It is Dazed for Cd4 if affected by the Dispel Spell or other antimagic.
- **Immutable** — It can't be transformed.

**Findings (2)**

- ⚠️ `unimplemented-passive`: Ability "Antimagic Vulnerability" describes mechanical effects (dazed) but has no automation in scripts/npc-abilities.mjs.
- ⚠️ `ability-mentions-status-without-action`: Ability "Antimagic Vulnerability" on Animated Armor mentions Dazed, but no action on this monster applies those statuses.

### Crawling Wall

- UUID: `Compendium.vagabond.bestiary.Actor.9ujVnpprisq50dFW`
- HD 13 · TL 6.1 · Armor 3 (as Plate) · huge · Zone frontline · Morale  · Appearing 1
- Speed 20
- Immune: poison
- Weak: blunt
- Status Immune: paralyzed, sickened, suffocating

**Actions (3)**

| Name | Type | Damage | Note | Recharge | Status |
|---|---|---|---|---|---|
| Combo | melee | — |  |  | — |
| Grasp | melee | +4 1d8 | Melee Attack |  | restrained |
| Crush | melee | +3 1d6 | Rush |  | — |

**Abilities (1)**

- **Immutable** — It can't be transformed.

### Dungeonheart

- UUID: `Compendium.vagabond.bestiary.Actor.qNPV7PkPDVdXdCJ4`
- HD 10 · TL 1.7 · Armor 1 (as Leather) · huge · Zone  · Morale  · Appearing 1
- Speed 0
- Weak: piercing
- Status Immune: berserk, charmed, confused, dazed, frightened, incapacitated, suffocating, unconscious

**Actions (7)**

| Name | Type | Damage | Note | Recharge | Status |
|---|---|---|---|---|---|
| Spawn | melee | — |  |  | — |
| 1 - Giant Spider | melee | — |  |  | — |
| 2 - Basilisk | melee | — |  |  | — |
| 3 - Owl Bear | melee | — |  |  | — |
| 4 - Rust Monster | melee | — |  |  | — |
| 5 - Warp Beast | melee | — |  |  | — |
| 6 - Gelatinous Cube | melee | — |  |  | — |

### Flying Spellbook

- UUID: `Compendium.vagabond.bestiary.Actor.01WK986PiOP0uUDE`
- HD 1 · TL 0.7 · Armor 0 (as Unarmored) · small · Zone backline · Morale  · Appearing d6
- Speed 0 / fly · Senses: Blindsight
- Immune: poison
- Weak: fire
- Status Immune: sickened, suffocating

**Actions (2)**

| Name | Type | Damage | Note | Recharge | Status |
|---|---|---|---|---|---|
| Freeze | castRanged | +3 1d6 (cold) | Cast, Remote \| Endure | Cd4 | — |
| Zap | castRanged | +3 1d6 (shock) | Cast, Bolt \| Reflex | Cd4 | dazed |

**Abilities (2)**

- **Antimagic Vulnerability** — It is Dazed for Cd4 if affected by the Dispel Spell or other antimagic.
- **Nimble** — Attacks against it can't be Favored if it can Move.

**Findings (2)**

- ⚠️ `unimplemented-passive`: Ability "Antimagic Vulnerability" describes mechanical effects (dazed) but has no automation in scripts/npc-abilities.mjs.
- ⚠️ `unimplemented-passive`: Ability "Nimble" describes mechanical effects (favored) but has no automation in scripts/npc-abilities.mjs.

### Flying Sword

- UUID: `Compendium.vagabond.bestiary.Actor.l0R5eP2Gp0WC6QPq`
- HD 1 · TL 2.3 · Armor 3 (as Plate) · small · Zone frontline · Morale  · Appearing d4
- Speed 0 / fly · Senses: Blindsight
- Immune: poison
- Status Immune: frightened, charmed, sickened

**Actions (1)**

| Name | Type | Damage | Note | Recharge | Status |
|---|---|---|---|---|---|
| Slash | melee | +4 1d8 | Melee Attack |  | — |

**Abilities (2)**

- **Antimagic Vulnerability** — It is Dazed (Cd4) if affected by the Dispel Spell or other antimagic.
- **Nimble** — Attacks against it can't be Favored if it can Move.

**Findings (3)**

- ⚠️ `unimplemented-passive`: Ability "Antimagic Vulnerability" describes mechanical effects (dazed) but has no automation in scripts/npc-abilities.mjs.
- ⚠️ `unimplemented-passive`: Ability "Nimble" describes mechanical effects (favored) but has no automation in scripts/npc-abilities.mjs.
- ⚠️ `ability-mentions-status-without-action`: Ability "Antimagic Vulnerability" on Flying Sword mentions Dazed, but no action on this monster applies those statuses.

### Gargoyle

- UUID: `Compendium.vagabond.bestiary.Actor.oM0nBpVMFBGrGlbz`
- HD 4 · TL 2.6 · Armor 2 (as Chain) · medium · Zone frontline · Morale 11 · Appearing 1
- Speed 15 / fly
- Immune: poison, psychic
- Weak: blunt
- Status Immune: fatigued, sickened

**Actions (3)**

| Name | Type | Damage | Note | Recharge | Status |
|---|---|---|---|---|---|
| Combo | melee | — |  |  | — |
| Bite | melee | +3 1d6 | Melee Attack |  | — |
| Claw | melee | +1 1d3 | Melee Attack |  | — |

**Abilities (1)**

- **Immutable** — It can't be transformed.

**Findings (1)**

- ℹ️ `speed-ambiguous`: Gargoyle: speedTypes entry "fly" has no speed and speedValues.fly is 0. Implicit base speed? Intent unclear.

### Golem, Bone

- UUID: `Compendium.vagabond.bestiary.Actor.14SyZkKvSmv2smFw`
- HD 8 · TL 4.3 · Armor 2 (as Chain) · large · Zone frontline · Morale  · Appearing d2
- Speed 30 · Senses: Blindsight
- Immune: poison, physical
- Weak: blunt
- Status Immune: sickened, fatigued, charmed, paralyzed

**Actions (2)**

| Name | Type | Damage | Note | Recharge | Status |
|---|---|---|---|---|---|
| Combo | melee | — |  |  | — |
| Cutlass | melee | +3 1d6 | Melee Attack |  | — |

**Abilities (3)**

- **Immutable** — It can't be transformed.
- **Limbs** — It is encountered with 5 (d6 + 2) limbs, and loses a limb each time it takes at least 4 damage.
- **Magic Ward I** — The first time it is unwillingly affected by a Spell each Round, the Caster must spend an extra 1 Mana to affect it.

**Findings (1)**

- ❌ `broken-automation`: Compendium text describes a Mana-cost penalty; scripts/npc-abilities.mjs injects a roll-penalty die (1d4) instead.

### Golem, Clay

- UUID: `Compendium.vagabond.bestiary.Actor.W5kmv1bYrErmzoUI`
- HD 12 · TL 9.5 · Armor 0 (as Unarmored) · large · Zone frontline · Morale 12 · Appearing 1
- Speed 15 · Senses: Darksight
- Immune: poison, physical
- Status Immune: sickened, fatigued, charmed, paralyzed

**Actions (2)**

| Name | Type | Damage | Note | Recharge | Status |
|---|---|---|---|---|---|
| Combo | melee | — |  |  | — |
| Slam | melee | +9 2d8 | Melee Attack |  | — |

**Abilities (4)**

- **Acid Bather** — Acid damage rolls affect it as healing rolls.
- **Immutable** — It can't be transformed.
- **Magic Ward I** — The first time it is unwillingly affected by a Spell each Round, the Caster must spend an extra 1 Mana to affect it.
- **Unbaked** — If it takes 5 or more Fire damage at once, it is Dazed (Cd4).

**Findings (3)**

- ❌ `broken-automation`: Compendium text describes a Mana-cost penalty; scripts/npc-abilities.mjs injects a roll-penalty die (1d4) instead.
- ⚠️ `unimplemented-passive`: Ability "Unbaked" describes mechanical effects (dazed, takes-damage) but has no automation in scripts/npc-abilities.mjs.
- ⚠️ `ability-mentions-status-without-action`: Ability "Unbaked" on Golem, Clay mentions Dazed, but no action on this monster applies those statuses.

### Golem, Flesh

- UUID: `Compendium.vagabond.bestiary.Actor.gMKwv81k8AHuZBk0`
- HD 9 · TL 4.7 · Armor 0 (as Unarmored) · large · Zone frontline · Morale 10 · Appearing 1
- Speed 20 · Senses: Darksight
- Immune: physical, shock, cold, poison
- Weak: fire
- Status Immune: charmed, fatigued, sickened, paralyzed

**Actions (2)**

| Name | Type | Damage | Note | Recharge | Status |
|---|---|---|---|---|---|
| Combo | melee | — |  |  | — |
| Slam | melee | +9 2d8 | Melee Attack |  | — |

**Abilities (3)**

- **Bloodied Rage** — At 20 HP or less, it is Berserk.
- **Flame-Averse** — If it can see fire or takes damage from fire, it is Frightened (Cd4).
- **Shock-Absorber** — Shock damage rolls heal it instead.

**Findings (5)**

- ⚠️ `extraInfo-status-mismatch`: Golem, Flesh / "Slam": extraInfo mentions Berserk but causedStatuses does not include these ids.
- ⚠️ `unimplemented-passive`: Ability "Bloodied Rage" describes mechanical effects (berserk) but has no automation in scripts/npc-abilities.mjs.
- ⚠️ `unimplemented-passive`: Ability "Flame-Averse" describes mechanical effects (frightened) but has no automation in scripts/npc-abilities.mjs.
- ⚠️ `ability-mentions-status-without-action`: Ability "Bloodied Rage" on Golem, Flesh mentions Berserk, but no action on this monster applies those statuses.
- ⚠️ `ability-mentions-status-without-action`: Ability "Flame-Averse" on Golem, Flesh mentions Frightened, but no action on this monster applies those statuses.

### Golem, Iron

- UUID: `Compendium.vagabond.bestiary.Actor.uIRiPIcdtl00VHdb`
- HD 18 · TL 8.9 · Armor 5 (as (+2) Plate) · large · Zone frontline · Morale  · Appearing 1
- Speed 15 · Senses: Darksight
- Immune: physical, fire, cold, poison
- Status Immune: charmed, fatigued, sickened, paralyzed

**Actions (3)**

| Name | Type | Damage | Note | Recharge | Status |
|---|---|---|---|---|---|
| Combo | melee | — |  |  | — |
| Poison Breath | castClose | +2 1d4 (poison) | Cast, Close 10' Cube \| Endure | Cd8 | — |
| Greatsword | melee | +13 2d12 | Melee Attack |  | — |

**Abilities (3)**

- **Fire-Absorber** — Fire damage rolls heal it instead.
- **Immutable** — It can't be transformed.
- **Magic Ward I** — The first time it is unwillingly affected by a Spell each Round, the Caster must spend an extra 1 Mana to affect it.

**Findings (1)**

- ❌ `broken-automation`: Compendium text describes a Mana-cost penalty; scripts/npc-abilities.mjs injects a roll-penalty die (1d4) instead.

### Golem, Stone

- UUID: `Compendium.vagabond.bestiary.Actor.RCrdmkp96a9uhfT2`
- HD 13 · TL 7.5 · Armor 3 (as (+1) Chain) · large · Zone frontline · Morale 11 · Appearing 1
- Speed 30 · Senses: Darksight
- Immune: physical, poison
- Status Immune: charmed, fatigued, sickened, paralyzed

**Actions (3)**

| Name | Type | Damage | Note | Recharge | Status |
|---|---|---|---|---|---|
| Slow Down | castRanged | — | Cast, Aura Near \| Will | Cd4 | dazed |
| Combo | melee | — |  |  | — |
| Slam | melee | +13 3d8 | Melee Attack |  | — |

**Abilities (2)**

- **Immutable** — It can't be transformed.
- **Magic Ward I** — The first time it is unwillingly affected by a Spell each Round, the Caster must spend an extra 1 Mana to affect it.

**Findings (2)**

- ❌ `broken-automation`: Compendium text describes a Mana-cost penalty; scripts/npc-abilities.mjs injects a roll-penalty die (1d4) instead.
- ⚠️ `damageless-requiresDamage`: Golem, Stone / "Slow Down": causedStatus "dazed" has requiresDamage=true but the action deals no damage — status can never apply by that rule.

### Homunculus

- UUID: `Compendium.vagabond.bestiary.Actor.FwKNYxhPvyTu4D1c`
- HD 1 · TL 0.9 · Armor 0 (as Unarmored) · small · Zone midline · Morale 3 · Appearing 1
- Speed 10 / fly · Senses: Darksight, Echolocation
- Immune: poison
- Status Immune: charmed, sickened

**Actions (2)**

| Name | Type | Damage | Note | Recharge | Status |
|---|---|---|---|---|---|
| Bite | melee | +1 1d3 | Melee Attack |  | sickened, unconscious |
| Spit Acid | ranged | +2 1d4 | Ranged Attack, Near |  | burning |

**Findings (1)**

- ℹ️ `elemental-name-untyped`: Homunculus / "Spit Acid": name suggests elemental damage but damageType is "-".

### Joust Guardian

- UUID: `Compendium.vagabond.bestiary.Actor.MV5G94cDuVi9tKt9`
- HD 6 · TL 6.3 · Armor 3 (as Plate) · large · Zone frontline · Morale  · Appearing 1
- Speed 30
- Immune: poison
- Status Immune: unconscious, fatigued, frightened, sickened, confused, berserk, charmed

**Actions (3)**

| Name | Type | Damage | Note | Recharge | Status |
|---|---|---|---|---|---|
| Assault | melee | — | Multi-Attack |  | — |
| Lance | melee | +13 2d12 | Melee Attack, Near |  | — |
| Cannon | ranged | +11 3d6 | Ranged Attack (Sphere 10 foot) |  | — |

**Abilities (1)**

- **Immutable** — It can't be transformed.

### Living Statue, Crystal

- UUID: `Compendium.vagabond.bestiary.Actor.rCrUMFfwgaBaii4d`
- HD 3 · TL 2.6 · Armor 3 (as (+1) Chain) · medium · Zone frontline · Morale 11 · Appearing d4
- Speed 30
- Immune: poison
- Weak: blunt
- Status Immune: blinded, unconscious, fatigued

**Actions (1)**

| Name | Type | Damage | Note | Recharge | Status |
|---|---|---|---|---|---|
| Weapon | melee | +4 1d8 | Melee Attack |  | — |

**Abilities (1)**

- **Immutable** — It can't be transformed.

### Living Statue, Iron

- UUID: `Compendium.vagabond.bestiary.Actor.gt8W22bMxmlzXVXi`
- HD 4 · TL 2.7 · Armor 3 (as Plate) · medium · Zone frontline · Morale 11 · Appearing d4
- Speed 10
- Immune: poison
- Status Immune: blinded, unconscious, fatigued

**Actions (1)**

| Name | Type | Damage | Note | Recharge | Status |
|---|---|---|---|---|---|
| Weapon | melee | +4 1d8 | Melee Attack |  | — |

**Abilities (2)**

- **Immutable** — It can't be transformed.
- **Iron Absorption** — When hit with a metal weapon that isn’t a Relic, the attacker must pass [Will] or the weapon becomes stuck in this Being's body, and can only be removed if this Being is killed.

**Findings (1)**

- ⚠️ `unimplemented-passive`: Ability "Iron Absorption" describes mechanical effects (must-pass) but has no automation in scripts/npc-abilities.mjs.

### Living Statue, Rock

- UUID: `Compendium.vagabond.bestiary.Actor.TDwppLCtTNicN0kx`
- HD 5 · TL 5 · Armor 3 (as (+1) Chain) · medium · Zone frontline · Morale 11 · Appearing d4
- Speed 20
- Immune: fire, poison
- Weak: cold, blunt
- Status Immune: blinded, unconscious, fatigued

**Actions (2)**

| Name | Type | Damage | Note | Recharge | Status |
|---|---|---|---|---|---|
| Combo | melee | — |  |  | — |
| Magma Jet | ranged | +7 2d6 | Ranged Attack |  | burning |

**Abilities (1)**

- **Immutable** — It can't be transformed.

### Necrophidius

- UUID: `Compendium.vagabond.bestiary.Actor.X5SxKCZtI5jCWBK4`
- HD 2 · TL 2 · Armor 2 (as Chain) · large · Zone frontline · Morale  · Appearing 1
- Speed 25 · Senses: Blindsight
- Immune: poison
- Weak: blunt
- Status Immune: sickened, fatigued

**Actions (2)**

| Name | Type | Damage | Note | Recharge | Status |
|---|---|---|---|---|---|
| Dance of Death | castRanged | — | Cast, Remote \| Will |  | dazed |
| Bite | melee | +4 1d8 | Melee Attack |  | sickened, paralyzed |

**Abilities (1)**

- **Immutable** — It can't be transformed.

**Findings (1)**

- ⚠️ `damageless-requiresDamage`: Necrophidius / "Dance of Death": causedStatus "dazed" has requiresDamage=true but the action deals no damage — status can never apply by that rule.

### Potead, Large

- UUID: `Compendium.vagabond.bestiary.Actor.qoDcl5FH8moHJYq9`
- HD 8 · TL 3.4 · Armor 2 (as Chain) · large · Zone frontline · Morale 7 · Appearing 2d6
- Speed 15
- Immune: fire, poison
- Status Immune: sickened, fatigued

**Actions (1)**

| Name | Type | Damage | Note | Recharge | Status |
|---|---|---|---|---|---|
| Slam | melee | +9 2d8 | Melee Attack |  | — |

**Abilities (1)**

- **Immutable** — It can't be transformed.

### Potead, Medium

- UUID: `Compendium.vagabond.bestiary.Actor.KQSHQH9otaxpToPF`
- HD 5 · TL 2.3 · Armor 2 (as Chain) · medium · Zone frontline · Morale 7 · Appearing 2d6
- Speed 15
- Immune: fire, poison
- Status Immune: sickened, fatigued

**Actions (1)**

| Name | Type | Damage | Note | Recharge | Status |
|---|---|---|---|---|---|
| Slam | melee | +4 1d8 | Melee Attack |  | — |

**Abilities (1)**

- **Immutable** — It can't be transformed.

### Potead, Small

- UUID: `Compendium.vagabond.bestiary.Actor.LHeJZ3DFQ1ni6og1`
- HD 1 · TL 1.5 · Armor 2 (as Chain) · small · Zone frontline · Morale 7 · Appearing 2d6
- Speed 15
- Immune: fire, poison
- Status Immune: sickened, fatigued

**Actions (1)**

| Name | Type | Damage | Note | Recharge | Status |
|---|---|---|---|---|---|
| Slam | melee | +2 1d4 | Melee Attack |  | — |

**Abilities (1)**

- **Immutable** — It can't be transformed.

### Ripworm

- UUID: `Compendium.vagabond.bestiary.Actor.KOz3gxILuvDESwJZ`
- HD 4 · TL 3.1 · Armor 3 (as Plate) · medium · Zone frontline · Morale 10 · Appearing d4
- Speed 20 · Senses: Seismicsense 60'
- Immune: poison
- Status Immune: sickened, fatigued

**Actions (1)**

| Name | Type | Damage | Note | Recharge | Status |
|---|---|---|---|---|---|
| Ripsaw | melee | +7 2d6 | Melee Attack |  | — |

**Abilities (2)**

- **Immutable** — It can't be transformed.
- **Tunneller** — Can Move through solid rock and earth, leaving a 3-foot tunnel in its path.

### Scarecrow

- UUID: `Compendium.vagabond.bestiary.Actor.gYBtO8FpqNSE26so`
- HD 5 · TL 2.2 · Armor 1 (as Leather) · medium · Zone frontline · Morale 2 · Appearing 1
- Speed 30 · Senses: Blindsight
- Immune: poison
- Weak: fire
- Status Immune: blinded, sickened

**Actions (3)**

| Name | Type | Damage | Note | Recharge | Status |
|---|---|---|---|---|---|
| Scream | castRanged | — | Cast, any Being who can hear it \| Will | Cd4 | frightened, paralyzed |
| Combo | melee | — |  |  | — |
| Claw | melee | +3 1d6 | Melee Attack |  | — |

**Abilities (1)**

- **Immutable** — It can't be transformed.

**Findings (2)**

- ⚠️ `damageless-requiresDamage`: Scarecrow / "Scream": causedStatus "frightened" has requiresDamage=true but the action deals no damage — status can never apply by that rule.
- ⚠️ `damageless-requiresDamage`: Scarecrow / "Scream": causedStatus "paralyzed" has requiresDamage=true but the action deals no damage — status can never apply by that rule.

### Stone Colossus

- UUID: `Compendium.vagabond.bestiary.Actor.Xc30d0v7k9g20Nmu`
- HD 25 · TL 11.7 · Armor 6 (as (+3) Plate) · colossal · Zone frontline · Morale  · Appearing 1
- Speed 50
- Immune: fire, poison
- Status Immune: paralyzed, confused, sickened, charmed, frightened, berserk

**Actions (3)**

| Name | Type | Damage | Note | Recharge | Status |
|---|---|---|---|---|---|
| Combo | melee | — |  |  | — |
| Slam | melee | +21 6d6 | Melee Attack, Near |  | prone |
| Laser | ranged | +14 4d6 | Ranged Attack | Cd4 | — |

**Abilities (4)**

- **Besieger** — Deals double damage to Structures.
- **Immutable** — It can't be transformed.
- **Magic Ward IV** — The first time it is unwillingly affected by a Spell each Round, the Caster must spend an extra 4 Mana to affect it.
- **Self-Destruct** — If it is at or below half its HP, its core begins self-destructing. This core goes off in 1 minute, and the sonic boom deals 200 damage to everything within 1 mile.

**Findings (2)**

- ⚠️ `unimplemented-passive`: Ability "Magic Ward IV" describes mechanical effects (must-spend-mana) but has no automation in scripts/npc-abilities.mjs.
- ⚠️ `unimplemented-passive`: Ability "Self-Destruct" describes mechanical effects (deals-damage) but has no automation in scripts/npc-abilities.mjs.
