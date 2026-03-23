/**
 * Vagabond Crawler — Relic Forge
 *
 * GM tool to upgrade equipment items into magical relics by selecting
 * powers, computing costs, and generating Active Effects.
 * 3-column layout: Power Browser | Base Item + Config | Selected Powers
 */

import { MODULE_ID } from "./vagabond-crawler.mjs";

/* -------------------------------------------- */
/*  Power Categories                            */
/* -------------------------------------------- */

const RELIC_POWER_CATEGORIES = {
  weapon:    { label: "Weapon",       icon: "fas fa-sword" },
  bane:      { label: "Bane",         icon: "fas fa-crosshairs" },
  protect:   { label: "Protection",   icon: "fas fa-shield-halved" },
  resist:    { label: "Resistance",   icon: "fas fa-shield-virus" },
  fortify:   { label: "Fortification",icon: "fas fa-chess-rook" },
  enchant:   { label: "Enchanted",    icon: "fas fa-hat-wizard" },
  misc:      { label: "Miscellaneous",icon: "fas fa-star" },
};

/* -------------------------------------------- */
/*  Relic Powers Database                       */
/* -------------------------------------------- */

const RELIC_POWERS = [
  // ── Weapon Enhancement ─────────────────────────
  { id: "keen", name: "Keen", category: "weapon", icon: "fas fa-bullseye", cost: 200,
    nameFormat: { position: "prefix", text: "Keen" },
    effects: [{ key: "system.properties", mode: 2, value: "keen" }],
    description: "Crit range expanded by 1." },

  { id: "vicious", name: "Vicious", category: "weapon", icon: "fas fa-burst", cost: 150,
    nameFormat: { position: "prefix", text: "Vicious" },
    effects: [{ key: "system.damageBonus", mode: 2, value: "2" }],
    description: "+2 bonus to damage rolls." },

  { id: "thundering", name: "Thundering", category: "weapon", icon: "fas fa-bolt", cost: 300,
    nameFormat: { position: "prefix", text: "Thundering" },
    effects: [{ key: "flags.vagabond-crawler.relicPower.thundering", mode: 5, value: "true" }],
    description: "On crit, deal extra 1d8 thunder damage." },

  { id: "flaming", name: "Flaming", category: "weapon", icon: "fas fa-fire", cost: 250,
    nameFormat: { position: "prefix", text: "Flaming" },
    effects: [{ key: "flags.vagabond-crawler.relicPower.flaming", mode: 5, value: "true" }],
    description: "Extra 1d6 fire damage on hit." },

  { id: "frost", name: "Frost", category: "weapon", icon: "fas fa-snowflake", cost: 250,
    nameFormat: { position: "prefix", text: "Frost" },
    effects: [{ key: "flags.vagabond-crawler.relicPower.frost", mode: 5, value: "true" }],
    description: "Extra 1d6 cold damage on hit." },

  // ── Bane ───────────────────────────────────────
  { id: "bane", name: "Bane", category: "bane", icon: "fas fa-skull-crossbones", cost: 200,
    nameFormat: { position: "suffix", text: "of {input} Bane" },
    effects: [{ key: "flags.vagabond-crawler.relicPower.bane", mode: 5, value: "{input}" }],
    requiresInput: true, inputType: "select",
    inputOptions: ["Undead","Beast","Dragon","Fey","Fiend","Giant","Humanoid","Monstrosity","Ooze","Plant","Construct","Elemental","Aberration","Celestial"],
    inputLabel: "Creature Type",
    description: "Extra damage dice vs chosen creature type." },

  // ── Protection ─────────────────────────────────
  { id: "protection", name: "Protection", category: "protect", icon: "fas fa-shield", cost: 200,
    nameFormat: { position: "suffix", text: "of Protection from {input}" },
    effects: [{ key: "flags.vagabond-crawler.relicPower.protection", mode: 5, value: "{input}" }],
    requiresInput: true, inputType: "select",
    inputOptions: ["Undead","Beast","Dragon","Fey","Fiend","Giant","Humanoid","Monstrosity"],
    inputLabel: "Protected From",
    description: "Favor on saves vs chosen creature type." },

  // ── Resistance ─────────────────────────────────
  { id: "resistance", name: "Resistance", category: "resist", icon: "fas fa-shield-virus", cost: 300,
    nameFormat: { position: "suffix", text: "of {input} Resistance" },
    effects: [{ key: "system.resistances", mode: 2, value: "{input}" }],
    requiresInput: true, inputType: "select",
    inputOptions: ["Fire","Cold","Lightning","Thunder","Poison","Necrotic","Radiant","Psychic","Acid"],
    inputLabel: "Damage Type",
    description: "Half damage from chosen damage type." },

  // ── Fortification ──────────────────────────────
  { id: "fortified", name: "Fortified", category: "fortify", icon: "fas fa-chess-rook", cost: 300,
    nameFormat: { position: "prefix", text: "Fortified" },
    effects: [{ key: "system.armorBonus", mode: 2, value: "1" }],
    description: "+1 Armor bonus when equipped." },

  { id: "warding", name: "Warding", category: "fortify", icon: "fas fa-hand-sparkles", cost: 250,
    nameFormat: { position: "prefix", text: "Warding" },
    effects: [{ key: "system.universalCheckBonus", mode: 2, value: "1" }],
    description: "+1 to all saves when equipped." },

  // ── Enchanted ──────────────────────────────────
  { id: "lucky", name: "Lucky", category: "enchant", icon: "fas fa-clover", cost: 400,
    nameFormat: { position: "prefix", text: "Lucky" },
    effects: [{ key: "system.bonusLuck", mode: 2, value: "1" }],
    description: "+1 Luck when equipped." },

  { id: "swift", name: "Swift", category: "enchant", icon: "fas fa-wind", cost: 200,
    nameFormat: { position: "prefix", text: "Swift" },
    effects: [{ key: "system.speed.bonus", mode: 2, value: "10" }],
    description: "+10 Speed when equipped." },

  // ── Miscellaneous ──────────────────────────────
  { id: "lifesteal", name: "Lifesteal", category: "misc", icon: "fas fa-heart-pulse", cost: 500,
    nameFormat: { position: "prefix", text: "Vampiric" },
    effects: [{ key: "flags.vagabond-crawler.relicPower.lifesteal", mode: 5, value: "true" }],
    description: "On kill, heal 1d6 HP." },

  { id: "returning", name: "Returning", category: "misc", icon: "fas fa-rotate-left", cost: 100,
    nameFormat: { position: "prefix", text: "Returning" },
    effects: [{ key: "flags.vagabond-crawler.relicPower.returning", mode: 5, value: "true" }],
    description: "Thrown weapon returns to your hand." },

  { id: "glamoured", name: "Glamoured", category: "misc", icon: "fas fa-masks-theater", cost: 100,
    nameFormat: { position: "prefix", text: "Glamoured" },
    effects: [{ key: "flags.vagabond-crawler.relicPower.glamoured", mode: 5, value: "true" }],
    description: "Can change appearance at will." },
];

