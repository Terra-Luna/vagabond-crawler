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

### How to use

### Settings

### Tips & Gotchas

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
