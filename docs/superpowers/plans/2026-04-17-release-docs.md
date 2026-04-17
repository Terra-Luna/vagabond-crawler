# Release Documentation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers-extended-cc:subagent-driven-development (recommended) or superpowers-extended-cc:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produce release-ready GM-facing documentation at the top level of `docs/`, migrate existing technical references to `docs/dev/`, and convert the README into a short landing page. Headliner-first execution — 10 flagship features get full feature-section treatment, ~13 secondary features get compact stubs.

**Architecture:** Dual-track on-disk structure. GM guide lives at top-level `docs/*.md`. Contributor reference moves into `docs/dev/*.md`. No build step, no SSG, no hosting — plain markdown rendered by GitHub. Each feature section follows a fixed template (summary → gif slot → What it does → How to use → Settings → Tips).

**Tech Stack:** GitHub Flavored Markdown. No tooling.

**Spec:** `docs/superpowers/specs/2026-04-17-release-docs-design.md`

**Conventions for every task:**
- Commits follow Conventional Commits: `docs: <imperative description>`.
- Gif slots are left as an HTML comment: `<!-- gif: docs/assets/<feature-name>.gif -->`. Sub-project 2 replaces these.
- Relative links between guide files use bare filenames: `[Combat](combat.md)`.
- Verify steps use Grep/Glob (not raw bash `grep`/`find`).
- No placeholders in final content. If a headliner's prose isn't ready, the task isn't done.

---

### Task 1: Phase 1 Scaffolding — restructure `docs/`, create skeletons, trim README

**Goal:** Everything moves to its final location. All five new guide files exist as empty skeletons with headers in place. The README is trimmed to a landing-page shell with placeholder markers for headline features. Stale alchemy content is removed. Ready for content to be poured into the skeletons in later tasks.

**Files:**
- Create: `docs/crawl-loop.md`
- Create: `docs/combat.md`
- Create: `docs/exploration.md`
- Create: `docs/crafting-loot.md`
- Create: `docs/session-tracking.md`
- Create: `docs/dev/` (directory)
- Move: `docs/crawl-system.md` → `docs/dev/crawl-system.md`
- Move: `docs/combat-tools.md` → `docs/dev/combat-tools.md`
- Move: `docs/exploration-tools.md` → `docs/dev/exploration-tools.md`
- Move: `docs/utilities.md` → `docs/dev/utilities.md`
- Modify: `docs/dev/utilities.md` (remove `alchemistCookbook` settings row after move)
- Delete: `docs/alchemist-cookbook.md`
- Modify: `README.md` (rewrite as landing page shell)

**Acceptance Criteria:**
- [ ] `docs/dev/` exists and contains the 4 moved reference files
- [ ] `docs/alchemist-cookbook.md` no longer exists
- [ ] `docs/dev/utilities.md` contains no reference to `alchemistCookbook`
- [ ] Five new guide skeleton files exist at the top level of `docs/`
- [ ] Each guide skeleton contains its full header structure (all `##` and `###` sections specified in the spec) with `<!-- gif: ... -->` placeholders but no prose content yet
- [ ] README trimmed to ~80 lines shell (title, badges, one-para pitch, placeholder for hero gifs, placeholder for headline features grid, requirements, install, links block, footer)
- [ ] All moved files still render on GitHub (no broken markdown)
- [ ] Existing cross-links in the README pointing to old `docs/*.md` locations are updated

**Verify:**
- Glob `docs/dev/*.md` → returns 4 files
- Glob `docs/*.md` → returns 6 files (5 new guides + player-quickref.md)
- Grep `alchemistCookbook` in `docs/` → 0 matches (excluding audit/superpowers)
- Glob `docs/alchemist-cookbook.md` → 0 matches
- `wc -l README.md` → roughly 80-120 lines
- Grep `^## ` in each new guide file → matches the expected headliner count from the spec

**Steps:**

- [ ] **Step 1: Move the 4 existing reference files into `docs/dev/`**

```bash
mkdir -p docs/dev
git mv docs/crawl-system.md docs/dev/crawl-system.md
git mv docs/combat-tools.md docs/dev/combat-tools.md
git mv docs/exploration-tools.md docs/dev/exploration-tools.md
git mv docs/utilities.md docs/dev/utilities.md
```

- [ ] **Step 2: Delete stale alchemist content**

```bash
git rm docs/alchemist-cookbook.md
```

- [ ] **Step 3: Remove the stale `alchemistCookbook` row from the moved `docs/dev/utilities.md` settings table**

Use Read to locate the line, then Edit. Row format is:
```
| `alchemistCookbook` | world | visible | Boolean | `true` | Alchemist crafting system |
```
Delete exactly that line. No other changes to the file.

- [ ] **Step 4: Create `docs/crawl-loop.md` skeleton**

```markdown
# Crawl Loop

The turn-to-turn core of Vagabond Crawler — phase tracking, movement, combat, rest.

---

## The Crawl Bar

*Orientation: the bottom bar is the GM control surface. Each button takes you to a feature in one of these guides.*

- **Start / End Crawl** — begin or end a crawl session
- **Next Turn** — advance the phase (Heroes → GM → Heroes)
- **Add Tokens** — add selected tokens to the tracker
- **Time Passes** — advance in-world time
- **Encounter Check / Roller** — see [Encounter System](exploration.md#encounter-system)
- **Light Tracker** — see [Light Tracker](exploration.md#light-tracker)
- **Combat** — add heroes and NPCs to the combat tracker
- **Rest / Breather** — see [Rest & Breather](#rest--breather)
- **Forge & Loot** — see [Crafting & Loot](crafting-loot.md)

---

## Crawl Strip

<!-- gif: docs/assets/crawl-strip.gif -->

### What it does

### How to use

### Settings

### Tips & Gotchas

#### Movement Tracker

#### Rollback Movement

#### Combat Dropdown

#### HP + Stats Quick Reference

---

### Crawl Clock

<!-- gif: docs/assets/crawl-clock.png -->

### Rest & Breather

<!-- gif: docs/assets/rest-breather.png -->
```