function getRelicPower(id) {
  return RELIC_POWERS.find(p => p.id === id) || null;
}

/* -------------------------------------------- */
/*  Relic Forge Singleton                       */
/* -------------------------------------------- */

export const RelicForge = {
  _app: null,

  registerSettings() {
    game.settings.register(MODULE_ID, "relicForgeEnabled", {
      name: "Relic Forge",
      hint: "Enable the Relic Forge tool for upgrading equipment into magical relics.",
      scope: "world", config: true, type: Boolean, default: true,
    });
  },

  init() {
    console.log(`${MODULE_ID} | Relic Forge initialized.`);
  },

  open(item = null) {
    if (!game.user.isGM) {
      ui.notifications.warn("Only the GM can use the Relic Forge.");
      return;
    }
    if (!this._app) this._app = new RelicForgeApp();
    if (item) this._app.loadItem(item);
    this._app.render(true);
  },
};

/* -------------------------------------------- */
/*  Relic Forge ApplicationV2                   */
/* -------------------------------------------- */

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

class RelicForgeApp extends HandlebarsApplicationMixin(ApplicationV2) {
  static DEFAULT_OPTIONS = {
    id:       "vagabond-crawler-relic-forge",
    window:   { title: "Relic Forge", resizable: true },
    position: { width: 960, height: 780 },
  };

