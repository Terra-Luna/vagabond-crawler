/**
 * Audit Analyzer — pure-JS analysis of monsters.json
 *
 * Reads docs/audit/monsters.json and produces:
 *   - docs/audit/abilities.json  (unique abilities + automation status)
 *   - docs/audit/actions.json    (unique action patterns)
 *   - docs/audit/findings.json   (dead-ability-text + data-inconsistency findings)
 *
 * Run with Node 20+:
 *   node scripts/audit/analyze.mjs
 *
 * Pure functions: no Foundry dependency, no filesystem side effects outside
 * writeFileSync. Deterministic output ordering (sort keys are alphabetical).
 */

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { STATUS_IDS, STATUS_LABELS, findStatusMentions } from "./status-vocabulary.mjs";

// ── Paths ─────────────────────────────────────────────────────────────────────

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..", "..");
const IN_MONSTERS    = resolve(ROOT, "docs", "audit", "monsters.json");
const OUT_ABILITIES  = resolve(ROOT, "docs", "audit", "abilities.json");
const OUT_ACTIONS    = resolve(ROOT, "docs", "audit", "actions.json");
const OUT_FINDINGS   = resolve(ROOT, "docs", "audit", "findings.json");

// ── PASSIVE_ABILITIES mirror ──────────────────────────────────────────────────
// Must match scripts/npc-abilities.mjs exactly. When that file changes, update here.

const PASSIVE_ABILITIES = {
  "Magic Ward I":   { type: "castPenalty",   penaltyDie: "1d4" },
  "Magic Ward II":  { type: "castPenalty",   penaltyDie: "1d6" },
  "Magic Ward III": { type: "castPenalty",   penaltyDie: "1d8" },
  "Pack Instincts": { type: "packInstincts" },
  "Pack Tactics":   { type: "packInstincts" },
};

/**
 * A subset of abilities that are known to have a *correct* mechanical
 * expectation even though the module's implementation doesn't match.
 * `expectedRule` explains what compendium text actually says.
 * `implementedRule` explains what scripts/npc-abilities.mjs actually does.
 * A `broken` verdict fires if PASSIVE_ABILITIES.type is `castPenalty` but
 * the description matches the mana-cost phrasing.
 */
const KNOWN_BROKEN_RULES = {
  "Magic Ward I": {
    expectedRule: "The caster of a spell targeting this being pays +1 Mana the first time per round.",
    implementedRule: "Injects 1d4 penalty die into the caster's Cast Check d20.",
  },
  "Magic Ward II": {
    expectedRule: "The caster pays +2 Mana the first time per round.",
    implementedRule: "Injects 1d6 penalty die into the caster's Cast Check d20.",
  },
  "Magic Ward III": {
    expectedRule: "The caster pays +3 Mana the first time per round.",
    implementedRule: "Injects 1d8 penalty die into the caster's Cast Check d20.",
  },
};

// ── Utilities ────────────────────────────────────────────────────────────────

