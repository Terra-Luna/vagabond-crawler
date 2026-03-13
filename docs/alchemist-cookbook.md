# Alchemist Cookbook — Technical Reference

Module: `vagabond-crawler`
System: Vagabond v4.x (Foundry VTT v13)
Setting: `alchemistCookbook` (Boolean, default `true`)

---

## Architecture

The Cookbook spans three files:

| File | Role |
|---|---|
| `scripts/alchemy-helpers.mjs` | Shared constants, actor detection, material math, weapon conversion, craft action, attack effects, self-use consumables |
| `scripts/alchemy-cookbook.mjs` | Cookbook ApplicationV2 window, singleton launcher, right-click integration |
| `templates/alchemy-cookbook.hbs` | Handlebars template for the Cookbook UI |

Registration happens in `vagabond-crawler.mjs` which calls `AlchemyCookbook.init()` and several hook registrations during the `ready` hook:
- `registerMaterialsHook()` — auto-convert Materials to consumable
- `registerCountdownDamageHook()` — apply damage when countdown dice roll
- `registerEffectExpirationHook()` — remove on-hit AEs when combat turns advance
- `registerCountdownLinkedAEHook()` — link/unlink AEs to countdown dice
- `registerOilBonusDamageHook()` — apply oil bonus damage on weapon hits
- `registerAlchemicalAttackHook()` — unified post-attack alchemical effects
- `registerConsumableContextMenu()` — flask "Use" buttons on character sheets
- `registerConsumableUseHook()` — auto-apply consumable effects from gear-use chat cards
- `registerEurekaHook()` — grant Studied die on Craft-skill weapon crits (Alchemist level 2+)

---

## Actor Detection

`getAlchemistData(actor)` returns `null` for non-Alchemists. Detection requires:

1. **Class item**: `actor.items.find(i => i.type === "class" && i.name === "Alchemist")`
2. **Level**: `actor.system.attributes.level.value` (clamped 1–10)
3. **Alchemy Tools**: any `type: "equipment"` item whose name includes `"alchemy tools"` (case-insensitive). Works with both compendium sources — the gear compendium (`equipmentType: "gear"`) and the alchemical-items compendium (`equipmentType: "alchemical"`).
4. **Materials**: `type: "equipment"` items whose name includes `"materials"` and either `isConsumable === true` or `gearCategory === "Alchemy & Medicine"`.

### Return shape

```js
{
  classItem,          // Item document (class)
  level,              // Number (1–10)
  tools,              // Item document (Alchemy Tools) or undefined
  materials,          // Item[] (all Materials items on actor)
  totalSilver,        // Number (aggregate silver across all Materials)
  formulae,           // string[] (known formula names from tools flag)
  maxFormulaeCount,   // Number (from ALCHEMIST_LEVELS)
  maxFormulaeValue,   // Number in silver (from ALCHEMIST_LEVELS)
}
```

---

## Level Progression

Defined in `ALCHEMIST_LEVELS`:

| Level | Formulae Known | Max Formula Value |
|:-----:|:--------------:|:-----------------:|
| 1 | 4 | 50s |
| 2 | 4 | 100s |
| 3 | 5 | 150s |
| 4 | 5 | 200s |
| 5 | 6 | 250s |
| 6 | 6 | 300s |
| 7 | 7 | 350s |
| 8 | 7 | 400s |
| 9 | 8 | 450s |
| 10 | 8 | 500s |

---

## Formulae Storage

Known formulae are stored as a string array on the Alchemy Tools item via Foundry flags:

```js
tools.setFlag("vagabond-crawler", "knownFormulae", ["Alchemist's Fire", "Antitoxin"])
tools.getFlag("vagabond-crawler", "knownFormulae")  // string[]
```

Formulae are managed through the Cookbook UI. The value cap (`maxFormulaeValue`) restricts which items can be *added* as formulae, but does not restrict what the Alchemist can craft.

---

## Crafting Costs

Two cost paths handled by `getCraftCost(itemData, isFormula)`:

| Method | Cost | When |
|---|---|---|
| **Formula** | Flat **5s** | Item is in the Alchemist's known formulae |
| **Standard** | **Half item value** (`ceil(value / 2)`) | Any alchemical item, formula or not |

