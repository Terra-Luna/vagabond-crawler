/**
 * Vagabond Crawler — Main Entry Point
 */

import { CrawlState }       from "./crawl-state.mjs";
import { CrawlBar }         from "./crawl-bar.mjs";
import { CrawlStrip }       from "./crawl-strip.mjs";
import { MovementTracker }  from "./movement-tracker.mjs";
import { EncounterTools }   from "./encounter-tools.mjs";
import { MoraleChecker }    from "./morale-checker.mjs";
import { RestBreather }     from "./rest-breather.mjs";
import { LightTracker }     from "./light-tracker.mjs";
import { CrawlClock }       from "./crawl-clock.mjs";
import { FlankingChecker }  from "./flanking-checker.mjs";
import { AlchemyCookbook }  from "./alchemy-cookbook.mjs";
import { registerMaterialsHook, registerCountdownDamageHook, registerEffectExpirationHook, registerCountdownLinkedAEHook, registerOilBonusDamageHook, registerAlchemicalAttackHook, registerEurekaHook, registerConsumableUseHook, populateAlchemicalFolder, useConsumable, getConsumableEffect } from "./alchemy-helpers.mjs";
import { registerChatTooltips } from "./chat-tooltips.mjs";
import { registerMagicWardHook } from "./npc-abilities.mjs";

export const MODULE_ID = "vagabond-crawler";

// ── Settings ──────────────────────────────────────────────────────────────────

Hooks.once("init", () => {
  // Encounter table UUID
  game.settings.register(MODULE_ID, "encounterTableUuid", {
    scope: "world", config: false, type: String, default: ""
  });

  // Time Passes default minutes
  game.settings.register(MODULE_ID, "timePassesMinutes", {
    name: "Default Time Passes (minutes)",
    hint: "How many minutes advance when the Time Passes button is clicked.",
    scope: "world", config: true, type: Number, default: 10
  });

  // Crawl state persistence
  game.settings.register(MODULE_ID, "crawlState", {
    scope: "world", config: false, type: Object,
    default: { active: false, members: [], phase: "heroes", paused: false, turnCount: 0, elapsedMins: 0, clockId: null, clockFilled: 0 }
  });

  // Crawl clock configuration (persists across deletion / combat / new crawls)
  game.settings.register(MODULE_ID, "clockConfig", {
    scope: "world", config: false, type: Object,
    default: { size: "S", defaultPosition: "bottom-left" }
  });

  // Encounter roll result visibility
  game.settings.register(MODULE_ID, "encounterRollGMOnly", {
    name: "Encounter Roll: GM Only",
    hint: "If enabled, encounter check results are whispered to the GM only.",
    scope: "world", config: true, type: Boolean, default: true
  });

  // Encounter threshold (1-in-6 through 5-in-6) — UI via right-click popover
  game.settings.register(MODULE_ID, "encounterThreshold", {
    scope: "world", config: false, type: Number, default: 1
  });

  // Excluded RollTable folders (JSON array of folder IDs)
  game.settings.register(MODULE_ID, "excludedTableFolders", {
    scope: "world", config: false, type: String, default: "[]"
  });

  // Hide NPC names in the strip
  game.settings.register(MODULE_ID, "hideNpcNames", {
    name: "Hide NPC Names in Strip",
    hint: "Remove NPC names from the top bar entirely.",
    scope: "world", config: true, type: Boolean, default: false,
    onChange: () => { game.vagabondCrawler?.strip?.render(); },
  });

  // Auto-remove defeated tokens from strip
  game.settings.register(MODULE_ID, "autoRemoveDefeated", {
    name: "Auto-Hide Defeated Tokens",
    hint: "Defeated tokens are hidden from the strip instead of showing a skull.",
    scope: "world", config: true, type: Boolean, default: false,
    onChange: () => { game.vagabondCrawler?.strip?.render(); },
  });

  game.settings.register(MODULE_ID, "npcActionMenu", {
    name: "NPC Action Menu",
    hint: "Show a hover dropdown on NPC cards during combat with their Actions and Abilities. Players can only use actions on actors they own.",
    scope: "world", config: true, type: Boolean, default: true,
    onChange: () => { game.vagabondCrawler?.strip?.render(); },
  });

  // Flanking
  game.settings.register(MODULE_ID, "flankingEnabled", {
    name: "Flanking",
    hint: "Automatically apply Vulnerable when 2+ allies are Close to a foe that is no more than one size larger.",
    scope: "world", config: true, type: Boolean, default: true,
  });

  // Alchemist Cookbook
  game.settings.register(MODULE_ID, "alchemistCookbook", {
    name: "Alchemist Cookbook",
    hint: "Enable crafting UI for Alchemists — adds Craft tab to combat strip and right-click cookbook on Alchemy Tools.",
    scope: "world", config: true, type: Boolean, default: true,
    onChange: () => { game.vagabondCrawler?.strip?.render(); },
  });

  // Register all sub-module settings
  MovementTracker.registerSettings();
  LightTracker.registerSettings();

  // Real-time light burn
  game.settings.register(MODULE_ID, "realtimeTracking", {
    name: "Real-Time Light Burn",
    hint: "Burn light sources in real time (1 real second = 1 game second). Pauses when Foundry is paused. If disabled, light only burns when Time Passes is clicked.",
    scope: "world", config: true, type: Boolean, default: false,
    onChange: (val) => {
      const { LightTracker } = game.vagabondCrawler ?? {};
      if (!LightTracker) return;
      val ? LightTracker.startRealTime() : LightTracker.stopRealTime();
    },
  });

  console.log(`${MODULE_ID} | Initialized.`);
});

