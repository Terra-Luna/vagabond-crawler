# Release Documentation Design

**Date:** 2026-04-17
**Status:** Approved design, ready for implementation planning
**Target module:** `vagabond-crawler`
**Part of:** Release prep (sub-project 1 of 3)

## Summary

Produce release-ready documentation for `vagabond-crawler` that sells the module on the Foundry listing and serves GMs at the table. Two tracks: a GM-facing guide at the top level of `docs/`, and the existing technical reference moved into `docs/dev/`. README becomes a short landing page that points into the guide. Written headliner-first — 10 flagship features get full feature-section treatment, everything else gets compact stubs.

## Motivation

- The module now ships ~25 distinct features across crawl, combat, exploration, crafting, loot, and session-tracking. A good fraction of them are genuinely novel (Crawl Strip, Light Tracker, Monster Creator, Session Recap) and the current README doesn't convey their value in motion.
- The existing `docs/*.md` files are all technical references written for contributors, not GMs. A Foundry module visitor clicking into `docs/crawl-system.md` lands on state shapes and hook names — not "here's how the turn tracker works at your table."
- Without this layer, the Foundry submission listing has nothing to link to for depth, and evaluators bounce.
- GitHub's native markdown rendering is already a perfectly adequate "docs site" — no extra hosting needed — but the content has to be organized for the reader, not for the author.

## Non-goals

- **No gifs or screenshots captured as part of this spec.** Visual asset production is sub-project 2 (separate spec). This spec specifies *where* gifs go and *what* each one covers; sub-project 2 handles recording, encoding, hosting, and embedding.
- **No Foundry registry submission work.** That is sub-project 3 — the package admin form, gallery images, review cycle. This spec produces the docs that submission will link to.
- **No docs site / GitHub Pages / static site generator.** Explicitly ruled out. Plain markdown rendered by GitHub.
- **No Mintlify, Docusaurus, MkDocs, VitePress, or GitHub Wiki.**
- **No rewrite of the `docs/audit/` monster dataset.** It stays as-is.
- **No new features.** Docs-only pass (plus a small cleanup of stale references).
- **No localization.** Module ships `languages/en.json` only; docs are English only.

## Audience & Tracks

Two tracks, explicit and separate:

| Track | Audience | Location | Style |
|---|---|---|---|
| **GM Guide** | GMs evaluating or running the module | `docs/*.md` (top level) | Usage-first, gifs/screenshots, "how to use" prose, tables for settings |
| **Contributor Reference** | Future-you, future-Claude, contributors | `docs/dev/*.md` | Architecture, state shapes, hook names, setting keys, file roles |

Both tracks live in the repo. No duplication between them — when a guide file needs to mention an internal detail, it links into the reference.

## Disk Layout

```
docs/
├── crawl-loop.md            [GM guide — new]
├── combat.md                [GM guide — new; NPC combat automation]
├── exploration.md           [GM guide — new]
├── crafting-loot.md         [GM guide — new]
├── session-tracking.md      [GM guide — new]
├── player-quickref.md       [kept; light refresh pass]
├── audit/                   [unchanged]
├── dev/
│   ├── crawl-system.md      [moved from docs/]
│   ├── combat-tools.md      [moved from docs/]
│   ├── exploration-tools.md [moved from docs/]
│   └── utilities.md         [moved from docs/; alchemistCookbook setting row removed]
└── superpowers/             [unchanged]
```

**Cleanup included in this work:**
- Delete `docs/alchemist-cookbook.md` (stale — the alchemy subsystem moved to `vagabond-character-enhancer`; no alchemy files remain in `scripts/`).
- Remove the `alchemistCookbook` row from the moved `docs/dev/utilities.md` settings table.
- Update CLAUDE.md to reflect the new docs structure (brief — "see `docs/` for GM-facing, `docs/dev/` for contributor reference").

## README Strategy

**Short landing page, ~80-120 lines.** Replaces the current 321-line comprehensive README.

Sections, top to bottom:
1. Title + badges (Foundry v13, system, version).
2. One-paragraph pitch (2-3 sentences).
3. **Hero gifs grid** — 3-4 gifs of the flagship experience (Strip + Movement during combat, Light Tracker burning down, Encounter Roller building a table, Session Recap). Sub-project 2 produces these.
4. **Headline features grid** — ~10 bullets with one-liners, each linking into the corresponding guide file.
5. Requirements + optional/recommended dependencies.
6. Install (manifest URL).
7. Links block: guide files, dev reference, audit, CHANGELOG.
8. Footer (authors, disclaimer).

