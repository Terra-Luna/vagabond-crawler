# Crawl System — Technical Reference

Module: `vagabond-crawler`
System: Vagabond v4.x (Foundry VTT v13)

---

## Architecture

The crawl system spans five files:

| File | Role |
|---|---|
| `scripts/crawl-state.mjs` | Single source of truth — state object, persistence, socket sync |
| `scripts/crawl-strip.mjs` | Top-of-screen combatant strip — portraits, HP bars, effects, turn indicators |
| `scripts/crawl-bar.mjs` | Bottom bar (GM only) — phase controls, encounter tools, clock, combat/rest buttons |
| `scripts/crawl-clock.mjs` | 6-segment progress clock via Vagabond's ProgressClock API |
| `scripts/movement-tracker.mjs` | Movement budget enforcement, ruler coloring, rollback |

---

## Crawl State

Persisted to the `crawlState` world setting and broadcast to all clients via socket (`module.vagabond-crawler` → `syncState`).

### State Shape

```
active      : boolean   — is crawl mode on?
phase       : "heroes" | "gm"
members     : Array<{ id, name, img, type, actorId?, tokenId? }>
turnCount   : number    — full crawl turns completed
elapsedMins : number    — total minutes elapsed
paused      : boolean   — true during active Foundry combat
clockId     : string|null — JournalEntry ID of the crawl progress clock
clockFilled : number    — saved filled count (persists across combat)
```

### Member Types

| type | When present |
|---|---|
| `"player"` | Always — player character tokens |
| `"gm"` | During crawl phases (removed during combat) |
| `"npc"` | During combat only — auto-added from combat tracker |

### Turn Structure

Two phases per crawl turn: **Heroes → GM → Heroes (new turn) → GM → ...**

- `nextTurn()`: heroes → gm (same turn), gm → heroes (increments `turnCount`, triggers clock advance + encounter check + movement reset + light burn)
- Combat pauses the crawl. When combat ends, a dialog prompts to resume. Combat NPCs (`source: "combat"`) are auto-removed on resume.

### Lifecycle

```
start()  → active=true, phase="heroes", adds GM member
pause()  → paused=true (combat started)
resume() → paused=false, re-adds GM if missing, resets movement
end()    → resets all state, cleans up clock
```

---

## Crawl Strip

Mounted into `#interface` as a `div#vagabond-crawler-strip`. Renders combatant cards with:

- **Portrait** with token image
- **HP bar** with color thresholds (ok > 75%, mid > 50%, low > 25%, critical > 0%, dead = 0)
- **Luck pill** and **movement pill** (players only)
- **Active effects row** — icons for all non-disabled effects with duration info
- **Turn badge** — chevron on the current combatant
- **Defeated overlay** — skull icon (or hidden if `autoRemoveDefeated` setting)
- **GM crown** on GM member cards

### Combat Mode Behavior

- Cards sorted by combat tracker turn order
- Heroes/NPCs swap sides when all heroes have acted (activations.value === 0)
- Combat controls replace the turn counter: prev/next round, prev/next turn
- Activate/End Turn buttons on each card (GM only)
- Action menu tab strips appear below cards (see combat-tools.md)

### Responsive Sizing

`_sizeCards()` calculates card width based on available strip width, capping at 110×130px and scaling down proportionally when many combatants are present.

### Auto-Defeat

Hooks on `updateActor` and `updateToken` detect HP ≤ 0 and automatically:
1. Mark the combatant as defeated
2. Apply the "dead" status overlay on the token

Handles both linked actors and unlinked tokens (synthetic actors).

### Events

- **Click** card → select and pan to token
- **Double-click** card → open actor sheet
- **Shift+click** → add to selection without deselecting others
- **Remove button** (×) → GM only, removes member from crawl

---

## Crawl Bar

Mounted as the last child of `#ui-middle`. GM only.

### States

**Inactive** — Single "Start Crawl" button.

