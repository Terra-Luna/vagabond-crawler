/**
 * Audit Markdown Renderer
 *
 * Reads the four audit JSON files and writes human-readable markdown:
 *   - docs/audit/by-type/<BeingType>.md  (one per beingType)
 *   - docs/audit/INDEX.md                 (top-level summary and cross-links)
 *
 * Run with Node 20+:
 *   node scripts/audit/markdown.mjs
 */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..", "..");
const AUDIT = resolve(ROOT, "docs", "audit");
const BY_TYPE = resolve(AUDIT, "by-type");

mkdirSync(BY_TYPE, { recursive: true });

function readJSON(p) {
  return JSON.parse(readFileSync(p, "utf8"));
}

const monstersDoc  = readJSON(resolve(AUDIT, "monsters.json"));
const abilitiesDoc = readJSON(resolve(AUDIT, "abilities.json"));
const actionsDoc   = readJSON(resolve(AUDIT, "actions.json"));
const findingsDoc  = readJSON(resolve(AUDIT, "findings.json"));

const monsters = monstersDoc.monsters ?? [];
const findings = findingsDoc.findings ?? [];

// Build findings-per-monster index
const findingsByUuid = new Map();
for (const f of findings) {
  for (const am of f.affectedMonsters ?? []) {
    const uuid = am.uuid;
    if (!uuid) continue;
    if (!findingsByUuid.has(uuid)) findingsByUuid.set(uuid, []);
    findingsByUuid.get(uuid).push(f);
  }
}

// Bucket monsters by being type
const byBeingType = new Map();
for (const m of monsters) {
  const bt = m.beingType || "(Unknown)";
  if (!byBeingType.has(bt)) byBeingType.set(bt, []);
  byBeingType.get(bt).push(m);
}

function escapeMd(s) {
  return String(s ?? "").replace(/\|/g, "\\|").replace(/\n/g, " ");
}

// ── Per-type pages ────────────────────────────────────────────────────────────

for (const [beingType, list] of [...byBeingType.entries()].sort(([a], [b]) => a.localeCompare(b))) {
  list.sort((a, b) => a.name.localeCompare(b.name));

  const lines = [];
  lines.push(`# ${beingType} — ${list.length} monsters`);
  lines.push("");
  lines.push(`Generated: ${monstersDoc.generatedAt}`);
  lines.push("");
  lines.push("| Name | HD | TL | Armor | Zone | Actions | Abilities | Findings |");
  lines.push("|---|---|---|---|---|---|---|---|");
  for (const m of list) {
    const fcount = (findingsByUuid.get(m.uuid) ?? []).length;
    lines.push(`| ${escapeMd(m.name)} | ${m.hd ?? ""} | ${m.threatLevel ?? ""} | ${m.armor ?? ""} ${escapeMd(m.armorDescription ?? "")} | ${escapeMd(m.zone ?? "")} | ${m.actions.length} | ${m.abilities.length} | ${fcount} |`);
  }

  // Expanded per-monster details
  lines.push("");
  lines.push("---");
  lines.push("");
  lines.push(`## Details`);
  lines.push("");
  for (const m of list) {
    const fs = findingsByUuid.get(m.uuid) ?? [];
    lines.push(`### ${m.name}`);
    lines.push("");
    lines.push(`- UUID: \`${m.uuid}\``);
    if (m.source !== "vagabond") lines.push(`- Source: **${m.source}**`);
    lines.push(`- HD ${m.hd ?? "?"} · TL ${m.threatLevel ?? "?"} · Armor ${m.armor ?? "?"} (${m.armorDescription ?? ""}) · ${m.size ?? ""} · Zone ${m.zone ?? ""} · Morale ${m.morale ?? ""} · Appearing ${m.appearing ?? ""}`);
    lines.push(`- Speed ${m.speed ?? "?"}${m.speedTypes?.length ? ` / ${m.speedTypes.join(", ")}` : ""}${m.senses ? ` · Senses: ${m.senses}` : ""}`);
    if (m.immunities?.length)       lines.push(`- Immune: ${m.immunities.join(", ")}`);
    if (m.weaknesses?.length)       lines.push(`- Weak: ${m.weaknesses.join(", ")}`);
    if (m.statusImmunities?.length) lines.push(`- Status Immune: ${m.statusImmunities.join(", ")}`);

    if (m.actions.length) {
      lines.push("");
      lines.push(`**Actions (${m.actions.length})**`);
      lines.push("");
      lines.push("| Name | Type | Damage | Note | Recharge | Status |");
      lines.push("|---|---|---|---|---|---|");
      for (const a of m.actions) {
        const dmg = [a.flatDamage && `+${a.flatDamage}`, a.rollDamage].filter(Boolean).join(" ") || "—";
        const sta = (a.causedStatuses ?? []).map((c) => c.statusId).filter(Boolean).join(", ") || "—";
        lines.push(`| ${escapeMd(a.name)} | ${a.attackType || "—"} | ${escapeMd(dmg)}${a.damageType && a.damageType !== "-" ? ` (${a.damageType})` : ""} | ${escapeMd(a.note ?? "")} | ${escapeMd(a.recharge ?? "")} | ${escapeMd(sta)} |`);
      }
    }

    if (m.abilities.length) {
      lines.push("");
      lines.push(`**Abilities (${m.abilities.length})**`);
      lines.push("");
      for (const ab of m.abilities) {
        lines.push(`- **${escapeMd(ab.name)}** — ${escapeMd(ab.description ?? "")}`);
      }
    }

    if (fs.length) {
      lines.push("");
      lines.push(`**Findings (${fs.length})**`);
      lines.push("");
      for (const f of fs) {
        const sevIcon = f.severity === "error" ? "❌" : f.severity === "warning" ? "⚠️" : "ℹ️";
        lines.push(`- ${sevIcon} \`${f.subcategory}\`: ${escapeMd(f.message)}`);
      }
    }

    lines.push("");
  }

  writeFileSync(resolve(BY_TYPE, `${beingType}.md`), lines.join("\n"), "utf8");
}

