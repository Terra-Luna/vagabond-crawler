/**
 * Vagabond Crawler — Loot Manager
 *
 * Build loot tables and assign them to NPCs with an actor-browser-style
 * filterable NPC list (source, type, TL range, search, sortable columns).
 */

import { MODULE_ID } from "./vagabond-crawler.mjs";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

const NPC_SOURCES = [
  { id: "world",             label: "World NPCs" },
  { id: "scene",             label: "Scene NPCs" },
  { id: "vagabond.bestiary", label: "Bestiary" },
  { id: "vagabond.humanlike", label: "Humanlike" },
];

let _app = null;

export const LootManager = {
  registerSettings() {
    // Stores loot config for compendium NPCs: { "compendiumEntryId": { table: "RollTable.xxx", chance: 75 } }
    game.settings.register(MODULE_ID, "compendiumLootConfig", {
      scope: "world", config: false, type: Object, default: {},
    });
  },

  init() { console.log(`${MODULE_ID} | Loot Manager initialized.`); },

  open() {
    if (!game.user.isGM) { ui.notifications.warn("Only the GM can manage loot tables."); return; }
    if (!_app) _app = new LootManagerApp();
    _app.render(true);
  },

  /**
   * Get loot config for an NPC — checks actor flags first, then compendium setting.
   * Used by loot-drops.mjs at combat end.
   */
  getLootConfig(actor) {
    // World actor flags take priority
    const flagTable = actor.getFlag(MODULE_ID, "lootTable");
    const flagChance = actor.getFlag(MODULE_ID, "lootDropChance");
    if (flagTable !== undefined || flagChance !== undefined) {
      return { table: flagTable || null, chance: flagChance ?? -1 };
    }

    // Check compendium config by source ID (the compendium entry this actor was imported from)
    const sourceId = actor.flags?.core?.sourceId;
    if (sourceId) {
      const config = game.settings.get(MODULE_ID, "compendiumLootConfig");
      const entry = config[sourceId];
      if (entry) return { table: entry.table || null, chance: entry.chance ?? -1 };
    }

    // Check by actor name match in compendium config (fallback for unlinked tokens)
    const config = game.settings.get(MODULE_ID, "compendiumLootConfig");
    for (const [key, entry] of Object.entries(config)) {
      if (entry.name === actor.name) {
        return { table: entry.table || null, chance: entry.chance ?? -1 };
      }
    }

    return { table: null, chance: -1 };
  },
};

/* -------------------------------------------- */

class LootManagerApp extends HandlebarsApplicationMixin(ApplicationV2) {
  static DEFAULT_OPTIONS = {
    id: "vagabond-crawler-loot-manager",
    window: { title: "Loot Manager", resizable: true },
    position: { width: 900, height: 580 },
  };

  static PARTS = {
    form: { template: "modules/vagabond-crawler/templates/loot-manager.hbs" },
  };

  constructor(...args) {
    super(...args);
    this._mode = "build";
    this._tableName = "";
    this._slots = Array.from({ length: 10 }, () => null);
    this._sourceFilter = "scene";
    this._searchName = "";
    this._selectedAssignTableUuid = "";
    this._sortColumn = "name";
    this._sortAsc = true;
    this._typeFilter = "";
    this._tlMin = "";
    this._tlMax = "";
    this._npcCache = {};
  }

  async _prepareContext() { return this.getData(); }

