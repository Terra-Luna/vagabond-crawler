# Vagabond Crawler

Dungeon crawl management module for the **Vagabond RPG** system on Foundry VTT v13+.

## Quick Reference

- **Module ID**: `vagabond-crawler`
- **Entry point**: `scripts/vagabond-crawler.mjs`
- **System dependency**: vagabond v4.1.0+
- **Optional dependency**: vagabond-extras
- **No build step** — raw ES modules (`.mjs`), single CSS file, Handlebars templates

## Architecture

### Subsystem Pattern

Every feature is a **singleton object** (not a class) exported by name, registered on `game.vagabondCrawler`, and initialized in the main entry point:

```js
// Declare
export const FeatureName = {
  _state: null,
  get active() { return this._state?.active ?? false; },
  async init() { /* hook registration, etc. */ },
  render() { /* DOM update */ },
};

// Register in vagabond-crawler.mjs
import { FeatureName } from "./feature-name.mjs";
// Hooks.once("init")  → register settings
// Hooks.once("ready") → game.vagabondCrawler.featureName = FeatureName; FeatureName.init();
```

Exceptions: `EncounterRollerApp`, `AlchemyCookbookApp`, `RelicForgeApp`, `LootManagerApp`, `LootTrackerApp`, `ScrollForgeApp`, `LootGeneratorApp` — these are `ApplicationV2` window classes using `HandlebarsApplicationMixin`.

### State & Sync

- **Persistence**: `game.settings.set(MODULE_ID, key, value)` for world-scoped data
- **Multi-client sync**: GM broadcasts via `game.socket.emit("module.vagabond-crawler", { action, ... })`, clients apply in the socket handler
- **Deep clone** state before persisting or broadcasting: `foundry.utils.deepClone()`
- **Actor flags**: `actor.getFlag(MODULE_ID, key)` / `actor.setFlag(MODULE_ID, key, value)` for per-actor data

### UI Components

Two patterns:

**1. Singleton DOM components** (CrawlBar, CrawlStrip):
- `mount()` — create root element, append to Foundry UI, store as `_el`, call `render()`
- `render()` — rebuild `_el.innerHTML`, then `_bindEvents()`
- `_bindEvents()` — delegate via `[data-action]` attributes
- Guard: `if (!this._el) return;` at top of render

**2. ApplicationV2 windows** (encounter roller, alchemy cookbook, relic forge, loot manager/tracker):
```js
class MyApp extends HandlebarsApplicationMixin(ApplicationV2) {
  static DEFAULT_OPTIONS = { id: "vagabond-crawler-my-app", window: { title: "..." }, position: { width: 700 } };
  static PARTS = { form: { template: "modules/vagabond-crawler/templates/my-app.hbs" } };
  async _prepareContext() { return { /* template data */ }; }
}
```

### Hook Management

- `Hooks.once("init")` — register settings only
- `Hooks.once("ready")` — mount UI, restore state, call `.init()` on subsystems
- `Hooks.on(...)` — continuous listeners; store IDs in `_hookIds` array for cleanup
- Always guard: `if (!game.user.isGM) return;` for GM-only operations

## File Map

| File | Purpose |
|---|---|
| `vagabond-crawler.mjs` | Entry point — settings, ready hook, socket handler, global exposure, inventory patches (auto-stack, qty badges, slot counting, weightless flag, scroll context menu) |
| `crawl-state.mjs` | Single source of truth for crawl mode (active, phase, members, turns, clock) |
| `crawl-bar.mjs` | Bottom GM-only control bar + Forge & Loot tool picker panel |
| `crawl-strip.mjs` | Top HUD strip for all players — portraits, HP, status, NPC action menus. Disposition-based hero/NPC split |
| `movement-tracker.mjs` | TokenRuler subclass — movement budget enforcement (crawl + combat), terrain difficulty, rollback (GM + player via socket) |
| `encounter-tools.mjs` | Encounter check (d6), EncounterRollerApp (table builder, NPC browser, mutator) |
| `monster-mutator.mjs` | 64 mutations with stat recalculation, custom names |
| `mutation-data.mjs` | Mutation definitions and conflict rules |
| `light-tracker.mjs` | Light source burn time, fuel system (lanterns consume oil), 12 light source types, real-time mode, canvas drop/pickup, party token light transfer |
| `morale-checker.mjs` | Auto morale checks on death/half-defeated/solo-half-HP |
| `rest-breather.mjs` | Recovery dialog — breather (ration + heal) and full rest |
| `flanking-checker.mjs` | Auto-apply Vulnerable when 2+ allies adjacent to foe, mirrors outgoingSavesModifier to world actor for unlinked tokens |
| `npc-abilities.mjs` | Passive hooks: Pack Instincts/Tactics (save hinder), Magic Ward I/II/III (cast penalty), item-sequencer cone patch, npcAction wrapper |
| `npc-action-menu.mjs` | Combat action dropdown + spell cast dialog with mana cost calc, CrawlerSpellDialog |
| `countdown-roller.mjs` | Auto-rolls countdown dice at round start, applies tick damage, cleans up on combat end |
| `scroll-forge.mjs` | Spell Scroll Forge ApplicationV2 — create consumable scrolls from compendium, use via context menu |
| `alchemy-cookbook.mjs` | Alchemist crafting ApplicationV2 window |
| `alchemy-helpers.mjs` | Craft logic, material conversion, effect application |
| `relic-forge.mjs` | Relic crafting ApplicationV2 window |
| `relic-effects.mjs` | Relic power application and active effects |
| `relic-powers.mjs` | Relic power definitions |
| `loot-drops.mjs` | Automatic loot assignment on NPC defeat (Owner permission for all players) |
| `loot-manager.mjs` | Loot distribution ApplicationV2 window |
| `loot-tracker.mjs` | Session loot tracking ApplicationV2 window |
| `loot-tables.mjs` | Loot table definitions and roll logic |
| `loot-generator.mjs` | Loot Generator — roll on core Vagabond loot tables (Levels 1-10) with compendium item creation |
| `loot-data.mjs` | Embedded loot table data from the Vagabond core book |
| `item-drops.mjs` | Canvas item drop handling (Owner permission, skipStack on pickup) |
| `crawl-clock.mjs` | SVG progress clock on canvas |
| `dialog-helpers.mjs` | `confirmDialog()` and `waitDialog()` wrappers around DialogV2 |
| `icons.mjs` | Centralized icon registry (FontAwesome + custom SVGs) |
| `chat-tooltips.mjs` | Inline damage dice tooltips in chat |

