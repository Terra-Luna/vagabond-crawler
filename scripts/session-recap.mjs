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

  // Transient combat state (not persisted — lives only during active combats)
  _activeCombats: new Map(),
  _killMap: new Map(),
  _hasDamageLog: false,

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

  // ── Combat & Damage Hooks ─────────────────────────────────

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

      this._activeCombats.delete(combat.id);
      this._killMap.clear();
    });

    // ── Damage-log chat messages ───────────────────────────
    if (this._hasDamageLog) {
      Hooks.on("createChatMessage", (message) => {
        const flags = message.flags?.["damage-log"];
        if (!flags?.changes?.length) return;
        if (!game.combat) return;

        const targetActorId = message.speaker?.actor;
        if (!targetActorId) return;
        const targetActor = game.actors.get(targetActorId);
        if (!targetActor) return;

        const currentCombatant = game.combat.combatant;
        const attackerActor = currentCombatant?.actor;
        const attackerIsPC = attackerActor?.hasPlayerOwner
          && (currentCombatant.token?.disposition ?? currentCombatant.token?.document?.disposition) === CONST.TOKEN_DISPOSITIONS.FRIENDLY;

        for (const change of flags.changes) {
          if (change.id !== "hp") continue;
          const diff = (change.new ?? 0) - (change.old ?? 0);
          if (diff >= 0) continue;
          const absDiff = Math.abs(diff);

          const targetIsPC = targetActor.hasPlayerOwner;

          if (targetIsPC) {
            this.updatePlayerStat(targetActorId, targetActor.name, "damageTaken", absDiff);
          } else if (attackerIsPC && attackerActor) {
            this.updatePlayerStat(attackerActor.id, attackerActor.name, "damageDealt", absDiff);

            const tokenId = message.speaker?.token;
            if (tokenId) {
              this._killMap.set(tokenId, attackerActor.name);
            }

            if ((change.new ?? 0) <= 0) {
              this.updatePlayerStat(attackerActor.id, attackerActor.name, "kills", 1);
            }
          }
        }
      });
    }
  },

  // ── Init ───────────────────────────────────────────────────

  init() {
    this.migrateFromLootLog();
    this._initCombatHooks();
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
