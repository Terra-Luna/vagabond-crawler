/**
 * Vagabond Crawler — Loot Manager
 *
 * Build loot tables, flag existing RollTables as loot tables,
 * and assign them to NPCs. Mirrors the encounter roller pattern.
 */

import { MODULE_ID } from "./vagabond-crawler.mjs";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

const LOOT_TABLE_FLAG = "isLootTable";

let _app = null;

export const LootManager = {
  init() {
    console.log(`${MODULE_ID} | Loot Manager initialized.`);
  },

  open() {
    if (!game.user.isGM) {
      ui.notifications.warn("Only the GM can manage loot tables.");
      return;
    }
    if (!_app) _app = new LootManagerApp();
    _app.render(true);
  },
};

/* -------------------------------------------- */

class LootManagerApp extends HandlebarsApplicationMixin(ApplicationV2) {
  static DEFAULT_OPTIONS = {
    id: "vagabond-crawler-loot-manager",
    window: { title: "Loot Manager", resizable: true },
    position: { width: 700, height: "auto" },
  };

  static PARTS = {
    form: { template: "modules/vagabond-crawler/templates/loot-manager.hbs" },
  };

  constructor(...args) {
    super(...args);
    this._mode = "build";
    this._tableName = "";
    this._slots = Array.from({ length: 10 }, () => null);
    this._selectedTableId = null;
  }

  async _prepareContext() { return this.getData(); }

