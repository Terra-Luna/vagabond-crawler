# Session Lifecycle & History Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers-extended-cc:subagent-driven-development (recommended) or superpowers-extended-cc:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add managed session lifecycle (start/pause/end/save) tied to crawl start/stop, with persistent session history that can be reviewed, exported, and deleted.

**Architecture:** Extend the existing `SessionRecap` singleton with session state management, lifecycle popups (via `waitDialog`), and a `sessionHistory` world setting. Extend `SessionRecapApp` with a History tab and read-only viewing mode. Hook into `CrawlState.start()` and `CrawlState.end()` for lifecycle popups.

**Tech Stack:** Foundry VTT v13 ApplicationV2, DialogV2 (via `waitDialog`), ES modules, Handlebars.

**Spec:** `docs/superpowers/specs/2026-04-16-session-lifecycle-design.md`

---

### Task 1: Add sessionState to Data Model & History Setting

**Goal:** Add `sessionState` field to the `sessionRecap` default data and register the `sessionHistory` world setting.

**Files:**
- Modify: `scripts/session-recap.mjs` (DEFAULT_DATA, registerSettings)

**Acceptance Criteria:**
- [ ] `DEFAULT_DATA` includes `sessionState: "inactive"`
- [ ] `sessionHistory` world setting registered with default `[]`
- [ ] `getData()` returns data with `sessionState` field
- [ ] `getHistory()` returns the history array
- [ ] `clear()` preserves `sessionState` field (resets to `"inactive"`)

**Verify:** `game.vagabondCrawler.recap.getData().sessionState` returns `"inactive"`. `game.vagabondCrawler.recap.getHistory()` returns `[]`.

**Steps:**

- [ ] **Step 1: Update DEFAULT_DATA in `session-recap.mjs`**

Change the `DEFAULT_DATA` constant (line 13-19) to include `sessionState`:

```js
const DEFAULT_DATA = {
  sessionState: "inactive",
  sessionStart: null,
  loot: [],
  xp: [],
  combats: [],
  playerStats: {},
};
```

- [ ] **Step 2: Register sessionHistory setting in `registerSettings()`**

After the existing `game.settings.register` call (line 32-37), add:

```js
    game.settings.register(MODULE_ID, "sessionHistory", {
      scope: "world",
      config: false,
      type: Array,
      default: [],
    });
```

- [ ] **Step 3: Add `getHistory()` method**

After the `getData()` method (line 42-44), add:

```js
  getHistory() {
    return game.settings.get(MODULE_ID, "sessionHistory") ?? [];
  },

  async _saveHistory(history) {
    await game.settings.set(MODULE_ID, "sessionHistory", history);
    if (this._app?.rendered) this._app.render();
  },
```

- [ ] **Step 4: Update `clear()` to reset sessionState**

Replace the existing `clear()` method (line 119-123) with:

```js
  async clear() {
    const fresh = foundry.utils.deepClone(DEFAULT_DATA);
    fresh.sessionState = "inactive";
    fresh.sessionStart = null;
    await this._save(fresh);
  },
```

- [ ] **Step 5: Commit**

```bash
git add scripts/session-recap.mjs
git commit -m "feat(session-lifecycle): add sessionState and sessionHistory setting"
```

---

### Task 2: Session Lifecycle Methods

**Goal:** Add methods to start, pause, end & save, and discard sessions, plus auto-naming logic.

**Files:**
- Modify: `scripts/session-recap.mjs` (add lifecycle methods and `_generateSessionName`)

**Acceptance Criteria:**
- [ ] `startSession()` clears data, sets state to `"active"`, sets `sessionStart`
- [ ] `continueSession()` sets state to `"active"` without clearing
- [ ] `pauseSession()` sets state to `"paused"`
- [ ] `endAndSave()` snapshots data to history, clears active, state to `"inactive"`
- [ ] `discardSession()` clears without saving, state to `"inactive"`
- [ ] `_generateSessionName()` returns `"YYYY.MM.DD Session"` with dedup suffix
- [ ] `deleteFromHistory(id)` removes a session by ID