  async getData() {
    const isBuildMode = this._mode === "build";

    // Build slots
    const slots = this._slots.map((s, i) => ({
      index: i, number: i + 1,
      name: s?.name || null, uuid: s?.uuid || null,
      img: s?.img || null, weight: s?.weight ?? 1,
    }));

    // All world RollTables grouped by folder
    const tableGroups = this._getTableGroups();
    const flatTables = tableGroups.flatMap(g => g.tables);

    // Sources
    const sources = NPC_SOURCES.map(s => ({
      ...s, selected: s.id === this._sourceFilter,
    }));

    // NPCs
    let npcs = await this._getNPCsForSource(this._sourceFilter);

    // Type filter
    if (this._typeFilter) {
      npcs = npcs.filter(n => n.beingType === this._typeFilter);
    }

    // TL range filter
    const tlMin = this._tlMin !== "" ? parseFloat(this._tlMin) : null;
    const tlMax = this._tlMax !== "" ? parseFloat(this._tlMax) : null;
    if (tlMin !== null) npcs = npcs.filter(n => n.threatLevel >= tlMin);
    if (tlMax !== null) npcs = npcs.filter(n => n.threatLevel <= tlMax);

    // Collect unique being types for filter dropdown
    const allNpcs = await this._getNPCsForSource(this._sourceFilter);
    const beingTypes = [...new Set(allNpcs.map(n => n.beingType).filter(t => t && t !== "—"))].sort();

    // Sort
    const col = this._sortColumn;
    const dir = this._sortAsc ? 1 : -1;
    npcs.sort((a, b) => {
      const av = a[col], bv = b[col];
      if (typeof av === "number" && typeof bv === "number") return (av - bv) * dir;
      return String(av || "").localeCompare(String(bv || "")) * dir;
    });

    // Enrich with current loot assignments
    const compConfig = game.settings.get(MODULE_ID, "compendiumLootConfig");
    npcs = npcs.map(n => {
      const actor = game.actors.get(n.id);
      const isWorldActor = !!actor;

      let currentTable = "";
      let dropChance = -1;

      if (isWorldActor) {
        currentTable = actor.getFlag(MODULE_ID, "lootTable") || "";
        dropChance = actor.getFlag(MODULE_ID, "lootDropChance") ?? -1;
      } else if (n.isCompendium) {
        // Compendium NPC — check setting by compendium UUID
        const compUuid = `Compendium.${n.packId}.Actor.${n.id}`;
        const entry = compConfig[compUuid];
        if (entry) {
          currentTable = entry.table || "";
          dropChance = entry.chance ?? -1;
        }
      }

      return {
        ...n,
        isWorldActor,
        currentTable,
        dropChance,
        compUuid: n.isCompendium ? `Compendium.${n.packId}.Actor.${n.id}` : null,
        tableOptions: flatTables.map(t => ({
          uuid: t.uuid, name: t.name,
          selected: t.uuid === currentTable,
        })),
      };
    });

    // Preview
    let selectedTablePreview = null;
    if (this._selectedAssignTableUuid) {
      const tableId = this._selectedAssignTableUuid.split(".").pop();
      const table = game.tables.get(tableId);
      if (table) {
        selectedTablePreview = {
          name: table.name, formula: table.formula,
          rows: table.results.map(r => ({
            range: `${r.range[0]}–${r.range[1]}`,
            name: r.text || "???",
            img: r.img || null,
          })),
        };
      }
    }

    return {
      isBuildMode, tableName: this._tableName, slots,
      tableGroups, hasWorldTables: flatTables.length > 0,
      sources, searchName: this._searchName,
      npcs, selectedTablePreview,
      beingTypes, typeFilter: this._typeFilter,
      tlMin: this._tlMin, tlMax: this._tlMax,
    };
  }

  _getTableGroups() {
    let excluded;
    try { excluded = JSON.parse(game.settings.get(MODULE_ID, "excludedLootTableFolders") || "[]"); }
    catch { excluded = []; }
    const groups = [];

    // ── Built-in Level Loot (always available) ──
    const levelTables = [];
    for (let i = 1; i <= 10; i++) {
      levelTables.push({ id: `loot-level:${i}`, uuid: `loot-level:${i}`, name: `Level ${i} Loot${i === 1 ? " (p.186)" : ""}${i === 10 ? "+" : ""}` });
    }
    groups.push({ label: "Loot Generator", tables: levelTables });

    // Ungrouped
    const ungrouped = game.tables.filter(t => !t.folder);
    if (ungrouped.length > 0) {
      groups.push({ label: null, tables: ungrouped.map(t => ({ id: t.id, uuid: t.uuid, name: t.name })) });
    }

    // By folder
    const folders = game.folders.filter(f => f.type === "RollTable" && !excluded.includes(f.id));
    for (const folder of folders.sort((a, b) => a.name.localeCompare(b.name))) {
      const tables = game.tables.filter(t => t.folder?.id === folder.id);
      if (tables.length > 0) {
        groups.push({ label: folder.name, tables: tables.map(t => ({ id: t.id, uuid: t.uuid, name: t.name })) });
      }
    }
    return groups;
  }

