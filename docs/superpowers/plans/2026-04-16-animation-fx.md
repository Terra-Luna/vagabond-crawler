# Animation FX System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers-extended-cc:subagent-driven-development (recommended) or superpowers-extended-cc:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Absorb `vagabond-item-fx` into `vagabond-crawler` as a unified `AnimationFx` subsystem and extend it with centralized NPC action animation support (hit + miss animations, hit + miss sounds, type smart-defaults).

**Architecture:** One singleton subsystem (`AnimationFx`) handling resolver + playback + chat-hook trigger. One ApplicationV2 config window (`AnimationFxConfigApp`) with tabs per category. All presets share a unified schema with `hit`/`miss` blocks. Config stored in a single world setting. The existing Sequencer cone patch in `npc-abilities.mjs` is retired and its logic absorbed into the unified playback.

**Tech Stack:** Foundry VTT v13+ (ApplicationV2, HandlebarsApplicationMixin), ES modules (`.mjs`), Sequencer module API, Vagabond system (v4.1.0+). Testing via Foundry MCP (`mcp__foundry-vtt__evaluate`).

**Reference spec:** `docs/superpowers/specs/2026-04-16-animation-fx-design.md`

**Source module to port from:** `E:/FoundryVTTv13/data/Data/modules/vagabond-item-fx/`

---

### Task 0: Scaffold subsystem + register settings

**Goal:** Create the empty subsystem module, register all world + client settings, and wire it into the crawler entry point so `game.vagabondCrawler.animationFx` exists at ready.

**Files:**
- Create: `scripts/animation-fx.mjs`
- Create: `scripts/animation-fx-defaults.mjs` (empty export stub; real data in Task 1)
- Modify: `scripts/vagabond-crawler.mjs` (add import + init hook + ready hook)

**Acceptance Criteria:**
- [ ] `game.vagabondCrawler.animationFx` is a singleton object with `active`, `init()`, `registerSettings()`, `open()` methods
- [ ] Settings registered: `animationFxConfig` (world, hidden), `animationFxTriggerOn` (world), `animationFxEnabled` (client), `animationFxScale` (client), `animationFxSoundEnabled` (client), `animationFxMasterVolume` (client)
- [ ] Default `animationFxConfig` value is the object from `animation-fx-defaults.mjs` (empty stub OK for now)
- [ ] Loading the module in Foundry produces no console errors

**Verify:** Reload Foundry, then via MCP:
```js
mcp__foundry-vtt__evaluate: "game.vagabondCrawler.animationFx && Object.keys(game.settings.storage.get('world').filter(s => s.key.startsWith('animationFx')))"
```
Expected: subsystem present, 2 world settings registered.

**Steps:**

- [ ] **Step 1: Create `scripts/animation-fx-defaults.mjs` stub**

```js
// scripts/animation-fx-defaults.mjs
// Default Animation FX preset data. Populated in Task 1.

export const DEFAULT_ANIMATION_FX_CONFIG = {
  weapons: {},
  weaponSkillFallbacks: {},
  alchemical: {},
  gear: {},
  npcActions: {},
};
```

- [ ] **Step 2: Create `scripts/animation-fx.mjs` skeleton**

```js
// scripts/animation-fx.mjs
import { DEFAULT_ANIMATION_FX_CONFIG } from "./animation-fx-defaults.mjs";

const MODULE_ID = "vagabond-crawler";

export const AnimationFx = {
  _hookIds: [],
  _ready: false,

  get active() { return this._ready; },

  registerSettings() {
    game.settings.register(MODULE_ID, "animationFxConfig", {
      scope: "world",
      config: false,
      type: Object,
      default: foundry.utils.deepClone(DEFAULT_ANIMATION_FX_CONFIG),
    });
    game.settings.register(MODULE_ID, "animationFxTriggerOn", {
      name: "VAGABOND_CRAWLER.AnimationFxTriggerOn",
      scope: "world",
      config: false,
      type: String,
      choices: { always: "Always", hit: "On Hit Only" },
      default: "always",
    });
    game.settings.register(MODULE_ID, "animationFxEnabled", {
      scope: "client", config: false, type: Boolean, default: true,
    });
    game.settings.register(MODULE_ID, "animationFxScale", {
      scope: "client", config: false, type: Number, default: 1.0,
    });
    game.settings.register(MODULE_ID, "animationFxSoundEnabled", {
      scope: "client", config: false, type: Boolean, default: true,
    });
    game.settings.register(MODULE_ID, "animationFxMasterVolume", {
      scope: "client", config: false, type: Number, default: 0.8,
    });
  },

  async init() {
    // Hook registration comes in Task 4
    this._ready = true;
  },

  getConfig() {
    const stored = game.settings.get(MODULE_ID, "animationFxConfig") ?? {};
    return foundry.utils.mergeObject(
      foundry.utils.deepClone(DEFAULT_ANIMATION_FX_CONFIG),
      stored,
      { inplace: false }
    );
  },

  async open() {
    // AnimationFxConfigApp created in Task 8
    ui.notifications.info("Animation FX config UI not yet implemented.");
  },
};
```

- [ ] **Step 3: Wire it into `scripts/vagabond-crawler.mjs`**

Add the import near the other subsystem imports at the top:
```js
import { AnimationFx } from "./animation-fx.mjs";
```

Inside the `Hooks.once("init", ...)` block, add:
```js
AnimationFx.registerSettings();
```

Inside the `Hooks.once("ready", ...)` block, before final logging, add:
```js
game.vagabondCrawler.animationFx = AnimationFx;
await AnimationFx.init();
```

- [ ] **Step 4: Verify in Foundry via MCP**

Reload Foundry (`window.location.reload()`), wait ~2s, then:
```js
mcp__foundry-vtt__evaluate: "({ hasSubsystem: !!game.vagabondCrawler.animationFx, active: game.vagabondCrawler.animationFx?.active, config: !!game.settings.get('vagabond-crawler', 'animationFxConfig') })"
```
Expected: `{ hasSubsystem: true, active: true, config: true }`.

- [ ] **Step 5: Commit**

```bash
git add scripts/animation-fx.mjs scripts/animation-fx-defaults.mjs scripts/vagabond-crawler.mjs
git commit -m "feat(animation-fx): scaffold AnimationFx subsystem and settings"
```

---

### Task 1: Port default preset data

**Goal:** Populate `animation-fx-defaults.mjs` with all weapon, skill-fallback, alchemical, and gear presets from `vagabond-item-fx`, and add a starter set of NPC action presets. Every preset uses the unified `{hit, miss}` schema.

**Files:**
- Modify: `scripts/animation-fx-defaults.mjs`
- Reference (read-only): `E:/FoundryVTTv13/data/Data/modules/vagabond-item-fx/scripts/default-config.mjs`

**Acceptance Criteria:**
- [ ] `weapons` has at least 10 entries (sword, dagger, axe, mace, spear, bow, crossbow, etc.) with `patterns`, `type`, `hit` block
- [ ] `weaponSkillFallbacks` has `melee`, `finesse`, `brawl`, `ranged`, `_default`
- [ ] `alchemical` has at least 15 entries plus `_default`
- [ ] `gear` has `torch`, `lantern`, `sunrod` with `persist: true`
- [ ] `npcActions` has starter entries: `bite`, `claw`, `slam`, `breath`, `tail`, `stomp`, `_default`
- [ ] Every preset follows the unified schema (see spec §Data model)
- [ ] No field from the old flat item-fx schema remains at the top level (all animation fields live under `hit`)

**Verify:** Via MCP:
```js
mcp__foundry-vtt__evaluate: "(()=>{const c=game.vagabondCrawler.animationFx.getConfig(); return { weaponCount: Object.keys(c.weapons).length, npcActionCount: Object.keys(c.npcActions).length, biteHasHit: !!c.npcActions.bite?.hit, torchPersist: c.gear.torch?.persist === true }})()"
```
Expected: `{ weaponCount: >=10, npcActionCount: >=7, biteHasHit: true, torchPersist: true }`

**Steps:**

- [ ] **Step 1: Read the source file to understand the data**

Open `E:/FoundryVTTv13/data/Data/modules/vagabond-item-fx/scripts/default-config.mjs` in full. Note which entries exist and their flat fields (`file`, `scale`, `duration`, etc.) — these migrate into `hit: { file, scale, duration, ... }`.

- [ ] **Step 2: Write `scripts/animation-fx-defaults.mjs` with ported data**

Replace the stub with the full data structure. Example shape (expand for every preset):