**Verify:** Run `game.vagabondCrawler.recap.startSession()` then check state is `"active"`. Run `game.vagabondCrawler.recap.endAndSave()` then check `getHistory()` has one entry.

**Steps:**

- [ ] **Step 1: Add `_generateSessionName()` method**

Add before the `init()` method:

```js
  // ── Session Lifecycle ──────────────────────────────────────

  _generateSessionName(timestamp) {
    const d = new Date(timestamp);
    const base = `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")} Session`;
    const history = this.getHistory();
    const existing = history.filter(s => s.name.startsWith(base));
    if (existing.length === 0) return base;
    return `${base} ${existing.length + 1}`;
  },

  async startSession() {
    const fresh = foundry.utils.deepClone(DEFAULT_DATA);
    fresh.sessionState = "active";
    fresh.sessionStart = Date.now();
    await this._save(fresh);
  },

  async continueSession() {
    const data = this.getData();
    data.sessionState = "active";
    await this._save(data);
  },

  async pauseSession() {
    const data = this.getData();
    data.sessionState = "paused";
    await this._save(data);
  },

  async endAndSave() {
    const data = this.getData();
    const now = Date.now();
    const history = this.getHistory();

    const snapshot = {
      id: `session-${now}`,
      name: this._generateSessionName(data.sessionStart ?? now),
      startTime: data.sessionStart ?? now,
      endTime: now,
      data: {
        loot: data.loot,
        xp: data.xp,
        combats: data.combats,
        playerStats: data.playerStats,
      },
    };

    history.unshift(snapshot);
    await this._saveHistory(history);
    await this.clear();
    ui.notifications.info(`Session saved: ${snapshot.name}`);
  },

  async discardSession() {
    await this.clear();
    ui.notifications.info("Session discarded.");
  },

  async deleteFromHistory(id) {
    const history = this.getHistory().filter(s => s.id !== id);
    await this._saveHistory(history);
  },
```

- [ ] **Step 2: Commit**

```bash
git add scripts/session-recap.mjs
git commit -m "feat(session-lifecycle): add lifecycle methods and history CRUD"
```

---

### Task 3: Crawl Start/End Popups

**Goal:** Show lifecycle popups when CrawlState starts and ends, using `waitDialog`.

**Files:**
- Modify: `scripts/session-recap.mjs` (add `_initLifecycleHooks()`, update `init()`)

**Acceptance Criteria:**
- [ ] Crawl start shows popup with "Start New Session" / "Continue Session" (if paused) / "No Tracking"
- [ ] Crawl end shows popup with "End & Save" / "Pause Session" / "Discard" (only if state is active/paused)
- [ ] Popup dismiss (X button) defaults to safe option (No Tracking / Pause)
- [ ] Only GM sees the popups
- [ ] Auto-capture hooks (combat, damage, rolls) are gated on `sessionState === "active"`

**Verify:** Start a crawl → popup appears with session options. Pick "Start New Session" → check state is `"active"`. End crawl → popup appears. Pick "End & Save" → check history has entry.

**Steps:**

- [ ] **Step 1: Add `_initLifecycleHooks()` method**

Add after the lifecycle methods from Task 2, before `init()`:

```js
  _initLifecycleHooks() {
    if (!game.user.isGM) return;

    // Import waitDialog at the top of session-recap.mjs:
    // import { waitDialog } from "./dialog-helpers.mjs";

    // ── Crawl Start popup ──────────────────────────────────
    Hooks.on("vagabondCrawler.crawlStart", async () => {
      const data = this.getData();
      const isPaused = data.sessionState === "paused";

      const buttons = [
        { label: "Start New Session", icon: "fas fa-play", value: "start" },
      ];
      if (isPaused) {
        buttons.push({ label: "Continue Session", icon: "fas fa-forward", value: "continue" });
      }
      buttons.push({ label: "No Tracking", icon: "fas fa-ban", value: "skip" });

      const choice = await waitDialog({
        title: "Session Tracking",
        content: isPaused
          ? "<p>A paused session exists. What would you like to do?</p>"
          : "<p>Start tracking a new session?</p>",
        buttons,
        defaultButton: isPaused ? "continue" : "start",
      });

      if (choice === "start") {
        await this.startSession();
      } else if (choice === "continue") {
        await this.continueSession();
      }
      // "skip" or null (dismissed) — do nothing, state stays as-is
    });

    // ── Crawl End popup ────────────────────────────────────
    Hooks.on("vagabondCrawler.crawlEnd", async () => {
      const data = this.getData();
      if (data.sessionState !== "active" && data.sessionState !== "paused") return;

      const hasData = data.loot.length > 0 || data.xp.length > 0
        || data.combats.length > 0 || Object.keys(data.playerStats).length > 0;

      const buttons = [
        { label: "End & Save", icon: "fas fa-save", value: "save" },
        { label: "Pause Session", icon: "fas fa-pause", value: "pause" },
      ];
      if (hasData) {
        buttons.push({ label: "Discard", icon: "fas fa-trash", value: "discard" });
      }

      const choice = await waitDialog({
        title: "Session Tracking",
        content: "<p>The crawl is ending. What would you like to do with this session?</p>",
        buttons,
        defaultButton: "save",
      });

      if (choice === "save") {
        await this.endAndSave();
      } else if (choice === "pause") {
        await this.pauseSession();
      } else if (choice === "discard") {
        await this.discardSession();
      }
      // null (dismissed) — default to pause
      if (choice === null) {
        await this.pauseSession();
      }
    });
  },