// ── Index page ────────────────────────────────────────────────────────────────

const indexLines = [];
indexLines.push(`# Vagabond Monster Audit — Index`);
indexLines.push("");
indexLines.push(`Generated: ${monstersDoc.generatedAt}`);
indexLines.push(`Foundry: ${monstersDoc.foundryCoreVersion} · System: vagabond ${monstersDoc.systemVersion}`);
indexLines.push("");
indexLines.push(`- **Monsters**: ${monsters.length}`);
indexLines.push(`- **Unique abilities**: ${abilitiesDoc.uniqueCount}`);
indexLines.push(`- **Unique actions**: ${actionsDoc.uniqueCount}`);
indexLines.push(`- **Total findings**: ${findingsDoc.totalFindings}  (${findingsDoc.bySeverity.error} error, ${findingsDoc.bySeverity.warning} warning, ${findingsDoc.bySeverity.info} info)`);
indexLines.push("");
indexLines.push(`## Packs`);
indexLines.push("");
indexLines.push("| Pack | Source | Count |");
indexLines.push("|---|---|---|");
for (const p of monstersDoc.packs ?? []) {
  indexLines.push(`| ${p.label ?? p.id} | ${p.source} | ${p.missing ? "(missing)" : p.count} |`);
}
indexLines.push("");
indexLines.push(`## Catalogues`);
indexLines.push("");
indexLines.push("- [abilities.md](abilities.md) — unique abilities grouped by automation status");
indexLines.push("- [actions.md](actions.md) — unique actions grouped by attack type");
indexLines.push("");
indexLines.push(`## Being Types`);
indexLines.push("");
indexLines.push("| Being Type | Monsters | Detail |");
indexLines.push("|---|---|---|");
for (const [bt, list] of [...byBeingType.entries()].sort(([a], [b]) => a.localeCompare(b))) {
  indexLines.push(`| ${bt} | ${list.length} | [by-type/${bt}.md](by-type/${bt}.md) |`);
}
indexLines.push("");
indexLines.push(`## Findings Breakdown`);
indexLines.push("");
indexLines.push("| Subcategory | Count |");
indexLines.push("|---|---|");
for (const [sub, n] of Object.entries(findingsDoc.bySubcategory ?? {}).sort(([a], [b]) => a.localeCompare(b))) {
  indexLines.push(`| ${sub} | ${n} |`);
}
indexLines.push("");
indexLines.push(`## Top Errors`);
indexLines.push("");
for (const f of findings.filter((f) => f.severity === "error")) {
  indexLines.push(`- **${f.subcategory}** — ${escapeMd(f.message)} (${(f.affectedMonsters ?? []).length} monsters)`);
}
indexLines.push("");