**Active (Crawl)** — Full control bar:
- Phase badge (Heroes Turn / GM Turn)
- Next Turn button
- Add Tokens button
- Crawl Clock widget (left-click: advance, right-click: configure/rollback)
- Encounter Check button (left-click: roll, right-click: threshold popover 1-5 in 6)
- Encounter Roller button
- RollTable drop zone (drag-and-drop a RollTable to set as active)
- Lights button → opens Light Tracker
- Combat / Rest / End buttons

**Active (Combat)** — Simplified:
- "Combat Active" badge
- Begin Encounter (if combat not started) / End Encounter (if started)
- End Crawl button

### Token Management

"Add Tokens" takes all currently selected canvas tokens and adds them as crawl members. Player tokens get movement reset and position snapshot.

### Combat Flow

1. "Combat" button → `CrawlState.pause()`, creates/activates Foundry Combat, adds all crawl player members + selected tokens as combatants
2. `createCombatant` hook → any token added to the combat tracker is auto-synced to crawl strip
3. "End Encounter" → `combat.endCombat()` → `deleteCombat` hook fires → removes combat NPCs, re-adds GM, prompts resume dialog

### Drag-and-Drop

The bar accepts `RollTable` drops onto the table zone. The table UUID is persisted in the `encounterTableUuid` setting.

---

## Crawl Clock

Wraps the Vagabond system's `ProgressClock` API (JournalEntry-based).

### Configuration

- 6 segments (hardcoded constant `CRAWL_CLOCK_SEGMENTS`)
- Size and position persist in the `clockConfig` setting across deletion/combat/new crawls
- Created via `CrawlClock.ensure()`, stored as JournalEntry with `flags.vagabond.progressClock`

### Operations

| Method | Behavior |
|---|---|
| `advance("scene")` | +1 segment, chat notification, encounter check, reset if full |
| `rollBack()` | -1 segment (min 0), chat notification, no encounter check |
| `reset()` | Set to 0, chat notification |
| `hide()` | Save filled count, delete journal (used when combat starts) |
| `show()` | Recreate clock, restore saved filled count (used when combat ends) |

### Clock Config Persistence

`updateJournalEntry` hook captures size/position changes from the system's ProgressClockConfig dialog and saves them to the `clockConfig` setting.

---

## Movement Tracker

### Custom Ruler

Registers `VCSTokenRuler` as `CONFIG.Token.rulerClass` — a subclass of Foundry's `TokenRuler` that:

- Colors segments **green** (within budget) or **red** (over budget)
- Adds remaining-ft labels to waypoints (e.g., "15ft left" or "Rush: -10ft")
- Highlights grid squares red when over budget
- Walks the waypoint `previous` linked list, counting only "pending" waypoints to avoid double-counting passed costs

Rulers are installed on all existing tokens via `_installRulers()` and on canvas ready.

### Speed Model

| Mode | Base Speed | Hard Cap |
|---|---|---|
| Crawl | `actor.system.speed.crawl` | Same as base (no Rush) |
| Combat | `actor.system.speed.base` | 2× base (move + Rush action) |

Movement remaining is stored as `actor.flags.vagabond-crawler.moveRemaining`.

### Enforcement

`preUpdateToken` hook:
1. Computes Chebyshev distance of the move in feet
2. Checks against remaining budget (crawl) or remaining + base speed (combat Rush)
3. Returns `false` to block the move if over limit
4. Warns the user with remaining budget info

`updateToken` hook:
- Deducts the distance from `moveRemaining` after a successful move
- Combat allows negative values (Rush territory), crawl floors at 0
- Clears ruler highlight after move completes

### Rollback

GM-only button on Token HUD:
1. Teleports token back to `_turnStartPos[tokenId]` (bypasses wall collision)
2. Refunds full turn movement budget

### Reset

`resetAll()` fires on:
- Phase change (heroes → gm → heroes)
- Combat start
- Combat turn/round changes

Resets all player members to full base speed and snapshots positions.

### Settings

| Setting | Default | Description |
|---|---|---|
| `enforceCrawlMovement` | `true` | Block tokens from exceeding crawl speed in Heroes phase |
