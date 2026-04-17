// scripts/animation-fx.mjs
import { DEFAULT_ANIMATION_FX_CONFIG, buildDefaultAnimationFxConfig } from "./animation-fx-defaults.mjs";
import { AnimationFxConfigApp } from "./animation-fx-config.mjs";

const MODULE_ID = "vagabond-crawler";

export const AnimationFx = {
  _hookIds: [],
  _ready: false,

  get active() { return this._ready; },

  registerSettings() {
    game.settings.register(MODULE_ID, "animationFxConfig", {
      scope: "world",
      config: false,
      type: Object,
      default: foundry.utils.deepClone(DEFAULT_ANIMATION_FX_CONFIG),
    });
    game.settings.register(MODULE_ID, "animationFxTriggerOn", {
      name: "VAGABOND_CRAWLER.AnimationFxTriggerOn",
      scope: "world",
      config: false,
      type: String,
      choices: { always: "Always", hit: "On Hit Only" },
      default: "always",
    });
    game.settings.register(MODULE_ID, "animationFxEnabled", {
      scope: "client", config: false, type: Boolean, default: true,
    });
    game.settings.register(MODULE_ID, "animationFxScale", {
      scope: "client", config: false, type: Number, default: 1.0,
    });
    game.settings.register(MODULE_ID, "animationFxSoundEnabled", {
      scope: "client", config: false, type: Boolean, default: true,
    });
    game.settings.register(MODULE_ID, "animationFxMasterVolume", {
      scope: "client", config: false, type: Number, default: 0.8,
    });
    game.settings.registerMenu(MODULE_ID, "animationFxConfigMenu", {
      name: "Animation FX Configuration",
      label: "Configure",
      hint: "Centrally configure weapon, NPC action, alchemical, and gear animations.",
      icon: "fas fa-film",
      type: class extends FormApplication {
        constructor() { super(); game.vagabondCrawler?.animationFx?.open(); }
        async _updateObject() {}
        render() { this.close(); return this; }
      },
      restricted: true,
    });
  },

  async init() {
    // Register the chat message hook immediately.
    const hookId = Hooks.on("createChatMessage", (msg, opts, userId) => this._onChatMessage(msg, opts, userId));
    this._hookIds.push(hookId);
    this._registerSheetButtons();
    this._ready = true;
    // Defer the npcAction wrap to a macrotask so it runs after npc-abilities.mjs
    // finishes its own async wrap chain (which uses multiple await-import steps).
    // 100ms is enough for all pending microtask chains to complete.
    setTimeout(() => this._wrapNpcAction(), 100);
  },

  async _wrapNpcAction() {
    let VCC;
    try {
      ({ VagabondChatCard: VCC } = await import("../../../systems/vagabond/module/helpers/chat-card.mjs"));
    } catch (err) {
      console.warn(`${MODULE_ID} | AnimationFx: could not import VagabondChatCard — actionIndex wrap skipped`, err);
      return;
    }
    if (!VCC || typeof VCC.npcAction !== "function") return;
    // Avoid double-wrapping
    if (VCC.npcAction.__vcAnimFxWrapped) return;

    const original = VCC.npcAction.bind(VCC);
    const wrapped = async function (actor, action, actionIndex, targets, ...rest) {
      // Stash actionIndex on the next preCreateChatMessage that matches this actor
      const preHook = Hooks.on("preCreateChatMessage", (msg, data, opts, userId) => {
        const flags = foundry.utils.getProperty(data, "flags.vagabond") ?? {};
        if (flags.actorId === actor?.id && typeof flags.actionIndex !== "number") {
          msg.updateSource({ "flags.vagabond.actionIndex": actionIndex });
        }
        Hooks.off("preCreateChatMessage", preHook);
      });
      try {
        return await original(actor, action, actionIndex, targets, ...rest);
      } finally {
        Hooks.off("preCreateChatMessage", preHook);
      }
    };
    wrapped.__vcAnimFxWrapped = true;
    VCC.npcAction = wrapped;
    console.log(`${MODULE_ID} | AnimationFx: wrapped VagabondChatCard.npcAction (actionIndex flag)`);
  },

  getConfig() {
    const stored = game.settings.get(MODULE_ID, "animationFxConfig") ?? {};
    // Use the live JB2A-aware defaults if available, else fall back to the empty stub.
    const defaults = buildDefaultAnimationFxConfig() ?? foundry.utils.deepClone(DEFAULT_ANIMATION_FX_CONFIG);
    return foundry.utils.mergeObject(
      foundry.utils.deepClone(defaults),
      stored,
      { inplace: false }
    );
  },

  _matchesPattern(name, patterns) {
    if (!patterns || !name) return false;
    try {
      return new RegExp(patterns, "i").test(name);
    } catch (e) {
      return false;
    }
  },

  _resolveWeapon(item, config) {
    const name = item.name ?? "";
    for (const [key, preset] of Object.entries(config.weapons ?? {})) {
      if (this._matchesPattern(name, preset.patterns)) return preset;
    }
    const skill = item.system?.weaponSkill;
    if (skill && config.weaponSkillFallbacks?.[skill]) return config.weaponSkillFallbacks[skill];
    return config.weaponSkillFallbacks?._default ?? null;
  },

  _resolveAlchemical(item, config) {
    const name = (item.name ?? "").toLowerCase();
    if (config.alchemical?.[name]) return config.alchemical[name];
    for (const [key, preset] of Object.entries(config.alchemical ?? {})) {
      if (key === "_default") continue;
      if (name.includes(key)) return preset;
    }
    return config.alchemical?._default ?? null;
  },

  _resolveGear(item, config) {
    const name = (item.name ?? "").toLowerCase();
    if (config.gear?.[name]) return config.gear[name];
    for (const [key, preset] of Object.entries(config.gear ?? {})) {
      if (name.includes(key)) return preset;
    }
    return null; // No default for gear
  },

  _resolveNpcAction(actor, actionIndex, config) {
    const action = actor.system?.actions?.[actionIndex];
    if (!action) return null;
    for (const [key, preset] of Object.entries(config.npcActions ?? {})) {
      if (key === "_default") continue;
      if (this._matchesPattern(action.name, preset.patterns)) return preset;
    }
    return config.npcActions?._default ?? null;
  },

  _getSourceToken(actor) {
    if (!actor) return null;
    const tokens = actor.getActiveTokens(true, true);
    return tokens.find(t => t.parent?.id === canvas.scene?.id) ?? tokens[0] ?? null;
  },

  _getTargets(message) {
    const stored = message.flags?.vagabond?.targetsAtRollTime;
    if (Array.isArray(stored) && stored.length > 0) {
      return stored.map(id => canvas.tokens.get(id)).filter(t => t);
    }
    return Array.from(game.user.targets).map(t => t.document) // ensure TokenDocument
      .map(td => canvas.tokens.get(td.id)).filter(t => t);
  },

  _determineOutcome(message) {
    const flag = message.flags?.vagabond?.rollOutcome;
    if (flag === "hit" || flag === "miss") return flag;
    const content = message.content ?? "";
    if (/\bMISS\b/i.test(content) && !/\bHIT\b/i.test(content)) return "miss";
    return "hit";
  },

  async _onChatMessage(message, options, userId) {
    if (userId !== game.userId) return;
    if (!game.settings.get("vagabond-crawler", "animationFxEnabled")) return;

    const flags = message.flags?.vagabond;
    if (!flags?.actorId) return;
    const actor = game.actors.get(flags.actorId);
    if (!actor) return;

    let preset = null;
    if (flags.itemId) {
      const item = actor.items.get(flags.itemId);
      if (!item) return;
      // Weapon animations are played by the system's own Item FX pipeline
      // (we sync the config there via syncToItems). Skip crawler playback.
      if (item.system?.equipmentType === "weapon") return;
      preset = this._resolve({ item });
    } else if (typeof flags.actionIndex === "number") {
      preset = this._resolve({ actor, actionIndex: flags.actionIndex });
    }
    if (!preset) return;

    const outcome = this._determineOutcome(message);
    const triggerOn = game.settings.get("vagabond-crawler", "animationFxTriggerOn");
    if (outcome === "miss" && triggerOn === "hit") return;

    const sourceToken = this._getSourceToken(actor);
    if (!sourceToken) return;
    const targets = this._getTargets(message);

    await this._play(preset, sourceToken, targets, outcome);
  },

  _resolve(source) {
    const config = this.getConfig();

    // NPC action path
    if (source.actor && typeof source.actionIndex === "number") {
      const actorOverrides = source.actor.getFlag(MODULE_ID, "actionOverrides") ?? {};
      if (actorOverrides[source.actionIndex]) return actorOverrides[source.actionIndex];
      return this._resolveNpcAction(source.actor, source.actionIndex, config);
    }

    // Item path
    const item = source.item ?? source;
    if (!item?.type) return null;
    if (item.getFlag(MODULE_ID, "disabled")) return null;
    const override = item.getFlag(MODULE_ID, "animationOverride");
    if (override) return override;

    // Skip unsupported types
    if (item.type === "spell") return null;
    const equipType = item.system?.equipmentType;
    if (equipType === "armor" || equipType === "relic") return null;

    if (equipType === "weapon") return this._resolveWeapon(item, config);
    if (item.type === "alchemical") return this._resolveAlchemical(item, config);
    if (item.type === "gear" || equipType === "gear") return this._resolveGear(item, config);

    return null;
  },

  // ── Playback helpers ────────────────────────────────────────────────────────

  _getClientScale() {
    return game.settings.get(MODULE_ID, "animationFxScale") ?? 1.0;
  },

  _getMasterVolume() {
    return game.settings.get(MODULE_ID, "animationFxMasterVolume") ?? 0.8;
  },

  async _playSound(block) {
    if (!block?.sound) return;
    if (!game.settings.get(MODULE_ID, "animationFxSoundEnabled")) return;
    // If the sound references another module's assets, silently skip when that
    // module is not installed/active (e.g. psfx on machines without it).
    if (block.sound.startsWith("modules/")) {
      const moduleId = block.sound.split("/")[1];
      if (moduleId && !game.modules.get(moduleId)?.active) {
        console.debug(`[vagabond-crawler] skipping sound — module "${moduleId}" not active`);
        return;
      }
    }
    const volume = (block.soundVolume ?? 0.6) * this._getMasterVolume();
    try {
      await foundry.audio.AudioHelper.play({ src: block.sound, volume, autoplay: true, loop: false });
    } catch (e) {
      console.warn("[vagabond-crawler] animation sound failed:", e);
    }
  },

  _computeConeAngle(sourceToken, targets) {
    const sx = sourceToken.x + (sourceToken.w / 2);
    const sy = sourceToken.y + (sourceToken.h / 2);
    let cx = 0, cy = 0;
    for (const t of targets) {
      cx += t.x + (t.w / 2);
      cy += t.y + (t.h / 2);
    }
    cx /= targets.length;
    cy /= targets.length;
    return Math.toDegrees(Math.atan2(cy - sy, cx - sx));
  },

  async _play(preset, sourceToken, targets, outcome = "hit") {
    if (!preset) return;
    if (typeof Sequence === "undefined") return;
    const block = preset[outcome];
    if (!block?.file) return;

    const globalScale = this._getClientScale();
    const fadeIn = preset.fadeIn ?? 200;
    const fadeOut = preset.fadeOut ?? 200;
    const opacity = preset.opacity ?? 1.0;

    // Persistent gear toggle
    if (preset.persist && sourceToken) {
      const effectName = `${MODULE_ID}-fx-${preset.label}-${sourceToken.id}`;
      const existing = Sequencer.EffectManager.getEffects({ name: effectName });
      if (existing.length > 0) {
        await Sequencer.EffectManager.endEffects({ name: effectName });
        return;
      }
      const seq = new Sequence(MODULE_ID);
      seq.effect()
        .file(block.file)
        .atLocation(sourceToken)
        .scaleToObject(block.scale * globalScale)
        .fadeIn(fadeIn)
        .fadeOut(fadeOut)
        .opacity(opacity)
        .persist()
        .name(effectName);
      await seq.play();
      await this._playSound(block);
      return;
    }

    // Non-persistent: iterate targets with stagger
    const targetList = (targets && targets.length > 0) ? targets : [sourceToken];
    for (let i = 0; i < targetList.length; i++) {
      const target = targetList[i];
      const delay = i * 150;
      setTimeout(() => this._playOne(preset, block, sourceToken, target, targetList, globalScale, fadeIn, fadeOut, opacity), delay);
    }
    await this._playSound(block);
  },

  async _playOne(preset, block, sourceToken, target, allTargets, globalScale, fadeIn, fadeOut, opacity) {
    const seq = new Sequence(MODULE_ID);
    const effect = seq.effect().file(block.file);

    // Unique name for belt-and-suspenders cleanup of transient effects
    const safetyName = `${MODULE_ID}-fx-transient-${foundry.utils.randomID(8)}`;
    let hardDuration;

    if (preset.type === "projectile") {
      hardDuration = block.duration || 1500;
      effect
        .atLocation(sourceToken).stretchTo(target)
        .fadeIn(100).fadeOut(100).opacity(opacity)
        .duration(hardDuration)
        .name(safetyName);
    } else if (preset.type === "cone") {
      hardDuration = block.duration ?? 1500;
      const angle = this._computeConeAngle(sourceToken, allTargets);
      effect
        .atLocation(sourceToken)
        .rotate(-angle)
        .scale(block.scale * globalScale)
        .anchor({ x: 0, y: 0.5 })
        .duration(hardDuration)
        .fadeIn(fadeIn).fadeOut(fadeOut).opacity(opacity)
        .name(safetyName);
    } else {
      // onToken
      hardDuration = block.duration ?? 800;
      const anchorToken = preset.target === "self" ? sourceToken : target;
      effect
        .atLocation(anchorToken)
        .scaleToObject(block.scale * globalScale)
        .fadeIn(fadeIn).fadeOut(fadeOut).duration(hardDuration).opacity(opacity)
        .name(safetyName);
      if (typeof block.offsetX === "number") effect.spriteOffset({ x: block.offsetX });
    }

    try {
      await seq.play();
      // Safety net: guarantee cleanup even if the webm has no natural end or is looped
      const cleanupAfter = hardDuration + fadeOut + 200;
      setTimeout(() => {
        try {
          const existing = Sequencer.EffectManager?.getEffects?.({ name: safetyName }) ?? [];
          if (existing.length > 0) {
            Sequencer.EffectManager.endEffects({ name: safetyName });
          }
        } catch (e) { /* silent */ }
      }, cleanupAfter);
    } catch (e) {
      console.warn("[vagabond-crawler] animation play failed:", e);
    }
  },

  // ── Override dialogs ────────────────────────────────────────────────────────

  async openOverrideDialog(target, kind, index = null) {
    // target: Item (kind="item") or Actor (kind="action")
    const currentOverride = kind === "item"
      ? (target.getFlag(MODULE_ID, "animationOverride") ?? {})
      : ((target.getFlag(MODULE_ID, "actionOverrides") ?? {})[index] ?? {});
    const currentDisabled = kind === "item"
      ? !!target.getFlag(MODULE_ID, "disabled")
      : !!(currentOverride.disabled);

    const dialogTitle = kind === "item"
      ? `Animation FX Override: ${target.name}`
      : `Action Override${index !== null ? ` (Action ${index})` : ""}`;

    const content = `
      <form style="display:flex;flex-direction:column;gap:0.4em;padding:0.5em 0">
        <label style="display:flex;align-items:center;gap:0.4em">
          <input type="checkbox" name="disabled" ${currentDisabled ? "checked" : ""}/>
          Disable animation entirely
        </label>
        <hr style="margin:0.25em 0"/>
        <label>Custom file
          <input type="text" name="file" value="${currentOverride.hit?.file ?? ""}" placeholder="path/to/animation.webm" style="width:100%"/>
        </label>
        <label>Type
          <select name="type">
            <option value="onToken" ${(currentOverride.type ?? "onToken") === "onToken" ? "selected" : ""}>On Token</option>
            <option value="projectile" ${currentOverride.type === "projectile" ? "selected" : ""}>Projectile</option>
            <option value="cone" ${currentOverride.type === "cone" ? "selected" : ""}>Cone</option>
          </select>
        </label>
        <label>Target
          <select name="target">
            <option value="target" ${(currentOverride.target ?? "target") === "target" ? "selected" : ""}>Target</option>
            <option value="self" ${currentOverride.target === "self" ? "selected" : ""}>Self</option>
          </select>
        </label>
        <label>Scale
          <input type="number" step="0.05" name="scale" value="${currentOverride.hit?.scale ?? 1}"/>
        </label>
        <label>Duration (ms)
          <input type="number" step="50" name="duration" value="${currentOverride.hit?.duration ?? 800}"/>
        </label>
      </form>`;

    let result;
    try {
      result = await foundry.applications.api.DialogV2.prompt({
        window: { title: dialogTitle },
        content,
        ok: {
          label: "Save",
          callback: (ev, btn, dialog) => {
            const form = dialog.querySelector("form");
            return new FormDataExtended(form).object;
          },
        },
      });
    } catch (e) {
      // User cancelled
      return;
    }
    if (!result) return;

    if (kind === "item") {
      await target.setFlag(MODULE_ID, "disabled", !!result.disabled);
      if (result.file) {
        const preset = {
          label: `Custom (${target.name})`,
          type: result.type,
          target: result.target,
          hit: { file: result.file, scale: Number(result.scale), duration: Number(result.duration) },
        };
        await target.setFlag(MODULE_ID, "animationOverride", preset);
      } else {
        await target.unsetFlag(MODULE_ID, "animationOverride");
      }
    } else {
      const overrides = foundry.utils.deepClone(target.getFlag(MODULE_ID, "actionOverrides") ?? {});
      if (result.disabled) {
        overrides[index] = { disabled: true };
      } else if (result.file) {
        overrides[index] = {
          label: `Custom action ${index}`,
          type: result.type,
          target: result.target,
          hit: { file: result.file, scale: Number(result.scale), duration: Number(result.duration) },
        };
      } else {
        delete overrides[index];
      }
      await target.setFlag(MODULE_ID, "actionOverrides", overrides);
    }
  },

  _registerSheetButtons() {
    // Item sheet header button — v13 fires getHeaderControls{ClassName} (callAll variant).
    // The callback receives (app, controlsArray); push a control object onto the array.
    const itemHeaderHook = (app, controls) => {
      const item = app.document;
      if (!item) return;
      const eq = item.system?.equipmentType;
      const eligible = eq === "weapon" || item.type === "alchemical" || item.type === "gear" || eq === "gear";
      if (!eligible) return;
      controls.push({
        icon: "fas fa-film",
        label: "Animation FX",
        action: "vcfx-override",
        visible: true,
        onClick: () => this.openOverrideDialog(item, "item"),
      });
    };
    // v13 fires getHeaderControlsVagabondItemSheet (the most-derived hook name).
    // Parent-class variants (ItemSheetV2, ApplicationV2) also fire but we only need one.
    Hooks.on("getHeaderControlsVagabondItemSheet", itemHeaderHook);

    // NPC sheet action rows — inject ⚡ button next to each [data-action-index] row.
    // v13 fires renderVagabondNPCSheet(sheet) where sheet.element is the HTMLElement.
    const npcHook = (sheet) => {
      const actor = sheet.actor ?? sheet.document;
      if (!actor || actor.type !== "npc") return;
      const el = sheet.element;
      if (!el) return;
      const rows = el.querySelectorAll("[data-action-index]");
      rows.forEach(row => {
        if (row.querySelector(".vcfx-action-override")) return;
        const idx = Number(row.dataset.actionIndex);
        if (Number.isNaN(idx)) return;
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "vcfx-action-override";
        btn.title = "Animation FX override";
        btn.innerHTML = "⚡";
        btn.style.cssText = "margin-left:auto;padding:0 4px;font-size:0.9em;cursor:pointer;background:transparent;border:none;opacity:0.7;";
        btn.addEventListener("click", (ev) => {
          ev.preventDefault();
          ev.stopPropagation();
          this.openOverrideDialog(actor, "action", idx);
        });
        row.appendChild(btn);
      });
    };
    Hooks.on("renderVagabondNPCSheet", npcHook);
    Hooks.on("renderActorSheet", npcHook);  // fallback
  },

  // ── Sync to Items ───────────────────────────────────────────────────────────

  _presetToSystemFx(preset) {
    if (!preset?.hit?.file) return null;
    const animType = preset.type === "projectile" ? "ranged"
                   : preset.type === "cone" ? "cone"
                   : "melee";
    return {
      enabled: true,
      animType,
      hitFile: preset.hit.file,
      hitScale: preset.hit.scale ?? 1,
      hitOffsetX: preset.hit.offsetX ?? 0,
      hitDuration: preset.hit.duration ?? 800,
      hitSound: preset.hit.sound ?? "",
      missFile: preset.miss?.file ?? "",
      missScale: preset.miss?.scale ?? 1,
      missDuration: preset.miss?.duration ?? 600,
      missSound: preset.miss?.sound ?? "",
      soundVolume: preset.hit.soundVolume ?? preset.miss?.soundVolume ?? 0.6,
    };
  },

  async syncToItems({ confirm = true } = {}) {
    if (!game.user.isGM) {
      ui.notifications.warn("Only the GM can sync Animation FX to items.");
      return null;
    }
    const worldActors = game.actors.filter(a => !a.pack);

    // Count what WOULD be updated first
    const targets = [];
    for (const actor of worldActors) {
      for (const item of actor.items) {
        const et = item.system?.equipmentType;
        if (et !== "weapon") continue;
        const preset = this._resolve({ item });
        if (!preset) continue;
        const fx = this._presetToSystemFx(preset);
        if (!fx) continue;
        targets.push({ item, actor, preset, fx });
      }
    }

    if (targets.length === 0) {
      ui.notifications.info("No matching weapon items found to sync.");
      return { updated: 0, actors: 0 };
    }

    if (confirm) {
      const actorCount = new Set(targets.map(t => t.actor.id)).size;
      const ok = await foundry.applications.api.DialogV2.confirm({
        window: { title: "Sync Animation FX to Items" },
        content: `<p>This will update <b>${targets.length}</b> weapon(s) across <b>${actorCount}</b> actor(s).</p>
                  <p>Each weapon's <b>Item FX (Sequencer)</b> panel will be overwritten with the matching preset from the Animation FX config.</p>
                  <p>Continue?</p>`,
      });
      if (!ok) return null;
    }

    // Batch updates per actor
    const byActor = new Map();
    for (const t of targets) {
      if (!byActor.has(t.actor)) byActor.set(t.actor, []);
      byActor.get(t.actor).push({ _id: t.item.id, "system.itemFx": t.fx });
    }

    let updated = 0;
    let errored = 0;
    for (const [actor, updates] of byActor) {
      try {
        await actor.updateEmbeddedDocuments("Item", updates);
        updated += updates.length;
      } catch (e) {
        errored += updates.length;
        console.error(`[vagabond-crawler] sync failed for actor ${actor.name}:`, e);
      }
    }

    ui.notifications.info(`Animation FX synced: ${updated} weapon(s) across ${byActor.size} actor(s)${errored ? ` (${errored} failed)` : ""}.`);
    return { updated, actors: byActor.size, errored };
  },

  // ── Persistent light FX helpers ────────────────────────────────────────────

  _persistentNameFor(preset, token) {
    return `vagabond-crawler-fx-${preset.label}-${token.id}`;
  },

  async startPersistent(preset, token) {
    if (!preset || !preset.hit?.file || !token) return;
    if (!preset.persist) return;
    if (typeof Sequencer === "undefined") return;
    if (!game.settings.get(MODULE_ID, "animationFxEnabled")) return;
    const name = this._persistentNameFor(preset, token);
    const existing = Sequencer.EffectManager.getEffects({ name }) ?? [];
    if (existing.length > 0) return; // already running
    const globalScale = this._getClientScale();
    const fadeIn = preset.fadeIn ?? 200;
    const fadeOut = preset.fadeOut ?? 200;
    const opacity = preset.opacity ?? 1.0;
    const seq = new Sequence(MODULE_ID);
    seq.effect()
      .file(preset.hit.file)
      .atLocation(token)
      .scaleToObject(preset.hit.scale * globalScale)
      .fadeIn(fadeIn)
      .fadeOut(fadeOut)
      .opacity(opacity)
      .persist()
      .name(name);
    try {
      await seq.play();
    } catch (e) {
      console.warn("[vagabond-crawler] startPersistent failed:", e);
    }
    this._playSound(preset.hit);
  },

  async stopPersistent(preset, token) {
    if (!preset || !token) return;
    if (typeof Sequencer === "undefined") return;
    const name = this._persistentNameFor(preset, token);
    const existing = Sequencer.EffectManager.getEffects({ name }) ?? [];
    if (existing.length === 0) return; // already stopped
    try {
      await Sequencer.EffectManager.endEffects({ name });
    } catch (e) {
      console.warn("[vagabond-crawler] stopPersistent failed:", e);
    }
  },

  resolveGearPresetByLightType(lightType) {
    // Maps light-tracker's LIGHT_SOURCES key → gear preset key in the AnimationFx config
    const keyByLightType = {
      torch:              "torch",
      "torch-tindertwig": "torch",
      "torch-sentry":     "torch",
      "torch-repel-beast":"torch",
      "torch-frigidflame":"torch",
      candle:             "torch",
      "candle-calming":   "torch",
      "candle-insectbane":"torch",
      "candle-restful":   "torch",
      "lantern-hooded":   "lantern",
      "lantern-bullseye": "lantern",
      lantern:            "lantern",
      sunrod:             "sunrod",
    };
    const gearKey = keyByLightType[lightType] ?? lightType;
    const config = this.getConfig();
    return config.gear?.[gearKey] ?? null;
  },

  // ── FX cleanup ──────────────────────────────────────────────────────────────

  clearAllFx() {
    if (typeof Sequencer === "undefined") return 0;
    const allEffects = Sequencer.EffectManager?.getEffects?.({}) ?? [];
    const count = allEffects.filter(e =>
      (e?.data?.moduleName === MODULE_ID) || /vagabond-crawler/i.test(e?.data?.name ?? "")
    ).length;
    try {
      // End by module name (covers both persist and transient registered under MODULE_ID)
      Sequencer.EffectManager.endEffects({ moduleName: MODULE_ID });
      // Sweep by name prefix as a fallback
      const remaining = Sequencer.EffectManager?.getEffects?.({}) ?? [];
      for (const fx of remaining) {
        const n = fx?.data?.name ?? "";
        if (/^vagabond-crawler/.test(n)) {
          try { fx.endEffect?.(); } catch {}
        }
      }
    } catch (e) {
      console.warn("[vagabond-crawler] clearAllFx failed:", e);
    }
    ui.notifications.info(`Cleared ${count} Animation FX effect(s).`);
    return count;
  },

  // ── Config UI ───────────────────────────────────────────────────────────────

  async open() {
    new AnimationFxConfigApp().render(true);
  },
};