writeFileSync(resolve(AUDIT, "INDEX.md"), indexLines.join("\n"), "utf8");

// ── Abilities page ────────────────────────────────────────────────────────────

const abilities = abilitiesDoc.abilities ?? [];

// UUID -> monster name lookup
const nameByUuid = new Map(monsters.map((m) => [m.uuid, m.name]));

const STATUS_ORDER = ["broken", "unimplemented", "implemented", "flavor", "unknown"];
const STATUS_LABEL = {
  broken:        "❌ Broken Automation",
  unimplemented: "⚠️ Unimplemented (mechanical text, no automation)",
  implemented:   "✅ Implemented",
  flavor:        "📖 Flavor (no mechanics detected)",
  unknown:       "❓ Unknown",
};

const abByStatus = new Map(STATUS_ORDER.map((s) => [s, []]));
for (const ab of abilities) {
  if (!abByStatus.has(ab.automationStatus)) abByStatus.set(ab.automationStatus, []);
  abByStatus.get(ab.automationStatus).push(ab);
}
for (const list of abByStatus.values()) {
  list.sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

const abLines = [];
abLines.push(`# Abilities — ${abilities.length} unique`);
abLines.push("");
abLines.push(`Generated: ${abilitiesDoc.generatedAt}`);
abLines.push("");
abLines.push(`## Summary`);
abLines.push("");
abLines.push("| Status | Count |");
abLines.push("|---|---:|");
for (const s of STATUS_ORDER) {
  const n = abByStatus.get(s)?.length ?? 0;
  if (n > 0) abLines.push(`| ${STATUS_LABEL[s]} | ${n} |`);
}
abLines.push("");

for (const status of STATUS_ORDER) {
  const list = abByStatus.get(status) ?? [];
  if (list.length === 0) continue;
  abLines.push(`## ${STATUS_LABEL[status]} — ${list.length}`);
  abLines.push("");
  for (const ab of list) {
    abLines.push(`### ${escapeMd(ab.name)}  \`×${ab.count}\``);
    abLines.push("");
    if (ab.representativeText) {
      abLines.push(`> ${escapeMd(ab.representativeText)}`);
      abLines.push("");
    }
    if (ab.textVariants > 1) {
      abLines.push(`- **Text variants:** ${ab.textVariants}`);
    }
    if (ab.reason) {
      abLines.push(`- **Why:** ${escapeMd(ab.reason)}`);
    }
    const kw = ab.keywords ?? {};
    const kwBits = [];
    if (kw.statuses?.length)        kwBits.push(`statuses: ${kw.statuses.join(", ")}`);
    if (kw.mechanicalVerbs?.length) kwBits.push(`verbs: ${kw.mechanicalVerbs.join(", ")}`);
    if (kw.saveKeywords?.length)    kwBits.push(`saves: ${kw.saveKeywords.join(", ")}`);
    if (kw.durationMarkers?.length) kwBits.push(`durations: ${kw.durationMarkers.join(", ")}`);
    if (kwBits.length) abLines.push(`- **Keywords:** ${escapeMd(kwBits.join(" · "))}`);

    const monsterNames = ab.monsters
      .map((u) => nameByUuid.get(u))
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));
    const preview = monsterNames.slice(0, 10).join(", ");
    const more = monsterNames.length > 10 ? ` _(+${monsterNames.length - 10} more)_` : "";
    abLines.push(`- **Monsters:** ${escapeMd(preview)}${more}`);
    abLines.push("");
  }
}

writeFileSync(resolve(AUDIT, "abilities.md"), abLines.join("\n"), "utf8");

// ── Actions page ──────────────────────────────────────────────────────────────

const actions = actionsDoc.actions ?? [];
// Sort by count desc, then name
const actSorted = [...actions].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

