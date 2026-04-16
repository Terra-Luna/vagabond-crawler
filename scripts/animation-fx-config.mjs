// scripts/animation-fx-config.mjs
const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;
const MODULE_ID = "vagabond-crawler";

export class AnimationFxConfigApp extends HandlebarsApplicationMixin(ApplicationV2) {
  static DEFAULT_OPTIONS = {
    id: "vagabond-crawler-animation-fx-config",
    tag: "form",
    window: { title: "Animation FX Configuration", resizable: true, contentClasses: ["vcfx-config"] },
    position: { width: 900, height: 700 },
    form: { handler: AnimationFxConfigApp.#onSubmit, submitOnChange: false, closeOnSubmit: false },
    actions: {
      saveAndClose: AnimationFxConfigApp.#onSaveAndClose,
      resetTab: AnimationFxConfigApp.#onResetTab,
      addPreset: AnimationFxConfigApp.#onAddPreset,
      deletePreset: AnimationFxConfigApp.#onDeletePreset,
      previewPreset: AnimationFxConfigApp.#onPreviewPreset,
      pickFile: AnimationFxConfigApp.#onPickFile,
      pickSound: AnimationFxConfigApp.#onPickSound,
      switchTab: AnimationFxConfigApp.#onSwitchTab,
      cancel: AnimationFxConfigApp.#onCancel,
    },
  };

  static PARTS = {
    form: { template: "modules/vagabond-crawler/templates/animation-fx-config.hbs" },
  };

  _activeTab = "weapons";
  _workingConfig = null;

  async _prepareContext() {
    if (!this._workingConfig) {
      this._workingConfig = foundry.utils.deepClone(game.vagabondCrawler.animationFx.getConfig());
    }
    return {
      activeTab: this._activeTab,
      config: this._workingConfig,
      settings: {
        triggerOn: game.settings.get(MODULE_ID, "animationFxTriggerOn"),
        enabled: game.settings.get(MODULE_ID, "animationFxEnabled"),
        scale: game.settings.get(MODULE_ID, "animationFxScale"),
        soundEnabled: game.settings.get(MODULE_ID, "animationFxSoundEnabled"),
        masterVolume: game.settings.get(MODULE_ID, "animationFxMasterVolume"),
      },
    };
  }

  static async #onSwitchTab(event, target) {
    this._activeTab = target.dataset.tab;
    this.render();
  }

  static async #onSubmit(event, form, formData) {
    // Full form extraction happens in Task 8 per-tab. For now, save global settings only.
    const data = formData.object;
    if ("settings.triggerOn" in data) await game.settings.set(MODULE_ID, "animationFxTriggerOn", data["settings.triggerOn"]);
    if ("settings.enabled" in data) await game.settings.set(MODULE_ID, "animationFxEnabled", !!data["settings.enabled"]);
    if ("settings.scale" in data) await game.settings.set(MODULE_ID, "animationFxScale", Number(data["settings.scale"]));
    if ("settings.soundEnabled" in data) await game.settings.set(MODULE_ID, "animationFxSoundEnabled", !!data["settings.soundEnabled"]);
    if ("settings.masterVolume" in data) await game.settings.set(MODULE_ID, "animationFxMasterVolume", Number(data["settings.masterVolume"]));
    await game.settings.set(MODULE_ID, "animationFxConfig", this._workingConfig);
    this._flashSaved();
  }

  static async #onSaveAndClose(event, target) {
    await this.submit();
    this.close();
  }

  static async #onCancel(event, target) {
    this.close();
  }

  static async #onResetTab(event, target) {
    const tab = this._activeTab;
    const { DEFAULT_ANIMATION_FX_CONFIG } = await import("./animation-fx-defaults.mjs");
    if (tab in DEFAULT_ANIMATION_FX_CONFIG) {
      const confirmed = await foundry.applications.api.DialogV2.confirm({
        window: { title: "Reset Tab" },
        content: `<p>Reset <b>${tab}</b> to defaults? Unsaved changes will be kept for other tabs.</p>`,
      });
      if (!confirmed) return;
      this._workingConfig[tab] = foundry.utils.deepClone(DEFAULT_ANIMATION_FX_CONFIG[tab]);
      this.render();
    }
  }

  static async #onAddPreset(event, target) { /* Task 8 */ this.render(); }
  static async #onDeletePreset(event, target) { /* Task 8 */ this.render(); }
  static async #onPreviewPreset(event, target) { /* Task 8 */ }
  static async #onPickFile(event, target) { /* Task 8 */ }
  static async #onPickSound(event, target) { /* Task 8 */ }

  _flashSaved() {
    const el = this.element.querySelector(".vcfx-save-flash");
    if (!el) return;
    el.classList.add("vcfx-flash");
    setTimeout(() => el.classList.remove("vcfx-flash"), 800);
  }
}
