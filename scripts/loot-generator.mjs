const MODULE_ID = "vagabond-crawler";
const LOOT_SOCKET = `module.${MODULE_ID}`;

import {
  LEVEL_FORMULAS, TREASURE, TRADE_GOODS, ART, JEWELRY, CLOTHING, RELIC,
  ARMOR_BASE, ARMOR_POWER, ARMOR_MATERIAL, ARMOR_RESISTANCE, ARMOR_UTILITY,
  WEAPONS_LIST, WEAPON_POWER, WEAPON_MATERIAL, WEAPON_RESISTANCE, WEAPON_UTILITY,
  ALCHEMY, SENSES, MOVEMENT, CREATURE_GENERAL, CREATURE_SPECIFIC,
  LEVEL1_TABLE,
} from "./loot-data.mjs";
import { LootTracker } from "./loot-tracker.mjs";

/* ── Compendium item cache ─────────────────────────────── */

const _compendiumCache = {};

async function _getCompendiumItems(packId) {
  if (_compendiumCache[packId]) return _compendiumCache[packId];
  const pack = game.packs.get(packId);
  if (!pack) return [];
  const docs = await pack.getDocuments();
  _compendiumCache[packId] = docs;
  return docs;
}

async function _findCompendiumItem(packId, name) {
  const docs = await _getCompendiumItems(packId);
  const lower = name.toLowerCase();
  return docs.find(d => d.name.toLowerCase() === lower)
    || docs.find(d => d.name.toLowerCase().includes(lower));
}

/* ── Singleton accessor ─────────────────────────────────── */

let _app = null;