```

- [ ] **Step 2: Add the `waitDialog` import**

At the top of `session-recap.mjs`, after the existing import, add:

```js
import { waitDialog } from "./dialog-helpers.mjs";
```

- [ ] **Step 3: Fire custom hooks from CrawlState**

In `scripts/crawl-state.mjs`, add a `Hooks.callAll` at the end of `start()` (after `ui.notifications.info` on line 109):

```js
    Hooks.callAll("vagabondCrawler.crawlStart");
```

And at the end of `end()` (after `ui.notifications.info` on line 118):

```js
    Hooks.callAll("vagabondCrawler.crawlEnd");
```

- [ ] **Step 4: Gate auto-capture hooks on active state**

In `_initCombatHooks()`, add a guard at the top of each hook callback. In the `combatStart` hook (line 148), add as the first line inside the callback:

```js
      if (this.getData().sessionState !== "active") return;
```

In the `deleteCombat` hook (line 164), add the same guard:

```js
      if (this.getData().sessionState !== "active") return;
```

In the damage-log `createChatMessage` hook (line 199), add:

```js
        if (this.getData().sessionState !== "active") return;
```

In `_initRollHooks()`, in the `createChatMessage` hook (line 246), add:

```js
      if (this.getData().sessionState !== "active") return;
```

- [ ] **Step 5: Update `init()` to call lifecycle hooks**

Add `this._initLifecycleHooks();` to `init()`:

```js
  init() {
    this.migrateFromLootLog();
    this._initCombatHooks();
    this._initRollHooks();
    this._initLifecycleHooks();
    console.log(`${MODULE_ID} | Session Recap initialized.`);
  },
```

- [ ] **Step 6: Commit**

```bash
git add scripts/session-recap.mjs scripts/crawl-state.mjs
git commit -m "feat(session-lifecycle): crawl start/end popups with session state gating"
```

---

### Task 4: History Tab in SessionRecapApp

**Goal:** Add a History tab to the recap window showing saved sessions with view and delete actions.

**Files:**
- Modify: `scripts/session-recap-app.mjs` (add history context, viewing mode, new actions)
- Modify: `templates/session-recap.hbs` (add History tab, viewing banner)

**Acceptance Criteria:**
- [ ] 5th "History" tab appears in the tab bar
- [ ] History tab lists saved sessions with name, duration, stats
- [ ] Clicking a session switches to read-only viewing mode (Overview/Combat/Loot/XP show saved data)
- [ ] Banner shows "Viewing: [session name]" with "Back to Current" button
- [ ] "Copy for Discord" exports the viewed saved session's data
- [ ] Delete button (GM only) removes a session with confirm dialog
- [ ] "Clear Session" button hidden while viewing history
- [ ] "Back to Current" returns to active session data

**Verify:** Save a session via lifecycle popup. Open recap → History tab → click session → verify read-only view shows saved data. Click "Copy for Discord" → verify it exports the saved session. Click "Back to Current" → verify active data shown.

**Steps:**

- [ ] **Step 1: Add viewing state and history actions to `session-recap-app.mjs`**

In the constructor, add:

```js
    this._viewingHistoryId = null; // null = viewing current session
