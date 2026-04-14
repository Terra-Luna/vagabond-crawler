# Fae — 15 monsters

Generated: 2026-04-14T20:55:00.591Z

| Name | HD | TL | Armor | Zone | Actions | Abilities | Findings |
|---|---|---|---|---|---|---|---|
| Beisht Kione Dhoo | 13 | 6.6 | 3 as Plate | frontline | 3 | 3 | 2 |
| Blink Dog | 4 | 2.1 | 2 as Chain | midline | 1 | 1 | 1 |
| Brollachan | 6 | 2.2 | 4 as Plate plus Shield | frontline | 1 | 3 | 5 |
| Brownie | 1 | 2 | 3 as Plate | backline | 3 | 2 | 0 |
| Carcolh | 15 | 7.1 | 4 as (+1) Plate | frontline | 3 | 2 | 4 |
| Doppelgänger | 4 | 2.6 | 2 as Chain | frontline | 2 | 1 | 0 |
| Hag, Green | 9 | 4 | 3 as (+1) Chain | frontline | 3 | 4 | 5 |
| Hag, Grove | 8 | 9.7 | 4 as (+1) Plate | frontline | 4 | 3 | 4 |
| Hag, Sea | 3 | 3.6 | 2 as (+1) Leather | midline | 2 | 3 | 3 |
| Mermaid | 3 | 2 | 2 as (+1) Leather | backline | 4 | 5 | 2 |
| Nymph | 2 | 0.3 | 0 as Unarmored | frontline | 1 | 2 | 2 |
| Pixie | 1 | 2 | 3 as Plate | backline | 1 | 1 | 0 |
| Satyr | 4 | 2.3 | 2 as Chain | frontline | 4 | 1 | 3 |
| Unicorn | 4 | 4.2 | 3 as (+1) Chain | midline | 5 | 2 | 2 |
| Will o' Wisp | 6 | 3.6 | 4 as (+1) Plate | backline | 2 | 2 | 3 |

---

## Details

### Beisht Kione Dhoo

- UUID: `Compendium.vagabond.bestiary.Actor.64mVh7KUrDrCzHR5`
- HD 13 · TL 6.6 · Armor 3 (as Plate) · huge · Zone frontline · Morale 11 · Appearing 1
- Speed 5 / swim · Senses: Darksight
- Immune: cold
- Weak: coldIron

**Actions (3)**

| Name | Type | Damage | Note | Recharge | Status |
|---|---|---|---|---|---|
| Multi-Attack | melee | +0 |  |  | — |
| Bite | melee | +10 3d6 | Melee Attack |  | restrained |
| Slam | melee | +11 2d10 | Melee Attack |  | prone |

**Abilities (3)**

- **Amphibious** — Breathes air and water.
- **Dreadnought** — Deals double damage to vehicles.
- **Terror III** — Enemies that can see it for the first time and at the start of their Turns must pass a [Will] Save or be Frightened (until they pass this Check on a subsequent Turn, or for Cd8 Rounds afterwards).

**Findings (2)**

- ⚠️ `unimplemented-passive`: Ability "Terror III" describes mechanical effects (frightened, must-pass) but has no automation in scripts/npc-abilities.mjs.
- ⚠️ `ability-mentions-status-without-action`: Ability "Terror III" on Beisht Kione Dhoo mentions Frightened, but no action on this monster applies those statuses.

### Blink Dog

- UUID: `Compendium.vagabond.bestiary.Actor.nUCpW08PbeCZ3wxG`
- HD 4 · TL 2.1 · Armor 2 (as Chain) · medium · Zone midline · Morale 6 · Appearing d6
- Speed 40 / phase
- Weak: coldIron

**Actions (1)**

| Name | Type | Damage | Note | Recharge | Status |
|---|---|---|---|---|---|
| Bite | melee | +3 1d6 | Melee Attack |  | — |

**Abilities (1)**

- **Blink** — It can use its Speed to magically teleport itself anywhere within the used Speed.

**Findings (1)**

- ℹ️ `speed-ambiguous`: Blink Dog: speedTypes entry "phase" has no speed and speedValues.phase is 0. Implicit base speed? Intent unclear.

### Brollachan

- UUID: `Compendium.vagabond.bestiary.Actor.kcqeeuQ2oDfyKaak`
- HD 6 · TL 2.2 · Armor 4 (as Plate plus Shield) · large · Zone frontline · Morale 10 · Appearing 1
- Speed 20 / fly
- Weak: coldIron
- Status Immune: berserk, frightened, confused, prone, blinded, charmed

