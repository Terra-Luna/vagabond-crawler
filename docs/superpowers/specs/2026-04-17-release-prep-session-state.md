# Release Prep Session State — Resume Notes

**Paused:** 2026-04-17
**Status:** Sub-project 1 shipped (+ review fixes applied). Sub-project 2 in brainstorming (Q1-Q4 answered, Q5 open). Sub-project 3 not yet started.

## Resume Instructions

When you come back, paste this into a new Claude session:

> I'm resuming release prep for the vagabond-crawler Foundry module. Read `docs/superpowers/specs/2026-04-17-release-prep-session-state.md` for the full state, then continue brainstorming sub-project 2 by asking me Question 5 (recording environment + workflow).

Claude will read this file, catch up on context, and jump straight to Q5.

## Release Prep Sub-project Overview

Three sub-projects:

1. **Documentation content & structure** — SHIPPED.
2. **Visual assets pipeline** — IN PROGRESS (Q1-Q4 done, Q5 open).
3. **Foundry registry submission** — NOT STARTED.

Dependency order: (1) informs what (2) captures. (1) + (2) feed (3).

---

## Sub-project 1 — Documentation — SHIPPED

**Spec:** `docs/superpowers/specs/2026-04-17-release-docs-design.md`
**Plan:** `docs/superpowers/plans/2026-04-17-release-docs.md` (+ `.tasks.json`)

**What shipped (all on `main`, 22 commits):**
- Dual-track docs structure: `docs/*.md` (GM-facing guide) + `docs/dev/*.md` (contributor reference).
- 5 new guide files with 10 headliner sections + 1 mini-headliner + ~13 stubs:
  - `docs/crawl-loop.md` (Crawl Strip composite headliner covering Movement + Rollback + Combat Dropdown + HP/Stats; stubs for Crawl Clock, Rest & Breather)
  - `docs/combat.md` (NPC Abilities mini-headliner; stubs for Flanking, Countdown Dice, Morale, Animation FX, Chat Dice Tooltips)
  - `docs/exploration.md` (Encounter System, Monster Creator, Light Tracker headliners; stub for Trap Builder)
  - `docs/crafting-loot.md` (Loot Generator, Relic Forge, Spell Scroll Forge, Merchant Shop headliners; stubs for Inventory System, Party Inventory, Item Drops)
  - `docs/session-tracking.md` (Session Recap headliner; stub for XP Counter)
- `docs/player-quickref.md` refreshed.
- README trimmed from 321 lines → landing-page shell (~63 lines) with headline features grid.
- `docs/dev/` populated with the 4 existing technical-reference files (moved from top level).
- `docs/alchemist-cookbook.md` deleted (stale — alchemy moved to Character Enhancer module).
- CLAUDE.md updated with a Documentation section noting the dual-track split.

**Quality review verdict:** APPROVED WITH MINOR FIXES. 5 fixes applied in commit `60ab131`.

**Gif placeholders are in place** — every headliner has a `<!-- gif: docs/assets/<name>.gif -->` HTML comment waiting for sub-project 2 to replace with real `![]()` embeds.

**Git state at pause:** `main` is 1 commit ahead of origin/main (the `60ab131` fix commit). Push when convenient — no rush.

---

## Sub-project 2 — Visual Assets Pipeline — IN PROGRESS

### Decisions locked in (Q1-Q4)

| # | Question | Answer |
|---|---|---|
| Q1 | Recording tool | **ShareX** |
| Q2 | Format + hosting | **All gifs, direct commit to `docs/assets/`** (plus static screenshots). No HTML video tags (Foundry package listing may not render them). |
| Q3 | Size budget | **Tight** — headliner gifs ≤2MB, hero gifs ≤3MB, screenshots <500KB. Target: 480px wide, 10-12fps, 3-5s loops, palette-optimized. Total repo growth ~30MB. |
| Q4 | Coverage model | **Per-feature motion/static judgment** (not per-tier). See asset inventory below. |

### Asset inventory (~24 total, ~29MB)

**Hero gifs (README landing, 4):**
- `crawl-strip-combat.gif` — Strip + Movement during combat (colored ruler, HP/status updates)
- `encounter-roller.gif` — Browse NPC → drag → save table → roll
- `light-tracker.gif` — real-time burn animation
- `session-recap.gif` — flipping through the 5 tabs

**Headliner gifs (7, in-guide):**
- `crawl-strip.gif`, `encounter-system.gif`, `monster-creator.gif`, `light-tracker.gif`, `loot-generator.gif`, `merchant-shop.gif` (gamble mechanic specifically), `session-recap.gif`

