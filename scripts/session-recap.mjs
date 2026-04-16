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

  async open() {
    if (!this._app) {
      const { SessionRecapApp } = await import("./session-recap-app.mjs");
      this._app = new SessionRecapApp();
    }
    this._app.render(true);
  },
};
