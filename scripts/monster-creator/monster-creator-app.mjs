/**
 * Vagabond Crawler — Monster Creator (Phase 1: skeleton + save + bestiary load)
 *
 * ApplicationV2 window for authoring a new NPC from scratch or by starting
 * from a bestiary monster. Saves as a world actor with the full Vagabond
 * `npc` system shape so the sheet renders immediately.
 *
 * Scope (phase 1):
 *   - Basic-info form: identity, stats, movement, resistances, description
 *   - Portrait + Token file pickers (separate images; no Tokenizer yet)
 *   - Load-from-bestiary dropdown pre-fills the form from a compendium NPC
 *   - Save creates a new world actor — never modifies the compendium
 *   - Live HP + TL preview as fields change
 *
 * Out of scope (later phases):
 *   - Actions editor + quick-pick / catalog templates (phase 2)
 *   - Abilities editor with automation-status badges (phase 3)
 *   - Mutations panel + "Edit in Creator" handoff (phase 4)
 *   - Tokenizer integration + JSON import/export (phase 5)
 */

import { MODULE_ID } from "../vagabond-crawler.mjs";
import { calculateHP, calculateTL, calculateDPR, applyMutations, generateMutatedName, getStatSummary } from "../monster-mutator.mjs";
import { MUTATIONS, getMutation, getConflict, getBoons, getBanes } from "../mutation-data.mjs";
import { PASSIVE_ABILITIES } from "../npc-abilities.mjs";
import { ACTION_QUICK_PICKS,  materializeAction  } from "./action-templates.mjs";
import { ABILITY_QUICK_PICKS, materializeAbility } from "./ability-templates.mjs";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

// ── Constants for dropdowns ───────────────────────────────────────────────────

const BEING_TYPES = ["Beasts", "Cryptid", "Humanlike", "Undead", "Fae", "Primordials", "Outers", "Artificials"];
const SIZES       = ["small", "medium", "large", "huge", "giant", "colossal"];
const ZONES       = ["frontline", "midline", "backline"];

// Canonical lists mirror the HTML Monster Creator (matches Vagabond's data model).
const DAMAGE_TYPES  = ["acid", "fire", "shock", "poison", "cold", "blunt", "piercing", "slashing", "physical", "necrotic", "psychic", "magical", "healing", "recover", "recharge"];
const WEAKNESS_TYPES = [...DAMAGE_TYPES, "coldIron", "silver"];
const WEAKNESS_LABELS = { coldIron: "Cold Iron" };
const STATUS_CONDITIONS = [
  "berserk", "blinded", "burning", "charmed", "confused", "dazed",
  "fatigued", "focusing", "frightened", "grappling", "incapacitated",
  "invisible", "paralyzed", "prone", "restrained", "sickened",
  "suffocating", "unconscious", "vulnerable",
];
const SPEED_MODES = ["climb", "cling", "fly", "phase", "swim"];

function _capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
function _labelFor(s, map) { return map[s] ?? _capitalize(s); }

/**
 * Parse a free-form Vagabond `senses` string into Foundry token-sight settings.
 * Returns `null` when the string doesn't match any known sense — leaving the
 * caller to keep whatever the user had previously set. Range `null` means
 * infinite (displayed as ∞ in Foundry's token HUD).
 *
 * Used when loading from bestiary so a monster with "Darksight" auto-gets
 * Darkvision + 60ft range, etc. Can be disabled per-field if the user wants
 * to tweak manually.
 */
