# Changelog

## v1.8.4

### New Features
- **Hide NPC Health Bar from Players** — New world setting in module config. When enabled, players no longer see HP bars or HP values on NPC/GM cards in the crawl strip. The GM still sees them. Defaults off.
- **Monster Audit Database** — Dev/maintenance dataset covering every NPC across `vagabond.bestiary`, `vagabond.humanlike`, and `vagabond-character-enhancer.vce-beasts` (348 actors total). Ships as committed JSON under `docs/audit/` plus readable Markdown renderings (`abilities.md`, `actions.md`, `INDEX.md`, `by-type/*.md`). Includes 178 unique abilities with automation status and 245 unique actions with attack/damage breakdowns. Surfaces 426 findings for dead ability text and data inconsistencies — including a broken Magic Ward implementation (compendium says `+N Mana` cost; `scripts/npc-abilities.mjs` injects a `1d4/1d6/1d8` roll penalty instead; affects 35 monsters) and 9 monsters using Magic Ward IV/V/VI which are entirely unimplemented. Regenerates via `scripts/audit/*` (extract → analyze → render). No runtime behavior change.

### Changes
- **Relic Forge always enabled** — Removed the `relicForgeEnabled` setting. The Relic Forge is now always available; it remains GM-only at open.

## v1.8.3

### Bug Fixes
- **Crawl menu stuck after combat** — Fixed the crawl bar becoming unresponsive when ending an encounter and clicking "No" on the "Resume crawl mode?" prompt. Previously the bar stayed in a paused state with non-functional buttons because `game.combat` was already deleted. Now clicking "No" cleanly ends the crawl, and clicking "Yes" resumes it as before.

## v1.8.2

### Bug Fixes
- **Familiar & Summon action cast checks** — When a player clicks an action on a summoned creature or familiar in the CrawlStrip dropdown, the roll now routes through VCE's Arcana/Mysticism cast check (matching the character sheet behavior). Previously the action fired directly without the required check. Requires vagabond-character-enhancer v0.2.8+. Falls back to the plain NPC action handler when VCE is not installed or the summon/familiar cannot be matched to a caster.

## v1.8.1

### Bug Fixes
- **Gold Sink integration** — Added missing CrawlStrip action menu integration for the Merchant class Gold Sink feature (vagabond-character-enhancer). Favorited shop items now appear as a tab in the CrawlStrip action panel for Merchant characters, with prices and quick-buy. This code was present locally but was never committed to the release.

## v1.8.0

### New Features

#### Merchant Shop
- **Full buy/sell system** — GM stocks items from compendium packs or designates an NPC actor as a merchant. Players buy items (money deducted, item added to inventory) and sell items (item removed, money added at configurable sell ratio).
- **Catalog tab** — Browse 484 items across Gear, Weapons, Armor, and Alchemical Items compendium packs with search, pack/folder filters, and sort by name or value. GM can toggle catalog visibility per shop.
- **Gamble tab** — Players pay a flat gold fee to roll on loot tables. GM configures gamble options with custom names, table sources (built-in Loot Levels 1-10 or any world RollTable), and custom prices.
- **Buy markup/discount** — GM sets a percentage multiplier (10-500%) per shop. 100% = normal, 150% = shady markup, 80% = friendly discount. Applies to Buy and Catalog tab prices.
- **GM-controlled broadcast** — GM opens shop privately to configure, then clicks "Open Shop for All Players" to broadcast. Window title shows Open/Closed status.
- **Junk marking** — Right-click equipment on character sheet to "Mark as Junk." Junk items sort to top of Sell tab with red indicator. "Sell All Junk" button sells all marked items at once.
- **Transaction log** — All buy/sell/gamble transactions logged per player with Discord markdown export.
- **Session Summary** — Combined export merging loot tracker + merchant logs, grouped by player with per-player totals.
- **Item preview** — Single-click item rows to expand inline description. Double-click to open the full item sheet.

#### Party Inventory
- **New window** showing all player characters' inventories side by side in columns. Shows equipped status (green border), junk markers (red border), slot counts, wallet, and item values. Filters to characters with friendly tokens on the active scene.

#### Loot Generator — Relic Active Effects
Loot-generated relic items now have **functional Active Effects** that apply when equipped. Uses the same power definitions as the Relic Forge.