- [ ] **Step 5: Create `docs/combat.md` skeleton**

```markdown
# NPC Combat Automation

> *This guide covers the NPC-side combat automation handled by Vagabond Crawler: NPC abilities, flanking, countdown dice, morale, animation FX. Player-side combat (class resources, character action menus, etc.) is handled by the Character Enhancer module — see its docs.*

---

## NPC Abilities

<!-- gif: docs/assets/npc-abilities.png -->

### What it does

### How to use

### Settings

### Tips & Gotchas

---

### Flanking Checker

<!-- gif: docs/assets/flanking.png -->

### Countdown Dice Auto-Roller

<!-- gif: docs/assets/countdown-dice.png -->

### Morale Check

<!-- gif: docs/assets/morale.png -->

### Animation FX

<!-- gif: docs/assets/animation-fx.png -->

### Chat Dice Tooltips
```

- [ ] **Step 6: Create `docs/exploration.md` skeleton**

```markdown
# Exploration

Crawl-phase tools: random encounters, monster creation, lighting, traps.

---

## Encounter System

<!-- gif: docs/assets/encounter-roller.gif -->

### What it does

### How to use

### Settings

### Tips & Gotchas

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
```

- [ ] **Step 7: Create `docs/crafting-loot.md` skeleton**

```markdown
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

### How to use

### Settings

### Tips & Gotchas

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
```

- [ ] **Step 8: Create `docs/session-tracking.md` skeleton**

```markdown
# Session Tracking

Cross-session data: combat stats, loot, XP awards.

---

## Session Recap

<!-- gif: docs/assets/session-recap.gif -->

### What it does

### How to use

### Settings

### Tips & Gotchas

---

### XP Counter Patch

<!-- gif: docs/assets/xp-counter.png -->
```

- [ ] **Step 9: Rewrite README as landing page shell**

Replace the entire README content with the shell below. Feature content comes in Task 18.

```markdown
# Vagabond Crawler

![Foundry v13](https://img.shields.io/badge/foundry-v13-green?style=for-the-badge)
![System](https://img.shields.io/badge/system-vagabond-blue?style=for-the-badge)
![Version](https://img.shields.io/badge/version-1.10.0-orange?style=for-the-badge)

A comprehensive dungeon crawl management module for the **Vagabond RPG** system in Foundry VTT. Everything you need to run a crawl — turn tracking, movement enforcement, random encounters, light management, morale, combat automation, crafting, loot, and more — from a unified interface.

---

<!-- hero-gifs-grid: sub-project 2 fills this block with 3-4 hero gifs -->

---

## Headline Features

<!-- headline-features-grid: Task 18 fills this block -->

---

## Requirements

- **Foundry VTT** v13+
- **Vagabond** system v4.1.0+

### Optional
- **vagabond-character-enhancer** — Class feature automation, alchemy
- **Sequencer + JB2A** — Visual effects for spells, traps, and attacks

### Recommended
- **Damage Log** — Enables damage and kill tracking in Session Recap

---

## Installation

Paste the following manifest URL into Foundry's module installer:

```
https://github.com/DimitroffVodka/vagabond-crawler/releases/latest/download/module.json
```

---

## Documentation

- [Crawl Loop](docs/crawl-loop.md) — Crawl Strip, Movement, Clock, Rest
- [NPC Combat Automation](docs/combat.md) — Abilities, flanking, morale, countdown
- [Exploration](docs/exploration.md) — Encounters, Monster Creator, Light
- [Crafting & Loot](docs/crafting-loot.md) — Relic/Scroll Forge, Loot Generator, Merchant
- [Session Tracking](docs/session-tracking.md) — Recap, XP
- [Player Quick Reference](docs/player-quickref.md)
- [Contributor Reference](docs/dev/) — architecture and internals

---

## Authors

- **DimitroffVodka**

---

*This module is an independent community project for the Vagabond RPG system and is not affiliated with Land of the Blind, LLC.*
```

- [ ] **Step 10: Verify with Grep and Glob**

Run these checks:
- Glob `docs/dev/*.md` → expect 4 files
- Glob `docs/*.md` → expect 6 files (5 new guides + player-quickref.md)
- Grep `alchemistCookbook` path `docs/dev/` → expect 0 matches
- Glob `docs/alchemist-cookbook.md` → expect 0 matches
- Grep `^## ` path `docs/crawl-loop.md` → expect "Crawl Strip" (1 headliner) + "The Crawl Bar"
- Grep `^## ` path `docs/combat.md` → expect "NPC Abilities" (1 headliner)
- Grep `^## ` path `docs/exploration.md` → expect 3 headliners (Encounter, Monster Creator, Light)
- Grep `^## ` path `docs/crafting-loot.md` → expect 4 headliners (Loot Generator, Relic, Spell Scroll, Merchant) + "Forge & Loot Panel"
- Grep `^## ` path `docs/session-tracking.md` → expect 1 headliner (Session Recap)

- [ ] **Step 11: Commit**

```bash
git add docs/ README.md
git commit -m "docs: restructure for release — dual-track GM guide + dev reference"
```

---

### Task 2: Write Crawl Strip headliner (composite)

**Goal:** Fill the Crawl Strip headliner section in `docs/crawl-loop.md` with complete prose covering the Strip UI, Movement Tracker subsection (with Rollback folded in), Combat Dropdown, and HP+stats quick reference.

**Files:**
- Modify: `docs/crawl-loop.md` (Crawl Strip `##` section)

