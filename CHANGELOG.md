# Changelog

## v1.6.0

### New Features
- **Forge & Loot Panel** — Left-clicking the "Forge & Loot" button now opens a tool picker panel with all five tools: Relic Forge, Scroll Forge, Loot Manager, Loot Log, and Loot Generator. Right-click still opens the settings menu.

### Bug Fixes
- **Dropped item pickup permissions** — Dropped items, loot bags, and dropped light sources now have Owner permission for all players, allowing them to interact with the Token HUD pickup button.
- **Lit torch stacking** — Lit light sources no longer auto-merge into unlit stacks when picked up. Fixes the infinite torch exploit where picking up a lit torch stacked it with unlit torches, leaving the ground token intact.
- **Light/item pickup cleanup** — Pickup operations now use `skipStack` to bypass the auto-merge hook, ensuring the dropped token and temporary actor are always cleaned up.

## v1.5.0

### New Features
- **Alchemical Torches** — Tindertwig (never burns out), Sentry (pale blue, suspends invisibility), Repel Beast (crimson), Frigidflame (ice blue). Each has distinct light color and animation.
- **Alchemical Candles** — Calming (soft blue), Insectbane (green), Restful (warm amber). All function as 5ft bright / 10ft dim light sources with 1-hour burn time.
- **Sunrod** — 15ft bright / 30ft dim with golden sunburst animation. Consumable, 1-hour duration.
- **Candle, Basic** — "Candle" and "Candle, Basic" now both match the candle light source.

### Bug Fixes
- **Flanking Vulnerable saves** — Players now correctly get Favor on saves against Vulnerable (flanked) monsters. The save system reads the attacker from the world actor, but flanking applied the effect to the synthetic token actor. Fixed by mirroring the `outgoingSavesModifier` to the world actor for unlinked tokens.
- **Flanking cleanup** — Combat-end cleanup now covers both world actors and synthetic token actors on the current scene.

## v1.4.0

### New Features
- **Spell Scroll Forge** — GM tool to create consumable Spell Scrolls. Pick a spell from the compendium, configure delivery type, damage dice, and effects. Scrolls cast the stored spell with no mana cost and no Cast Check, then vaporize. Value auto-calculated at 5g + 5g per mana equivalent. Accessible via "Forge & Loot" → "Open Scroll Forge" on the crawl bar.
- **Scroll Casting** — Right-click a spell scroll in inventory → "Use Scroll" to cast. Plays spell FX, rolls damage, posts chat card, and consumes the scroll.
- **Inventory Slot Rules** — Zero-slot items (scrolls, rations, candles, etc.) now follow the "10 per slot" rule: every 10 units of the same gear category occupy 1 inventory slot. Different scroll spells pool together under the "Scrolls" category. Stacked normal items correctly multiply slots by quantity.
- **Weightless Flag** — New "Weightless (no slot cost)" checkbox on zero-slot item sheets. Flagged items are truly zero-slot and never count toward inventory (e.g. backpacks, trinkets, quest items).

### Improvements
- Scroll Forge added to the "Forge & Loot" context menu on the crawl bar.
- Auto-stack system bypassed during light source splitting (prevents torches merging back into stacks).

## v1.3.0

### New Features
- **Countdown Dice Auto-Roller** — Automatically rolls all countdown dice at the start of each combat round. Applies tick damage (burning, poison, etc.), shrinks dice on a roll of 1, and cleans up all dice when combat ends. Toggleable via world setting.
- **Inventory Stacking** — Dragging a duplicate item onto a character auto-merges it by incrementing quantity instead of creating a separate item. Inventory cards show a ×N quantity badge. The Slots display correctly accounts for stacked item quantities.
- **Lantern Fuel System** — Hooded and Bullseye lanterns now consume Oil (flask or basic) as fuel. Oil is only consumed when the lantern has no burn time remaining. Lanterns auto-refuel from inventory when oil runs out. Prefers Oil, flask over Oil, Basic.
- **Lantern Light Profiles** — Hooded Lantern: 90° directional cone (15ft bright / 30ft dim). Bullseye Lantern: 30ft bright / 60ft dim (full radius).
- **Light Source Splitting** — Lighting a stacked torch (qty > 1) splits off one torch as a separate item and lights it, leaving the stack intact.

### Bug Fixes
- **Item Sequencer Cone Patch** — Workaround for system item-sequencer not supporting cone animations (e.g. Breath Attack). Temporary patch until system adds native support.
- **Selfless Trigger Fix** (character-enhancer) — Selfless no longer triggers on attack cards, only on actual damage application messages.

## v1.2.0

### New Features
- **Pack Instincts / Pack Tactics** — NPC passive ability automation. When an NPC with Pack Instincts attacks a target, and an ally of that NPC is adjacent to the target, saves against the attack are Hindered. Works from both the crawl strip action menu and the actor sheet. Effect auto-cleans on turn change.
- **Terrain Difficulty** — Movement tracker now queries Scene Region "Modify Movement Cost" behaviors. Tokens moving through difficult terrain have their movement cost multiplied accordingly.
- **Enforce Combat Movement setting** — New world setting to toggle movement enforcement during combat independently from crawl movement enforcement.

### Improvements
- Movement distance is now computed once per token move instead of twice (deduplication).
- Terrain difficulty function accepts elevation as a parameter instead of performing a canvas token lookup.

## v1.1.0
- Alchemist Cookbook, NPC abilities (Magic Ward), flanking checker, combat strip enhancements.