```

Add new actions to `DEFAULT_OPTIONS.actions`:

```js
      viewSession: SessionRecapApp._onViewSession,
      backToCurrent: SessionRecapApp._onBackToCurrent,
      deleteSession: SessionRecapApp._onDeleteSession,
```

- [ ] **Step 2: Update `_prepareContext()` for viewing mode**

At the top of `_prepareContext()`, determine which data to use:

```js
    let data;
    let viewingSession = null;
    if (this._viewingHistoryId) {
      const history = SessionRecap.getHistory();
      viewingSession = history.find(s => s.id === this._viewingHistoryId);
      if (viewingSession) {
        data = { ...viewingSession.data, sessionStart: viewingSession.startTime };
      } else {
        this._viewingHistoryId = null;
        data = SessionRecap.getData();
      }
    } else {
      data = SessionRecap.getData();
    }
```

Replace `const data = SessionRecap.getData();` (line 38) with the above block.

For the session duration calculation, when viewing history use the saved end time:

```js
    const sessionDuration = viewingSession
      ? SessionRecap._formatDuration(viewingSession.endTime - viewingSession.startTime)
      : data.sessionStart
        ? SessionRecap._formatDuration(Date.now() - data.sessionStart)
        : "No events yet";
```

Add history entries to the returned context:

```js
      // History
      viewingSession: viewingSession ? { id: viewingSession.id, name: viewingSession.name } : null,
      isViewingHistory: !!this._viewingHistoryId,
      historyEntries: SessionRecap.getHistory().map(s => ({
        id: s.id,
        name: s.name,
        duration: SessionRecap._formatDuration(s.endTime - s.startTime),
        combatCount: s.data.combats.length,
        enemiesDefeated: s.data.combats.reduce((sum, c) => sum + c.enemies.filter(e => e.defeated).length, 0),
        playerCount: Object.keys(s.data.playerStats).length,
        lootCount: s.data.loot.length,
      })),
      hasHistory: SessionRecap.getHistory().length > 0,
      sessionState: SessionRecap.getData().sessionState,
```

- [ ] **Step 3: Update `_onRender` for history-aware Discord copy**

Change the copy button handler to use the correct data:

```js
    el.querySelector(".sr-copy-btn")?.addEventListener("click", async () => {
      let text;
      if (this._viewingHistoryId) {
        const session = SessionRecap.getHistory().find(s => s.id === this._viewingHistoryId);
        if (session) {
          text = SessionRecap.formatForDiscordFromData(session.data, session.startTime, session.endTime);
        }
      }
      if (!text) text = SessionRecap.formatForDiscord();
      await navigator.clipboard.writeText(text);
      ui.notifications.info("Session recap copied to clipboard!");
    }, { signal });
```

This requires a new method `formatForDiscordFromData(data, startTime, endTime)` on `SessionRecap` — add it in `session-recap.mjs` as a refactor of `formatForDiscord()`:

```js
  formatForDiscordFromData(data, startTime, endTime) {
    const lines = [];
    const duration = startTime
      ? this._formatDuration((endTime ?? Date.now()) - startTime)
      : "N/A";
    lines.push("# Session Recap");
    lines.push(`**Duration:** ${duration}`);
    lines.push("");
    // ... (same body as formatForDiscord, using `data` parameter instead of `this.getData()`)
  },

  formatForDiscord() {
    const data = this.getData();
    return this.formatForDiscordFromData(data, data.sessionStart, Date.now());
  },