function _visionFromSenses(sensesText) {
  const str = String(sensesText ?? "").trim();
  if (!str) return { enabled: false, range: 0, mode: "basic" };
  for (const rule of VISION_MODE_BY_SENSE) {
    if (rule.keyword.test(str)) {
      // Prefer an explicit range number in the text if the author gave one
      // (e.g. "Darksight 60'", "Blindsight 60 feet", "Seismicsense (Far)").
      const explicit = str.match(/(\d+)\s*(?:ft|feet|'|")/i);
      const range = explicit ? Number(explicit[1]) : rule.range;
      return { enabled: true, range, mode: rule.mode };
    }
  }
  return null; // unknown — don't auto-configure
}

function _identitySummary(d) {
  const parts = [
    (d.name ?? "").trim() || "(unnamed)",
    d.beingType,
    _capitalize(d.size || ""),
    _capitalize(d.zone  || ""),
  ].filter(Boolean);
  return parts.join(" · ");
}

function _visionSummary(d) {
  if (!d.visionEnabled) return "disabled";
  const modeLabel = VISION_MODE_OPTIONS.find((o) => o.value === d.visionMode)?.label ?? d.visionMode;
  const rangeLabel = d.visionInfinite ? "∞" : `${d.visionRange || 0}ft`;
  return `${modeLabel} · ${rangeLabel}`;
}

function _statsSummary(d) {
  const parts = [];
  parts.push(`HD ${d.hd}`);
  parts.push(`Armor ${d.armor}`);
  parts.push(`${d.speed}ft`);
  if (d.speedTypes?.length) {
    const modes = d.speedTypes.map((s) => String(s).split(/\s+/)[0]).filter(Boolean);
    if (modes.length) parts.push(`+ ${modes.join("/")}`);
  }
  parts.push(`Morale ${d.morale}`);
  return parts.join(" · ");
}

function _descriptionPreview(text) {
  const t = String(text ?? "").trim();
  if (!t) return "";
  return t.length > 80 ? t.slice(0, 80) + "…" : t;
}

/**
 * Compact summary of a string-array field — used in collapsible <summary>
 * so the user sees what's selected without expanding.
 * Returns { hasAny, count, preview } where preview is up to 4 values joined.
 */
function _summarize(arr, labelMap = {}) {
  const list = Array.isArray(arr) ? arr : [];
  if (list.length === 0) return { hasAny: false, count: 0, preview: "" };
  const labels = list.map((v) => _labelFor(v, labelMap));
  const preview = labels.slice(0, 4).join(", ") + (labels.length > 4 ? `, +${labels.length - 4} more` : "");
  return { hasAny: true, count: list.length, preview };
}

// Vagabond sense keyword → Foundry token sight config
// Keep keys in precedence order: the first match wins so "Allsight" beats
// "Blindsight" when both happen to appear in the same senses string.
const VISION_MODE_BY_SENSE = [
  { keyword: /\ball[\s-]?sight\b/i, range: null,  mode: "basic"      },   // null = infinite
  { keyword: /\bdark[\s-]?sight\b/i, range: 60,    mode: "darkvision" },
  { keyword: /\bdarkvision\b/i,      range: 60,    mode: "darkvision" },
  { keyword: /\btruesight\b/i,       range: null,  mode: "basic"      },
  { keyword: /\bseismicsense\b/i,    range: 30,    mode: "tremorsense" },
  { keyword: /\btremorsense\b/i,     range: 30,    mode: "tremorsense" },
  { keyword: /\bblindsight\b/i,      range: 30,    mode: "basic"      },
  { keyword: /\bblindsense\b/i,      range: 15,    mode: "basic"      },
  { keyword: /\becholocation\b/i,    range: 15,    mode: "basic"      },
];

const VISION_MODE_OPTIONS = [
  { value: "basic",              label: "Basic Vision"      },
  { value: "darkvision",         label: "Darkvision"        },
  { value: "tremorsense",        label: "Tremorsense"       },
  { value: "monochromatic",      label: "Monochromatic"     },
  { value: "lightAmplification", label: "Light Amplification" },
  { value: "blindness",          label: "Blindness"         },
];

const SIZE_TO_TOKEN = {
  small:    { w: 1, h: 1 },
  medium:   { w: 1, h: 1 },
  large:    { w: 2, h: 2 },
  huge:     { w: 3, h: 3 },
  giant:    { w: 4, h: 4 },
  colossal: { w: 5, h: 5 },
};

const ATTACK_TYPES = [
  { value: "melee",      label: "Melee" },
  { value: "ranged",     label: "Ranged" },
  { value: "castClose",  label: "Cast (Close)" },
  { value: "castRanged", label: "Cast (Ranged)" },
];

const DAMAGE_TYPE_OPTIONS = ["-", ...["acid","fire","shock","poison","cold","blunt","piercing","slashing","physical","necrotic","psychic","magical","healing","recover","recharge"]];

const ACTION_TABS = [
  { key: "all",        label: "All" },
  { key: "melee",      label: "Melee" },
  { key: "ranged",     label: "Ranged" },
  { key: "castClose",  label: "Cast (Close)" },
  { key: "castRanged", label: "Cast (Ranged)" },
];

/** Map MUTATION_CATEGORIES keys into high-level tabs (matches the HTML tool). */
const MUTATION_TAB_BUCKETS = {
  form:    new Set(["hp", "armor", "speed", "size", "morale", "senses", "movement", "immunities", "weaknesses", "statusImmunities"]),
  attack:  new Set(["dpr"]),
  special: new Set(["abilities"]),
};
const MUTATION_TABS = [
  { key: "all",     label: "All" },
  { key: "form",    label: "Form" },
  { key: "attack",  label: "Attack" },
  { key: "special", label: "Special" },
];

const BESTIARY_PACKS = ["vagabond.bestiary", "vagabond.humanlike"];

const DEFAULT_PORTRAIT = "systems/vagabond/assets/ui/default-npc.svg";

// ── Singleton public API ──────────────────────────────────────────────────────

export const MonsterCreator = {
  _app: null,

  init() {
    console.log(`${MODULE_ID} | Monster Creator initialized.`);
  },

  open() {
    if (!game.user.isGM) {
      ui.notifications.warn("Only the GM can open the Monster Creator.");
      return;
    }
    if (!this._app) this._app = new MonsterCreatorApp();
    this._app.render(true);
  },

  /**
   * Open the Creator pre-filled with a raw actor data object (as returned
   * by `actor.toObject()` or the output of `applyMutations(clone, ...)`).
   * The Creator treats this as "loaded content" — all sections collapse;
   * the user expands to tweak. Used by the Mutate tab's "Edit in Creator"
   * handoff so mutations are baked in as starting stats.
   */
  openWithData(actorObject) {
    if (!game.user.isGM) {
      ui.notifications.warn("Only the GM can open the Monster Creator.");
      return;
    }
    if (!this._app) this._app = new MonsterCreatorApp();
    this._app._loadFromActorShape(actorObject);
    this._app.render(true);
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function _blankMonster() {
  return {
    name:             "",
    beingType:        "Beasts",
    size:             "medium",
    zone:             "frontline",
    hd:               3,
    armor:            0,
    armorDescription: "as Unarmored",
    speed:            30,
    speedTypes:       [],
    speedValues:      { climb: 0, cling: 0, fly: 0, phase: 0, swim: 0 },
    morale:           7,
    appearing:        "1",
    senses:           "",
    description:      "",
    immunities:       [],
    weaknesses:       [],
    statusImmunities: [],
    actions:          [],
    abilities:        [],
    portraitImg:      DEFAULT_PORTRAIT,
    tokenImg:         DEFAULT_PORTRAIT,
    // Token vision — matches Foundry v13 prototypeToken.sight shape.
    // `range` is Number | null; null displays as ∞.
    visionEnabled:    false,
    visionRange:      0,
    visionInfinite:   false,
    visionAngle:      360,
    visionMode:       "basic",
  };
}

/** Full Vagabond action shape; used when a template has no pre-defined fields. */
function _blankAction() {
  return {
    name: "", note: "", recharge: "",
    attackType: "melee",
    flatDamage: "", rollDamage: "", damageType: "-",
    extraInfo: "",
    causedStatuses: [], critCausedStatuses: [],
  };
}

/** Strip the form shape from a compendium NPC actor into Creator state. */
function _fromCompendiumActor(actor) {
  const s = actor.system ?? {};
  return {
    name:             actor.name,
    beingType:        s.beingType ?? "Beasts",
    size:             s.size ?? "medium",
    zone:             s.zone ?? "frontline",
    hd:               Number(s.hd ?? 1),
    armor:            Number(s.armor ?? 0),
    armorDescription: s.armorDescription ?? "",
    speed:            Number(s.speed ?? 30),
    speedTypes:       Array.isArray(s.speedTypes) ? [...s.speedTypes] : [],
    speedValues:      { climb: 0, cling: 0, fly: 0, phase: 0, swim: 0, ...(s.speedValues ?? {}) },
    morale:           Number(s.morale ?? 7),
    appearing:        s.appearing ?? "1",
    senses:           s.senses ?? "",
    description:      s.description ?? "",
    immunities:       Array.isArray(s.immunities)       ? [...s.immunities]       : [],
    weaknesses:       Array.isArray(s.weaknesses)       ? [...s.weaknesses]       : [],
    statusImmunities: Array.isArray(s.statusImmunities) ? [...s.statusImmunities] : [],
    actions: Array.isArray(s.actions) ? s.actions.map((a) => ({
      name: a?.name ?? "", note: a?.note ?? "", recharge: a?.recharge ?? "",
      attackType: a?.attackType ?? "melee",
      flatDamage: a?.flatDamage ?? "", rollDamage: a?.rollDamage ?? "", damageType: a?.damageType ?? "-",
      extraInfo: a?.extraInfo ?? "",
      causedStatuses: Array.isArray(a?.causedStatuses) ? a.causedStatuses.map((c) => ({ ...c })) : [],
      critCausedStatuses: Array.isArray(a?.critCausedStatuses) ? a.critCausedStatuses.map((c) => ({ ...c })) : [],
    })) : [],
    abilities: Array.isArray(s.abilities) ? s.abilities.map((ab) => ({
      name: ab?.name ?? "", description: ab?.description ?? "",
    })) : [],
    portraitImg:      actor.img || DEFAULT_PORTRAIT,
    // prototypeToken.texture.src may be a wildcard path like ".../*". Keep as-is.
    tokenImg:         actor.prototypeToken?.texture?.src || actor.img || DEFAULT_PORTRAIT,
    ..._visionFromCompendiumSource(actor, s),
  };
}

/**
 * Pull vision settings from a compendium actor. If `prototypeToken.sight`
 * is the bestiary default (disabled, range 0, basic) — which is true for
 * every monster in vagabond.bestiary — synthesize settings from the
 * senses text so a Darksight monster gets Darkvision automatically.
 * Otherwise honor whatever the actor has explicitly configured.
 */
function _visionFromCompendiumSource(actor, systemData) {
  const sight = actor.prototypeToken?.sight ?? {};
  const isDefaultish =
    !sight.enabled && (sight.range ?? 0) === 0 && (sight.visionMode ?? "basic") === "basic";
  if (isDefaultish) {
    const derived = _visionFromSenses(systemData?.senses);
    if (derived) {
      return {
        visionEnabled:   derived.enabled,
        visionRange:     derived.range ?? 0,
        visionInfinite:  derived.range === null,
        visionAngle:     360,
        visionMode:      derived.mode,
      };
    }
  }
  return {
    visionEnabled:   !!sight.enabled,
    visionRange:     typeof sight.range === "number" ? sight.range : 0,
    visionInfinite:  sight.range === null,
    visionAngle:     Number(sight.angle ?? 360),
    visionMode:      sight.visionMode ?? "basic",
  };
}

/** "fire, poison , charmed" → ["fire","poison","charmed"]  (trimmed, deduped, no empties) */
function _parseCsvList(str) {
  if (!str) return [];
  return [...new Set(String(str).split(",").map((s) => s.trim()).filter(Boolean))];
}

function _computePreview(data) {
  const hp  = Math.round(calculateHP(data.hd, data.size) ?? 0);
  const dpr = Math.round(((calculateDPR(data.actions) ?? 0)) * 10) / 10;
  const tl  = Math.round((calculateTL(hp, data.armor, dpr) ?? 0) * 10) / 10;
  return { hp, tl, dpr };
}

/** Build the compact damage string shown on template buttons and on
 *  action-summary pills. Handles bare "d4" vs full "2d6" and flat bonuses. */
function _damageDisplay(rollDamage, flatDamage, damageType) {
  const parts = [];
  const roll = String(rollDamage ?? "").trim();
  const flat = String(flatDamage ?? "").trim();
  if (roll) parts.push(roll);
  if (flat && flat !== "0") parts.push(`+${flat}`);
  if (!parts.length) return "—";
  let out = parts.join(" ");
  if (damageType && damageType !== "-") out += ` ${damageType}`;
  return out;
}

/**
 * Convert the Creator's form-state `_data` into the actor-shape object that
 * `applyMutations` / `getStatSummary` / `calculateHP` expect (i.e. the raw
 * shape of a compendium `actor.toObject()`).
 *
 * Used when previewing/applying mutations so we can use the canonical
 * mutation logic without reimplementing it.
 */
function _dataToActorShape(data) {
  return {
    name: data.name,
    system: {
      hd:               data.hd,
      cr:               data.hd,
      size:             data.size,
      beingType:        data.beingType,
      speed:            data.speed,
      speedTypes:       [...data.speedTypes],
      speedValues:      { ...data.speedValues },
      morale:           data.morale,
      senses:           data.senses,
      armor:            data.armor,
      armorDescription: data.armorDescription,
      immunities:       [...data.immunities],
      weaknesses:       [...data.weaknesses],
      statusImmunities: [...data.statusImmunities],
      zone:             data.zone,
      health:           { value: Math.round(calculateHP(data.hd, data.size) ?? 0), max: Math.round(calculateHP(data.hd, data.size) ?? 0), bonus: [] },
      actions:   data.actions.map((a) => ({ ...a })),
      abilities: data.abilities.map((a) => ({ ...a })),
    },
  };
}

/** Reverse — copy a mutated actor-shape object back into Creator form state. */
function _actorShapeToData(actorObj, prevData) {
  const s = actorObj.system;
  return {
    name:             actorObj.name ?? prevData.name,
    beingType:        s.beingType ?? prevData.beingType,
    size:             s.size ?? prevData.size,
    zone:             s.zone ?? prevData.zone,
    hd:               Number(s.hd ?? prevData.hd),
    armor:            Number(s.armor ?? prevData.armor),
    armorDescription: s.armorDescription ?? prevData.armorDescription,
    speed:            Number(s.speed ?? prevData.speed),
    speedTypes:       Array.isArray(s.speedTypes) ? [...s.speedTypes] : [...prevData.speedTypes],
    speedValues:      { ...(s.speedValues ?? prevData.speedValues) },
    morale:           Number(s.morale ?? prevData.morale),
    appearing:        prevData.appearing,
    senses:           s.senses ?? prevData.senses,
    description:      prevData.description,
    immunities:       Array.isArray(s.immunities)       ? [...s.immunities]       : [...prevData.immunities],
    weaknesses:       Array.isArray(s.weaknesses)       ? [...s.weaknesses]       : [...prevData.weaknesses],
    statusImmunities: Array.isArray(s.statusImmunities) ? [...s.statusImmunities] : [...prevData.statusImmunities],
    actions:          Array.isArray(s.actions)   ? s.actions.map((a) => ({ ...a }))   : [],
    abilities:        Array.isArray(s.abilities) ? s.abilities.map((a) => ({ ...a })) : [],
    portraitImg:      prevData.portraitImg,
    tokenImg:         prevData.tokenImg,
  };
}

/** Compute a live preview of selected mutations applied to the current form.
 *  Returns before/after stat summaries + prefixes/suffixes. */
function _mutationPreview(data, selectedIds) {
  const baseShape  = _dataToActorShape(data);
  const baseSys    = baseShape.system;
  const basePreview = {
    hp:    Math.round(calculateHP(data.hd, data.size) ?? 0),
    armor: data.armor,
    speed: data.speed,
    abilityCount: data.abilities.length,
    actionCount:  data.actions.length,
  };
  basePreview.tl = Math.round((calculateTL(basePreview.hp, basePreview.armor, calculateDPR(baseSys.actions) ?? 0) ?? 0) * 10) / 10;

  if (!selectedIds.size) return { base: basePreview, mutated: null, prefixes: [], suffixes: [] };

  const clone = foundry.utils.deepClone(baseShape);
  const { prefixes, suffixes } = applyMutations(clone, [...selectedIds]);
  const mSys = clone.system;
  const mutated = {
    hp:    Math.round(calculateHP(mSys.hd, mSys.size) ?? 0),
    armor: mSys.armor,
    speed: mSys.speed,
    abilityCount: (mSys.abilities ?? []).length,
    actionCount:  (mSys.actions ?? []).length,
  };
  mutated.tl = Math.round((calculateTL(mutated.hp, mutated.armor, calculateDPR(mSys.actions) ?? 0) ?? 0) * 10) / 10;
  return { base: basePreview, mutated, prefixes, suffixes };
}

function _mutationTabFor(mutationCategory) {
  for (const [bucket, cats] of Object.entries(MUTATION_TAB_BUCKETS)) {
    if (cats.has(mutationCategory)) return bucket;
  }
  return "form";
}

function _abilitiesSummary(abilities) {
  if (!abilities?.length) return { count: 0, preview: "" };
  const preview = abilities.slice(0, 4).map((a) => a.name).filter(Boolean).join(", ");
  const more = abilities.length > 4 ? `, +${abilities.length - 4} more` : "";
  return { count: abilities.length, preview: preview + more };
}

/** Badge metadata for an ability NAME. "implemented" when npc-abilities.mjs
 *  actively matches it; "unimplemented"/"flavor" are hints from Quick Picks
 *  (only meaningful when the name matches a Quick Pick tier/variant output).
 *  Anything else gets `null` (no badge).
 */
function _abilityBadge(name) {
  if (!name) return null;
  if (PASSIVE_ABILITIES[name]) {
    return { status: "implemented", icon: "✓", label: "Automated" };
  }
  // Match Quick Picks materialized names: "Magic Ward III", "Pack Hunter", "Nimble", etc.
  for (const qp of ABILITY_QUICK_PICKS) {
    const names = qp.tiers
      ? qp.tiers.map((t) => `${qp.name} ${t.label}`)
      : qp.variants
        ? qp.variants.map((v) => `${qp.name} ${v.label}`)
        : [qp.name];
    if (names.includes(name)) {
      if (qp.automationStatus === "implemented") return { status: "implemented", icon: "✓", label: "Automated" };
      if (qp.automationStatus === "unimplemented") return { status: "unimplemented", icon: "⚠", label: "Not automated" };
      if (qp.automationStatus === "flavor") return { status: "flavor", icon: "📖", label: "Flavor / narrative" };
    }
  }
  return null;
}

function _actionsSummary(actions) {
  if (!actions?.length) return { count: 0, preview: "" };
  const preview = actions.slice(0, 3)
    .map((a) => {
      const dmg = _damageDisplay(a.rollDamage, a.flatDamage, a.damageType);
      return dmg === "—" ? a.name : `${a.name} ${dmg}`;
    })
    .join(", ");
  const more = actions.length > 3 ? `, +${actions.length - 3} more` : "";
  return { count: actions.length, preview: preview + more };
}

/** Build the full Vagabond npc actor shape from Creator state. */
function _buildActorData(data) {
  const { hp } = _computePreview(data);
  const tok = SIZE_TO_TOKEN[data.size] ?? { w: 1, h: 1 };
  const stats = Object.fromEntries(
    ["might", "dexterity", "awareness", "reason", "presence", "luck"].map((k) => [k, { value: 8 }])
  );
  return {
    name: data.name.trim() || "Unnamed Monster",
    type: "npc",
    img:  data.portraitImg || DEFAULT_PORTRAIT,
    system: {
      health:           { value: hp, max: hp, bonus: [] },
      power:            { value: 5,  max: 5 },
      fatigue:          0,
      biography:        "",
      cr:               data.hd,
      threatLevel:      _computePreview(data).tl,
      size:             data.size,
      beingType:        data.beingType,
      speedTypes:       [...data.speedTypes],
      speedValues:      { ...data.speedValues },
      stats,
      hd:               data.hd,
      morale:           data.morale,
      appearing:        data.appearing,
      speed:            data.speed,
      senses:           data.senses,
      armor:            data.armor,
      armorDescription: data.armorDescription,
      locked:           true,
      immunities:       [...data.immunities],
      weaknesses:       [...data.weaknesses],
      statusImmunities: [...data.statusImmunities],
      zone:             data.zone,
      description:      data.description,
      actions:   data.actions.map((a) => ({
        name: a.name, note: a.note, recharge: a.recharge,
        attackType: a.attackType,
        flatDamage: a.flatDamage, rollDamage: a.rollDamage, damageType: a.damageType || "-",
        extraInfo: a.extraInfo ?? "",
        causedStatuses:     Array.isArray(a.causedStatuses)     ? a.causedStatuses.map((c) => ({ ...c }))     : [],
        critCausedStatuses: Array.isArray(a.critCausedStatuses) ? a.critCausedStatuses.map((c) => ({ ...c })) : [],
      })),
      abilities: data.abilities.map((ab) => ({ name: ab.name, description: ab.description })),
      universalDamageBonus:          ["0"],
      universalDamageDice:           [""],
      fatigueBonus:                  [],
      universalWeaponDamageBonus:    [],
      universalWeaponDamageDice:     [],
      universalSpellDamageBonus:     [],
      universalSpellDamageDice:      [],
      universalAlchemicalDamageBonus:[],
      universalAlchemicalDamageDice: [],
      cleaveTargets:                 [],
      brutalDice:                    [],
      reflexCritBonus:               [],
      endureCritBonus:               [],
    },
    prototypeToken: {
      name:        data.name.trim() || "Monster",
      displayName: 0,
      actorLink:   false,
      width:       tok.w,
      height:      tok.h,
      disposition: -1,
      randomImg:   false,
      texture: {
        src:      data.tokenImg || data.portraitImg || DEFAULT_PORTRAIT,
        anchorX:  0.5,
        anchorY:  0.5,
        scaleX:   1,
        scaleY:   1,
        rotation: 0,
        tint:     "#ffffff",
      },
      bar1: { attribute: "health" },
      sight: {
        enabled:    !!data.visionEnabled,
        range:      data.visionInfinite ? null : Number(data.visionRange) || 0,
        angle:      Number(data.visionAngle) || 360,
        visionMode: data.visionMode || "basic",
        color:      null,
        attenuation:0.1,
        brightness: 0,
        saturation: 0,
        contrast:   0,
      },
    },
  };
}

// ── Cached bestiary index for the load dropdown ───────────────────────────────

let _bestiaryCache = null;

async function _getBestiaryList() {
  if (_bestiaryCache) return _bestiaryCache;
  const items = [];
  for (const packId of BESTIARY_PACKS) {
    const pack = game.packs.get(packId);
    if (!pack) continue;
    const idx = await pack.getIndex({ fields: ["system.threatLevel", "system.beingType"] });
    for (const e of idx) {
      items.push({
        uuid:      `Compendium.${packId}.Actor.${e._id}`,
        name:      e.name,
        beingType: e.system?.beingType ?? "",
        tl:        Number(e.system?.threatLevel ?? 0),
        source:    packId,
      });
    }
  }
  items.sort((a, b) => a.name.localeCompare(b.name));
  _bestiaryCache = items;
  return items;
}

/** Apply the Creator's active filters to the bestiary list. */
function _filterBestiary(list, filters) {
  const term = (filters.search || "").trim().toLowerCase();
  const [tlLo, tlHi] = _tlRange(filters.tlRange);
  return list.filter((m) => {
    if (term && !m.name.toLowerCase().includes(term)) return false;
    if (filters.beingType && m.beingType !== filters.beingType) return false;
    if (filters.source    && m.source    !== filters.source)    return false;
    if (tlLo !== null && m.tl < tlLo) return false;
    if (tlHi !== null && m.tl >= tlHi) return false;
    return true;
  });
}

function _tlRange(range) {
  switch (range) {
    case "0-1": return [0, 1];
    case "1-3": return [1, 3];
    case "3-5": return [3, 5];
    case "5-8": return [5, 8];
    case "8+":  return [8, Infinity];
    default:    return [null, null];
  }
}

const TL_RANGE_OPTIONS = ["0-1", "1-3", "3-5", "5-8", "8+"];
const SOURCE_OPTIONS = [
  { value: "vagabond.bestiary",  label: "Bestiary"  },
  { value: "vagabond.humanlike", label: "Humanlike" },
];

// ── ApplicationV2 ─────────────────────────────────────────────────────────────

class MonsterCreatorApp extends HandlebarsApplicationMixin(ApplicationV2) {
  static DEFAULT_OPTIONS = {
    id:       "vagabond-crawler-monster-creator",
    window:   { title: "Monster Creator", resizable: true },
    position: { width: 760, height: 720 },
    classes:  ["vagabond-crawler", "monster-creator"],
  };

  static PARTS = {
    form: { template: "modules/vagabond-crawler/templates/monster-creator.hbs" },
  };

  constructor(...args) {
    super(...args);
    this._data = _blankMonster();
    this._sourceUuid = null;
    this._renderAbort = null;
    this._actionsTab   = "all"; // which Action Quick-Picks tab is active
    this._mutationsTab = "all"; // which Mutation tab is active
    this._selectedMutations = new Set(); // staged mutation IDs (not applied yet)
    // Open/closed state for every <details data-collapse="…"> section.
    // Persisted across re-renders so editing inside an open section doesn't
    // collapse it. Keyed by the section's data-collapse attribute.
    this._sectionOpen = { identity: true, stats: true };
    // Fresh start vs loaded-from-bestiary affects which sections are open
    // by default on next render. Set to false after a successful load so
    // the long "Stats" / "Identity" sections don't add to the page height
    // when the user is just scanning a loaded monster.
    this._isFreshStart = true;
    this._filters = {
      search: "",       // text match on name
      beingType: "",    // "" = all
      tlRange:   "",    // "" | "0-1" | "1-3" | "3-5" | "5-8" | "8+"
      source:    "",    // "" | "vagabond.bestiary" | "vagabond.humanlike"
    };
  }

  async _prepareContext() {
    const bestiary = await _getBestiaryList();
    const filtered = _filterBestiary(bestiary, this._filters);
    const tokenizer = game.modules.get("vtta-tokenizer");
    const tokenizerAvailable = !!tokenizer?.active && !!tokenizer?.api?.launch;
    const markSelected = (list, current) =>
      list.map((v) => ({ value: v, label: v, selected: v === current }));
    const beingTypeFilterOpts = markSelected(BEING_TYPES, this._filters.beingType);
    const tlFilterOpts = markSelected(TL_RANGE_OPTIONS, this._filters.tlRange)
      .map((o) => ({ ...o, label: `TL ${o.label}` }));
    const sourceFilterOpts = SOURCE_OPTIONS.map((s) => ({
      ...s, selected: s.value === this._filters.source,
    }));
    return {
      data:        this._data,
      preview:     _computePreview(this._data),
      beingTypes:  markSelected(BEING_TYPES, this._data.beingType),
      sizes:       markSelected(SIZES,       this._data.size),
      zones:       markSelected(ZONES,       this._data.zone),
      sourceName:  this._sourceUuid
        ? bestiary.find((b) => b.uuid === this._sourceUuid)?.name
        : null,
      bestiary,
      filtered,
      tokenizerAvailable,
      sectionOpen: this._sectionOpen,
      bestiaryOpen: !!this._sectionOpen.bestiary,
      filters: this._filters,
      beingTypeFilterOpts,
      tlFilterOpts,
      sourceFilterOpts,
      bestiaryTotal:          bestiary.length,
      bestiaryShown:          filtered.length,

      // Checkbox grids (replace the old CSV inputs)
      speedModesGrid: SPEED_MODES.map((m) => {
        const entry = this._data.speedTypes.find((s) => String(s).trim().toLowerCase().split(/\s+/)[0] === m);
        const checked = !!entry;
        // Resolve speed: prefer inline in speedTypes, fall back to speedValues[m]
        let speed = 0;
        if (entry) {
          const [, n] = String(entry).trim().split(/\s+/);
          speed = Number(n) || Number(this._data.speedValues?.[m] ?? 0);
        } else {
          speed = Number(this._data.speedValues?.[m] ?? 0);
        }
        return { value: m, label: _capitalize(m), checked, speed };
      }),
      immunitiesGrid: DAMAGE_TYPES.map((t) => ({
        value: t, label: _capitalize(t),
        checked: this._data.immunities.includes(t),
      })),
      weaknessesGrid: WEAKNESS_TYPES.map((t) => ({
        value: t, label: _labelFor(t, WEAKNESS_LABELS),
        checked: this._data.weaknesses.includes(t),
      })),
      statusImmunitiesGrid: STATUS_CONDITIONS.map((s) => ({
        value: s, label: _capitalize(s),
        checked: this._data.statusImmunities.includes(s),
      })),
      // Collapsible section summaries — open the section by default if it has content
      immunitiesSummary:       _summarize(this._data.immunities),
      weaknessesSummary:       _summarize(this._data.weaknesses, WEAKNESS_LABELS),
      statusImmunitiesSummary: _summarize(this._data.statusImmunities),

      // Live preview text for the big-headline collapsibles
      identitySummary:     _identitySummary(this._data),
      statsSummary:        _statsSummary(this._data),
      descriptionPreview:  _descriptionPreview(this._data.description),
      hasDescription:      !!(this._data.description ?? "").trim(),

      // Open-by-default flags. Fresh-start: Identity + Stats open so the user
      // has something to edit right away. Loaded: everything closed — the
      // summaries show what's selected and the user expands to tweak.
      openIdentity:    this._isFreshStart,
      openStats:       this._isFreshStart,
      openDescription: !!(this._data.description ?? "").trim(),

      // Actions section
      actionsSummary:     _actionsSummary(this._data.actions),
      actionTabs:         ACTION_TABS.map((t) => ({ ...t, active: t.key === this._actionsTab })),
      quickPickTemplates: ACTION_QUICK_PICKS
        .filter((p) => this._actionsTab === "all" || p.category === this._actionsTab)
        .map((p) => ({
          name:       p.name,
          category:   p.category,
          categoryLabel: ATTACK_TYPES.find((t) => t.value === p.category)?.label ?? p.category,
          // Preview damage (first tier or defaults)
          previewDamage: _damageDisplay(
            (p.tiers?.[0]?.rollDamage ?? p.defaults?.rollDamage ?? ""),
            (p.tiers?.[0]?.flatDamage ?? p.defaults?.flatDamage ?? ""),
            (p.tiers?.[0]?.damageType ?? p.defaults?.damageType ?? "-"),
          ),
          tiers: p.tiers?.map((t) => ({ label: t.label })) ?? null,
          hasTiers: !!p.tiers?.length,
        })),
      actionRows: this._data.actions.map((a, index) => ({
        index,
        name: a.name,
        note: a.note,
        recharge: a.recharge,
        rollDamage: a.rollDamage,
        flatDamage: a.flatDamage,
        extraInfo: a.extraInfo ?? "",
        attackTypeOptions: ATTACK_TYPES.map((t) => ({ ...t, selected: t.value === a.attackType })),
        damageTypeOptions: DAMAGE_TYPE_OPTIONS.map((t) => ({ value: t, label: t === "-" ? "—" : _capitalize(t), selected: t === (a.damageType || "-") })),
      })),

      // Abilities section
      abilitiesSummary: _abilitiesSummary(this._data.abilities),
      abilityTemplates: ABILITY_QUICK_PICKS.map((qp) => ({
        name: qp.name,
        description: qp.description ?? "",
        automationStatus: qp.automationStatus,
        automationBadge: _abilityBadge(qp.name) ?? (
          qp.tiers ? _abilityBadge(`${qp.name} ${qp.tiers[0].label}`)
                   : qp.variants ? _abilityBadge(`${qp.name} ${qp.variants[0].label}`) : null
        ),
        // Preview: first tier/variant description (first 70 chars) or the flat description
        representativeShort: _descriptionPreview(
          qp.description ?? qp.tiers?.[0]?.description ?? qp.variants?.[0]?.description ?? ""
        ),
        tiers:    qp.tiers    ? qp.tiers.map((t) => ({ label: t.label }))    : null,
        variants: qp.variants ? qp.variants.map((v) => ({ label: v.label })) : null,
      })),
      abilityRows: this._data.abilities.map((a, index) => ({
        index,
        name: a.name ?? "",
        description: a.description ?? "",
        badge: _abilityBadge(a.name),
      })),

      // Mutations panel
      mutationTabs: MUTATION_TABS.map((t) => ({ ...t, active: t.key === this._mutationsTab })),
      mutationCards: MUTATIONS
        .filter((m) => this._mutationsTab === "all" || _mutationTabFor(m.category) === this._mutationsTab)
        .map((m) => {
          const selected = this._selectedMutations.has(m.id);
          // Only detect conflicts against OTHER selected mutations, not self
          const otherSelected = selected ? new Set([...this._selectedMutations].filter((id) => id !== m.id)) : this._selectedMutations;
          const conflict = getConflict(m.id, [...otherSelected]);
          return {
            id:          m.id,
            name:        m.name,
            category:    m.category,
            type:        m.type,                        // "boon" | "bane"
            tlDelta:     m.tlDelta,
            tlDeltaStr:  (m.tlDelta > 0 ? "+" : "") + m.tlDelta,
            description: m.description,
            selected,
            conflict,                                    // conflict id, or null
            disabled:    !!conflict && !selected,        // can't check if a conflicting one is already picked
          };
        }),
      mutationSelectedCount: this._selectedMutations.size,
      mutationPreview: _mutationPreview(this._data, this._selectedMutations),

      // Token vision
      visionModeOptions: VISION_MODE_OPTIONS.map((o) => ({ ...o, selected: o.value === this._data.visionMode })),
      visionSummary: _visionSummary(this._data),
    };
  }

  _onRender(context, options) {
    super._onRender(context, options);
    const el = this.element;
    this._renderAbort?.abort();
    this._renderAbort = new AbortController();
    const signal = this._renderAbort.signal;

    // Generic change listener: sync form → this._data live.
    // ALWAYS preview-only — we never want a simple field edit (including
    // arrow-key increments on a number input) to blow away the DOM and
    // lose focus. Full re-renders happen only for structural changes
    // (bestiary panel toggle/filter/load, reset, checkbox grids).
    el.querySelectorAll("[name]").forEach((input) => {
      const onChange = () => this._onFieldChange(input);
      input.addEventListener("change", onChange, { signal });
      if (input.tagName !== "SELECT") input.addEventListener("input", onChange, { signal });
    });

    el.querySelector('[data-action="pickPortrait"]')?.addEventListener("click", () => this._pickImage("portraitImg"), { signal });
    el.querySelector('[data-action="pickToken"]')   ?.addEventListener("click", () => this._pickImage("tokenImg"),    { signal });
    el.querySelector('[data-action="tokenize"]')    ?.addEventListener("click", () => this._launchTokenizer(),        { signal });

    // Unified <details> toggle sync — persist every section's open/closed
    // state across re-renders so editing inside an open section doesn't
    // inadvertently collapse it. Keyed by data-collapse attribute.
    el.querySelectorAll("details[data-collapse]").forEach((det) => {
      det.addEventListener("toggle", (ev) => {
        const key = ev.currentTarget.dataset.collapse;
        if (key) this._sectionOpen[key] = ev.currentTarget.open;
      }, { signal });
    });

    el.querySelector('[data-action="filterType"]')?.addEventListener("change", (ev) => {
      this._filters.beingType = ev.currentTarget.value;
      this.render();
    }, { signal });
    el.querySelector('[data-action="filterTL"]')?.addEventListener("change", (ev) => {
      this._filters.tlRange = ev.currentTarget.value;
      this.render();
    }, { signal });
    el.querySelector('[data-action="filterSource"]')?.addEventListener("change", (ev) => {
      this._filters.source = ev.currentTarget.value;
      this.render();
    }, { signal });

    // Search input — live-filter the list WITHOUT a full re-render
    // (avoids losing input focus on every keystroke).
    const searchInput = el.querySelector('[data-action="filterSearch"]');
    if (searchInput) {
      searchInput.addEventListener("input", () => {
        this._filters.search = searchInput.value;
        this._refreshBestiaryListOnly();
      }, { signal });
    }

    // Click a monster row to load
    el.querySelectorAll(".mc-bestiary-item").forEach((row) => {
      row.addEventListener("click", () => {
        const uuid = row.dataset.uuid;
        if (uuid) this._loadFromBestiary(uuid);
      }, { signal });
    });

    // Checkbox grids — toggle a string in the matching array, no full re-render.
    const toggleArray = (field, value, checked) => {
      const arr = this._data[field];
      if (checked) { if (!arr.includes(value)) arr.push(value); }
      else         { this._data[field] = arr.filter((v) => v !== value); }
    };

    const bindCheckboxGrid = (attr, field, details, labelMap = {}) => {
      el.querySelectorAll(`[data-${attr}]`).forEach((cb) => {
        cb.addEventListener("change", (ev) => {
          toggleArray(field, ev.currentTarget.dataset[attr], ev.currentTarget.checked);
          this._refreshCollapsedSummary(details, this._data[field], labelMap);
        }, { signal });
      });
    };
    bindCheckboxGrid("immune",        "immunities",       "immunities");
    bindCheckboxGrid("weak",          "weaknesses",       "weaknesses", WEAKNESS_LABELS);
    bindCheckboxGrid("statusimmune",  "statusImmunities", "statusImmunities");

    // Speed-mode checkboxes — enable/disable the partner number input in-place
    el.querySelectorAll("[data-speedmode]").forEach((cb) => {
      cb.addEventListener("change", (ev) => {
        const mode    = ev.currentTarget.dataset.speedmode;
        const checked = ev.currentTarget.checked;
        const numInput = el.querySelector(`[data-speedspeed="${mode}"]`);
        if (numInput) numInput.disabled = !checked;
        const speed = Number(numInput?.value ?? 0);
        this._setSpeedMode(mode, checked, speed);
      }, { signal });
    });
    el.querySelectorAll("[data-speedspeed]").forEach((num) => {
      num.addEventListener("input", (ev) => {
        const mode  = ev.currentTarget.dataset.speedspeed;
        const speed = Number(ev.currentTarget.value ?? 0);
        // Only store if the checkbox is enabled
        const cb = el.querySelector(`[data-speedmode="${mode}"]`);
        if (cb?.checked) this._setSpeedMode(mode, true, speed);
      }, { signal });
    });

    // ── Actions editor ──────────────────────────────────────────────────

    // Category tab click → switch filtered Quick Picks (needs re-render)
    el.querySelectorAll("[data-action-tab]").forEach((btn) => {
      btn.addEventListener("click", (ev) => {
        this._actionsTab = ev.currentTarget.dataset.actionTab;
        this.render();
      }, { signal });
    });

    // Quick Pick click → add a new action from template (+ optional tier)
    el.querySelectorAll('[data-action="addTemplate"]').forEach((btn) => {
      btn.addEventListener("click", (ev) => {
        const name = ev.currentTarget.dataset.templateName;
        const template = ACTION_QUICK_PICKS.find((p) => p.name === name);
        if (!template) return;
        const tierSel = el.querySelector(`[data-template-tier-for="${name}"]`);
        const tierLabel = tierSel?.value ?? null;
        const newAction = materializeAction(template, tierLabel);
        this._data.actions.push(newAction);
        this.render();
      }, { signal });
    });

    // Per-action field edit → in-place state update + live summary/preview
    el.querySelectorAll("[data-action-field]").forEach((input) => {
      const onEdit = (ev) => {
        const row = ev.currentTarget.closest("[data-action-index]");
        const index = Number(row?.dataset.actionIndex);
        if (!Number.isFinite(index)) return;
        const field = ev.currentTarget.dataset.actionField;
        const action = this._data.actions[index];
        if (!action) return;
        action[field] = ev.currentTarget.value;
        this._refreshActionsSummary();
        this._refreshPreviewLine();
      };
      input.addEventListener("input", onEdit, { signal });
      input.addEventListener("change", onEdit, { signal });
    });

    // Delete action row
    el.querySelectorAll('[data-action="deleteAction"]').forEach((btn) => {
      btn.addEventListener("click", (ev) => {
        const row = ev.currentTarget.closest("[data-action-index]");
        const index = Number(row?.dataset.actionIndex);
        if (!Number.isFinite(index)) return;
        this._data.actions.splice(index, 1);
        this.render();
      }, { signal });
    });

    // ── Abilities editor ────────────────────────────────────────────────

    el.querySelectorAll('[data-action="addAbilityTemplate"]').forEach((btn) => {
      btn.addEventListener("click", (ev) => {
        const name = ev.currentTarget.dataset.templateName;
        const template = ABILITY_QUICK_PICKS.find((q) => q.name === name);
        if (!template) return;
        const tierSel = el.querySelector(`[data-ability-tier-for="${name}"]`);
        const selectedLabel = tierSel?.value ?? null;
        const newAbility = materializeAbility(template, selectedLabel);
        this._data.abilities.push(newAbility);
        this.render();
      }, { signal });
    });

    // Per-ability field edit
    el.querySelectorAll("[data-ability-field]").forEach((input) => {
      const onEdit = (ev) => {
        const row = ev.currentTarget.closest("[data-ability-index]");
        const index = Number(row?.dataset.abilityIndex);
        if (!Number.isFinite(index)) return;
        const field = ev.currentTarget.dataset.abilityField;
        const ability = this._data.abilities[index];
        if (!ability) return;
        ability[field] = ev.currentTarget.value;
        // Name change can flip automation status → a full re-render refreshes badges.
        // Description edits are in-place (don't need re-render).
        if (field === "name") this.render();
        else                  this._refreshAbilitiesSummary();
      };
      input.addEventListener("input", onEdit, { signal });
      input.addEventListener("change", onEdit, { signal });
    });

    el.querySelectorAll('[data-action="deleteAbility"]').forEach((btn) => {
      btn.addEventListener("click", (ev) => {
        const row = ev.currentTarget.closest("[data-ability-index]");
        const index = Number(row?.dataset.abilityIndex);
        if (!Number.isFinite(index)) return;
        this._data.abilities.splice(index, 1);
        this.render();
      }, { signal });
    });

    // ── Mutations panel ─────────────────────────────────────────────────
    el.querySelectorAll("[data-mutation-tab]").forEach((btn) => {
      btn.addEventListener("click", (ev) => {
        this._mutationsTab = ev.currentTarget.dataset.mutationTab;
        this.render();
      }, { signal });
    });
    el.querySelectorAll("[data-mutation-id]").forEach((cb) => {
      cb.addEventListener("change", (ev) => {
        this._toggleMutation(ev.currentTarget.dataset.mutationId, ev.currentTarget.checked);
      }, { signal });
    });
    el.querySelector('[data-action="rollRandomMutation"]')?.addEventListener("click", () => this._rollRandomMutation(), { signal });
    el.querySelector('[data-action="applyMutations"]')?.addEventListener("click", () => this._applyMutations(), { signal });
    el.querySelector('[data-action="clearMutations"]')?.addEventListener("click", () => this._clearMutationSelection(), { signal });

    // ── Token vision fields ─────────────────────────────────────────────
    // When the Infinite checkbox toggles we re-render so the number input's
    // disabled state matches. All other vision fields update in-place and
    // refresh only the collapsed-header summary.
    el.querySelectorAll("[data-vision-field]").forEach((input) => {
      const onChange = (ev) => {
        const name = ev.currentTarget.dataset.visionField;
        let value;
        if (input.type === "checkbox")  value = ev.currentTarget.checked;
        else if (input.type === "number") value = Number(ev.currentTarget.value);
        else                              value = ev.currentTarget.value;
        this._data[name] = value;
        if (name === "visionInfinite") {
          this.render();
        } else {
          this._refreshVisionSummary();
        }
      };
      input.addEventListener("change", onChange, { signal });
      if (input.tagName !== "SELECT" && input.type !== "checkbox") {
        input.addEventListener("input", onChange, { signal });
      }
    });
    el.querySelector('[data-action="autoVisionFromSenses"]')?.addEventListener("click", () => this._autoVisionFromSenses(), { signal });

    el.querySelector('[data-action="reset"]') ?.addEventListener("click", () => this._reset(),  { signal });
    el.querySelector('[data-action="cancel"]')?.addEventListener("click", () => this.close(),   { signal });
    el.querySelector('[data-action="save"]')  ?.addEventListener("click", () => this._save(),   { signal });
  }

  _onFieldChange(input) {
    const name = input.name;
    let value = input.value;
    if (input.type === "number") value = Number(value);
    this._data[name] = value;
    this._refreshPreviewLine();
    this._refreshHeaderSummaries();
  }

  /** Update the Identity / Stats / Description collapsed-header previews
   *  in-place so the user can see their edits reflected without expanding
   *  or re-rendering the form. */
  _refreshHeaderSummaries() {
    const el = this.element;
    if (!el) return;
    const updates = {
      identity:    _identitySummary(this._data),
      stats:       _statsSummary(this._data),
      description: _descriptionPreview(this._data.description),
    };
    for (const [key, text] of Object.entries(updates)) {
      const previewEl = el.querySelector(`[data-collapse="${key}"] > summary .mc-collapse-preview`);
      if (!previewEl) continue;
      if (key === "description") {
        if (text) {
          previewEl.textContent = text;
          previewEl.classList.remove("mc-empty");
        } else {
          previewEl.textContent = "no description";
          previewEl.classList.add("mc-empty");
        }
      } else {
        previewEl.textContent = text;
      }
    }
  }

  /** Update the count pill + preview text inside a collapsible's <summary>
   *  without re-rendering. Keeps `<details open>` state intact. */
  _refreshCollapsedSummary(key, arr, labelMap = {}) {
    const el = this.element?.querySelector(`[data-collapse="${key}"] > summary .mc-collapse-summary`);
    if (!el) return;
    const summary = _summarize(arr, labelMap);
    if (summary.hasAny) {
      el.innerHTML = `<span class="mc-pill">${summary.count}</span><span class="mc-collapse-preview">${foundry.utils.escapeHTML(summary.preview)}</span>`;
    } else {
      el.innerHTML = `<span class="mc-collapse-preview mc-empty">none</span>`;
    }
  }

  _refreshPreviewLine() {
    const preview = _computePreview(this._data);
    const el = this.element?.querySelector(".mc-preview-line");
    if (!el) return;
    const actionsCount = this._data.actions?.length ?? 0;
    const dprStr = actionsCount ? `${preview.dpr}` : "— (no actions)";
    el.textContent = `HP ${preview.hp} · TL ${preview.tl} · DPR ${dprStr}`;
  }

  /** Live-update the Abilities collapsed-header summary. */
  _refreshVisionSummary() {
    const el = this.element?.querySelector('[data-collapse="vision"] > summary .mc-collapse-preview');
    if (!el) return;
    el.textContent = _visionSummary(this._data);
  }

  /** Apply the senses → vision heuristic on demand. Doesn't touch fields
   *  the user has already customized beyond defaults. */
  _autoVisionFromSenses() {
    const derived = _visionFromSenses(this._data.senses);
    if (!derived) {
      ui.notifications.warn("No known sense keyword in the Senses field.");
      return;
    }
    this._data.visionEnabled  = derived.enabled;
    this._data.visionMode     = derived.mode;
    this._data.visionRange    = derived.range === null ? 0 : derived.range;
    this._data.visionInfinite = derived.range === null;
    this._data.visionAngle    = this._data.visionAngle || 360;
    this.render();
    ui.notifications.info(`Token vision set from Senses: ${_visionSummary(this._data)}`);
  }

  _refreshAbilitiesSummary() {
    const el = this.element?.querySelector('[data-collapse="abilities"] > summary .mc-collapse-summary');
    if (!el) return;
    const { count, preview } = _abilitiesSummary(this._data.abilities);
    if (count) {
      el.innerHTML = `<span class="mc-pill">${count}</span><span class="mc-collapse-preview">${foundry.utils.escapeHTML(preview)}</span>`;
    } else {
      el.innerHTML = `<span class="mc-collapse-preview mc-empty">none</span>`;
    }
  }

  /** Live-update the Actions collapsed-header summary (count + preview)
   *  without re-rendering. Preserves the open/closed state of the section. */
  _refreshActionsSummary() {
    const el = this.element?.querySelector('[data-collapse="actions"] > summary .mc-collapse-summary');
    if (!el) return;
    const { count, preview } = _actionsSummary(this._data.actions);
    if (count) {
      el.innerHTML = `<span class="mc-pill">${count}</span><span class="mc-collapse-preview">${foundry.utils.escapeHTML(preview)}</span>`;
    } else {
      el.innerHTML = `<span class="mc-collapse-preview mc-empty">none</span>`;
    }
  }

  /** Launch the vtta-tokenizer module with the current portrait/token as
   *  starting points. Its callback fires with `{ avatarFilename, tokenFilename }`
   *  holding the uploaded Foundry paths — write those back to form state. */
  async _launchTokenizer() {
    const api = game.modules.get("vtta-tokenizer")?.api;
    if (!api?.launch) {
      ui.notifications.warn("Tokenizer module isn't active.");
      return;
    }
    const name = this._data.name?.trim() || "Monster";
    const options = {
      type:            "npc",
      name,
      avatarFilename:  this._data.portraitImg && this._data.portraitImg !== DEFAULT_PORTRAIT ? this._data.portraitImg : "",
      tokenFilename:   this._data.tokenImg    && this._data.tokenImg    !== DEFAULT_PORTRAIT ? this._data.tokenImg    : "",
      isWildCard:      false,
    };
    try {
      api.launch(options, (result) => {
        if (!result) return;
        let updated = false;
        if (result.avatarFilename) { this._data.portraitImg = result.avatarFilename; updated = true; }
        if (result.tokenFilename)  { this._data.tokenImg    = result.tokenFilename;  updated = true; }
        if (updated) {
          ui.notifications.info("Tokenizer: portrait + token updated.");
          this.render();
        }
      });
    } catch (err) {
      console.error(`${MODULE_ID} | Tokenizer launch failed`, err);
      ui.notifications.error("Failed to open Tokenizer — see console.");
    }
  }

  async _pickImage(field) {
    const current = this._data[field] || DEFAULT_PORTRAIT;
    const fp = new foundry.applications.apps.FilePicker.implementation({
      type:     "image",
      current,
      callback: (path) => {
        this._data[field] = path;
        this.render();
      },
    });
    fp.browse();
  }

  /** Re-render only the bestiary list + count in-place.
   *  Used for search-as-you-type to preserve input focus. */
  async _refreshBestiaryListOnly() {
    const el = this.element;
    if (!el) return;
    const list = await _getBestiaryList();
    const filtered = _filterBestiary(list, this._filters);
    const countEl = el.querySelector(".mc-bestiary-count");
    const listEl  = el.querySelector(".mc-bestiary-list");
    if (countEl) countEl.textContent = `Showing ${filtered.length} of ${list.length}`;
    if (!listEl) return;
    if (filtered.length === 0) {
      listEl.innerHTML = `<div class="mc-bestiary-empty">No monsters match these filters.</div>`;
      return;
    }
    listEl.innerHTML = filtered.map((m) => `
      <div class="mc-bestiary-item" data-uuid="${m.uuid}">
        <span class="mc-bestiary-tl">${m.tl}</span>
        <span class="mc-bestiary-name">${foundry.utils.escapeHTML(m.name)}</span>
        <span class="mc-bestiary-meta">${foundry.utils.escapeHTML(m.beingType)}</span>
      </div>
    `).join("");
    // Re-attach click handlers using the existing abort signal
    const signal = this._renderAbort?.signal;
    listEl.querySelectorAll(".mc-bestiary-item").forEach((row) => {
      row.addEventListener("click", () => {
        const uuid = row.dataset.uuid;
        if (uuid) this._loadFromBestiary(uuid);
      }, { signal });
    });
  }

  /** Load raw actor-shape data (not a Document) into the form.
   *  Used by MonsterCreator.openWithData() for the Mutate-tab handoff. */
  _loadFromActorShape(actorObject) {
    this._data = _fromCompendiumActor(actorObject);
    this._sourceUuid = null;
    this._isFreshStart = false;
    this._sectionOpen = {};
  }

  async _loadFromBestiary(uuid) {
    try {
      const actor = await fromUuid(uuid);
      if (!actor) { ui.notifications.warn("Could not load that actor."); return; }
      this._data = _fromCompendiumActor(actor);
      this._sourceUuid = uuid;
      this._isFreshStart = false;   // loaded content: collapse everything; user expands to edit
      this._sectionOpen = {};       // close every section after a load
      ui.notifications.info(`Loaded "${actor.name}" from ${uuid.split(".")[1]}.`);
      this.render();
    } catch (err) {
      console.error(`${MODULE_ID} | Monster Creator: load failed`, err);
      ui.notifications.error("Failed to load from bestiary — see console.");
    }
  }

  /**
   * Canonicalize a speed mode's on/off state + speed into BOTH `speedTypes`
   * and `speedValues` so the saved actor works regardless of which form
   * downstream code reads.
   */
  _setSpeedMode(mode, enabled, speed) {
    // Remove any existing entry for this mode
    this._data.speedTypes = this._data.speedTypes.filter((s) => String(s).trim().toLowerCase().split(/\s+/)[0] !== mode);
    if (enabled) {
      this._data.speedTypes.push(speed > 0 ? `${mode} ${speed}` : mode);
      this._data.speedValues[mode] = speed;
    } else {
      this._data.speedValues[mode] = 0;
    }
  }

  _reset() {
    this._data = _blankMonster();
    this._sourceUuid = null;
    this._isFreshStart = true;
    this._sectionOpen = { identity: true, stats: true };
    this._selectedMutations.clear();
    this.render();
  }

  /** Toggle a mutation checkbox. */
  _toggleMutation(id, checked) {
    if (checked) {
      // Block if the click would create a conflict
      if (getConflict(id, [...this._selectedMutations])) return;
      this._selectedMutations.add(id);
    } else {
      this._selectedMutations.delete(id);
    }
    this.render();
  }

  /** Pick one random untouched boon + its suggested bane (or a random bane).
   *  Matches the HTML Monster Creator's "Roll Random" action. */
  _rollRandomMutation() {
    const boons = getBoons().filter((b) => !this._selectedMutations.has(b.id) && !getConflict(b.id, [...this._selectedMutations]));
    if (!boons.length) { ui.notifications.warn("No eligible boons left to roll."); return; }
    const boon = boons[Math.floor(Math.random() * boons.length)];
    this._selectedMutations.add(boon.id);

    // Suggested bane first; fall back to any eligible bane
    const suggestedBane = boon.suggestedBane ? getMutation(boon.suggestedBane) : null;
    let bane = suggestedBane;
    if (!bane || this._selectedMutations.has(bane.id) || getConflict(bane.id, [...this._selectedMutations])) {
      const banes = getBanes().filter((b) => !this._selectedMutations.has(b.id) && !getConflict(b.id, [...this._selectedMutations]));
      bane = banes[Math.floor(Math.random() * banes.length)] ?? null;
    }
    if (bane) this._selectedMutations.add(bane.id);
    this.render();
  }

  /** Bake all selected mutations into `this._data`, clear the selection,
   *  and update the form. The user can then refine or stack another round. */
  _applyMutations() {
    if (!this._selectedMutations.size) {
      ui.notifications.warn("No mutations selected.");
      return;
    }
    const shape = _dataToActorShape(this._data);
    const { prefixes, suffixes } = applyMutations(shape, [...this._selectedMutations]);

    // Preserve current name if the user has set one non-default; otherwise
    // apply the mutation-generated name for flavor.
    // Dedupe: skip any prefix/suffix that's already present in the current
    // name so stacking the same mutation family twice doesn't double-prepend.
    const baseName = this._data.name?.trim() || shape.name || "";
    const hasWord = (word) => new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(baseName);
    const newPrefixes = prefixes.filter((p) => !hasWord(p));
    const newSuffixes = suffixes.filter((s) => !hasWord(s));
    const newName  = newPrefixes.length || newSuffixes.length
      ? generateMutatedName(baseName, newPrefixes, newSuffixes)
      : baseName;

    this._data = _actorShapeToData(shape, this._data);
    this._data.name = newName;
    this._selectedMutations.clear();
    ui.notifications.info(`Applied ${[...prefixes, ...suffixes].length} mutation(s) to form.`);
    this.render();
  }

  _clearMutationSelection() {
    if (!this._selectedMutations.size) return;
    this._selectedMutations.clear();
    this.render();
  }

  async _save() {
    if (!this._data.name.trim()) {
      ui.notifications.warn("Name required before saving.");
      return;
    }
    try {
      const actorData = _buildActorData(this._data);
      const created = await Actor.create(actorData);
      if (created) {
        ui.notifications.info(`Created world actor: ${created.name}`);
        this.close();
      }
    } catch (err) {
      console.error(`${MODULE_ID} | Monster Creator: save failed`, err);
      ui.notifications.error("Save failed — see console.");
    }
  }

  async close(options) {
    this._renderAbort?.abort();
    return super.close(options);
  }
}