```js
export const DEFAULT_ANIMATION_FX_CONFIG = {
  weapons: {
    sword: {
      label: "Sword",
      patterns: "sword|rapier|scimitar|saber|katana|longsword|shortsword",
      type: "onToken",
      target: "target",
      hit: {
        file: "modules/JB2A_DnD5e/Library/Generic/Weapon_Attacks/Melee/SwordSlash01_Regular_White_400x400.webm",
        scale: 1.0,
        duration: 800,
      },
    },
    dagger: {
      label: "Dagger",
      patterns: "dagger|knife|stiletto|dirk",
      type: "onToken",
      target: "target",
      hit: {
        file: "modules/JB2A_DnD5e/Library/Generic/Weapon_Attacks/Melee/Stab01_Regular_White_200x200.webm",
        scale: 1.0,
        duration: 600,
      },
    },
    bow: {
      label: "Bow",
      patterns: "bow|shortbow|longbow",
      type: "projectile",
      target: "target",
      hit: {
        file: "jb2a.arrow.physical.white",
        scale: 1.0,
        duration: 0,
      },
    },
    // ... port remaining weapon entries from item-fx default-config.mjs
    // Each ported entry: move flat {file, scale, duration} under hit:{}
  },

  weaponSkillFallbacks: {
    melee: {
      label: "Melee (fallback)",
      type: "onToken",
      target: "target",
      hit: { file: "modules/JB2A_DnD5e/Library/Generic/Weapon_Attacks/Melee/SwordSlash01_Regular_White_400x400.webm", scale: 1.0, duration: 800 },
    },
    finesse: {
      label: "Finesse (fallback)",
      type: "onToken",
      target: "target",
      hit: { file: "modules/JB2A_DnD5e/Library/Generic/Weapon_Attacks/Melee/Stab01_Regular_White_200x200.webm", scale: 1.0, duration: 600 },
    },
    brawl: {
      label: "Brawl (fallback)",
      type: "onToken",
      target: "target",
      hit: { file: "modules/JB2A_DnD5e/Library/Generic/Weapon_Attacks/Melee/Unarmed_Strike_01_Regular_White_400x400.webm", scale: 1.0, duration: 600 },
    },
    ranged: {
      label: "Ranged (fallback)",
      type: "projectile",
      target: "target",
      hit: { file: "jb2a.arrow.physical.white", scale: 1.0, duration: 0 },
    },
    _default: {
      label: "Default",
      type: "onToken",
      target: "target",
      hit: { file: "modules/JB2A_DnD5e/Library/Generic/Weapon_Attacks/Melee/SwordSlash01_Regular_White_400x400.webm", scale: 1.0, duration: 800 },
    },
  },

  alchemical: {
    "alchemist's fire": {
      label: "Alchemist's Fire",
      type: "projectile",
      target: "target",
      hit: { file: "jb2a.fire_bolt.orange", scale: 1.0, duration: 0 },
    },
    // ... port remaining alchemical entries from item-fx default-config.mjs
    _default: {
      label: "Alchemical Default",
      type: "projectile",
      target: "target",
      hit: { file: "jb2a.fire_bolt.orange", scale: 1.0, duration: 0 },
    },
  },

  gear: {
    torch: {
      label: "Torch",
      type: "onToken",
      target: "self",
      persist: true,
      hit: { file: "jb2a.torch.orange", scale: 1.0, duration: 0 },
    },
    lantern: {
      label: "Lantern",
      type: "onToken",
      target: "self",
      persist: true,
      hit: { file: "jb2a.lantern.orange", scale: 0.8, duration: 0 },
    },
    sunrod: {
      label: "Sunrod",
      type: "onToken",
      target: "self",
      persist: true,
      hit: { file: "jb2a.magic_signs.rune.abjuration.intro.yellow", scale: 1.0, duration: 0 },
    },
  },

  npcActions: {
    bite: {
      label: "Bite",
      patterns: "bite|chomp|gnaw|maw",
      type: "onToken",
      target: "target",
      hit: { file: "modules/JB2A_DnD5e/Library/Generic/Weapon_Attacks/Melee/Bite01_Regular_Red_400x400.webm", scale: 1.0, duration: 800 },
    },
    claw: {
      label: "Claw",
      patterns: "claw|slash|rake|rend",
      type: "onToken",
      target: "target",
      hit: { file: "modules/JB2A_DnD5e/Library/Generic/Weapon_Attacks/Melee/Claw01_Regular_Red_400x400.webm", scale: 1.0, duration: 800 },
    },
    slam: {
      label: "Slam",
      patterns: "slam|smash|pound|crush|bash",
      type: "onToken",
      target: "target",
      hit: { file: "modules/JB2A_DnD5e/Library/Generic/Impact/Impact_01_Regular_Red_400x400.webm", scale: 1.2, duration: 800 },
    },
    tail: {
      label: "Tail",
      patterns: "tail|sting|whip",
      type: "onToken",
      target: "target",
      hit: { file: "modules/JB2A_DnD5e/Library/Generic/Weapon_Attacks/Melee/Slash01_Regular_White_400x400.webm", scale: 1.0, duration: 700 },
    },
    stomp: {
      label: "Stomp",
      patterns: "stomp|trample|crush underfoot",
      type: "onToken",
      target: "target",
      hit: { file: "modules/JB2A_DnD5e/Library/Generic/Impact/Impact_01_Regular_Red_400x400.webm", scale: 1.5, duration: 900 },
    },
    breath: {
      label: "Breath Weapon",
      patterns: "breath|exhale|spray|cone of",
      type: "cone",
      target: "target",
      hit: { file: "jb2a.breath_weapons.fire.line.orange", scale: 1.0, duration: 1500 },
    },
    _default: {
      label: "Generic NPC Action",
      type: "onToken",
      target: "target",
      hit: { file: "modules/JB2A_DnD5e/Library/Generic/Impact/Impact_01_Regular_White_400x400.webm", scale: 1.0, duration: 800 },
    },
  },
};
```

**IMPORTANT**: The file paths above are illustrative. When porting, read the actual paths from `vagabond-item-fx/scripts/default-config.mjs` — those are the known-good paths the user already uses. Only the NPC action paths are new; GM can change them via the UI.

- [ ] **Step 3: Verify via MCP**

Reload Foundry. Run the verify command shown above.

- [ ] **Step 4: Commit**

```bash
git add scripts/animation-fx-defaults.mjs
git commit -m "feat(animation-fx): port default presets + add NPC action defaults"
```

---

### Task 2: Implement the resolver

**Goal:** `AnimationFx._resolve(source)` returns the correct preset (or null) given an item or an NPC action descriptor, honoring override flags and category-specific matching rules.

**Files:**
- Modify: `scripts/animation-fx.mjs`

**Acceptance Criteria:**
- [ ] `_resolve({ item })` returns preset from `weapons` when item name matches a pattern
- [ ] `_resolve({ item })` falls back to `weaponSkillFallbacks[weaponSkill]` when no pattern matches
- [ ] `_resolve({ item })` returns from `alchemical` by name (exact → partial → `_default`)
- [ ] `_resolve({ item })` returns from `gear` by name (no default)
- [ ] `_resolve({ actor, actionIndex })` returns preset from `npcActions` by pattern match on action name, falls back to `_default`
- [ ] Per-item override flag `flags.vagabond-crawler.animationOverride` wins over all category lookups
- [ ] Per-action override `flags.vagabond-crawler.actionOverrides[actionIndex]` wins for NPC actions
- [ ] `flags.vagabond-crawler.disabled === true` causes `_resolve` to return `null`
- [ ] Spells, armor, relics return `null`

**Verify:** Via MCP against live compendium NPCs (e.g. goblin with a Bite action):
```js
mcp__foundry-vtt__evaluate: "(async()=>{const a=await game.packs.get('vagabond.monsters')?.getDocuments(); const goblin=a?.find(x=>x.name.toLowerCase().includes('goblin'));const idx=goblin?.system.actions?.findIndex(act=>/bite/i.test(act.name));const r=game.vagabondCrawler.animationFx._resolve({actor:goblin,actionIndex:idx});return r?.label})()"
```
Expected: `"Bite"` (or falls back to `"Generic NPC Action"` if the monster lacks a bite action — adjust the test NPC accordingly).

**Steps:**

- [ ] **Step 1: Add resolver helpers in `animation-fx.mjs`**

Add these methods to the `AnimationFx` object (before `open()`):

