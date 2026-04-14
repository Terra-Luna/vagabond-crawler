/**
 * Canonical Vagabond Status Vocabulary
 *
 * Source: `mcp__foundry-vtt__get_available_conditions` at audit time.
 * Contains every status id the system registers. Used by the audit
 * analyzer to detect:
 *   - Ability text that references a status by name (for dead-text detection)
 *   - `causedStatuses[].statusId` values that fall outside this set (unknown status)
 *
 * Regenerate by calling `get_available_conditions` and replacing the array.
 * Keep `patrolundetectable` in the set — it's contributed by the Patrol module
 * at runtime and legitimately appears on some actors.
 */

export const STATUS_IDS = [
  "berserk",
  "blinded",
  "burning",
  "charmed",
  "confused",
  "dazed",
  "dead",
  "fatigued",
  "focusing",
  "frightened",
  "grappling",
  "incapacitated",
  "invisible",
  "paralyzed",
  "patrolundetectable",
  "prone",
  "restrained",
  "sickened",
  "suffocating",
  "unconscious",
  "vulnerable",
];

export const STATUS_LABELS = {
  berserk: "Berserk",
  blinded: "Blinded",
  burning: "Burning",
  charmed: "Charmed",
  confused: "Confused",
  dazed: "Dazed",
  dead: "Dead",
  fatigued: "Fatigued",
  focusing: "Focusing",
  frightened: "Frightened",
  grappling: "Grappling",
  incapacitated: "Incapacitated",
  invisible: "Invisible",
  paralyzed: "Paralyzed",
  patrolundetectable: "Patrol - Undetectable",
  prone: "Prone",
  restrained: "Restrained",
  sickened: "Sickened",
  suffocating: "Suffocating",
  unconscious: "Unconscious",
  vulnerable: "Vulnerable",
};

/**
 * Return the set of status ids whose labels or ids appear in the text.
 * Matches are case-insensitive, whole-word only, against the label.
 * The "dead" status is matched only on exact ID to avoid false positives
 * on common phrasings like "when it dies" or "the deceased".
 */
export function findStatusMentions(text) {
  if (!text || typeof text !== "string") return [];
  const mentions = new Set();
  for (const id of STATUS_IDS) {
    const label = STATUS_LABELS[id] ?? id;
    if (id === "dead") continue; // too ambiguous in free text
    const re = new RegExp(`\\b${label}\\b`, "i");
    if (re.test(text)) mentions.add(id);
  }
  return [...mentions];
}
