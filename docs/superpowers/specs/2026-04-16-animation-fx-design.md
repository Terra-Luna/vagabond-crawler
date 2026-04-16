# Animation FX System Design

**Date:** 2026-04-16
**Status:** Approved design, ready for implementation planning
**Target module:** `vagabond-crawler`

## Summary

Absorb the (currently unused) `vagabond-item-fx` module into `vagabond-crawler` as a unified `AnimationFx` subsystem, and extend it with first-class support for NPC action animations. Configuration lives in a single centralized ApplicationV2 window with tabs for each category (Weapons, Skill Fallbacks, Alchemical, Gear, NPC Actions, Settings). Every category supports both hit and miss animations plus optional sound, matching the shape shown in the Item FX Sequencer reference UI.

The goal is that a GM configures animations once, centrally, and every monster's bite/claw/slam/breath weapon plays the correct effect without touching individual NPC sheets.

## Motivation

- `vagabond-item-fx` only handles player weapons, alchemical items, and gear. It has no concept of NPC actions/abilities.
- Individually configuring animations on every monster's action entries is impractical — there are hundreds of NPC entries in the compendium, and monster action names are inconsistent (`Bite` vs `Vicious Bite` vs `Chomp`).
- The existing Sequencer cone patch in `scripts/npc-abilities.mjs` is a point solution for one animation type and needs to become part of a general system.
- Player and GM both want a single place to configure animation FX for the game.

## Non-goals

- Auto-migration from any existing `vagabond-item-fx` world config (module is not in use; we port its defaults, not user data).
- Animation chaining / multi-step sequences per preset.
- Per-token (as opposed to per-actor / per-item / per-action) overrides.
- AOE / burst / area shapes beyond the already-supported `cone` type.
- Changes to `vagabond-character-enhancer`'s Spell FX system. That stays as-is; this work is orthogonal.

## Architecture

### File structure

| File | Purpose |
|---|---|
| `scripts/animation-fx.mjs` | Singleton subsystem: `init()`, settings registration, chat-message hook handler, resolver, playback. Exported as `AnimationFx`. |
| `scripts/animation-fx-config.mjs` | `AnimationFxConfigApp` — `HandlebarsApplicationMixin(ApplicationV2)` window with tabbed config UI. |
| `scripts/animation-fx-defaults.mjs` | Default preset data for all categories, ported from `vagabond-item-fx/scripts/default-config.mjs`. |
| `templates/animation-fx-config.hbs` | Handlebars template for the config window. Shares a preset-row partial across all tabs because schemas are unified. |
| `styles/vagabond-crawler.css` | Adds a new section with `vcfx-` CSS prefix and a small set of new `--vcfx-*` variables layered on top of existing `--vcb-*` tokens. |

### Registration (in `vagabond-crawler.mjs`)

```js
import { AnimationFx } from "./animation-fx.mjs";

Hooks.once("init", () => {
  AnimationFx.registerSettings();
});

Hooks.once("ready", () => {
  game.vagabondCrawler.animationFx = AnimationFx;
  AnimationFx.init();
});
```

Follows the crawler's standard singleton + guarded-init pattern.

### Retired code

- The Sequencer cone patch currently in `scripts/npc-abilities.mjs` (lines ~430–489) is removed. Its angle math and cone rendering move into `AnimationFx._play()` under `type: "cone"`.

## Data model

Single world setting `animationFxConfig` with this top-level shape:

```js
{
  weapons: {
    sword:  { label, patterns, type, target, hit: {...}, miss: {...}, opacity?, fadeIn?, fadeOut? },
    dagger: { ... },
    bow:    { type: "projectile", ... },
    // ~15 named entries, ported from vagabond-item-fx defaults
  },
  weaponSkillFallbacks: {
    melee: { ... }, finesse: { ... }, brawl: { ... }, ranged: { ... }, _default: { ... }
  },
  alchemical: {
    "alchemist's fire": { ... },
    _default: { ... }
  },
  gear: {
    torch:   { type: "onToken", persist: true, ... },
    lantern: { ... },
    sunrod:  { ... }
  },
  npcActions: {
    bite:   { label: "Bite", patterns: "bite|chomp|gnaw", type: "onToken", hit: {...}, miss: {...} },
    claw:   { ... },
    slam:   { ... },
    breath: { type: "cone", patterns: "breath|cone|spray|exhale", ... },
    _default: { ... }
  }
}
```

### Unified preset schema

Every category entry uses the same shape. Unused fields are simply absent.