**Actions (1)**

| Name | Type | Damage | Note | Recharge | Status |
|---|---|---|---|---|---|
| Tendril | melee | +9 2d8 | Melee Attack, Near |  | — |

**Abilities (3)**

- **Engulfer** — Other Beings in its space are Burning (2d6).
- **Formless** — It can Move into space occupied by Beings.
- **Maddening I** — Enemies that can hear it for the first time and at the start of their Turns must pass a [Will] Save or be Confused (until they pass this Check on a subsequent Turn, or for Cd4 Rounds afterwards).

**Findings (5)**

- ℹ️ `speed-ambiguous`: Brollachan: speedTypes entry "fly" has no speed and speedValues.fly is 0. Implicit base speed? Intent unclear.
- ⚠️ `unimplemented-passive`: Ability "Engulfer" describes mechanical effects (burning) but has no automation in scripts/npc-abilities.mjs.
- ⚠️ `unimplemented-passive`: Ability "Maddening I" describes mechanical effects (confused, must-pass) but has no automation in scripts/npc-abilities.mjs.
- ⚠️ `ability-mentions-status-without-action`: Ability "Engulfer" on Brollachan mentions Burning, but no action on this monster applies those statuses.
- ⚠️ `ability-mentions-status-without-action`: Ability "Maddening I" on Brollachan mentions Confused, but no action on this monster applies those statuses.

### Brownie

- UUID: `Compendium.vagabond.bestiary.Actor.OQZbfC2OXrLYLRM8`
- HD 1 · TL 2 · Armor 3 (as Plate) · small · Zone backline · Morale 7 · Appearing 2d6+1
- Speed 40
- Weak: coldIron

**Actions (3)**

| Name | Type | Damage | Note | Recharge | Status |
|---|---|---|---|---|---|
| Dagger | melee | +2 1d4 | Melee Attack |  | — |
| Dancing Lights | castRanged | +0 | Cast, Remote |  | — |
| Dimension Door | castClose | +0 | Cast, Self | 1/Day | — |

**Abilities (2)**

- **Ambush Innured** — It can't be surprised, and can take an Action and Move before the first Turn of Combat.
- **Magic Ward I** — The first time it is unwillingly affected by a Spell each Round, the Caster must spend an extra 1 Mana to affect it.

### Carcolh

- UUID: `Compendium.vagabond.bestiary.Actor.uDjwEv1gpStc0WzJ`
- HD 15 · TL 7.1 · Armor 4 (as (+1) Plate) · huge · Zone frontline · Morale 11 · Appearing 1
- Speed 20 / climb, cling · Senses: Seismicsense
- Weak: coldIron

**Actions (3)**

| Name | Type | Damage | Note | Recharge | Status |
|---|---|---|---|---|---|
| Combo | melee | — |  |  | — |
| Bite | melee | +16 3d10 | Melee Attack |  | burning |
| Tentacle | melee | +0 | Grapple, Near |  | restrained |

**Abilities (2)**

- **Magic Ward II** — The first time it is unwillingly affected by a Spell each Round, the Caster must spend an extra 2 Mana to affect it.
- **Tentacles** — Starts with 6 Tentacles. Targetting a Tentacle causes a -4 penalty to the Attack Check, but severs it if at least 16 damage is dealt with the attack.

**Findings (4)**

- ⚠️ `damageless-requiresDamage`: Carcolh / "Tentacle": causedStatus "restrained" has requiresDamage=true but the action deals no damage — status can never apply by that rule.
- ℹ️ `speed-ambiguous`: Carcolh: speedTypes entry "climb" has no speed and speedValues.climb is 0. Implicit base speed? Intent unclear.
- ℹ️ `speed-ambiguous`: Carcolh: speedTypes entry "cling" has no speed and speedValues.cling is 0. Implicit base speed? Intent unclear.
- ⚠️ `unimplemented-passive`: Ability "Tentacles" describes mechanical effects (—) but has no automation in scripts/npc-abilities.mjs.

### Doppelgänger

- UUID: `Compendium.vagabond.bestiary.Actor.XaZlVpSeim63R5a4`
- HD 4 · TL 2.6 · Armor 2 (as Chain) · medium · Zone frontline · Morale 10 · Appearing d6
- Speed 30
- Weak: coldIron
- Status Immune: charmed, unconscious

**Actions (2)**

| Name | Type | Damage | Note | Recharge | Status |
|---|---|---|---|---|---|
| Shapechange | castClose | +0 | Cast, Self (Focus) | 1/Minute | — |
| Bite | melee | +6 1d12 | Melee Attack |  | — |

