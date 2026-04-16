# Session Recap Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers-extended-cc:subagent-driven-development (recommended) or superpowers-extended-cc:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a tabbed ApplicationV2 window that tracks combat stats, loot, and XP per session — absorbing the existing Loot Tracker UI and adding combat/roll/XP tracking with Discord markdown export.

**Architecture:** Singleton data layer (`SessionRecap`) handles all persistence and capture hooks, with a separate `SessionRecapApp` for the tabbed UI. The existing `LootTracker` singleton is kept as a thin facade redirecting to `SessionRecap` for storage. Combat damage/kill tracking reads structured flags from the `damage-log` module (soft dependency). Roll stats are captured from chat messages.

**Tech Stack:** Foundry VTT v13 ApplicationV2, HandlebarsApplicationMixin, ES modules, Handlebars templates, CSS custom properties.

**Spec:** `docs/superpowers/specs/2026-04-16-session-recap-design.md`

---

### Task 1: SessionRecap Singleton — Data Layer

**Goal:** Create the core singleton that manages the `sessionRecap` world setting, provides read/write methods, and handles setting migration from the old `lootLog`.

**Files:**
- Create: `scripts/session-recap.mjs`
- Modify: `scripts/vagabond-crawler.mjs` (register setting, import, init, expose on `game.vagabondCrawler`)

**Acceptance Criteria:**
- [ ] `sessionRecap` world setting registered with correct default shape
- [ ] `SessionRecap.getData()` returns the full session state
- [ ] `SessionRecap.logLoot(entry)` appends to `sessionRecap.loot`
- [ ] `SessionRecap.logXp({player, actorId, questions, totalXp})` appends to `sessionRecap.xp`
- [ ] `SessionRecap.logCombat(combatEntry)` appends to `sessionRecap.combats`
- [ ] `SessionRecap.updatePlayerStat(actorId, name, path, delta)` increments a playerStats field
- [ ] `SessionRecap.clear()` resets all fields and sets `sessionStart` to now
- [ ] `sessionStart` is auto-set on first event if null
- [ ] Migration: existing `lootLog` data copied to `sessionRecap.loot` on first ready

**Verify:** Open Foundry console → `game.vagabondCrawler.recap.getData()` returns correct shape with empty arrays. Run `game.vagabondCrawler.recap.logLoot({player:"Test",source:"Test",type:"item",detail:"Sword"})` → re-read and confirm entry exists.

**Steps:**

- [ ] **Step 1: Create `scripts/session-recap.mjs` with the singleton skeleton**

```js
/**
 * Vagabond Crawler — Session Recap
 *
 * Singleton data layer for tracking session events (combat, loot, XP, rolls).
 * Persists to world setting `sessionRecap`. Provides logging methods and
 * Discord markdown export.
 */

import { MODULE_ID } from "./vagabond-crawler.mjs";

const SETTING_KEY = "sessionRecap";

const DEFAULT_DATA = {
  sessionStart: null,
  loot: [],
  xp: [],
  combats: [],
  playerStats: {},
};

export const SessionRecap = {
  _app: null,

  // ── Settings ───────────────────────────────────────────────

  registerSettings() {
    game.settings.register(MODULE_ID, SETTING_KEY, {
      scope: "world",
      config: false,
      type: Object,
      default: foundry.utils.deepClone(DEFAULT_DATA),
    });
  },

  // ── Read / Write ───────────────────────────────────────────

  getData() {
    return game.settings.get(MODULE_ID, SETTING_KEY) ?? foundry.utils.deepClone(DEFAULT_DATA);
  },

  async _save(data) {
    await game.settings.set(MODULE_ID, SETTING_KEY, data);
    if (this._app?.rendered) this._app.render();
  },

  _ensureStart(data) {
    if (!data.sessionStart) data.sessionStart = Date.now();
  },

  // ── Loot Logging ───────────────────────────────────────────

  async logLoot(entry) {
    const data = this.getData();
    this._ensureStart(data);
    data.loot.push({
      ...entry,
      timestamp: Date.now(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    });
    await this._save(data);
  },

  // ── XP Logging ─────────────────────────────────────────────

  async logXp({ player, actorId, questions, totalXp }) {
    const data = this.getData();
    this._ensureStart(data);
    data.xp.push({
      player,
      actorId,
      questions,
      totalXp,
      timestamp: Date.now(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    });
    await this._save(data);
  },

  // ── Combat Logging ─────────────────────────────────────────

  async logCombat(combatEntry) {
    const data = this.getData();
    this._ensureStart(data);
    data.combats.push(combatEntry);
    await this._save(data);
  },

  // ── Player Stat Updates ────────────────────────────────────

  async updatePlayerStat(actorId, name, path, delta) {
    const data = this.getData();
    this._ensureStart(data);
    if (!data.playerStats[actorId]) {
      data.playerStats[actorId] = {
        name,
        attacks: { hits: 0, misses: 0, nat20s: 0, nat1s: 0 },
        saves: { passes: 0, fails: 0, nat20s: 0, nat1s: 0 },
        rolls: { total: 0, sum: 0 },
        damageDealt: 0,
        damageTaken: 0,
        kills: 0,
      };
    }
    // path is dot-separated, e.g. "attacks.hits" or "damageDealt"
    const parts = path.split(".");
    let obj = data.playerStats[actorId];
    for (let i = 0; i < parts.length - 1; i++) obj = obj[parts[i]];
    obj[parts[parts.length - 1]] += delta;
    await this._save(data);
  },

  // ── Clear ──────────────────────────────────────────────────

  async clear() {
    const fresh = foundry.utils.deepClone(DEFAULT_DATA);
    fresh.sessionStart = Date.now();
    await this._save(fresh);
  },

  // ── Migration ──────────────────────────────────────────────

  async migrateFromLootLog() {
    const oldLog = game.settings.get(MODULE_ID, "lootLog");
    if (!oldLog?.length) return;
    const data = this.getData();
    if (data.loot.length > 0) return; // already has data, skip
    data.loot = foundry.utils.deepClone(oldLog);
    if (!data.sessionStart && oldLog.length > 0) {
      data.sessionStart = oldLog[0].timestamp ?? Date.now();
    }
    await this._save(data);
    console.log(`${MODULE_ID} | Migrated ${oldLog.length} loot entries to sessionRecap`);
  },

  // ── Init ───────────────────────────────────────────────────

  init() {
    this.migrateFromLootLog();
    console.log(`${MODULE_ID} | Session Recap initialized.`);
  },

  // ── Open Window ────────────────────────────────────────────

  open() {
    // SessionRecapApp will be wired in Task 4
    if (!this._app) {
      const { SessionRecapApp } = await import("./session-recap-app.mjs");
      this._app = new SessionRecapApp();
    }
    this._app.render(true);
  },
};
```

Note: The `open()` method uses dynamic import since `SessionRecapApp` is created in Task 4. Fix the `async` — `open()` needs to be `async open()`.

- [ ] **Step 2: Register the setting and wire into vagabond-crawler.mjs**

In `scripts/vagabond-crawler.mjs`, add the import at the top alongside the other imports:

```js
import { SessionRecap }    from "./session-recap.mjs";
```

In the `Hooks.once("init")` block, after the existing `LootTracker.registerSettings()` call (line 135), add:

```js
SessionRecap.registerSettings();
```

In the `Hooks.once("ready")` block, in the `game.vagabondCrawler` object (around line 157), add:

```js
recap: SessionRecap,
```

After the existing init calls (around line 238), add:

```js
SessionRecap.init();
```

- [ ] **Step 3: Commit**

