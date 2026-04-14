/**
 * Audit Extract — Foundry-context monster data extraction
 *
 * This file is NOT loaded by the module at runtime. It exists so:
 *   1. The extraction logic is version-controlled and reviewable.
 *   2. Claude can inline its body into `mcp__foundry-vtt__evaluate` to
 *      produce `docs/audit/monsters.json`.
 *
 * Execution model: the body of `extractMonsterAudit()` below is copied
 * verbatim into an `evaluate` call (the tool runs it as an async function
 * body and `return` ships the value back). Inside Foundry it has access
 * to the `game` global.
 *
 * Inputs: none.
 * Output: a JSON-serializable object with shape:
 *   {
 *     generatedAt: ISO-8601 string,
 *     foundryCoreVersion: string,
 *     systemVersion: string,
 *     packs: [{ id, label, source, count, missing }],
 *     monsters: [ExtractRecord, ...]
 *   }
 *
 * ExtractRecord shape is documented by the returned object itself —
 * every field is optional except identity fields (uuid, pack, name).
 */

export async function extractMonsterAudit() {
  const PACKS = [
    { id: "vagabond.bestiary",                         source: "vagabond" },
    { id: "vagabond.humanlike",                        source: "vagabond" },
    { id: "vagabond-character-enhancer.vce-beasts",    source: "vce"      },
  ];

  const out = {
    generatedAt: new Date().toISOString(),
    foundryCoreVersion: game.version ?? game.release?.version ?? "unknown",
    systemVersion: game.system?.version ?? "unknown",
    packs: [],
    monsters: [],
  };

  for (const meta of PACKS) {
    const pack = game.packs.get(meta.id);
    if (!pack) {
      out.packs.push({ id: meta.id, label: null, source: meta.source, count: 0, missing: true });
      continue;
    }
    const docs = await pack.getDocuments();
    out.packs.push({ id: meta.id, label: pack.title ?? pack.metadata?.label ?? meta.id, source: meta.source, count: docs.length, missing: false });

    for (const actor of docs) {
      if (actor.type !== "npc") continue;
      const s = actor.system ?? {};
      const pt = actor.prototypeToken ?? {};

      // Deep-clone arrays/objects we capture so the output survives JSON.stringify
      const rec = {
        uuid: actor.uuid,
        pack: meta.id,
        source: meta.source,
        _id: actor.id,
        name: actor.name,
        img: actor.img ?? null,
        folder: actor.folder?.name ?? null,

        // stats / identity
        hd:                s.hd ?? null,
        cr:                s.cr ?? null,
        threatLevel:       s.threatLevel ?? null,
        size:              s.size ?? null,
        morale:            s.morale ?? null,
        appearing:         s.appearing ?? null,
        speed:             s.speed ?? null,
        speedTypes:        Array.isArray(s.speedTypes) ? [...s.speedTypes] : [],
        speedValues:       s.speedValues ? { ...s.speedValues } : null,
        senses:            s.senses ?? null,
        armor:             s.armor ?? null,
        armorDescription:  s.armorDescription ?? null,
        zone:              s.zone ?? null,
        beingType:         s.beingType ?? null,
        description:       s.description ?? null,
        biography:         s.biography ?? null,

        immunities:        Array.isArray(s.immunities)       ? [...s.immunities]       : [],
        weaknesses:        Array.isArray(s.weaknesses)       ? [...s.weaknesses]       : [],
        statusImmunities:  Array.isArray(s.statusImmunities) ? [...s.statusImmunities] : [],

        actions: Array.isArray(s.actions) ? s.actions.map((a) => ({
          name:              a?.name              ?? "",
          note:              a?.note              ?? "",
          recharge:          a?.recharge          ?? "",
          attackType:        a?.attackType        ?? "",
          flatDamage:        a?.flatDamage        ?? "",
          rollDamage:        a?.rollDamage        ?? "",
          damageType:        a?.damageType        ?? "",
          extraInfo:         a?.extraInfo         ?? "",
          causedStatuses:     Array.isArray(a?.causedStatuses)     ? a.causedStatuses.map((c) => ({ ...c }))     : [],
          critCausedStatuses: Array.isArray(a?.critCausedStatuses) ? a.critCausedStatuses.map((c) => ({ ...c })) : [],
        })) : [],

        abilities: Array.isArray(s.abilities) ? s.abilities.map((ab) => ({
          name:        ab?.name        ?? "",
          description: ab?.description ?? "",
        })) : [],

        prototypeToken: {
          width:      pt.width      ?? 1,
          height:     pt.height     ?? 1,
          textureSrc: pt.texture?.src ?? null,
          randomImg:  !!pt.randomImg,
        },
      };

      out.monsters.push(rec);
    }
  }

  // Deterministic ordering: by source, then pack id, then name.
  out.monsters.sort((a, b) => {
    if (a.source !== b.source) return a.source < b.source ? -1 : 1;
    if (a.pack   !== b.pack)   return a.pack   < b.pack   ? -1 : 1;
    return a.name.localeCompare(b.name, "en", { sensitivity: "base" });
  });

  return out;
}