**Abilities (1)**

- **Doppelgang** — Enemy Abilities treat this Being as an Ally while they are convinced it is an Ally.

### Hag, Green

- UUID: `Compendium.vagabond.bestiary.Actor.ZXpSxKZH1Zj3fBcP`
- HD 9 · TL 4 · Armor 3 (as (+1) Chain) · medium · Zone frontline · Morale 4 · Appearing 1
- Speed 30 · Senses: Allsight, Darksight
- Weak: coldIron

**Actions (3)**

| Name | Type | Damage | Note | Recharge | Status |
|---|---|---|---|---|---|
| Combo | melee | — |  |  | — |
| Claw | melee | +4 1d8 | Melee Attack |  | — |
| Shapeshift | castClose | +0 | Cast, Self (Focus) |  | — |

**Abilities (4)**

- **Amphibious** — It can breathe air and water.
- **Fade Out** — When it Moves, it turns itself and anything it is carrying Invisible for the duration (Focus). If it has a Being Restrained, it turns them Invisible for the duration as well.
- **Magic Ward II** — The first time it is unwillingly affected by a Spell each Round, the Caster must spend an extra 2 Mana to affect it.
- **Terror I** — Enemies that can see it for the first time and at the start of their Turns must pass [Will] or be Frightened (Cd4).

**Findings (5)**

- ⚠️ `extraInfo-status-mismatch`: Hag, Green / "Claw": extraInfo mentions Restrained but causedStatuses does not include these ids.
- ⚠️ `unimplemented-passive`: Ability "Fade Out" describes mechanical effects (invisible, restrained) but has no automation in scripts/npc-abilities.mjs.
- ⚠️ `unimplemented-passive`: Ability "Terror I" describes mechanical effects (frightened, must-pass) but has no automation in scripts/npc-abilities.mjs.
- ⚠️ `ability-mentions-status-without-action`: Ability "Fade Out" on Hag, Green mentions Invisible, Restrained, but no action on this monster applies those statuses.
- ⚠️ `ability-mentions-status-without-action`: Ability "Terror I" on Hag, Green mentions Frightened, but no action on this monster applies those statuses.

### Hag, Grove

- UUID: `Compendium.vagabond.bestiary.Actor.DIXBdymeCr9HUJOd`
- HD 8 · TL 9.7 · Armor 4 (as (+1) Plate) · medium · Zone frontline · Morale 10 · Appearing 1
- Speed 50 / cling · Senses: Allsight, Darksight
- Weak: coldIron

**Actions (4)**

| Name | Type | Damage | Note | Recharge | Status |
|---|---|---|---|---|---|
| Combo | melee | +0 |  |  | — |
| Bite | melee | +7 1d8+3 | Melee Attack |  | — |
| Claw | melee | +7 1d8+3 | Melee Attack |  | — |
| Shapeshift | castClose | +0 | Cast, Self (Focus) |  | — |

**Abilities (3)**

- **Blair Omniscience** — It is always aware of any Beings within the woodland it claims as its domain.
- **Magic Ward I** — The first time it is unwillingly affected by a Spell each Round, the Caster must spend an extra 1 Mana to affect it.
- **Terror I** — Enemies that can see it for the first time and at the start of their Turns must pass a [Will] Save or be Frightened until they pass this Check on a subsequent Turn, or for Cd4 Rounds afterwards.

**Findings (4)**

- ⚠️ `extraInfo-status-mismatch`: Hag, Grove / "Combo": extraInfo mentions Restrained but causedStatuses does not include these ids.
- ℹ️ `speed-ambiguous`: Hag, Grove: speedTypes entry "cling" has no speed and speedValues.cling is 0. Implicit base speed? Intent unclear.
- ⚠️ `unimplemented-passive`: Ability "Terror I" describes mechanical effects (frightened, must-pass) but has no automation in scripts/npc-abilities.mjs.
- ⚠️ `ability-mentions-status-without-action`: Ability "Terror I" on Hag, Grove mentions Frightened, but no action on this monster applies those statuses.

### Hag, Sea

- UUID: `Compendium.vagabond.bestiary.Actor.oDROHzNC8xZ4HY5m`
- HD 3 · TL 3.6 · Armor 2 (as (+1) Leather) · medium · Zone midline · Morale 4 · Appearing d4
- Speed 30 / swim
- Weak: shock

**Actions (2)**

