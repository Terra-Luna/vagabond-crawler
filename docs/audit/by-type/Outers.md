# Outers — 31 monsters

Generated: 2026-04-14T20:55:00.591Z

| Name | HD | TL | Armor | Zone | Actions | Abilities | Findings |
|---|---|---|---|---|---|---|---|
| Agnar | 10 | 3.9 | 2 as Chain | frontline | 2 | 3 | 5 |
| Angel | 12 | 10.5 | 6 as (+3) Plate; Divine Armor | midline | 6 | 5 | 3 |
| Byakhee | 15 | 10.5 | 5 as (+2) Plate | midline | 3 | 2 | 1 |
| Chort | 7 | 5 | 3 as (+1) Chain | frontline | 3 | 1 | 1 |
| Cloaker | 6 | 2.6 | 2 as Chain | frontline | 3 | 1 | 2 |
| Couatl | 9 | 3.8 | 3 as (+1) Chain | backline | 3 | 0 | 1 |
| Deep One | 3 | 2.5 | 2 as Chain | midline | 3 | 2 | 3 |
| Demon Ray | 1 | 2.4 | 2 as Chain | midline | 2 | 2 | 2 |
| Dethbat | 1 | 1 | 1 as Leather | midline | 3 | 1 | 3 |
| Dimension Ripper | 10 | 6.3 | 3 as (+2) Leather | frontline | 4 | 2 | 5 |
| False Hydra | 6 | 3.1 | 3 as (+2) Leather | frontline | 3 | 2 | 1 |
| Floating Eye | 1 | 0.1 | 0 as Unarmored | backline | 3 | 2 | 4 |
| Gibbering Mouther | 4 | 4 | 4 as (+1) Plate | frontline | 4 | 1 | 4 |
| Hellhound | 4 | 4.3 | 3 as (+1) Chain | midline | 2 | 0 | 0 |
| Imp | 2 | 2 | 3 as Plate | frontline | 1 | 1 | 0 |
| Nightmare | 6 | 5.6 | 5 as (+2) Plate | frontline | 3 | 2 | 2 |
| Ogler | 12 | 11.2 | 4 as (+1) Plate | backline | 11 | 3 | 9 |
| Oni | 8 | 7.9 | 2 as Chain | backline | 8 | 1 | 7 |
| Otyugh | 6 | 4.6 | 3 as (+1) Chain | frontline | 4 | 1 | 2 |
| Phoenix | 20 | 10.5 | 5 as (+3) Chain | backline | 4 | 5 | 5 |
| Pit Fiend | 13 | 7.9 | 5 as (+3) Plate | frontline | 8 | 4 | 8 |
| Sphinx | 12 | 5.7 | 4 as (+1) Plate | frontline | 4 | 2 | 4 |
| Sphinx, Archon | 24 | 12.6 | 6 as (+3) Plate | frontline | 10 | 4 | 8 |
| Stolas Demon | 27 | 11.2 | 7 as (+4) Plate | frontline | 4 | 2 | 3 |
| Thoom | 2 | 2.2 | 1 as Leather | backline | 3 | 2 | 2 |
| Thulhan | 8 | 3.8 | 3 as (+1) Chain | midline | 4 | 2 | 1 |
| Vigzud | 5 | 3.5 | 2 as Chain | midline | 4 | 4 | 8 |
| Viper Tree | 9 | 3.2 | 2 Bark | frontline | 1 | 0 | 0 |
| Viskyd | 1 | 1.2 | 1 as Leather | frontline | 2 | 3 | 2 |
| Wolf in Sheep's Clothing | 9 | 2.4 | 1 as Leather | frontline | 2 | 0 | 0 |
| Zotz, Demon | 14 | 9.2 | 4 as (+1) Plate | frontline | 4 | 3 | 3 |

---

## Details

### Agnar

- UUID: `Compendium.vagabond.bestiary.Actor.aAONbN10F5bLslSE`
- HD 10 · TL 3.9 · Armor 2 (as Chain) · huge · Zone frontline · Morale 10 · Appearing 1
- Speed 30
- Weak: fire

**Actions (2)**

| Name | Type | Damage | Note | Recharge | Status |
|---|---|---|---|---|---|
| Spin-Thrash | castClose | +9 2d8 | Cast, Aura Near \| Endure | 3/Day | — |
| Chomp | melee | +10 3d6 | Melee Attack, Cleave |  | restrained |

**Abilities (3)**

- **Flame Anger** — If it takes Fire damage or sees open flame, it goes Berserk (Cd4).
- **Lockjaw** — Hinders Checks to end being Restrained by it.
- **Leap** — If it uses its Move to Jump, any Being within 5 feet when it lands must pass a [Reflex] Save or take 10 (3d6) and be shoved Prone.

**Findings (5)**

- ⚠️ `unimplemented-passive`: Ability "Flame Anger" describes mechanical effects (berserk) but has no automation in scripts/npc-abilities.mjs.
- ⚠️ `unimplemented-passive`: Ability "Leap" describes mechanical effects (prone, must-pass) but has no automation in scripts/npc-abilities.mjs.
- ⚠️ `unimplemented-passive`: Ability "Lockjaw" describes mechanical effects (restrained) but has no automation in scripts/npc-abilities.mjs.
- ⚠️ `ability-mentions-status-without-action`: Ability "Flame Anger" on Agnar mentions Berserk, but no action on this monster applies those statuses.
- ⚠️ `ability-mentions-status-without-action`: Ability "Leap" on Agnar mentions Prone, but no action on this monster applies those statuses.

### Angel

- UUID: `Compendium.vagabond.bestiary.Actor.2Wx5RcpuRN8Nw6T0`
- HD 12 · TL 10.5 · Armor 6 (as (+3) Plate; Divine Armor) · huge · Zone midline · Morale 11 · Appearing 1
- Speed 40 / fly · Senses: Allsight, Telepathy
- Immune: poison, physical
- Status Immune: confused, berserk, sickened, fatigued, frightened, paralyzed

**Actions (6)**

| Name | Type | Damage | Note | Recharge | Status |
|---|---|---|---|---|---|
| Dominator | melee | — | 2 Actions (re-roll duplicates) |  | — |
| Flaming Sword | melee | +17 4d6+3 (fire) | Melee Attack |  | burning |
| Banish | castRanged | — | Remote \| Will |  | — |
| Command | castRanged | +4 d6+1 | Cast, Far Aura |  | — |
| Heal | castClose | — | Cast, Touch |  | — |
| Radiance | castRanged | — | Cast, Far Aura |  | — |

**Abilities (5)**

