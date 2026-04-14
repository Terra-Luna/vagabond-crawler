# Vagabond Monster Audit Database

Ground-truth dataset of every NPC across the Vagabond compendium packs (`vagabond.bestiary`, `vagabond.humanlike`, and optionally `vagabond-character-enhancer.vce-beasts`), plus structured findings for **dead ability text** and **data inconsistencies**.

Start at [INDEX.md](INDEX.md) for the summary and being-type index.

## Files

| File | Purpose |
|---|---|
| `monsters.json`   | Raw per-monster extract. One entry per NPC with stats, actions, abilities, immunities, token info. |
| `abilities.json`  | Every unique ability name with count, representative description, keyword analysis, and `automationStatus` (`implemented` / `broken` / `unimplemented` / `flavor` / `unknown`). |
| `actions.json`    | Every unique action name with count, attack-type histogram, damage-type histogram, roll-dice variants, flat-damage range. |
| `findings.json`   | Array of findings. Each has `id`, `category`, `subcategory`, `severity`, `message`, `affectedMonsters`. |
| `INDEX.md`        | Human-readable summary + links. |
| `abilities.md`    | Readable rendering of `abilities.json`, grouped by automation status then by count. |
| `actions.md`      | Readable rendering of `actions.json`, grouped by dominant attack type with a Top-25-most-common table. |
| `by-type/*.md`    | Per–being-type details: monster stats, actions, abilities, findings. |

## Finding subcategories

**Dead ability text** — ability descriptions that reference mechanical effects without matching implementation:

- `broken-automation` — name is listed in `scripts/npc-abilities.mjs` `PASSIVE_ABILITIES` but the code does the wrong thing (e.g., Magic Ward injects a roll penalty but the compendium text describes a mana cost).
- `unimplemented-passive` — ability description mentions mechanical effects (statuses, verbs, save keywords) but no `PASSIVE_ABILITIES` entry exists — GM must resolve manually.
- `ability-mentions-status-without-action` — ability text references a specific status (e.g., "Frightened"), but no action on the same monster has a matching `causedStatuses` entry — the ability likely needs either a partner action or passive automation.

**Data inconsistencies** — structural problems in the authored data:

- `speed-conflict` — `speedTypes` entry has an inline speed (e.g. `"fly 80"`) AND `speedValues[type]` is non-zero. Only one should be authoritative.
- `speed-ambiguous` — `speedTypes` has a bare type (e.g. `"fly"`) AND `speedValues[type]` is 0. Implicit base speed? Intent unclear.
- `damageless-requiresDamage` — `causedStatuses[].requiresDamage: true` on an action with no damage. Status cannot apply by that rule.
- `elemental-name-untyped` — action name suggests an element (fire, cold, poison…) but `damageType === "-"`.
- `extraInfo-status-mismatch` — `extraInfo` text names a status not present in `causedStatuses`.
- `save-mention-orphan` — `note` mentions a save type (Endure / Reflex / Will), but the action has no `causedStatuses` and no damage — the save wording has nothing to attach to.
- `unknown-statusId` — a `causedStatuses[].statusId` isn't in the canonical status set (see `scripts/audit/status-vocabulary.mjs`).

## How to regenerate

The audit runs in three stages. Stage 1 requires Foundry to be running; stages 2–3 are pure Node.

### 1. Extract (Foundry required)

Run the body of `scripts/audit/extract.mjs` inside Foundry's game context. The recommended workflow is to ask Claude to run it via the Foundry MCP `evaluate` tool — Claude reads the function body, dispatches it, receives the JSON string, and writes `docs/audit/monsters.json`.

Manual alternative: paste the body of `extractMonsterAudit()` into a Foundry macro, run it with `console.log(JSON.stringify(await extractMonsterAudit()))`, and copy the output into `monsters.json`.

### 2. Analyze

```bash
node scripts/audit/analyze.mjs
```

Reads `monsters.json`. Writes `abilities.json`, `actions.json`, and `findings.json`.

### 3. Render Markdown

```bash
node scripts/audit/markdown.mjs
```

Reads all three JSON files. Writes `INDEX.md` and `by-type/*.md`.

## When to regenerate

- After editing any monster in `vagabond.bestiary` or `vagabond.humanlike` (stage 1 + 2 + 3).
- After changing `scripts/npc-abilities.mjs` `PASSIVE_ABILITIES` table or `scripts/audit/analyze.mjs` rules (stage 2 + 3 only — re-runs against the existing extract).
- After a Vagabond system version bump that changes the NPC schema (stage 1 + 2 + 3).

## Keeping the mirror in sync

`scripts/audit/analyze.mjs` has a local `PASSIVE_ABILITIES` mirror that must match `scripts/npc-abilities.mjs`. If automation entries are added, removed, or changed, update both files and re-run the analyzer.

`scripts/audit/status-vocabulary.mjs` contains the canonical status-id list. Regenerate via `mcp__foundry-vtt__get_available_conditions` if the system adds or removes statuses.

## Scope notes

This audit intentionally does **not**:

- Fix any of the findings (e.g., Magic Ward is flagged but not corrected).
- Check action damage balance, threat-level math, or game balance.
- Audit compendium items (weapons, spells, armor) — scope is restricted to NPC actors.
- Cross-reference against the standalone `vagabond-monster-creator.html` template library (deferred to a future audit pass).

See the plan at `../../../../.claude/plans/crispy-launching-corbato.md` for context and deferred scope.
