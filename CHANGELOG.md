# Changelog

## v1.7.0

### Bug Fixes
- **Favor/Hinder 1-for-1 cancellation** — Multiple sources of Favor and Hinder now properly cancel 1-for-1 per the Vagabond rules. Previously, the system used sequential state-machine logic that collapsed same-direction sources (e.g. Prone + Vulnerable both granting Favor on incoming attacks counted as only 1 Favor instead of 2). Now each Active Effect is counted as a separate source, so a Flanked attacker (1 Hinder) attacking a Prone + Flanked target (2 Favor) correctly resolves to Favored.
- **Save rolls count AE sources** — Saves against unlinked token attacks now read the token actor's Active Effects instead of the world actor, which was missing combat-specific statuses like Prone and Vulnerable (Flanked).

### System Changes (vagabond system)
- Added `resolveMultipleFavorHinder()`, `countFavorHinderFromEffects()`, and `getFavorHinderSources()` to `VagabondRollBuilder` for counting-based Favor/Hinder resolution.
- Weapon attacks, spell casts, saves, stat checks, and initiative rolls all use the new counting logic.
- Save rolls now prefer the token actor over the world actor when resolving the attacker's outgoing modifiers.

## v1.6.4

### Bug Fixes
- **Release packaging** — Include `icons/` directory in module.zip (fixes missing shamrock.svg, dragon-head.svg, light-sabers.svg on fresh installs and updates).

## v1.6.3

### Bug Fixes
- **State sync isolation** — Deep clone socket state in `CrawlState.applySync` to prevent shared references across clients.
- **Scroll Forge chat** — `ChatMessage.create` now properly awaited so failures are caught.
- **Item drop permissions** — Use `CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER` instead of magic number.
- **Movement tracker leak** — Clear pending deduction when a move is blocked, preventing stale entries.
- **Loot pass mutation** — Deep clone items when moving to the unclaimed pool to prevent shared references.
- **Relic Forge mutation** — Deep clone power objects to prevent mutation of source definitions.
- **Light tracker interval** — Guard against rapid right-click creating leaked polling intervals.
- **Encounter roll bias** — Fix `Math.ceil(Math.random() * 6)` returning 0 in distance/reaction rolls.
- **Compendium encounter tables** — Use `fromUuid`/`fromUuidSync` so compendium RollTables work when set as the active encounter table (previously only world tables were found).
- **Table overwrite safety** — Update existing encounter tables in-place instead of delete-then-create, preventing data loss if creation fails.
- **Silent formula errors** — All encounter formula catch blocks now log warnings instead of swallowing errors silently.
- **Deprecated API** — Use `ActiveEffect#img` instead of deprecated `#icon` in crawl strip (eliminates v12 deprecation warning).

### Code Quality
- **Listener leak prevention** — All 7 ApplicationV2 windows now use AbortController to clean up event listeners on re-render, preventing accumulation over long sessions.
- **Shared distance utility** — Extracted duplicated `distanceFt()` from flanking-checker and npc-abilities into `combat-helpers.mjs`.
- **Browse NPC optimization** — Eliminated redundant double-fetch of compendium NPCs in encounter roller browse tab.
- **Null guards** — Added guards for crawl strip RAF callback and `game.user.targets` iteration in NPC abilities.
- **Dead code removal** — Removed orphaned alchemy-cookbook.mjs, alchemy-helpers.mjs, and alchemy-cookbook.hbs (~2,300 lines) — functionality moved to vagabond-character-enhancer.

## v1.6.2

### Bug Fixes
- **Loot claim chat message crash** — Fixed `sourceName` used before declaration (temporal dead zone) and undefined `parts` variable in `_handleTakeAll`, which caused a ReferenceError when claiming loot from a bag.

### Code Quality
- **Crawl bar menu helpers** — Extracted shared `_positionMenu`, `_attachDismiss`, and `_dismiss` helpers, replacing ~50 lines of duplicated menu positioning and click-away dismiss logic across three menu/panel builders.
- **Terrain difficulty early exit** — Movement cost calculation now exits early once max difficulty (3×) is found, skipping unnecessary region checks.

## v1.6.1

### New Features
- **Disposition-based hero/NPC split** — Crawl strip now sorts members by token disposition (Friendly vs Hostile) instead of actor type. Friendly NPC summons appear on the Heroes side.
- **NPC action menus on friendly NPCs** — Friendly NPC summons on the Heroes side now show Actions/Abilities tabs during combat.
- **Party token movement tracking** — Party-type actors (summon groups, vehicles) have their speed/crawl speed read correctly and movement enforced on the crawl strip.
- **Rollback Movement for players** — Players can now use the Rollback Movement button on their Token HUD. Relays to GM via socket.
- **Party token light support** — Lights work when characters are gathered into a party token. Lighting/dousing/burnout transfers to the party token automatically.

### Bug Fixes
- **Movement reset on phase change** — Movement budgets now reset on every phase transition (Heroes→GM and GM→Heroes), not just on new crawl turns.
- **Movement reset for unlinked tokens** — `resetAll` now finds the canvas token actor for unlinked tokens instead of the world actor, fixing stale movement flags.
- **Burnout party fallback** — Light burnout and refuel correctly apply/remove light from the party token when the character has no tokens on canvas.

### Docs
- **README.md** — Complete rewrite covering all features through v1.6.1.
- **CLAUDE.md** — Updated file map (32 files), added patterns for world/token actor handling, disposition-based sorting, party speed, skipStack, player socket relay, v13 render hooks.

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