```bash
git add scripts/session-recap.mjs scripts/vagabond-crawler.mjs
git commit -m "feat(session-recap): add SessionRecap singleton data layer"
```

---

### Task 2: Absorb LootTracker Internals

**Goal:** Redirect `LootTracker`'s internal storage to `SessionRecap`, remove `LootTrackerApp`, and update `open()` to point to the new recap window.

**Files:**
- Modify: `scripts/loot-tracker.mjs` (gut internals, keep public API)
- Delete: `templates/loot-tracker.hbs`

**Acceptance Criteria:**
- [ ] `LootTracker.log()` writes to `SessionRecap.logLoot()` internally
- [ ] `LootTracker.logClaim()` and `logPickup()` still work identically for callers
- [ ] `LootTracker.getLog()` reads from `SessionRecap.getData().loot`
- [ ] `LootTracker.open()` opens `SessionRecap.open()` instead of the deleted `LootTrackerApp`
- [ ] `LootTrackerApp` class deleted
- [ ] `templates/loot-tracker.hbs` deleted
- [ ] `LootTracker.clearLog()` calls `SessionRecap.clear()`
- [ ] `LootTracker.formatForDiscord()` delegates to `SessionRecap.formatForDiscord()` (stub for now, implemented in Task 6)

**Verify:** In Foundry, trigger a loot drop to an NPC and claim it. Check `game.vagabondCrawler.recap.getData().loot` shows the entry. Run `game.vagabondCrawler.lootTracker.getLog()` and confirm it returns the same data.

**Steps:**

- [ ] **Step 1: Rewrite `scripts/loot-tracker.mjs`**

Replace the entire file with:

```js
/**
 * Vagabond Crawler — Loot Tracker (Facade)
 *
 * Public API preserved for backward compatibility.
 * Storage and UI delegated to SessionRecap.
 */

import { SessionRecap } from "./session-recap.mjs";

export const LootTracker = {

  registerSettings() {
    // Setting now owned by SessionRecap — kept as no-op for call-site compat
  },

  init() {
    console.log("vagabond-crawler | Loot Tracker initialized (facade → SessionRecap).");
  },

  async log(entry) {
    await SessionRecap.logLoot(entry);
  },

  async logClaim(playerName, sourceName, currency, items) {
    const parts = [];
    if (currency.gold > 0) parts.push(`${currency.gold} Gold`);
    if (currency.silver > 0) parts.push(`${currency.silver} Silver`);
    if (currency.copper > 0) parts.push(`${currency.copper} Copper`);

    if (parts.length > 0) {
      await this.log({
        player: playerName,
        source: sourceName,
        type: "currency",
        detail: parts.join(", "),
      });
    }

    for (const item of items) {
      await this.log({
        player: playerName,
        source: sourceName,
        type: "item",
        detail: item.name,
        img: item.img,
      });
    }
  },

  async logPickup(playerName, itemName, itemImg) {
    await this.log({
      player: playerName,
      source: "Ground",
      type: "pickup",
      detail: itemName,
      img: itemImg,
    });
  },

  getLog() {
    return SessionRecap.getData().loot ?? [];
  },

  async clearLog() {
    await SessionRecap.clear();
  },

  formatForDiscord() {
    return SessionRecap.formatForDiscord();
  },

  open() {
    SessionRecap.open();
  },
};
```

- [ ] **Step 2: Delete `templates/loot-tracker.hbs`**

```bash
git rm templates/loot-tracker.hbs
```

- [ ] **Step 3: Commit**

```bash
git add scripts/loot-tracker.mjs
git commit -m "refactor(loot-tracker): convert to facade over SessionRecap"
```

---

### Task 3: Combat & Damage Capture Hooks

**Goal:** Register hooks that auto-capture combat encounters (start/end/participants/enemies), damage dealt/taken from damage-log chat messages, and kill attribution.

**Files:**
- Modify: `scripts/session-recap.mjs` (add `_initCombatHooks()`, transient `_activeCombats` map, `_killMap`)

**Acceptance Criteria:**
- [ ] `combatStart` or `createCombat` hook records `startTime` and PC participants
- [ ] `deleteCombat` hook finalizes encounter: `endTime`, `rounds`, enemies with defeated/killedBy
- [ ] `createChatMessage` hook reads `damage-log` flags when that module is active
- [ ] NPC HP decrease attributes `damageDealt` to the current combat turn's PC
- [ ] PC HP decrease records `damageTaken`
- [ ] NPC reaching 0 HP credits kill to the current turn's PC
- [ ] All capture is gated behind `game.user.isGM` (GM client does the logging)
- [ ] Gracefully skips damage/kill tracking if damage-log is not active

**Verify:** Start a combat with 2 PCs and 1 NPC. Attack the NPC until defeated. End combat. Check `game.vagabondCrawler.recap.getData().combats` has the encounter with correct enemies, participants, rounds, and timing. Check `playerStats` for damage dealt and kills (requires damage-log active).

**Steps:**

- [ ] **Step 1: Add transient state and combat hooks to `session-recap.mjs`**

Add these properties to the `SessionRecap` singleton object:

```js
  // Transient combat state (not persisted — lives only during active combats)
  _activeCombats: new Map(),   // combatId → { startTime, participants }
  _killMap: new Map(),         // tokenId → characterName (who last damaged this NPC)
  _hasDamageLog: false,
```

Add `_initCombatHooks()` method:

```js
  _initCombatHooks() {
    if (!game.user.isGM) return;

    this._hasDamageLog = game.modules.get("damage-log")?.active ?? false;

    // ── Combat start ───────────────────────────────────────
    Hooks.on("combatStart", (combat) => {
      const participants = [];
      for (const c of combat.combatants) {
        if (!c.actor || !c.token) continue;
        const disp = c.token.disposition ?? c.token.document?.disposition;
        if (disp === CONST.TOKEN_DISPOSITIONS.FRIENDLY && c.actor.hasPlayerOwner) {
          participants.push({ name: c.actor.name, actorId: c.actor.id });
        }
      }
      this._activeCombats.set(combat.id, {
        startTime: Date.now(),
        participants,
      });
    });

    // ── Combat end ─────────────────────────────────────────
    Hooks.on("deleteCombat", async (combat) => {
      const active = this._activeCombats.get(combat.id);
      if (!active) return;

      const enemies = [];
      for (const c of combat.combatants) {
        if (!c.actor) continue;
        const disp = c.token?.disposition ?? c.token?.document?.disposition;
        if (disp === CONST.TOKEN_DISPOSITIONS.FRIENDLY) continue;

        const hp = c.actor.system?.health;
        const defeated = c.defeated || (hp && hp.value <= 0);
        const tokenId = c.token?.id ?? c.token?.document?.id;
        enemies.push({
          name: c.actor.name,
          defeated: !!defeated,
          killedBy: defeated ? (this._killMap.get(tokenId) ?? null) : null,
        });
      }

      await this.logCombat({
        id: combat.id,
        rounds: combat.round ?? 0,
        startTime: active.startTime,
        endTime: Date.now(),
        enemies,
        participants: active.participants,
      });

      // Cleanup transient state
      this._activeCombats.delete(combat.id);
      this._killMap.clear();
    });

    // ── Damage-log chat messages ───────────────────────────
    if (this._hasDamageLog) {
      Hooks.on("createChatMessage", (message) => {
        const flags = message.flags?.["damage-log"];
        if (!flags?.changes?.length) return;
        if (!game.combat) return; // only track during combat

        const targetActorId = message.speaker?.actor;
        if (!targetActorId) return;
        const targetActor = game.actors.get(targetActorId);
        if (!targetActor) return;

        // Determine attacker: whoever's turn it is
        const currentCombatant = game.combat.combatant;
        const attackerActor = currentCombatant?.actor;
        const attackerIsPC = attackerActor?.hasPlayerOwner
          && (currentCombatant.token?.disposition ?? currentCombatant.token?.document?.disposition) === CONST.TOKEN_DISPOSITIONS.FRIENDLY;

        for (const change of flags.changes) {
          if (change.id !== "hp") continue;
          const diff = (change.new ?? 0) - (change.old ?? 0);
          if (diff >= 0) continue; // healing or no change
          const absDiff = Math.abs(diff);

          const targetIsPC = targetActor.hasPlayerOwner;

          if (targetIsPC) {
            // PC took damage
            this.updatePlayerStat(targetActorId, targetActor.name, "damageTaken", absDiff);
          } else if (attackerIsPC && attackerActor) {
            // NPC took damage from a PC's turn
            this.updatePlayerStat(attackerActor.id, attackerActor.name, "damageDealt", absDiff);

            // Track kill credit
            const tokenId = message.speaker?.token;
            if (tokenId) {
              this._killMap.set(tokenId, attackerActor.name);
            }

            // Check for kill (HP reached 0)
            if ((change.new ?? 0) <= 0) {
              this.updatePlayerStat(attackerActor.id, attackerActor.name, "kills", 1);
            }
          }
        }
      });
    }
  },
```