```js
  _matchesPattern(name, patterns) {
    if (!patterns || !name) return false;
    try {
      return new RegExp(patterns, "i").test(name);
    } catch (e) {
      return false;
    }
  },

  _resolveWeapon(item, config) {
    const name = item.name ?? "";
    for (const [key, preset] of Object.entries(config.weapons ?? {})) {
      if (this._matchesPattern(name, preset.patterns)) return preset;
    }
    const skill = item.system?.weaponSkill;
    if (skill && config.weaponSkillFallbacks?.[skill]) return config.weaponSkillFallbacks[skill];
    return config.weaponSkillFallbacks?._default ?? null;
  },

  _resolveAlchemical(item, config) {
    const name = (item.name ?? "").toLowerCase();
    if (config.alchemical?.[name]) return config.alchemical[name];
    for (const [key, preset] of Object.entries(config.alchemical ?? {})) {
      if (key === "_default") continue;
      if (name.includes(key)) return preset;
    }
    return config.alchemical?._default ?? null;
  },

  _resolveGear(item, config) {
    const name = (item.name ?? "").toLowerCase();
    if (config.gear?.[name]) return config.gear[name];
    for (const [key, preset] of Object.entries(config.gear ?? {})) {
      if (name.includes(key)) return preset;
    }
    return null; // No default for gear
  },

  _resolveNpcAction(actor, actionIndex, config) {
    const action = actor.system?.actions?.[actionIndex];
    if (!action) return null;
    for (const [key, preset] of Object.entries(config.npcActions ?? {})) {
      if (key === "_default") continue;
      if (this._matchesPattern(action.name, preset.patterns)) return preset;
    }
    return config.npcActions?._default ?? null;
  },

  _resolve(source) {
    const MODULE_ID = "vagabond-crawler";
    const config = this.getConfig();

    // NPC action path
    if (source.actor && typeof source.actionIndex === "number") {
      const actorOverrides = source.actor.getFlag(MODULE_ID, "actionOverrides") ?? {};
      if (actorOverrides[source.actionIndex]) return actorOverrides[source.actionIndex];
      return this._resolveNpcAction(source.actor, source.actionIndex, config);
    }

    // Item path
    const item = source.item ?? source;
    if (!item?.type) return null;
    if (item.getFlag(MODULE_ID, "disabled")) return null;
    const override = item.getFlag(MODULE_ID, "animationOverride");
    if (override) return override;

    // Skip unsupported types
    if (item.type === "spell") return null;
    const equipType = item.system?.equipmentType;
    if (equipType === "armor" || equipType === "relic") return null;

    if (equipType === "weapon") return this._resolveWeapon(item, config);
    if (item.type === "alchemical") return this._resolveAlchemical(item, config);
    if (item.type === "gear" || equipType === "gear") return this._resolveGear(item, config);

    return null;
  },
```

- [ ] **Step 2: Verify via MCP**

Reload Foundry. Run the verify command from above. Also test a weapon and a gear item:
```js
mcp__foundry-vtt__evaluate: "(()=>{const hero=game.actors.find(a=>a.type==='character');const sword=hero?.items.find(i=>/sword/i.test(i.name));return sword ? game.vagabondCrawler.animationFx._resolve({item:sword})?.label : 'no sword found'})()"
```
Expected: `"Sword"` or the matching weapon label.

- [ ] **Step 3: Commit**

```bash
git add scripts/animation-fx.mjs
git commit -m "feat(animation-fx): resolver with category routing + override flags"
```

---

### Task 3: Implement playback

**Goal:** `AnimationFx._play(preset, source, targets, outcome)` plays the Sequencer animation correctly for onToken / projectile / cone types, with hit vs miss selection, persistent gear toggle, sound, and multi-target stagger.

**Files:**
- Modify: `scripts/animation-fx.mjs`

**Acceptance Criteria:**
- [ ] `type: "onToken"` plays at source (if `target: "self"`) or at each target (if `target: "target"`) with `scaleToObject(scale * globalScale)`
- [ ] `type: "projectile"` plays `.stretchTo()` from source to each target
- [ ] `type: "cone"` rotates to face centroid of targets, anchored at source, correct angle math
- [ ] `outcome: "miss"` uses `preset.miss` block; if absent, no-op
- [ ] `animationFxTriggerOn === "hit"` short-circuits miss outcomes before `_play` is even called (handled in handler, but `_play` should tolerate missing miss block)
- [ ] Persistent gear (`preset.persist === true`) uses `.persist().name(...)`, and re-invoking ends the existing effect instead of spawning a duplicate
- [ ] Sound plays via `foundry.audio.AudioHelper.play` when `block.sound` present and `animationFxSoundEnabled` is true
- [ ] Multi-target: 150ms stagger between targets via separate sequence creations

**Verify:** Via MCP with a selected token:
```js
mcp__foundry-vtt__evaluate: "(()=>{const tok=canvas.tokens.controlled[0];if(!tok)return'select a token first';const preset={type:'onToken',target:'self',hit:{file:'modules/JB2A_DnD5e/Library/Generic/Impact/Impact_01_Regular_Red_400x400.webm',scale:1,duration:800}};game.vagabondCrawler.animationFx._play(preset,tok,[tok],'hit');return'played'})()"
```
Expected: Impact effect renders on the selected token.

**Steps:**

- [ ] **Step 1: Add playback methods**

Add to `AnimationFx`:

```js
  _getClientScale() {
    return game.settings.get("vagabond-crawler", "animationFxScale") ?? 1.0;
  },

  _getMasterVolume() {
    return game.settings.get("vagabond-crawler", "animationFxMasterVolume") ?? 0.8;
  },

  async _playSound(block) {
    if (!block?.sound) return;
    if (!game.settings.get("vagabond-crawler", "animationFxSoundEnabled")) return;
    const volume = (block.soundVolume ?? 0.6) * this._getMasterVolume();
    try {
      await foundry.audio.AudioHelper.play({ src: block.sound, volume, autoplay: true, loop: false });
    } catch (e) {
      console.warn("[vagabond-crawler] animation sound failed:", e);
    }
  },

  _computeConeAngle(sourceToken, targets) {
    const sx = sourceToken.x + (sourceToken.w / 2);
    const sy = sourceToken.y + (sourceToken.h / 2);
    let cx = 0, cy = 0;
    for (const t of targets) {
      cx += t.x + (t.w / 2);
      cy += t.y + (t.h / 2);
    }
    cx /= targets.length;
    cy /= targets.length;
    return Math.toDegrees(Math.atan2(cy - sy, cx - sx));
  },

  async _play(preset, sourceToken, targets, outcome = "hit") {
    if (!preset) return;
    if (typeof Sequence === "undefined") return;
    const block = preset[outcome];
    if (!block?.file) return;

    const globalScale = this._getClientScale();
    const fadeIn = preset.fadeIn ?? 200;
    const fadeOut = preset.fadeOut ?? 200;
    const opacity = preset.opacity ?? 1.0;

    // Persistent gear toggle
    if (preset.persist && sourceToken) {
      const MODULE_ID = "vagabond-crawler";
      const effectName = `${MODULE_ID}-fx-${preset.label}-${sourceToken.id}`;
      const existing = Sequencer.EffectManager.getEffects({ name: effectName });
      if (existing.length > 0) {
        await Sequencer.EffectManager.endEffects({ name: effectName });
        return;
      }
      const seq = new Sequence(MODULE_ID);
      seq.effect()
        .file(block.file)
        .atLocation(sourceToken)
        .scaleToObject(block.scale * globalScale)
        .fadeIn(fadeIn)
        .fadeOut(fadeOut)
        .opacity(opacity)
        .persist()
        .name(effectName);
      await seq.play();
      await this._playSound(block);
      return;
    }

    // Non-persistent: iterate targets with stagger
    const targetList = (targets && targets.length > 0) ? targets : [sourceToken];
    for (let i = 0; i < targetList.length; i++) {
      const target = targetList[i];
      const delay = i * 150;
      setTimeout(() => this._playOne(preset, block, sourceToken, target, targetList, globalScale, fadeIn, fadeOut, opacity), delay);
    }
    await this._playSound(block);
  },

  async _playOne(preset, block, sourceToken, target, allTargets, globalScale, fadeIn, fadeOut, opacity) {
    const MODULE_ID = "vagabond-crawler";
    const seq = new Sequence(MODULE_ID);
    const effect = seq.effect().file(block.file);

    if (preset.type === "projectile") {
      effect.atLocation(sourceToken).stretchTo(target).fadeIn(100).fadeOut(100).opacity(opacity);
    } else if (preset.type === "cone") {
      const angle = this._computeConeAngle(sourceToken, allTargets);
      effect
        .atLocation(sourceToken)
        .rotate(-angle)
        .scale(block.scale * globalScale)
        .anchor({ x: 0, y: 0.5 })
        .duration(block.duration ?? 1500)
        .fadeIn(fadeIn).fadeOut(fadeOut).opacity(opacity);
    } else {
      // onToken
      const anchorToken = preset.target === "self" ? sourceToken : target;
      effect
        .atLocation(anchorToken)
        .scaleToObject(block.scale * globalScale)
        .fadeIn(fadeIn).fadeOut(fadeOut).duration(block.duration ?? 800).opacity(opacity);
      if (typeof block.offsetX === "number") effect.spriteOffset({ x: block.offsetX });
    }

    try {
      await seq.play();
    } catch (e) {
      console.warn("[vagabond-crawler] animation play failed:", e);
    }
  },
```

- [ ] **Step 2: Verify playback types**

Run the verify command above for onToken. Then test projectile (pick a bow on a hero, two tokens) and cone manually by running:
```js
mcp__foundry-vtt__evaluate: "(()=>{const [src,tgt]=canvas.tokens.controlled;if(!src||!tgt)return'need 2 selected';const preset={type:'cone',target:'target',hit:{file:'jb2a.breath_weapons.fire.line.orange',scale:1,duration:1500}};game.vagabondCrawler.animationFx._play(preset,src,[tgt],'hit');return 'cone played'})()"
```

- [ ] **Step 3: Commit**

```bash
git add scripts/animation-fx.mjs
git commit -m "feat(animation-fx): playback for onToken/projectile/cone + persist + sound"
```

---

### Task 4: Chat message hook (item path)

**Goal:** Install the `createChatMessage` hook that handles weapon/alchemical/gear attacks, wiring up resolve → play. This task covers the item path only; NPC actions come in Task 5.