export const LootGenerator = {
  init() {
    // Give buttons on GM-only loot chat cards
    Hooks.on("renderChatMessageHTML", (message, html) => {
      if (!game.user.isGM) return;
      const lootFlag = message.flags?.["vagabond-crawler"]?.lootGeneratorCard;
      if (!lootFlag) return;

      const giveBtns = html.querySelectorAll(".vcl-gen-give-btn");
      for (const btn of giveBtns) {
        btn.addEventListener("click", async (ev) => {
          const actorId = ev.currentTarget.dataset.actorId;
          const actor = game.actors.get(actorId);
          if (!actor) return;

          const itemData = message.flags["vagabond-crawler"]?.itemData;
          if (!itemData?.length) return;

          // Create items on the actor
          for (const data of itemData) {
            await Item.create(data, { parent: actor });
          }

          // Update the chat card to show it was given
          const giveSection = html.querySelector(".vcl-gen-give-section");
          if (giveSection) {
            giveSection.innerHTML = `<span style="color:#4caf50;font-size:11px;"><i class="fas fa-check"></i> Given to ${actor.name}</span>`;
          }

          // Also update the message content to persist
          const content = message.content.replace(
            /<div class="vcl-gen-give-section".*?<\/div>/s,
            `<div class="vcl-gen-give-section" style="margin-top:8px;padding-top:6px;border-top:1px solid #333;"><span style="color:#4caf50;font-size:11px;"><i class="fas fa-check"></i> Given to ${actor.name}</span></div>`
          );
          await message.update({ content });

          ui.notifications.info(`Gave loot to ${actor.name}`);
        });
      }
    });

    // Claim buttons on whispered loot cards (any user)
    Hooks.on("renderChatMessageHTML", (message, html) => {
      const flags = message.flags?.[MODULE_ID];
      if (!flags?.lootClaimCard) return;

      const btn = html.querySelector(".vcl-gen-claim-btn");
      if (!btn) return;

      if (flags.claimed) {
        btn.disabled = true;
        btn.innerHTML = `<i class="fas fa-check"></i> Claimed by ${flags.claimedBy ?? "???"}`;
        btn.classList.add("vcl-gen-claim-btn--done");
        return;
      }

      btn.addEventListener("click", async (ev) => {
        ev.preventDefault();
        const actorId = flags.actorId;
        const actor = game.actors.get(actorId);
        if (!actor?.isOwner) {
          ui.notifications.warn("You don't own this character.");
          return;
        }

        btn.disabled = true;
        btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Claiming\u2026`;

        const payload = {
          action: "claimLoot",
          messageId: message.id,
          actorId,
          userId: game.user.id,
        };

        if (game.user.isGM) {
          await LootGenerator._handleClaim(payload);
        } else {
          game.socket.emit(LOOT_SOCKET, payload);
        }
      });
    });

    // Socket handler (GM only)
    game.socket.on(LOOT_SOCKET, async (data) => {
      if (!game.user.isGM) return;
      if (data.action === "claimLoot") {
        await LootGenerator._handleClaim(data);
      }
    });
  },

  /**
   * Handle a loot claim from a player (runs on GM client).
   */
  async _handleClaim({ messageId, actorId, userId }) {
    const message = game.messages.get(messageId);
    if (!message) return;

    const flags = message.flags?.[MODULE_ID];
    if (!flags?.lootClaimCard || flags.claimed) return;

    const actor = game.actors.get(actorId);
    if (!actor) return;

    const user = game.users.get(userId);
    if (!user || !actor.testUserPermission(user, "OWNER")) {
      console.warn(`${MODULE_ID} | Claim denied: user does not own actor`);
      return;
    }

    // Mark claimed immediately to prevent race conditions
    await message.update({
      [`flags.${MODULE_ID}.claimed`]: true,
      [`flags.${MODULE_ID}.claimedBy`]: user.name,
    });

    // Add items to actor
    const itemData = flags.itemData;
    if (itemData?.length) {
      for (const data of itemData) {
        await Item.create(data, { parent: actor });
      }
    }

    // Add currency to actor
    const currency = flags.currency;
    if (currency) {
      const cur = actor.system.currency ?? {};
      const updates = {};
      if (currency.gold) updates["system.currency.gold"] = (cur.gold ?? 0) + currency.gold;
      if (currency.silver) updates["system.currency.silver"] = (cur.silver ?? 0) + currency.silver;
      if (currency.copper) updates["system.currency.copper"] = (cur.copper ?? 0) + currency.copper;
      if (Object.keys(updates).length) await actor.update(updates);
    }

    // Log via LootTracker
    const itemNames = itemData?.map(d => d.name) ?? [];
    const currParts = [];
    if (currency?.gold) currParts.push(`${currency.gold} Gold`);
    if (currency?.silver) currParts.push(`${currency.silver} Silver`);
    if (currency?.copper) currParts.push(`${currency.copper} Copper`);

    await LootTracker.logClaim(
      actor.name,
      `Loot Roll (Lv${flags.level})`,
      currency ?? { gold: 0, silver: 0, copper: 0 },
      (itemData ?? []).map(d => ({ name: d.name, img: d.img })),
    );

    // Update the chat card to show claimed state
    const updatedContent = message.content
      .replace(
        /<button[^>]*class="vcl-gen-claim-btn"[^>]*>.*?<\/button>/s,
        `<span class="vcl-gen-claim-btn vcl-gen-claim-btn--done"><i class="fas fa-check"></i> Claimed by ${user.name}</span>`
      );
    await message.update({ content: updatedContent });

    ui.notifications.info(`${actor.name} claimed loot from Level ${flags.level} roll.`);
  },

  /**
   * Roll loot for a selected token and whisper the result.
   * @param {Token|null} [token] — token to roll for; defaults to first controlled token
   * @param {number|null} [level] — override level; defaults to the Hero Level dropdown or actor level
   */
  async rollForToken(token, level) {
    if (!game.user.isGM) {
      ui.notifications.warn("Only the GM can roll loot.");
      return;
    }

    if (!token) token = canvas.tokens.controlled[0];
    if (!token) {
      ui.notifications.warn("Select a token first.");
      return;
    }

    const actor = token.actor;
    if (!actor) {
      ui.notifications.error("Token has no actor.");
      return;
    }

    const rawLevel = level ?? _app?._level ?? actor.system?.attributes?.level?.value ?? 1;
    const clampedLevel = Math.max(1, Math.min(10, rawLevel));

    // Generate loot using the headless engine (defined below in this module)
    const result = await generateLevelLoot(clampedLevel);
    if (!result) {
      ui.notifications.warn("Loot generation failed.");
      return;
    }

    const { currency, items } = result;

    // Build the chat card content
    const itemLines = items.map(d =>
      `<div class="vcl-gen-claim-item">
        <img src="${d.img || "icons/svg/item-bag.svg"}" width="24" height="24" />
        <span>${d.name}</span>
      </div>`
    ).join("");

    const currParts = [];
    if (currency.gold) currParts.push(`<span class="vcl-gen-claim-gold">${currency.gold} Gold</span>`);
    if (currency.silver) currParts.push(`<span class="vcl-gen-claim-silver">${currency.silver} Silver</span>`);
    if (currency.copper) currParts.push(`<span class="vcl-gen-claim-copper">${currency.copper} Copper</span>`);
    const currencyLine = currParts.length
      ? `<div class="vcl-gen-claim-currency">${currParts.join(" ")}</div>`
      : "";

    const hasLoot = items.length > 0 || currParts.length > 0;
    if (!hasLoot) {
      ui.notifications.info(`Level ${clampedLevel} roll for ${actor.name}: nothing found.`);
      return;
    }

    const cardContent = `
      <div class="vcl-gen-claim-card">
        <div class="vcl-gen-claim-header">
          <i class="fas fa-dice-d20"></i> Level ${clampedLevel} Loot
        </div>
        ${currencyLine}
        ${itemLines}
        <button type="button" class="vcl-gen-claim-btn">
          <i class="fas fa-hand-holding"></i> Claim Loot
        </button>
      </div>`;

    // Determine whisper targets
    const owningPlayer = game.users.find(
      u => !u.isGM && u.active && actor.testUserPermission(u, "OWNER")
    );
    const whisperTargets = [game.user.id];
    if (owningPlayer) whisperTargets.push(owningPlayer.id);

    await ChatMessage.create({
      content: cardContent,
      whisper: whisperTargets,
      speaker: ChatMessage.getSpeaker({ token: token.document ?? token }),
      flags: {
        [MODULE_ID]: {
          lootClaimCard: true,
          itemData: items,
          currency,
          actorId: actor.id,
          level: clampedLevel,
          claimed: false,
        },
      },
    });
  },

  open() {
    if (!game.user.isGM) {
      ui.notifications.warn("Only the GM can use the Loot Generator.");
      return;
    }
    if (!_app) _app = new LootGeneratorApp();
    _app.render(true);
  },
};

/* ── ApplicationV2 window ───────────────────────────────── */

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

class LootGeneratorApp extends HandlebarsApplicationMixin(ApplicationV2) {

  static DEFAULT_OPTIONS = {
    id: "vagabond-crawler-loot-generator",
    window: { title: "Loot Generator", resizable: true },
    position: { width: 540, height: "auto" },
  };

  static PARTS = {
    form: { template: "modules/vagabond-crawler/templates/loot-generator.hbs" },
  };

  constructor(...args) {
    super(...args);
    this._level = 1;
    this._history = [];  // Array of { category, color, icon, trace, item, level, resolvedParts, itemData }
  }

  /* ── Template data ──────────────────────────────────── */

  async _prepareContext() {
    const levels = [];
    for (let i = 1; i <= 10; i++) {
      levels.push({ value: i, label: `Level ${i}${i === 1 ? " (p.186)" : ""}${i === 10 ? "+" : ""}`, selected: i === this._level });
    }
    const players = game.actors.filter(a => a.type === "character" && a.hasPlayerOwner);
    return {
      levels,
      history: this._history.map((h, i) => ({ ...h, origIndex: i, hasItem: !!h.itemData?.length })).reverse(),
      hasHistory: this._history.length > 0,
      players,
    };
  }

  /* ── Event binding ──────────────────────────────────── */

  _onRender(context, options) {
    super._onRender(context, options);
    const el = this.element;
    this._renderAbort?.abort();
    this._renderAbort = new AbortController();
    const signal = this._renderAbort.signal;
    const $ = (sel) => el.querySelector(sel);
    const on = (sel, evt, fn) => el.querySelectorAll(sel).forEach(n => n.addEventListener(evt, fn, { signal }));

    // Level select
    const levelSel = $(".vcl-gen-level");
    if (levelSel) {
      levelSel.value = this._level;
      levelSel.addEventListener("change", ev => { this._level = parseInt(ev.currentTarget.value); }, { signal });
    }

    // Roll button
    const rollBtn = $(".vcl-gen-roll");
    if (rollBtn) rollBtn.addEventListener("click", () => this._rollLoot(), { signal });

    // Roll for selected token button
    const rollTokenBtn = $(".vcl-gen-roll-token");
    if (rollTokenBtn) rollTokenBtn.addEventListener("click", () => LootGenerator.rollForToken(null, this._level), { signal });

    // Post to chat buttons
    on(".vcl-gen-post-chat", "click", ev => {
      const idx = parseInt(ev.currentTarget.dataset.index);
      const entry = this._history[idx];
      if (entry) this._postToChat(entry);
    });

    // Give to player buttons (in-app)
    on(".vcl-gen-give-app", "click", async ev => {
      const idx = parseInt(ev.currentTarget.dataset.histIndex);
      const result = ev.currentTarget.closest(".vcl-gen-result");
      const actorId = result?.querySelector(".vcl-gen-player-select")?.value;
      if (!actorId) return;
      const entry = this._history[idx];
      if (!entry?.itemData?.length) return;

      const actor = game.actors.get(actorId);
      if (!actor) return;
      for (const data of entry.itemData) {
        await Item.create(data, { parent: actor });
      }
      ui.notifications.info(`Gave loot to ${actor.name}`);
    });

    // Clear history
    const clearBtn = $(".vcl-gen-clear");
    if (clearBtn) clearBtn.addEventListener("click", () => { this._history = []; this.render(); }, { signal });
  }

  /* ── Level 1 — roll on world "Vagabond Loot (p.186)" table ── */

  async _rollLevel1() {
    // Weighted random from embedded p.186 data — no world table dependency
    const totalWeight = LEVEL1_TABLE.reduce((s, e) => s + e[0], 0);
    let roll = Math.floor(Math.random() * totalWeight);
    let rollDisplay = roll + 1;  // 1-indexed for display
    let pick = LEVEL1_TABLE[0];
    for (const entry of LEVEL1_TABLE) {
      roll -= entry[0];
      if (roll < 0) { pick = entry; break; }
    }
    const [weight, itemName, uuid] = pick;

    const trace = [{ label: "Vagabond Loot (p.186)", formula: `1d${totalWeight}`, total: rollDisplay }];

    // Try to get item data from compendium UUID
    let itemData = null;
    if (uuid) {
      try {
        const doc = await fromUuid(uuid);
        if (doc) itemData = [doc.toObject()];
      } catch { /* non-fatal */ }
    }

    const entry = {
      category: "Loot (p.186)",
      color: "#c9aa58",
      icon: "fa-book-open",
      trace,
      item: itemName,
      level: 1,
      resolvedParts: { type: "level1", name: itemName },
      itemData,
    };
    this._history.push(entry);
    this.render();
  }

  /* ── Core resolution engine ─────────────────────────── */

  async _rollLoot() {
    const level = this._level;

    // ── Level 1: Roll on the world "Vagabond Loot (p.186)" table ──
    if (level === 1) {
      return this._rollLevel1();
    }

    const formulas = LEVEL_FORMULAS[level];
    if (!formulas) return;

    const trace = [];

    // Helper to roll and record trace
    const R = async (formula, label) => {
      const r = new Roll(formula);
      await r.evaluate();
      trace.push({ label, formula, total: r.total });
      return r.total;
    };

    // Helper to lookup in range table
    const lookupRange = (table, n) => {
      for (const [lo, hi, text] of table) {
        if (n >= lo && n <= hi) return text;
      }
      return `Unknown (${n})`;
    };

    // Step 1: Category (d6)
    const catN = await R("1d6", "Category");
    let category, color, icon, item, resolvedParts;

    if (catN === 1) {
      // ── TREASURE ──
      category = "Treasure";
      color = "#c9aa58";
      icon = "fa-coins";
      const result = await this._resolveTreasure(R, formulas.treasure);
      item = result.text;
      resolvedParts = result.parts;
    } else if (catN === 2) {
      // ── ARMOR ──
      category = "Armor";
      color = "#6a9fd8";
      icon = "fa-shield-halved";
      const result = await this._resolveArmor(R, lookupRange, formulas.armor);
      item = result.text;
      resolvedParts = result.parts;
    } else if (catN <= 4) {
      // ── WEAPONS ──
      category = "Weapons";
      color = "#d86a6a";
      icon = "fa-khanda";
      const result = await this._resolveWeapon(R, formulas.weapon);
      item = result.text;
      resolvedParts = result.parts;
    } else {
      // ── ALCHEMY (roll twice) ──
      category = "Alchemy (\u00d72)";
      color = "#7ad868";
      icon = "fa-flask-vial";
      const n1 = await R(formulas.alchemy, "Alchemy Roll 1");
      const item1 = ALCHEMY[n1] || `Unknown (${n1})`;
      const n2 = await R(formulas.alchemy, "Alchemy Roll 2");
      const item2 = ALCHEMY[n2] || `Unknown (${n2})`;
      item = `${item1}  &  ${item2}`;
      resolvedParts = { items: [item1, item2] };
    }

    const entry = { category, color, icon, trace, item, level, resolvedParts };
    entry.itemData = await this._createItemData(entry);
    this._history.push(entry);
    this.render();
  }

  /* ── Item creation pipeline ────────────────────────── */

  async _createItemData(result) {
    if (result.category.includes("Alchemy")) {
      return this._createAlchemyItem(result);
    }
    if (result.category === "Weapons") {
      return this._createWeaponItem(result);
    }
    if (result.category === "Armor") {
      return this._createArmorItem(result);
    }
    return this._createTreasureItem(result);
  }

  async _createAlchemyItem(result) {
    const items = [];
    for (const name of (result.resolvedParts?.items ?? [])) {
      const doc = await _findCompendiumItem("vagabond.alchemical-items", name);
      if (doc) items.push(doc.toObject());
    }
    return items.length ? items : null;
  }

  async _createWeaponItem(result) {
    const { base, material, powerText } = result.resolvedParts ?? {};
    if (!base) return null;
    const doc = await _findCompendiumItem("vagabond.weapons", base);
    if (!doc) return null;
    const itemData = doc.toObject();

    // Apply material
    if (material && material !== "Mundane") {
      itemData.system.metal = material.toLowerCase();
    }

    // Update name with full generated name
    itemData.name = result.item;

    // Store loot gen metadata
    itemData.flags = itemData.flags || {};
    itemData.flags["vagabond-crawler"] = {
      lootGenerated: true,
      powerText,
      material,
      level: result.level,
    };

    return [itemData];
  }

  async _createArmorItem(result) {
    const { base, material, powerText } = result.resolvedParts ?? {};
    if (!base) return null;

    // Map base name to armor type
    let armorType = "light";
    if (base.includes("Medium")) armorType = "medium";
    if (base.includes("Heavy")) armorType = "heavy";
    if (base.includes("Clothing") || base.includes("Robes")) armorType = "light";

    const searchName = armorType === "light" ? "Light Armor"
      : armorType === "medium" ? "Medium Armor"
      : "Heavy Armor";

    const doc = await _findCompendiumItem("vagabond.armor", searchName);
    if (!doc) return null;
    const itemData = doc.toObject();

    itemData.name = result.item;
    if (material && material !== "Mundane") {
      itemData.system.metal = material.toLowerCase();
    }
    itemData.flags = itemData.flags || {};
    itemData.flags["vagabond-crawler"] = {
      lootGenerated: true,
      powerText,
      material,
      level: result.level,
    };

    return [itemData];
  }

  async _createTreasureItem(result) {
    const name = result.item;
    // Try gear compendium for jewelry/clothing
    const doc = await _findCompendiumItem("vagabond.gear", name);
    if (doc) return [doc.toObject()];
    return null; // Coins, gems, etc. are text-only
  }

  /* ── Treasure resolver ──────────────────────────────── */

  async _resolveTreasure(R, formula) {
    const n = await R(formula, "Treasure Table");
    const entry = TREASURE[n];
    if (!entry) return { text: `Unknown treasure (${n})`, parts: {} };

    if (entry.startsWith("Trade Goods")) {
      const tgF = n <= 6 ? "d6" : n <= 12 ? "d6+6" : n <= 18 ? "d6+12" : "d6+18";
      const tg = await R(tgF, "Trade Goods");
      const text = TRADE_GOODS[tg];
      return { text, parts: { subtype: "tradeGoods", name: text } };
    }
    if (entry.startsWith("Art")) {
      const a = await R("1d8", "Art Table");
      const text = `${ART[a]}, ${entry.replace("Art (d8), ", "")}`;
      return { text, parts: { subtype: "art", name: ART[a] } };
    }
    if (entry.startsWith("Jewelry")) {
      const j = await R("1d12", "Jewelry Table");
      let result = JEWELRY[j];
      if (result === "\u2192Clothing") {
        const c = await R("1d20", "Clothing Table");
        result = CLOTHING[c];
      }
      const text = `${result}, ${entry.replace("Jewelry (d12), ", "")}`;
      return { text, parts: { subtype: "jewelry", name: result } };
    }
    if (entry.startsWith("Relic")) {
      const relF = n <= 6 ? "d6" : n <= 12 ? "d6+6" : n <= 18 ? "d6+12" : "d6+18";
      const rel = await R(relF, "Relic Item Table");
      const text = RELIC[rel];
      return { text, parts: { subtype: "relic", name: text } };
    }
    return { text: entry, parts: { subtype: "currency", name: entry } };
  }

  /* ── Armor resolver ─────────────────────────────────── */

  async _resolveArmor(R, lookupRange, formula) {
    const baseN = await R("1d20", "Armor Table");
    const base = lookupRange(ARMOR_BASE, baseN);
    const powN = await R(formula, "Armor Power");
    const power = await this._resolveArmorPower(R, powN);

    let material = "";
    if (powN >= 8) {
      const matN = await R("1d12", "Material Check");
      const mat = ARMOR_MATERIAL[matN];
      if (mat && mat !== "Mundane") material = mat;
    }

    const parts = [];
    if (material) parts.push(material);
    parts.push(base);
    if (power) parts.push(power);
    const text = parts.join(" ");

    return { text, parts: { base, material: material || "Mundane", powerText: power || "" } };
  }

  async _resolveArmorPower(R, n) {
    const p = ARMOR_POWER[n];
    if (!p) return "";
    if (p.startsWith("Material")) { const m = await R("1d12", "Armor Material"); const mat = ARMOR_MATERIAL[m]; return mat === "Mundane" ? "" : mat; }
    if (p.startsWith("Resistance")) { const d = p.includes("d8") ? "1d8" : "1d3"; const v = await R(d, "Armor Resistance"); return `of ${ARMOR_RESISTANCE[v]}`; }
    if (p.startsWith("Movement")) { const d = p.includes("+6") ? "1d8+6" : "1d6"; const v = await R(d, "Movement"); return `of ${MOVEMENT[v]}`; }
    if (p.startsWith("Senses")) { const d = p.includes("+4") ? "1d4+4" : "1d4"; const v = await R(d, "Senses"); return `of ${SENSES[v]}`; }
    if (p.startsWith("Utility")) { const m = p.match(/\((.+?)\)/); const d = m ? m[1] : "1d8"; const v = await R(d, "Armor Utility"); return `of ${ARMOR_UTILITY[v]}`; }
    if (p.startsWith("Protection, General")) { const v = await R("1d8", "Creature General"); return `Protection vs ${CREATURE_GENERAL[v]}`; }
    if (p.startsWith("Protection, Specific")) { const v = await R("1d40", "Creature Specific"); return `Protection vs ${CREATURE_SPECIFIC[v]}`; }
    if (p.startsWith("Protection, Niche")) return "Protection vs Last Fought";
    if (p.includes("+")) return p;  // "+1", "+2", "+3"
    if (p.startsWith("Fabled")) return `(${p})`;
    return p;
  }

  /* ── Weapon resolver ────────────────────────────────── */

  async _resolveWeapon(R, formula) {
    const baseN = await R("1d48", "Weapon Table");
    const base = WEAPONS_LIST[baseN - 1] || "Unknown weapon";
    const powN = await R(formula, "Weapon Power");
    const power = await this._resolveWeaponPower(R, powN);

    let material = "";
    if (powN >= 10) {
      const matN = await R("1d8", "Material Check");
      const mat = WEAPON_MATERIAL[matN];
      if (mat && mat !== "Mundane") material = mat;
    }

    const parts = [];
    if (material) parts.push(material);
    parts.push(base);
    if (power) parts.push(power);
    const text = parts.join(" ");

    return { text, parts: { base, material: material || "Mundane", powerText: power || "" } };
  }

  async _resolveWeaponPower(R, n) {
    const p = WEAPON_POWER[n];
    if (!p) return "";
    if (p.startsWith("Material")) { const v = await R("1d8", "Weapon Material"); const mat = WEAPON_MATERIAL[v]; return mat === "Mundane" ? "" : mat; }
    if (p.startsWith("Resistance")) { const v = await R("1d3", "Weapon Resistance"); return `of ${WEAPON_RESISTANCE[v]}`; }
    if (p.startsWith("Movement")) { const m = p.match(/\((.+?)\)/); const d = m ? m[1] : "1d6"; const v = await R(d, "Movement"); return `of ${MOVEMENT[v]}`; }
    if (p.startsWith("Senses")) { const m = p.match(/\((.+?)\)/); const d = m ? m[1] : "1d4"; const v = await R(d, "Senses"); return `of ${SENSES[v]}`; }
    if (p.startsWith("Utility")) { const m = p.match(/\((.+?)\)/); const d = m ? m[1] : "1d6"; const v = await R(d, "Weapon Utility"); return `of ${WEAPON_UTILITY[v]}`; }
    if (p.startsWith("Bane, General")) { const v = await R("1d8", "Creature General"); return `Bane of ${CREATURE_GENERAL[v]}`; }
    if (p.startsWith("Bane, Specific")) { const v = await R("1d40", "Creature Specific"); return `Bane of ${CREATURE_SPECIFIC[v]}`; }
    if (p.startsWith("Bane, Niche")) return "Bane of Last Fought";
    if (p.startsWith("Strike")) return `(${p})`;
    if (p.startsWith("Ace")) return "(Ace)";
    if (p.startsWith("Fabled")) return `(${p})`;
    if (p.startsWith("Weapon +") || p.startsWith("Weapon/Trinket +")) return p.replace("Weapon/Trinket ", "").replace("Weapon ", "");
    return p;
  }

  /* ── Post to chat ───────────────────────────────────── */

  async _postToChat(entry) {
    const traceHtml = entry.trace.map(t =>
      `<span style="color:#666">\u2192</span> <span style="color:#aaa">${t.label}</span> <span style="color:#666">(${t.formula}=${t.total})</span>`
    ).join("<br>");

    // Build player buttons (GM only)
    const players = game.actors.filter(a => a.type === "character" && a.hasPlayerOwner);
    const playerBtns = players.map(a =>
      `<button type="button" class="vcl-gen-give-btn" data-actor-id="${a.id}" style="margin:2px;padding:3px 8px;border:1px solid #555;border-radius:3px;background:transparent;color:#aaa;font-size:11px;cursor:pointer;">
        ${a.name}
      </button>`
    ).join("");

    const msgData = {
      content: `<div style="border-left:4px solid ${entry.color};padding:8px 12px;background:var(--vcb-surface-1, #1a1a1a);border-radius:0 6px 6px 0;" data-loot-gen="true">
        <div style="font-size:10px;color:${entry.color};text-transform:uppercase;letter-spacing:1.5px;font-weight:bold;">
          <i class="fas ${entry.icon}"></i> Level ${entry.level} ${entry.category}
        </div>
        <div style="font-size:11px;line-height:1.6;margin:6px 0;font-family:monospace;">${traceHtml}</div>
        <div style="font-size:14px;border-top:1px solid var(--vcb-border, #333);padding-top:6px;font-weight:bold;">${entry.item}</div>
        ${entry.itemData ? `<div class="vcl-gen-give-section" style="margin-top:8px;padding-top:6px;border-top:1px solid #333;">
          <span style="font-size:11px;color:#888;">Give to:</span> ${playerBtns}
        </div>` : '<div style="margin-top:4px;font-size:11px;color:#666;">(Text-only \u2014 no item to give)</div>'}
      </div>`,
      speaker: { alias: "Loot Generator" },
      flags: {
        "vagabond-crawler": {
          lootGeneratorCard: true,
          itemData: entry.itemData,
        },
      },
    };

    await ChatMessage.create(msgData);
  }
}

/* ── Headless loot generation for Loot Drops integration ───── */

/**
 * Generate loot for a given level without UI.
 * Called by loot-tables.mjs when a "loot-level:N" table is assigned.
 * @param {number} level — 1-10
 * @returns {Promise<{currency: Object, items: Object[]}>}
 */
export async function generateLevelLoot(level) {
  const currency = { gold: 0, silver: 0, copper: 0 };
  const items = [];

  const _roll = async (formula) => {
    const r = new Roll(formula);
    await r.evaluate();
    return r.total;
  };

  const _lookupRange = (table, n) => {
    for (const [lo, hi, text] of table) { if (n >= lo && n <= hi) return text; }
    return null;
  };

  if (level === 1) {
    // ── Level 1: weighted random from p.186 table ──
    const totalWeight = LEVEL1_TABLE.reduce((s, e) => s + e[0], 0);
    let roll = Math.floor(Math.random() * totalWeight);
    let pick = LEVEL1_TABLE[0];
    for (const entry of LEVEL1_TABLE) {
      roll -= entry[0];
      if (roll < 0) { pick = entry; break; }
    }
    const [, name, uuid] = pick;

    // Parse currency from name
    const coinMatch = name.match(/^Coins\s+\((.+?)\)\s+(gold|silver|copper)$/i);
    if (coinMatch) {
      const coinRoll = await _roll(coinMatch[1]);
      currency[coinMatch[2].toLowerCase()] += coinRoll;
      return { currency, items };
    }

    // Compendium item
    if (uuid) {
      try {
        const doc = await fromUuid(uuid);
        if (doc) items.push(doc.toObject());
      } catch { /* non-fatal */ }
    }
    return { currency, items };
  }

  // ── Levels 2-10: category chain ──
  const formulas = LEVEL_FORMULAS[level];
  if (!formulas) return { currency, items };

  const catN = await _roll("1d6");

  if (catN === 1) {
    // Treasure
    const n = await _roll(formulas.treasure);
    const entry = TREASURE[n];
    if (entry) {
      // Coins
      const coinMatch = entry.match(/^Coins:\s+(.+)$/);
      if (coinMatch) {
        const formula = coinMatch[1].replace(/\u00d7/g, "*").replace(/gold/i, "").trim();
        try { currency.gold += (await _roll(formula)); } catch { /* complex formula */ }
      }
      // Trade Goods — resolve to text only (no item)
      // Art/Jewelry/Relic — text-based, no currency
      // Try compendium match for non-coin results
      else if (!entry.startsWith("Coins")) {
        // Try to find a matching compendium item by name keywords
        const baseName = entry.replace(/\s*\(.+?\)/g, "").replace(/,.*$/, "").trim();
        const doc = await _findCompendiumItem("vagabond.gear", baseName)
          || await _findCompendiumItem("vagabond.weapons", baseName);
        if (doc) items.push(doc.toObject());
      }
    }
  } else if (catN === 2) {
    // Armor — get base + power
    const baseN = await _roll("1d20");
    const base = _lookupRange(ARMOR_BASE, baseN) ?? "Light Armor";
    let armorPack = "Light Armor";
    if (base.includes("Medium")) armorPack = "Medium Armor";
    if (base.includes("Heavy")) armorPack = "Heavy Armor";
    const doc = await _findCompendiumItem("vagabond.armor", armorPack);
    if (doc) {
      const itemData = doc.toObject();
      // Apply material if power roll is high enough
      const powN = await _roll(formulas.armor);
      if (powN >= 8) {
        const matN = await _roll("1d12");
        const mat = ARMOR_MATERIAL[matN];
        if (mat && mat !== "Mundane") {
          itemData.system.metal = mat.toLowerCase();
          itemData.name = `${mat} ${itemData.name}`;
        }
      }
      const power = ARMOR_POWER[powN];
      if (power?.includes("+")) itemData.name += ` ${power}`;
      items.push(itemData);
    }
  } else if (catN <= 4) {
    // Weapons
    const baseN = await _roll("1d48");
    const baseName = WEAPONS_LIST[baseN - 1];
    if (baseName) {
      const doc = await _findCompendiumItem("vagabond.weapons", baseName);
      if (doc) {
        const itemData = doc.toObject();
        const powN = await _roll(formulas.weapon);
        if (powN >= 10) {
          const matN = await _roll("1d8");
          const mat = WEAPON_MATERIAL[matN];
          if (mat && mat !== "Mundane") {
            itemData.system.metal = mat.toLowerCase();
            itemData.name = `${mat} ${itemData.name}`;
          }
        }
        const power = WEAPON_POWER[powN];
        if (power?.includes("+")) itemData.name += ` ${power.replace("Weapon/Trinket ", "").replace("Weapon ", "")}`;
        else if (power?.startsWith("Strike")) itemData.name += ` (${power})`;
        items.push(itemData);
      }
    }
  } else {
    // Alchemy (roll twice)
    for (let i = 0; i < 2; i++) {
      const n = await _roll(formulas.alchemy);
      const name = ALCHEMY[n];
      if (name) {
        const doc = await _findCompendiumItem("vagabond.alchemical-items", name);
        if (doc) items.push(doc.toObject());
      }
    }
  }

  return { currency, items };
}