- **Fall from Grace** — If it ever acts against divine ordainment, it loses Grace, Fly Speed, All-Sight, Immune, and Status Immunities.
- **Grace** — It can't be reduced below 1 HP. If its body is destroyed, it immediately appears in its plane of origin at full HP.
- **Illuminator** — Sheds Sunlight in Near.
- **Magic Ward III** — The first time it is unwillingly affected by a Spell each Round, the Caster must spend an extra 3 Mana to affect it.
- **Flaming Sword** — [Relic; (+3) Silvered Greatsword] Has the Loyalty Power.

**Findings (3)**

- ❌ `broken-automation`: Compendium text describes a Mana-cost penalty; scripts/npc-abilities.mjs injects a roll-penalty die (1d8) instead.
- ⚠️ `extraInfo-status-mismatch`: Angel / "Heal": extraInfo mentions Blinded, Paralyzed, Sickened but causedStatuses does not include these ids.
- ℹ️ `save-mention-orphan`: Angel / "Banish": note mentions save type(s) will but action has no causedStatuses and no damage.

### Byakhee

- UUID: `Compendium.vagabond.bestiary.Actor.PSNF8mdWgMS4hZ2E`
- HD 15 · TL 10.5 · Armor 5 (as (+2) Plate) · huge · Zone midline · Morale 10 · Appearing 1
- Speed 60 / fly 180 · Senses: Darksight, Telepathy

**Actions (3)**

| Name | Type | Damage | Note | Recharge | Status |
|---|---|---|---|---|---|
| Combo | melee | — |  |  | — |
| Bite | melee | +10 3d6 | Melee Attack |  | — |
| Claw | melee | +13 3d8 | Melee Attack 10' |  | — |

**Abilities (2)**

- **Instant Transmission** — (Recharge Cd10 days): If it is in space, it can use its Action to teleport itself and any Beings in physical contact with it at lightspeed to anywhere within the nearby star system.
- **Interstellar** — It can freely move in the vacuum of space.

**Findings (1)**

- ⚠️ `extraInfo-status-mismatch`: Byakhee / "Bite": extraInfo mentions Dazed, Sickened but causedStatuses does not include these ids.

### Chort

- UUID: `Compendium.vagabond.bestiary.Actor.1wsieodgDkGEU0si`
- HD 7 · TL 5 · Armor 3 (as (+1) Chain) · medium · Zone frontline · Morale 11 · Appearing d4
- Speed 30 · Senses: Allsight, Blindsight
- Immune: poison, fire, physical
- Status Immune: frightened, fatigued

**Actions (3)**

| Name | Type | Damage | Note | Recharge | Status |
|---|---|---|---|---|---|
| Combo | melee | — |  |  | — |
| (+1) Claw | melee | +3 1d4+1 | Melee Attack |  | — |
| Headbutt | melee | +9 2d8 | Melee Attack |  | — |

**Abilities (1)**

- **Magic Ward II** — The first time it is unwillingly affected by a Spell each Round, the Caster must spend an extra 2 Mana to affect it.

**Findings (1)**

- ❌ `broken-automation`: Compendium text describes a Mana-cost penalty; scripts/npc-abilities.mjs injects a roll-penalty die (1d6) instead.

### Cloaker

- UUID: `Compendium.vagabond.bestiary.Actor.8sVozyqwRdex7Vu2`
- HD 6 · TL 2.6 · Armor 2 (as Chain) · large · Zone frontline · Morale 7 · Appearing d4
- Speed 0 / fly 30 · Senses: Darksight

**Actions (3)**

| Name | Type | Damage | Note | Recharge | Status |
|---|---|---|---|---|---|
| Combo | melee | — |  |  | — |
| Cloak | melee | — | Melee Attack |  | restrained |
| Bite | melee | +2 1d4 | Melee Attack |  | — |

**Abilities (1)**

- **Cloaking** — While it has a Target Restrained, attack damage dealt to it is halved and also dealt to the Target.

**Findings (2)**

- ⚠️ `damageless-requiresDamage`: Cloaker / "Cloak": causedStatus "restrained" has requiresDamage=true but the action deals no damage — status can never apply by that rule.
- ⚠️ `unimplemented-passive`: Ability "Cloaking" describes mechanical effects (restrained) but has no automation in scripts/npc-abilities.mjs.

### Couatl

- UUID: `Compendium.vagabond.bestiary.Actor.35jFokbHaywW57P4`
- HD 9 · TL 3.8 · Armor 3 (as (+1) Chain) · medium · Zone backline · Morale 9 · Appearing d4
- Speed 20 / fly 60 · Senses: All-Sight, Telepathy 120'
- Status Immune: confused, berserk, sickened, fatigued, frightened, paralyzed

**Actions (3)**

| Name | Type | Damage | Note | Recharge | Status |
|---|---|---|---|---|---|
| Bite | melee | +2 1d4 | Melee Attack |  | sickened, unconscious |
| Restoration | castClose | +10 3d6 (healing) | Cast, Touch |  | — |
| Shapechange | castClose | +0 | Cast, Self (Focus) |  | — |

**Findings (1)**

- ⚠️ `extraInfo-status-mismatch`: Couatl / "Bite": extraInfo mentions Restrained but causedStatuses does not include these ids.

### Deep One

- UUID: `Compendium.vagabond.bestiary.Actor.8JzYAkpSslsI0HpO`
- HD 3 · TL 2.5 · Armor 2 (as Chain) · medium · Zone midline · Morale 8 · Appearing 2d12
- Speed 30 / swim · Senses: Darksight
- Immune: poison
- Status Immune: charmed, paralyzed, unconscious

**Actions (3)**

| Name | Type | Damage | Note | Recharge | Status |
|---|---|---|---|---|---|
| Combo | melee | — |  |  | — |
| Claw | melee | +3 1d6 | Melee Attack |  | — |
| Weapon | melee | +3 1d6 | Melee Attack |  | — |

**Abilities (2)**

- **Amphibious** — Can breathe air and water.
- **Sunblinded** — Blinded by Sunlight.

**Findings (3)**

- ℹ️ `speed-ambiguous`: Deep One: speedTypes entry "swim" has no speed and speedValues.swim is 0. Implicit base speed? Intent unclear.
- ⚠️ `unimplemented-passive`: Ability "Sunblinded" describes mechanical effects (blinded) but has no automation in scripts/npc-abilities.mjs.
- ⚠️ `ability-mentions-status-without-action`: Ability "Sunblinded" on Deep One mentions Blinded, but no action on this monster applies those statuses.

### Demon Ray