  async _openLootFolderExclusions() {
    const tableFolders = game.folders.filter(f => f.type === "RollTable");
    if (!tableFolders.length) { ui.notifications.info("No table folders found."); return; }

    let excludedIds;
    try { excludedIds = new Set(JSON.parse(game.settings.get(MODULE_ID, "excludedLootTableFolders"))); }
    catch { excludedIds = new Set(); }

    const checkboxes = tableFolders
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(f => `<label style="display:flex;align-items:center;gap:6px;padding:3px 0;">
        <input type="checkbox" name="folder-${f.id}" value="${f.id}" ${excludedIds.has(f.id) ? "checked" : ""} />
        <span>${f.name} <span style="color:#888;">(${game.tables.filter(t => t.folder?.id === f.id).length} tables)</span></span>
      </label>`).join("");

    const result = await foundry.applications.api.DialogV2.prompt({
      window: { title: "Filter Loot Table Folders" },
      content: `<div style="font-family:var(--vcb-font);font-size:13px;padding:4px;">
        <p style="color:#7a7060;margin-bottom:8px;">Check folders to <strong>hide</strong> from the loot table dropdown:</p>
        ${checkboxes}
      </div>`,
      ok: {
        label: "Save",
        icon: "fas fa-save",
        callback: (event, button) => {
          const checked = [...button.form.querySelectorAll('input[type="checkbox"]:checked')];
          return checked.map(cb => cb.value);
        },
      },
      rejectClose: false,
    });

    if (result) {
      await game.settings.set(MODULE_ID, "excludedLootTableFolders", JSON.stringify(result));
      this.render();
    }
  }

  async _getNPCsForSource(sourceId) {
    const mapActor = (a) => ({
      id: a.id, name: a.name, img: a.img,
      nameLower: a.name.toLowerCase(),
      beingType: a.system?.beingType || "—",
      threatLevel: a.system?.threatLevel ?? 0,
      threatLevelDisplay: a.system?.threatLevelFormatted ?? a.system?.threatLevel ?? "—",
    });

    if (sourceId === "world") {
      return game.actors.filter(a => a.type === "npc").map(mapActor);
    }

    if (sourceId === "scene") {
      const seen = new Set();
      return (canvas.tokens?.placeables || [])
        .filter(t => t.actor?.type === "npc")
        .map(t => {
          if (seen.has(t.actor.id)) return null;
          seen.add(t.actor.id);
          return mapActor(t.actor);
        })
        .filter(Boolean);
    }

    // Compendium
    if (!this._npcCache[sourceId]) {
      const pack = game.packs.get(sourceId);
      if (!pack) return [];
      const index = await pack.getIndex({ fields: ["img", "system.beingType", "system.threatLevel", "system.threatLevelFormatted"] });
      this._npcCache[sourceId] = index.map(entry => ({
        id: entry._id, name: entry.name,
        img: entry.img || "icons/svg/mystery-man.svg",
        nameLower: entry.name.toLowerCase(),
        beingType: entry.system?.beingType || "—",
        threatLevel: entry.system?.threatLevel ?? 0,
        threatLevelDisplay: entry.system?.threatLevelFormatted ?? entry.system?.threatLevel ?? "—",
        isCompendium: true, packId: sourceId,
      }));
    }
    return [...this._npcCache[sourceId]]; // return copy so filters don't mutate cache
  }

  /* ---- Events ---- */

