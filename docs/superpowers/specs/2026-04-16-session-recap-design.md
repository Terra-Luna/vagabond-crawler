# Session Recap Log — Design Spec

**Date:** 2026-04-16
**Status:** Approved
**Replaces:** LootTrackerApp (UI only — LootTracker data API preserved)

## Goal

A single ApplicationV2 window that tracks XP, loot, combat stats, and roll stats across an entire session. Broken down by player, exportable as Discord-friendly markdown, clearable between sessions. Absorbs the existing Loot Tracker UI while preserving its public API.

## Soft Dependency

The `damage-log` module provides structured HP change data via chat message flags. Session Recap reads these for damage dealt/taken and kill attribution.

- **If active:** full combat stats (damage, kills)
- **If missing:** combat tab shows encounter list and roll stats only, with a note that damage-log is needed for damage/kill tracking

`module.json` declares this via `relationships.recommends`:
```json
"relationships": {
  "recommends": [
    { "id": "damage-log", "type": "module", "reason": "Enables combat damage and kill tracking in Session Recap" }
  ]
}
```

## Data Model

Single world setting: `sessionRecap`. Shape:

```js
{
  sessionStart: null,       // timestamp — set on first event or clear

  loot: [                   // same shape as current lootLog entries
    { player, source, type, detail, img, timestamp, time }
  ],

  xp: [
    {
      player,               // character name
      actorId,
      questions: [           // snapshot of checked questions
        { label, xp, count } // e.g. "Defeat a Boss", 1xp, count 2
      ],
      totalXp,
      timestamp, time
    }
  ],

  combats: [
    {
      id,                    // combat document ID
      rounds,                // total rounds
      startTime,             // Date.now() at createCombat/combatStart
      endTime,               // Date.now() at deleteCombat
      enemies: [
        { name, defeated, killedBy }  // killedBy = character name or null
      ],
      participants: [
        { name, actorId }
      ]
    }
  ],

  playerStats: {
    [actorId]: {
      name,
      attacks: { hits: 0, misses: 0, nat20s: 0, nat1s: 0 },
      saves:   { passes: 0, fails: 0, nat20s: 0, nat1s: 0 },
      rolls:   { total: 0, sum: 0 },   // for avg d20
      damageDealt: 0,
      damageTaken: 0,
      kills: 0
    }
  }
}
```

## Data Capture

### Loot

No change to callers. `LootTracker.log()`, `logClaim()`, `logPickup()` write to `sessionRecap.loot` instead of the old `lootLog` setting. First-run migration copies any existing `lootLog` data.

### XP

The `XpCounterPatch` (already built) calls `SessionRecap.logXp()` from the patched `awardXP` handler. Passes: player name, actor ID, question snapshot with counts, total XP.

### Combat Encounters

- `createCombat` or `combatStart` hook: record `startTime`, snapshot participants (PCs from combatants with friendly disposition).
- `deleteCombat` hook: record `endTime`, `rounds`, build enemies list with defeated status and kill credit from the transient kill map.

### Damage and Kill Attribution (requires damage-log)

- `createChatMessage` hook: check `message.flags["damage-log"]`
- Each flag contains `changes: [{ id, name, old, new, diff }]`
- `message.speaker` identifies the **actor whose HP changed** (the target), not the attacker
- To attribute damage dealt: cross-reference with `game.combat?.combatant?.actor` (whose turn it is) as the source. This is imperfect for reactions/opportunity attacks but covers the common case.
- `diff < 0` on NPC actor during combat: attribute `|diff|` as `damageDealt` to the current-turn PC
- `diff < 0` on PC actor: record `|diff|` as `damageTaken` on the PC identified by `message.speaker`
- When `new === 0` on NPC: the current-turn PC gets kill credit, stored in transient `_killMap[tokenId] = characterName` and written to the combat entry on `deleteCombat`
- Gate: `if (!game.modules.get("damage-log")?.active) return;`

### Roll Stats

Wrap `VagabondRollBuilder.buildAndEvaluateD20WithRollData` in `Hooks.once("setup")` (same pattern as `registerEarlyRollBuilderWrap` in npc-abilities). After roll resolves:

- Determine roll type from context (attack vs save)
- Extract raw d20 value, check for nat 20 / nat 1
- Determine hit/miss or pass/fail from result
- Attribute to the rolling actor's `playerStats` entry
- Only track rolls from player-owned characters (skip NPC rolls)

### Session Timing

- `sessionStart`: set to `Date.now()` on the first event logged, or when session is cleared
- Combat duration: `startTime`/`endTime` on each combat entry, calculated as `endTime - startTime`
- Session duration: `Date.now() - sessionStart`, displayed in Overview and Discord export

## Loot Tracker Absorption

### Preserved (unchanged call sites)

- `LootTracker.log(entry)`
- `LootTracker.logClaim(playerName, sourceName, currency, items)`
- `LootTracker.logPickup(playerName, itemName, itemImg)`