| Name | Type | Damage | Note | Recharge | Status |
|---|---|---|---|---|---|
| Death Glare | castRanged | +13 3d8 | Cast, Sight (a Frightened Being) \| Will | 3/Day | — |
| Claw | melee | +3 1d6 | Melee Attack |  | — |

**Abilities (3)**

- **Amphibious** — It can breathe air and water.
- **Magic Ward I** — The first time it is unwillingly affected by a Spell each Round, the Caster must spend an extra 1 Mana to affect it.
- **Terror I** — Enemies that can see it for the first time and at the start of their Turns must pass a [Will] Save or be Frightened until they pass this Check on a subsequent Turn, or for Cd4 Rounds afterwards.

**Findings (3)**

- ℹ️ `speed-ambiguous`: Hag, Sea: speedTypes entry "swim" has no speed and speedValues.swim is 0. Implicit base speed? Intent unclear.
- ⚠️ `unimplemented-passive`: Ability "Terror I" describes mechanical effects (frightened, must-pass) but has no automation in scripts/npc-abilities.mjs.
- ⚠️ `ability-mentions-status-without-action`: Ability "Terror I" on Hag, Sea mentions Frightened, but no action on this monster applies those statuses.

### Mermaid

- UUID: `Compendium.vagabond.bestiary.Actor.jO00LGH0j3HNTGve`
- HD 3 · TL 2 · Armor 2 (as (+1) Leather) · medium · Zone backline · Morale 2 · Appearing 1
- Speed 10 / swim
- Immune: shock, cold
- Weak: coldIron

**Actions (4)**

| Name | Type | Damage | Note | Recharge | Status |
|---|---|---|---|---|---|
| Call Terror | castRanged | +0 | Cast | 1/Day | — |
| Enchanting Song | castRanged | +0 | Cast (Focus) |  | — |
| Trident | melee | +3 1d6 | Melee Attack |  | — |
| Storm Bringer | castRanged | +0 | Cast | 1/Day | — |

**Abilities (5)**

- **Amphibious** — Breathes air and water.
- **Magic Ward I** — The first time it is unwillingly affected by a Spell each Round, the Caster must spend an extra 1 Mana to affect it.
- **Enchanting Song** — Enemies that can hear it for the first time and at the start of their Turns must pass [Will] or be Charmed (Cd4). While Charmed this way, they can only Move directly toward this Being.
- **Immortal of the Sea** — It can’t be reduced below 1 HP while it is even partially submerged in a body of water.
- **Terror-Bound** — It is bound to a terror of the sea, such as a beisht kione dhoo, kraken, or sea serpent.

**Findings (2)**

- ⚠️ `unimplemented-passive`: Ability "Enchanting Song" describes mechanical effects (charmed, must-pass) but has no automation in scripts/npc-abilities.mjs.
- ⚠️ `ability-mentions-status-without-action`: Ability "Enchanting Song" on Mermaid mentions Charmed, but no action on this monster applies those statuses.

### Nymph

- UUID: `Compendium.vagabond.bestiary.Actor.wZ1lpFv59kCH9Pxj`
- HD 2 · TL 0.3 · Armor 0 (as Unarmored) · medium · Zone frontline · Morale 4 · Appearing d4
- Speed 30 / swim
- Weak: coldIron

**Actions (1)**

| Name | Type | Damage | Note | Recharge | Status |
|---|---|---|---|---|---|
| Nymph’s Kiss | castClose | +0 | Cast, Touch \| Will |  | — |

**Abilities (2)**

- **Amphibious** — Can breathe air or water.
- **Magic Ward I** — The first time it is unwillingly affected by a Spell each Round, the Caster must spend an extra 1 Mana to affect it.

**Findings (2)**

- ⚠️ `extraInfo-status-mismatch`: Nymph / "Nymph’s Kiss": extraInfo mentions Suffocating but causedStatuses does not include these ids.
- ℹ️ `save-mention-orphan`: Nymph / "Nymph’s Kiss": note mentions save type(s) will but action has no causedStatuses and no damage.

### Pixie

- UUID: `Compendium.vagabond.bestiary.Actor.uCCieRHVkOBlo0hS`
- HD 1 · TL 2 · Armor 3 (as Plate) · small · Zone backline · Morale 7 · Appearing 2d4
- Speed 30 / fly 60 · Senses: Telepathy (Near)
- Weak: coldIron

**Actions (1)**

| Name | Type | Damage | Note | Recharge | Status |
|---|---|---|---|---|---|
| Dagger | melee | +2 1d4 | Melee Attack |  | — |

**Abilities (1)**