- UUID: `Compendium.vagabond.bestiary.Actor.QlBMPKwPxTNYRSfg`
- HD 1 · TL 2.4 · Armor 2 (as Chain) · medium · Zone midline · Morale 10 · Appearing 2d6
- Speed 0 / swim 30 · Senses: Darksight

**Actions (2)**

| Name | Type | Damage | Note | Recharge | Status |
|---|---|---|---|---|---|
| Bite | melee | +7 3d4 | Melee Attack |  | — |
| Leech | castRanged | +3 1d6 | Cast, Remote \| Endure |  | sickened |

**Abilities (2)**

- **Amphibious** — Can breathe air and water.
- **Sunblinded** — Blinded by Sunlight.

**Findings (2)**

- ⚠️ `unimplemented-passive`: Ability "Sunblinded" describes mechanical effects (blinded) but has no automation in scripts/npc-abilities.mjs.
- ⚠️ `ability-mentions-status-without-action`: Ability "Sunblinded" on Demon Ray mentions Blinded, but no action on this monster applies those statuses.

### Dethbat

- UUID: `Compendium.vagabond.bestiary.Actor.mPEirZNos2d7EOoJ`
- HD 1 · TL 1 · Armor 1 (as Leather) · small · Zone midline · Morale 3 · Appearing 2d6
- Speed 5 / fly 30 · Senses: Darksight
- Immune: poison, fire, physical
- Weak: silver
- Status Immune: sickened

**Actions (3)**

| Name | Type | Damage | Note | Recharge | Status |
|---|---|---|---|---|---|
| Kiss | melee | +0 | Melee Attack, a Paralyzed Enemy \| Will |  | — |
| Shriek | castClose | +0 | All Near non-Dethbats that hear it \| Will |  | frightened, paralyzed |
| Bite | melee | +2 1d4 | Melee Attack |  | — |

**Abilities (1)**

- **Dethbat’s Curse** — [Curse] Every hour while cursed and not in Sunlight, the victim rolls a d6, progressing the curse by 1 stage on a roll of 1:  1. Their hair falls out.  2. Their ears transform into wings and their teeth become fangs.  3. They gain 1 Fatigue. If they die due to this, their head rips from their body and becomes a Dethbat.

**Findings (3)**

- ⚠️ `damageless-requiresDamage`: Dethbat / "Shriek": causedStatus "frightened" has requiresDamage=true but the action deals no damage — status can never apply by that rule.
- ⚠️ `damageless-requiresDamage`: Dethbat / "Shriek": causedStatus "paralyzed" has requiresDamage=true but the action deals no damage — status can never apply by that rule.
- ℹ️ `save-mention-orphan`: Dethbat / "Kiss": note mentions save type(s) will but action has no causedStatuses and no damage.

### Dimension Ripper

- UUID: `Compendium.vagabond.bestiary.Actor.0yQoEPuPUHUKwEAv`
- HD 10 · TL 6.3 · Armor 3 (as (+2) Leather) · large · Zone frontline · Morale 5 · Appearing 1
- Speed 35 · Senses: Darksight, Telepathy
- Immune: poison, fire, cold, physical
- Status Immune: sickened

**Actions (4)**

| Name | Type | Damage | Note | Recharge | Status |
|---|---|---|---|---|---|
| Temporal Lock | castRanged | +0 | Cast, Sight \| Will | Cd4 | paralyzed |
| Combo | melee | — |  |  | — |
| (+1) Bite | melee | +5 1d8+1 | Melee Attack |  | — |
| (+1) Claw | melee | +8 2d6+1 | Melee Attack |  | — |

**Abilities (2)**

- **Maddening I** — Enemies that can hear it for the first time and at the start of their Turns must pass [Will] or be Confused (Cd4).
- **Terror I** — Enemies that can see it for the first time and at the start of their Turns must pass [Will] or be Frightened (Cd4).

**Findings (5)**

- ⚠️ `damageless-requiresDamage`: Dimension Ripper / "Temporal Lock": causedStatus "paralyzed" has requiresDamage=true but the action deals no damage — status can never apply by that rule.
- ⚠️ `unimplemented-passive`: Ability "Maddening I" describes mechanical effects (confused, must-pass) but has no automation in scripts/npc-abilities.mjs.
- ⚠️ `unimplemented-passive`: Ability "Terror I" describes mechanical effects (frightened, must-pass) but has no automation in scripts/npc-abilities.mjs.
- ⚠️ `ability-mentions-status-without-action`: Ability "Maddening I" on Dimension Ripper mentions Confused, but no action on this monster applies those statuses.
- ⚠️ `ability-mentions-status-without-action`: Ability "Terror I" on Dimension Ripper mentions Frightened, but no action on this monster applies those statuses.

### False Hydra

- UUID: `Compendium.vagabond.bestiary.Actor.5oYLWXICi7KYOtla`
- HD 6 · TL 3.1 · Armor 3 (as (+2) Leather) · medium · Zone frontline · Morale 4 · Appearing 1
- Speed 25 · Senses: Darksight
- Status Immune: charmed, confused

**Actions (3)**

| Name | Type | Damage | Note | Recharge | Status |
|---|---|---|---|---|---|
| Combo | melee | — |  |  | — |
| Bite | melee | +5 1d10 | Melee Attack, Near |  | — |
| Song of Discord | castRanged | +0 | Action, 5-mile Aura (only those who can hear it) \| Will |  | charmed |

**Abilities (2)**

- **Tunneler** — Can Move through loose earth using its Speed.
- **Multiple Heads** — It starts with one head, but grows another as it consumes humanoid Beings. Each time it grows a new head, it gains 3 HD (13 HP), and its stats change as shown below:  3 Consumed: 2 Heads, Medium, TL 4.1  6 Consumed: 3 Heads, Large, TL 5.6  9 Consumed: 4 Heads, Large, TL 6.9  15 Consumed: 5 Heads, Huge, TL 8.2  24 Consumed: 6 Heads, Huge, TL 9.4

**Findings (1)**

- ⚠️ `damageless-requiresDamage`: False Hydra / "Song of Discord": causedStatus "charmed" has requiresDamage=true but the action deals no damage — status can never apply by that rule.

### Floating Eye

- UUID: `Compendium.vagabond.bestiary.Actor.GueGlPk8Be6uhm0b`
- HD 1 · TL 0.1 · Armor 0 (as Unarmored) · small · Zone backline · Morale 7 · Appearing 2d6
- Speed 0 / fly 30 · Senses: Darksight, Telepathy
- Weak: acid, piercing
- Status Immune: prone

**Actions (3)**