  static PARTS = {
    form: { template: "modules/vagabond-crawler/templates/relic-forge.hbs" },
  };

  constructor(...args) {
    super(...args);
    this._item = null;
    this._itemData = null;
    this._selectedPowers = new Map(); // id → { ...powerDef, _userInput?: string }
    this._customPowers = [];
    this._categoryFilter = "all";
  }

  /* ---- Data for template ---- */

  async _prepareContext() {
    return this.getData();
  }

  getData() {
    // Categories
    const categories = [
      { key: "all", label: "All", icon: "fas fa-globe", active: this._categoryFilter === "all" },
      ...Object.entries(RELIC_POWER_CATEGORIES).map(([key, cat]) => ({
        key, label: cat.label, icon: cat.icon, active: this._categoryFilter === key,
      })),
    ];

    // Filtered powers
    const filtered = this._categoryFilter === "all"
      ? RELIC_POWERS
      : RELIC_POWERS.filter(p => p.category === this._categoryFilter);

    const powers = filtered.map(p => ({
      ...p,
      selected: this._selectedPowers.has(p.id),
      costDisplay: p.cost > 0 ? `${p.cost.toLocaleString()}g` : "Free",
    }));

    // Selected powers (right panel)
    const selectedPowers = Array.from(this._selectedPowers.values()).map(p => ({
      ...p,
      costDisplay: p.cost > 0 ? `${p.cost.toLocaleString()}g` : "Free",
      userInput: p._userInput || "",
      isSelect: p.inputType === "select",
    }));

    const customPowers = this._customPowers.map((cp, i) => ({ ...cp, index: i }));

    // Base item
    let baseItem = null;
    let baseCostDisplay = "-";
    if (this._item) {
      baseItem = {
        img: this._itemData.img || "icons/svg/item-bag.svg",
        name: this._itemData.name,
        type: this._itemData.system?.equipmentType || "gear",
        metal: this._itemData.system?.metal || "none",
      };
      const cost = this._itemData.system?.cost ?? {};
      const parts = [];
      if (cost.gold) parts.push(`${cost.gold}g`);
      if (cost.silver) parts.push(`${cost.silver}s`);
      if (cost.copper) parts.push(`${cost.copper}c`);
      baseCostDisplay = parts.length > 0 ? parts.join(" ") : "-";
    }

    return {
      baseItem,
      baseCostDisplay,
      categories,
      powers,
      selectedPowers,
      customPowers,
      canForge: this._item && (this._selectedPowers.size > 0 || this._customPowers.length > 0),
      previewName: this._computeName(),
      totalCostDisplay: this._computeCostDisplay(),
    };
  }

  /* ---- Name computation ---- */

  _computeName() {
    const baseName = this._itemData?.name || "[Item]";
    const prefixes = [];
    const suffixes = [];

    const allPowers = [...this._selectedPowers.values(), ...this._customPowers];
    for (const power of allPowers) {
      const fmt = power.nameFormat;
      if (!fmt) {
        if (power.nameLabel) prefixes.push(power.nameLabel);
        continue;
      }
      let text = fmt.text || "";
      if (power.requiresInput && power._userInput) {
        text = text.replace("{input}", power._userInput);
      } else if (power.requiresInput) {
        text = text.replace("{input}", "???");
      }
      if (fmt.position === "prefix") prefixes.push(text);
      else if (fmt.position === "suffix") suffixes.push(text);
    }

    let name = [...prefixes, baseName].join(" ");
    if (suffixes.length) name = name + " " + suffixes.join(" ");
    return name;
  }