Cost is deducted from Materials items. The `deductMaterials()` function:
1. Converts any non-consumable Materials to consumable first
2. Sorts Materials by quantity descending (largest pile first)
3. Deducts the required silver across multiple stacks if needed
4. Updates each Materials item's `name`, `quantity`, and `baseCost` to reflect remaining uses
5. Deletes Materials items that reach quantity 0

---

## Materials Auto-Conversion

A `createItem` hook (`registerMaterialsHook()`) fires when any item is added to an actor. If the item:
- Is `type: "equipment"`
- Has a name containing `"materials"` (case-insensitive)
- Is **not** already `isConsumable`
- Belongs to an actor with an Alchemist class item

Then it auto-converts:

| Field | Before | After |
|---|---|---|
| `name` | `Materials (50s)` | `Materials (50s) (Consumable)` |
| `name` | `Materials (1g)` | `Materials (1g) (Consumable)` |
| `system.isConsumable` | `false` | `true` |
| `system.quantity` | `1` | silver value (e.g. `50`, `100`) |
| `system.baseCost` | `{gold: 1, silver: 0}` | `{gold: 0, silver: 100}` |

Currency conversion: `(gold * 100) + silver + (copper * 0.01)`

As materials are spent, the item name updates to show remaining uses (e.g. `Materials (75s) (Consumable)`).

---

## Weapon Conversion

When crafting an item whose `alchemicalType` is offensive, `convertToWeapon()` transforms it:

### Offensive types (become weapons)

`acid`, `explosive`, `poison`

### Weapon Overrides

Some items are not offensive by `alchemicalType` but are still thrown as weapons. These are listed in `WEAPON_OVERRIDES`:

```js
const WEAPON_OVERRIDES = new Set(["Holy Water"]);
```

`isOffensiveType()` checks both `WEAPON_TYPES` and `WEAPON_OVERRIDES`.

### Converted fields

| Field | Value |
|---|---|
| `system.equipmentType` | `"weapon"` |
| `system.weaponSkill` | `"craft"` |
| `system.range` | `"near"` |
| `system.grip` | `"1H"` |
| `system.isConsumable` | `true` |
| `system.equipmentState` | `"oneHand"` |
| `name` | `"{Original Name} (Weapon)"` |

Damage fields are populated from `damageAmount`/`damageType` if the one-hand fields are empty. Compendium metadata (`_id`, `_stats`) is stripped so the item creates as a new document.

### Non-offensive types (stay as alchemical)

`concoction`, `oil`, `potion`, `torch`

These are added to inventory with `prepareForInventory()` which only strips metadata.

### Item counts by type (84 items in compendium)

| Type | Count | Converts? |
|---|---|---|
| Acid | 4 | Weapon |
| Explosive | 7 | Weapon |
| Poison | 3 | Weapon |
| Concoction | 16 | No (except WEAPON_OVERRIDES) |
| Oil | 7 | No |
| Potion | 37 | No |
| Torch | 10 | No |

---

## Compendium Access

`fetchCompendiumItems()` loads from `vagabond.alchemical-items` and caches for the session:

```js
const pack = game.packs.get("vagabond.alchemical-items");
const docs = await pack.getDocuments();
_compendiumCache = docs.map(d => d.toObject());
```

Cache can be cleared with `clearCompendiumCache()` if the compendium is updated mid-session.

---

## Cookbook Window

`AlchemyCookbookApp` extends `HandlebarsApplicationMixin(ApplicationV2)`.

### Opening

Right-click on **Alchemy Tools** in the character sheet inventory, then click **Open Cookbook** from the context menu.

Also available programmatically:
```js
game.vagabondCrawler.alchemy.open(actor)
```

### Tabs

| Tab | Shows | Craft cost |
|---|---|---|
| **Formulae** | Only known formulae | 5s each |
| **All Items** | Every item in the alchemical compendium | Half value |

Both tabs support text search (filters by name or alchemical type).

### Formula Management

- **Add**: Click `+ Add` button, then click an eligible item (value <= level cap)
- **Remove**: Click the `x` on a formula chip
- Formulae are persisted immediately via `setFlag` on the Alchemy Tools item

