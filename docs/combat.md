# NPC Combat Automation

> *This guide covers the NPC-side combat automation handled by Vagabond Crawler: NPC abilities, flanking, countdown dice, morale, animation FX. Player-side combat (class resources, character action menus, etc.) is handled by the Character Enhancer module — see its docs.*

---

## NPC Abilities

<!-- gif: docs/assets/npc-abilities.png -->

### What it does

Passive combat hooks that make NPC abilities fire automatically — no GM effort required during combat. The module registers wraps and hooks (at Foundry's `setup` stage so they layer correctly with the Character Enhancer module's wrap chain) and then watches for casts, attacks, and save rolls targeting affected NPCs.

| Ability | Effect |
|---|---|
| **Magic Ward I-VI** | Each level adds +N Mana surcharge to any spell cast at a warded target (first time per round). I = +1 Mana, VI = +6 Mana. Displays live in the Cast Spell Dialog mana total. |
| **Pack Instincts / Pack Tactics / Pack Hunter** | Saves against attacks from a packing NPC get Hinder when the NPC has an ally adjacent to the target. Same mechanic, three flavored names. |
| **Nimble** | Clamps favor to *none* against the NPC while it can still move — no gang-up Favor, no situational Favor. Suspended when the NPC is Incapacitated, Paralyzed, Restrained, or Unconscious. |
| **Soft Underbelly** | Zeroes the NPC's armor while it has the Prone condition. The damage helper reads `actor.system.armor` directly, so Active Effects using the `system.armor` OVERRIDE mode kick in transparently. |

### Automation in the Monster Creator

The [Monster Creator's](exploration.md#monster-creator) Ability Quick-Picks show a green ✓ badge next to any name that matches a `PASSIVE_ABILITIES` entry — that's the indicator that picking the ability actually wires it up. A ⚠ badge means the Quick Pick is catalogued but not yet automated; 📖 means it's flavor only. Picking an unbadged ability still attaches it to the NPC's sheet for GM reference, but nothing fires at the table.

For the full dashboard of which abilities are automated across every monster in the bestiary, see [`docs/audit/abilities.md`](audit/abilities.md) — that file is regenerated from the compendium via `scripts/audit/analyze.mjs`, so it's the ground-truth automation coverage report.

> **VCE wrap-chain note:** `vagabond-character-enhancer` wraps the system's spell and damage helpers in its `ready` hook. To run *after* VCE's favor-combine logic, this module wraps in `setup` so our handlers sit *innermost*. See CLAUDE.md's wrap-chain section for details if you're extending the automation.

---

### Flanking Checker

<!-- gif: docs/assets/flanking.png -->

### Countdown Dice Auto-Roller

<!-- gif: docs/assets/countdown-dice.png -->

### Morale Check

<!-- gif: docs/assets/morale.png -->

### Animation FX

<!-- gif: docs/assets/animation-fx.png -->

### Chat Dice Tooltips