```js
{
  label:    string,                         // Display name
  patterns: string,                         // Regex source (weapons, npcActions)
  type:     "onToken" | "projectile" | "cone",
  target:   "self" | "target",

  hit: {
    file:        string,                    // File path or Sequencer DB path
    scale:       number,                    // Multiplier
    duration:    number,                    // ms
    offsetX?:    number,
    sound?:      string,                    // Audio file path
    soundVolume?: number,                   // 0–1
  },
  miss: {                                   // Optional on every category
    file:        string,
    scale:       number,
    duration:    number,
    sound?:      string,
    soundVolume?: number,
  },

  persist?: boolean,                        // Gear only (torch/lantern)
  opacity?: number,
  fadeIn?:  number,
  fadeOut?: number,
}
```

### Per-item / per-action overrides (actor & item flags)

- Item-level override: `flags.vagabond-crawler.animationOverride` — a full preset object, takes highest priority in the resolver.
- Item-level disable: `flags.vagabond-crawler.disabled` — skip animation entirely.
- Per-action override on NPCs: `flags.vagabond-crawler.actionOverrides[actionIndex]` — preset object keyed by the index in `actor.system.actions[]`.

## Resolver

`AnimationFx._resolve(source)` returns a preset or `null`, where `source` is either an item or an `{ actor, actionIndex }` pair for NPC actions.

Priority chain:

1. **Override flag** — item.flags or actor.flags.actionOverrides[actionIndex]
2. **Category routing**:
   - NPC action → `npcActions` regex-matched on action name
   - Weapon item → `weapons` regex-matched on item name; fall back to `weaponSkillFallbacks[weaponSkill]`
   - Alchemical item → `alchemical[name]` → partial match → `_default`
   - Gear item → `gear[name]` only (no default)
3. **No match** → `null` (skip)

### Smart-default type detection (used when creating a new NPC action preset in the UI)

- Name matches `/breath|cone|spray|exhale/i` → `cone`
- Name matches `/arrow|bolt|shoot|throw|hurl|spit/i` → `projectile`
- Otherwise → `onToken`

GM can always override after the smart default is applied.

## Playback

`AnimationFx._play(preset, source, targets, outcome)`

- `outcome` is `"hit"` or `"miss"`. Select `preset[outcome]`.
- If the selected block is missing → no-op (miss block is optional).
- Branch by `preset.type`:
  - **onToken** — `Sequence().effect().file(block.file).atLocation(targetOrSelf).scaleToObject(block.scale * globalScale).fadeIn().fadeOut().duration(block.duration).play()`
  - **projectile** — `Sequence().effect().file(block.file).atLocation(source).stretchTo(target).fadeIn().fadeOut().play()`
  - **cone** — angle from source center → target centroid; `Sequence().effect().file(block.file).atLocation(source).rotate(-angle).scale(block.scale * globalScale).anchor({x:0, y:0.5}).duration(block.duration).play()`
- **Persistent** (gear only, when `preset.persist === true`): `.persist().name("vagabond-crawler-fx-${label}-${tokenId}")`. If a named effect already exists, end it instead (toggle off).
- **Sound**: `foundry.audio.AudioHelper.play({ src: block.sound, volume: block.soundVolume * masterVolume, autoplay: true, loop: false })` — client-side, gated by `animationFxSoundEnabled`.
- **Multi-target**: 150ms stagger between targets.

## Trigger

Hook: `Hooks.on("createChatMessage", handler)`

Handler gates:

1. Skip if `userId !== game.userId` (each client plays its own animations — no socket needed).
2. Skip if `animationFxEnabled` client setting is false.
3. Determine source path from message flags:
   - `flags.vagabond.actorId + flags.vagabond.itemId` → item path
   - `flags.vagabond.actorId + flags.vagabond.actionIndex` → NPC action path
4. Spells (`item.type === "spell"`) and relics/armor are skipped — existing `vagabond-character-enhancer` owns spell FX.
5. Determine outcome:
   - Prefer `flags.vagabond.rollOutcome` if the system emits it
   - Fall back to text-scan of message content for HIT/MISS markers (existing `vagabond-item-fx` behavior)
   - When `animationFxTriggerOn === "hit"`, miss animations are suppressed entirely
6. Resolve source token via `actor.getActiveTokens()[0]`; targets from `flags.vagabond.targetsAtRollTime` or current user targets.
7. Call `_resolve` then `_play`.

### NPC action flag emission

The `VagabondChatCard.npcAction(actor, action, actionIndex, targets)` path must write `actionIndex` to the message flags. Implementation should:

- Check whether the current system version already emits `actionIndex`.
- If not, wrap `VagabondChatCard.npcAction` using the same pattern as `npcAction wrapper` in `scripts/npc-abilities.mjs` to attach the flag post-call.

## Config UI

### Class

`AnimationFxConfigApp` extends `HandlebarsApplicationMixin(ApplicationV2)`.