### Singleton Pattern

Only one Cookbook window exists at a time. Re-opening for the same actor brings the existing window to front. Opening for a different actor closes the old one first. Stale instances (with null elements from previous renders) are cleaned up.

---

## Right-Click Integration

The module patches the Vagabond system's `InventoryHandler.showInventoryContextMenu` prototype method. This is done via the `renderApplicationV2` hook, which fires when any ApplicationV2 sheet renders (Foundry v13's hook pattern is `render{ClassName}`, not the legacy `renderActorSheet`).

### Patch flow

1. `renderApplicationV2` hook fires
2. Check if the app has an `inventoryHandler` property
3. Wrap `InventoryHandler.prototype.showInventoryContextMenu` once
4. On each right-click: call original, then check if the clicked item is Alchemy Tools on an Alchemist
5. If yes, append a divider + "Open Cookbook" menu item to the existing context menu DOM

The patch is applied once to the prototype, so it works for all character sheets from that point forward.

---

## Crawl Strip Craft Tab

During combat, if the token's actor is an Alchemist with known formulae, a **Craft** tab appears in the crawl strip hover menu alongside Weapons and Spells.

### Build path

In `npc-action-menu.mjs`, `_buildMenuData()`:
1. Checks `alchemistCookbook` setting
2. Calls `getAlchemistData(actor)`
3. If tools exist and formulae are set, builds `craftItems` array
4. Adds `tabC: "Craft"` and `itemsC: craftItems` to the menu data

### Action path

Clicking a craft item in the panel calls `_fireAction()` with `type: "craft"`, which runs:
```js
await craftItem(actor, craftName, true)  // true = is formula = 5s cost
```

---

## Class Features (Automated)

Three Alchemist class features are automated by the module. They are level-gated using `getAlchemistData()`.

### Eureka (Level 2)

When an Alchemist crits on a Craft check (alchemical weapon attack), they gain +1 Studied die.

**Implementation**: `registerEurekaHook()` in `alchemy-helpers.mjs` listens on `createChatMessage`. It detects crits by checking for `"(Crit)"` in the chat card (the system appends this to the skill label). Only fires for weapons with `weaponSkill === "craft"` on Alchemists level 2+.

**System field**: `actor.system.studiedDice` (number) — incremented via `actor.update()`.

### Potency (Level 4)

Alchemical damage and healing dice can explode (re-roll on max value).

**Weapon damage**: Applied in `craftItem()` after item creation. Sets `system.canExplode = true` and `system.explodeValues` to the max face value (e.g. `"6"` for d6). The system's `_getExplodeValues()` and `_manuallyExplodeDice()` handle the rest during `rollDamage()`.

**Healing potions**: Applied in `useConsumable()` after rolling the heal formula. Calls `VagabondDamageHelper._manuallyExplodeDice()` with the appropriate explode values.

### Big Bang (Level 8)

Adds a d6 bonus to alchemical damage and healing, and dice explode on the two highest values.

**Weapon damage**: In `craftItem()`, for level 8+ Alchemists:
- `system.explodeValues` set to `"6,5"` (two highest values)
- `system.currentDamage` appended with `+ 1d6`

**Healing potions**: In `useConsumable()`, for level 8+:
- `1d6 +` prepended to the heal formula
- Explode values set to `[maxFace, maxFace - 1]`

### Not automated

| Feature | Level | Reason |
|---|---|---|
| Catalyze | 1 | Player knowledge (Deft Hands perk + craft with Use action) |
| Mix | 6 | Complex UI (combine two alchemical items) — deferred |
| Prima Materia | 10 | Player knowledge (free craft once per day) |

---

## Alchemical Effects (On-Hit — Countdown Dice & Statuses)

> **Removal note**: This is a custom implementation. If the Vagabond system adds native support for burning/poison/etc. damage via countdown dice, this feature can be safely removed by:
> 1. Deleting the `ALCHEMICAL_EFFECTS` table and `getAlchemicalEffect()` from `alchemy-helpers.mjs`
> 2. Deleting the hook registration functions from `alchemy-helpers.mjs` and their calls in `vagabond-crawler.mjs`
> 3. Removing the `setFlag("vagabond-crawler", "alchemicalEffect", ...)` call in `craftItem()` (`alchemy-helpers.mjs`)