### Changed internally

- `getLog()` → reads `sessionRecap.loot`
- `clearLog()` → removed, replaced by `SessionRecap.clear()` (clears all sections)
- `formatForDiscord()` → removed, replaced by `SessionRecap.formatForDiscord()`
- `open()` → opens `SessionRecapApp` instead of `LootTrackerApp`

### Deleted

- `LootTrackerApp` class
- `templates/loot-tracker.hbs`

### Setting migration

On first `ready`: if `lootLog` setting has data and `sessionRecap.loot` is empty, copy entries over.

## UI: SessionRecapApp

`HandlebarsApplicationMixin(ApplicationV2)` — tabbed window.

- **ID:** `vagabond-crawler-session-recap`
- **Position:** 650w x 550h, resizable
- **Access:** all users (GM and players)

### Tabs

1. **Overview** — dashboard summary
   - Session duration
   - Total enemies defeated, total combats
   - Per-player one-liner: kills, damage dealt/taken, XP earned

2. **Combat** — per-encounter breakdown
   - Each combat as collapsible section: "Encounter #1 — 4 rounds (12m 35s)"
   - Enemies list with defeated status and kill credit
   - Per-player stats table: hits/misses (hit%), nat 20s/1s, avg d20, saves passed/failed, damage dealt/taken, kills
   - If damage-log not active: show encounters and roll stats only, with note about damage-log

3. **Loot** — current loot tracker view
   - Reverse-chronological list with icons, player name, detail, source
   - Same visual layout as current loot-tracker.hbs

4. **XP** — per-player XP awards
   - Each award with question breakdown (label, count, XP)
   - Total XP per player

### Footer (persistent)

- **Copy for Discord** button — exports all sections as markdown
- **Clear Session** button (GM only) — confirm dialog, wipes all data

### Access Points

- CrawlBar tool picker: replaces old loot tracker button with "Session Recap" button
- Chat command: `!recap` — hook `chatMessage` to intercept, opens the window for any user (Foundry doesn't support custom `/` commands for modules; `!` prefix is the standard module pattern)

## Discord Markdown Export

```markdown
# Session Recap
**Duration:** 3h 42m

## Combat
**Encounter 1** — 4 rounds (12m 35s)
- Enemies: Goblin x3, Troll x1
- Defeated: Goblin x3 (Kira x2, Thane x1), Troll (Kira)

**Encounter 2** — 2 rounds (4m 18s)
- Enemies: Bandit x2
- Defeated: Bandit x2 (Kira x1, Lyra x1)

## Player Stats
### Kira
- **Attacks:** 12/18 hit (67%) — 3 nat 20s, 1 nat 1
- **Saves:** 4/5 passed — 1 nat 20
- **Avg d20:** 12.4
- **Damage:** 147 dealt / 52 taken
- **Kills:** 4

### Thane
- **Attacks:** 8/14 hit (57%) — 1 nat 20, 2 nat 1s
- **Saves:** 3/3 passed
- **Avg d20:** 11.1
- **Damage:** 98 dealt / 78 taken
- **Kills:** 1

## Loot
### Kira
- **Currency:** 15g, 3s
- **Items:**
  - Longsword *(from Troll)*
  - Health Potion *(picked up)*

### Thane
- **Currency:** 12g
- **Items:**
  - Shield *(from Bandit)*

## XP
### Kira
- Did you complete a Quest? — x1 = 1 XP
- Did you defeat an Elite/Boss? — x2 = 2 XP
- **Total: 3 XP**

### Thane
- Did you complete a Quest? — x1 = 1 XP
- **Total: 1 XP**
```

Players/sections with no activity are omitted.

## File Plan

| File | Action | Purpose |
|------|--------|---------|
| `scripts/session-recap.mjs` | Create | Singleton data layer + capture hooks |
| `scripts/session-recap-app.mjs` | Create | ApplicationV2 tabbed window |
| `templates/session-recap.hbs` | Create | Tabbed template |
| `templates/loot-tracker.hbs` | Delete | Replaced by session-recap.hbs |
| `scripts/loot-tracker.mjs` | Modify | Remove LootTrackerApp, redirect internals to sessionRecap setting |
| `scripts/xp-counter-patch.mjs` | Modify | Add SessionRecap.logXp() call in awardXP |
| `scripts/vagabond-crawler.mjs` | Modify | Register new setting, init SessionRecap, update CrawlBar reference, add chat command hook |
| `scripts/crawl-bar.mjs` | Modify | Replace loot tracker button with session recap button |
| `styles/vagabond-crawler.css` | Modify | Add session recap tab/table styles |
| `module.json` | Modify | Add relationships.recommends for damage-log |

## Non-Goals

- No per-round breakdown (just per-encounter totals)
- No damage-by-type breakdown (just total dealt/taken)
- No per-enemy damage breakdown
- No spell/ability usage tracking
- No persistent history across sessions (clear and start fresh)
