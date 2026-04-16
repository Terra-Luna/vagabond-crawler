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
    this._saveFormToWorking();
    this._activeTab = target.dataset.tab;
    this.render();
  }

  static async #onSubmit(event, form, formData) {
    this._saveFormToWorking();
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

  static async #onAddPreset(event, target) {
    const tab = this._activeTab;
    if (tab === "settings") return;
    const name = await foundry.applications.api.DialogV2.prompt({
      window: { title: "New Preset Key" },
      content: '<label>Key (lowercase, unique): <input name="key" type="text" required/></label>',
      ok: { callback: (ev, btn, dialog) => dialog.querySelector('input[name=key]').value.trim().toLowerCase() },
    });
    if (!name) return;
    if (this._workingConfig[tab][name]) {
      ui.notifications.warn(`Preset "${name}" already exists in ${tab}.`);
      return;
    }
    const smartType = this._smartType(name);
    this._workingConfig[tab][name] = {
      label: name.charAt(0).toUpperCase() + name.slice(1),
      patterns: name,
      type: smartType,
      target: "target",
      hit: { file: "", scale: 1, duration: 800 },
    };
    this.render();
  }

  static async #onDeletePreset(event, target) {
    const key = target.dataset.key;
    if (!key || key === "_default") return;
    const confirmed = await foundry.applications.api.DialogV2.confirm({
      window: { title: "Delete Preset" },
      content: `<p>Delete preset <b>${key}</b>?</p>`,
    });
    if (!confirmed) return;
    this._saveFormToWorking();
    delete this._workingConfig[this._activeTab][key];
    this.render();
  }

  static async #onPreviewPreset(event, target) {
    this._saveFormToWorking();
    const key = target.dataset.key;
    const preset = this._workingConfig[this._activeTab]?.[key];
    if (!preset) return;
    const source = canvas.tokens.controlled[0];
    if (!source) { ui.notifications.warn("Select a token first."); return; }
    const outcome = event.shiftKey ? "miss" : "hit";

    // For projectile and cone presets we need a distinct target so that
    // stretchTo / _computeConeAngle have a real direction to work with.
    // Passing the source as its own target produces zero-distance math
    // that throws in Sequencer.
    let previewTargets;
    const needsDirection = preset.type === "projectile" || preset.type === "cone";
    if (needsDirection) {
      const controlled = canvas.tokens.controlled;
      if (controlled.length >= 2) {
        // Use the second controlled token as target
        previewTargets = [controlled[1]];
      } else {
        const userTarget = game.user.targets.first();
        if (userTarget && userTarget !== source) {
          previewTargets = [userTarget];
        } else {
          // Synthetic offset: ~400px east of the source centre.
          // _playOne / _computeConeAngle accept plain {x,y,w,h} objects.
          previewTargets = [{
            x: source.x + (source.w ?? 0) + 400,
            y: source.y,
            w: 1,
            h: source.h ?? 1,
            id: "_preview_offset",
          }];
        }
      }
    } else {
      // onToken preset — playing on source is fine for preview
      previewTargets = [source];
    }

    await game.vagabondCrawler.animationFx._play(preset, source, previewTargets, outcome);
  }

  static async #onPickFile(event, target) {
    const fieldName = target.dataset.target;
    const input = this.element.querySelector(`[name="${fieldName}"]`);
    const fp = new foundry.applications.apps.FilePicker.implementation({
      type: "imagevideo",
      current: input?.value ?? "",
      callback: (path) => { if (input) input.value = path; },
    });
    fp.browse();
  }

  static async #onPickSound(event, target) {
    const fieldName = target.dataset.target;
    const input = this.element.querySelector(`[name="${fieldName}"]`);
    const fp = new foundry.applications.apps.FilePicker.implementation({
      type: "audio",
      current: input?.value ?? "",
      callback: (path) => { if (input) input.value = path; },
    });
    fp.browse();
  }

  /** Infer default animation type from a preset name. */
  _smartType(name) {
    if (/breath|cone|spray|exhale/i.test(name)) return "cone";
    if (/arrow|bolt|shoot|throw|hurl|spit/i.test(name)) return "projectile";
    return "onToken";
  }

  /** Read current form values into _workingConfig without a full re-render. */
  _saveFormToWorking() {
    const formEl = this.element instanceof HTMLFormElement
      ? this.element
      : this.element?.querySelector("form") ?? this.element;
    if (!formEl) return;
    const fd = new FormDataExtended(formEl);
    const data = foundry.utils.expandObject(fd.object);
    for (const tab of ["weapons", "weaponSkillFallbacks", "alchemical", "gear", "npcActions"]) {
      if (data[tab]) {
        for (const [key, preset] of Object.entries(data[tab])) {
          if (!this._workingConfig[tab]) this._workingConfig[tab] = {};
          if (!this._workingConfig[tab][key]) this._workingConfig[tab][key] = {};
          foundry.utils.mergeObject(this._workingConfig[tab][key], preset);
        }
      }
    }
    // Persist settings fields too
    if (data.settings) {
      // will be written to game settings on submit; just update context
    }
  }

  _flashSaved() {
    const el = this.element.querySelector(".vcfx-save-flash");
    if (!el) return;
    el.classList.add("vcfx-flash");
    setTimeout(() => el.classList.remove("vcfx-flash"), 800);
  }
}