**Acceptance Criteria:**
- [ ] Section follows the feature-section template: summary line → gif placeholder → What it does → How to use → Settings → Tips & Gotchas
- [ ] Word count approximately 700-900 words (composite headliner, larger than standard)
- [ ] Movement Tracker subsection covers crawl budget, combat budget, terrain difficulty, Rush (2x speed), color-coded ruler, effective mode speed (fly/swim/climb)
- [ ] Rollback Movement is folded into the Movement subsection — covers Token HUD button, GM vs PC visibility, socket relay, snap-back behavior
- [ ] Combat Dropdown subsection covers the tab layout (weapons / spells / NPC actions / abilities), mana cost calc for spells, one-click actions
- [ ] HP + Stats quick reference subsection covers what's visible at a glance (HP bar, status pills, Luck, remaining movement)
- [ ] Settings table lists at minimum: `hideNpcNames`, `autoRemoveDefeated`, `npcActionMenu`, `enforceCrawlMovement`, `enforceCombatMovement`, `enforceNpcMovement`
- [ ] All cross-links to other guide files use relative `.md` paths
- [ ] No `TODO`, `TBD`, or `[fill in]` remains

**Verify:**
- `wc -w` on the Crawl Strip section → 700-900
- Grep `TODO\|TBD\|\[fill` path `docs/crawl-loop.md` → 0 matches
- Section contains all 4 subsections (Movement Tracker, Rollback, Combat Dropdown, HP+Stats)

**Steps:**

- [ ] **Step 1: Read the Crawl Strip skeleton + existing CLAUDE.md + `scripts/crawl-strip.mjs` + `scripts/movement-tracker.mjs` + `scripts/npc-action-menu.mjs` for accurate behavior**

- [ ] **Step 2: Write the What it does paragraph (2-3 short paragraphs)**

Covers: top-of-screen HUD for all players; portrait cards with HP bars, status pills, name; disposition-based split (friendly on Heroes side, hostile on NPC side); active/dim cards based on whose turn it is; combat mode adds round indicator, round arrows, activate/end-turn on hover.

- [ ] **Step 3: Write the How to use numbered steps**

Covers: selecting tokens adds them to the tracker; single-click on a card selects + pans to token; double-click opens sheet; during combat, hover reveals the action menu; combat mode auto-sorts by initiative order.

- [ ] **Step 4: Write the Movement Tracker subsection**

Covers: crawl-mode budget (hard block beyond crawl speed, resets each phase, terrain difficulty via Scene Region "Modify Movement Cost"); combat-mode budget (base speed + Rush for 2x, color-coded ruler, hard block at 2x); effective mode speed (Bat with walk5/fly30 uses 30 in combat; Dragon with walk40/fly80 uses 80); how GM forces a mode via Token HUD `movementAction`. Include a small table of movement action icons.

- [ ] **Step 5: Fold Rollback Movement into the Movement subsection**

Add a "Rollback" paragraph explaining the Token HUD button — available to PCs during Heroes phase / combat, to GM during GM phase / combat; snaps back to turn-start position and refunds full movement; players relay via socket to GM for execution.

- [ ] **Step 6: Write the Combat Dropdown subsection**

Covers: hover a card during combat to reveal the tab strip; tabs for Weapons / Spells / Actions / Abilities; one-click attacks; Spell Cast Dialog (delivery type, dice, effects, range/area, template placement, live mana cost, Focus toggle). Reference that the Spell Cast Dialog is shared between sheet casts and strip casts.

- [ ] **Step 7: Write the HP + Stats quick reference subsection**

Covers: what's always visible on every card (HP bar, status pills, current turn chevron, defeated skull overlay); hero-card extras (Luck, remaining movement, HP); NPC-card extras (remaining movement icon during combat — walk/fly/swim/climb/phase/cling).

- [ ] **Step 8: Write the Settings table**

```markdown
| Setting | Effect | Default |
|---|---|---|
| Hide NPC Names in Strip | Remove NPC names from strip cards | Off |
| Auto-Hide Defeated Tokens | Hide defeated from strip | Off |
| NPC Action Menu | Show hover action menus on combat cards | On |
| Enforce Crawl Movement | Block movement beyond crawl speed | On |
| Enforce Combat Movement | Block movement beyond combat speed | On |
| Enforce NPC Movement | Apply movement budget to hostile NPCs | Off |
```

- [ ] **Step 9: Write the Tips & Gotchas bullets**

Cover at minimum: unlinked tokens work (use `token.actor` not world actor); party tokens show speed correctly on the strip; drag-and-drop reordering; friendly NPC summons appear on the Heroes side (disposition, not actor type).

- [ ] **Step 10: Run verify checks**

- [ ] **Step 11: Commit**

```bash
git add docs/crawl-loop.md
git commit -m "docs: write Crawl Strip headliner section"
```

---

### Task 3: Write Encounter System headliner

**Goal:** Fill the Encounter System headliner section in `docs/exploration.md`.

**Files:**
- Modify: `docs/exploration.md` (Encounter System `##` section)

**Acceptance Criteria:**
- [ ] Follows feature-section template
- [ ] Word count 600-900
- [ ] Covers Encounter Check (d6 against threshold, right-click to configure)
- [ ] Covers Encounter Roller: Build Table tab, Browse NPC tab (with filter details — name / creature type / TL), Roll Tables tab, Mutator tab
- [ ] Mentions Morale + Distance integration at the flow level
- [ ] Cross-link to Monster Creator for "Mutator" tab
- [ ] Cross-link to Morale Check stub in `combat.md`

**Verify:** Word count in range; grep for `TODO\|TBD\|\[fill` → 0; cross-links present.

**Steps:**

- [ ] **Step 1: Read `scripts/encounter-tools.mjs` + `scripts/monster-mutator.mjs` + CLAUDE.md encounter-related sections**

- [ ] **Step 2: Write What it does**