```

Refactor `formatForDiscord()` to delegate to `formatForDiscordFromData()` — extract the body into the parameterized version and have `formatForDiscord()` call it.

- [ ] **Step 4: Add action handlers**

```js
  static _onViewSession(event, target) {
    const id = target.dataset.sessionId;
    if (!id) return;
    this._viewingHistoryId = id;
    this.activeTab = "overview";
    this.render();
  }

  static _onBackToCurrent(event, target) {
    this._viewingHistoryId = null;
    this.activeTab = "overview";
    this.render();
  }

  static async _onDeleteSession(event, target) {
    const id = target.dataset.sessionId;
    if (!id) return;
    const ok = await Dialog.confirm({
      title: "Delete Session",
      content: "Delete this saved session? This cannot be undone.",
    });
    if (ok) {
      await SessionRecap.deleteFromHistory(id);
      if (this._viewingHistoryId === id) {
        this._viewingHistoryId = null;
        this.activeTab = "history";
      }
      this.render();
    }
  }
```

- [ ] **Step 5: Update `templates/session-recap.hbs`**

Add the History tab button to the nav bar (after the XP tab button):

```hbs
    <button class="sr-tab {{#if (eq activeTab 'history')}}active{{/if}}" data-action="changeTab" data-tab="history">
      <i class="fas fa-book"></i> History
    </button>
