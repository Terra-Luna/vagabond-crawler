# Ability Automation Candidates

Review of the 84 unimplemented abilities from `abilities.json`, triaged by feasibility of automation inside this module. Tiers are my estimate; the final call on scope is yours.

**Legend:**
- Count = number of monsters carrying this ability
- Tier A = cheap once foundation is in place
- Tier B = real work, but a clear implementation path
- Tier C = deep mechanics that need meaningful design work
- Tier D = not worth automating (flavor, once-per-campaign narrative effects, unique gimmicks)

## At a glance

| Tier | Count of abilities | Monsters impacted |
|---|---:|---:|
| **A — Easy wins (fix + small adds)** | 11 | 54 |
| **B — Needs shared framework** | ~30 | ~90 |
| **C — Complex / novel** | ~15 | ~20 |
| **D — Skip (flavor / one-offs)** | ~28 | ~30 |

The big leverage is the **A → B transition**: most of tier B collapses to near-free once three shared frameworks exist — **aura effects**, **on-damage triggers**, and **turn-start save-or-status**. If you build those once, you unlock ~30 abilities at minimal additional code.

---

## Tier A — Easy wins

Small code, existing infrastructure covers them. Recommend doing these first.

### Fix Magic Ward (all variants) — 44 monsters
**Current bug:** `scripts/npc-abilities.mjs` injects a 1dN penalty die on the caster's Cast Check. The compendium text says "the Caster must spend an extra N Mana to affect it." Two different mechanics. Also I–III only; IV/V/VI are silently ignored.

**Fix:** Replace the `castPenalty` table with a `manaSurcharge` rule that intercepts spell-cast mana deduction. When a target has `Magic Ward N` AND it's the first spell affecting them this round, charge `+N` mana and flag the being so subsequent casts skip the surcharge until round end. Reset on combat round advance.

**Infrastructure needed:** A per-round "already-ward-charged" flag on each actor. Hook into the existing spell-cast wrapper in `npc-abilities.mjs` where mana is deducted.

**Touches:** `npc-abilities.mjs` (rewrite PASSIVE_ABILITIES `castPenalty` entries), `mutation-data.mjs` (fix Magic Ward I/II mutation descriptions so all three sources agree).

---

### Nimble — 15 monsters
> "Attacks against it can't be Favored if it can Move."

**Approach:** In `flanking-checker.mjs` or a new `incoming-favor-suppressor.mjs`, when computing incoming-attack favor against a being with Nimble, check `movement-tracker.mjs` for remaining move budget this turn. If `>0`, cap favor at "none."

**Infrastructure:** Movement budget is already tracked. Just need to plug into the Vagabond system's attack-favor resolution (the same code path Magic Ward wraps).

---

### Pack Hunter — 15 monsters
> "Targets within 5 feet of one of this Being's Allies are Vulnerable to its attacks."

**Approach:** Identical to existing `Pack Instincts` / `Pack Tactics` but the condition is "ally within 5' of **target**" (not of self), and the effect is applying Vulnerable instead of a save hinder. Add as a new PASSIVE_ABILITIES type `packHunter`.

**Infrastructure:** Proximity check (the module already does this for flanking). Incoming-attack hook (Magic Ward uses this).

---

### Soft Underbelly — 5 monsters
> "Its Armor is 0 while it is Prone."

**Approach:** When resolving an incoming attack, if the target is Prone and has Soft Underbelly, override effective armor to 0. Hook: the same attack-resolution path already wrapped.

---

### Zealot — 1 monster
> "Can't be Charmed or Frightened."

**Approach:** This should already be encoded as `statusImmunities: ["charmed", "frightened"]` on the actor. Confirm in the data — if missing, the fix is a compendium edit, not automation.

**Touches:** Data check only. The Vagabond system enforces `statusImmunities` natively.

---

### Leadership — 1 monster
> "While it is alive and in sight, its Allies always pass Morale Checks and can't be Frightened."

**Approach:** Intercept morale check roller (`morale-checker.mjs`). Before rolling, check if any ally with Leadership is alive and within the actor's field of view. If so, auto-pass.

**Infrastructure:** Morale check hook is a function the module already owns. Line-of-sight is straightforward canvas math.

---

### Ocular — 1 monster
> "Checks to make it Blinded are Favored."

**Approach:** Simple save-modifier hook: when a save against `blinded` is made by a being with Ocular, grant favor.

---

### Blinded (ability) — 1 monster
> "Blinded without its Echolocation."

**Approach:** Apply the Blinded status automatically when the actor doesn't have an `Echolocation` status or is in an anti-sound zone. Low complexity but the triggering condition is game-specific; safer to defer until echolocation is modelled.

---

### Sunblinded / Sunlight Hypersensitivity / Sunlight Aversion / Sun-Averse — 7 monsters combined
> "Blinded / Burning / ... while in Sunlight."