Covers: d6-in-6 random encounter check triggered by GM during crawl phase, configurable threshold (right-click the bar button); the Roller window is a 4-tab authoring tool for building encounter rollTables and mutating monsters.

- [ ] **Step 3: Write How to use numbered steps**

1. GM clicks Encounter Check on the Crawl Bar — rolls a d6.
2. On success (≤ threshold), open the Encounter Roller.
3. Browse NPC tab — filter by name, creature type, or TL; drag candidates into the Build Table tab.
4. Build Table — name the table, set weights, save as a Foundry RollTable.
5. Roll Tables tab — roll any saved encounter table to spawn tokens.
6. Mutator tab — pick an NPC, apply one or more of 64 mutations with stat recalculation.

- [ ] **Step 4: Write Settings table**

| Setting | Effect | Default |
|---|---|---|
| Default Encounter Threshold | N-in-6 chance on check | 1 |
| Encounter Roll: GM Only | Whisper result to GM | On |
| Excluded Table Folders | Hidden folder IDs from Roll Tables tab | (none) |

- [ ] **Step 5: Write Tips & Gotchas**

Cover: Browse NPC reads both the core bestiary and `vagabond-character-enhancer.vce-beasts`; filter persists across tab switches; mutated NPCs save under a custom name; morale checks fire independently via the morale checker (link).

- [ ] **Step 6: Commit**

```bash
git add docs/exploration.md
git commit -m "docs: write Encounter System headliner section"
```

---

### Task 4: Write Monster Creator headliner

**Goal:** Fill the Monster Creator headliner section in `docs/exploration.md`.

**Files:** Modify `docs/exploration.md`

**Acceptance Criteria:**
- [ ] Follows template, 600-900 words
- [ ] Covers build from scratch (identity, stats, movement, damage immunities, weaknesses, status immunities, actions, abilities, description)
- [ ] Covers load-from-bestiary with filter panel
- [ ] Covers mutation workflow (absorbs Monster Mutator)
- [ ] Highlights the green ✓ automation badge on ability Quick-Picks
- [ ] Explains that created NPCs save as world actors (compendium untouched)

**Verify:** Word count in range; grep TODO → 0; automation-badge mechanic explained.

**Steps:**

- [ ] **Step 1: Read the Monster Creator feature description in `README.md:249` and the relevant code in `scripts/` (whatever file implements it — likely the encounter-tools suite)**

- [ ] **Step 2: Write What it does**

Covers: dedicated window for authoring NPCs from scratch OR starting from a bestiary template; collapsible sections for identity / stats / movement / damage immunities / weaknesses / status immunities / actions / abilities / description; Quick-Pick action and ability templates including automation-status badges.

- [ ] **Step 3: Write How to use**

1. Right-click the Encounter bar button → Monster Creator.
2. Load from bestiary (filter by name / type / TL) OR start blank.
3. Fill collapsible sections — each section expands on click.
4. Use Quick-Picks for curated action/ability templates. A green ✓ on an ability name means it's automated via `npc-abilities.mjs`.
5. Save — creates a world actor. Compendium untouched.

- [ ] **Step 4: Write Settings table** (likely minimal — this is a window tool)

- [ ] **Step 5: Write Tips & Gotchas**