### Overview

Some alchemical items produce secondary effects when they hit a target. These are modeled using the system's built-in Countdown Dice (JournalEntry documents with `flags.vagabond.countdownDice`).

**Not all countdown dice do damage.** Some only track a status duration (e.g. blinded, restrained). The `damageType` field in the effect entry controls this — if `damageType` is present, damage is auto-applied on each countdown roll. If absent, the die is purely a duration tracker.

### Effect Table

Defined as `ALCHEMICAL_EFFECTS` in `alchemy-helpers.mjs`:

| Item | Effect | Die | Damage | Special |
|---|---|---|---|---|
| Alchemist's Fire | Burning | Cd6 | fire | — |
| Acid, Basic | Burning | Cd4 | acid | — |
| Acid, Defoliator | Burning | Cd6 | acid | `onlyTargetNames` — plant creatures only |
| Acid, Oxidizing | Burning | Cd6 | acid | `confirmCountdown` — GM confirms "is target metal?". GM reminder about armor/weapon degradation |
| Frigid Azote | Frozen | — | — | `onHitEffects`: halves speed for 1 round |
| Tanglefoot Bag | Restrained | Cd4 | — | `linkedStatus`: Restrained AE linked to die. Speed zeroed, attacks hindered |
| Levin Shell | Dazed | — | shock | `splash` 5ft half damage. `onHitEffects`: Dazed 1 round |
| Dwarfblind Stone | Blinded | Cd6 | — | `onlyTargetSenses` — Darksight only. `linkedStatus`: Blinded AE |
| Oil, Basic | Oil Coating | Cd6 | — | `isCoating`: adds +1d6 fire to weapon hits |
| Oil, Anointing | Anointing Oil | Cd6 | — | `isCoating` + `silvered` |
| Oil, Bladefire | Bladefire Oil | Cd6 | — | `isCoating` + `burnsTarget`: Burning Cd4 on hit targets |
| Holy Water | Burning | Cd4 | magic | `onlyTargetBeingTypes: ["Undead"]` + `onlyTargetNames` for Hellspawn creatures |
| Poison, Basic | Sickened | Cd4 | poison | `linkedStatus`: Sickened AE (healing -2) |
| Poison, Deadly Nightshade | Sickened | Cd4 | — | `linkedStatus`: Sickened. GM reminder: cures lycanthropy |
| Poison, Truth Serum | Sickened | Cd8 | — | `linkedStatus`: Sickened. GM reminder: target cannot lie |
| Thunderstone | — | — | blunt | GM reminder: all Near (30 ft) creatures cannot hear |

### Target Filtering

Effects can restrict which targets they apply to. Multiple filter types exist; when both `onlyTargetBeingTypes` and `onlyTargetNames` are present, they use **OR logic** (either match triggers the effect).

| Filter | Checks | Example |
|---|---|---|
| `onlyTargetBeingTypes` | `targetActor.system.beingType` (NPC) or `system.ancestry.beingType` (PC) | Holy Water → `["Undead"]` |
| `onlyTargetNames` | `targetActor.name` (partial match, case-insensitive) | Holy Water → Hellspawn creature names; Defoliator → plant creature names |
| `onlyTargetSenses` | `targetActor.system.senses` (partial match) | Dwarfblind Stone → `["darksight"]` |
| `confirmCountdown` | GM dialog popup asking a yes/no question | Acid, Oxidizing → "Target is made of metal?" |

Valid system `beingTypes`: Humanlike, Fae, Cryptid, Artificials, Beasts, Outers, Primordials, Undead.
"Hellspawn" is a lore tag (appears in NPC description text), not a system beingType — hence matched by creature name.

### Effect Entry Fields