**Files:**
- Modify: `scripts/animation-fx.mjs`

**Acceptance Criteria:**
- [ ] Rolling a weapon attack in-game triggers an animation on the target
- [ ] `animationFxEnabled: false` fully suppresses animations
- [ ] Only the acting user's client plays the animation (no doubled effects with multi-client)
- [ ] Spells, armor, relic item types are skipped
- [ ] `targetsAtRollTime` flag is used when present, else current user's targets

**Verify:** Roll a weapon attack from a character with a token on the scene and a target selected. Animation should play.

**Steps:**

- [ ] **Step 1: Add the hook handler in `animation-fx.mjs`**

Add to `AnimationFx`:

```js
  _getSourceToken(actor) {
    if (!actor) return null;
    const tokens = actor.getActiveTokens(true, true);
    return tokens.find(t => t.parent?.id === canvas.scene?.id) ?? tokens[0] ?? null;
  },

  _getTargets(message) {
    const stored = message.flags?.vagabond?.targetsAtRollTime;
    if (Array.isArray(stored) && stored.length > 0) {
      return stored.map(id => canvas.tokens.get(id)).filter(t => t);
    }
    return Array.from(game.user.targets).map(t => t.document) // ensure TokenDocument
      .map(td => canvas.tokens.get(td.id)).filter(t => t);
  },

  _determineOutcome(message) {
    const flag = message.flags?.vagabond?.rollOutcome;
    if (flag === "hit" || flag === "miss") return flag;
    const content = message.content ?? "";
    if (/\bMISS\b/i.test(content) && !/\bHIT\b/i.test(content)) return "miss";
    return "hit";
  },

  async _onChatMessage(message, options, userId) {
    if (userId !== game.userId) return;
    if (!game.settings.get("vagabond-crawler", "animationFxEnabled")) return;

    const flags = message.flags?.vagabond;
    if (!flags?.actorId) return;
    const actor = game.actors.get(flags.actorId);
    if (!actor) return;

    let preset = null;
    if (flags.itemId) {
      const item = actor.items.get(flags.itemId);
      if (!item) return;
      preset = this._resolve({ item });
    } else if (typeof flags.actionIndex === "number") {
      preset = this._resolve({ actor, actionIndex: flags.actionIndex });
    }
    if (!preset) return;

    const outcome = this._determineOutcome(message);
    const triggerOn = game.settings.get("vagabond-crawler", "animationFxTriggerOn");
    if (outcome === "miss" && triggerOn === "hit") return;

    const sourceToken = this._getSourceToken(actor);
    if (!sourceToken) return;
    const targets = this._getTargets(message);

    await this._play(preset, sourceToken, targets, outcome);
  },
```

- [ ] **Step 2: Register the hook in `init()`**

Replace the current empty `init()` with:
```js
  async init() {
    const hookId = Hooks.on("createChatMessage", (msg, opts, userId) => this._onChatMessage(msg, opts, userId));
    this._hookIds.push(hookId);
    this._ready = true;
  },
```

- [ ] **Step 3: Manual test in Foundry**

1. Select a character token with a weapon equipped
2. Target an enemy token
3. Roll the weapon attack
4. Animation should play on the target

- [ ] **Step 4: Commit**

```bash
git add scripts/animation-fx.mjs
git commit -m "feat(animation-fx): chat message hook for weapon/alchemical/gear attacks"
```

---

### Task 5: NPC action chat flag emission + wrapper

**Goal:** Ensure `VagabondChatCard.npcAction` emits `flags.vagabond.actionIndex` into the chat message so the hook handler (Task 4) can resolve NPC action presets. If the system already emits it, skip wrapping. Otherwise, libWrapper/monkey-wrap it.

**Files:**
- Modify: `scripts/animation-fx.mjs` (add `_wrapNpcAction()`)
- Reference (read-only): `scripts/npc-abilities.mjs` for the existing `npcAction wrapper` pattern

**Acceptance Criteria:**
- [ ] After an NPC action is invoked via the action menu, the resulting chat message has `flags.vagabond.actionIndex` set to the numeric index
- [ ] If the system already emits `actionIndex`, the wrap is a no-op (detection by inspecting a real message after a manual trigger)
- [ ] Wrap is installed in `setup` or `ready` as appropriate and does not break existing npc-abilities wrap chain

**Verify:** Via MCP:
```js
mcp__foundry-vtt__evaluate: "(async()=>{const npc=canvas.tokens.placeables.find(t=>t.document.disposition===-1);if(!npc)return'no hostile npc';await game.vagabond?.VagabondChatCard?.npcAction?.(npc.actor,npc.actor.system.actions[0],0,[]);await new Promise(r=>setTimeout(r,500));const msg=Array.from(game.messages).at(-1);return msg?.flags?.vagabond?.actionIndex})()"
```
Expected: a numeric value (0).

**Steps:**

- [ ] **Step 1: Inspect current system behavior**

Via MCP, run an NPC action manually and inspect the resulting message flags:
```js
mcp__foundry-vtt__evaluate: "Array.from(game.messages).at(-1)?.flags?.vagabond"
```
Record which flags are present. If `actionIndex` already appears, skip Steps 2–3 and proceed directly to Step 4 (verify).

- [ ] **Step 2: Add the wrap**

Add to `AnimationFx`:

```js
  _wrapNpcAction() {
    const VCC = game.vagabond?.VagabondChatCard;
    if (!VCC || typeof VCC.npcAction !== "function") return;
    // Avoid double-wrapping
    if (VCC.npcAction.__vcAnimFxWrapped) return;

    const original = VCC.npcAction.bind(VCC);
    const wrapped = async function (actor, action, actionIndex, targets, ...rest) {
      // Stash actionIndex on a hook we can read in createChatMessage
      const preHook = Hooks.on("preCreateChatMessage", (msg, data, opts, userId) => {
        const flags = foundry.utils.getProperty(data, "flags.vagabond") ?? {};
        if (flags.actorId === actor?.id && typeof flags.actionIndex !== "number") {
          msg.updateSource({ "flags.vagabond.actionIndex": actionIndex });
        }
        Hooks.off("preCreateChatMessage", preHook);
      });
      try {
        return await original(actor, action, actionIndex, targets, ...rest);
      } finally {
        Hooks.off("preCreateChatMessage", preHook);
      }
    };
    wrapped.__vcAnimFxWrapped = true;
    VCC.npcAction = wrapped;
  },
```

- [ ] **Step 3: Call the wrap in `init()`**

```js
  async init() {
    this._wrapNpcAction();
    const hookId = Hooks.on("createChatMessage", (msg, opts, userId) => this._onChatMessage(msg, opts, userId));
    this._hookIds.push(hookId);
    this._ready = true;
  },
```

- [ ] **Step 4: Verify**

Run the MCP verify command. Expect numeric `actionIndex`.

- [ ] **Step 5: Commit**

```bash
git add scripts/animation-fx.mjs
git commit -m "feat(animation-fx): attach actionIndex to NPC action chat messages"
```

---

### Task 6: Retire cone patch in npc-abilities.mjs

**Goal:** Remove the bespoke `VagabondItemSequencer.play` cone wrap from `scripts/npc-abilities.mjs` now that unified playback in `AnimationFx` handles cone type.

**Files:**
- Modify: `scripts/npc-abilities.mjs` (remove cone patch lines ~430–489)

**Acceptance Criteria:**
- [ ] The `VagabondItemSequencer.play` wrap for `animType === 'cone'` is removed
- [ ] A cone-type NPC action (e.g. dragon breath) still animates correctly — now via `AnimationFx._play`
- [ ] Other `npc-abilities.mjs` wraps (Pack Instincts, Magic Ward, etc.) remain untouched

**Verify:** Manually trigger a dragon/creature with a breath/cone action on Foundry. Animation should still play. Inspect npc-abilities.mjs for the absence of the cone wrap code.

**Steps:**

- [ ] **Step 1: Identify the cone patch block**

Read `scripts/npc-abilities.mjs` around lines 430–489 to locate the `VagabondItemSequencer.play` override for `animType === 'cone'`.

- [ ] **Step 2: Remove the patch**

Delete the cone-specific wrap. If it's wrapped inside an initialization function that contains nothing else, remove the wrapper function and its call-site too.

- [ ] **Step 3: Manually verify a breath attack still animates**

Place a creature with a breath action, target another token, trigger the breath action. The cone should render via `AnimationFx`.

- [ ] **Step 4: Commit**

```bash
git add scripts/npc-abilities.mjs
git commit -m "refactor(npc-abilities): retire cone patch \u2014 now handled by AnimationFx"
```

---

### Task 7: Config window — skeleton + Settings tab

**Goal:** Create `AnimationFxConfigApp` (ApplicationV2 + HandlebarsApplicationMixin), render a skeleton with tabs, and wire up the global `Settings` tab (enable toggle, scale, trigger-on, sound toggle, master volume).

**Files:**
- Create: `scripts/animation-fx-config.mjs`
- Create: `templates/animation-fx-config.hbs`
- Modify: `scripts/animation-fx.mjs` (`open()` now opens the app; add `registerMenu`)