- [ ] **Step 2: Call `_initCombatHooks()` from `init()`**

Update the `init()` method:

```js
  init() {
    this.migrateFromLootLog();
    this._initCombatHooks();
    console.log(`${MODULE_ID} | Session Recap initialized.`);
  },
```

- [ ] **Step 3: Commit**

```bash
git add scripts/session-recap.mjs
git commit -m "feat(session-recap): add combat encounter and damage capture hooks"
```

---

### Task 4: Roll Stats Capture via Chat Messages

**Goal:** Capture attack hit/miss, save pass/fail, nat 20s/1s, and average d20 from chat messages posted by the Vagabond system.

**Files:**
- Modify: `scripts/session-recap.mjs` (add `_initRollHooks()`)

**Acceptance Criteria:**
- [ ] `createChatMessage` hook detects attack rolls and records hit/miss/nat20/nat1
- [ ] `createChatMessage` hook detects save rolls and records pass/fail/nat20/nat1
- [ ] Raw d20 value tracked for average calculation
- [ ] Only tracks rolls from player-owned characters (skip NPC rolls)
- [ ] Works independently of damage-log (separate hook from Task 3)

**Verify:** In Foundry, make an attack roll with a PC. Check `game.vagabondCrawler.recap.getData().playerStats[actorId].attacks` shows updated hit/miss count. Make a save. Check `playerStats[actorId].saves` is updated.

**Steps:**

- [ ] **Step 1: Add `_initRollHooks()` to `session-recap.mjs`**

The Vagabond system posts all rolls as chat messages. The message's `rolls` array contains `Roll` objects. The rendered HTML contains outcome indicators (`HIT`, `MISS`, `PASS`, `FAIL`). We parse the roll and HTML to extract stats.

```js
  _initRollHooks() {
    if (!game.user.isGM) return;

    Hooks.on("createChatMessage", (message) => {
      // Skip non-roll messages
      if (!message.rolls?.length) return;

      // Get the actor who made the roll
      const actorId = message.speaker?.actor;
      if (!actorId) return;
      const actor = game.actors.get(actorId);
      if (!actor?.hasPlayerOwner) return; // only track PC rolls

      const roll = message.rolls[0];
      // Extract natural d20 value
      const d20Die = roll.dice?.find(d => d.faces === 20);
      const naturalResult = d20Die?.results?.[0]?.result;
      if (naturalResult == null) return; // not a d20 roll

      const isNat20 = naturalResult === 20;
      const isNat1 = naturalResult === 1;
      const name = actor.name;

      // Track raw d20 for average
      this.updatePlayerStat(actorId, name, "rolls.total", 1);
      this.updatePlayerStat(actorId, name, "rolls.sum", naturalResult);

      // Determine roll type from chat card content
      // The system's VagabondChatCard renders outcome as HIT/MISS or PASS/FAIL
      const content = message.content ?? "";
      const isAttack = /\bHIT\b/.test(content) || /\bMISS\b/.test(content);
      const isSave = /\bPASS\b/.test(content) || /\bFAIL\b/.test(content);

      if (isAttack) {
        const isHit = /\bHIT\b/.test(content);
        this.updatePlayerStat(actorId, name, isHit ? "attacks.hits" : "attacks.misses", 1);
        if (isNat20) this.updatePlayerStat(actorId, name, "attacks.nat20s", 1);
        if (isNat1) this.updatePlayerStat(actorId, name, "attacks.nat1s", 1);
      } else if (isSave) {
        const isPassed = /\bPASS\b/.test(content);
        this.updatePlayerStat(actorId, name, isPassed ? "saves.passes" : "saves.fails", 1);
        if (isNat20) this.updatePlayerStat(actorId, name, "saves.nat20s", 1);
        if (isNat1) this.updatePlayerStat(actorId, name, "saves.nat1s", 1);
      }
    });
  },
```

- [ ] **Step 2: Call `_initRollHooks()` from `init()`**

Update `init()`:

```js
  init() {
    this.migrateFromLootLog();
    this._initCombatHooks();
    this._initRollHooks();
    console.log(`${MODULE_ID} | Session Recap initialized.`);
  },
```

- [ ] **Step 3: Commit**

```bash
git add scripts/session-recap.mjs
git commit -m "feat(session-recap): add roll stats capture from chat messages"
```

---

### Task 5: XP Logging Integration

**Goal:** Wire the already-built XP counter patch to log XP awards to `SessionRecap`.

**Files:**
- Modify: `scripts/xp-counter-patch.mjs` (add `SessionRecap.logXp()` call in the patched `awardXP`)

**Acceptance Criteria:**
- [ ] When XP is awarded via the Level Up dialog, `SessionRecap.logXp()` is called
- [ ] The logged entry includes player name, actor ID, question breakdown with counts, and total XP
- [ ] The XP counter patch still works exactly as before (increment, decrement, award)

**Verify:** Open a character's Level Up dialog, check some XP questions (including multi-count), click Award XP. Check `game.vagabondCrawler.recap.getData().xp` has the entry with correct question snapshot.

**Steps:**

- [ ] **Step 1: Add SessionRecap import and logXp call to `xp-counter-patch.mjs`**

At the top of the file, add:

```js
import { SessionRecap } from "./session-recap.mjs";
```

In the patched `awardXP` action handler (inside `_patchClass()`), after the `ui.notifications.info(...)` line and before `this.render()`, add the logging call:

```js
      // Log to Session Recap
      const xpQuestionsCfg = CONFIG.VAGABOND?.homebrew?.leveling?.xpQuestions ?? [];
      const questionSnapshot = xpQuestionsCfg.map((q, i) => ({
        label: q.question,
        xp: q.xp || 1,
        count: this.questions[i] || 0,
      })).filter(q => q.count > 0);

      SessionRecap.logXp({
        player: this.actor.name,
        actorId: this.actor.id,
        questions: questionSnapshot,
        totalXp: xpGained,
      });
```

- [ ] **Step 2: Commit**

```bash
git add scripts/xp-counter-patch.mjs
git commit -m "feat(session-recap): log XP awards from counter patch"
```

---

### Task 6: Discord Markdown Export

**Goal:** Implement `SessionRecap.formatForDiscord()` producing the full session recap as plain markdown.