**Approach:** `light-tracker.mjs` already tracks "is this scene's time sunlight hours." Add a sunlight-check helper and a per-actor hook that applies the relevant status when a being with a sun-averse ability enters sunlight (or sunlight begins).

**Infrastructure:** Day/night state exists in light-tracker. The only new thing is the mapping `ability → status-to-apply`.

---

### Sneak Attack — 2 monsters
> "Once per Turn, it deals 2 (d4) additional damage with an attack against a Vulnerable Target. This attack ignores Armor and can explode."

**Approach:** On outgoing-attack hook, if target has Vulnerable and the attacker hasn't used Sneak Attack this turn, append `+d4` to the damage roll and set a per-turn flag. Clear flag on turn-end.

---

### Tactical — 1 monster
> "Targets Save against its attacks as if Vulnerable if at least one of this Being's Allies are within 5 feet of the Target."

**Approach:** Identical to Pack Hunter but the "Vulnerable" is applied to the save side, not the attack side. Same infrastructure. Bundle together.

---

## Tier B — Needs shared framework, then many abilities follow

These abilities share patterns. Build the framework once and many become near-free to add.

### Framework 1: Turn-start save-or-status aura (visibility-triggered)

Enemies seeing the being for the first time, and at start of their turn thereafter, make a Will save or gain Frightened / Confused / Charmed. Handles:

- **Terror I, II, III** (18 monsters) — Will save or Frightened, duration varies by tier
- **Maddening I** (2) — Will save or Confused
- **Enchanting Song** (1) — Will save or Charmed (hear, not see)
- **Aging Terror II** (1) — Frightened + narrative aging
- **Petrifying Visage** (1) — fatigue accumulation, curse at threshold

**Build:** a `gaze-aura.mjs` module with a common "on-turn-start, if not-yet-saved-against-this-enemy, prompt save" pattern. `PASSIVE_ABILITIES` entries name the save type, status, and duration. Each ability is a one-line entry.

---

### Framework 2: Proximity auras (continuous effect)

A being within N distance gets a status applied. Handles:

- **Fear Aura** (2) — Frightened aura, Near
- **Flame Aura** (1), **Living Fire** (5), **Engulfer** (4), **Consume** (1), **Spore Cloud** (1) — Burning / Sickened auras
- **Stench** (3) — Sickened while Near

**Build:** an `aura-effects.mjs` that checks proximity each turn-start / on-movement and applies/removes the mapped active effect. Flanking-checker already does similar proximity math.

---

### Framework 3: HP-threshold / damage-triggered status

Specific HP fraction or damage event → status toggle. Handles:

- **Bloodied Rage** (1) — Berserk at ≤20 HP
- **Bloodlust** (2) — Berserk at ≤half HP, extra attack while Berserk
- **Bloodthirst** (3) — permanent Berserk + half-HP target vulnerability
- **Rage** (1) — Berserk on attack, reduce damage per die
- **On-Sight** (1) — permanent Berserk
- **Flame Anger** (1) — Berserk on fire damage
- **Scare to Death** (1) — dies on failed morale / Frightened

**Build:** an `hp-trigger.mjs` that watches `updateActor` for HP changes and evaluates thresholds. Hooks exist; just needs the lookup table.

---

### Framework 4: On-damage-type save-or-status

Taking damage of type X triggers a save-or-status. Handles:

- **Freeze Susceptibility** (1), **Pudding Nature** (1) — Dazed after Cold
- **Unbaked** (1) — Dazed after ≥5 Fire damage
- **Flame Anger** (1) — see above (same infra)
- **Parasite** (1) — dies on Fire

**Build:** Hook the damage-application chain (Vagabond system exposes this — used by countdown-roller.mjs). Lookup by monster → damage type → effect.

---

### Framework 5: Movement-triggered bonus damage / status

If the being moves ≥N ft before an attack, the attack gets a rider. Handles:

- **Pounce** (7), **Pouncer** (1) — 20' move → Target knocked Prone
- **Leap** (1) — 20' move → save or Prone + damage
- **Burrow Burst** (1) — 20' move → breach attack bonus damage
- **Whirlwind** (1) — start-of-turn save for everything Near

**Build:** `movement-tracker.mjs` already tracks per-turn distance moved. Add a pre-attack hook that reads distance and appends a rider to the attack.

---

### Regeneration family — 8 monsters
- **Regenerate I** (2), **Regenerate II** (4), **Regenerate III** (1), **Supreme Hellspawn** (1), **Hydra Regrowth** (2, but see Tier C for the head-growing clause)

**Approach:** Simple turn-start hook: heal HP by formula. Per-ability `healFormula`. `Hydra Regrowth` needs the head-regrowth side-effect which escalates it to Tier C.

---

### Invisibility family — 4 monsters
- **Shadow Stealth** (2) — Invisible in the Dark
- **Chameleon Skin** (1) — Detect Checks Hindered
- **Invisible** (1) — attackers are Blinded when targeting

