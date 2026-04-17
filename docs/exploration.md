# Exploration

Crawl-phase tools: random encounters, monster creation, lighting, traps.

---

## Encounter System

<!-- gif: docs/assets/encounter-roller.gif -->

### What it does

Two tools that feed each other: the **Encounter Check** is a d6 roll against a configurable threshold, triggered by the GM from the Crawl Bar; the **Encounter Roller** is a four-tab authoring window for building, browsing, rolling, and creating encounters.

When an encounter check hits, the roller auto-opens and pre-rolls whatever table is currently marked active — the GM sees a result card in one click, not five. When it misses, the roll is posted to chat ("No Encounter — the dungeon is quiet…") and the crawl continues. Result cards show enemy **count** (rolled from each slot's "appearing" formula), **distance** (Close / Near / Far), and **reaction** (Violent → Friendly on a 2d6), each with its own re-roll button so you can spin any facet without re-rolling the others. Post to chat for player visibility or place tokens directly onto the scene.

### How to use

1. **Check.** Click **Encounter Check** on the Crawl Bar — rolls a d6 against the threshold. Right-click the bar button to set the threshold (1-in-6 through 5-in-6) or clear the active table. On a hit, the roller opens automatically and rolls the table.
2. **Build Table.** Pick a die formula (d4, d6, 2d6, d8…), name the table, then drag NPC actors from a compendium, world, or the Browse NPCs tab onto the numbered slots. Set "appearing" per slot (e.g. `1d4`). Save as a world RollTable, post to chat, or place tokens directly.
3. **Browse NPCs.** Filter a source (World, Scene, Bestiary, Humanlike, or any module pack) by name, creature type, and tech-level range. Sort by any column. Click **+** on a row to add the NPC to the next empty slot on the Build Table tab.
4. **Roll Tables.** Pick any world RollTable (grouped by folder — excluded folders are hidden) and roll it. Any existing table works, not just ones authored here. Use **Set as Active** to wire a table to the Encounter Check so hits auto-roll it.
5. **Monster Creator.** Opens the [Monster Creator](#monster-creator) panel inline. Build or mutate an NPC on-the-fly during an encounter, then return to Browse or Build to drop the new actor into a slot.

Each result card has separate **reroll count / distance / reaction** buttons and **Post to Chat / Place Tokens** actions. Placed tokens use the active scene; morale checks fire independently through the [Morale Check](combat.md#morale-check) subsystem once the encounter enters combat.

### Settings

| Setting | Effect | Default |
|---|---|---|
| Encounter Roll: GM Only | Whisper check results to the GM instead of broadcasting | On |
| Default Encounter Threshold | N-in-6 chance on check (right-click the bar button to set) | 1 |
| Active Encounter Table | Table UUID auto-rolled on hit (set via "Set as Active" in the roller) | — |
| Excluded Table Folders | Folder IDs hidden from the Roll Tables tab (manage-folders button in the roller) | none |

### Tips & Gotchas

- **Browse NPCs reads any compendium pack.** Both the core `vagabond.bestiary` and `vagabond.humanlike` are wired in; `vagabond-character-enhancer.vce-beasts` appears automatically when VCE is installed. Your own module packs can be added via the source dropdown.
- **Filter state persists across tab switches** — swapping to Build and back keeps your search, type, and TL filters intact.
- **"Set as Active"** is the bridge between the Check and the Roller — without an active table, the Check just reports hit/miss and waits for you to pick something manually.
- For monster variants created inline, see [Monster Creator](#monster-creator) — mutations recalculate HP and DPR, and saved NPCs live as world actors (the source compendium is never modified).

---

## Monster Creator

<!-- gif: docs/assets/monster-creator.gif -->

### What it does

A dedicated ApplicationV2 window for authoring NPC actors from scratch or by pre-filling from a bestiary monster. Ten collapsible sections cover the full NPC sheet — Bestiary loader, Identity, Stats, Damage Immunities, Weaknesses, Status Immunities, Actions, Abilities, Mutations, and Description — with live HP and Threat-Level recalculation as you edit. Saved NPCs land as world actors; the source compendium is never modified.

The creator absorbs what used to be a standalone **Monster Mutator**. Apply one or more of 64 mutations with stat recalculation and auto-generated naming ("Ember Plaguewyrm"), or hand-edit every field. Action and Ability **Quick Picks** come from curated catalogs (`scripts/monster-creator/action-templates.mjs` / `ability-templates.mjs`) — drop in "Claws 2d6 piercing" or "Magic Ward II" in one click. Abilities with a green ✓ badge are live-automated by the module; ⚠ means the Quick Pick is not yet automated; 📖 marks flavor-only abilities that exist for GM reference.

### How to use

1. **Open.** Encounter Roller → Monster Creator tab, or call `game.vagabondCrawler.monsterCreator.open()`. The panel mounts inline in the roller window, so you can hop between Build Table and Creator without losing state.
2. **Load from Bestiary (optional).** Pick a source (Bestiary, Humanlike, VCE Beasts, your own packs), filter by name / creature type / TL, and click a row to pre-fill every Creator section with that monster's data. Portrait, token image, senses (parsed into Foundry sight modes), speed modes, actions, and abilities all come across.
3. **Fill Identity.** Name, size, being type, zone (frontline / midline / backline), HD, morale, appearing, speed, senses, armor, portrait, and token images.
4. **Tune Stats.** Base stats (might / dexterity / awareness / reason / presence / luck) feed the live HP and TL preview. Crank a stat up and watch HP + DPR shift in real time.
5. **Set Immunities & Weaknesses.** Damage immunities, weaknesses (including `coldIron` and `silver`), and status immunities are checkbox lists pulled from the canonical Vagabond vocabulary.
6. **Build Actions.** Use a Quick Pick (Claws, Bite, Bow Shot, Venom Spit, etc.) or author from scratch — name, damage formula, damage type, range, status rider, countdown, drain, target count. Quick Picks live-update the action list.
7. **Build Abilities.** Quick Picks cover the whole [NPC Abilities](combat.md#npc-abilities) catalog: Magic Ward I-VI, Pack Instincts / Tactics / Hunter, Nimble, Soft Underbelly, and narrative options like Regeneration or Flight. The automation badge tells you at a glance whether picking this ability actually *does* anything at the table.
8. **Apply Mutations.** The Mutations section picks from 64 mutation templates — each applies stat deltas, new actions, new abilities, and name fragments (Elder, Blighted, Corrupted…). Conflicts between mutations are detected automatically. Full boon/bane lists are in [`docs/audit/abilities.md`](audit/abilities.md).
9. **Save.** One click creates a new world NPC actor with the full Vagabond `npc` system shape. The sheet opens immediately; drop the actor into the scene or onto a Build Table slot.

### Settings

No user-facing settings — the Creator uses per-session UI state for open/closed sections (restored on re-render) and the audit dataset in `docs/audit/` for ability automation status. The ability automation status is updated each time `scripts/audit/analyze.mjs` is re-run against the compendium.

### Tips & Gotchas

- **Green ✓ means automated.** Passing an ability through Quick Pick doesn't guarantee automation — check the badge. ✓ = `scripts/npc-abilities.mjs` actively hooks that ability name; ⚠ = planned but not wired; 📖 = flavor only.
- **Saving never modifies the compendium.** The creator explicitly creates a *new* world actor. If you want to update a bestiary entry, do it in the compendium directly.
- **Mutations recalculate HP and DPR** — mutated stat boosts flow through `calculateHP` / `calculateDPR` from `scripts/monster-mutator.mjs`, and mutated names are generated via `generateMutatedName` so "Elder Orc Warlord" is one click.
- **Senses parse automatically.** Loading from a monster whose senses text says "Darksight 60'" sets the token's Darkvision to 60 ft. Edit the senses field and re-save to tweak.
- For a full dashboard of which abilities are implemented across all 348 bestiary monsters, see [`docs/audit/abilities.md`](audit/abilities.md) — that's the ground truth for automation coverage.

---

## Light Tracker

<!-- gif: docs/assets/light-tracker.gif -->

### What it does

### How to use

### Settings

### Tips & Gotchas

---

### Trap Builder

<!-- gif: docs/assets/trap-builder.png -->