```js
"Item Name": {
  effectName: "Status Label",     // Label on the countdown die
  countdownDie: "d6",             // Starting die: d4, d6, d8, d10, d12, d20 (omit for no die)
  damageType: "fire",             // Damage applied each tick (omit for no damage)
  linkedStatus: { ... },          // AE applied to target, removed when die ends
  onHitEffects: [{ ... }],        // AEs applied immediately on hit (duration-based)
  splash: { rangeFt, damageMultiplier }, // AoE to nearby tokens
  onlyTargetBeingTypes: [...],    // Filter by system beingType
  onlyTargetNames: [...],         // Filter by actor name
  onlyTargetSenses: [...],        // Filter by senses field
  confirmCountdown: "Question?",  // GM confirmation dialog
  gmReminder: "...",              // Chat message reminder for GM
  isCoating: true,                // Oil coating system (different flow)
  coatingDie: "d6",               // Oil countdown die
  coatingDamage: "1d6",           // Bonus damage per hit while coated
  coatingLight: { dim, bright },  // Light emission while coated
  burnsTarget: true,              // Oil: apply Burning to hit targets
  burnsTargetDie: "d4",           // Burning die for target
  silvered: true,                 // Oil: weapon counts as silvered
}
```

### Runtime Effect Merging

Effects are stored on weapon flags at craft time via `setFlag("vagabond-crawler", "alchemicalEffect", effect)`. At runtime, `applyAlchemicalPostAttack()` merges the stored flags with the **live** `ALCHEMICAL_EFFECTS` table:

```js
const liveEffect = ALCHEMICAL_EFFECTS[baseName] ?? {};
const effect = { ...flagEffect, ...liveEffect };
```

This ensures code changes (e.g. new target filters, damage type fixes) apply immediately without re-crafting weapons.

### Unified Attack Hook

`registerAlchemicalAttackHook()` listens on `createChatMessage` for weapon attack hits. It resolves the target from:
1. **Message flags** (`message.flags.vagabond.targetsAtRollTime`) — primary source
2. **HTML attributes** (`data-token-id` in card content) — fallback for crawl strip cards

Then calls `applyAlchemicalPostAttack()` which handles countdown dice, linked statuses, on-hit AEs, splash damage, and GM reminders.

### Data Flow

```
Craft (alchemy-helpers.mjs)
  +-- convertToWeapon() builds item data
  +-- craftItem() creates item on actor, then setFlag():
       item.setFlag("vagabond-crawler", "alchemicalEffect", effect)

Attack (any source: crawl strip or character sheet)
  +-- Chat message created with attack result
  +-- registerAlchemicalAttackHook() detects hit
  +-- Resolves target from message.flags.vagabond.targetsAtRollTime
  +-- applyAlchemicalPostAttack() merges live effect table
  +-- Creates countdown die, linked AEs, splash, GM reminders

Countdown Roll (alchemy-helpers.mjs)
  +-- registerCountdownDamageHook() listens on createChatMessage
  +-- Detects countdown-dice chat cards
  +-- Extracts die name -> finds matching JournalEntry
  +-- If damageType exists: applies roll result as damage to target
  +-- Posts damage notification to chat
```

---

## Self-Use Consumable Effects

Items consumed by the user (not thrown at targets): potions, antitoxin, etc.

### Consumable Effects Table

Defined as `CONSUMABLE_EFFECTS` in `alchemy-helpers.mjs`:

| Item | Type | Effect |
|---|---|---|
| Antitoxin | `removeStatus` | Removes Sickened status |
| Potion, Healing I | `heal` | Roll 1d6+1, restore HP (capped at max) |
| Potion, Healing II | `heal` | Roll 2d6+2, restore HP |
| Potion, Healing III | `heal` | Roll 3d6+3, restore HP |
| Potion, Mana I | `heal` | Roll 1d6+1, restore mana |
| Potion, Mana II | `heal` | Roll 2d6+2, restore mana |
| Potion, Mana III | `heal` | Roll 3d6+3, restore mana |
| Potion, Speed I | `applyEffect` | +5 Speed for 1 hour (AE: `system.speed.bonus` OVERRIDE) |
| Potion, Speed II | `applyEffect` | +10 Speed for 1 hour (AE: `system.speed.bonus` OVERRIDE) |
| Potion, Speed III | `applyEffect` | +15 Speed for 1 hour (AE: `system.speed.bonus` OVERRIDE) |

### Consumable Effect Types

