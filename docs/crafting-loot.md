# Crafting & Loot

Item generation, distribution, and inventory management.

---

## The Forge & Loot Panel

*Orientation: left-click the Forge & Loot button on the Crawl Bar to open the tool picker. Right-click for quick settings.*

- **Relic Forge** — see [Relic Forge](#relic-forge)
- **Scroll Forge** — see [Spell Scroll Forge](#spell-scroll-forge)
- **Loot Manager** — see [Loot Generator](#loot-generator)
- **Session Recap** — see [Session Recap](session-tracking.md#session-recap)
- **Loot Generator** — see [Loot Generator](#loot-generator)

---

## Loot Generator

<!-- gif: docs/assets/loot-generator.gif -->

### What it does

Three cooperating tools that take loot from "I need treasure for room 7" to items in the party's inventory:
- **Loot Generator** — explicit GM roll on the core Vagabond loot tables (Levels 1-10, p.186+) with compendium item creation and per-roll "Give to Player" buttons.
- **Loot Manager** — authoring + assignment window. Build world RollTables, assign them to NPCs (world actor flags or compendium-level config), and tweak drop chances.
- **Loot Drops** (background subsystem) — fires on `deleteCombat`, walks the defeated NPCs, rolls each one's assigned table independently for each player, and spawns labelled loot-bag actors on the canvas.

Loot Generator is a deterministic "I'll decide what's here" tool. Loot Manager + Loot Drops together automate the "combat ends, loot materializes" path.

### How to use

#### Loot Generator

1. Open from the Crawl Bar → **Forge & Loot** → **Loot Generator**, or `game.vagabondCrawler.lootGenerator.open()`.
2. Pick a **level** (1-10). Level 1 uses the weighted p.186 table baked into the module; Levels 2-10 chain through currency, trade goods, art, jewelry, alchemy, armor/weapon enchants, and relics using `LEVEL_FORMULAS` from `scripts/loot-data.mjs`.
3. Click **Roll** — each roll appends a history entry with the resolved roll chain (so you can see *why* you got what you got) plus the resulting compendium item(s).
4. In each history card, **pick a player** from the dropdown and click **Give to Player** to transfer the item into their inventory. A chat card posts to the table; the **Session Recap** loot log picks it up automatically.
5. **Post to chat** drops the roll card into chat for the party without handing out the item yet — useful when you want players to negotiate who gets what.

#### Loot Manager + Loot Drops

1. Open **Forge & Loot** → **Loot Manager**. Filter any NPC source (World, Scene, Bestiary, Humanlike, or module packs) by name/type/TL.
2. For each NPC, pick a RollTable and set a drop chance (0-100). Per-world-actor assignments override compendium-level defaults; compendium-level assignments apply to every future clone of that bestiary entry.
3. Enable **Loot Drops** in settings (off by default). Now when combat ends, every defeated NPC rolls its assigned table against its drop chance. Appearing-based default chance is `1 / (maxAppearing × 2) × 100` — a 2d6 enemy has a ~4% per-corpse drop chance, a unique has 50%.
4. Loot bags appear as actor tokens on the canvas with chest icons. Double-click to open the pickup dialog; players can only see their own share (loot is rolled independently per player).

### Settings

| Setting | Effect | Default |
|---|---|---|
| Loot Drops | Auto-generate loot bags from defeated NPCs at combat end | Off |
| Loot Drop Chance (%) | Default per-NPC drop chance when no override is set | 50 |

Per-NPC table + chance overrides live as actor flags (`vagabond-crawler.lootTable` / `lootDropChance`) or compendium-level in the `compendiumLootConfig` world setting — edited through the Loot Manager UI, not directly.

### Tips & Gotchas

- **Generator vs Manager.** Generator rolls core Vagabond tables *right now* and routes the result to a player. Manager+Drops assigns tables to NPCs for automatic payout at combat end. Use whichever matches your prep style — or both.
- **Compendium items are created with Owner permission** for all players (via `loot-drops.mjs`) so players can pick up without GM relay.
- **"Give to Player" auto-logs to Session Recap.** The loot log entry records the source ("Loot Generator"), recipient, and items; inspect in the Recap window's Loot tab.
- **Relic powers from the Generator auto-apply.** When a roll produces a relic, `_findRelicPower` matches the power text to a `RELIC_POWERS` entry and attaches the relevant Active Effects to the generated item — no manual enchanting step.
- **Loot Drops is opt-in.** Flip the setting on when you're ready. If it's off, defeated NPCs drop nothing regardless of assigned tables.

---

## Relic Forge

<!-- gif: docs/assets/relic-forge.gif -->

### What it does

### How to use

### Settings

### Tips & Gotchas

---

## Spell Scroll Forge

<!-- gif: docs/assets/spell-scroll-forge.gif -->

### What it does

### How to use

### Settings

### Tips & Gotchas

---

## Merchant Shop

<!-- gif: docs/assets/merchant-shop.gif -->

### What it does

### How to use

### Settings

### Tips & Gotchas

---

### Inventory System

<!-- gif: docs/assets/inventory-system.png -->

### Party Inventory

<!-- gif: docs/assets/party-inventory.png -->

### Item Drops

<!-- gif: docs/assets/item-drops.png -->