// ── Consumable Use Context Menu ──────────────────────────────────────────────

function registerConsumableContextMenu() {
  // Hook into renderApplicationV2 to add a flask "Use" button for alchemical items
  // that have consumable effects. Foundry v13 ApplicationV2 sheets fire this hook.
  Hooks.on("renderApplicationV2", (app, html) => {
    if (!app.actor) return;
    const el = html instanceof HTMLElement ? html : html?.[0] ?? app.element;
    if (!el) return;
    const actor = app.actor;

    // Find all equipment items in the inventory panel
    const itemRows = el.querySelectorAll("[data-item-id]");
    for (const row of itemRows) {
      const itemId = row.dataset.itemId;
      const actorItem = actor.items.get(itemId);
      if (!actorItem || actorItem.type !== "equipment") continue;
      const effect = getConsumableEffect(actorItem.name);
      if (!effect) continue;

      // Add a "Use" button if not already present
      if (row.querySelector(".vc-use-consumable")) continue;
      const useBtn = document.createElement("a");
      useBtn.className = "vc-use-consumable";
      useBtn.title = `Use ${actorItem.name}`;
      useBtn.innerHTML = '<i class="fas fa-flask"></i>';
      useBtn.style.cssText = "cursor:pointer; margin-left:4px; color:#4a8; font-size:12px;";
      useBtn.addEventListener("click", async (e) => {
        e.stopPropagation();
        e.preventDefault();
        await useConsumable(actor, actorItem);
        app.render();
      });

      // Insert the button near the item name or controls
      const controls = row.querySelector(".item-controls") ?? row.querySelector(".eq-controls");
      if (controls) {
        controls.prepend(useBtn);
      } else {
        row.appendChild(useBtn);
      }
    }
  });

  console.log(`${MODULE_ID} | Consumable use hooks registered.`);
}

// ── Ready ─────────────────────────────────────────────────────────────────────

Hooks.once("ready", async () => {
  // Expose globals for console debugging
  game.vagabondCrawler = {
    state:     CrawlState,
    bar:       CrawlBar,
    strip:     CrawlStrip,
    movement:  MovementTracker,
    encounter: EncounterTools,
    morale:    MoraleChecker,
    rest:      RestBreather,
    light:     LightTracker,
    clock:     CrawlClock,
    flanking:  FlankingChecker,
    alchemy:   AlchemyCookbook,
    debugCombat: () => {
      const combat = game.combat;
      if (!combat) return "No active combat";
      return combat.combatants.map(c => ({
        name:       c.name,
        initiative: c.initiative,
        defeated:   c.defeated,
        hidden:     c.hidden,
        flags:      c.flags,
        systemKeys: c.system ? Object.keys(c.system) : [],
        system:     c.system,
      }));
    },
    debugSpeed: () => {
      const token = canvas.tokens?.controlled[0];
      if (!token?.actor) return "No token selected";
      const s = token.actor.system.speed;
      return { actorName: token.actor.name, speed: s, allSpeedKeys: Object.keys(s ?? {}) };
    },
  };

  // Restore crawl state if it was active when the world was last closed
  await CrawlState.restore();

  // Mount the bottom bar (GM only)
  if (game.user.isGM) {
    CrawlBar.mount();
  }

  // Mount the top strip (all users, visibility controlled by CrawlState)
  CrawlStrip.mount();

  // Start movement tracker hooks
  MovementTracker.init();

  // Start morale hooks
  MoraleChecker.init();

  // Start flanking checker
  FlankingChecker.init();

  // Start alchemy cookbook + auto-convert materials
  AlchemyCookbook.init();
  if (game.settings.get(MODULE_ID, "alchemistCookbook")) {
    registerMaterialsHook();
    registerCountdownDamageHook();
    registerEffectExpirationHook();
    registerCountdownLinkedAEHook();
    registerOilBonusDamageHook();
    registerAlchemicalAttackHook();
    registerEurekaHook();
    registerConsumableUseHook();
  }

  // NPC passive ability hooks (Magic Ward, etc.)
  registerMagicWardHook();

  // Chat damage dice tooltips
  registerChatTooltips();

  // Start light tracker + real-time engine if enabled
  LightTracker.init();
  if (game.user.isGM && game.settings.get(MODULE_ID, "realtimeTracking")) {
    LightTracker.startRealTime();
  }

  // Register consumable use context menu on character sheets
  registerConsumableContextMenu();

  // Expose public API on the module for macros / console
  const mod = game.modules.get(MODULE_ID);
  if (mod) {
    mod.api = mod.api ?? {};
    mod.api.populateAlchemicalFolder = populateAlchemicalFolder;
    mod.api.useConsumable = useConsumable;
  }

  console.log(`${MODULE_ID} | Ready.`);
});


Hooks.once("ready", () => {
  game.socket.on(`module.${MODULE_ID}`, async (data) => {
    if (data.action === "syncState") {
      await CrawlState.applySync(data.state);
    }
    if (data.action === "syncLights") {
      await LightTracker.applySync(data.lights);
    }
  });
});