  getData() {
    const isBuildMode = this._mode === "build";

    // Build slots
    const slots = this._slots.map((s, i) => ({
      index: i, number: i + 1,
      name: s?.name || null, uuid: s?.uuid || null,
      img: s?.img || null, weight: s?.weight ?? 1,
    }));

    // Loot tables (flagged)
    const lootTables = game.tables
      .filter(t => t.getFlag(MODULE_ID, LOOT_TABLE_FLAG))
      .map(t => ({ id: t.id, uuid: t.uuid, name: t.name, formula: t.formula }));

    // All world tables grouped by folder (same as encounter roller)
    const excluded = JSON.parse(game.settings.get(MODULE_ID, "excludedTableFolders") || "[]");
    const worldTableGroups = this._getWorldTableGroups(excluded);
    const hasWorldTables = worldTableGroups.some(g => g.tables.length > 0);

    // Auto-select first table if none selected
    if (!this._selectedTableId && hasWorldTables) {
      for (const g of worldTableGroups) {
        if (g.tables.length > 0) { this._selectedTableId = g.tables[0].id; break; }
      }
    }

    // Mark selected + loot flag
    for (const g of worldTableGroups) {
      for (const t of g.tables) {
        t.selected = t.id === this._selectedTableId;
        t.isLoot = !!game.tables.get(t.id)?.getFlag(MODULE_ID, LOOT_TABLE_FLAG);
      }
    }

    // Preview
    let selectedTablePreview = null;
    if (!isBuildMode && this._selectedTableId) {
      const table = game.tables.get(this._selectedTableId);
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

    // Scene NPCs for assignment
    const sceneActorIds = new Set(
      canvas.tokens?.placeables
        .filter(t => t.actor?.type === "npc")
        .map(t => t.actor.id) || []
    );
    const npcs = game.actors
      .filter(a => a.type === "npc" && sceneActorIds.has(a.id))
      .map(a => ({
        id: a.id, name: a.name, img: a.img,
        currentTable: a.getFlag(MODULE_ID, "lootTable") || "",
        dropChance: a.getFlag(MODULE_ID, "lootDropChance") ?? -1,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    return {
      isBuildMode,
      tableName: this._tableName,
      slots,
      lootTables,
      hasLootTables: lootTables.length > 0,
      worldTableGroups,
      hasWorldTables,
      selectedTablePreview,
      npcs,
    };
  }

  _getWorldTableGroups(excludedFolderIds) {
    const folders = game.folders.filter(f => f.type === "RollTable" && !excludedFolderIds.includes(f.id));
    const groups = [];

    // Ungrouped tables
    const ungrouped = game.tables.filter(t => !t.folder);
    if (ungrouped.length > 0) {
      groups.push({ label: null, tables: ungrouped.map(t => ({ id: t.id, name: t.name })) });
    }

    // Folder groups
    for (const folder of folders.sort((a, b) => a.name.localeCompare(b.name))) {
      const tables = game.tables.filter(t => t.folder?.id === folder.id);
      if (tables.length > 0) {
        groups.push({ label: folder.name, tables: tables.map(t => ({ id: t.id, name: t.name })) });
      }
    }

    return groups;
  }

  /* ---- Events ---- */

  _onRender(context, options) {
    super._onRender(context, options);
    const el = this.element;
    const $ = (sel) => el.querySelector(sel);
    const on = (sel, evt, fn) => [...el.querySelectorAll(sel)].forEach(n => n.addEventListener(evt, fn));

    // Tabs
    on(".tab-btn", "click", ev => {
      this._mode = ev.currentTarget.dataset.mode;
      this.render();
    });

    // Table name
    const nameInput = $(".table-name-input");
    if (nameInput) nameInput.addEventListener("input", () => { this._tableName = nameInput.value; });

    // Slot drag-drop
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

    // Weight inputs
    on(".appearing-input", "change", ev => {
      const idx = parseInt(ev.currentTarget.dataset.index);
      if (this._slots[idx]) this._slots[idx].weight = parseInt(ev.currentTarget.value) || 1;
    });

    // Clear slot
    on(".clear-slot", "click", ev => {
      ev.stopPropagation();
      this._slots[parseInt(ev.currentTarget.dataset.index)] = null;
      this.render();
    });

    // Save
    $(".save-table")?.addEventListener("click", () => this._saveAsLootTable());

    // Table select
    $(".world-table-select")?.addEventListener("change", ev => {
      this._selectedTableId = ev.currentTarget.value;
      this.render();
    });

    // Toggle loot flag
    $(".toggle-loot-flag")?.addEventListener("click", async () => {
      if (!this._selectedTableId) return;
      const table = game.tables.get(this._selectedTableId);
      if (!table) return;
      const isLoot = table.getFlag(MODULE_ID, LOOT_TABLE_FLAG);
      if (isLoot) {
        await table.unsetFlag(MODULE_ID, LOOT_TABLE_FLAG);
        ui.notifications.info(`"${table.name}" is no longer a loot table.`);
      } else {
        await table.setFlag(MODULE_ID, LOOT_TABLE_FLAG, true);
        ui.notifications.info(`"${table.name}" marked as loot table.`);
      }
      this.render();
    });

    // NPC table assignment
    on(".npc-table-select", "change", async ev => {
      const actorId = ev.currentTarget.dataset.actorId;
      const tableUuid = ev.currentTarget.value;
      const actor = game.actors.get(actorId);
      if (!actor) return;
      if (tableUuid) {
        await actor.setFlag(MODULE_ID, "lootTable", tableUuid);
      } else {
        await actor.unsetFlag(MODULE_ID, "lootTable");
      }
    });

    // NPC drop chance
    on(".npc-chance-input", "change", async ev => {
      const actorId = ev.currentTarget.dataset.actorId;
      const chance = parseInt(ev.currentTarget.value);
      const actor = game.actors.get(actorId);
      if (!actor) return;
      if (chance < 0) {
        await actor.unsetFlag(MODULE_ID, "lootDropChance");
      } else {
        await actor.setFlag(MODULE_ID, "lootDropChance", chance);
      }
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
      flags: { [MODULE_ID]: { [LOOT_TABLE_FLAG]: true } },
    });

    ui.notifications.info(`Loot table "${name}" created.`);
    this._tableName = "";
    this._slots = Array.from({ length: 10 }, () => null);
    this._mode = "tables";
    this._selectedTableId = table.id;
    this.render();
  }
}
