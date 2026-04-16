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

    if (preset.type === "projectile") {
      effect.atLocation(sourceToken).stretchTo(target).fadeIn(100).fadeOut(100).opacity(opacity);
    } else if (preset.type === "cone") {
      const angle = this._computeConeAngle(sourceToken, allTargets);
      effect
        .atLocation(sourceToken)
        .rotate(-angle)
        .scale(block.scale * globalScale)
        .anchor({ x: 0, y: 0.5 })
        .duration(block.duration ?? 1500)
        .fadeIn(fadeIn).fadeOut(fadeOut).opacity(opacity);
    } else {
      // onToken
      const anchorToken = preset.target === "self" ? sourceToken : target;
      effect
        .atLocation(anchorToken)
        .scaleToObject(block.scale * globalScale)
        .fadeIn(fadeIn).fadeOut(fadeOut).duration(block.duration ?? 800).opacity(opacity);
      if (typeof block.offsetX === "number") effect.spriteOffset({ x: block.offsetX });
    }

    try {
      await seq.play();
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

  // ── Config UI ───────────────────────────────────────────────────────────────

  async open() {
    new AnimationFxConfigApp().render(true);
  },
};