## Naming Conventions

- **Files**: `kebab-case.mjs`
- **Exports**: `PascalCase` singletons (`CrawlState`, `CrawlBar`), `camelCase` functions (`confirmDialog`)
- **Constants**: `SCREAMING_SNAKE_CASE` (`MODULE_ID`, `ICONS`)
- **Private members**: `_` prefix (`_state`, `_el`, `_save()`, `_broadcast()`)
- **CSS classes**: prefixed — `vcb-` (bar), `vcs-` (strip), `vcl-` (light tracker)
- **CSS variables**: `--vcb-*` (surfaces, accents, phase colors, shadows)
- **DOM IDs**: `vagabond-crawler-*` (full descriptive kebab-case)
- **Settings keys**: `camelCase` (`encounterThreshold`, `hideNpcNames`)
- **i18n keys**: `VAGABOND_CRAWLER.PascalCaseKey`

## CSS Theming

All colors use CSS custom properties defined on `:root` (dark default) with `body.theme-light` overrides. Organized into sections: surfaces, borders, accents, text, shadows, phase colors (`--vcb-heroes`, `--vcb-gm`, `--vcb-combat`). Single file: `styles/vagabond-crawler.css`.

## Commits

Conventional Commits: `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`. Short imperative description.

## Common Patterns

- **Safe defaults**: `value ?? fallback`, `obj?.prop`
- **Early returns**: guard clauses at top of every method
- **GM check**: `if (!game.user.isGM) return;` before state mutations or broadcasts
- **Render debounce**: CrawlStrip uses `requestAnimationFrame` queuing
- **Linked + unlinked tokens**: always handle both — use `token.actor` (synthetic) not just actor ID
- **World actor vs token actor**: the save system uses `game.actors.get(actorId)` (world actor). When applying effects to unlinked tokens, mirror relevant changes (e.g. `outgoingSavesModifier`) to the world actor too. See flanking-checker and npc-abilities for examples.
- **Disposition over actor type**: use `token.document.disposition === CONST.TOKEN_DISPOSITIONS.FRIENDLY` for hero/NPC classification, NOT `actor.type === "character"`. Friendly NPC summons must appear on the Heroes side.
- **Party actor speed**: `system.speed` is an object `{ base, crawl }` on characters but a flat number on party actors. Always check `typeof system.speed === "object"` before accessing `.base` / `.crawl`.
- **skipStack option**: pass `{ skipStack: true }` to `createEmbeddedDocuments` when creating items that should NOT auto-merge (lit torches, picked-up items with state).
- **Player actions via socket**: players can't modify GM-owned data directly. Relay via `game.socket.emit("module.vagabond-crawler", { action, ... })` and handle on the GM client. See rollbackMove, itemDrop:pickup, dropLight.
- **ApplicationV2 render hooks**: Foundry v13 fires `render{ClassName}` (e.g. `renderVagabondCharacterSheet`), NOT `renderActorSheet`. Hook both for safety.
- **Foundry API**: prefer `foundry.utils.deepClone()`, `foundry.utils.mergeObject()`, `fromUuidSync()`

## Debugging

```js
game.vagabondCrawler.state            // crawl state object
game.vagabondCrawler.debugCombat()    // active combat summary
game.vagabondCrawler.debugSpeed()     // selected token's speed data
game.vagabondCrawler.scrollForge.open()  // open Scroll Forge
game.vagabondCrawler.movement._turnStartPos  // rollback position snapshots
game.patrol                           // Patrol module instances (if installed)
```

## Adding a New Feature

1. Create `scripts/feature-name.mjs` — export singleton object with `init()` and any needed methods
2. Import in `vagabond-crawler.mjs`
3. Register settings in `Hooks.once("init")` (or delegate to `FeatureName.registerSettings()`)
4. Add to `game.vagabondCrawler` and call `FeatureName.init()` in `Hooks.once("ready")`
5. If it needs sync: add a socket action in the socket handler
6. If it has UI: add CSS with `vcb-` prefix to `vagabond-crawler.css`, add `--vcb-*` variables for any colors
7. If it needs a window: extend `HandlebarsApplicationMixin(ApplicationV2)`, add `.hbs` template in `templates/`