- `id: "vagabond-crawler-animation-fx-config"`
- Window title: "Animation FX Configuration"
- Default size ~900×700, resizable.
- Opened from: (a) settings menu entry registered via `game.settings.registerMenu()`, and (b) a button on CrawlBar's existing Forge & Loot tool picker panel.

### Tabs

| Tab | Content |
|---|---|
| Weapons | Preset rows with label, pattern regex, type dropdown, hit block, miss block, preview, delete |
| Skill Fallbacks | Fixed rows: melee, finesse, brawl, ranged, `_default` |
| Alchemical | Preset rows, name-matched |
| Gear | Torch / lantern / sunrod, with `persist` checkbox exposed |
| NPC Actions | Preset rows. "Add Preset" applies smart-default type based on name. Hint text explains the smart default heuristic |
| Settings | Global toggles: `animationFxEnabled`, `animationFxScale`, `animationFxTriggerOn` (always/hit), `animationFxSoundEnabled`, `animationFxMasterVolume` |

### Preset row layout

```
┌─────────────────────────────────────────────────────────────┐
│ [Label]  [Patterns: bite|chomp|gnaw]      Type: [onToken ▾] │
│                                                              │
│ HIT ANIMATION                                                │
│ [file path] [📁]  Scale [1]  Duration [1000]  Offset [0]     │
│ [sound path] [🎵]  Volume [0.6]                              │
│                                                              │
│ ▸ MISS ANIMATION (click to expand — optional)                │
│                                                              │
│ [▶ Preview on selected token]          [🗑 Delete]            │
└─────────────────────────────────────────────────────────────┘
```

`<details>/<summary>` for miss section collapse. Shift-click preview plays the miss animation instead of hit.

### Actions bar

- `+ Add Preset` (context-aware to the active tab)
- `🔄 Reset to Defaults` (per tab; confirmation dialog)
- `💾 Save`, `Save & Close`, `Cancel`

Save flashes the bar green briefly on success (existing item-fx pattern).

## Settings

World settings (`Hooks.once("init")`):

- `animationFxConfig` — full config object, hidden from UI, edited exclusively via `AnimationFxConfigApp`.
- `animationFxTriggerOn` — `"always"` or `"hit"`. Default `"always"`.

Client settings:

- `animationFxEnabled` — default `true`.
- `animationFxScale` — 0.25–3.0, default `1.0`.
- `animationFxSoundEnabled` — default `true`.
- `animationFxMasterVolume` — 0–1, default `0.8`.

## CSS

New section in `styles/vagabond-crawler.css` using the `vcfx-` prefix. Reuses existing `--vcb-*` variables for surfaces/borders/accents. Adds:

- `--vcfx-preset-bg`
- `--vcfx-preset-border`
- `--vcfx-hit-accent` (green-leaning)
- `--vcfx-miss-accent` (red-leaning)

Light theme overrides follow the existing `body.theme-light` pattern.

## Debugging hooks

Exposed on `game.vagabondCrawler.animationFx`:

- `.open()` — open the config window
- `.previewPreset(preset, token)` — play a preset on a selected token
- `._resolve(source)` — inspect the resolver result for a given item / NPC action

## Testing

Approach: Foundry MCP with real live tokens (unlinked NPC tokens from cloned world actors, matching the crawler's existing test pattern).

Scenarios:

1. **Resolver** — weapons, alchemical, gear, NPC actions all return expected presets; override flags beat category lookup; `_default` used when no match.
2. **Playback** — onToken, projectile, cone all render via Sequencer with correct scale/duration/rotation. Cone angle correct for targets at 0°, 90°, 180°, 270°.
3. **Hit vs miss** — forced `rollOutcome: "miss"` plays miss animation; absent miss block is a no-op. `animationFxTriggerOn: "hit"` suppresses miss entirely.
4. **Persistent effects** — torch toggles on, toggles off on second trigger.
5. **NPC action integration** — trigger a real NPC bite/breath action via the action menu, confirm chat flag emits correctly, confirm animation plays.
6. **Multi-target** — 3+ targets stagger at 150ms.
7. **Config UI** — save persists, reset restores defaults for the current tab only, preview button requires a selected token and plays correctly.

## Out of scope (explicit)

- Auto-migration from `vagabond-item-fx` user configs (module not deployed).
- Animation chaining (multiple effects in sequence per preset).
- Per-token overrides.
- AOE / burst / area shapes beyond cone.
- Changes to `vagabond-character-enhancer` Spell FX.

## Open questions for implementation

- Does the current `vagabond` system emit `flags.vagabond.rollOutcome` on chat messages, or do we rely on content text-matching? Verify during implementation; fallback is already planned.
- Does `VagabondChatCard.npcAction` currently emit `actionIndex` in chat flags? If not, wrap it (pattern already exists in `npc-abilities.mjs`).