**Working AE powers (50 powers with direct system field changes):**
- **Weapon +1/+2/+3** — `system.universalWeaponDamageBonus` (+1/+2/+3 weapon damage)
- **Armor +1/+2/+3** — `system.armorBonus` (+1/+2/+3 armor)
- **Protection +1/+2/+3** — `system.saves.reflex/endure/will.bonus` (+1/+2/+3 to all saves)
- **Trinket +1/+2/+3** — `system.universalSpellDamageBonus` (+1/+2/+3 spell damage)
- **Strike I/II/III** — `system.universalWeaponDamageDice` (+1d4/+1d6/+1d8 bonus damage die)
- **Swiftness I/II/III** — `system.speed.bonus` (+5/+10/+15 speed)
- **Climbing** — `system.movement.climb` (grants Climb)
- **Clinging** — `system.movement.cling` (grants Cling)
- **Flying** — `system.movement.fly` (grants Fly)
- **Levitation** — `system.movement.levitate` (grants Levitate)
- **Blinking** — `system.movement.blink` (grants Blink teleport)
- **Waterwalk** — `system.movement.waterwalk` (walk on water)
- **Webwalk** — `system.movement.webwalk` (move through webs)
- **Displacement** — `system.defenderStatusModifiers.attackersAreBlinded` (attackers treated as blinded)
- **Nightvision** — `system.senses.darksight` (grants Darksight)
- **Echolocation** — `system.senses.echolocation` (grants Echolocation)
- **Tremors** — `system.senses.tremorsense` (grants Seismicsense)
- **Detection** — `system.senses.detection` (detect Being types)
- **Sense Life** — `system.senses.senseLife` (sense living creatures)
- **Sense Valuables** — `system.senses.senseValuables` (sense gold/gems)
- **Telepathy** — `system.senses.telepathy` (grants Telepathy)
- **True-Seeing** — `system.senses.allsight` (see through illusions)
- **Bravery** — `system.favorOnSaveVs.frightened` (Favor on Frightened saves)
- **Clarity** — `system.favorOnSaveVs.confused` (Favor on Confused saves)
- **Repulsing** — `system.favorOnSaveVs.charmed` (Favor on Charmed saves)
- **Ambassador** — `system.speakAllLanguages` (understand all languages)
- **Aqua Lung** — `system.breatheUnderwater` (breathe underwater)
- **Burning I/II/III** — `system.onHitBurningDice` (Burning status on hit, Cd4/Cd6/Cd8)
- **Warning** — `system.cannotBeSurprised` (cannot be surprised)
- **Invisibility II** — `system.defenderStatusModifiers.attackersAreBlinded` (permanent invisibility)
- **Cursed: Vulnerability -1/-2/-3** — `system.armorBonus` (-1/-2/-3 armor penalty)
- **Cursed: Weakness -1/-2/-3** — `system.universalWeaponDamageBonus` (-1/-2/-3 damage penalty)
- **Cursed: Anger** — `system.autoFailSaveVs.berserk` (auto-fail Berserk saves)
- **Cursed: Cowardice** — `system.autoFailSaveVs.frightened` (auto-fail Frightened saves)
- **Cursed: Gullibility** — `system.autoFailSaveVs.charmed` (auto-fail Charmed saves)
- **Cursed: Doom** — `system.healingCappedPerDie` (healing capped at 1 per die)