| Name | Type | Damage | Note | Recharge | Status |
|---|---|---|---|---|---|
| Glare | castRanged | — | Cast, 30-foot Cone | 1/Day | — |
| Muddle | castRanged | — | Cast, 30-foot Cone | Cd4 | confused |
| Enrage | castRanged | — | Cast, 30-foot Cone | Cd4 | berserk |

**Abilities (2)**

- **Antimagical Cone I** — Cast Checks in a Near Cone from its central eye always fail, and any magic effect in the Cone is suspended while in the Cone.
- **Ocular** — Checks to make it Blinded are Favored.

**Findings (4)**

- ⚠️ `damageless-requiresDamage`: Floating Eye / "Enrage": causedStatus "berserk" has requiresDamage=true but the action deals no damage — status can never apply by that rule.
- ⚠️ `damageless-requiresDamage`: Floating Eye / "Muddle": causedStatus "confused" has requiresDamage=true but the action deals no damage — status can never apply by that rule.
- ⚠️ `unimplemented-passive`: Ability "Ocular" describes mechanical effects (blinded, favored) but has no automation in scripts/npc-abilities.mjs.
- ⚠️ `ability-mentions-status-without-action`: Ability "Ocular" on Floating Eye mentions Blinded, but no action on this monster applies those statuses.

### Gibbering Mouther

- UUID: `Compendium.vagabond.bestiary.Actor.iDD1iA0svCS8AINS`
- HD 4 · TL 4 · Armor 4 (as (+1) Plate) · medium · Zone frontline · Morale 8 · Appearing 1
- Speed 30 / climb, swim

**Actions (4)**

| Name | Type | Damage | Note | Recharge | Status |
|---|---|---|---|---|---|
| Frenzy | melee | — | Multi-Attack |  | — |
| Bite | melee | +4 1d8 | Melee Attack |  | prone |
| Babble | castClose | — | Action, Aura Near \| Will |  | confused |
| Spit | ranged | — | Ranged Attack, Near \| Endure |  | blinded |

**Abilities (1)**

- **Eldritch Ground** — The Close ground around it is Difficult Terrain made of gummy, warped flesh.

**Findings (4)**

- ⚠️ `damageless-requiresDamage`: Gibbering Mouther / "Babble": causedStatus "confused" has requiresDamage=true but the action deals no damage — status can never apply by that rule.
- ⚠️ `damageless-requiresDamage`: Gibbering Mouther / "Spit": causedStatus "blinded" has requiresDamage=true but the action deals no damage — status can never apply by that rule.
- ℹ️ `speed-ambiguous`: Gibbering Mouther: speedTypes entry "climb" has no speed and speedValues.climb is 0. Implicit base speed? Intent unclear.
- ℹ️ `speed-ambiguous`: Gibbering Mouther: speedTypes entry "swim" has no speed and speedValues.swim is 0. Implicit base speed? Intent unclear.

### Hellhound

- UUID: `Compendium.vagabond.bestiary.Actor.Fup7vnsrE5fRJwyP`
- HD 4 · TL 4.3 · Armor 3 (as (+1) Chain) · medium · Zone midline · Morale 8 · Appearing d4
- Speed 40 · Senses: Darksight
- Immune: poison, fire
- Weak: cold, physical

**Actions (2)**

| Name | Type | Damage | Note | Recharge | Status |
|---|---|---|---|---|---|
| Hellfire | castClose | +10 3d6 (fire) | Cast, Cone 15' \| Reflex | Cd6 | burning |
| Bite | melee | +3 1d6 | Melee Attack |  | — |

### Imp

- UUID: `Compendium.vagabond.bestiary.Actor.NrXxQx5CSfn4Ojzx`
- HD 2 · TL 2 · Armor 3 (as Plate) · small · Zone frontline · Morale 2 · Appearing 1
- Speed 10 / fly 40 · Senses: Darksight
- Immune: poison, fire
- Status Immune: sickened

**Actions (1)**

| Name | Type | Damage | Note | Recharge | Status |
|---|---|---|---|---|---|
| Sting | melee | +2 1d4 | Melee Attack |  | sickened, unconscious |

**Abilities (1)**

- **** — The first time it is unwillingly affected by a Spell each Round, the Caster must spend an extra 1 Mana to affect it.

### Nightmare

- UUID: `Compendium.vagabond.bestiary.Actor.hoo4mqGpqwc1cJA5`
- HD 6 · TL 5.6 · Armor 5 (as (+2) Plate) · large · Zone frontline · Morale 7 · Appearing 1
- Speed 50 / fly · Senses: Darksight
- Immune: poison, fire

**Actions (3)**

| Name | Type | Damage | Note | Recharge | Status |
|---|---|---|---|---|---|
| Stampede | melee | — | Multi-Attack |  | — |
| Bite | melee | +5 2d4 | Melee Attack |  | — |
| Stomp | melee | +3 1d6 | Melee Attack |  | burning |

**Abilities (2)**

- **Fire Rider** — Allies mounted on it are Immune to Fire.
- **Illuminating** — Sheds Light out to Near.

**Findings (2)**

- ⚠️ `extraInfo-status-mismatch`: Nightmare / "Stomp": extraInfo mentions Prone but causedStatuses does not include these ids.
- ℹ️ `speed-ambiguous`: Nightmare: speedTypes entry "fly" has no speed and speedValues.fly is 0. Implicit base speed? Intent unclear.

### Ogler

- UUID: `Compendium.vagabond.bestiary.Actor.iyCEulXgz8uABmdD`
- HD 12 · TL 11.2 · Armor 4 (as (+1) Plate) · large · Zone backline · Morale 12 · Appearing 1
- Speed 0 / fly 20 · Senses: Darksight, Telepathy (Far)

**Actions (11)**

| Name | Type | Damage | Note | Recharge | Status |
|---|---|---|---|---|---|
| Multi-Cast | melee | — |  |  | — |
| Eyebeam | castRanged | — | Cast, Remote |  | — |
| 1 - Charm | castRanged | — | Will |  | charmed |
| 2 - Sleep | castRanged | — | Will |  | unconscious |
| 3 - Kinesis | castRanged | — | Will |  | restrained |
| 4 - Petrify | castRanged | — | Will |  | — |
| 5 - Death | castRanged | +14 4d6 | Near Only \| Endure |  | — |
| 6 - Fear | castRanged | +0 | Will |  | frightened |
| 7 - Slow | castRanged | +0 | Will |  | — |
| 8 - Paralysis | castRanged | +0 | Endure |  | paralyzed |
| Bite | melee | +5 2d4 | Melee Attack |  | — |

**Abilities (3)**

