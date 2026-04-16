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

  async open() {
    // AnimationFxConfigApp created in Task 8
    ui.notifications.info("Animation FX config UI not yet implemented.");
  },
};