**Flag-based powers (39 powers — AE flags stored for runtime handling by relic-effects.mjs):**
- **Jumping I/II/III** — `jumpMultiplier` flag (x2/x3/x4 jump distance)
- **Elemental Resistance** (Acid/Cold/Fire/Poison/Shock) — `damageResistance` flag (half damage)
- **Darkness I/II/III** — `lightType`/`lightRange` flags (darken light)
- **Moonlight I/II/III** — `lightType`/`lightRange` flags (shed moonlight)
- **Radiant I/II/III** — `lightType`/`lightRange` flags (shed sunlight)
- **Lifesteal I/II/III** — `onKillHealDice` flag (heal on kill)
- **Manasteal I/II/III** — `onKillManaDice` flag (restore mana on kill)
- **After-Image I/II** — `usesPerDay` flag (illusory duplicate)
- **Invisibility I** — flag-only (skip Move to become invisible)
- **Blasting** — `blastDamage`/`usesPerDay` flags (6d6 blast, 1/day)
- **Precision** — `usesPerDay` flag (auto-hit, 1/day)
- **Benediction** — flag-only (revive on death, 1/week)
- **Soul Eater** — flag-only (killed creatures can't be resurrected)
- **Vicious** — flag-only (extra crit damage)
- **Vorpal** — flag-only (behead on crit)
- **Infinite** — flag-only (endless mundane item supply)
- **Loyalty** — flag-only (weapon returns when thrown)
- **Ace** — adds weapon property (Brutal/Cleave/Keen/etc.)

**Not yet implemented (require GM adjudication):**
- **Bane** (Niche/Specific/General) — `baneTarget`/`baneDice` flags stored but bonus damage requires manual tracking of target creature type during combat
- **Protection vs creature type** (Niche/Specific/General) — `wardTarget` flags stored but Favor on saves vs specific creatures requires runtime creature-type matching

#### Loot Generator — Item Generation Overhaul
- **Treasure chain** produces real items: gems (Uncommon/Rare/Very Rare with blue/red/green gem icons), trade goods (gold/silver/copper ingots, common/exotic/rare spices), art objects (tapestry, painting, figurine, bust, pottery, artifact), jewelry (amulet, ring, bracelet, pendant, circlet, etc.), clothing (belt, boots, cloak, etc.)
- **Spell Scrolls** generated as actual usable scroll items via the Scroll Forge pattern with random spells, proper flag data, and spell icons
- **Relic power values** from the core book added to weapon/armor `baseCost` — a Longsword +2 now correctly shows as 1250g 40s instead of just 40s
- **Enchantment Scrolls and Accessories** handled as proper items with correct sub-table rolls
- **Trinkets** always resolve to a compendium item
- **Reroll/Add meta-powers** properly implemented — higher-level rolls that hit "Reroll as d8, twice" or "Add d10 to this roll" entries now produce actual relic powers instead of empty results
- **Niche powers** pull NPC names from last combat or random world NPC instead of "Unknown Foe"
- **Chat cards** use system `vagabond-chat-card-v2` styling with parchment background, proper fonts, and black text
- **Item values** displayed in both the Loot Generator UI and chat cards, summed across all items per roll

### Bug Fixes
- **Currency math** — Fixed conversion rates: 100 copper = 1 silver, 100 silver = 1 gold (was incorrectly 10:1)
- **Compendium matching** — Curly apostrophe normalization for items like "Crone's Ire", "Alchemist's Fire"
- **Typo fixes** — "Tendertwig" → "Tindertwig", "Oil, Annointing" → "Oil, Anointing"
- **Stale UUIDs** — Poison Basic and Potion Healing I had truncated compendium UUIDs, with name-based fallback
- **Empty loot rolls eliminated** — Every roll path now produces items or currency
- **Resistance potion names** — "Potion, Resistance (Cold)" → "Potion, Cold Resistance" to match compendium
- **Weapon/Trinket +N naming** — Power entries now correctly say "Weapon/Trinket" per source spreadsheet
- **Missing Movement entry** — Added Jumping 3 (entry 14) to Movement table
- **Movement overflow** — d8+6 rolling 14 now correctly gives Jumping 3 instead of clamping
- **Resistance rerolls** — "reroll 4s" and "reroll 1-3s" instructions now implemented with correct clamping
- **Accessory sub-table** — Now properly rolls d4: 1-2 = Jewelry, 3-4 = Clothing per spreadsheet instructions
- **Relic power pricing** — Fixed case-insensitive matching, "Bane," comma prefix, "Protection vs" prefix
- **Pixie Dust** — Fixed compendium price from 10s to 10g
- **Golden Needle** — Fixed compendium price from 50s to 50g
- **Sell tab** — Removed filter that hid items with 0 sell value, all equipment now shows
- **Font sizes** — Increased across merchant shop and loot generator UI for readability
- **Session summary** — Fixed case mismatch (`LootTracker` vs `lootTracker`) that excluded loot claims
- **Give buttons** — Both chat card and in-app "Give" buttons now log to LootTracker

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