**Acceptance Criteria:**
- [ ] `game.vagabondCrawler.animationFx.open()` opens an ApplicationV2 window titled "Animation FX Configuration"
- [ ] Window shows tab strip: Weapons, Skill Fallbacks, Alchemical, Gear, NPC Actions, Settings (tab bodies can be placeholder for now except Settings)
- [ ] Settings tab exposes the 4 client + 1 world toggle/slider settings; changes persist
- [ ] Save flashes green, Cancel discards changes
- [ ] Menu entry "Animation FX Configuration" appears in Foundry's Game Settings → Configure Settings → Module Settings

**Verify:**
```js
mcp__foundry-vtt__evaluate: "game.vagabondCrawler.animationFx.open(); true"
```
Visually: window opens, Settings tab shows controls, save persists.

**Steps:**

- [ ] **Step 1: Create `scripts/animation-fx-config.mjs`**

```js
// scripts/animation-fx-config.mjs
const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;
const MODULE_ID = "vagabond-crawler";

export class AnimationFxConfigApp extends HandlebarsApplicationMixin(ApplicationV2) {
  static DEFAULT_OPTIONS = {
    id: "vagabond-crawler-animation-fx-config",
    tag: "form",
    window: { title: "Animation FX Configuration", resizable: true, contentClasses: ["vcfx-config"] },
    position: { width: 900, height: 700 },
    form: { handler: AnimationFxConfigApp.#onSubmit, submitOnChange: false, closeOnSubmit: false },
    actions: {
      saveAndClose: AnimationFxConfigApp.#onSaveAndClose,
      resetTab: AnimationFxConfigApp.#onResetTab,
      addPreset: AnimationFxConfigApp.#onAddPreset,
      deletePreset: AnimationFxConfigApp.#onDeletePreset,
      previewPreset: AnimationFxConfigApp.#onPreviewPreset,
      pickFile: AnimationFxConfigApp.#onPickFile,
      pickSound: AnimationFxConfigApp.#onPickSound,
      switchTab: AnimationFxConfigApp.#onSwitchTab,
    },
  };

  static PARTS = {
    form: { template: "modules/vagabond-crawler/templates/animation-fx-config.hbs" },
  };

  _activeTab = "weapons";
  _workingConfig = null;

  async _prepareContext() {
    if (!this._workingConfig) {
      this._workingConfig = foundry.utils.deepClone(game.vagabondCrawler.animationFx.getConfig());
    }
    return {
      activeTab: this._activeTab,
      config: this._workingConfig,
      settings: {
        triggerOn: game.settings.get(MODULE_ID, "animationFxTriggerOn"),
        enabled: game.settings.get(MODULE_ID, "animationFxEnabled"),
        scale: game.settings.get(MODULE_ID, "animationFxScale"),
        soundEnabled: game.settings.get(MODULE_ID, "animationFxSoundEnabled"),
        masterVolume: game.settings.get(MODULE_ID, "animationFxMasterVolume"),
      },
    };
  }

  static async #onSwitchTab(event, target) {
    this._activeTab = target.dataset.tab;
    this.render();
  }

  static async #onSubmit(event, form, formData) {
    // Full form extraction happens in Task 8 per-tab. For now, save global settings only.
    const data = formData.object;
    if ("settings.triggerOn" in data) await game.settings.set(MODULE_ID, "animationFxTriggerOn", data["settings.triggerOn"]);
    if ("settings.enabled" in data) await game.settings.set(MODULE_ID, "animationFxEnabled", !!data["settings.enabled"]);
    if ("settings.scale" in data) await game.settings.set(MODULE_ID, "animationFxScale", Number(data["settings.scale"]));
    if ("settings.soundEnabled" in data) await game.settings.set(MODULE_ID, "animationFxSoundEnabled", !!data["settings.soundEnabled"]);
    if ("settings.masterVolume" in data) await game.settings.set(MODULE_ID, "animationFxMasterVolume", Number(data["settings.masterVolume"]));
    await game.settings.set(MODULE_ID, "animationFxConfig", this._workingConfig);
    this._flashSaved();
  }

  static async #onSaveAndClose(event, target) {
    await this.submit();
    this.close();
  }

  static async #onResetTab(event, target) {
    const tab = this._activeTab;
    const { DEFAULT_ANIMATION_FX_CONFIG } = await import("./animation-fx-defaults.mjs");
    if (tab in DEFAULT_ANIMATION_FX_CONFIG) {
      const confirmed = await foundry.applications.api.DialogV2.confirm({
        window: { title: "Reset Tab" },
        content: `<p>Reset <b>${tab}</b> to defaults? Unsaved changes will be kept for other tabs.</p>`,
      });
      if (!confirmed) return;
      this._workingConfig[tab] = foundry.utils.deepClone(DEFAULT_ANIMATION_FX_CONFIG[tab]);
      this.render();
    }
  }

  static async #onAddPreset(event, target) { /* Task 8 */ this.render(); }
  static async #onDeletePreset(event, target) { /* Task 8 */ this.render(); }
  static async #onPreviewPreset(event, target) { /* Task 8 */ }
  static async #onPickFile(event, target) { /* Task 8 */ }
  static async #onPickSound(event, target) { /* Task 8 */ }

  _flashSaved() {
    const el = this.element.querySelector(".vcfx-save-flash");
    if (!el) return;
    el.classList.add("vcfx-flash");
    setTimeout(() => el.classList.remove("vcfx-flash"), 800);
  }
}
```

- [ ] **Step 2: Create `templates/animation-fx-config.hbs` (skeleton)**

```handlebars
<div class="vcfx-config">
  <nav class="vcfx-tabs">
    <a data-action="switchTab" data-tab="weapons" class="{{#if (eq activeTab 'weapons')}}active{{/if}}">Weapons</a>
    <a data-action="switchTab" data-tab="weaponSkillFallbacks" class="{{#if (eq activeTab 'weaponSkillFallbacks')}}active{{/if}}">Skill Fallbacks</a>
    <a data-action="switchTab" data-tab="alchemical" class="{{#if (eq activeTab 'alchemical')}}active{{/if}}">Alchemical</a>
    <a data-action="switchTab" data-tab="gear" class="{{#if (eq activeTab 'gear')}}active{{/if}}">Gear</a>
    <a data-action="switchTab" data-tab="npcActions" class="{{#if (eq activeTab 'npcActions')}}active{{/if}}">NPC Actions</a>
    <a data-action="switchTab" data-tab="settings" class="{{#if (eq activeTab 'settings')}}active{{/if}}">Settings</a>
  </nav>

  <section class="vcfx-body">
    {{#if (eq activeTab 'settings')}}
      <fieldset class="vcfx-settings">
        <legend>Global Settings</legend>
        <label><input type="checkbox" name="settings.enabled" {{#if settings.enabled}}checked{{/if}}/> Enable animations</label>
        <label>Global scale <input type="number" name="settings.scale" value="{{settings.scale}}" min="0.25" max="3" step="0.05"/></label>
        <label>Trigger on
          <select name="settings.triggerOn">
            <option value="always" {{#if (eq settings.triggerOn 'always')}}selected{{/if}}>Always</option>
            <option value="hit" {{#if (eq settings.triggerOn 'hit')}}selected{{/if}}>On hit only</option>
          </select>
        </label>
        <label><input type="checkbox" name="settings.soundEnabled" {{#if settings.soundEnabled}}checked{{/if}}/> Enable sound</label>
        <label>Master volume <input type="number" name="settings.masterVolume" value="{{settings.masterVolume}}" min="0" max="1" step="0.05"/></label>
      </fieldset>
    {{else}}
      <p class="vcfx-placeholder">Tab "{{activeTab}}" body implemented in Task 8.</p>
    {{/if}}
  </section>

  <footer class="vcfx-actions">
    <span class="vcfx-save-flash"></span>
    <button type="button" data-action="resetTab">Reset Tab</button>
    <button type="submit">Save</button>
    <button type="button" data-action="saveAndClose">Save &amp; Close</button>
    <button type="button" data-action="cancel" onclick="this.closest('.application').dispatchEvent(new CustomEvent('close'))">Cancel</button>
  </footer>
</div>
```

- [ ] **Step 3: Register `eq` Handlebars helper if not already present**

Check `scripts/vagabond-crawler.mjs` for existing `Handlebars.registerHelper("eq", ...)`. If not present, add it inside `Hooks.once("init", ...)`:
```js
if (!Handlebars.helpers.eq) {
  Handlebars.registerHelper("eq", (a, b) => a === b);
}
```

- [ ] **Step 4: Wire up `open()` and settings menu in `animation-fx.mjs`**

```js
// Top of animation-fx.mjs, add:
import { AnimationFxConfigApp } from "./animation-fx-config.mjs";
```

Replace `open()`:
```js
  async open() {
    new AnimationFxConfigApp().render(true);
  },
```

In `registerSettings()`, add at the end:
```js
    game.settings.registerMenu(MODULE_ID, "animationFxConfigMenu", {
      name: "Animation FX Configuration",
      label: "Configure",
      hint: "Centrally configure weapon, NPC action, alchemical, and gear animations.",
      icon: "fas fa-film",
      type: class extends FormApplication {
        constructor() { super(); game.vagabondCrawler.animationFx.open(); this.close(); }
        render() { return this; }
      },
      restricted: true,
    });
```