Cover: automation badges flip to ✓ when the ability name matches what `npc-abilities.mjs` recognizes; mutation applies stat recalculation and supports custom names; bestiary source is never modified; for a full list of automated abilities, see [NPC Abilities](combat.md#npc-abilities).

- [ ] **Step 6: Commit**

```bash
git add docs/exploration.md
git commit -m "docs: write Monster Creator headliner section"
```

---

### Task 5: Write Light Tracker headliner

**Goal:** Fill the Light Tracker headliner section in `docs/exploration.md`.

**Files:** Modify `docs/exploration.md`

**Acceptance Criteria:**
- [ ] Follows template, 700-900 words (has a big table)
- [ ] Covers the 12 source types table (bright/dim/duration/notes)
- [ ] Covers lantern fuel system (oil, flask preferred, consumed on burn-out)
- [ ] Covers real-time burn setting
- [ ] Covers drop/pickup on canvas
- [ ] Covers party token behavior (light transfers)
- [ ] Covers stack splitting (lighting a stacked torch)

**Verify:** Word count in range; grep TODO → 0; table has all 12 source types.

**Steps:**

- [ ] **Step 1: Read `scripts/light-tracker.mjs` + `scripts/light-sources-config.mjs` + existing README lines 97-119**

- [ ] **Step 2: Write What it does**

Covers: tracks burn time for all light sources carried by party members; auto-advances per crawl shift (or in real time with the setting); lantern fuel system consumes oil on burn-out; supports canvas drops and party tokens.

- [ ] **Step 3: Include the source types table** (copy from README lines 97-110 but with column order: Source | Bright | Dim | Duration | Notes)

- [ ] **Step 4: Write How to use**

1. Right-click a light source in inventory → Light. The light turns on with the configured Foundry light properties.
2. Burn time ticks down per crawl shift, OR per real second with Real-Time Burn enabled.
3. Lanterns consume oil when burn time runs out (flasks preferred over basic oil).
4. Drop a light on the canvas via drag — becomes a temporary illumination token.
5. Pick up a dropped light via Token HUD.
6. Gather into a party token — carried lights transfer.

- [ ] **Step 5: Write Settings table**

| Setting | Effect | Default |
|---|---|---|
| Real-Time Light Burn | 1 real second = 1 game second | Off |

Light source properties (dim/bright/color/animation per type) are edited via **Light Sources Configuration** → open with `game.vagabondCrawler.lightTracker.openSourcesConfig()`.

- [ ] **Step 6: Write Tips & Gotchas**

Cover: lighting a stacked torch splits off one item (doesn't light the whole stack); Tindertwig never burns out; Sentry Torch suspends invisibility in its light; lantern fuel is consumed only when burn time runs out, not continuously; party token light transfer works even for unlinked tokens.

- [ ] **Step 7: Commit**

```bash
git add docs/exploration.md
git commit -m "docs: write Light Tracker headliner section"
```

---

### Task 6: Write Loot Generator headliner (+ Loot Manager)

**Goal:** Fill the Loot Generator headliner in `docs/crafting-loot.md`, absorbing the Loot Manager as a subsection or integrated paragraph.

**Files:** Modify `docs/crafting-loot.md`

**Acceptance Criteria:**
- [ ] Follows template, 600-900 words
- [ ] Covers core Vagabond loot tables (Levels 1-10)
- [ ] Covers custom table authoring
- [ ] Covers compendium item creation on roll (roll chain traceable)
- [ ] Covers "Give to Player" chat buttons
- [ ] Covers Loot Manager auto-drop mechanic (drop chance, NPC defeat trigger, Owner permission)
- [ ] Explains the split: Loot Generator = explicit roll, Loot Manager = auto-drop on defeat

**Verify:** Word count in range; grep TODO → 0.

**Steps:**

- [ ] **Step 1: Read `scripts/loot-generator.mjs`, `scripts/loot-manager.mjs`, `scripts/loot-drops.mjs`, `scripts/loot-tables.mjs`**

- [ ] **Step 2: Write What it does**

Two tools, related but distinct: Loot Generator is a GM roll window (pick a table, roll, get items); Loot Manager assigns loot tables to NPCs and auto-rolls on defeat with a configurable drop chance.

- [ ] **Step 3: Write How to use — Loot Generator**

1. Open from Forge & Loot panel → Loot Generator.
2. Pick a core table (Level 1-10) or a custom one.
3. Roll — items materialize as compendium items in the roll chat card.
4. Click "Give to Player" on any item to transfer to a PC's inventory.

- [ ] **Step 4: Write How to use — Loot Manager**

1. Open from Forge & Loot panel → Loot Manager.
2. Select an NPC actor; pick a loot table to assign.
3. Set drop chance (0-100%).
4. When the NPC is defeated, `loot-drops.mjs` fires automatically — rolls the table, creates a loot token on the canvas with Owner permission for all players, players right-click to pick up.

- [ ] **Step 5: Write Settings table**

| Setting | Effect | Default |
|---|---|---|
| Loot drops enabled | Auto-create loot on NPC defeat | On |
| Default drop chance | % chance loot drops per defeat | (configurable slider) |

- [ ] **Step 6: Write Tips & Gotchas**

Cover: compendium items created on roll use `skipStack: true` where needed; loot tokens on canvas default to Owner permission for all players so pickups work without GM relay; "Give to Player" uses the current player list — make sure PCs exist; `loot-drops.mjs` is silent if loot is disabled globally.

- [ ] **Step 7: Commit**

```bash
git add docs/crafting-loot.md
git commit -m "docs: write Loot Generator headliner section"
```

---

### Task 7: Write Relic Forge headliner

**Goal:** Fill the Relic Forge headliner section.

**Files:** Modify `docs/crafting-loot.md`

**Acceptance Criteria:**
- [ ] Follows template, 600-900 words
- [ ] Covers relic power selection
- [ ] Covers equipment targeting (what item types can be enchanted)
- [ ] Covers application of active effects
- [ ] Lists or links to the relic powers catalog

**Verify:** Word count in range; grep TODO → 0.

**Steps:**

- [ ] **Step 1: Read `scripts/relic-forge.mjs`, `scripts/relic-effects.mjs`, `scripts/relic-powers.mjs`**

- [ ] **Step 2: Write What it does, How to use, Settings, Tips & Gotchas per template**

Content areas to cover (derive specifics from the code):
- Open from Forge & Loot → Relic Forge
- Pick an equipment item, one or more relic powers
- Apply — creates an item or applies an active effect
- Where the catalog of relic powers lives
- How conflicts are handled
- Any naming convention or chat card behavior

- [ ] **Step 3: Commit**

```bash
git add docs/crafting-loot.md
git commit -m "docs: write Relic Forge headliner section"
```

---

### Task 8: Write Spell Scroll Forge headliner

**Goal:** Fill the Spell Scroll Forge headliner section.

**Files:** Modify `docs/crafting-loot.md`

**Acceptance Criteria:**
- [ ] Follows template, 600-900 words
- [ ] Covers picking a spell from the compendium
- [ ] Covers configuring delivery / dice / effects
- [ ] Covers scroll cost formula (5g + 5g per mana equivalent)
- [ ] Covers "Use Scroll" right-click context menu action on scrolls
- [ ] Covers one-shot consumption behavior (no mana, no Cast Check, vaporize on use, plays spell FX, rolls damage, posts chat card)

**Verify:** Word count in range; grep TODO → 0.

**Steps:**

- [ ] **Step 1: Read `scripts/scroll-forge.mjs` + README lines 166-175**

- [ ] **Step 2: Write all template sections**

- [ ] **Step 3: Commit**

```bash
git add docs/crafting-loot.md
git commit -m "docs: write Spell Scroll Forge headliner section"
```

---

### Task 9: Write Merchant Shop headliner

**Goal:** Fill the Merchant Shop headliner section.

**Files:** Modify `docs/crafting-loot.md`

**Acceptance Criteria:**
- [ ] Follows template, 600-900 words
- [ ] Covers compendium global-inventory mode
- [ ] Covers NPC actor-inventory mode
- [ ] Covers GM opening the shop for all players
- [ ] Covers the gamble-off-loot-tables mechanic
- [ ] Covers permissions and price/quantity display

**Verify:** Word count in range; grep TODO → 0.

**Steps:**

- [ ] **Step 1: Read `scripts/merchant-shop.mjs`**

- [ ] **Step 2: Write all template sections** — pay special attention to the gamble mechanic since the user specifically called it out as a signature feature

- [ ] **Step 3: Commit**

```bash
git add docs/crafting-loot.md
git commit -m "docs: write Merchant Shop headliner section"
```

---

### Task 10: Write Session Recap headliner

**Goal:** Fill the Session Recap headliner section in `docs/session-tracking.md`.

**Files:** Modify `docs/session-tracking.md`

**Acceptance Criteria:**
- [ ] Follows template, 800-1000 words (this is a big feature)
- [ ] Covers all five tabs (Overview, Combat, Loot, XP, History)
- [ ] Covers Discord markdown export
- [ ] Covers `!recap` chat command
- [ ] Covers session lifecycle (start popup, pause, save, discard) triggered by crawl start/end
- [ ] Covers Damage Log module integration (soft dependency — explain what's gated on it)
- [ ] Covers auto-capture gating (no tracking without active session)

**Verify:** Word count in range; grep TODO → 0.

**Steps:**

- [ ] **Step 1: Read `scripts/loot-tracker.mjs`, and any session-recap-related scripts; also skim the spec `docs/superpowers/specs/2026-04-16-session-recap-design.md` and the plan `docs/superpowers/plans/2026-04-16-session-recap.md` for authoritative feature list**

- [ ] **Step 2: Write each tab's paragraph**

- Overview: duration, total combats, enemies defeated, per-player kills/damage/XP summary
- Combat: per-encounter collapsible breakdowns (rounds, duration, enemy list with kill credits), player stats table (hit rate, nat 20s/1s, avg d20, saves, damage dealt/taken, kills)
- Loot: reverse-chronological loot log with source tracking
- XP: per-player awards with question breakdowns
- History: view/export/delete past sessions

- [ ] **Step 3: Write Discord export paragraph** — markdown copy-to-clipboard for any session

- [ ] **Step 4: Write `!recap` chat command note** — one-liner

- [ ] **Step 5: Write session lifecycle paragraph** — crawl-start prompts to start/pause a session; crawl-end prompts to save/discard

- [ ] **Step 6: Write Damage Log integration note** — damage/kill tracking requires the Damage Log module; without it, loot and XP still work but combat stats are partial

- [ ] **Step 7: Write Settings and Tips & Gotchas**

- [ ] **Step 8: Commit**

```bash
git add docs/session-tracking.md
git commit -m "docs: write Session Recap headliner section"
```

---

### Task 11: Write NPC Abilities mini-headliner

**Goal:** Fill the NPC Abilities mini-headliner section in `docs/combat.md` to ~300-400 words with the full ability table.

**Files:** Modify `docs/combat.md`

**Acceptance Criteria:**
- [ ] Follows feature-section template (mini variant)
- [ ] Word count 300-400
- [ ] Includes the ability table: Magic Ward I-VI, Nimble, Pack Instincts / Tactics / Hunter, Soft Underbelly
- [ ] Explains how each ability triggers and what it does at the table
- [ ] Explains the green ✓ automation badge in Monster Creator
- [ ] Cross-links to `docs/audit/abilities.md` for the full bestiary dashboard
- [ ] Mentions VCE wrap-chain note briefly (it works; developers can read the dev reference)

**Verify:** Word count in range; grep TODO → 0; table has all 4 ability families.

**Steps:**

- [ ] **Step 1: Read `scripts/npc-abilities.mjs` + CLAUDE.md System/Module Wrap Chain Gotchas section + `docs/audit/abilities.md`**

- [ ] **Step 2: Write What it does**

Passive automation hooks that make NPC abilities fire without GM effort: Magic Ward levies mana surcharges on casters, Nimble clamps favor to none, Pack Instincts/Tactics/Hunter hinder saves against the NPC's attacks, Soft Underbelly zeroes armor while Prone.

- [ ] **Step 3: Write the ability table** (copy/adapt from README lines 135-141, expand slightly with at-the-table wording)

- [ ] **Step 4: Write the automation-badge paragraph**

"In the Monster Creator's Quick-Pick ability list, a green ✓ next to an ability name means the ability is live-automated by the module. Abilities without the badge still appear on the sheet but do nothing mechanically — they're for GM reference."

- [ ] **Step 5: Write cross-link paragraph** to `docs/audit/abilities.md` for the full 348-monster automation dashboard

- [ ] **Step 6: Commit**

```bash
git add docs/combat.md
git commit -m "docs: write NPC Abilities mini-headliner"
```

---

### Task 12: Write `crawl-loop.md` stubs (Crawl Clock, Rest & Breather)

**Goal:** Fill the two `###` stub sections in `docs/crawl-loop.md`.

**Files:** Modify `docs/crawl-loop.md`

**Acceptance Criteria:**
- [ ] Each stub is 80-150 words
- [ ] Includes a single screenshot placeholder per stub
- [ ] No `###` subheaders inside the stubs

**Verify:** Word count per stub; grep TODO → 0.

**Steps:**

- [ ] **Step 1: Write Crawl Clock stub**

~100 words. Covers: SVG progress clock tracking dungeon exploration tension; configurable sizes (Tiny/Small/Medium/Large/Huge); advances per crawl turn; resets when filled; hideable during combat; persists across sessions.

- [ ] **Step 2: Write Rest & Breather stub**

~120 words. Covers: combined recovery dialog showing all PCs with HP/Luck/Mana/Fatigue/Might/Rations; Breather consumes a ration and heals based on Might; Rest fully recovers HP/Luck/Mana and reduces Fatigue; auto-detects rations via supply flag.

- [ ] **Step 3: Commit**

```bash
git add docs/crawl-loop.md
git commit -m "docs: fill crawl-loop.md stubs"
```

---

### Task 13: Write `combat.md` stubs

**Goal:** Fill the five `###` stubs in `docs/combat.md`: Flanking Checker, Countdown Dice Auto-Roller, Morale Check, Animation FX, Chat Dice Tooltips.

**Files:** Modify `docs/combat.md`

**Acceptance Criteria:**
- [ ] Each stub 80-150 words (Chat Dice Tooltips can be shorter — one paragraph)
- [ ] No subheaders inside stubs
- [ ] Morale Check cross-links from Encounter System

**Verify:** Word count per stub; grep TODO → 0.

**Steps:**

- [ ] **Step 1: Write Flanking Checker stub** — 2+ allies adjacent to a foe applies Vulnerable; bidirectional; size restriction; cross-reference flanking rules.

- [ ] **Step 2: Write Countdown Dice Auto-Roller stub** — auto-rolls all countdown dice at start of each round; applies tick damage (burning, poison, etc.); shrinks on a roll of 1; cleans up on combat end; toggle via world setting.

- [ ] **Step 3: Write Morale Check stub** — auto-triggers on first death / half defeated / solo half-HP; links to Encounter System for context.

- [ ] **Step 4: Write Animation FX stub** — unified animation resolver + playback for weapons, alchemical, gear, NPC actions; per-item/per-action override flags; config window opens via `game.vagabondCrawler.animationFx` or the Animation FX config; JB2A-aware defaults; see the [config reference](dev/) for details.

- [ ] **Step 5: Write Chat Dice Tooltips stub** — one paragraph. Hover over any damage dice in chat to see the individual roll breakdown.

- [ ] **Step 6: Commit**

```bash
git add docs/combat.md
git commit -m "docs: fill combat.md stubs"
```

---

### Task 14: Write `exploration.md` stub (Trap Builder)

**Goal:** Fill the Trap Builder stub.

**Files:** Modify `docs/exploration.md`

**Acceptance Criteria:**
- [ ] Stub 80-150 words
- [ ] Covers: macro-based trap system using v13 Scene Regions; visual dialog for save type / VFX / damage / status effects / countdown dice / tick damage / fatigue-mana-luck drain; auto-creates a Scene Region with "Execute Macro" behavior on token enter; one-shot option; Sequencer integration.

**Verify:** Word count; grep TODO → 0.

**Steps:**

- [ ] **Step 1: Read README lines 254-261**

- [ ] **Step 2: Write stub**

- [ ] **Step 3: Commit**

```bash
git add docs/exploration.md
git commit -m "docs: fill exploration.md stub (trap builder)"
```

---

### Task 15: Write `crafting-loot.md` stubs

**Goal:** Fill Inventory System, Party Inventory, Item Drops stubs.

**Files:** Modify `docs/crafting-loot.md`

**Acceptance Criteria:**
- [ ] Each stub 80-150 words
- [ ] Inventory System covers: auto-stacking, quantity badges, slot counting, zero-slot pooling rule (10 units = 1 slot, scroll spells pool under "Scrolls"), weightless flag
- [ ] Party Inventory covers: side-by-side view for loot redistribution
- [ ] Item Drops covers: canvas drops and pickups with Owner permission, `skipStack: true` on pickup

**Verify:** Word count per stub; grep TODO → 0.

**Steps:**

- [ ] **Step 1: Read `scripts/vagabond-crawler.mjs` (inventory patches), `scripts/party-inventory.mjs`, `scripts/item-drops.mjs`**

- [ ] **Step 2: Write each stub**

- [ ] **Step 3: Commit**

```bash
git add docs/crafting-loot.md
git commit -m "docs: fill crafting-loot.md stubs"
```

---

### Task 16: Write `session-tracking.md` stub (XP Counter Patch)

**Goal:** Fill the XP Counter Patch stub.

**Files:** Modify `docs/session-tracking.md`

**Acceptance Criteria:**
- [ ] Stub 80-150 words
- [ ] Covers: enhances base system's Level Up XP questionnaire; left-click to increment, right-click to decrement; counter badge and per-question XP subtotals; awards auto-logged to Session Recap

**Verify:** Word count; grep TODO → 0.

**Steps:**

- [ ] **Step 1: Read the relevant code (likely in `scripts/vagabond-crawler.mjs` or a dedicated patches file)**

- [ ] **Step 2: Write stub**

- [ ] **Step 3: Commit**

```bash
git add docs/session-tracking.md
git commit -m "docs: fill session-tracking.md stub (XP counter)"
```

---

### Task 17: Refresh `player-quickref.md`

**Goal:** Light pass to verify keybindings still accurate, update any stale feature references, and add a "See also" block pointing into the GM guide for features players might read about.

**Files:** Modify `docs/player-quickref.md`

**Acceptance Criteria:**
- [ ] Every keybind listed is still valid (verified against Foundry v13 defaults + any module keybinds in `scripts/`)
- [ ] No references to removed or stale features
- [ ] A "See also" section at the bottom links into `crawl-loop.md`, `combat.md`, and `crafting-loot.md` for players who want to understand features they'll see at the table
- [ ] No placeholders

**Verify:** Read the file; grep TODO → 0; cross-links present.

**Steps:**

- [ ] **Step 1: Read the full existing `docs/player-quickref.md`**

- [ ] **Step 2: Grep `scripts/` for `registerKeybinding` or `KeybindingsConfig` to find any module-registered keybinds and verify they're in the doc**

- [ ] **Step 3: Edit — correct any stale entries, add a "See also" block at the bottom**

```markdown
## See also

- [Crawl Loop](crawl-loop.md) — how the turn structure and movement budget work
- [NPC Combat Automation](combat.md#flanking-checker) — why your character sometimes gets Vulnerable automatically
- [Crafting & Loot](crafting-loot.md#item-drops) — picking up items from the canvas
```

- [ ] **Step 4: Commit**

```bash
git add docs/player-quickref.md
git commit -m "docs: refresh player quickref"
```

---

### Task 18: Fill README headline features grid

**Goal:** Replace the `<!-- headline-features-grid: Task 18 fills this block -->` placeholder with a compact grid of ~10 feature one-liners, each linking to the corresponding guide section.

**Files:** Modify `README.md`

**Acceptance Criteria:**
- [ ] Placeholder comment removed
- [ ] Grid contains ≥10 feature bullets with one-line descriptions
- [ ] Every bullet has a working relative link to the guide section
- [ ] Order matches headliner priority (Strip → Encounter → Monster Creator → Light → Loot → Relic → Scroll → Merchant → Session Recap → NPC Abilities)

**Verify:** Read README; grep for every guide filename (`crawl-loop.md`, `combat.md`, etc.) → all present.

**Steps:**

- [ ] **Step 1: Write the grid**

```markdown
## Headline Features

- **[Crawl Strip](docs/crawl-loop.md#crawl-strip)** — Top-of-screen HUD for all players. Portraits, HP, status, one-click actions, movement budgets.
- **[Encounter System](docs/exploration.md#encounter-system)** — Random checks, Roll Table builder, NPC browser with filters, monster mutator.
- **[Monster Creator](docs/exploration.md#monster-creator)** — Build or mutate NPCs in a dedicated window with automation-status badges.
- **[Light Tracker](docs/exploration.md#light-tracker)** — 12 light sources, lantern fuel system, real-time burn, canvas drop/pickup.
- **[Loot Generator](docs/crafting-loot.md#loot-generator)** — Roll on core tables or custom ones; "Give to Player" chat buttons; auto-drop on NPC defeat.
- **[Relic Forge](docs/crafting-loot.md#relic-forge)** — Craft custom equipment with relic powers.
- **[Spell Scroll Forge](docs/crafting-loot.md#spell-scroll-forge)** — One-shot spell scrolls from any compendium spell.
- **[Merchant Shop](docs/crafting-loot.md#merchant-shop)** — Compendium or NPC merchants; gamble on loot tables.
- **[Session Recap](docs/session-tracking.md#session-recap)** — Combat stats, loot log, XP tracking, Discord export.
- **[NPC Abilities](docs/combat.md#npc-abilities)** — Magic Ward, Pack Instincts, Nimble, Soft Underbelly — automated.
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: fill README headline features grid"
```

---

### Task 19: Update CLAUDE.md for new docs structure

**Goal:** Add a short note to CLAUDE.md describing the dual-track docs structure so future-you and future-Claude know where guide content lives vs reference.

**Files:** Modify `CLAUDE.md`

**Acceptance Criteria:**
- [ ] New paragraph or section added explaining: `docs/*.md` = GM-facing guide; `docs/dev/*.md` = contributor/technical reference; `docs/audit/` = monster dataset; `docs/superpowers/` = planning system
- [ ] Placement: either a top-level section (e.g., "## Documentation") near File Map, or a short note appended to the File Map section
- [ ] No other changes to CLAUDE.md

**Verify:** Grep CLAUDE.md for `docs/dev` → 1+ matches; diff shows only the documentation note added.

**Steps:**

- [ ] **Step 1: Read CLAUDE.md to find best insertion point**

- [ ] **Step 2: Add the note (~150 words)**

```markdown
## Documentation

- `docs/*.md` — **GM-facing guide.** Usage-first, with screenshots/gifs. Organized by use-case (crawl-loop, combat, exploration, crafting-loot, session-tracking, player-quickref). Landing page for module users.
- `docs/dev/*.md` — **Contributor / technical reference.** Architecture tables, state shapes, hook names, setting keys, file roles. This is where the old top-level `docs/*.md` files live now.
- `docs/audit/` — Monster dataset (JSON + markdown views of the 348-monster bestiary, ability automation status, findings).
- `docs/superpowers/` — Planning system. `specs/` holds design docs, `plans/` holds implementation plans and `.tasks.json` state files.
- `README.md` — Short landing page. Headline features grid links into `docs/`.

**When changing module behavior:** update the matching guide file under `docs/` (for user-visible changes) AND the matching reference file under `docs/dev/` (for architectural changes).
```

- [ ] **Step 3: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: note dual-track documentation structure in CLAUDE.md"
```

---

## Task Dependency Graph

- **Task 1** (Scaffolding) blocks everything.
- **Tasks 2-11** (headliners + mini-headliner) can run in parallel once Task 1 is done.
- **Tasks 12-16** (stubs) can run in parallel with each other but should land after the headliners in the same file (to avoid merge conflicts).
- **Task 17** (player quickref) is fully independent; can run anytime after Task 1.
- **Task 18** (README grid) benefits from having the guide files written (so the links resolve meaningfully), so land it after Tasks 2-16.
- **Task 19** (CLAUDE.md update) is fully independent; can run anytime.

## Self-Review Notes

- **Spec coverage:** Every headliner from the spec has a task. Every stub has a task (grouped by file). README landing page + headline grid = Tasks 1 + 18. Dev reference migration = Task 1. Stale content cleanup = Task 1. CLAUDE.md update = Task 19. Player quickref refresh = Task 17. ✓
- **Gif slots:** All gif placeholders left as HTML comments — sub-project 2 will replace them. ✓
- **No placeholders in plan:** Every task has concrete files, criteria, commands, and content briefs. Where a task says "read the code first" the intent is clear: extract accurate behavior, don't guess. ✓
- **Conventional Commits:** Every task's commit message uses `docs: <imperative>`. ✓
- **Headliner depth:** Each headliner targets 600-900 words, Session Recap gets 800-1000, mini-headliner 300-400, stubs 80-150. Consistent with spec. ✓
