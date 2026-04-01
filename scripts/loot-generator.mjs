const MODULE_ID = "vagabond-crawler";

import {
  LEVEL_FORMULAS, TREASURE, TRADE_GOODS, ART, JEWELRY, CLOTHING, RELIC,
  ARMOR_BASE, ARMOR_POWER, ARMOR_MATERIAL, ARMOR_RESISTANCE, ARMOR_UTILITY,
  WEAPONS_LIST, WEAPON_POWER, WEAPON_MATERIAL, WEAPON_RESISTANCE, WEAPON_UTILITY,
  ALCHEMY, SENSES, MOVEMENT, CREATURE_GENERAL, CREATURE_SPECIFIC,
} from "./loot-data.mjs";

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
    const $ = (sel) => el.querySelector(sel);
    const on = (sel, evt, fn) => el.querySelectorAll(sel).forEach(n => n.addEventListener(evt, fn));

    // Level select
    const levelSel = $(".vcl-gen-level");
    if (levelSel) {
      levelSel.value = this._level;
      levelSel.addEventListener("change", ev => { this._level = parseInt(ev.currentTarget.value); });
    }

    // Roll button
    const rollBtn = $(".vcl-gen-roll");
    if (rollBtn) rollBtn.addEventListener("click", () => this._rollLoot());

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
    if (clearBtn) clearBtn.addEventListener("click", () => { this._history = []; this.render(); });
  }

  /* ── Level 1 — roll on world "Vagabond Loot (p.186)" table ── */

  async _rollLevel1() {
    const table = game.tables.find(t => t.name.includes("Vagabond Loot") || t.name.includes("p.186"));
    if (!table) {
      ui.notifications.warn("Level 1 table 'Vagabond Loot (p.186)' not found in world. Import or create it first.");
      return;
    }

    const draw = await table.draw({ displayChat: false, resetTable: false });
    const result = draw.results[0];
    if (!result) return;

    const trace = [{ label: "Vagabond Loot (p.186)", formula: table.formula, total: draw.roll.total }];
    const itemName = result.text || result.name || "Unknown";

    // Try to get item data if it's a document result
    let itemData = null;
    if (result.type === "document" && result.documentUuid) {
      try {
        const doc = await fromUuid(result.documentUuid);
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