```

Add a viewing banner right after the opening `<div class="sr-tab-content">`:

```hbs
    {{#if isViewingHistory}}
      <div class="sr-viewing-banner">
        <i class="fas fa-eye"></i> Viewing: <strong>{{viewingSession.name}}</strong>
        <button type="button" class="sr-back-btn" data-action="backToCurrent">
          <i class="fas fa-arrow-left"></i> Back to Current
        </button>
      </div>
    {{/if}}
```

Add the History tab content (before the closing `</div>` of `sr-tab-content`):

```hbs
    {{! ─── History ─── }}
    {{#if (eq activeTab 'history')}}
      <section class="sr-section">
        {{#if hasHistory}}
          <div class="sr-history-list">
            {{#each historyEntries}}
              <div class="sr-history-entry">
                <div class="sr-history-info" data-action="viewSession" data-session-id="{{id}}">
                  <span class="sr-history-name">{{name}}</span>
                  <span class="sr-history-meta">
                    {{duration}} — {{combatCount}} combats, {{enemiesDefeated}} defeated, {{lootCount}} loot
                  </span>
                </div>
                {{#if ../isGM}}
                  <button type="button" class="sr-history-delete" data-action="deleteSession" data-session-id="{{id}}">
                    <i class="fas fa-trash"></i>
                  </button>
                {{/if}}
              </div>
            {{/each}}
          </div>
        {{else}}
          <p class="sr-empty">No saved sessions yet.</p>
        {{/if}}
      </section>
    {{/if}}
```

Update the footer to hide Clear Session when viewing history:

```hbs
    {{#if isGM}}
      {{#unless isViewingHistory}}
        <button type="button" class="sr-clear-btn">
          <i class="fas fa-trash"></i> Clear Session
        </button>
      {{/unless}}
    {{/if}}
```

- [ ] **Step 6: Commit**

```bash
git add scripts/session-recap-app.mjs scripts/session-recap.mjs templates/session-recap.hbs
git commit -m "feat(session-lifecycle): add History tab with view, export, and delete"
```

---

### Task 5: CSS for History Tab & Viewing Banner

**Goal:** Add styles for the history list entries, viewing banner, and back button.

**Files:**
- Modify: `styles/vagabond-crawler.css`

**Acceptance Criteria:**
- [ ] History entries are clickable rows with name and meta info
- [ ] Delete button is a small red icon on the right
- [ ] Viewing banner is a distinct colored bar with the session name and back button
- [ ] Styles use existing `--vcb-*` variables

**Verify:** Open recap → History tab — entries styled correctly. Click one → banner appears.

**Steps:**

- [ ] **Step 1: Append history styles to `vagabond-crawler.css`**

Add after the existing session recap CSS:

```css
/* ── History tab ───────────────────────────────────────────────────────── */
.sr-history-list { display: flex; flex-direction: column; gap: 4px; }

.sr-history-entry {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  background: var(--vcb-bg-alt, #1f2226);
  border: 1px solid var(--vcb-border, #3a3d44);
  border-radius: 4px;
}

.sr-history-info {
  flex: 1;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.sr-history-info:hover .sr-history-name { color: var(--vcb-accent, #c9a54a); }

.sr-history-name {
  font-weight: 700;
  font-size: 0.95em;
  transition: color 0.15s;
}

.sr-history-meta {
  font-size: 0.8em;
  color: var(--vcb-text-dim, #9aa0a6);
}

.sr-history-delete {
  background: none;
  border: none;
  color: #888;
  cursor: pointer;
  padding: 4px 6px;
  border-radius: 3px;
  font-size: 0.85em;
}

.sr-history-delete:hover {
  color: #e74c3c;
  background: rgba(192,57,43,0.15);
}

/* ── Viewing banner ────────────────────────────────────────────────────── */
.sr-viewing-banner {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  margin-bottom: 8px;
  background: rgba(201, 165, 74, 0.15);
  border: 1px solid rgba(201, 165, 74, 0.3);
  border-radius: 4px;
  font-size: 0.85em;
  color: var(--vcb-accent, #c9a54a);
}

.sr-back-btn {
  margin-left: auto;
  padding: 3px 10px;
  background: rgba(201, 165, 74, 0.2);
  border: 1px solid rgba(201, 165, 74, 0.4);
  color: var(--vcb-accent, #c9a54a);
  border-radius: 3px;
  cursor: pointer;
  font-size: 0.85em;
}

.sr-back-btn:hover { background: rgba(201, 165, 74, 0.35); }
```

- [ ] **Step 2: Commit**

```bash
git add styles/vagabond-crawler.css
git commit -m "feat(session-lifecycle): add CSS for history tab and viewing banner"
```

---

### Task 6: End-to-End Verification

**Goal:** Full E2E test of session lifecycle in live Foundry world.

**Files:** None (testing only)

**Acceptance Criteria:**
- [ ] Start crawl → session popup appears with correct options
- [ ] "Start New Session" → state is active, data captures work
- [ ] End crawl → session popup appears
- [ ] "End & Save" → session appears in History tab
- [ ] View saved session → read-only mode with banner, all tabs show saved data
- [ ] "Copy for Discord" exports the viewed session correctly
- [ ] Delete a session → removed from history
- [ ] "Pause Session" → data preserved, next crawl start offers "Continue"
- [ ] "No Tracking" → no data captured during crawl
- [ ] No console errors

**Verify:** Full simulated lifecycle: start crawl → start session → fight → end crawl → save → view history → delete → start new crawl → continue paused → end → save again.

**Steps:**

- [ ] **Step 1: Reload Foundry**

Via MCP: `window.location.reload()`

- [ ] **Step 2: Test start crawl → Start New Session**

Start a crawl. Confirm popup. Pick "Start New Session". Check `game.vagabondCrawler.recap.getData().sessionState === "active"`.

- [ ] **Step 3: Test data capture while active**

Make an attack, trigger loot. Verify data appears in recap.

- [ ] **Step 4: Test end crawl → End & Save**

End the crawl. Pick "End & Save". Check `game.vagabondCrawler.recap.getHistory().length === 1`.

- [ ] **Step 5: Test history viewing**

Open recap → History tab → click the saved session → verify Overview/Combat/Loot/XP show the saved data. Click "Copy for Discord" and verify.

- [ ] **Step 6: Test delete**

In History tab, click delete on the saved session. Confirm. Verify it's gone.

- [ ] **Step 7: Test pause and continue flow**

Start crawl → Start New Session → do stuff → End Crawl → Pause Session. Start new crawl → verify "Continue Session" option appears → pick it → verify data is preserved.

- [ ] **Step 8: Commit any fixes**

```bash
git add -A && git commit -m "fix(session-lifecycle): E2E test fixes"
```