- **Antimagical Cone** — Cast Checks in a Far Cone from its central eye always fail, and any magic effect in the Cone is suspended while in the Cone.
- **Mind of Madness** — It can Cast while Berserk.
- **** — 

**Findings (9)**

- ⚠️ `damageless-requiresDamage`: Ogler / "1 - Charm": causedStatus "charmed" has requiresDamage=true but the action deals no damage — status can never apply by that rule.
- ⚠️ `damageless-requiresDamage`: Ogler / "2 - Sleep": causedStatus "unconscious" has requiresDamage=true but the action deals no damage — status can never apply by that rule.
- ⚠️ `damageless-requiresDamage`: Ogler / "3 - Kinesis": causedStatus "restrained" has requiresDamage=true but the action deals no damage — status can never apply by that rule.
- ⚠️ `damageless-requiresDamage`: Ogler / "6 - Fear": causedStatus "frightened" has requiresDamage=true but the action deals no damage — status can never apply by that rule.
- ⚠️ `damageless-requiresDamage`: Ogler / "8 - Paralysis": causedStatus "paralyzed" has requiresDamage=true but the action deals no damage — status can never apply by that rule.
- ℹ️ `save-mention-orphan`: Ogler / "4 - Petrify": note mentions save type(s) will but action has no causedStatuses and no damage.
- ℹ️ `save-mention-orphan`: Ogler / "7 - Slow": note mentions save type(s) will but action has no causedStatuses and no damage.
- ⚠️ `unimplemented-passive`: Ability "Mind of Madness" describes mechanical effects (berserk) but has no automation in scripts/npc-abilities.mjs.
- ⚠️ `ability-mentions-status-without-action`: Ability "Mind of Madness" on Ogler mentions Berserk, but no action on this monster applies those statuses.

### Oni

- UUID: `Compendium.vagabond.bestiary.Actor.OI2CyIrhee1JOYlv`
- HD 8 · TL 7.9 · Armor 2 (as Chain) · large · Zone backline · Morale 11 · Appearing 1
- Speed 30 / fly · Senses: Darksight

**Actions (8)**

| Name | Type | Damage | Note | Recharge | Status |
|---|---|---|---|---|---|
| Cone of Cold | castRanged | +36 8d8 (cold) | Cast, 60' Cone \| Endure | 1/Day | — |
| Charm Person | castRanged | +0 | Cast, a Remote Humanlike \| Will | 1/Day | charmed |
| Darkness | castRanged | +0 | Cast, 20' Sphere |  | — |
| Sleep | castRanged | +0 | Cast, 20' Sphere \| Endure | 1/Day | unconscious |
| Gaseous Form | castClose | +0 | Cast, Touch \| Endure | 1/Day | — |
| Combo | melee | — |  |  | — |
| Claw | melee | +6 1d8+2 | Melee Attack |  | — |
| Invisibility | castClose | +0 | Cast, Touch \| Will |  | — |

**Abilities (1)**

- **Regenerate II** — Regains 9 (2d8) HP on its Turns.

**Findings (7)**

- ⚠️ `damageless-requiresDamage`: Oni / "Charm Person": causedStatus "charmed" has requiresDamage=true but the action deals no damage — status can never apply by that rule.
- ⚠️ `damageless-requiresDamage`: Oni / "Sleep": causedStatus "unconscious" has requiresDamage=true but the action deals no damage — status can never apply by that rule.
- ⚠️ `extraInfo-status-mismatch`: Oni / "Invisibility": extraInfo mentions Invisible but causedStatuses does not include these ids.
- ℹ️ `save-mention-orphan`: Oni / "Gaseous Form": note mentions save type(s) endure but action has no causedStatuses and no damage.
- ℹ️ `save-mention-orphan`: Oni / "Invisibility": note mentions save type(s) will but action has no causedStatuses and no damage.
- ℹ️ `speed-ambiguous`: Oni: speedTypes entry "fly" has no speed and speedValues.fly is 0. Implicit base speed? Intent unclear.
- ⚠️ `unimplemented-passive`: Ability "Regenerate II" describes mechanical effects (regains-hp) but has no automation in scripts/npc-abilities.mjs.

### Otyugh

- UUID: `Compendium.vagabond.bestiary.Actor.hpvz01W4mhKZDyrq`
- HD 6 · TL 4.6 · Armor 3 (as (+1) Chain) · large · Zone frontline · Morale 8 · Appearing 1
- Speed 30 · Senses: Telepathy (Far)
- Immune: poison
- Status Immune: sickened

**Actions (4)**

| Name | Type | Damage | Note | Recharge | Status |
|---|---|---|---|---|---|
| Combo | melee | — |  |  | — |
| Bite | melee | +5 1d10 | Melee Attack |  | sickened |
| Tentacle | melee | +4 1d8 | Melee Attack |  | restrained |
| Tentacle (Restraining) | melee | +7 2d6 | Melee Attack \| Endure |  | dazed |

**Abilities (1)**

- **Otyugh Disease** — Beings that aren't otyughs that are Sickened this way must pass an an [Endure] Save every day or lose 3 (d6) from their Max HP. This reduction to their Max HP lasts while they are Sickened by this disease.

**Findings (2)**

- ⚠️ `extraInfo-status-mismatch`: Otyugh / "Tentacle (Restraining)": extraInfo mentions Restrained but causedStatuses does not include these ids.
- ⚠️ `unimplemented-passive`: Ability "Otyugh Disease" describes mechanical effects (sickened, must-pass) but has no automation in scripts/npc-abilities.mjs.

### Phoenix

- UUID: `Compendium.vagabond.bestiary.Actor.rb5dVb8peFW4RUIT`
- HD 20 · TL 10.5 · Armor 5 (as (+3) Chain) · giant · Zone backline · Morale 10 · Appearing 1
- Speed 50 / fly 150 · Senses: Allsight
- Immune: fire, physical
- Status Immune: charmed, sickened, confused, paralyzed

**Actions (4)**

| Name | Type | Damage | Note | Recharge | Status |
|---|---|---|---|---|---|
| Resurrect | castClose | +0 | Cast, the corpse of an Ally it is Touching | 1/Day | — |
| Combo | melee | — |  |  | — |
| Talon | melee | +7 2d6 | Melee Attack |  | — |
| Beak | melee | +14 4d6 | Melee Attack |  | — |

**Abilities (5)**