  _onRender(context, options) {
    super._onRender(context, options);
    const el = this.element;
    this._renderAbort?.abort();
    this._renderAbort = new AbortController();
    const signal = this._renderAbort.signal;
    const $ = (sel) => el.querySelector(sel);
    const on = (sel, evt, fn) => [...el.querySelectorAll(sel)].forEach(n => n.addEventListener(evt, fn, { signal }));

    // Tabs
    on(".tab-btn", "click", ev => { this._mode = ev.currentTarget.dataset.mode; this.render(); });

    // Filter loot table folders
    const filterBtn = $(".loot-filter-folders-btn");
    if (filterBtn) filterBtn.addEventListener("click", () => this._openLootFolderExclusions(), { signal });

    // ── Build tab ──
    const nameInput = $(".table-name-input");
    if (nameInput) nameInput.addEventListener("input", () => { this._tableName = nameInput.value; }, { signal });

    on(".encounter-slot", "dragover", ev => ev.preventDefault());
    on(".encounter-slot", "drop", async ev => {
      ev.preventDefault();
      const idx = parseInt(ev.currentTarget.dataset.index);
      try {
        const data = JSON.parse(ev.dataTransfer.getData("text/plain"));
        if (data.type !== "Item") { ui.notifications.warn("Drop an item here."); return; }
        const item = await fromUuid(data.uuid);
        if (!item) return;
        this._slots[idx] = { name: item.name, uuid: data.uuid, img: item.img, weight: 1 };
        this.render();
      } catch (e) { console.error(`${MODULE_ID} | Drop error:`, e); }
    });

    on(".appearing-input", "change", ev => {
      const idx = parseInt(ev.currentTarget.dataset.index);
      if (this._slots[idx]) this._slots[idx].weight = parseInt(ev.currentTarget.value) || 1;
    });

    on(".clear-slot", "click", ev => {
      ev.stopPropagation();
      this._slots[parseInt(ev.currentTarget.dataset.index)] = null;
      this.render();
    });

    $(".save-table")?.addEventListener("click", () => this._saveAsLootTable(), { signal });

    // ── NPC Loot tab ──

    // Source filter
    $(".loot-source-filter")?.addEventListener("change", ev => {
      this._sourceFilter = ev.currentTarget.value;
      this._typeFilter = ""; // reset type filter on source change
      this.render();
    }, { signal });

    // Search — filter in DOM
    const searchInput = $(".loot-search-input");
    if (searchInput) {
      searchInput.value = this._searchName;
      searchInput.addEventListener("input", () => {
        this._searchName = searchInput.value;
        const search = this._searchName.toLowerCase();
        el.querySelectorAll(".loot-npc-row").forEach(row => {
          const name = row.querySelector(".loot-npc-name")?.textContent?.toLowerCase() || "";
          row.style.display = search && !name.includes(search) ? "none" : "";
        });
      }, { signal });
    }

    // Type filter
    $(".loot-type-filter")?.addEventListener("change", ev => {
      this._typeFilter = ev.currentTarget.value;
      this.render();
    }, { signal });

    // TL range
    $(".loot-tl-min")?.addEventListener("change", ev => {
      this._tlMin = ev.currentTarget.value;
      this.render();
    }, { signal });
    $(".loot-tl-max")?.addEventListener("change", ev => {
      this._tlMax = ev.currentTarget.value;
      this.render();
    }, { signal });

    // Sortable columns
    on(".loot-sortable", "click", ev => {
      const col = ev.currentTarget.dataset.sort;
      if (this._sortColumn === col) this._sortAsc = !this._sortAsc;
      else { this._sortColumn = col; this._sortAsc = true; }
      this.render();
    });

    // Select all
    $(".loot-select-all")?.addEventListener("change", ev => {
      const checked = ev.currentTarget.checked;
      el.querySelectorAll(".npc-select").forEach(cb => { cb.checked = checked; });
    }, { signal });

    // Assign table dropdown — updates preview, preserve selection
    const assignSelect = $(".loot-assign-table");
    if (assignSelect) {
      if (this._selectedAssignTableUuid) assignSelect.value = this._selectedAssignTableUuid;
      assignSelect.addEventListener("change", ev => {
        this._selectedAssignTableUuid = ev.currentTarget.value;
        this.render();
      }, { signal });
    }

    // Apply to selected — handles both world and compendium NPCs
    $(".loot-apply-btn")?.addEventListener("click", async () => {
      const tableUuid = $(".loot-assign-table")?.value || "";
      const checked = [...el.querySelectorAll(".npc-select:checked")];
      if (!checked.length) { ui.notifications.warn("Select NPCs first."); return; }

      const config = foundry.utils.deepClone(game.settings.get(MODULE_ID, "compendiumLootConfig"));
      let configChanged = false;

      for (const cb of checked) {
        const actorId = cb.dataset.actorId;
        const compUuid = cb.dataset.compUuid;
        const actor = game.actors.get(actorId);

        if (actor) {
          if (tableUuid) await actor.setFlag(MODULE_ID, "lootTable", tableUuid);
          else await actor.unsetFlag(MODULE_ID, "lootTable");
        } else if (compUuid) {
          if (!config[compUuid]) config[compUuid] = {};
          const row = cb.closest(".loot-npc-row");
          config[compUuid].table = tableUuid || "";
          config[compUuid].name = row?.querySelector(".loot-npc-name")?.textContent?.trim();
          configChanged = true;
        }
      }

      if (configChanged) await game.settings.set(MODULE_ID, "compendiumLootConfig", config);
      ui.notifications.info(`Assigned table to ${checked.length} NPC(s).`);
      this.render();
    }, { signal });

    // Per-NPC table select — works for both world and compendium NPCs
    on(".npc-table-select", "change", async ev => {
      const actorId = ev.currentTarget.dataset.actorId;
      const compUuid = ev.currentTarget.dataset.compUuid;
      const tableUuid = ev.currentTarget.value;

      const actor = game.actors.get(actorId);
      if (actor) {
        // World actor — use flags
        if (tableUuid) await actor.setFlag(MODULE_ID, "lootTable", tableUuid);
        else await actor.unsetFlag(MODULE_ID, "lootTable");
      } else if (compUuid) {
        // Compendium NPC — use setting
        const config = foundry.utils.deepClone(game.settings.get(MODULE_ID, "compendiumLootConfig"));
        if (tableUuid) {
          if (!config[compUuid]) config[compUuid] = {};
          config[compUuid].table = tableUuid;
          config[compUuid].name = ev.currentTarget.closest(".loot-npc-row")?.querySelector(".loot-npc-name")?.textContent?.trim();
        } else {
          if (config[compUuid]) delete config[compUuid].table;
        }
        await game.settings.set(MODULE_ID, "compendiumLootConfig", config);
      }
    });

    // Per-NPC drop chance — works for both world and compendium NPCs
    on(".npc-chance-input", "change", async ev => {
      const actorId = ev.currentTarget.dataset.actorId;
      const compUuid = ev.currentTarget.dataset.compUuid;
      const chance = parseInt(ev.currentTarget.value);

      const actor = game.actors.get(actorId);
      if (actor) {
        if (chance >= 0) await actor.setFlag(MODULE_ID, "lootDropChance", chance);
        else await actor.unsetFlag(MODULE_ID, "lootDropChance");
      } else if (compUuid) {
        const config = foundry.utils.deepClone(game.settings.get(MODULE_ID, "compendiumLootConfig"));
        if (!config[compUuid]) config[compUuid] = {};
        config[compUuid].chance = chance;
        await game.settings.set(MODULE_ID, "compendiumLootConfig", config);
      }
    });

    // Double-click NPC name or image to open actor sheet (world or compendium)
    el.querySelectorAll(".loot-npc-row").forEach(row => {
      const nameCell = row.querySelector(".loot-npc-name");
      const imgCell = row.querySelector(".loot-npc-img");
      const handler = async (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        const actorId = row.dataset.actorId;
        const compUuid = row.dataset.compUuid;

        const actor = game.actors.get(actorId);
        if (actor) { actor.sheet.render(true); return; }

        if (compUuid) {
          const doc = await fromUuid(compUuid);
          if (doc) doc.sheet.render(true);
        }
      };
      if (nameCell) nameCell.addEventListener("dblclick", handler, { signal });
      if (imgCell) imgCell.addEventListener("dblclick", handler, { signal });
    });
  }