| Type | Fields | Behavior |
|---|---|---|
| `removeStatus` | `statusId` | Finds and removes the matching AE from the actor |
| `heal` | `formula`, `resource` ("health" or "mana") | Rolls formula, adds to resource value (capped at max) |
| `applyEffect` | `label`, `icon`, `durationSeconds`, `changes` | Creates an ActiveEffect on the actor |

All types have a `chatMessage` template with placeholders: `{actor}`, `{amount}`, `{from}`, `{to}`.

### Use Flow

`useConsumable(actor, item)`:
1. Looks up the item name in `CONSUMABLE_EFFECTS` via `getConsumableEffect()`
2. Applies the effect (remove status / heal / apply AE)
3. Posts a chat message describing the result
4. Consumes the item (decrements quantity or deletes if quantity reaches 0)

### Character Sheet Integration

Two mechanisms ensure consumable effects fire regardless of how the player uses the item:

1. **`registerConsumableContextMenu()`** — hooks `renderApplicationV2` to inject flask icon buttons on inventory rows for consumable items; clicking calls `useConsumable()` directly.
2. **`registerConsumableUseHook()`** — hooks `createChatMessage` to detect gear-use cards for consumable items (fired when the player uses the item through the system's native sliding-panel Use button) and auto-applies the effect. Reads actor/item IDs from `message.flags.vagabond.actorId` / `itemId` (not from HTML attributes).

**Auto-equip**: `craftItem()` sets `system.equipped = true` on all non-weapon alchemical items so they immediately appear in the sliding panel without requiring the player to manually equip them.

### Populate Folder

`populateAlchemicalFolder()` creates both weapon-converted and self-use consumable items. It checks both `getAlchemicalEffect()` and `getConsumableEffect()` — any compendium item matching either table is included.

---

## CSS Classes

All cookbook styles use the `vcb-cook-` prefix:

| Class | Element |
|---|---|
| `.vcb-cookbook` | Root container |
| `.vcb-cook-header` | Materials/formulae stat bar |
| `.vcb-cook-tabs` | Tab bar (Formulae / All Items) |
| `.vcb-cook-tab-active` | Active tab highlight |
| `.vcb-cook-search` | Search input wrapper |
| `.vcb-cook-list` | Scrollable item list |
| `.vcb-cook-item` | Individual item row |
| `.vcb-cook-formula` | Item row highlight for known formulae |
| `.vcb-cook-disabled` | Greyed out (can't afford) |
| `.vcb-cook-craft-btn` | Craft button per row |
| `.vcb-cook-formulae-section` | Bottom formula slots area |
| `.vcb-cook-chip` | Formula name chip |
| `.vcb-cook-chip-add` | "+ Add" button chip |
| `.vcb-cook-chip-adding` | Active state when selecting formula |

Context menu injection styles: `.vcb-context-menu`, `.vcb-context-item`

---

## Console API

```js
// Open cookbook for an actor
game.vagabondCrawler.alchemy.open(actor)

// Get alchemist data (detection + stats)
import { getAlchemistData } from "./scripts/alchemy-helpers.mjs"
getAlchemistData(actor)

// Craft an item directly
import { craftItem } from "./scripts/alchemy-helpers.mjs"
await craftItem(actor, "Alchemist's Fire", false)  // half cost
await craftItem(actor, "Alchemist's Fire", true)   // formula cost (5s)

// Use a consumable on an actor
import { useConsumable } from "./scripts/alchemy-helpers.mjs"
const item = actor.items.getName("Potion, Healing I");
await useConsumable(actor, item)

// Populate folder with all alchemical + consumable items
game.modules.get("vagabond-crawler").api.populateAlchemicalFolder()

// Clear compendium cache
import { clearCompendiumCache } from "./scripts/alchemy-helpers.mjs"
clearCompendiumCache()
```

---

## Dependencies

- **System**: Vagabond v4.x (verified v4.3.1; `vagabond.alchemical-items` compendium must exist)
- **Foundry**: v13 (ApplicationV2, `renderApplicationV2` hook)
- **Module setting**: `alchemistCookbook` must be enabled (default: `true`)
- **Actor requirements**: Alchemist class item + Alchemy Tools in inventory