Existing content is heavily trimmed — feature-by-feature prose moves into guide files. The README's job is "convert a module-browser into an installer in 30 seconds," not to document every feature.

## Per-File Content Mapping

Each file follows the **two-tier header hierarchy**: `##` for headliners, `###` for stubs. Visual weight signals priority. No formal "also included" separator section.

### `docs/crawl-loop.md` — Turn-to-turn crawl loop

- **Intro paragraph: Crawl Bar orientation.** Bullet list of the button row: "Start/End Crawl, Next Turn, Add Tokens, Time Passes, Encounter Check, Encounter Roller, Light Tracker, Combat, Rest/Breather, Forge & Loot, Clock config." Each bullet links to the feature's section in the appropriate guide file. Not a feature section in itself.
- `##` **Crawl Strip** (headliner, composite). Covers:
  - The Strip UI itself (portrait cards, HP bars, disposition sorting)
  - Movement Tracker as a subsection (crawl budget, combat budget, terrain difficulty, Rush, color-coded ruler, effective mode speed)
  - **Rollback Movement** folded into the Movement subsection
  - Combat Dropdown subsection (weapons / spells / NPC actions / abilities — tab layout)
  - HP + stats quick-reference
- `###` Crawl Clock — stub with a screenshot
- `###` Rest & Breather — stub

### `docs/combat.md` — NPC Combat Automation

Scope note at top of file:
> *This guide covers the NPC-side combat automation handled by Vagabond Crawler: NPC abilities, flanking, countdown dice, morale, animation FX. Player-side combat (class resources, character action menus, etc.) is handled by the Character Enhancer module — see its docs.*

- `##` **NPC Abilities** (mini-headliner, ~300-400 words + one screenshot). Ability table (Magic Ward I-VI, Nimble, Pack Instincts / Tactics / Hunter, Soft Underbelly). What each ability does at the table, how it triggers, how to tell if an ability is automated (the green ✓ badge in Monster Creator).
- `###` Flanking Checker — stub
- `###` Countdown Dice Auto-Roller — stub
- `###` Morale Check — stub (cross-linked from `exploration.md` encounter section)
- `###` Animation FX — stub (points to the config window; full config reference lives in `docs/dev/`)
- `###` Chat Dice Tooltips — one paragraph, no screenshot

### `docs/exploration.md` — Crawl-phase tools

- `##` **Encounter System** (headliner). Covers:
  - Encounter Check (d6 against threshold, right-click to configure)
  - Encounter Roller (Build Table tab, Browse NPC tab with filters by name / creature type / TL, Roll Tables tab, Mutator tab)
  - Integration with Morale + Distance
- `##` **Monster Creator** (headliner). Covers:
  - Build from scratch (identity, stats, movement, damage immunities, weaknesses, status immunities, actions, abilities, description sections)
  - Mutate existing bestiary entries (absorbs the Monster Mutator feature)
  - Quick-Pick ability templates with automation status badges
- `##` **Light Tracker** (headliner). Covers:
  - 12 source types table (Torch, Lantern Hooded, Bullseye, candles, Sunrod, etc.)
  - Burn duration (1hr / 6 shifts) and the real-time setting
  - Lantern fuel system
  - Drop lights on canvas, Token HUD pickup
  - Party token handling
- `###` Trap Builder — stub

### `docs/crafting-loot.md` — Item generation & distribution

- **Intro paragraph: Forge & Loot Panel orientation.** Bullet list: left-click opens the picker (Relic Forge / Scroll Forge / Loot Manager / Session Recap / Loot Generator), right-click opens quick settings. Not a feature section.
- `##` **Loot Generator** (headliner). Covers:
  - Built-in core tables (Levels 1-10)
  - Custom tables
  - Compendium item creation on roll
  - "Give to Player" chat buttons
  - Absorbs Loot Manager (auto-drops from NPC defeat + drop chance configuration)
- `##` **Relic Forge** (headliner). Custom equipment with relic powers.
- `##` **Spell Scroll Forge** (headliner). Working spell scrolls from compendium spells, consumable with no mana cost / no cast check.
- `##` **Merchant Shop** (headliner). Compendium inventory mode + NPC actor inventory mode, gamble-off-loot-tables mechanic.
- `###` Inventory System (QoL) — auto-stack, qty badges, zero-slot pooling, weightless flag
- `###` Party Inventory — side-by-side loot redistribution
- `###` Item Drops — canvas drop/pickup