  _computeCostDisplay() {
    const baseCostGold = this._itemData?.system?.baseCost?.gold || this._itemData?.system?.cost?.gold || 0;
    const allPowers = [...this._selectedPowers.values(), ...this._customPowers];
    const powerCost = allPowers.reduce((sum, p) => sum + (p.cost || 0), 0);
    const totalGold = baseCostGold + powerCost;
    return totalGold > 0 ? `${totalGold.toLocaleString()}g` : "-";
  }

  /* ---- Event binding ---- */

  _onRender(context, options) {
    super._onRender(context, options);
    const el = this.element;
    const $$ = (sel) => [...el.querySelectorAll(sel)];
    const on = (sel, evt, fn) => $$(sel).forEach(n => n.addEventListener(evt, fn));

    // Drop zone
    const dropZone = el.querySelector(".drop-zone");
    if (dropZone) {
      dropZone.addEventListener("dragover", ev => { ev.preventDefault(); dropZone.classList.add("drag-hover"); });
      dropZone.addEventListener("dragleave", () => dropZone.classList.remove("drag-hover"));
      dropZone.addEventListener("drop", async (ev) => {
        ev.preventDefault();
        dropZone.classList.remove("drag-hover");
        const data = JSON.parse(ev.dataTransfer.getData("text/plain"));
        if (data.type !== "Item") return;
        const item = await fromUuid(data.uuid);
        if (!item || item.type !== "equipment") {
          ui.notifications.warn("Only equipment items can be forged into relics.");
          return;
        }
        this.loadItem(item);
        this.render();
      });
    }

    // Clear item
    el.querySelector(".clear-btn")?.addEventListener("click", () => {
      this._item = null;
      this._itemData = null;
      this._selectedPowers.clear();
      this._customPowers = [];
      this._categoryFilter = "all";
      this.render();
    });

    // Category tabs
    on(".category-tab", "click", ev => {
      this._categoryFilter = ev.currentTarget.dataset.category || "all";
      this.render();
    });

    // Power cards (toggle)
    on(".power-card", "click", ev => {
      const id = ev.currentTarget.dataset.powerId;
      if (this._selectedPowers.has(id)) {
        this._selectedPowers.delete(id);
      } else {
        const power = getRelicPower(id);
        if (power) this._selectedPowers.set(id, { ...power });
      }
      this.render();
    });

    // Remove power button (right panel)
    on(".remove-btn[data-power-id]", "click", ev => {
      ev.stopPropagation();
      const id = ev.currentTarget.dataset.powerId;
      this._selectedPowers.delete(id);
      this.render();
    });

    // Remove custom power
    on(".remove-btn[data-custom-index]", "click", ev => {
      ev.stopPropagation();
      const idx = parseInt(ev.currentTarget.dataset.customIndex);
      this._customPowers.splice(idx, 1);
      this.render();
    });

    // User input fields for powers
    on(".power-user-input", "change", ev => {
      const id = ev.currentTarget.dataset.powerId;
      const power = this._selectedPowers.get(id);
      if (power) {
        power._userInput = ev.currentTarget.value.trim();
        // Update preview name live
        const nameEl = el.querySelector(".name-text");
        if (nameEl) nameEl.textContent = this._computeName();
        const costEl = el.querySelector(".cost-text");
        if (costEl) costEl.textContent = this._computeCostDisplay();
      }
    });

    // Set select values
    el.querySelectorAll("select.power-user-input").forEach(sel => {
      const id = sel.dataset.powerId;
      const power = this._selectedPowers.get(id);
      if (power?._userInput) sel.value = power._userInput;
    });

    // Add custom power
    el.querySelector(".add-custom-btn")?.addEventListener("click", () => {
      const nameInput = el.querySelector(".custom-power-name");
      const nameLabelInput = el.querySelector(".custom-power-namelabel");
      const keyInput = el.querySelector(".custom-power-key");
      const modeInput = el.querySelector(".custom-power-mode");
      const valueInput = el.querySelector(".custom-power-value");

      const name = nameInput?.value?.trim();
      const key = keyInput?.value?.trim();
      const value = valueInput?.value?.trim();
      if (!name || !key || !value) {
        ui.notifications.warn("Fill in all custom power fields.");
        return;
      }
      const mode = parseInt(modeInput?.value || "2");
      const nameLabel = nameLabelInput?.value?.trim() || name;

      this._customPowers.push({
        name,
        nameLabel,
        nameFormat: { position: "prefix", text: nameLabel },
        description: `${key} ${mode === 2 ? "+" : "→"} ${value}`,
        icon: "fas fa-wand-magic-sparkles",
        cost: 0,
        effects: [{ key, mode, value }],
        flags: { relicPower: `custom-${name.toLowerCase().replace(/\s+/g, "-")}` },
      });

      if (nameInput) nameInput.value = "";
      if (nameLabelInput) nameLabelInput.value = "";
      if (keyInput) keyInput.value = "";
      if (valueInput) valueInput.value = "";
      this.render();
    });

    // Forge button
    el.querySelector(".forge-btn")?.addEventListener("click", () => this._forgeRelic());
  }