- **** — The first time it is unwillingly affected by a Spell each Round, the Caster must spend an extra 1 Mana to affect it.

### Satyr

- UUID: `Compendium.vagabond.bestiary.Actor.vEW7TmLM86ZiFWRX`
- HD 4 · TL 2.3 · Armor 2 (as Chain) · medium · Zone frontline · Morale 9 · Appearing 2d4
- Speed 35
- Weak: coldIron

**Actions (4)**

| Name | Type | Damage | Note | Recharge | Status |
|---|---|---|---|---|---|
| Sleep | castRanged | — | Cast, Beings who hear it | 1/Day | unconscious |
| Charm | castRanged | +0 | Cast, Beings who hear it \| Will | 1/Day | charmed |
| Horns | melee | +5 2d4 | Melee Attack |  | — |
| Fear | castRanged | +0 | Cast, Beings who hear it \| Will | 1/Day | frightened |

**Abilities (1)**

- **** — The first time it is unwillingly affected by a Spell each Round, the Caster must spend an extra 1 Mana to affect it.

**Findings (3)**

- ⚠️ `damageless-requiresDamage`: Satyr / "Charm": causedStatus "charmed" has requiresDamage=true but the action deals no damage — status can never apply by that rule.
- ⚠️ `damageless-requiresDamage`: Satyr / "Fear": causedStatus "frightened" has requiresDamage=true but the action deals no damage — status can never apply by that rule.
- ⚠️ `damageless-requiresDamage`: Satyr / "Sleep": causedStatus "unconscious" has requiresDamage=true but the action deals no damage — status can never apply by that rule.

### Unicorn

- UUID: `Compendium.vagabond.bestiary.Actor.hPna41WWprqcqawU`
- HD 4 · TL 4.2 · Armor 3 (as (+1) Chain) · large · Zone midline · Morale 7 · Appearing 1
- Speed 80 · Senses: Allsight, Telepathy (Far)
- Weak: coldIron
- Status Immune: confused, frightened, charmed

**Actions (5)**

| Name | Type | Damage | Note | Recharge | Status |
|---|---|---|---|---|---|
| Heal | castClose | +0 | Cast, Touch | 1/Day | — |
| Combo | melee | +0 |  |  | — |
| Hoof | melee | +4 1d8 | Melee Attack |  | — |
| Horn | melee | +4 1d8 | Melee Attack |  | — |
| Teleport | castClose | +0 | Cast | 1/Day | — |

**Abilities (2)**

- **Magic Ward III** — The first time it is unwillingly affected by a Spell each Round, the Caster must spend an extra 3 Mana to affect it.
- **Regenerate I** — Regains 4 (d8) HP on each of its Turns.

**Findings (2)**

- ⚠️ `extraInfo-status-mismatch`: Unicorn / "Heal": extraInfo mentions Blinded, Confused, Paralyzed, Sickened but causedStatuses does not include these ids.
- ⚠️ `unimplemented-passive`: Ability "Regenerate I" describes mechanical effects (regains-hp) but has no automation in scripts/npc-abilities.mjs.

### Will o' Wisp

- UUID: `Compendium.vagabond.bestiary.Actor.CmGogAAhZOFHHJeG`
- HD 6 · TL 3.6 · Armor 4 (as (+1) Plate) · small · Zone backline · Morale 11 · Appearing d6
- Speed 0 / fly, phase · Senses: Darksight
- Immune: physical
- Weak: coldIron
- Status Immune: fatigued, prone, charmed, sickened, paralyzed

**Actions (2)**

| Name | Type | Damage | Note | Recharge | Status |
|---|---|---|---|---|---|
| Life Zap | castClose | +5 1d10 | Cast, Touch \| Endure |  | — |
| Dissipate | castClose | — | Cast, Self (Focus) |  | — |

**Abilities (2)**

- **Wyrd Ward** — Cast Checks Targeting it are Hindered, as are attacks made with Magically-enhanced Weapons.
- **Illuminating** — Sheds Light out to 30 feet.

**Findings (3)**

- ⚠️ `extraInfo-status-mismatch`: Will o' Wisp / "Dissipate": extraInfo mentions Invisible but causedStatuses does not include these ids.
- ℹ️ `speed-ambiguous`: Will o' Wisp: speedTypes entry "phase" has no speed and speedValues.phase is 0. Implicit base speed? Intent unclear.
- ⚠️ `unimplemented-passive`: Ability "Wyrd Ward" describes mechanical effects (hindered) but has no automation in scripts/npc-abilities.mjs.