- **Fiery Revival** — (1/Day): If it dies, a ball of fire erupts out from it as a Near Aura. All within must pass a [Reflex] Save or take 55 (d10x10) and be Burning (Cd6). This fire is divine, and ignores Immune to Fire. This Being is than revived in 1 Round at full HP. It will always try to flee until this Ability refreshes.
- **Illuminator** — Sheds Sunlight in Near.
- **Living Fire** — Close Beings are Burning (2d6)
- **Magic Ward II** — The first time it is unwillingly affected by a Spell each Round, the Caster must spend an extra 2 Mana to affect it.
- **Phoenix Down** — [Item] Extremely magical Material. Can Use to revive a dead Being whose corpse the down is placed on at full HP. This does not work on Undead.

**Findings (5)**

- ❌ `broken-automation`: Compendium text describes a Mana-cost penalty; scripts/npc-abilities.mjs injects a roll-penalty die (1d6) instead.
- ⚠️ `unimplemented-passive`: Ability "Fiery Revival" describes mechanical effects (burning, must-pass) but has no automation in scripts/npc-abilities.mjs.
- ⚠️ `unimplemented-passive`: Ability "Living Fire" describes mechanical effects (burning) but has no automation in scripts/npc-abilities.mjs.
- ⚠️ `ability-mentions-status-without-action`: Ability "Fiery Revival" on Phoenix mentions Burning, but no action on this monster applies those statuses.
- ⚠️ `ability-mentions-status-without-action`: Ability "Living Fire" on Phoenix mentions Burning, but no action on this monster applies those statuses.

### Pit Fiend

- UUID: `Compendium.vagabond.bestiary.Actor.tox2rxTF7WFaqSJk`
- HD 13 · TL 7.9 · Armor 5 (as (+3) Plate) · large · Zone frontline · Morale 12 · Appearing 1
- Speed 30 / fly 60 · Senses: Allsight, Darksight, Telepathy
- Immune: poison, fire, physical
- Status Immune: sickened

**Actions (8)**

| Name | Type | Damage | Note | Recharge | Status |
|---|---|---|---|---|---|
| Symbol of Pain | castRanged | — | Cast, Aura Far \| Will | 1/Day | — |
| Fireball | castRanged | +21 6d6 (fire) | Cast, 20' Sphere \| Reflex | Cd4 | burning |
| Combo | melee | — |  |  | — |
| Bite | melee | +10 3d6 | Melee Attack |  | sickened |
| (+2) Mace | melee | +5 1d6+2 | Melee Attack |  | burning |
| Wall of Fire | castRanged | +7 2d6 | Cast, Line \| Reflex | 3/Day | burning |
| Hold | castRanged | — | Cast, Remote \| Endure | Cd4 | paralyzed |
| Tail | melee | +5 2d4 | Melee Attack |  | restrained |

**Abilities (4)**

- **Supreme Hellspawn** — Regains 13 HP each Round.
- **Magic Ward III** — The first time it is unwillingly affected by a Spell each Round, the Caster must spend an extra 3 Mana to affect it.
- **Regenerate II** — Regains 9 (2d8) HP on each of its Turns.
- **Terror II** — Enemies that can see it for the first time and at the start of their Turns thereafter must pass [Will] or be Frightened (Cd6 Rounds).

**Findings (8)**

- ❌ `broken-automation`: Compendium text describes a Mana-cost penalty; scripts/npc-abilities.mjs injects a roll-penalty die (1d8) instead.
- ⚠️ `damageless-requiresDamage`: Pit Fiend / "Hold": causedStatus "paralyzed" has requiresDamage=true but the action deals no damage — status can never apply by that rule.
- ℹ️ `elemental-name-untyped`: Pit Fiend / "Wall of Fire": name suggests elemental damage but damageType is "-".
- ℹ️ `save-mention-orphan`: Pit Fiend / "Symbol of Pain": note mentions save type(s) will but action has no causedStatuses and no damage.
- ⚠️ `unimplemented-passive`: Ability "Regenerate II" describes mechanical effects (regains-hp) but has no automation in scripts/npc-abilities.mjs.
- ⚠️ `unimplemented-passive`: Ability "Supreme Hellspawn" describes mechanical effects (regains-hp) but has no automation in scripts/npc-abilities.mjs.
- ⚠️ `unimplemented-passive`: Ability "Terror II" describes mechanical effects (frightened) but has no automation in scripts/npc-abilities.mjs.
- ⚠️ `ability-mentions-status-without-action`: Ability "Terror II" on Pit Fiend mentions Frightened, but no action on this monster applies those statuses.

### Sphinx

- UUID: `Compendium.vagabond.bestiary.Actor.rTePiNbB8qag6HnP`
- HD 12 · TL 5.7 · Armor 4 (as (+1) Plate) · large · Zone frontline · Morale 10 · Appearing 1
- Speed 60 / fly · Senses: Allsight, Telepathy
- Immune: Physical from non-Relics
- Status Immune: Berserk, Charmed, Confused, Frightened, Suffocating

**Actions (4)**

| Name | Type | Damage | Note | Recharge | Status |
|---|---|---|---|---|---|
| Combo | melee | — |  |  | — |
| Roar | castRanged | — | Action, all Beings who hear it \| Will | 2/Day | frightened, dazed |
| Claw | melee | +7 2d6 | Melee Attack |  | — |
| Dispel Magic | castRanged | — | Cast, Remote \| Will | 2/Day | — |

**Abilities (2)**

- **Future Sight** — Hinders Saves against its Attacks.
- **Magic Ward II** — The first time it is unwillingly affected by a Spell each Round, the Caster must spend an extra 2 Mana to affect it.

**Findings (4)**

- ❌ `broken-automation`: Compendium text describes a Mana-cost penalty; scripts/npc-abilities.mjs injects a roll-penalty die (1d6) instead.
- ⚠️ `damageless-requiresDamage`: Sphinx / "Roar": causedStatus "dazed" has requiresDamage=true but the action deals no damage — status can never apply by that rule.
- ⚠️ `damageless-requiresDamage`: Sphinx / "Roar": causedStatus "frightened" has requiresDamage=true but the action deals no damage — status can never apply by that rule.
- ℹ️ `save-mention-orphan`: Sphinx / "Dispel Magic": note mentions save type(s) will but action has no causedStatuses and no damage.

### Sphinx, Archon

- UUID: `Compendium.vagabond.bestiary.Actor.qtILksrMEcYJ47Be`
- HD 24 · TL 12.6 · Armor 6 (as (+3) Plate) · huge · Zone frontline · Morale 10 · Appearing 1
- Speed 60 / fly · Senses: Allsight, Telepathy
- Immune: physical
- Status Immune: berserk, charmed, confused, frightened, suffocating

**Actions (10)**