- [ ] **Step 5: Verify**

Reload. Run verify command. Window opens, Settings tab works, other tabs are placeholders, save persists.

- [ ] **Step 6: Commit**

```bash
git add scripts/animation-fx-config.mjs templates/animation-fx-config.hbs scripts/animation-fx.mjs scripts/vagabond-crawler.mjs
git commit -m "feat(animation-fx): config window skeleton + Settings tab"
```

---

### Task 8: Config window — preset tabs with hit/miss editor

**Goal:** Implement all five category tabs (Weapons, Skill Fallbacks, Alchemical, Gear, NPC Actions) with preset rows, hit + miss animation editors, preview buttons, file/sound pickers, add/delete preset, and per-tab save.

**Files:**
- Modify: `scripts/animation-fx-config.mjs` (fill in the stub action handlers)
- Modify: `templates/animation-fx-config.hbs` (add preset row template + tab bodies)

**Acceptance Criteria:**
- [ ] Each tab renders one row per preset with label, patterns (if applicable), type dropdown, hit block (file + scale + duration + offset + sound + volume), collapsible miss block (same fields minus offset)
- [ ] "+ Add Preset" appends a blank preset to the active tab; NPC Actions uses smart-default type detection from name input
- [ ] "Delete" removes a preset; `_default` preset cannot be deleted
- [ ] "Preview" plays hit animation on selected token; shift-click plays miss
- [ ] File picker button opens Foundry's FilePicker scoped to the file field
- [ ] Sound picker opens FilePicker scoped to audio
- [ ] Saving persists all edits; Reset Tab restores defaults for that tab only

**Verify:** Via UI manually: edit sword scale → save → reload → scale persists. Via MCP:
```js
mcp__foundry-vtt__evaluate: "(()=>{const c=game.vagabondCrawler.animationFx.getConfig();return c.weapons.sword?.hit?.scale})()"
```

**Steps:**

- [ ] **Step 1: Extend the template with a preset-row partial + tab bodies**

Update `templates/animation-fx-config.hbs`. Replace the current placeholder `{{else}}` branch with tab-body rendering that iterates over `config[activeTab]` and calls a preset-row partial. Register the partial in `scripts/vagabond-crawler.mjs` init hook:

```js
loadTemplates(["modules/vagabond-crawler/templates/animation-fx-config.hbs"]);
```

Template additions (inside the `<section class="vcfx-body">`, before the settings branch):
```handlebars
    {{#unless (eq activeTab 'settings')}}
      <div class="vcfx-preset-list">
        {{#each (lookup config activeTab) as |preset key|}}
          <fieldset class="vcfx-preset" data-preset-key="{{key}}">
            <legend>{{preset.label}} {{#if (eq key '_default')}}<em>(default)</em>{{/if}}</legend>

            <div class="vcfx-row">
              <label>Label <input type="text" name="{{../activeTab}}.{{key}}.label" value="{{preset.label}}"/></label>
              {{#unless (or (eq ../activeTab 'weaponSkillFallbacks') (eq ../activeTab 'alchemical') (eq ../activeTab 'gear'))}}
                <label>Patterns <input type="text" name="{{../activeTab}}.{{key}}.patterns" value="{{preset.patterns}}"/></label>
              {{/unless}}
              <label>Type
                <select name="{{../activeTab}}.{{key}}.type">
                  <option value="onToken" {{#if (eq preset.type 'onToken')}}selected{{/if}}>On Token</option>
                  <option value="projectile" {{#if (eq preset.type 'projectile')}}selected{{/if}}>Projectile</option>
                  <option value="cone" {{#if (eq preset.type 'cone')}}selected{{/if}}>Cone</option>
                </select>
              </label>
              <label>Target
                <select name="{{../activeTab}}.{{key}}.target">
                  <option value="target" {{#if (eq preset.target 'target')}}selected{{/if}}>Target</option>
                  <option value="self" {{#if (eq preset.target 'self')}}selected{{/if}}>Self</option>
                </select>
              </label>
              {{#if (eq ../activeTab 'gear')}}
                <label><input type="checkbox" name="{{../activeTab}}.{{key}}.persist" {{#if preset.persist}}checked{{/if}}/> Persist</label>
              {{/if}}
            </div>

            <div class="vcfx-block vcfx-hit">
              <h4>Hit Animation</h4>
              <div class="vcfx-row">
                <input type="text" name="{{../activeTab}}.{{key}}.hit.file" value="{{preset.hit.file}}" placeholder="file path or jb2a.xxx"/>
                <button type="button" data-action="pickFile" data-target="{{../activeTab}}.{{key}}.hit.file">📁</button>
                <label>Scale <input type="number" step="0.05" name="{{../activeTab}}.{{key}}.hit.scale" value="{{preset.hit.scale}}"/></label>
                <label>Duration <input type="number" step="50" name="{{../activeTab}}.{{key}}.hit.duration" value="{{preset.hit.duration}}"/></label>
                <label>Offset X <input type="number" name="{{../activeTab}}.{{key}}.hit.offsetX" value="{{preset.hit.offsetX}}"/></label>
              </div>
              <div class="vcfx-row">
                <input type="text" name="{{../activeTab}}.{{key}}.hit.sound" value="{{preset.hit.sound}}" placeholder="path/to/hit.ogg"/>
                <button type="button" data-action="pickSound" data-target="{{../activeTab}}.{{key}}.hit.sound">🎵</button>
                <label>Volume <input type="number" step="0.05" min="0" max="1" name="{{../activeTab}}.{{key}}.hit.soundVolume" value="{{preset.hit.soundVolume}}"/></label>
              </div>
            </div>

            <details class="vcfx-block vcfx-miss">
              <summary>Miss Animation (optional)</summary>
              <div class="vcfx-row">
                <input type="text" name="{{../activeTab}}.{{key}}.miss.file" value="{{preset.miss.file}}" placeholder="file path"/>
                <button type="button" data-action="pickFile" data-target="{{../activeTab}}.{{key}}.miss.file">📁</button>
                <label>Scale <input type="number" step="0.05" name="{{../activeTab}}.{{key}}.miss.scale" value="{{preset.miss.scale}}"/></label>
                <label>Duration <input type="number" step="50" name="{{../activeTab}}.{{key}}.miss.duration" value="{{preset.miss.duration}}"/></label>
              </div>
              <div class="vcfx-row">
                <input type="text" name="{{../activeTab}}.{{key}}.miss.sound" value="{{preset.miss.sound}}" placeholder="path/to/miss.ogg"/>
                <button type="button" data-action="pickSound" data-target="{{../activeTab}}.{{key}}.miss.sound">🎵</button>
                <label>Volume <input type="number" step="0.05" min="0" max="1" name="{{../activeTab}}.{{key}}.miss.soundVolume" value="{{preset.miss.soundVolume}}"/></label>
              </div>
            </details>

            <div class="vcfx-row">
              <button type="button" data-action="previewPreset" data-key="{{key}}">▶ Preview</button>
              {{#unless (eq key '_default')}}
                <button type="button" data-action="deletePreset" data-key="{{key}}">🗑 Delete</button>
              {{/unless}}
            </div>
          </fieldset>
        {{/each}}
        <button type="button" data-action="addPreset">+ Add Preset</button>
      </div>
    {{/unless}}
```

Also register the `or` helper in init if missing:
```js
if (!Handlebars.helpers.or) {
  Handlebars.registerHelper("or", (...args) => args.slice(0, -1).some(x => !!x));
}
```

- [ ] **Step 2: Implement preset mutation handlers in `animation-fx-config.mjs`**

Replace the stub `#onAddPreset`, `#onDeletePreset`, `#onPreviewPreset`, `#onPickFile`, `#onPickSound`:

```js
  static async #onAddPreset(event, target) {
    const tab = this._activeTab;
    if (tab === "settings") return;
    const name = await foundry.applications.api.DialogV2.prompt({
      window: { title: "New Preset Key" },
      content: '<label>Key (lowercase, unique): <input name="key" type="text" required/></label>',
      ok: { callback: (ev, btn, dialog) => dialog.querySelector('input[name=key]').value.trim().toLowerCase() },
    });
    if (!name) return;
    if (this._workingConfig[tab][name]) {
      ui.notifications.warn(`Preset "${name}" already exists in ${tab}.`);
      return;
    }
    const smartType = this._smartType(name);
    this._workingConfig[tab][name] = {
      label: name.charAt(0).toUpperCase() + name.slice(1),
      patterns: name,
      type: smartType,
      target: "target",
      hit: { file: "", scale: 1, duration: 800 },
    };
    this.render();
  }

  _smartType(name) {
    if (/breath|cone|spray|exhale/i.test(name)) return "cone";
    if (/arrow|bolt|shoot|throw|hurl|spit/i.test(name)) return "projectile";
    return "onToken";
  }

  static async #onDeletePreset(event, target) {
    const key = target.dataset.key;
    if (!key || key === "_default") return;
    const confirmed = await foundry.applications.api.DialogV2.confirm({
      window: { title: "Delete Preset" },
      content: `<p>Delete preset <b>${key}</b>?</p>`,
    });
    if (!confirmed) return;
    this._saveFormToWorking();
    delete this._workingConfig[this._activeTab][key];
    this.render();
  }

  static async #onPreviewPreset(event, target) {
    this._saveFormToWorking();
    const key = target.dataset.key;
    const preset = this._workingConfig[this._activeTab][key];
    if (!preset) return;
    const tok = canvas.tokens.controlled[0];
    if (!tok) { ui.notifications.warn("Select a token first."); return; }
    const outcome = event.shiftKey ? "miss" : "hit";
    await game.vagabondCrawler.animationFx._play(preset, tok, [tok], outcome);
  }

  static async #onPickFile(event, target) {
    const fieldName = target.dataset.target;
    const input = this.element.querySelector(`[name="${fieldName}"]`);
    new FilePicker({
      type: "imagevideo",
      current: input?.value ?? "",
      callback: (path) => { if (input) input.value = path; },
    }).render(true);
  }

  static async #onPickSound(event, target) {
    const fieldName = target.dataset.target;
    const input = this.element.querySelector(`[name="${fieldName}"]`);
    new FilePicker({
      type: "audio",
      current: input?.value ?? "",
      callback: (path) => { if (input) input.value = path; },
    }).render(true);
  }

  _saveFormToWorking() {
    const fd = new FormDataExtended(this.element.querySelector("form") ?? this.element);
    const data = foundry.utils.expandObject(fd.object);
    for (const tab of ["weapons", "weaponSkillFallbacks", "alchemical", "gear", "npcActions"]) {
      if (data[tab]) {
        for (const [key, preset] of Object.entries(data[tab])) {
          if (!this._workingConfig[tab][key]) this._workingConfig[tab][key] = {};
          foundry.utils.mergeObject(this._workingConfig[tab][key], preset);
        }
      }
    }
  }
```

- [ ] **Step 3: Update `#onSubmit` to persist the full working config**

```js
  static async #onSubmit(event, form, formData) {
    this._saveFormToWorking();
    const data = formData.object;
    if ("settings.triggerOn" in data) await game.settings.set(MODULE_ID, "animationFxTriggerOn", data["settings.triggerOn"]);
    if ("settings.enabled" in data) await game.settings.set(MODULE_ID, "animationFxEnabled", !!data["settings.enabled"]);
    if ("settings.scale" in data) await game.settings.set(MODULE_ID, "animationFxScale", Number(data["settings.scale"]));
    if ("settings.soundEnabled" in data) await game.settings.set(MODULE_ID, "animationFxSoundEnabled", !!data["settings.soundEnabled"]);
    if ("settings.masterVolume" in data) await game.settings.set(MODULE_ID, "animationFxMasterVolume", Number(data["settings.masterVolume"]));
    await game.settings.set(MODULE_ID, "animationFxConfig", this._workingConfig);
    this._flashSaved();
  }
```

- [ ] **Step 4: Verify**

Reload. Open config, edit `sword.hit.scale` to `2.0`, save, close, reopen — value persists. Run MCP verify. Add a new NPC action "stomp" — smart-type should default to `onToken`.

- [ ] **Step 5: Commit**

```bash
git add scripts/animation-fx-config.mjs templates/animation-fx-config.hbs scripts/vagabond-crawler.mjs
git commit -m "feat(animation-fx): full preset editor with hit/miss + smart-default types"
```

---

### Task 9: Per-item override dialog + per-action override on NPC sheets

**Goal:** Add the "⚡ Animation FX" button to item sheets (weapons/alchemical/gear) that opens a small dialog to set `flags.vagabond-crawler.animationOverride` or `.disabled`. Also add an override button next to each action on NPC sheets that writes to `flags.vagabond-crawler.actionOverrides[index]`.

**Files:**
- Modify: `scripts/animation-fx.mjs` (register `renderItemSheet` / `renderActorSheet` hooks)
- Create: helper function `AnimationFx.openOverrideDialog(target, kind, index?)` inline in `animation-fx.mjs`

**Acceptance Criteria:**
- [ ] Item sheets for weapons/alchemical/gear show a header button "Animation FX"
- [ ] Clicking opens a dialog: `Disabled` checkbox, `Custom File` text, `Type`, `Target`, `Scale`, `Duration` — saves to `flags.vagabond-crawler.animationOverride` (or sets `disabled`)
- [ ] NPC actor sheets (VagabondNpcSheet or similar) show a small "⚡" button next to each action row
- [ ] Clicking opens the same dialog, saves to `flags.vagabond-crawler.actionOverrides[index]`
- [ ] Resolver (Task 2) correctly respects these overrides (no code change needed — just verify)

**Verify:**
1. Set a sword item's override file to a distinctive animation → roll attack → that animation plays.
2. Set a goblin's action 0 (Bite) override disabled → roll the action → no animation.

**Steps:**

- [ ] **Step 1: Inspect the NPC sheet hook name**

Foundry v13 fires `renderVagabondNpcSheet` or similar. Check via MCP:
```js
mcp__foundry-vtt__evaluate: "Object.keys(CONFIG.Actor.sheetClasses.npc || {})"
```

- [ ] **Step 2: Implement the dialog and hooks in `animation-fx.mjs`**

Add to `AnimationFx`:

```js
  async openOverrideDialog(target, kind, index = null) {
    // target: Item or Actor
    // kind: "item" or "action"
    const MODULE_ID = "vagabond-crawler";
    const currentOverride = kind === "item"
      ? (target.getFlag(MODULE_ID, "animationOverride") ?? {})
      : ((target.getFlag(MODULE_ID, "actionOverrides") ?? {})[index] ?? {});
    const currentDisabled = kind === "item" ? !!target.getFlag(MODULE_ID, "disabled") : false;

    const content = `
      <form>
        <label><input type="checkbox" name="disabled" ${currentDisabled ? "checked" : ""}/> Disable animation entirely</label>
        <hr/>
        <label>Custom file <input type="text" name="file" value="${currentOverride.hit?.file ?? ""}"/></label>
        <label>Type
          <select name="type">
            <option value="onToken" ${currentOverride.type === "onToken" ? "selected" : ""}>On Token</option>
            <option value="projectile" ${currentOverride.type === "projectile" ? "selected" : ""}>Projectile</option>
            <option value="cone" ${currentOverride.type === "cone" ? "selected" : ""}>Cone</option>
          </select>
        </label>
        <label>Target
          <select name="target">
            <option value="target" ${currentOverride.target === "target" ? "selected" : ""}>Target</option>
            <option value="self" ${currentOverride.target === "self" ? "selected" : ""}>Self</option>
          </select>
        </label>
        <label>Scale <input type="number" step="0.05" name="scale" value="${currentOverride.hit?.scale ?? 1}"/></label>
        <label>Duration (ms) <input type="number" step="50" name="duration" value="${currentOverride.hit?.duration ?? 800}"/></label>
      </form>`;

    const result = await foundry.applications.api.DialogV2.prompt({
      window: { title: kind === "item" ? `Animation FX Override: ${target.name}` : `Action Override` },
      content,
      ok: {
        label: "Save",
        callback: (ev, btn, dialog) => {
          const form = dialog.querySelector("form");
          const fd = new FormDataExtended(form);
          return fd.object;
        },
      },
    });
    if (!result) return;

    if (kind === "item") {
      await target.setFlag(MODULE_ID, "disabled", !!result.disabled);
      if (result.file) {
        const preset = {
          label: `Custom (${target.name})`,
          type: result.type,
          target: result.target,
          hit: { file: result.file, scale: Number(result.scale), duration: Number(result.duration) },
        };
        await target.setFlag(MODULE_ID, "animationOverride", preset);
      } else {
        await target.unsetFlag(MODULE_ID, "animationOverride");
      }
    } else {
      const overrides = foundry.utils.deepClone(target.getFlag(MODULE_ID, "actionOverrides") ?? {});
      if (result.disabled) {
        overrides[index] = { disabled: true };
      } else if (result.file) {
        overrides[index] = {
          label: `Custom action ${index}`,
          type: result.type,
          target: result.target,
          hit: { file: result.file, scale: Number(result.scale), duration: Number(result.duration) },
        };
      } else {
        delete overrides[index];
      }
      await target.setFlag(MODULE_ID, "actionOverrides", overrides);
    }
  },

  _registerSheetButtons() {
    Hooks.on("getItemSheetHeaderButtons", (sheet, buttons) => {
      const item = sheet.object;
      const eq = item.system?.equipmentType;
      const eligible = eq === "weapon" || item.type === "alchemical" || item.type === "gear" || eq === "gear";
      if (!eligible) return;
      buttons.unshift({
        label: "Animation FX",
        class: "animation-fx-override",
        icon: "fas fa-film",
        onclick: () => this.openOverrideDialog(item, "item"),
      });
    });

    // NPC sheet action rows — hook name varies; try multiple
    const npcHook = (app, html) => {
      const actor = app.object;
      if (!actor || actor.type !== "npc") return;
      const $html = html instanceof HTMLElement ? html : html[0];
      const rows = $html.querySelectorAll(".actions .action, [data-action-index], .npc-action");
      rows.forEach(row => {
        if (row.querySelector(".vcfx-action-override")) return;
        const idx = Number(row.dataset.actionIndex ?? row.dataset.index);
        if (Number.isNaN(idx)) return;
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "vcfx-action-override";
        btn.title = "Animation FX override";
        btn.innerHTML = "⚡";
        btn.addEventListener("click", (ev) => {
          ev.preventDefault(); ev.stopPropagation();
          this.openOverrideDialog(actor, "action", idx);
        });
        row.appendChild(btn);
      });
    };
    Hooks.on("renderVagabondNpcSheet", npcHook);
    Hooks.on("renderActorSheet", npcHook); // fallback
  },
```

