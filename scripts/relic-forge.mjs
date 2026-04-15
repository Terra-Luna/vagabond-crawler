/**
 * Vagabond Crawler — Relic Forge
 *
 * GM tool to upgrade equipment items into magical relics by selecting
 * powers, computing costs, and generating Active Effects.
 * 3-column layout: Power Browser | Base Item + Config | Selected Powers
 */

import { MODULE_ID } from "./vagabond-crawler.mjs";
import { RELIC_POWERS, RELIC_POWER_CATEGORIES, METAL_DISPLAY_NAMES, getRelicPower, getPowersByCategory } from "./relic-powers.mjs";

/* -------------------------------------------- */
/*  Relic Forge Singleton                       */
/* -------------------------------------------- */

export const RelicForge = {
  _app: null,

  init() {
    console.log(`${MODULE_ID} | Relic Forge initialized (${RELIC_POWERS.length} powers).`);
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
    this._compendiumCache = null;
    // Base-item browser state (alternative to drag/drop).
    this._browserQuery = "";
    this._browserItemCache = null; // lazy-populated on first render
  }

  /* ---- Data for template ---- */

  async _prepareContext() {
    // Load compendium names for dropdown powers (cached after first load)
    if (!this._compendiumCache) {
      this._compendiumCache = {};
      this._compendiumCache.bestiary = [];
      for (const packId of ["vagabond.bestiary", "vagabond.humanlike"]) {
        const pack = game.packs.get(packId);
        if (pack) {
          const index = await pack.getIndex();
          for (const entry of index) {
            if (!this._compendiumCache.bestiary.includes(entry.name)) {
              this._compendiumCache.bestiary.push(entry.name);
            }
          }
        }
      }
      this._compendiumCache.bestiary.sort();

      this._compendiumCache.spells = [];
      const spellPack = game.packs.get("vagabond.spells");
      if (spellPack) {
        const index = await spellPack.getIndex();
        for (const entry of index) {
          this._compendiumCache.spells.push(entry.name);
        }
        this._compendiumCache.spells.sort();
      }
    }

    // Warm the browser cache (cheap after first render)
    await this._loadBrowserItems();

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
    const filtered = getPowersByCategory(this._categoryFilter);
    const powers = filtered.map(p => ({
      ...p,
      selected: this._selectedPowers.has(p.id),
      costDisplay: p.cost > 0 ? `${p.cost.toLocaleString()}g` : (p.cost === 0 ? "Free" : "Special"),
    }));

    // Selected powers (right panel) — resolve input options
    const selectedPowers = Array.from(this._selectedPowers.values()).map(p => {
      const resolved = {
        ...p,
        costDisplay: p.cost > 0 ? `${p.cost.toLocaleString()}g` : (p.cost === 0 ? "Free" : "Special"),
        userInput: p._userInput || "",
        isSelect: p.inputType === "select" || p.inputType === "compendium",
      };

      // Resolve input options
      if (p.inputType === "compendium" && p.inputSource) {
        resolved.inputOptions = this._compendiumCache?.[p.inputSource] || [];
      } else if (p.inputType === "select" && p.inputOptions) {
        resolved.inputOptions = p.inputOptions;
      }

      return resolved;
    });

    const customPowers = this._customPowers.map((cp, i) => ({ ...cp, index: i }));

    // Base item
    let baseItem = null;
    let baseCostDisplay = "-";
    let baseMetalDisplay = "Common";
    if (this._item) {
      const metal = this._itemData.system?.metal || "none";
      baseItem = {
        img: this._itemData.img || "icons/svg/item-bag.svg",
        name: this._itemData.name,
        type: this._itemData.system?.equipmentType || "gear",
        metal: (metal !== "none" && metal !== "common") ? (METAL_DISPLAY_NAMES[metal] || metal) : "Common",
      };
      baseCostDisplay = this._itemData.system?.costDisplay || "-";
    }

    // Base-item browser (alternative to drag/drop). Only build when no
    // base is selected yet — the <unless baseItem> guard in the template
    // hides the browser while an item is active.
    let browserResults = [];
    let browserEmptyMessage = "Loading…";
    if (!this._item && this._browserItemCache) {
      const q = (this._browserQuery ?? "").trim().toLowerCase();
      browserResults = this._browserItemCache
        .filter((it) => !q || it.name.toLowerCase().includes(q))
        .slice(0, 200);
      browserEmptyMessage = q ? `No items match "${this._browserQuery}".` : "No equipment found in compendium.";
    }

    return {
      baseItem,
      baseCostDisplay,
      baseMetalDisplay,
      categories,
      powers,
      selectedPowers,
      customPowers,
      canForge: this._item && (this._selectedPowers.size > 0 || this._customPowers.length > 0),
      previewName: this._computeName(),
      totalCostDisplay: this._computeCostDisplay(),
      browserQuery: this._browserQuery,
      browserResults,
      browserEmptyMessage,
    };
  }

  /** Lazy-load every equipment / weapon entry from the standard Vagabond
   *  packs so the browser has something to search against. One-shot cache
   *  per app instance; sort alphabetically. */
  async _loadBrowserItems() {
    if (this._browserItemCache) return this._browserItemCache;
    const out = [];
    const packs = [
      { id: "vagabond.weapons", kind: "Weapon" },
      { id: "vagabond.armor",   kind: "Armor"  },
      { id: "vagabond.gear",    kind: "Gear"   },
    ];
    for (const { id, kind } of packs) {
      const pack = game.packs.get(id);
      if (!pack) continue;
      const index = await pack.getIndex();
      for (const e of index) {
        out.push({
          uuid: `Compendium.${id}.Item.${e._id}`,
          name: e.name,
          img:  e.img || "icons/svg/item-bag.svg",
          kind,
        });
      }
    }
    out.sort((a, b) => a.name.localeCompare(b.name));
    this._browserItemCache = out;
    return out;
  }

  /* ---- Name computation ---- */

  _computeName() {
    const baseName = this._itemData?.name || "[Item]";
    const metal = this._itemData?.system?.metal || "none";
    const prefixes = [];
    const suffixes = [];
    let wrapTemplate = null;

    const allPowers = [...this._selectedPowers.values(), ...this._customPowers];
    for (const power of allPowers) {
      const fmt = power.nameFormat;
      if (!fmt) {
        if (power.nameLabel) prefixes.push(power.nameLabel);
        continue;
      }

      let text = fmt.text || fmt.template || "";
      if (power.requiresInput && power._userInput) {
        text = text.replace("{input}", power._userInput);
      } else if (power.requiresInput) {
        text = text.replace("{input}", "???");
      }

      if (fmt.position === "prefix") prefixes.push(text);
      else if (fmt.position === "suffix") suffixes.push(text);
      else if (fmt.position === "wrap") wrapTemplate = text;
    }

    let name;
    if (wrapTemplate) {
      name = wrapTemplate.replace("{item}", baseName);
      if (prefixes.length) name = prefixes.join(" ") + " " + name;
      if (suffixes.length) name = name + " " + suffixes.join(" ");
    } else {
      name = [...prefixes, baseName].join(" ");
      if (suffixes.length) name = name + " " + suffixes.join(" ");
    }

    if (metal && metal !== "none" && metal !== "common") {
      name += ` (${METAL_DISPLAY_NAMES[metal] || metal})`;
    }

    return name;
  }

  _computeCostDisplay() {
    const baseCostGold = this._itemData?.system?.baseCost?.gold || this._itemData?.system?.cost?.gold || 0;
    const allPowers = [...this._selectedPowers.values(), ...this._customPowers];
    const powerCost = allPowers.reduce((sum, p) => sum + (p.cost || 0), 0);
    const metalMultiplier = this._itemData?.system?.metalMultiplier || 1;
    const totalGold = (baseCostGold * metalMultiplier) + powerCost;
    return totalGold > 0 ? `${totalGold.toLocaleString()}g` : "-";
  }

  /* ---- Event binding ---- */

  _onRender(context, options) {
    super._onRender(context, options);
    const el = this.element;
    this._renderAbort?.abort();
    this._renderAbort = new AbortController();
    const signal = this._renderAbort.signal;
    const $$ = (sel) => [...el.querySelectorAll(sel)];
    const on = (sel, evt, fn) => $$(sel).forEach(n => n.addEventListener(evt, fn, { signal }));

    // Drop zone
    const dropZone = el.querySelector(".drop-zone");
    if (dropZone) {
      dropZone.addEventListener("dragover", ev => { ev.preventDefault(); dropZone.classList.add("drag-hover"); }, { signal });
      dropZone.addEventListener("dragleave", () => dropZone.classList.remove("drag-hover"), { signal });
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
      }, { signal });
    }

    // Clear item
    el.querySelector(".clear-btn")?.addEventListener("click", () => {
      this._item = null;
      this._itemData = null;
      this._selectedPowers.clear();
      this._customPowers = [];
      this._categoryFilter = "all";
      this.render();
    }, { signal });

    // Base-item browser — search input + click-to-select rows.
    // Search filter uses in-place DOM toggling instead of re-rendering so
    // the user's typing doesn't get interrupted by focus loss.
    const browserSearch = el.querySelector(".forge-browser-search");
    if (browserSearch) {
      browserSearch.addEventListener("input", (ev) => {
        this._browserQuery = ev.currentTarget.value ?? "";
        const q = this._browserQuery.trim().toLowerCase();
        const rows = el.querySelectorAll(".forge-browser-row");
        let shown = 0;
        rows.forEach((row) => {
          const name = row.querySelector(".forge-browser-name")?.textContent ?? "";
          const match = !q || name.toLowerCase().includes(q);
          row.toggleAttribute("hidden", !match);
          if (match) shown++;
        });
        const emptyNode = el.querySelector(".forge-browser-empty-dynamic");
        const list = el.querySelector(".forge-browser-list");
        if (!shown) {
          if (!emptyNode && list) {
            const e = document.createElement("div");
            e.className = "forge-browser-empty forge-browser-empty-dynamic";
            e.textContent = `No items match "${this._browserQuery}".`;
            list.appendChild(e);
          }
        } else if (emptyNode) {
          emptyNode.remove();
        }
      }, { signal });
    }

    on(".forge-browser-row", "click", async (ev) => {
      const uuid = ev.currentTarget.dataset.uuid;
      const item = await fromUuid(uuid);
      if (!item || item.type !== "equipment") {
        ui.notifications.warn("Only equipment items can be forged into relics.");
        return;
      }
      this.loadItem(item);
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
        if (power) this._selectedPowers.set(id, foundry.utils.deepClone(power));
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
        changes: [{ key, mode, value }],
        flags: { relicPower: `custom-${name.toLowerCase().replace(/\s+/g, "-")}` },
      });

      if (nameInput) nameInput.value = "";
      if (nameLabelInput) nameLabelInput.value = "";
      if (keyInput) keyInput.value = "";
      if (valueInput) valueInput.value = "";
      this.render();
    }, { signal });

    // Forge button
    el.querySelector(".forge-btn")?.addEventListener("click", () => this._forgeRelic(), { signal });
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

      const changes = (power.changes || []).map(e => ({
        key: e.key.replace("{input}", input),
        mode: e.mode,
        value: String(e.value).replace("{input}", input),
      }));

      // Note: addProperties are handled below by directly updating the item's properties array

      // Build flags — merge power.flags into module namespace, replace {input}
      const moduleFlags = { relicPower: power.id || power.name, managed: true };
      if (power.flags) {
        for (const [k, v] of Object.entries(power.flags)) {
          moduleFlags[k] = typeof v === "string" ? v.replace("{input}", input) : v;
        }
      }

      effectDocs.push({
        name: `Relic: ${power.name}${input ? ` (${input})` : ""}`,
        icon: item.img || "icons/svg/item-bag.svg",
        changes,
        // Gate the effect on the item's equipped state. transfer:true copies
        // the effect onto the actor whenever the item is owned — without
        // this guard, a relic-forged armor would grant its +1 to Armor even
        // when sitting in the hero's backpack. We start disabled if the
        // item isn't currently equipped; a hook (registered in init())
        // flips disabled when the equipped flag toggles.
        disabled: !item.system?.equipped,
        transfer:  true,
        flags: { [MODULE_ID]: { ...moduleFlags, equipGated: true } },
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

    // Directly add properties from Ace powers to the item's properties array
    const existingProps = new Set(item.system.properties || []);
    for (const power of allPowers) {
      if (power.addProperties) {
        for (const prop of power.addProperties) existingProps.add(prop);
      }
    }
    updates["system.properties"] = Array.from(existingProps);

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
              <p style="color:#888;">Total power cost: ${powerCost.toLocaleString()}g</p>
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
