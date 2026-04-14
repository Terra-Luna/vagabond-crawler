# Vagabond Monster Audit — Index

Generated: 2026-04-14T20:55:00.591Z
Foundry: 13.351 · System: vagabond 5.2.1

- **Monsters**: 348
- **Unique abilities**: 178
- **Unique actions**: 245
- **Total findings**: 426  (3 error, 294 warning, 129 info)

## Packs

| Pack | Source | Count |
|---|---|---|
| Bestiary | vagabond | 297 |
| Humanlike | vagabond | 31 |
| VCE: Modified Beasts | vce | 20 |

## Catalogues

- [abilities.md](abilities.md) — unique abilities grouped by automation status
- [actions.md](actions.md) — unique actions grouped by attack type

## Being Types

| Being Type | Monsters | Detail |
|---|---|---|
| Artificials | 24 | [by-type/Artificials.md](by-type/Artificials.md) |
| Beasts | 92 | [by-type/Beasts.md](by-type/Beasts.md) |
| Cryptid | 98 | [by-type/Cryptid.md](by-type/Cryptid.md) |
| Fae | 15 | [by-type/Fae.md](by-type/Fae.md) |
| Humanlike | 31 | [by-type/Humanlike.md](by-type/Humanlike.md) |
| Outers | 31 | [by-type/Outers.md](by-type/Outers.md) |
| Primordials | 35 | [by-type/Primordials.md](by-type/Primordials.md) |
| Undead | 22 | [by-type/Undead.md](by-type/Undead.md) |

## Findings Breakdown

| Subcategory | Count |
|---|---|
| ability-mentions-status-without-action | 116 |
| broken-automation | 3 |
| damageless-requiresDamage | 69 |
| elemental-name-untyped | 17 |
| extraInfo-status-mismatch | 27 |
| save-mention-orphan | 16 |
| speed-ambiguous | 96 |
| unimplemented-passive | 82 |

## Top Errors

- **broken-automation** — Compendium text describes a Mana-cost penalty; scripts/npc-abilities.mjs injects a roll-penalty die (1d4) instead. (10 monsters)
- **broken-automation** — Compendium text describes a Mana-cost penalty; scripts/npc-abilities.mjs injects a roll-penalty die (1d6) instead. (16 monsters)
- **broken-automation** — Compendium text describes a Mana-cost penalty; scripts/npc-abilities.mjs injects a roll-penalty die (1d8) instead. (9 monsters)