| Name | Type | Damage | Note | Recharge | Status |
|---|---|---|---|---|---|
| Combo | melee | — |  |  | — |
| Claw | melee | +14 4d6 | Melee Attack |  | — |
| Arcane Wings | castRanged | +27 5d10 | Cast, 2×Remote \| Reflex |  | — |
| Reality Warp | castRanged | — | Cast, Near Cone \| Endure |  | — |
| 1 - Gate | melee | — | Endure |  | — |
| 2 - Riddle | melee | — | Will |  | dazed |
| 3 - Time Lock | melee | — | Endure |  | paralyzed |
| 4 - Unmake | melee | +13 3d8 | Reflex |  | — |
| Banish | melee | — | Cast, Remote (Focus) \| Will (Focus) |  | incapacitated |
| Dispel Magic | melee | — | Cast, Remote \| Will | 3/Day | — |

**Abilities (4)**

- **Future Sight** — Hinders Saves against its Attacks
- **Magic Ward III** — The first time it is unwillingly affected by a Spell each Round, the Caster must spend an extra 3 Mana to affect it.
- **Metalepsis** — (1/Day): This Being gains the approximate answer to a question it asks itself.
- **Teleporting** — (Recharge Cd4): It can use its Move to teleport to an open space it can see.

**Findings (8)**

- ❌ `broken-automation`: Compendium text describes a Mana-cost penalty; scripts/npc-abilities.mjs injects a roll-penalty die (1d8) instead.
- ⚠️ `damageless-requiresDamage`: Sphinx, Archon / "2 - Riddle": causedStatus "dazed" has requiresDamage=true but the action deals no damage — status can never apply by that rule.
- ⚠️ `damageless-requiresDamage`: Sphinx, Archon / "3 - Time Lock": causedStatus "paralyzed" has requiresDamage=true but the action deals no damage — status can never apply by that rule.
- ⚠️ `damageless-requiresDamage`: Sphinx, Archon / "Banish": causedStatus "incapacitated" has requiresDamage=true but the action deals no damage — status can never apply by that rule.
- ℹ️ `elemental-name-untyped`: Sphinx, Archon / "Arcane Wings": name suggests elemental damage but damageType is "-".
- ℹ️ `save-mention-orphan`: Sphinx, Archon / "1 - Gate": note mentions save type(s) endure but action has no causedStatuses and no damage.
- ℹ️ `save-mention-orphan`: Sphinx, Archon / "Dispel Magic": note mentions save type(s) will but action has no causedStatuses and no damage.
- ℹ️ `save-mention-orphan`: Sphinx, Archon / "Reality Warp": note mentions save type(s) endure but action has no causedStatuses and no damage.

### Stolas Demon

- UUID: `Compendium.vagabond.bestiary.Actor.XqDi7xhYi8r25Eu7`
- HD 27 · TL 11.2 · Armor 7 (as (+4) Plate) · huge · Zone frontline · Morale 11 · Appearing 1
- Speed 40 / cling, fly · Senses: Darksight, Telepathy
- Immune: fire, poison, physical

**Actions (4)**

| Name | Type | Damage | Note | Recharge | Status |
|---|---|---|---|---|---|
| Peer Beyond | castRanged | +21 6d6 | Cast, 30' Cone \| Will | Cd4 | dazed |
| Combo | melee | — |  |  | — |
| Beak | melee | +14 4d6 | Melee Attack |  | — |
| Claw | melee | +13 3d8 | Melee Attack |  | — |

**Abilities (2)**

- **Magic Ward IV** — The first time it is unwillingly affected by a Spell each Round, the Caster must spend an extra 4 Mana to affect it.
- **Regenerate III** — Regains 13 (3d8) HP on each of itsTurns.

**Findings (3)**

- ℹ️ `speed-ambiguous`: Stolas Demon: speedTypes entry "cling" has no speed and speedValues.cling is 0. Implicit base speed? Intent unclear.
- ⚠️ `unimplemented-passive`: Ability "Magic Ward IV" describes mechanical effects (must-spend-mana) but has no automation in scripts/npc-abilities.mjs.
- ⚠️ `unimplemented-passive`: Ability "Regenerate III" describes mechanical effects (regains-hp) but has no automation in scripts/npc-abilities.mjs.

### Thoom

- UUID: `Compendium.vagabond.bestiary.Actor.GAMXQgxdOS165gB8`
- HD 2 · TL 2.2 · Armor 1 (as Leather) · medium · Zone backline · Morale 4 · Appearing d4
- Speed 25 / swim · Senses: Darksight

**Actions (3)**

| Name | Type | Damage | Note | Recharge | Status |
|---|---|---|---|---|---|
| Combo | melee | — |  |  | — |
| Cannon | ranged | +3 d6 | Ranged Attack |  | — |
| Tentacle | melee | +2 d4 | Melee Attack |  | — |

**Abilities (2)**

- **Amphibious** — Breathes air and water.
- **Tentacle** — Starts with 4. Targetting one causes a -1 penalty to the Check, but severs it if at least 2 damage is dealt.

**Findings (2)**

- ℹ️ `speed-ambiguous`: Thoom: speedTypes entry "swim" has no speed and speedValues.swim is 0. Implicit base speed? Intent unclear.
- ⚠️ `unimplemented-passive`: Ability "Tentacle" describes mechanical effects (—) but has no automation in scripts/npc-abilities.mjs.

### Thulhan

- UUID: `Compendium.vagabond.bestiary.Actor.WgRHBofac5k3IUet`
- HD 8 · TL 3.8 · Armor 3 (as (+1) Chain) · medium · Zone midline · Morale 4 · Appearing d4
- Speed 30 · Senses: Darksight, Telepathy

**Actions (4)**

| Name | Type | Damage | Note | Recharge | Status |
|---|---|---|---|---|---|
| Combo | melee | +0 |  |  | — |
| Flay | melee | +5 d8+1 | Melee Attack, Paralyzed Target |  | — |
| Mind Blast | melee | +10 3d6 | Cast, Cone Far \| Will | Cd4 | paralyzed |
| Tentacle | melee | +2 d4 | Melee Attack, Paralyzed Target |  | restrained |

**Abilities (2)**

- **Levitation** — (Focus) It has Fly
- **Magic Ward II** — The first time it is unwillingly affected by a Spell each Round, the Caster must spend an extra 2 Mana to affect it.

**Findings (1)**

- ❌ `broken-automation`: Compendium text describes a Mana-cost penalty; scripts/npc-abilities.mjs injects a roll-penalty die (1d6) instead.

### Vigzud

