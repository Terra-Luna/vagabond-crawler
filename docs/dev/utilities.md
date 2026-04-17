# Utilities — Technical Reference

Module: `vagabond-crawler`
System: Vagabond v4.x (Foundry VTT v13)

---

## Architecture

| File | Role |
|---|---|
| `scripts/vagabond-crawler.mjs` | Main entry point — settings registration, hook wiring, module API |
| `scripts/dialog-helpers.mjs` | ApplicationV2-compatible dialog wrappers |
| `scripts/icons.mjs` | Centralized icon registry |

---

## Main Entry Point (`vagabond-crawler.mjs`)

### Settings

All settings are registered in the `init` hook:

| Setting | Scope | Config | Type | Default | Description |
|---|---|---|---|---|---|
| `encounterTableUuid` | world | hidden | String | `""` | Active encounter table UUID |
| `timePassesMinutes` | world | visible | Number | `10` | Default minutes per Time Passes click |
| `crawlState` | world | hidden | Object | (inactive) | Full crawl state persistence |
| `clockConfig` | world | hidden | Object | `{size:"S", defaultPosition:"bottom-left"}` | Clock size/position |
| `encounterRollGMOnly` | world | visible | Boolean | `true` | Whisper encounter rolls to GM |
| `encounterThreshold` | world | hidden | Number | `1` | N-in-6 encounter chance |
| `excludedTableFolders` | world | hidden | String | `"[]"` | Hidden table folder IDs |
| `hideNpcNames` | world | visible | Boolean | `false` | Remove NPC names from strip |
| `autoRemoveDefeated` | world | visible | Boolean | `false` | Hide defeated tokens from strip |
| `npcActionMenu` | world | visible | Boolean | `true` | Show hover action menu on cards |
| `flankingEnabled` | world | visible | Boolean | `true` | Auto-flanking detection |
| `enforceCrawlMovement` | world | visible | Boolean | `true` | Block movement beyond crawl speed |
| `realtimeTracking` | world | visible | Boolean | `false` | Real-time light burn |

### Ready Hook Initialization Order

1. Expose `game.vagabondCrawler` debug namespace
2. `CrawlState.restore()` — restore persisted crawl
3. `CrawlBar.mount()` (GM only)
4. `CrawlStrip.mount()` (all users)
5. `MovementTracker.init()`
6. `MoraleChecker.init()`
7. `FlankingChecker.init()`
8. `AlchemyCookbook.init()` + all alchemical hooks (if enabled)
9. `registerMagicWardHook()`
10. `registerChatTooltips()`
11. `LightTracker.init()` + real-time engine (if enabled)
12. `registerConsumableContextMenu()`
13. Expose `mod.api` for macros

### Module API

Available via `game.modules.get('vagabond-crawler').api`:

| Method | Description |
|---|---|
| `populateAlchemicalFolder()` | Create items for all alchemical effects in a world folder |
| `useConsumable(actor, item)` | Programmatically use a consumable item |

### Debug Namespace

Available via `game.vagabondCrawler`:

| Property | Object |
|---|---|
| `state` | CrawlState |
| `bar` | CrawlBar |
| `strip` | CrawlStrip |
| `movement` | MovementTracker |
| `encounter` | EncounterTools |
| `morale` | MoraleChecker |
| `rest` | RestBreather |
| `light` | LightTracker |
| `clock` | CrawlClock |
| `flanking` | FlankingChecker |
| `alchemy` | AlchemyCookbook |
| `debugCombat()` | Dump all combatant data |
| `debugSpeed()` | Dump selected token's speed data |

### Socket Handler

Second `ready` hook registers socket listener for:
- `syncState` → `CrawlState.applySync(data.state)` — propagates crawl state to non-GM clients
- `syncLights` → `LightTracker.applySync(data.lights)` — light state sync

### Consumable Context Menu

`registerConsumableContextMenu()` hooks into `renderApplicationV2` to inject a flask "Use" button on inventory items that have a matching consumable effect. Clicking uses the item through `useConsumable()` and re-renders the sheet.

---

## Dialog Helpers (`dialog-helpers.mjs`)

Wraps Foundry v13's `DialogV2` to replace deprecated `Dialog.confirm()` and `Dialog.wait()`:

### `confirmDialog({ title, content })`

Returns `true` if confirmed, `false`/`null` if cancelled. Uses `DialogV2.confirm()`.

### `waitDialog({ title, content, buttons, defaultButton, width })`

Multi-button dialog. `buttons` is an array of `{ label, icon, value }`. Returns the clicked button's `value`, or `null` if closed. Uses `DialogV2.wait()`.

---

## Icons (`icons.mjs`)

Centralized registry of every icon used in the module. All HTML snippets are defined in one place so swapping any icon requires editing only this file.

### Format

```js
FontAwesome:  `<i class="fas fa-icon-name"></i>`
Custom SVG:   `<img class="vcb-icon" src="${P}/my-icon.svg" alt="" />`
```

SVG files are stored in `modules/vagabond-crawler/icons/`.

### Icon Categories

| Category | Icons |
|---|---|
| Crawl Bar | startCrawl, heroes, gm, nextTurn, addTokens, encCheck, encounter, tableScroll, lights, combat, rest, close, play, clock |
| Clock Menu | rollBack, configure |
| Encounter Roller | diceD20, save, hammer, table, star, dice, comment, mapPin, folderMinus, clearX |
| Strip | shamrock, walking, skull, gmCrown, turnArrow, activate, deactivate, prevRound, nextRound |
| Movement | rollbackMove |
| Chat | encounterChat |

### Custom SVGs

| File | Usage |
|---|---|
| `icons/dragon-head.svg` | (Available, not currently referenced) |
| `icons/light-sabers.svg` | Encounter button + encounter chat messages |
| `icons/shamrock.svg` | Luck pill on strip cards |
