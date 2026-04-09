# Vagabond Crawler

![Foundry v13](https://img.shields.io/badge/foundry-v13-green?style=for-the-badge)
![System](https://img.shields.io/badge/system-vagabond-blue?style=for-the-badge)
![Version](https://img.shields.io/badge/version-1.7.0-orange?style=for-the-badge)

A comprehensive dungeon crawl management module for the **Vagabond RPG** system in Foundry VTT. Everything you need to run a crawl — turn tracking, movement enforcement, random encounters, light management, morale, combat integration, crafting, loot, and more — all from a unified interface.

---

## Features

### Crawl Bar (GM Only)
A persistent bottom bar that drives the entire crawl loop.

- **Start / End Crawl** — Activates the crawl state and populates the tracker
- **Two-phase turn structure** — Heroes Turn → GM Turn → repeat
- **Next Turn** — Advances the phase and increments the turn counter
- **Add Tokens** — Select tokens on the canvas and add them to the tracker
- **Time Passes** — Advances in-world time by a configurable number of minutes
- **Encounter Check** — Rolls a d6 against a configurable threshold; right-click to change
- **Encounter Roller** — Full encounter builder with NPC tables, RollTable integration, mutator
- **Light Tracker** — Opens the light management panel
- **Combat** — Adds heroes and NPCs to the Foundry Combat Tracker
- **Rest / Breather** — Full recovery or ration-based healing dialog
- **Forge & Loot** — Left-click opens a tool picker panel; right-click opens settings
- **Drag-and-drop reordering** — Reorder tracker members by dragging

---

### Crawl Strip (All Players)
A top-of-screen HUD bar showing all members at a glance.

- **Portrait cards** for every hero and NPC with HP bar, status pills, and name
- **Hero cards** show Luck, remaining movement, and HP
- **Disposition-based sorting** — Friendly tokens show on Heroes side, Hostile on NPC side (supports summoned NPCs on the party side)
- **Active/dim state** — Cards highlight when it's that faction's turn
- **Current turn indicator** — Active combatant gets a chevron badge
- **Defeated indicator** — Skull overlay or auto-hide (configurable)
- **Click to select** — Single-click to select and pan to token
- **Double-click to open sheet** — Opens the actor's character sheet
- **Sorted by combat order** during combat
- **Party token support** — Party-type actors show speed correctly on the strip

#### Combat Mode
- **Round indicator** and navigation arrows
- **Activate / End Turn** buttons on hover
- **Countdown dice auto-roll** at the start of each round

#### NPC Action Menu
During combat, hovering a card reveals a tab strip:
- **Weapons** — Roll attacks directly from the HUD
- **Spells** — Opens the spell cast dialog
- **Actions** — One-click NPC actions (with Pack Instincts automation)
- **Abilities** — NPC special abilities

---

### Spell Cast Dialog
Compact popup for configuring and casting spells from the crawl strip.

- Select delivery type, adjust damage dice, toggle effects
- Increase delivery range/area
- Preview and place area templates on the canvas
- Mana cost calculated live
- **Focus Spell toggle** — Focus after a successful cast

---

### Movement Tracker
Enforces Vagabond's movement rules on tracked tokens.

**Crawl mode:**
- Hard-blocks movement beyond crawl speed
- Deducts movement as the token moves; resets each phase
- **Terrain difficulty** — Queries Scene Region "Modify Movement Cost" behaviors

**Combat mode:**
- Base speed budget with Rush action (2x speed)
- Color-coded ruler: green (normal), red (Rush)
- Hard-blocks at 2x base speed
- Separate "Enforce Combat Movement" setting

**Rollback Movement:**
- Available to both GM and players via Token HUD
- Snaps token back to turn-start position and restores movement budget
- Players relay via socket to GM for execution

---

### Light Tracker
Tracks burn time for all light sources carried by party members.

| Light Source | Bright | Dim | Duration | Notes |
|---|---|---|---|---|
| Torch | 15ft | 30ft | 1hr | Consumable |
| Torch, Tindertwig | 15ft | 30ft | Never | Reusable, never burns out |
| Torch, Sentry | 15ft | 30ft | 1hr | Pale blue, suspends invisibility |
| Torch, Repel Beast | 15ft | 30ft | 1hr | Crimson |
| Torch, Frigidflame | 15ft | 30ft | 1hr | Ice blue, cold/moonlight |
| Lantern, Hooded | 15ft | 30ft | 1hr/oil | 90-degree cone, consumes oil |
| Lantern, Bullseye | 30ft | 60ft | 1hr/oil | Full 360-degree radius |
| Candle / Candle, Basic | 5ft | 10ft | 1hr | Consumable |
| Candle, Calming | 5ft | 10ft | 1hr | Soft blue |
| Candle, Insectbane | 5ft | 10ft | 1hr | Green |
| Candle, Restful | 5ft | 10ft | 1hr | Warm amber |
| Sunrod | 15ft | 30ft | 1hr | Golden sunburst animation |

- Toggle lights on/off from inventory right-click context menu
- **Lantern fuel system** — Consumes Oil (flask preferred over basic). Only consumed when burn time runs out. Auto-refuels from inventory.
- **Real-time burn** option (1 real second = 1 game second)
- **Drop lights** on the canvas as temporary illumination tokens
- **Pick up** dropped lights via Token HUD
- **Party token support** — Lights work when gathered into a party token; transfers light to the party token automatically
- **Stack splitting** — Lighting a stacked torch splits off one item

---

### Flanking Checker
Automatic flanking detection during combat.

- If 2+ allied tokens are adjacent to a foe, the foe becomes Vulnerable
- Bidirectional — heroes can flank NPCs and vice versa
- Size restriction — foe must be no more than one size larger
- Correctly mirrors `outgoingSavesModifier` to world actor for saves (Favor on saves vs. flanked monsters)
- Auto-cleans on combat end

---

### NPC Abilities
Passive automation hooks for monster abilities.

| Ability | Effect |
|---------|--------|
| **Pack Instincts / Pack Tactics** | Saves against this NPC's attacks are Hindered when an ally is adjacent to the target |
| **Magic Ward I/II/III** | Cast Check penalty die (d4/d6/d8) when targeting this NPC |

---

### Countdown Dice Auto-Roller
Automatically rolls all countdown dice at the start of each combat round.

- Applies tick damage (burning, poison, etc.)
- Shrinks dice on a roll of 1; expires and removes status when d4 rolls 1
- Cleans up all dice when combat ends
- Toggleable via world setting

---

### Inventory System
Quality-of-life improvements for the Vagabond inventory.

- **Auto-stacking** — Dragging a duplicate item onto a character merges by incrementing quantity
- **Quantity badges** — Cards show a x badge when quantity > 1
- **Slot counting** — Correctly accounts for stacked item quantities in the slot display
- **Zero-slot rule** — Zero-slot items (rations, scrolls, candles) pool by gear category: every 10 units = 1 slot. Different scroll spells pool under "Scrolls".
- **Weightless flag** — "Weightless (no slot cost)" checkbox on zero-slot item sheets for truly zero-slot items (backpacks, trinkets, quest items)

---

### Spell Scroll Forge
GM tool to create consumable Spell Scrolls.

- Pick a spell from the compendium, configure delivery/dice/effects
- Scrolls cast with no mana cost and no Cast Check, then vaporize
- Value auto-calculated: 5g + 5g per mana equivalent
- Right-click a scroll in inventory → "Use Scroll" to cast
- Plays spell FX, rolls damage, posts chat card
- Accessible via "Forge & Loot" panel on the crawl bar

---

### Forge & Loot Panel
Left-click the "Forge & Loot" button on the crawl bar to open a tool picker:

- **Relic Forge** — Enchant equipment with relic powers
- **Scroll Forge** — Create consumable spell scrolls
- **Loot Manager** — Assign loot tables to NPCs, configure drop chances
- **Loot Log** — Session loot tracking with Discord export
- **Loot Generator** — Roll on core loot tables (Levels 1-10) with compendium item creation

Right-click for quick settings (loot drop toggle, drop chance slider, item drops toggle).

---

### Morale Checker
Automatically triggers morale checks during combat.

- **First death** — When the first NPC is defeated
- **Half the group** — When 50% of NPCs are down
- **Solo morale** — Single-enemy encounters, triggers at half HP

---

### Crawl Clock
SVG progress clock tracking dungeon exploration tension.

- Configurable sizes: Tiny (4), Small (6), Medium (8), Large (10), Huge (12)
- Advances per crawl turn; resets when filled
- Hideable during combat; persists across sessions

---

### Rest & Breather
Combined recovery dialog.

- Shows all PCs with HP, Luck, Mana, Fatigue, Might, Rations
- **Breather** — Consume a ration to heal based on Might
- **Rest** — Full recovery of HP, Luck, Mana; reduces Fatigue
- Auto-detects rations via the supply flag

---

### Encounter Tools
- **Encounter Check** — Quick d6 roll against configurable threshold
- **Encounter Roller** — Build Table, Browse NPCs, Roll Tables, and Mutate tabs
- **Monster Mutator** — 64 mutations with stat recalculation and custom names
- **Loot Generator** — Full roll-chain tracing with compendium item creation and "Give to Player" chat buttons

---

### Trap Builder
Macro-based trap system using v13 Scene Regions.

- Visual dialog to configure: save type, VFX, damage, status effects, countdown dice, tick damage, fatigue/mana/luck drain
- Auto-creates a Scene Region with "Execute Macro" behavior on token enter
- One-shot option disables the region behavior after first trigger
- Works with Sequencer for visual effects

---

### Item Sequencer Cone Patch
Temporary workaround for the system's item-sequencer not supporting cone animations (e.g. Breath Attack). Adds cone rendering using the same logic as the spell-sequencer.

---

## Settings

| Setting | Description | Default |
|---------|-------------|---------|
| Default Time Passes (minutes) | Minutes per Time Passes click | 10 |
| Encounter Roll: GM Only | Whisper encounter results to GM | On |
| Hide NPC Names in Strip | Remove NPC names from strip cards | Off |
| Auto-Hide Defeated Tokens | Hide defeated from strip | Off |
| NPC Action Menu | Show action menus on combat cards | On |
| Real-Time Light Burn | Burn lights in real time | Off |
| Enforce Crawl Movement | Block tokens beyond crawl speed | On |
| Enforce Combat Movement | Block tokens beyond combat speed | On |
| Enforce NPC Movement | Apply movement budget to hostile NPCs | Off |
| Auto-Roll Countdown Dice | Roll countdown dice at round start | On |

---

## Requirements

- **Foundry VTT** v13+
- **Vagabond** system v4.1.0+

### Optional
- **vagabond-extras** — Complements some features
- **vagabond-character-enhancer** — Class feature automation
- **Sequencer + JB2A** — Visual effects for spells, traps, and attacks

---

## Installation

Paste the following manifest URL into Foundry's module installer:

```
https://github.com/DimitroffVodka/vagabond-crawler/releases/latest/download/module.json
```

---

## Authors

- **DimitroffVodka**

---

*This module is an independent community project for the Vagabond RPG system and is not affiliated with Land of the Blind, LLC.*
