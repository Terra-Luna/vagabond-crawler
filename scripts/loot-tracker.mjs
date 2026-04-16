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