  loadItem(item) {
    this._item = item;
    this._itemData = item.toObject();
    this._selectedPowers.clear();
    this._customPowers = [];
    this._categoryFilter = "all";
  }

  /* ---- Forge ---- */

  async _forgeRelic() {
    if (!this._item) return;

    const item = this._item;
    const allPowers = [...this._selectedPowers.values(), ...this._customPowers];
    const updates = {};
    const effectDocs = [];
    let powerCost = 0;

    const userInputs = {};
    for (const power of allPowers) {
      powerCost += power.cost || 0;
      const input = power._userInput || "";
      if (power.id) userInputs[power.id] = input;

      const changes = (power.effects || []).map(e => ({
        key: e.key.replace("{input}", input),
        mode: e.mode,
        value: String(e.value).replace("{input}", input),
      }));
      effectDocs.push({
        name: `Relic: ${power.name}${input ? ` (${input})` : ""}`,
        icon: item.img || "icons/svg/item-bag.svg",
        changes,
        disabled: false,
        transfer: true,
        flags: { [MODULE_ID]: { relicPower: power.id || power.name, managed: true } },
      });
    }

    const relicName = this._computeName();
    updates.name = relicName;
    updates[`flags.${MODULE_ID}.relicForge`] = {
      forged: true,
      powers: allPowers.map(p => p.id || p.name),
      userInputs,
      powerCost,
      forgedAt: Date.now(),
    };

    await item.update(updates);
    if (effectDocs.length > 0) {
      await item.createEmbeddedDocuments("ActiveEffect", effectDocs);
    }

    const powerList = allPowers.map(p => p.name).join(", ");
    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker(),
      content: `<div class="vagabond-chat-card-v2" data-card-type="generic">
        <div class="card-body">
          <header class="card-header">
            <div class="header-icon">
              <img src="${item.img || "icons/svg/item-bag.svg"}" alt="${relicName}">
            </div>
            <div class="header-info">
              <h3 class="header-title">Relic Forged</h3>
              <div class="metadata-tags-row">
                <div class="meta-tag"><span>${relicName}</span></div>
              </div>
            </div>
          </header>
          <section class="content-body">
            <div class="card-description" style="text-align:center; padding:4px 0;">
              <p><strong>Powers:</strong> ${powerList}</p>
              <p style="color:#888;">Total power cost: ${powerCost}g</p>
            </div>
          </section>
        </div>
      </div>`,
    });

    ui.notifications.info(`${relicName} has been forged!`);
    this._item = null;
    this._itemData = null;
    this._selectedPowers.clear();
    this._customPowers = [];
    this.close();
  }
}