**Headliner stills (3, in-guide) — features where end-state matters more than flow:**
- `relic-forge.png` — forge window composed
- `spell-scroll-forge.png` — forge window with spell configured
- `npc-abilities.png` — single ability firing in a chat card (e.g., Magic Ward surcharge)

**Stub gifs (2) — small motion clips:**
- `crawl-clock.gif` — one segment tick
- `countdown-dice.gif` — d6 shrinking to d4

**Stub stills (8):**
- `rest-breather.png`, `flanking.png`, `morale.png`, `animation-fx.png`, `trap-builder.png`, `inventory-system.png`, `party-inventory.png`, `xp-counter.png`

**Text-only stubs (no asset):**
- Chat Dice Tooltips
- Rollback Movement (captured inside Crawl Strip headliner gif)
- Item Drops (captured inside Loot Generator headliner gif)

### Who records what

- **You (user):** all gif recordings via ShareX, and the static screenshots. You control the live Foundry state.
- **Claude (me):** will provide ShareX profile settings, a demo-world prep list, a per-asset recording brief (exact scene / action / duration), post-capture optimization if any asset blows budget, and placeholder-to-embed replacement commits once assets land in `docs/assets/`.

### Open — Q5

**Question 5 is: Recording environment + workflow. How do you want to sequence the recording sessions?**

Options (my recommendation: **B**):

- **A. Use your existing test world as-is.** Fast start, no prep. Downside: characters/NPCs/items will reflect whatever you happen to have; state-per-feature prep needed per session.
- **B. One dedicated "Vagabond Crawler Demo" world with curated state.** 1-2 hours of upfront prep to build themed PCs, a curated NPC roster showcasing automation badges, 1-2 maps with regions, stocked inventories. Every future recording session is faster and the output looks more polished. **Recommended.**
- **C. Multiple scenario-specific worlds** (one per recording context). Most polish, 3x the prep cost.

Plus a secondary question I proposed — **4-session workflow**:

- **Session 1: Static-first pass** — all 14 static assets in one sitting.
- **Session 2: Simple motion** — the 2 stub gifs + easier headliners.
- **Session 3: Feature flow gifs** — 7 headliner gifs + tricky ones.
- **Session 4: Hero gifs** — 4 README hero gifs, higher polish bar.

After each session, Claude wires up the embeds in markdown.

### Remaining sub-project 2 work after Q5 is answered

1. Write full sub-project 2 spec at `docs/superpowers/specs/2026-04-17-visual-assets-design.md`.
2. Spec self-review + user review.
3. Invoke `writing-plans` to produce the implementation plan: ShareX profile setup, demo-world prep checklist, per-asset recording brief, placeholder-replacement tasks, optimization sub-tasks.

---

## Sub-project 3 — Foundry Registry Submission — NOT STARTED

Notes from sub-project 2 research that informs sub-project 3:

- **Foundry's package listing has its own description field**, authored via the package admin form. It's *not* pulled from the GitHub README.
- **Foundry supports animated gifs inline** (verified against `foundryvtt.com/packages/dice-so-nice`), referenced by external URL (e.g., `https://raw.githubusercontent.com/<user>/<repo>/main/docs/assets/<file>.gif`).
- **Foundry does NOT render HTML video tags** (verified). Gifs only.
- **No YouTube embeds observed** on the Foundry listing pages surveyed.

When we start sub-project 3, it will involve:
- Writing a Foundry-specific description (tone/length different from README?).
- Picking which gifs/stills to embed via raw GitHub URLs.
- Navigating the Foundry package admin submission flow.
- Review cycle for first-time submissions.
- Cover image / gallery images for the package listing.

---

## Git state at pause

- `main` branch, `60ab131` HEAD (1 commit ahead of origin after the review fixes).
- 20 task commits + 1 chore commit + 1 fix commit visible in `git log`.
- `.tasks.json` file for sub-project 1's plan is fully marked completed.
- No uncommitted changes anticipated beyond this resume doc itself (which will be committed as part of the pause).
- Several unrelated untracked files (`.claude/`, `.mcp.json`, `data/`, `module.zip`) — ignore, they're your local-only working files.

## Quick tool hints for when you resume

- Recording tool: **ShareX** (free, Windows). Install if not already present.
- Optimizer (optional): **gifsicle** for palette reduction if a gif blows budget. `choco install gifsicle` or download binary.
- Preview: GitHub renders gifs natively in markdown files — after wiring up an embed, opening the repo's `docs/combat.md` etc. on github.com will show the gif.