**Files:**
- Modify: `scripts/session-recap.mjs` (add `formatForDiscord()` method and helper `_formatDuration()`)

**Acceptance Criteria:**
- [ ] Output includes session duration header
- [ ] Combat section lists encounters with rounds, duration, enemies, and kill credits
- [ ] Player Stats section shows per-player attacks (hit%, nat20s, nat1s), saves, avg d20, damage, kills
- [ ] Loot section groups by player with currency totals and item list
- [ ] XP section shows per-player question breakdown and totals
- [ ] Empty sections are omitted
- [ ] Players with no activity in a section are omitted

**Verify:** Populate some test data via console calls, then run `game.vagabondCrawler.recap.formatForDiscord()` and confirm the output matches the spec format.

**Steps:**

- [ ] **Step 1: Add `_formatDuration()` helper to `session-recap.mjs`**

```js
  _formatDuration(ms) {
    if (!ms || ms < 0) return "0m";
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  },
```

- [ ] **Step 2: Add `formatForDiscord()` method**

```js
  formatForDiscord() {
    const data = this.getData();
    const lines = [];

    // Header
    const duration = data.sessionStart
      ? this._formatDuration(Date.now() - data.sessionStart)
      : "N/A";
    lines.push("# Session Recap");
    lines.push(`**Duration:** ${duration}`);
    lines.push("");

    // ── Combat ─────────────────────────────────────────────
    if (data.combats.length > 0) {
      lines.push("## Combat");
      data.combats.forEach((combat, idx) => {
        const combatDuration = combat.startTime && combat.endTime
          ? ` (${this._formatDuration(combat.endTime - combat.startTime)})`
          : "";
        lines.push(`**Encounter ${idx + 1}** — ${combat.rounds} rounds${combatDuration}`);

        // Group enemies by name
        const enemyCounts = {};
        for (const e of combat.enemies) {
          if (!enemyCounts[e.name]) enemyCounts[e.name] = { total: 0, defeated: 0, killers: [] };
          enemyCounts[e.name].total++;
          if (e.defeated) {
            enemyCounts[e.name].defeated++;
            if (e.killedBy) enemyCounts[e.name].killers.push(e.killedBy);
          }
        }

        const enemyList = Object.entries(enemyCounts)
          .map(([name, c]) => `${name}${c.total > 1 ? ` x${c.total}` : ""}`)
          .join(", ");
        lines.push(`- Enemies: ${enemyList}`);

        // Defeated with kill credit
        const defeatedParts = [];
        for (const [name, c] of Object.entries(enemyCounts)) {
          if (c.defeated === 0) continue;
          const killerCounts = {};
          c.killers.forEach(k => { killerCounts[k] = (killerCounts[k] || 0) + 1; });
          const killerStr = Object.entries(killerCounts)
            .map(([k, n]) => n > 1 ? `${k} x${n}` : k)
            .join(", ");
          const label = c.defeated > 1 ? `${name} x${c.defeated}` : name;
          defeatedParts.push(killerStr ? `${label} (${killerStr})` : label);
        }
        if (defeatedParts.length > 0) {
          lines.push(`- Defeated: ${defeatedParts.join(", ")}`);
        }
        lines.push("");
      });
    }

    // ── Player Stats ───────────────────────────────────────
    const statEntries = Object.entries(data.playerStats).filter(([, s]) => {
      return s.attacks.hits + s.attacks.misses > 0
        || s.saves.passes + s.saves.fails > 0
        || s.damageDealt > 0 || s.damageTaken > 0 || s.kills > 0;
    });

    if (statEntries.length > 0) {
      lines.push("## Player Stats");
      for (const [, stats] of statEntries) {
        lines.push(`### ${stats.name}`);

        const totalAtk = stats.attacks.hits + stats.attacks.misses;
        if (totalAtk > 0) {
          const hitPct = Math.round((stats.attacks.hits / totalAtk) * 100);
          let atkLine = `- **Attacks:** ${stats.attacks.hits}/${totalAtk} hit (${hitPct}%)`;
          const atkParts = [];
          if (stats.attacks.nat20s > 0) atkParts.push(`${stats.attacks.nat20s} nat 20${stats.attacks.nat20s > 1 ? "s" : ""}`);
          if (stats.attacks.nat1s > 0) atkParts.push(`${stats.attacks.nat1s} nat 1${stats.attacks.nat1s > 1 ? "s" : ""}`);
          if (atkParts.length > 0) atkLine += ` — ${atkParts.join(", ")}`;
          lines.push(atkLine);
        }

        const totalSave = stats.saves.passes + stats.saves.fails;
        if (totalSave > 0) {
          let saveLine = `- **Saves:** ${stats.saves.passes}/${totalSave} passed`;
          const saveParts = [];
          if (stats.saves.nat20s > 0) saveParts.push(`${stats.saves.nat20s} nat 20${stats.saves.nat20s > 1 ? "s" : ""}`);
          if (stats.saves.nat1s > 0) saveParts.push(`${stats.saves.nat1s} nat 1${stats.saves.nat1s > 1 ? "s" : ""}`);
          if (saveParts.length > 0) saveLine += ` — ${saveParts.join(", ")}`;
          lines.push(saveLine);
        }

        if (stats.rolls.total > 0) {
          const avg = (stats.rolls.sum / stats.rolls.total).toFixed(1);
          lines.push(`- **Avg d20:** ${avg}`);
        }

        if (stats.damageDealt > 0 || stats.damageTaken > 0) {
          lines.push(`- **Damage:** ${stats.damageDealt} dealt / ${stats.damageTaken} taken`);
        }

        if (stats.kills > 0) {
          lines.push(`- **Kills:** ${stats.kills}`);
        }
        lines.push("");
      }
    }

    // ── Loot ───────────────────────────────────────────────
    if (data.loot.length > 0) {
      const byPlayer = {};
      for (const entry of data.loot) {
        if (!byPlayer[entry.player]) byPlayer[entry.player] = [];
        byPlayer[entry.player].push(entry);
      }

      lines.push("## Loot");
      for (const [player, entries] of Object.entries(byPlayer)) {
        lines.push(`### ${player}`);

        const currencyEntries = entries.filter(e => e.type === "currency");
        const itemEntries = entries.filter(e => e.type === "item" || e.type === "pickup");

        if (currencyEntries.length > 0) {
          let totalGold = 0, totalSilver = 0, totalCopper = 0;
          for (const e of currencyEntries) {
            const gm = e.detail.match(/(\d+)\s*Gold/i);
            const sm = e.detail.match(/(\d+)\s*Silver/i);
            const cm = e.detail.match(/(\d+)\s*Copper/i);
            if (gm) totalGold += parseInt(gm[1]);
            if (sm) totalSilver += parseInt(sm[1]);
            if (cm) totalCopper += parseInt(cm[1]);
          }
          const parts = [];
          if (totalGold > 0) parts.push(`${totalGold}g`);
          if (totalSilver > 0) parts.push(`${totalSilver}s`);
          if (totalCopper > 0) parts.push(`${totalCopper}c`);
          if (parts.length > 0) lines.push(`- **Currency:** ${parts.join(", ")}`);
        }

        if (itemEntries.length > 0) {
          lines.push("- **Items:**");
          for (const e of itemEntries) {
            const source = e.source !== "Ground" ? ` *(from ${e.source})*` : " *(picked up)*";
            lines.push(`  - ${e.detail}${source}`);
          }
        }
        lines.push("");
      }
    }

    // ── XP ─────────────────────────────────────────────────
    if (data.xp.length > 0) {
      const byPlayer = {};
      for (const entry of data.xp) {
        if (!byPlayer[entry.player]) byPlayer[entry.player] = { entries: [], total: 0 };
        byPlayer[entry.player].entries.push(entry);
        byPlayer[entry.player].total += entry.totalXp;
      }

      lines.push("## XP");
      for (const [player, { entries, total }] of Object.entries(byPlayer)) {
        lines.push(`### ${player}`);
        for (const entry of entries) {
          for (const q of entry.questions) {
            lines.push(`- ${q.label} — x${q.count} = ${q.count * q.xp} XP`);
          }
        }
        lines.push(`- **Total: ${total} XP**`);
        lines.push("");
      }
    }

    if (lines.length <= 3) return "No session activity recorded.";
    return lines.join("\n");
  },