  /* ---- Save ---- */

  async _saveAsLootTable() {
    const filled = this._slots.filter(s => s !== null);
    if (!filled.length) { ui.notifications.warn("Add at least one item."); return; }
    const name = this._tableName.trim() || "Unnamed Loot Table";

    const totalWeight = filled.reduce((sum, s) => sum + s.weight, 0);
    const results = [];
    let rangeStart = 1;
    for (const slot of filled) {
      const rangeEnd = rangeStart + slot.weight - 1;
      results.push({
        type: CONST.TABLE_RESULT_TYPES.DOCUMENT,
        weight: slot.weight,
        range: [rangeStart, rangeEnd],
        text: slot.name,
        img: slot.img,
        documentCollection: "Item",
        documentId: slot.uuid.split(".").pop(),
        flags: { [MODULE_ID]: { itemUuid: slot.uuid } },
      });
      rangeStart = rangeEnd + 1;
    }

    const table = await RollTable.create({
      name,
      formula: `1d${totalWeight}`,
      results,
      flags: { [MODULE_ID]: { isLootTable: true } },
    });

    ui.notifications.info(`Loot table "${name}" created.`);
    this._tableName = "";
    this._slots = Array.from({ length: 10 }, () => null);
    this._selectedAssignTableUuid = table.uuid;
    this._mode = "tables";
    this.render();
  }
}