### `docs/session-tracking.md` — Cross-session data

- `##` **Session Recap** (headliner). Covers:
  - Overview tab (duration, combats, kills, damage, XP)
  - Combat tab (per-encounter breakdowns, player stats table)
  - Loot tab (reverse-chronological log)
  - XP tab (per-player awards, question breakdowns)
  - History tab (past sessions, delete, reload)
  - Discord export (markdown copy)
  - `!recap` chat command
  - Damage Log module integration note
- `###` XP Counter Patch — stub

### `docs/player-quickref.md` — Player cheatsheet

Kept as-is with a light refresh pass — verify all keybinds still accurate, update any stale feature references, add a "See also" pointer to the GM guide for features players want to read about.

## Per-Feature Template

**Headliners (`##` sections):**

```markdown
## Feature Name

> One-line summary.

![feature in action](assets/feature-name.gif)

### What it does

One to two paragraphs of plain prose. What a GM uses it for, what it replaces or automates.

### How to use

1. Step one.
2. Step two.
3. Step three.

### Settings

| Setting | Effect | Default |
|---|---|---|
| `settingKey` | What it controls | value |

### Tips & Gotchas

- Point.
- Point.
```

Target: **600-900 words** per headliner, including gif and tables. One gif or high-value screenshot required per headliner.

**Mini-headliner** (only for NPC Abilities in combat.md):

Same template, but "How to use" can be replaced with an ability-by-ability table. Target 300-400 words.

**Stubs (`###` sections):**

```markdown
### Feature Name

Two to four sentences: what it is, what it does, what setting controls it.
Optionally a single screenshot thumbnail. No subheaders inside.
```

Target: **80-150 words** per stub.

## Execution Plan — Headliner-First

**Phase order for writing:**

1. **Scaffolding.** Create the five new guide files with the template structure and headers for every section. Write the README's non-feature scaffolding (pitch, install, links). Move existing reference files into `docs/dev/`. Delete stale alchemist-cookbook content. Remove stale settings row. Commit.
2. **Headliners.** Write the 10 flagship sections to full depth (text only; gif slots stay empty with `[gif placeholder]`). Each can be written independently; they don't depend on each other. Order within this phase doesn't matter — good candidates to parallelize.
3. **NPC Abilities mini-headliner.** Write to ~300-400 words with the ability table.
4. **Stubs.** Fill in every `###` section with 80-150 words. Fast pass.
5. **README hero content.** Write the headline features grid referring into the completed guide files. Gif slots stay empty.
6. **Player quickref refresh.** Light pass — verify keybinds, update cross-references.
7. **CLAUDE.md update.** One-paragraph addition about the docs structure split.

**Gap between phase 5 and release:** sub-project 2 (visual assets) captures the gifs, then embeds them in the `[gif placeholder]` slots. Sub-project 3 (Foundry submission) begins when sub-project 2 completes.

This spec does NOT block on sub-project 2. All text can ship with placeholders, and gifs backfill. If release timeline pressure forces it, text-only docs with screenshots-only (no gifs) is a viable v1.

## Headliner List

1. Crawl Strip (composite — Strip + Movement + Rollback + Combat Dropdown + HP/stats)
2. Encounter System (Check + Roller + Browse NPC)
3. Monster Creator (build + mutate)
4. Light Tracker
5. Loot Generator (+ Loot Manager)
6. Relic Forge
7. Spell Scroll Forge
8. Merchant Shop
9. Session Recap
10. NPC Abilities (mini-headliner)

## Stub List

Rollback Movement (folded into Strip headliner), Crawl Clock, Rest & Breather, Flanking Checker, Countdown Dice Auto-Roller, Morale Check, Animation FX, Chat Dice Tooltips, Trap Builder, Inventory System, Party Inventory, Item Drops, XP Counter Patch.

## Explicitly Out of This Docs Pass

- **Item Sequencer Cone Patch** — not documented. Code left alone.
- **Forge & Loot Panel** and **Crawl Bar** — orientation paragraphs only, no feature section. They're UI shells that host other features.

## Open Follow-ups

- Sub-project 2 spec (visual assets pipeline) will specify gif length, encoding, file-size budget, recording tools, and embedding conventions. It will consume the `[gif placeholder]` markers left by this spec.
- Sub-project 3 spec (Foundry registry submission) will consume the README and guide files produced here.
- Any feature gaps uncovered while writing docs (e.g., "the actual behavior differs from CLAUDE.md") get flagged as separate cleanup tasks, not handled inline during doc writing.