```

- [ ] **Step 3: Commit**

```bash
git add scripts/session-recap.mjs
git commit -m "feat(session-recap): add Discord markdown export"
```

---

### Task 7: SessionRecapApp — Tabbed UI Window

**Goal:** Create the tabbed ApplicationV2 window with Overview, Combat, Loot, and XP tabs, plus persistent footer buttons.

**Files:**
- Create: `scripts/session-recap-app.mjs`
- Create: `templates/session-recap.hbs`

**Acceptance Criteria:**
- [ ] Window opens with 4 tabs: Overview, Combat, Loot, XP
- [ ] Overview tab shows session duration, total combats/enemies, per-player summary
- [ ] Combat tab shows per-encounter collapsible sections with enemy lists and player stats table
- [ ] Combat tab shows damage-log notice if module not active
- [ ] Loot tab shows reverse-chronological entry list (same visual as old loot tracker)
- [ ] XP tab shows per-player question breakdown with counts and totals
- [ ] Footer has "Copy for Discord" and "Clear Session" (GM only) buttons
- [ ] Window is 650x550, resizable, accessible by all users

**Verify:** Open the recap window via `game.vagabondCrawler.recap.open()`. Click through all tabs. Click "Copy for Discord" and paste — confirm formatted markdown. Click "Clear Session" (as GM) and confirm data is wiped.

**Steps:**

- [ ] **Step 1: Create `scripts/session-recap-app.mjs`**

```js
/**
 * Vagabond Crawler — Session Recap Application
 *
 * Tabbed ApplicationV2 window: Overview, Combat, Loot, XP.
 */