Call `this._registerSheetButtons()` inside `init()` after the chat hook registration.

- [ ] **Step 3: Verify**

1. Open a sword item sheet, click "Animation FX", set custom file, save. Inspect via MCP:
   ```js
   mcp__foundry-vtt__evaluate: "(()=>{const hero=game.actors.find(a=>a.type==='character');const sword=hero?.items.find(i=>/sword/i.test(i.name));return sword?.getFlag('vagabond-crawler','animationOverride')})()"
   ```
   Expect the preset object.
2. Open an NPC sheet. Confirm ⚡ button appears next to actions.
3. Disable one action. Verify resolver returns `null`:
   ```js
   mcp__foundry-vtt__evaluate: "game.vagabondCrawler.animationFx._resolve({actor:game.actors.find(a=>a.type==='npc'),actionIndex:0})"
   ```

- [ ] **Step 4: Commit**

```bash
git add scripts/animation-fx.mjs
git commit -m "feat(animation-fx): per-item + per-action override dialogs"
```

---

### Task 10: CSS styling

**Goal:** Add `vcfx-` prefixed styles to `styles/vagabond-crawler.css` for the config window, using existing `--vcb-*` variables plus new `--vcfx-*` for hit/miss accents.

**Files:**
- Modify: `styles/vagabond-crawler.css`

**Acceptance Criteria:**
- [ ] Tab strip styled like CrawlBar tabs (active tab visually distinct)
- [ ] Preset `<fieldset>` rows have a consistent background, border, spacing
- [ ] Hit section has a subtle green left-border accent; miss section has a subtle red accent
- [ ] Details/summary for miss section has a chevron indicator
- [ ] Light theme (`body.theme-light`) overrides match the rest of the crawler

**Verify:** Open config window visually. Contrast works in both dark and light themes.

**Steps:**

- [ ] **Step 1: Add variables in the `:root` / `body.theme-light` sections**

```css
:root {
  /* ... existing vars ... */
  --vcfx-preset-bg: rgba(255,255,255,0.03);
  --vcfx-preset-border: var(--vcb-border);
  --vcfx-hit-accent: #4ade80;
  --vcfx-miss-accent: #f87171;
}

body.theme-light {
  --vcfx-preset-bg: rgba(0,0,0,0.02);
  --vcfx-hit-accent: #16a34a;
  --vcfx-miss-accent: #dc2626;
}
```

- [ ] **Step 2: Add the component styles at the bottom of the file**

```css
/* ======================= Animation FX Configuration ======================= */
.vcfx-config { display: flex; flex-direction: column; height: 100%; gap: 0.5rem; }
.vcfx-tabs { display: flex; gap: 0.25rem; border-bottom: 1px solid var(--vcb-border); }
.vcfx-tabs a { padding: 0.4rem 0.8rem; cursor: pointer; color: var(--vcb-text); border-radius: 4px 4px 0 0; }
.vcfx-tabs a.active { background: var(--vcb-accent); color: var(--vcb-surface); }
.vcfx-body { flex: 1; overflow-y: auto; padding: 0.5rem; }
.vcfx-preset { background: var(--vcfx-preset-bg); border: 1px solid var(--vcfx-preset-border); border-radius: 6px; margin-bottom: 0.6rem; padding: 0.5rem 0.8rem; }
.vcfx-preset legend { font-weight: 600; padding: 0 0.4rem; }
.vcfx-row { display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: center; margin: 0.3rem 0; }
.vcfx-row label { display: inline-flex; align-items: center; gap: 0.3rem; }
.vcfx-block { border-left: 3px solid transparent; padding: 0.3rem 0.5rem; margin: 0.3rem 0; border-radius: 0 4px 4px 0; }
.vcfx-hit { border-left-color: var(--vcfx-hit-accent); }
.vcfx-miss { border-left-color: var(--vcfx-miss-accent); }
.vcfx-miss summary { cursor: pointer; font-weight: 500; }
.vcfx-actions { display: flex; justify-content: flex-end; gap: 0.4rem; padding: 0.5rem; border-top: 1px solid var(--vcb-border); }
.vcfx-save-flash { width: 10px; height: 10px; border-radius: 50%; background: transparent; transition: background 0.3s; }
.vcfx-save-flash.vcfx-flash { background: var(--vcfx-hit-accent); }
.vcfx-action-override { margin-left: 0.3rem; padding: 0 0.3rem; font-size: 0.9em; opacity: 0.7; }
.vcfx-action-override:hover { opacity: 1; }
.vcfx-placeholder { opacity: 0.6; font-style: italic; padding: 2rem; text-align: center; }
```

- [ ] **Step 3: Visual verify**

Reload, open config. Check tabs, rows, hit/miss accents, light theme.

- [ ] **Step 4: Commit**

```bash
git add styles/vagabond-crawler.css
git commit -m "feat(animation-fx): CSS styling for config window"
```

---

### Task 11: CrawlBar integration + end-to-end verification

**Goal:** Add an "Animation FX" button to CrawlBar's Forge & Loot picker panel, then run the full verification matrix from the spec.

**Files:**
- Modify: `scripts/crawl-bar.mjs` (add button to the tool picker panel)

**Acceptance Criteria:**
- [ ] CrawlBar's tool picker panel has a new button icon that opens `AnimationFxConfigApp`
- [ ] All 7 scenarios from spec §Testing pass

**Verify:** See spec §Testing. Specifically:
1. Resolver returns expected presets for weapons, alchemical, gear, NPC actions; overrides beat category; `_default` fills gaps
2. onToken, projectile, cone all render with correct math
3. Hit vs miss: forced rollOutcome works; missing miss block no-ops; `triggerOn: "hit"` suppresses miss
4. Torch toggles on and off
5. NPC bite/breath action triggers from action menu → animation plays
6. 3 targets → 150ms stagger
7. Config save persists; reset-tab restores per-tab defaults

**Steps:**

- [ ] **Step 1: Read `scripts/crawl-bar.mjs` to find the Forge & Loot tool picker panel**

Locate where Forge / Loot buttons are rendered and add a third button in the same pattern.

- [ ] **Step 2: Add the button**

In the relevant `_renderToolPicker()` (or equivalent), add:
```js
{
  id: "animation-fx",
  label: "Animation FX",
  icon: ICONS.film ?? "fas fa-film",
  onClick: () => game.vagabondCrawler.animationFx.open(),
}
```
Mirror the existing button-construction pattern exactly.

- [ ] **Step 3: Run the full verification matrix**

Execute each scenario from the spec Testing section via Foundry MCP. Record results. Fix any regressions.

- [ ] **Step 4: Update CLAUDE.md file map**

Add rows for `animation-fx.mjs`, `animation-fx-config.mjs`, `animation-fx-defaults.mjs`, `templates/animation-fx-config.hbs` to the File Map in `CLAUDE.md`. Also remove the "item-sequencer cone patch" mention from the `npc-abilities.mjs` row (now handled by AnimationFx).

- [ ] **Step 5: Commit**

```bash
git add scripts/crawl-bar.mjs CLAUDE.md
git commit -m "feat(animation-fx): CrawlBar button + update CLAUDE.md"
```

---

## Spec Coverage Map

| Spec section | Task(s) |
|---|---|
| File structure | Task 0, Task 7, Task 10 |
| Data model (unified schema, hit/miss, overrides) | Task 1, Task 9 |
| Resolver (priority chain, smart-default) | Task 2, Task 8 (smart-default in UI) |
| Playback (onToken, projectile, cone, persist, sound, stagger) | Task 3 |
| Trigger (chat hook, outcome detection, NPC action flag) | Task 4, Task 5 |
| Retire cone patch | Task 6 |
| Config UI (tabs, preset rows, hit/miss editor, pickers) | Task 7, Task 8, Task 10 |
| Per-item + per-action overrides | Task 9 |
| CrawlBar integration | Task 11 |
| Settings registration | Task 0, Task 7 (menu entry) |
| Debugging hooks (`open`, `previewPreset`, `_resolve`) | Task 0 (open), Task 2 (_resolve), Task 8 (preview via UI) |

## Deferred from spec

- `previewPreset(preset, token)` public debug method: Task 8's UI preview covers the main use. If a standalone API method is desired, add it to `AnimationFx` in Task 3 as a one-liner wrapping `_play`.
