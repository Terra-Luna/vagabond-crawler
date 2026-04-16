// scripts/animation-fx.mjs
import { DEFAULT_ANIMATION_FX_CONFIG, buildDefaultAnimationFxConfig } from "./animation-fx-defaults.mjs";

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
  },

  async init() {
    // Hook registration comes in Task 4
    this._ready = true;
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

  // ── Config UI ───────────────────────────────────────────────────────────────

  async open() {
    // AnimationFxConfigApp created in Task 8
    ui.notifications.info("Animation FX config UI not yet implemented.");
  },
};