import { SessionRecap } from "./session-recap.mjs";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export class SessionRecapApp extends HandlebarsApplicationMixin(ApplicationV2) {

  static DEFAULT_OPTIONS = {
    id: "vagabond-crawler-session-recap",
    classes: ["vagabond-crawler", "session-recap"],
    window: { title: "Session Recap", resizable: true },
    position: { width: 650, height: 550 },
    actions: {
      changeTab: SessionRecapApp._onChangeTab,
      toggleEncounter: SessionRecapApp._onToggleEncounter,
    },
  };

  static PARTS = {
    form: {
      template: "modules/vagabond-crawler/templates/session-recap.hbs",
      scrollable: [".sr-tab-content"],
    },
  };

  constructor(options = {}) {
    super(options);
    this.activeTab = "overview";
    this._expandedCombats = new Set();
  }

  async _prepareContext() {
    const data = SessionRecap.getData();
    const hasDamageLog = game.modules.get("damage-log")?.active ?? false;

    // Session duration
    const sessionDuration = data.sessionStart
      ? SessionRecap._formatDuration(Date.now() - data.sessionStart)
      : "No events yet";

    // Player stats summary for overview
    const playerSummaries = Object.entries(data.playerStats).map(([actorId, s]) => ({
      actorId,
      name: s.name,
      kills: s.kills,
      damageDealt: s.damageDealt,
      damageTaken: s.damageTaken,
      totalXp: data.xp.filter(x => x.actorId === actorId).reduce((sum, x) => sum + x.totalXp, 0),
    }));

    // Combat encounters for combat tab
    const combats = data.combats.map((c, idx) => {
      const duration = c.startTime && c.endTime
        ? SessionRecap._formatDuration(c.endTime - c.startTime)
        : "";
      const totalDefeated = c.enemies.filter(e => e.defeated).length;
      return {
        index: idx,
        label: `Encounter ${idx + 1}`,
        rounds: c.rounds,
        duration,
        enemies: c.enemies,
        participants: c.participants,
        totalEnemies: c.enemies.length,
        totalDefeated,
        expanded: this._expandedCombats.has(idx),
      };
    });

    // Player stats table for combat tab
    const playerStatsTable = Object.entries(data.playerStats).map(([, s]) => {
      const totalAtk = s.attacks.hits + s.attacks.misses;
      const totalSaves = s.saves.passes + s.saves.fails;
      return {
        name: s.name,
        hitRate: totalAtk > 0 ? `${s.attacks.hits}/${totalAtk} (${Math.round((s.attacks.hits / totalAtk) * 100)}%)` : "—",
        nat20s: s.attacks.nat20s + s.saves.nat20s,
        nat1s: s.attacks.nat1s + s.saves.nat1s,
        avgD20: s.rolls.total > 0 ? (s.rolls.sum / s.rolls.total).toFixed(1) : "—",
        saveRate: totalSaves > 0 ? `${s.saves.passes}/${totalSaves}` : "—",
        damageDealt: s.damageDealt,
        damageTaken: s.damageTaken,
        kills: s.kills,
      };
    });

    // Loot entries (reverse chronological)
    const lootEntries = [...data.loot].reverse().map(entry => {
      const iconHtml = entry.type === "currency"
        ? '<i class="fas fa-coins" style="color:gold;"></i>'
        : entry.img
          ? `<img src="${entry.img}" width="20" height="20" style="border-radius:2px;">`
          : '<i class="fas fa-box" style="color:#aaa;"></i>';
      return { ...entry, iconHtml };
    });

    // XP entries grouped by player
    const xpByPlayer = {};
    for (const entry of data.xp) {
      if (!xpByPlayer[entry.player]) xpByPlayer[entry.player] = { entries: [], total: 0 };
      xpByPlayer[entry.player].entries.push(entry);
      xpByPlayer[entry.player].total += entry.totalXp;
    }
    const xpPlayers = Object.entries(xpByPlayer).map(([player, { entries, total }]) => ({
      player,
      awards: entries,
      total,
    }));

    return {
      activeTab: this.activeTab,
      isGM: game.user.isGM,
      hasDamageLog,
      sessionDuration,
      // Overview
      totalCombats: data.combats.length,
      totalEnemiesDefeated: data.combats.reduce((sum, c) => sum + c.enemies.filter(e => e.defeated).length, 0),
      playerSummaries,
      hasPlayerSummaries: playerSummaries.length > 0,
      // Combat
      combats,
      hasCombats: combats.length > 0,
      playerStatsTable,
      hasPlayerStats: playerStatsTable.length > 0,
      // Loot
      lootEntries,
      hasLoot: lootEntries.length > 0,
      // XP
      xpPlayers,
      hasXp: xpPlayers.length > 0,
    };
  }

  _onRender(context, options) {
    super._onRender(context, options);
    const el = this.element;
    this._renderAbort?.abort();
    this._renderAbort = new AbortController();
    const signal = this._renderAbort.signal;

    // Copy for Discord
    el.querySelector(".sr-copy-btn")?.addEventListener("click", async () => {
      const text = SessionRecap.formatForDiscord();
      await navigator.clipboard.writeText(text);
      ui.notifications.info("Session recap copied to clipboard!");
    }, { signal });

    // Clear session (GM only)
    el.querySelector(".sr-clear-btn")?.addEventListener("click", async () => {
      const ok = await Dialog.confirm({
        title: "Clear Session",
        content: "Clear all session data? This cannot be undone.",
      });
      if (ok) await SessionRecap.clear();
    }, { signal });
  }

  static _onChangeTab(event, target) {
    const tab = target.dataset.tab;
    if (tab) {
      this.activeTab = tab;
      this.render();
    }
  }

  static _onToggleEncounter(event, target) {
    const idx = parseInt(target.dataset.index);
    if (isNaN(idx)) return;
    if (this._expandedCombats.has(idx)) {
      this._expandedCombats.delete(idx);
    } else {
      this._expandedCombats.add(idx);
    }
    this.render();
  }
}
```

- [ ] **Step 2: Create `templates/session-recap.hbs`**

```hbs
<div class="sr-wrapper">
  {{! Tab Bar }}
  <nav class="sr-tabs">
    <button class="sr-tab {{#if (eq activeTab 'overview')}}active{{/if}}" data-action="changeTab" data-tab="overview">
      <i class="fas fa-chart-pie"></i> Overview
    </button>
    <button class="sr-tab {{#if (eq activeTab 'combat')}}active{{/if}}" data-action="changeTab" data-tab="combat">
      <i class="fas fa-swords"></i> Combat
    </button>
    <button class="sr-tab {{#if (eq activeTab 'loot')}}active{{/if}}" data-action="changeTab" data-tab="loot">
      <i class="fas fa-treasure-chest"></i> Loot
    </button>
    <button class="sr-tab {{#if (eq activeTab 'xp')}}active{{/if}}" data-action="changeTab" data-tab="xp">
      <i class="fas fa-star"></i> XP
    </button>
  </nav>

  {{! Tab Content }}
  <div class="sr-tab-content">

    {{! ─── Overview ─── }}
    {{#if (eq activeTab 'overview')}}
      <section class="sr-section">
        <div class="sr-overview-header">
          <div class="sr-stat-card">
            <span class="sr-stat-label">Session Duration</span>
            <span class="sr-stat-value">{{sessionDuration}}</span>
          </div>
          <div class="sr-stat-card">
            <span class="sr-stat-label">Combats</span>
            <span class="sr-stat-value">{{totalCombats}}</span>
          </div>
          <div class="sr-stat-card">
            <span class="sr-stat-label">Enemies Defeated</span>
            <span class="sr-stat-value">{{totalEnemiesDefeated}}</span>
          </div>
        </div>

        {{#if hasPlayerSummaries}}
          <h4>Player Summary</h4>
          <div class="sr-player-summaries">
            {{#each playerSummaries}}
              <div class="sr-player-row">
                <span class="sr-player-name">{{name}}</span>
                <span class="sr-player-stat"><i class="fas fa-skull"></i> {{kills}} kills</span>
                <span class="sr-player-stat"><i class="fas fa-sword"></i> {{damageDealt}} dealt</span>
                <span class="sr-player-stat"><i class="fas fa-heart-crack"></i> {{damageTaken}} taken</span>
                <span class="sr-player-stat"><i class="fas fa-star"></i> {{totalXp}} XP</span>
              </div>
            {{/each}}
          </div>
        {{else}}
          <p class="sr-empty">No activity recorded yet.</p>
        {{/if}}
      </section>
    {{/if}}

    {{! ─── Combat ─── }}
    {{#if (eq activeTab 'combat')}}
      <section class="sr-section">
        {{#unless hasDamageLog}}
          <div class="sr-notice">
            <i class="fas fa-info-circle"></i>
            Install the <strong>Damage Log</strong> module for damage and kill tracking.
          </div>
        {{/unless}}

        {{#if hasCombats}}
          {{#each combats}}
            <div class="sr-encounter">
              <div class="sr-encounter-header" data-action="toggleEncounter" data-index="{{index}}">
                <i class="fas {{#if expanded}}fa-chevron-down{{else}}fa-chevron-right{{/if}}"></i>
                <strong>{{label}}</strong> — {{rounds}} rounds{{#if duration}} ({{duration}}){{/if}}
                <span class="sr-encounter-badge">{{totalDefeated}}/{{totalEnemies}} defeated</span>
              </div>
              {{#if expanded}}
                <div class="sr-encounter-body">
                  <div class="sr-enemy-list">
                    {{#each enemies}}
                      <span class="sr-enemy {{#if defeated}}defeated{{/if}}">
                        {{name}}
                        {{#if defeated}}
                          <i class="fas fa-skull"></i>
                          {{#if killedBy}}<em>({{killedBy}})</em>{{/if}}
                        {{/if}}
                      </span>
                    {{/each}}
                  </div>
                </div>
              {{/if}}
            </div>
          {{/each}}
        {{else}}
          <p class="sr-empty">No combats recorded.</p>
        {{/if}}

        {{#if hasPlayerStats}}
          <h4>Roll & Damage Stats</h4>
          <table class="sr-stats-table">
            <thead>
              <tr>
                <th>Player</th>
                <th>Hit Rate</th>
                <th>Nat 20</th>
                <th>Nat 1</th>
                <th>Avg d20</th>
                <th>Saves</th>
                <th>Dealt</th>
                <th>Taken</th>
                <th>Kills</th>
              </tr>
            </thead>
            <tbody>
              {{#each playerStatsTable}}
                <tr>
                  <td class="sr-cell-name">{{name}}</td>
                  <td>{{hitRate}}</td>
                  <td>{{nat20s}}</td>
                  <td>{{nat1s}}</td>
                  <td>{{avgD20}}</td>
                  <td>{{saveRate}}</td>
                  <td>{{damageDealt}}</td>
                  <td>{{damageTaken}}</td>
                  <td>{{kills}}</td>
                </tr>
              {{/each}}
            </tbody>
          </table>
        {{/if}}
      </section>
    {{/if}}

    {{! ─── Loot ─── }}
    {{#if (eq activeTab 'loot')}}
      <section class="sr-section">
        {{#if hasLoot}}
          <div class="sr-loot-list">
            {{#each lootEntries}}
              <div class="sr-loot-entry">
                <span class="sr-loot-time">{{time}}</span>
                <span class="sr-loot-icon">{{{iconHtml}}}</span>
                <span class="sr-loot-player">{{player}}</span>
                <span class="sr-loot-detail">{{detail}}</span>
                <span class="sr-loot-source">{{source}}</span>
              </div>
            {{/each}}
          </div>
        {{else}}
          <p class="sr-empty">No loot recorded.</p>
        {{/if}}
      </section>
    {{/if}}

    {{! ─── XP ─── }}
    {{#if (eq activeTab 'xp')}}
      <section class="sr-section">
        {{#if hasXp}}
          {{#each xpPlayers}}
            <div class="sr-xp-player">
              <h4>{{player}}</h4>
              {{#each awards}}
                <div class="sr-xp-award">
                  <span class="sr-xp-time">{{time}}</span>
                  <span class="sr-xp-total">+{{totalXp}} XP</span>
                  <div class="sr-xp-questions">
                    {{#each questions}}
                      <div class="sr-xp-question">
                        <span>{{label}}</span>
                        <span class="sr-xp-count">x{{count}} = {{xpEarned}} XP</span>
                      </div>
                    {{/each}}
                  </div>
                </div>
              {{/each}}
              <div class="sr-xp-player-total">Total: {{total}} XP</div>
            </div>
          {{/each}}
        {{else}}
          <p class="sr-empty">No XP awarded yet.</p>
        {{/if}}
      </section>
    {{/if}}

  </div>

  {{! Footer }}
  <footer class="sr-footer">
    <button type="button" class="sr-copy-btn">
      <i class="fab fa-discord"></i> Copy for Discord
    </button>
    {{#if isGM}}
      <button type="button" class="sr-clear-btn">
        <i class="fas fa-trash"></i> Clear Session
      </button>
    {{/if}}
  </footer>
</div>
```

Important: The template uses `{{xpEarned}}` which must be pre-computed. In `_prepareContext`, when building the `awards` entries, map each question to include `xpEarned: q.count * q.xp`. The `xpPlayers` building code should be:

```js
    const xpPlayers = Object.entries(xpByPlayer).map(([player, { entries, total }]) => ({
      player,
      awards: entries.map(e => ({
        ...e,
        questions: e.questions.map(q => ({ ...q, xpEarned: q.count * q.xp })),
      })),
      total,
    }));
```

- [ ] **Step 3: Fix the `open()` method in `session-recap.mjs`**

Replace the placeholder `open()` with:

```js
  async open() {
    if (!this._app) {
      const { SessionRecapApp } = await import("./session-recap-app.mjs");
      this._app = new SessionRecapApp();
    }
    this._app.render(true);
  },
```

- [ ] **Step 4: Commit**

```bash
git add scripts/session-recap-app.mjs templates/session-recap.hbs scripts/session-recap.mjs
git commit -m "feat(session-recap): add tabbed SessionRecapApp window"
```

---

### Task 8: CSS Styling

**Goal:** Add styles for the session recap window — tabs, tables, stat cards, loot entries, encounters.

**Files:**
- Modify: `styles/vagabond-crawler.css`

**Acceptance Criteria:**
- [ ] Tab bar matches existing module styling (dark theme, gold accent)
- [ ] Stats table is readable with alternating row colors
- [ ] Encounter headers are clickable and look collapsible
- [ ] Loot entries match the old loot tracker visual
- [ ] Footer buttons match existing Discord/clear button styling
- [ ] Light theme overrides via `body.theme-light` work

**Verify:** Open the session recap window. Visually confirm all tabs render cleanly in both dark and light themes. Compare loot tab to original loot tracker screenshots.

**Steps:**

- [ ] **Step 1: Append session recap styles to `vagabond-crawler.css`**

Add after the existing XP counter styles at the end of the file:

```css
/* ═══════════════════════════════════════════════════════════════════════════
   Session Recap — tabbed window styles
   ═══════════════════════════════════════════════════════════════════════════ */

.session-recap { color: var(--vcb-text, #e8eaed); }

/* ── Tabs ──────────────────────────────────────────────────────────────── */
.sr-tabs {
  display: flex;
  gap: 2px;
  padding: 6px 8px 0;
  border-bottom: 1px solid var(--vcb-border, #3a3d44);
}

.sr-tab {
  padding: 6px 14px;
  background: transparent;
  border: none;
  color: var(--vcb-text-dim, #9aa0a6);
  cursor: pointer;
  font-size: 0.85em;
  border-bottom: 2px solid transparent;
  transition: color 0.15s, border-color 0.15s;
}

.sr-tab:hover { color: var(--vcb-text, #e8eaed); }
.sr-tab.active {
  color: var(--vcb-accent, #c9a54a);
  border-bottom-color: var(--vcb-accent, #c9a54a);
}

/* ── Content ───────────────────────────────────────────────────────────── */
.sr-tab-content {
  flex: 1;
  overflow-y: auto;
  padding: 10px 12px;
}

.sr-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.sr-section h4 {
  margin: 12px 0 6px;
  color: var(--vcb-accent, #c9a54a);
  font-size: 0.9em;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.sr-empty {
  text-align: center;
  color: var(--vcb-text-dim, #9aa0a6);
  padding: 30px;
  font-style: italic;
}

.sr-notice {
  background: rgba(201, 165, 74, 0.1);
  border: 1px solid rgba(201, 165, 74, 0.3);
  border-radius: 4px;
  padding: 8px 12px;
  margin-bottom: 10px;
  font-size: 0.85em;
  color: var(--vcb-accent, #c9a54a);
}

/* ── Overview stat cards ───────────────────────────────────────────────── */
.sr-overview-header {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.sr-stat-card {
  flex: 1;
  background: var(--vcb-bg-alt, #1f2226);
  border: 1px solid var(--vcb-border, #3a3d44);
  border-radius: 6px;
  padding: 10px;
  text-align: center;
}

.sr-stat-label {
  display: block;
  font-size: 0.75em;
  color: var(--vcb-text-dim, #9aa0a6);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.sr-stat-value {
  display: block;
  font-size: 1.4em;
  font-weight: 700;
  color: var(--vcb-accent, #c9a54a);
  margin-top: 2px;
}

/* ── Player summary rows ───────────────────────────────────────────────── */
.sr-player-summaries { display: flex; flex-direction: column; gap: 4px; }

.sr-player-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 6px 10px;
  background: var(--vcb-bg-alt, #1f2226);
  border-radius: 4px;
  font-size: 0.85em;
}

.sr-player-name {
  font-weight: 700;
  color: var(--vcb-accent, #c9a54a);
  min-width: 100px;
}

.sr-player-stat { color: var(--vcb-text-dim, #9aa0a6); white-space: nowrap; }
.sr-player-stat i { margin-right: 3px; }

/* ── Combat encounters ─────────────────────────────────────────────────── */
.sr-encounter {
  border: 1px solid var(--vcb-border, #3a3d44);
  border-radius: 4px;
  margin-bottom: 6px;
  overflow: hidden;
}

.sr-encounter-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  background: var(--vcb-bg-alt, #1f2226);
  cursor: pointer;
  font-size: 0.9em;
}

.sr-encounter-header:hover { background: var(--vcb-bg-hover, #2a2d32); }

.sr-encounter-badge {
  margin-left: auto;
  font-size: 0.8em;
  color: var(--vcb-text-dim, #9aa0a6);
}

.sr-encounter-body { padding: 8px 10px; }

.sr-enemy-list { display: flex; flex-wrap: wrap; gap: 6px; }

.sr-enemy {
  padding: 3px 8px;
  background: rgba(255,255,255,0.05);
  border-radius: 3px;
  font-size: 0.85em;
}

.sr-enemy.defeated { color: #e74c3c; }
.sr-enemy em { font-size: 0.85em; color: var(--vcb-text-dim, #9aa0a6); }

/* ── Stats table ───────────────────────────────────────────────────────── */
.sr-stats-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.8em;
  margin-top: 6px;
}

.sr-stats-table th {
  text-align: left;
  padding: 5px 8px;
  border-bottom: 1px solid var(--vcb-border, #3a3d44);
  color: var(--vcb-text-dim, #9aa0a6);
  font-size: 0.85em;
  text-transform: uppercase;
}

.sr-stats-table td {
  padding: 5px 8px;
  border-bottom: 1px solid rgba(255,255,255,0.05);
}

.sr-stats-table tbody tr:nth-child(even) { background: rgba(255,255,255,0.02); }
.sr-stats-table .sr-cell-name { font-weight: 700; color: var(--vcb-accent, #c9a54a); }

/* ── Loot entries ──────────────────────────────────────────────────────── */
.sr-loot-list { display: flex; flex-direction: column; gap: 3px; }

.sr-loot-entry {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  background: rgba(0,0,0,0.15);
  border-radius: 4px;
  font-size: 0.9em;
}

.sr-loot-time { color: #888; font-size: 0.8em; width: 45px; flex-shrink: 0; }
.sr-loot-icon { width: 20px; text-align: center; flex-shrink: 0; }
.sr-loot-player { color: var(--vcb-accent, #c9a54a); font-weight: bold; min-width: 80px; }
.sr-loot-detail { flex: 1; }
.sr-loot-source { color: #888; font-size: 0.8em; }

/* ── XP tab ────────────────────────────────────────────────────────────── */
.sr-xp-player { margin-bottom: 12px; }
.sr-xp-player h4 { margin: 0 0 6px; }

.sr-xp-award {
  padding: 6px 8px;
  background: var(--vcb-bg-alt, #1f2226);
  border-radius: 4px;
  margin-bottom: 4px;
}

.sr-xp-time { font-size: 0.8em; color: var(--vcb-text-dim, #9aa0a6); }
.sr-xp-total { float: right; font-weight: 700; color: var(--vcb-accent, #c9a54a); }

.sr-xp-questions { margin-top: 4px; }

.sr-xp-question {
  display: flex;
  justify-content: space-between;
  padding: 2px 0;
  font-size: 0.85em;
}

.sr-xp-count { color: var(--vcb-text-dim, #9aa0a6); }

.sr-xp-player-total {
  text-align: right;
  font-weight: 700;
  color: var(--vcb-accent, #c9a54a);
  margin-top: 4px;
  padding-top: 4px;
  border-top: 1px solid var(--vcb-border, #3a3d44);
}

/* ── Footer ────────────────────────────────────────────────────────────── */
.sr-footer {
  display: flex;
  gap: 6px;
  justify-content: flex-end;
  padding: 8px 12px;
  border-top: 1px solid var(--vcb-border, #3a3d44);
}

.sr-copy-btn {
  padding: 5px 12px;
  cursor: pointer;
  background: rgba(88,101,242,0.3);
  border: 1px solid rgba(88,101,242,0.6);
  color: #7289da;
  border-radius: 4px;
  font-size: 0.85em;
}

.sr-copy-btn:hover { background: rgba(88,101,242,0.5); }

.sr-clear-btn {
  padding: 5px 12px;
  cursor: pointer;
  background: rgba(192,57,43,0.2);
  border: 1px solid rgba(192,57,43,0.4);
  color: #e74c3c;
  border-radius: 4px;
  font-size: 0.85em;
}

.sr-clear-btn:hover { background: rgba(192,57,43,0.4); }
```

- [ ] **Step 2: Commit**

```bash
git add styles/vagabond-crawler.css
git commit -m "feat(session-recap): add CSS styles for recap window"
```

---

### Task 9: CrawlBar Integration, Chat Command & module.json

**Goal:** Replace the loot tracker button in CrawlBar with Session Recap, add the `!recap` chat command, and add `damage-log` to module.json recommends.

**Files:**
- Modify: `scripts/crawl-bar.mjs` (change button label/icon and handler)
- Modify: `scripts/vagabond-crawler.mjs` (add `chatMessage` hook for `!recap`)
- Modify: `module.json` (add `relationships.recommends`)

**Acceptance Criteria:**
- [ ] CrawlBar Forge & Loot panel shows "Session Recap" instead of "Loot Log"
- [ ] Clicking it opens `SessionRecap.open()`
- [ ] Typing `!recap` in chat opens the recap window for any user
- [ ] `module.json` recommends `damage-log`

**Verify:** Open the CrawlBar tool picker and confirm "Session Recap" appears. Click it and confirm the window opens. Type `!recap` in chat and confirm the window opens. Check `module.json` is valid JSON with the recommends entry.

**Steps:**

- [ ] **Step 1: Update CrawlBar Forge & Loot panel in `scripts/crawl-bar.mjs`**

In `_showForgeToolbar()` (around line 405-407), change:

```js
        <button class="vcb-forge-tab" data-tool="lootLog">
          <i class="fas fa-clipboard-list"></i> Loot Log
        </button>
```

to:

```js
        <button class="vcb-forge-tab" data-tool="sessionRecap">
          <i class="fas fa-clipboard-list"></i> Session Recap
        </button>
```

In the click handler section (around line 432), change:

```js
    open("lootLog",       () => LootTracker.open());
```

to:

```js
    open("sessionRecap",  () => SessionRecap.open());
```

Update the import at the top of `crawl-bar.mjs` — add `SessionRecap` and ensure it's imported. Check if `LootTracker` is still imported for other uses (grep the file); if only used for `open()`, replace the import. If used elsewhere, keep both.

Note: `LootTracker.open()` already delegates to `SessionRecap.open()` after Task 2, so technically either import works. But for clarity, import `SessionRecap` directly.

- [ ] **Step 2: Add `!recap` chat command in `scripts/vagabond-crawler.mjs`**

In the `Hooks.once("ready")` block, after the existing init calls, add:

```js
  // !recap chat command — opens session recap for any user
  Hooks.on("chatMessage", (chatLog, message) => {
    if (message.trim().toLowerCase() === "!recap") {
      SessionRecap.open();
      return false; // prevent the message from being posted to chat
    }
  });
```

- [ ] **Step 3: Update `module.json` relationships**

Add the `recommends` array to the existing `relationships` object, after the `optional` array:

```json
    "recommends": [
      {
        "id": "damage-log",
        "type": "module"
      }
    ]
```

- [ ] **Step 4: Commit**

```bash
git add scripts/crawl-bar.mjs scripts/vagabond-crawler.mjs module.json
git commit -m "feat(session-recap): CrawlBar button, !recap command, damage-log recommends"
```

---

### Task 10: End-to-End Verification

**Goal:** Verify the complete session recap flow works end-to-end in a live Foundry world.

**Files:** None (testing only)

**Acceptance Criteria:**
- [ ] Loot tracker callers (loot drops, loot generator, item drops) still log correctly
- [ ] XP counter patch works: increment, decrement, award, and logs to recap
- [ ] Starting and ending a combat creates an encounter entry with correct data
- [ ] With damage-log active: damage dealt/taken and kills are attributed correctly
- [ ] Without damage-log: combat tab shows encounters and rolls only, with notice
- [ ] Roll stats (attacks, saves, nat 20s, nat 1s, average) accumulate correctly
- [ ] Copy for Discord produces clean markdown matching the spec format
- [ ] Clear Session wipes all data and resets sessionStart
- [ ] `!recap` chat command opens the window for a player user
- [ ] CrawlBar "Session Recap" button opens the window
- [ ] No console errors during normal use

**Verify:** Reload Foundry. Run through a full simulated session: open recap, clear it, trigger loot drops, award XP, run a quick combat, make attack/save rolls, end combat. Open recap → check all 4 tabs → copy for Discord → paste and verify.

**Steps:**

- [ ] **Step 1: Reload Foundry and verify no console errors on startup**

Via MCP evaluate: `window.location.reload()`. Wait, then check for errors.

- [ ] **Step 2: Test loot integration**

Drop an item on canvas, pick it up. Check loot tab in recap window.

- [ ] **Step 3: Test XP counter patch and logging**

Open a character's Level Up dialog, click questions multiple times, award XP. Check XP tab in recap window.

- [ ] **Step 4: Test combat flow**

Start a combat with PCs and NPCs. Make attacks and saves. Defeat an NPC. End combat. Check Combat tab and Overview tab.

- [ ] **Step 5: Test Discord export**

Click "Copy for Discord" button. Paste into a text editor. Confirm all sections present and formatted per spec.

- [ ] **Step 6: Test clear**

Click "Clear Session". Confirm all tabs show empty state. Confirm `sessionStart` is reset.

- [ ] **Step 7: Test `!recap` command**

Type `!recap` in chat. Confirm window opens. Confirm message is not posted to chat.

- [ ] **Step 8: Final commit if any fixes needed**

```bash
git add -A
git commit -m "fix(session-recap): end-to-end test fixes"
```
