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

    // Combat encounters
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

    // Player stats table
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

    // XP grouped by player — pre-compute xpEarned on each question
    const xpByPlayer = {};
    for (const entry of data.xp) {
      if (!xpByPlayer[entry.player]) xpByPlayer[entry.player] = { entries: [], total: 0 };
      xpByPlayer[entry.player].entries.push(entry);
      xpByPlayer[entry.player].total += entry.totalXp;
    }
    const xpPlayers = Object.entries(xpByPlayer).map(([player, { entries, total }]) => ({
      player,
      awards: entries.map(e => ({
        ...e,
        questions: e.questions.map(q => ({ ...q, xpEarned: q.count * q.xp })),
      })),
      total,
    }));

    return {
      activeTab: this.activeTab,
      isGM: game.user.isGM,
      hasDamageLog,
      sessionDuration,
      totalCombats: data.combats.length,
      totalEnemiesDefeated: data.combats.reduce((sum, c) => sum + c.enemies.filter(e => e.defeated).length, 0),
      playerSummaries,
      hasPlayerSummaries: playerSummaries.length > 0,
      combats,
      hasCombats: combats.length > 0,
      playerStatsTable,
      hasPlayerStats: playerStatsTable.length > 0,
      lootEntries,
      hasLoot: lootEntries.length > 0,
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

    el.querySelector(".sr-copy-btn")?.addEventListener("click", async () => {
      const text = SessionRecap.formatForDiscord();
      await navigator.clipboard.writeText(text);
      ui.notifications.info("Session recap copied to clipboard!");
    }, { signal });

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