function readJSON(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function writeJSON(path, data) {
  writeFileSync(path, JSON.stringify(data, null, 2) + "\n", "utf8");
}

function isEmptyDamage(action) {
  const flat = String(action.flatDamage ?? "").trim();
  const roll = String(action.rollDamage ?? "").trim();
  return (flat === "" || flat === "0") && (roll === "" || roll === "0");
}

/** Normalize a damage-dice expression for de-dup bucketing. */
function normalizeRoll(r) {
  return String(r ?? "").trim().toLowerCase().replace(/\s+/g, "");
}

/** Find keyword clusters suggesting mechanical text in an ability description. */
function analyzeAbilityText(text) {
  const t = String(text ?? "");
  const mentions = {
    statuses: findStatusMentions(t),
    mechanicalVerbs: [],
    durationMarkers: [],
    saveKeywords: [],
    numericEffects: [],
  };

  const verbPatterns = [
    [/takes?\s+[\d+d]+\s+.*?damage/i,              "takes-damage"],
    [/regain(?:s)?\s+\d+\s*(?:\(\d+[dD]\d+\))?\s*HP/i, "regains-hp"],
    [/must\s+pass/i,                                "must-pass"],
    [/must\s+spend(?:\s+an\s+extra)?\s+\d+\s+Mana/i, "must-spend-mana"],
    [/deal(?:s)?\s+\d+/i,                           "deals-damage"],
    [/heal(?:s|ed)?\s+\d+/i,                        "heals"],
    [/\+\d+\s+Fatigue/i,                            "adds-fatigue"],
    [/half\s+damage/i,                              "half-damage"],
    [/Favored\b/,                                   "favored"],
    [/Hindered\b/,                                  "hindered"],
  ];
  for (const [re, tag] of verbPatterns) {
    if (re.test(t)) mentions.mechanicalVerbs.push(tag);
  }

  const durRe = /\bCd\s*\d+\b/gi;
  const durMatches = t.match(durRe);
  if (durMatches) mentions.durationMarkers = [...new Set(durMatches.map((m) => m.toLowerCase().replace(/\s+/g, "")))];

  for (const kw of ["Endure", "Reflex", "Will", "Check"]) {
    const re = new RegExp(`\\b${kw}\\b`);
    if (re.test(t)) mentions.saveKeywords.push(kw);
  }

  const numRe = /\b\d+(?:d\d+)?\b/g;
  mentions.numericEffects = (t.match(numRe) ?? []).slice(0, 5);

  return mentions;
}

function isFlavorOnly(mentions) {
  return (
    mentions.statuses.length === 0 &&
    mentions.mechanicalVerbs.length === 0 &&
    mentions.durationMarkers.length === 0 &&
    mentions.saveKeywords.length === 0
  );
}

/** Match "| Endure" / "| Reflex" / "| Will" in a note string. Returns lowercase set. */
function extractNoteSaveTypes(note) {
  const t = String(note ?? "");
  const saves = new Set();
  if (/\bEndure\b/i.test(t)) saves.add("endure");
  if (/\bReflex\b/i.test(t)) saves.add("reflex");
  if (/\bWill\b/i.test(t))   saves.add("will");
  return saves;
}

const ELEMENTAL_NAME_RE = /\b(fire|cold|poison|acid|shock|lightning|frost|flame|breath|radiant|necrotic|psychic|arcane)\b/i;

// ── Ability analysis ─────────────────────────────────────────────────────────

function buildAbilitiesIndex(monsters) {
  const byName = new Map(); // name -> { monsters: [{uuid, description}], variantTexts: Set }

  for (const m of monsters) {
    for (const ab of m.abilities) {
      const name = String(ab.name ?? "").trim();
      if (!name) continue;
      if (!byName.has(name)) byName.set(name, { monsters: [], variantTexts: new Set() });
      const rec = byName.get(name);
      rec.monsters.push({ uuid: m.uuid, description: String(ab.description ?? "") });
      rec.variantTexts.add(String(ab.description ?? "").trim());
    }
  }

  const out = [];
  for (const [name, rec] of [...byName.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    const representativeText = rec.monsters.find((e) => e.description)?.description ?? "";
    const textVariants = rec.variantTexts.size;

    const passive = PASSIVE_ABILITIES[name];
    const mentions = analyzeAbilityText(representativeText);
    const flavor = isFlavorOnly(mentions);
    const knownBroken = KNOWN_BROKEN_RULES[name];

    let automationStatus = "unknown";
    let reason = "";

    if (passive && passive.type === "castPenalty" && knownBroken) {
      // Compendium text describes mana cost; automation injects roll penalty → broken.
      if (/must\s+spend(?:\s+an\s+extra)?\s+\d+\s+Mana/i.test(representativeText)) {
        automationStatus = "broken";
        reason = `Compendium text describes a Mana-cost penalty; scripts/npc-abilities.mjs injects a roll-penalty die (${passive.penaltyDie}) instead.`;
      } else {
        automationStatus = "unknown";
        reason = "PASSIVE_ABILITIES entry exists but description doesn't match expected mana-cost phrasing.";
      }
    } else if (passive) {
      automationStatus = "implemented";
      reason = `Matched scripts/npc-abilities.mjs PASSIVE_ABILITIES entry (type: ${passive.type}).`;
    } else if (flavor) {
      automationStatus = "flavor";
      reason = "Description contains no mechanical keywords.";
    } else {
      automationStatus = "unimplemented";
      reason = "Description mentions mechanical effects but no PASSIVE_ABILITIES entry exists.";
    }

    out.push({
      name,
      count: rec.monsters.length,
      monsters: rec.monsters.map((e) => e.uuid).sort(),
      representativeText,
      textVariants,
      automationStatus,
      reason,
      keywords: {
        statuses: mentions.statuses,
        mechanicalVerbs: mentions.mechanicalVerbs,
        durationMarkers: mentions.durationMarkers,
        saveKeywords: mentions.saveKeywords,
      },
    });
  }
  return out;
}

// ── Action analysis ──────────────────────────────────────────────────────────

function buildActionsIndex(monsters) {
  const byName = new Map();

  for (const m of monsters) {
    for (const a of m.actions) {
      const name = String(a.name ?? "").trim();
      if (!name) continue;
      if (!byName.has(name)) {
        byName.set(name, {
          monsters: [],
          attackTypes: {},
          damageTypes: {},
          rollVariants: new Set(),
          flatMin: null, flatMax: null,
          hasCausedStatuses: 0,
          hasRecharge: 0,
        });
      }
      const rec = byName.get(name);
      rec.monsters.push(m.uuid);

      const at = a.attackType || "(none)";
      rec.attackTypes[at] = (rec.attackTypes[at] ?? 0) + 1;

      const dt = a.damageType || "(none)";
      rec.damageTypes[dt] = (rec.damageTypes[dt] ?? 0) + 1;

      const roll = normalizeRoll(a.rollDamage);
      if (roll) rec.rollVariants.add(roll);

      const flatNum = Number(a.flatDamage);
      if (Number.isFinite(flatNum)) {
        if (rec.flatMin === null || flatNum < rec.flatMin) rec.flatMin = flatNum;
        if (rec.flatMax === null || flatNum > rec.flatMax) rec.flatMax = flatNum;
      }

      if (Array.isArray(a.causedStatuses) && a.causedStatuses.length > 0) rec.hasCausedStatuses++;
      if (String(a.recharge ?? "").trim()) rec.hasRecharge++;
    }
  }

  const out = [];
  for (const [name, rec] of [...byName.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    out.push({
      name,
      count: rec.monsters.length,
      monsters: [...rec.monsters].sort(),
      attackTypes: rec.attackTypes,
      damageTypes: rec.damageTypes,
      flatDamageRange: (rec.flatMin === null || rec.flatMax === null)
        ? null
        : [rec.flatMin, rec.flatMax],
      rollDamageVariants: [...rec.rollVariants].sort(),
      hasCausedStatuses: rec.hasCausedStatuses,
      hasRecharge: rec.hasRecharge,
    });
  }
  return out;
}

// ── Findings ─────────────────────────────────────────────────────────────────

function buildFindings(monsters, abilitiesIndex) {
  const findings = [];
  const push = (f) => findings.push(f);

  const STATUS_SET = new Set(STATUS_IDS);

  // ── Dead ability text ─────────────────────────────────────────────────────

  // 1. Broken automation (from abilities index)
  for (const ab of abilitiesIndex) {
    if (ab.automationStatus === "broken") {
      push({
        id: `broken-automation:${ab.name}`,
        category: "dead-ability-text",
        subcategory: "broken-automation",
        severity: "error",
        message: ab.reason,
        affectedMonsters: ab.monsters.map((uuid) => {
          const m = monsters.find((mm) => mm.uuid === uuid);
          return { uuid, name: m?.name ?? "(unknown)", detail: "" };
        }),
      });
    }
  }

  // 2. Unimplemented passive automation — ability mentions mechanical effects
  //    but no PASSIVE_ABILITIES entry and no matching action on any monster
  //    that has this ability.
  for (const ab of abilitiesIndex) {
    if (ab.automationStatus !== "unimplemented") continue;
    // Only surface when at least one mechanical keyword or status was detected
    const hasSignal =
      ab.keywords.statuses.length > 0 ||
      ab.keywords.mechanicalVerbs.length > 0 ||
      ab.keywords.saveKeywords.length > 0;
    if (!hasSignal) continue;

    push({
      id: `unimplemented-ability:${ab.name}`,
      category: "dead-ability-text",
      subcategory: "unimplemented-passive",
      severity: "warning",
      message: `Ability "${ab.name}" describes mechanical effects (${[
        ...ab.keywords.statuses,
        ...ab.keywords.mechanicalVerbs,
      ].join(", ") || "—"}) but has no automation in scripts/npc-abilities.mjs.`,
      affectedMonsters: ab.monsters.map((uuid) => {
        const m = monsters.find((mm) => mm.uuid === uuid);
        return { uuid, name: m?.name ?? "(unknown)", detail: ab.representativeText.slice(0, 160) };
      }),
    });
  }

  // 3. Per-monster: ability text mentions a status, but no action on same monster
  //    has a causedStatuses entry with that statusId.
  for (const m of monsters) {
    const monsterActionStatusIds = new Set();
    for (const a of m.actions) {
      for (const cs of a.causedStatuses ?? []) {
        if (cs?.statusId) monsterActionStatusIds.add(String(cs.statusId).toLowerCase());
      }
      for (const cs of a.critCausedStatuses ?? []) {
        if (cs?.statusId) monsterActionStatusIds.add(String(cs.statusId).toLowerCase());
      }
    }
    for (const ab of m.abilities) {
      if (PASSIVE_ABILITIES[ab.name]) continue;
      const mentions = findStatusMentions(ab.description ?? "");
      const unmatched = mentions.filter((id) => !monsterActionStatusIds.has(id));
      if (unmatched.length === 0) continue;
      push({
        id: `unmatched-status:${m.uuid}:${ab.name}:${unmatched.join(",")}`,
        category: "dead-ability-text",
        subcategory: "ability-mentions-status-without-action",
        severity: "warning",
        message: `Ability "${ab.name}" on ${m.name} mentions ${unmatched.map((s) => STATUS_LABELS[s] ?? s).join(", ")}, but no action on this monster applies those statuses.`,
        affectedMonsters: [{ uuid: m.uuid, name: m.name, detail: ab.description?.slice(0, 200) ?? "" }],
      });
    }
  }

  // ── Data inconsistencies ──────────────────────────────────────────────────

  for (const m of monsters) {
    // 1 & 2: Speed conflicts and ambiguities
    const speedValues = m.speedValues ?? {};
    for (const typedEntry of m.speedTypes) {
      const parts = String(typedEntry).trim().split(/\s+/);
      const type = parts[0]?.toLowerCase();
      const inlineSpeed = parts[1] !== undefined ? Number(parts[1]) : null;
      const sv = Number(speedValues[type] ?? 0);

      if (inlineSpeed !== null && Number.isFinite(inlineSpeed) && inlineSpeed > 0 && sv > 0) {
        push({
          id: `speed-conflict:${m.uuid}:${type}`,
          category: "data-inconsistency",
          subcategory: "speed-conflict",
          severity: "warning",
          message: `${m.name}: speedTypes has inline "${typedEntry}" AND speedValues.${type}=${sv}. Only one should be set.`,
          affectedMonsters: [{ uuid: m.uuid, name: m.name, detail: `speedTypes=${JSON.stringify(m.speedTypes)} speedValues.${type}=${sv}` }],
        });
      } else if (inlineSpeed === null && sv === 0) {
        push({
          id: `speed-ambiguous:${m.uuid}:${type}`,
          category: "data-inconsistency",
          subcategory: "speed-ambiguous",
          severity: "info",
          message: `${m.name}: speedTypes entry "${typedEntry}" has no speed and speedValues.${type} is 0. Implicit base speed? Intent unclear.`,
          affectedMonsters: [{ uuid: m.uuid, name: m.name, detail: `speedTypes=${JSON.stringify(m.speedTypes)}` }],
        });
      }
    }

    // 3 & 4: Per-action damage + element checks
    for (const a of m.actions) {
      const damageless = isEmptyDamage(a);

      // 3. Damageless requiresDamage
      for (const cs of a.causedStatuses ?? []) {
        if (cs?.requiresDamage === true && damageless) {
          push({
            id: `damageless-requiresDamage:${m.uuid}:${a.name}:${cs.statusId}`,
            category: "data-inconsistency",
            subcategory: "damageless-requiresDamage",
            severity: "warning",
            message: `${m.name} / "${a.name}": causedStatus "${cs.statusId}" has requiresDamage=true but the action deals no damage — status can never apply by that rule.`,
            affectedMonsters: [{ uuid: m.uuid, name: m.name, detail: `flatDamage="${a.flatDamage}" rollDamage="${a.rollDamage}"` }],
          });
        }
      }

      // 4. Elemental name with damageType "-"
      if (a.name && ELEMENTAL_NAME_RE.test(a.name) && a.damageType === "-" && !damageless) {
        push({
          id: `elemental-untyped:${m.uuid}:${a.name}`,
          category: "data-inconsistency",
          subcategory: "elemental-name-untyped",
          severity: "info",
          message: `${m.name} / "${a.name}": name suggests elemental damage but damageType is "-".`,
          affectedMonsters: [{ uuid: m.uuid, name: m.name, detail: `name="${a.name}" damageType="${a.damageType}"` }],
        });
      }

      // 5. Extra-info status mention mismatch
      const extraInfoStatuses = findStatusMentions(a.extraInfo ?? "");
      const actionStatusIds = new Set((a.causedStatuses ?? []).map((cs) => String(cs?.statusId ?? "").toLowerCase()));
      const extraMissing = extraInfoStatuses.filter((id) => !actionStatusIds.has(id));
      if (extraMissing.length > 0) {
        push({
          id: `extrainfo-status-mismatch:${m.uuid}:${a.name}:${extraMissing.join(",")}`,
          category: "data-inconsistency",
          subcategory: "extraInfo-status-mismatch",
          severity: "warning",
          message: `${m.name} / "${a.name}": extraInfo mentions ${extraMissing.map((s) => STATUS_LABELS[s] ?? s).join(", ")} but causedStatuses does not include these ids.`,
          affectedMonsters: [{ uuid: m.uuid, name: m.name, detail: `extraInfo="${a.extraInfo}"` }],
        });
      }

      // 6. Save-mention mismatch — note has save keyword but no causedStatus uses it
      const noteSaves = extractNoteSaveTypes(a.note);
      if (noteSaves.size > 0) {
        const hasMatching = (a.causedStatuses ?? []).some((cs) => {
          const st = String(cs?.saveType ?? "").toLowerCase();
          return noteSaves.has(st);
        });
        if (!hasMatching && (a.causedStatuses?.length ?? 0) === 0 && damageless) {
          // Only flag when the action is essentially a pure save effect with no damage
          // AND no causedStatuses at all — that's the clear mismatch. Damage-dealing
          // actions often use save-keyword in the note to indicate half-on-pass, which
          // doesn't require a causedStatus.
          push({
            id: `save-mention-orphan:${m.uuid}:${a.name}`,
            category: "data-inconsistency",
            subcategory: "save-mention-orphan",
            severity: "info",
            message: `${m.name} / "${a.name}": note mentions save type(s) ${[...noteSaves].join(", ")} but action has no causedStatuses and no damage.`,
            affectedMonsters: [{ uuid: m.uuid, name: m.name, detail: `note="${a.note}"` }],
          });
        }
      }

      // 7. Unknown statusId
      for (const cs of [...(a.causedStatuses ?? []), ...(a.critCausedStatuses ?? [])]) {
        const sid = String(cs?.statusId ?? "").toLowerCase();
        if (sid && !STATUS_SET.has(sid)) {
          push({
            id: `unknown-statusId:${m.uuid}:${a.name}:${sid}`,
            category: "data-inconsistency",
            subcategory: "unknown-statusId",
            severity: "error",
            message: `${m.name} / "${a.name}": causedStatus uses unknown statusId "${sid}".`,
            affectedMonsters: [{ uuid: m.uuid, name: m.name, detail: `statusId="${sid}"` }],
          });
        }
      }
    }
  }

  findings.sort((a, b) => a.id.localeCompare(b.id));
  return findings;
}

// ── Entry ─────────────────────────────────────────────────────────────────────

function main() {
  const extract = readJSON(IN_MONSTERS);
  const monsters = extract.monsters ?? [];

  const abilities = buildAbilitiesIndex(monsters);
  const actions   = buildActionsIndex(monsters);
  const findings  = buildFindings(monsters, abilities);

  writeJSON(OUT_ABILITIES, {
    generatedAt: extract.generatedAt,
    uniqueCount: abilities.length,
    abilities,
  });

  writeJSON(OUT_ACTIONS, {
    generatedAt: extract.generatedAt,
    uniqueCount: actions.length,
    actions,
  });

  // Finding-count summary for quick consumption
  const bySubcategory = {};
  const bySeverity   = { info: 0, warning: 0, error: 0 };
  for (const f of findings) {
    bySubcategory[f.subcategory] = (bySubcategory[f.subcategory] ?? 0) + 1;
    bySeverity[f.severity] = (bySeverity[f.severity] ?? 0) + 1;
  }

  writeJSON(OUT_FINDINGS, {
    generatedAt: extract.generatedAt,
    totalFindings: findings.length,
    bySeverity,
    bySubcategory,
    findings,
  });

  console.log("Wrote:");
  console.log(`  ${OUT_ABILITIES}  (${abilities.length} unique abilities)`);
  console.log(`  ${OUT_ACTIONS}    (${actions.length} unique actions)`);
  console.log(`  ${OUT_FINDINGS}   (${findings.length} findings; ${JSON.stringify(bySeverity)})`);
}

main();