- UUID: `Compendium.vagabond.bestiary.Actor.ZhhuGoH4rFRiiaPp`
- HD 5 · TL 3.5 · Armor 2 (as Chain) · medium · Zone midline · Morale 4 · Appearing d2
- Speed 30 / climb, cling · Senses: Darksight
- Immune: poison
- Status Immune: berserk, sickened, frightened

**Actions (4)**

| Name | Type | Damage | Note | Recharge | Status |
|---|---|---|---|---|---|
| Web | ranged | +0 | Ranged Attack | Cd4 | restrained |
| Combo | melee | — |  |  | — |
| Bite | melee | +4 1d8 | Melee Attack |  | sickened, berserk |
| Claw | melee | +3 1d6 | Melee Attack |  | — |

**Abilities (4)**

- **Bloodlust** — Beings at or below half HP are Vulnerable to its attacks.
- **Pouncer** — If it moves at least 20 feet before making an Attack on the same Turn, the Target is shoved Prone if it is this Being's size or smaller.
- **Web-Walk** — Its Move is not impeded by webbing.
- **Web** — Its web is an Object with 5 HP and Armor 1. The webs are Difficult Terrain as a surface, and cause a Target to be Restrained if hit with a Web Spit Attack from the Vigzud.

**Findings (8)**

- ⚠️ `damageless-requiresDamage`: Vigzud / "Web": causedStatus "restrained" has requiresDamage=true but the action deals no damage — status can never apply by that rule.
- ℹ️ `speed-ambiguous`: Vigzud: speedTypes entry "climb" has no speed and speedValues.climb is 0. Implicit base speed? Intent unclear.
- ℹ️ `speed-ambiguous`: Vigzud: speedTypes entry "cling" has no speed and speedValues.cling is 0. Implicit base speed? Intent unclear.
- ⚠️ `unimplemented-passive`: Ability "Bloodlust" describes mechanical effects (berserk) but has no automation in scripts/npc-abilities.mjs.
- ⚠️ `unimplemented-passive`: Ability "Pouncer" describes mechanical effects (prone) but has no automation in scripts/npc-abilities.mjs.
- ⚠️ `unimplemented-passive`: Ability "Web" describes mechanical effects (restrained) but has no automation in scripts/npc-abilities.mjs.
- ⚠️ `ability-mentions-status-without-action`: Ability "Bloodlust" on Vigzud mentions Vulnerable, but no action on this monster applies those statuses.
- ⚠️ `ability-mentions-status-without-action`: Ability "Pouncer" on Vigzud mentions Prone, but no action on this monster applies those statuses.

### Viper Tree

- UUID: `Compendium.vagabond.bestiary.Actor.UpPKdvIZe9N3MH2B`
- HD 9 · TL 3.2 · Armor 2 (Bark) · large · Zone frontline · Morale  · Appearing 2d10
- Speed 0
- Immune: acid, cold, poison
- Weak: fire

**Actions (1)**

| Name | Type | Damage | Note | Recharge | Status |
|---|---|---|---|---|---|
| Bite | melee | +7 2d6 | Melee Attack, Near |  | sickened, paralyzed |

### Viskyd

- UUID: `Compendium.vagabond.bestiary.Actor.5Raq5NE9ahzB09RK`
- HD 1 · TL 1.2 · Armor 1 (as Leather) · small · Zone frontline · Morale 12 · Appearing 3d8
- Speed 10 / fly · Senses: Darksight
- Immune: poison, fire
- Weak: cold
- Status Immune: fatigued, berserk, sickened, charmed

**Actions (2)**

| Name | Type | Damage | Note | Recharge | Status |
|---|---|---|---|---|---|
| Pop | castClose | +3 1d6 | Action (Cd4 after having a Being Restrained), Aura Near \| Reflex | Cd4 | — |
| Bite | melee | +2 1d4 | Melee Attack |  | restrained |

**Abilities (3)**

- **Amorphous** — It can enter the space of other Beings and openings as small as 1 inch without squeezing.
- **Magic Ward I** — The first time it is unwillingly affected by a Spell each Round, the Caster must spend an extra 1 Mana to affect it.
- **Sticky** — Hinders attempts to end being Restrained by it. Beings that make physical contact with it must pass [Endure] or be Restrained.

**Findings (2)**

- ❌ `broken-automation`: Compendium text describes a Mana-cost penalty; scripts/npc-abilities.mjs injects a roll-penalty die (1d4) instead.
- ⚠️ `unimplemented-passive`: Ability "Sticky" describes mechanical effects (restrained, must-pass) but has no automation in scripts/npc-abilities.mjs.

### Wolf in Sheep's Clothing

- UUID: `Compendium.vagabond.bestiary.Actor.T2fW1gvdOsDS4D5J`
- HD 9 · TL 2.4 · Armor 1 (as Leather) · medium · Zone frontline · Morale 8 · Appearing 1
- Speed 5
- Weak: fire

**Actions (2)**

| Name | Type | Damage | Note | Recharge | Status |
|---|---|---|---|---|---|
| Bite | melee | +5 2d4 | Melee Attack |  | — |
| Tentacle | melee | +2 1d4 | Melee Attack, Near |  | — |

### Zotz, Demon

- UUID: `Compendium.vagabond.bestiary.Actor.lfHGD4OvbUEXP4wJ`
- HD 14 · TL 9.2 · Armor 4 (as (+1) Plate) · huge · Zone frontline · Morale 11 · Appearing d4
- Speed 20 / fly · Senses: Echolocation
- Immune: physical, poison
- Status Immune: fatigued, frightened

**Actions (4)**

| Name | Type | Damage | Note | Recharge | Status |
|---|---|---|---|---|---|
| Shriek | castRanged | — | Action, Far Aura \| Will | Cd4 | frightened |
| Combo | melee | — |  |  | — |
| (+2) Claw | melee | +9 2d6+2 | Melee Attack |  | — |
| (+2) Bite | melee | +15 3d8+2 | Melee Attack |  | — |

**Abilities (3)**

- **Avatar of Death** — No Being within Near can be revived.
- **Magic Ward II** — The first time it is unwillingly affected by a Spell each Round, the Caster must spend an extra 2 Mana to affect it.
- **Nimble** — Attacks against it can’t be Favored if it can Move.

**Findings (3)**

- ❌ `broken-automation`: Compendium text describes a Mana-cost penalty; scripts/npc-abilities.mjs injects a roll-penalty die (1d6) instead.
- ⚠️ `damageless-requiresDamage`: Zotz, Demon / "Shriek": causedStatus "frightened" has requiresDamage=true but the action deals no damage — status can never apply by that rule.
- ⚠️ `unimplemented-passive`: Ability "Nimble" describes mechanical effects (favored) but has no automation in scripts/npc-abilities.mjs.
