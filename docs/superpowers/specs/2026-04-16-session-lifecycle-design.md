# Session Lifecycle & History — Design Spec

**Date:** 2026-04-16
**Status:** Approved
**Extends:** Session Recap (2026-04-16-session-recap-design.md)

## Goal

Add managed session lifecycle (start/pause/end/save) tied to crawl start/stop, plus a persistent session history that can be reviewed, exported, and deleted.

## Session State Machine

```
inactive → active → paused → active → saved (→ history)
                  → saved (→ history)
                  → discarded (→ inactive)
```

States:
- **inactive** — no active session, recap data empty
- **active** — tracking events (loot, combat, rolls, XP)
- **paused** — data preserved but clock stopped, waiting for next crawl
- **saved** — snapshot moved to history, active data cleared

## Crawl Start Popup

When `CrawlState.start()` fires, show a `DialogV2` popup:

| Button | Condition | Action |
|---|---|---|
| **Start New Session** | Always shown | Clear active data, set `sessionStart = Date.now()`, state → `active` |
| **Continue Session** | Only if state is `paused` | State → `active`, keep existing data, no clock reset |
| **No Tracking** | Always shown | State stays `inactive`, no recap tracking |

If the popup is dismissed (X button), treat as "No Tracking".

## Crawl End Popup

When `CrawlState.stop()` fires and state is `active` or `paused`, show a `DialogV2` popup:

| Button | Action |
|---|---|
| **End & Save** | Snapshot data to `sessionHistory`, clear active data, state → `inactive` |
| **Pause Session** | State → `paused`, data preserved for next crawl |
| **Discard** | Clear data without saving, state → `inactive` |

If state is `inactive` when crawl ends, no popup shown.

## Session History

### Setting

New world setting `sessionHistory` — array of saved session objects:

```js
[
  {
    id: "session-1713225600000",     // "session-" + Date.now() for uniqueness
    name: "2026.04.16 Session",      // auto-generated
    startTime: 1713225600000,
    endTime: 1713240000000,
    data: {                           // full snapshot of sessionRecap data
      loot: [...],
      xp: [...],
      combats: [...],
      playerStats: {...}
    }
  }
]
```

### Auto-naming

Format: `YYYY.MM.DD Session`. If another saved session already has that name, append ` 2`, ` 3`, etc.

Uses the `sessionStart` timestamp for the date, not the current date.

### CRUD

- **Save:** `SessionRecap.saveToHistory()` — snapshots active data, pushes to history, clears active
- **List:** `SessionRecap.getHistory()` — returns the full array
- **Delete:** `SessionRecap.deleteFromHistory(id)` — removes by ID, with confirm dialog in UI
- **View:** Load a saved session's data into the recap app in read-only mode

## Data Model Changes

### `sessionRecap` setting — add `sessionState`

```js
{
  sessionState: "inactive",   // "inactive" | "active" | "paused"
  sessionStart: null,
  loot: [],
  xp: [],
  combats: [],
  playerStats: {},
}
```

### New setting: `sessionHistory`

```js
[]  // array of saved session objects (see above)
```

## SessionRecapApp Changes

### New "History" tab

5th tab in the tab bar, after XP. Shows:

- List of saved sessions, most recent first
- Each entry displays: name, duration, enemy count, player count
- Click entry to view in read-only mode
- Delete button (trash icon) per entry — GM only, with confirm dialog

### Read-only viewing mode

When a saved session is selected from history:

- The Overview, Combat, Loot, XP tabs load the saved session's data instead of active data
- A banner at the top shows: "Viewing: 2026.04.16 Session" with a "Back to Current" button
- "Copy for Discord" exports the viewed saved session
- "Clear Session" button hidden while viewing history

### Back to current

Clicking "Back to Current" (or switching to the History tab) returns to showing active session data.

## Capture Gating

All existing capture hooks (combat, damage, rolls) must check `sessionState === "active"` before logging. When state is `inactive` or `paused`, events are silently skipped.

This applies to:
- `logLoot()` — gate on active state
- `logXp()` — gate on active state
- `_initCombatHooks()` combat start/end hooks
- `_initRollHooks()` roll capture
- Damage-log chat message hook

Exception: `logLoot` and `logXp` should still work when called directly (they're the public API). The gating happens at the hook/capture level, not the logging method level. Actually — the simplest approach: gate in the hooks that auto-capture (combat, damage, rolls), but let `logLoot`/`logXp` always work since they're explicitly called by game logic that already decided to log.

Revised: Gate auto-capture hooks only. `logLoot`, `logXp`, `logCombat`, `updatePlayerStat` always work when called — the caller decides.

## File Changes

| File | Change |
|---|---|
| `scripts/session-recap.mjs` | Add `sessionState` to default data, add lifecycle methods (startSession, pauseSession, endAndSave, discardSession), add history CRUD, add crawl hooks, gate auto-capture on active state |
| `scripts/session-recap-app.mjs` | Add History tab, read-only view mode, viewing banner, delete buttons |
| `templates/session-recap.hbs` | Add History tab markup, viewing banner, conditional footer |
| `styles/vagabond-crawler.css` | History list entry styles, viewing banner styles |

## Non-Goals

- No session renaming (auto-name only)
- No session merging
- No export/import of session files
- No cross-world session sharing