**Approach:** Shadow Stealth needs scene darkness detection (light-tracker has it). Chameleon Skin is a save-modifier. Invisible is the Vagabond Invisible status (should be a compendium data tag, not automation).

---

### Restraint family — 5 monsters
- **Sticky** (5) — Hinder escape checks, physical contact → Endure or Restrained
- **Adhere** (1), **Lockjaw** (1), **Latcher** (1) — Hinder escape checks
- **Flesh Burrow** (1) — burrows and sickens

**Approach:** Restraint is an existing status. Modify the save-against-status flow to apply Hinder when appropriate. Small hook.

---

## Tier C — Complex / novel mechanics

These require real design work beyond a lookup table.

### Body-part severing — 8 monsters
- **Multi-Headed** (2), **Tentacles** (4), **Tendrils** (1), **Tentacle** (1), **Flails** (1)

"Starts with N parts, -X penalty to target one, sever at Y damage." Needs:
- UI state tracking N on each token
- A targeted-attack-part mechanic in the action menu
- A severance-on-damage-threshold hook
- A hydra-specific regrow-on-damage clause

This is a real mini-feature. Deferred is honest.

---

### Pudding Split — 2 monsters
> "If larger than Small, when subjected to Shock or Slash, splits into two Puddings with half current HP, one size smaller."

Dynamic actor-spawning on damage with size decrement. Doable but requires thoughtful lifecycle — cleanup, loot handling, encounter-tracking impact.

---

### Fiery Revival — 1 monster
> "(1/Day): If it dies, a ball of fire erupts out as a Near Aura, 55 damage, Burning. Revived in 1 Round at full HP. Always tries to flee until ability refreshes."

Death-event → area damage → timed resurrection → AI-override. Each piece is doable, but integrating them is a one-off boss feature.

---

### Cloaking — 2 monsters
> "While it has a Target Restrained, attack damage dealt to it is halved and also dealt to the Target."

Requires a "who is restraining whom" relationship tracker and a damage-redirect hook. Moderately complex but confined.

---

### Iron Absorption — 1 monster
Weapon gets stuck in the body; recoverable on kill. Needs item-state tracking across actors.

---

### Antimagic Vulnerability — 4 monsters
> "Dazed for Cd4 if affected by Dispel or other antimagic."

Needs a "was-hit-by-antimagic-spell" signal. The Vagabond system might already expose a spell-tag list; if so, this drops to Tier B. Worth a quick check before committing.

---

### Self-Destruct / Instant Transmission / Booze Hound / etc. — 5 monsters
Single-monster once-per-campaign-ish narrative effects. Doable but each is an hour of custom code for a single monster. Skip unless they become plot-relevant.

---

## Tier D — Skip for now

Flavor-only, unique one-offs, or things the system / GM handles better.

- **Leadership** → actually small, moved to Tier A on reflection
- **Lemoniphobic** — joke ability
- **Booze Hound** — narrative sensor, no combat impact
- **Mind of Madness** — "Can Cast while Berserk" — depends on whether Berserk currently blocks casting; data check
- **One-Eyed** — "attacks as Vulnerable against Targets further than Near" — add later as incoming-attack favor rule
- **Living Sick** — narrative death condition (sunlight / cures kill it)
- **Scare to Death** — bundled with HP-threshold framework
- **Sunlight Aversion** — bundled with sunlight framework

---

## Recommended build order

1. **Fix Magic Ward** (standalone, high-impact, already half-built) — 1 PR.
2. **Nimble + Pack Hunter + Soft Underbelly + Sneak Attack** (bundle — all share the incoming/outgoing attack hooks) — 1 PR.
3. **Sunlight framework + all sun-averse abilities** (7 monsters collapse to one small module) — 1 PR.
4. **Turn-start save-or-status aura framework + Terror I/II/III + Maddening I + Enchanting Song** (21 monsters) — 1 PR.
5. **Proximity aura framework + Fear Aura + fire auras + Stench** (18 monsters) — 1 PR.
6. **HP-threshold + on-damage frameworks + Berserk/Rage family** (12 monsters) — 1 PR.
7. **Movement-triggered rider framework + Pounce family** (10 monsters) — 1 PR.
8. **Regeneration family** (8 monsters) — 1 PR.

After 8 PRs the `automationStatus` column on `abilities.json` should move ~70 abilities from `unimplemented` to `implemented`, leaving only Tier C/D.

---

## Where to keep this tracked

When we pick this up, I'd extend the audit so `abilities.json` has a new `automationTier` field (`A`/`B`/`C`/`D`/null) alongside `automationStatus`. That way the audit itself becomes the progress tracker — as PRs land, entries flip from `unimplemented` to `implemented` and the `INDEX.md` dashboard shows the delta.