// Group by most-frequent attack type for organization
function dominantAttackType(a) {
  const entries = Object.entries(a.attackTypes ?? {});
  if (entries.length === 0) return "(none)";
  entries.sort(([, na], [, nb]) => nb - na);
  return entries[0][0];
}

const ATTACK_LABEL = {
  melee:      "⚔️ Melee",
  ranged:     "🏹 Ranged",
  castClose:  "✨ Cast (Close)",
  castRanged: "✨ Cast (Ranged)",
  "(none)":   "—",
};

const actByType = new Map();
for (const a of actSorted) {
  const bucket = dominantAttackType(a);
  if (!actByType.has(bucket)) actByType.set(bucket, []);
  actByType.get(bucket).push(a);
}

const TYPE_ORDER = ["melee", "ranged", "castClose", "castRanged", "(none)"];

const actLines = [];
actLines.push(`# Actions — ${actions.length} unique`);
actLines.push("");
actLines.push(`Generated: ${actionsDoc.generatedAt}`);
actLines.push("");
actLines.push(`## Summary`);
actLines.push("");
actLines.push("| Dominant Attack Type | Unique Actions |");
actLines.push("|---|---:|");
for (const t of TYPE_ORDER) {
  const list = actByType.get(t);
  if (list?.length) actLines.push(`| ${ATTACK_LABEL[t] ?? t} | ${list.length} |`);
}
actLines.push("");

// Top 25 most common
actLines.push(`## Top 25 Most Common`);
actLines.push("");
actLines.push("| Name | Count | Dominant Type | Damage (flat) | Damage (roll) | Status Riders |");
actLines.push("|---|---:|---|---|---|---:|");
for (const a of actSorted.slice(0, 25)) {
  const flat = a.flatDamageRange ? `${a.flatDamageRange[0]}–${a.flatDamageRange[1]}` : "—";
  const rolls = a.rollDamageVariants?.length ? a.rollDamageVariants.slice(0, 5).join(", ") + (a.rollDamageVariants.length > 5 ? ` _+${a.rollDamageVariants.length - 5}_` : "") : "—";
  actLines.push(`| ${escapeMd(a.name)} | ${a.count} | ${ATTACK_LABEL[dominantAttackType(a)] ?? dominantAttackType(a)} | ${flat} | ${escapeMd(rolls)} | ${a.hasCausedStatuses} |`);
}
actLines.push("");

// Full listing grouped by dominant attack type
for (const t of TYPE_ORDER) {
  const list = actByType.get(t) ?? [];
  if (list.length === 0) continue;
  actLines.push(`## ${ATTACK_LABEL[t] ?? t} — ${list.length}`);
  actLines.push("");
  for (const a of list) {
    const flat = a.flatDamageRange ? `${a.flatDamageRange[0]}–${a.flatDamageRange[1]}` : "";
    const rolls = (a.rollDamageVariants ?? []).slice(0, 8).join(", ");
    const atTypes = Object.entries(a.attackTypes ?? {})
      .map(([k, n]) => `${k}×${n}`).join(", ");
    const dtTypes = Object.entries(a.damageTypes ?? {})
      .map(([k, n]) => `${k}×${n}`).join(", ");
    actLines.push(`### ${escapeMd(a.name)}  \`×${a.count}\``);
    actLines.push("");
    actLines.push(`- **Attack types:** ${escapeMd(atTypes)}`);
    actLines.push(`- **Damage types:** ${escapeMd(dtTypes)}`);
    if (flat)  actLines.push(`- **Flat damage range:** ${flat}`);
    if (rolls) actLines.push(`- **Roll dice variants:** ${escapeMd(rolls)}`);
    if (a.hasCausedStatuses) actLines.push(`- **With status riders:** ${a.hasCausedStatuses} / ${a.count} monsters`);
    if (a.hasRecharge)       actLines.push(`- **With recharge:** ${a.hasRecharge} / ${a.count} monsters`);
    actLines.push("");
  }
}

writeFileSync(resolve(AUDIT, "actions.md"), actLines.join("\n"), "utf8");

console.log(`Wrote ${byBeingType.size} per-type markdown files + INDEX.md + abilities.md + actions.md to ${AUDIT}`);
