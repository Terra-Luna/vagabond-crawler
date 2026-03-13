/**
 * Vagabond Crawler — Chat Tooltips
 *
 * Adds hover tooltips to damage dice in chat cards showing the die formula
 * and individual roll results (e.g. "2d6 → [4, 2]").
 */

import { MODULE_ID } from "./vagabond-crawler.mjs";

/**
 * Register the renderChatMessageHTML hook that enriches damage dice with tooltips.
 */
export function registerChatTooltips() {
  // Use the v13-preferred hook name
  Hooks.on("renderChatMessageHTML", (message, html) => {
    _enrichDamageTooltips(html);
    _enrichRollTooltips(html, message);
  });

  // Also enrich any messages already on screen
  setTimeout(() => {
    const log = document.querySelector("#chat-log");
    if (log) {
      for (const el of log.querySelectorAll(".chat-message")) {
        _enrichDamageTooltips(el);
        // For existing messages we need the ChatMessage document
        const msgId = el.dataset.messageId;
        const message = msgId ? game.messages.get(msgId) : null;
        _enrichRollTooltips(el, message);
      }
    }
  }, 1000);

  console.log(`${MODULE_ID} | Chat tooltips registered (damage + roll dice).`);
}

/* ── Internal ──────────────────────────────────────────────────────────────── */

/**
 * Walk all .damage-dice-list containers inside a chat message element
 * and add a title tooltip showing the formula + individual results.
 */
function _enrichDamageTooltips(html) {
  // html may be an HTMLElement or jQuery — normalise
  const el = html instanceof HTMLElement ? html : html?.[0];
  if (!el) return;

  const diceLists = el.querySelectorAll(".damage-dice-list");
  for (const list of diceLists) {
    // Collect all die wrappers inside this damage group
    const wrappers = list.querySelectorAll(".vb-die-wrapper");
    if (!wrappers.length) continue;

    // Build a map of die faces → results
    // e.g. { 6: [4, 2], 8: [5] }
    const diceByFaces = new Map();
    for (const w of wrappers) {
      const faces = w.dataset.faces;
      if (!faces) continue;
      const val = w.querySelector(".vb-die-val")?.textContent?.trim();
      if (!val) continue;
      if (!diceByFaces.has(faces)) diceByFaces.set(faces, []);
      diceByFaces.get(faces).push(val);
    }

    // Build tooltip string: "2d6 → [4, 2]" or "1d8 + 1d6 → [5] + [3]"
    const parts = [];
    for (const [faces, results] of diceByFaces) {
      parts.push(`${results.length}d${faces} \u2192 [${results.join(", ")}]`);
    }
    const tooltip = parts.join("  +  ");

    // Apply tooltip to each individual die wrapper
    for (const w of wrappers) {
      w.title = tooltip;
      w.style.cursor = "help";
    }
  }
}

/**
 * Enrich roll dice containers (d20 + favor/hinder + Magic Ward etc.)
 * with a hover tooltip showing the full formula and individual results.
 */
function _enrichRollTooltips(html, message) {
  const el = html instanceof HTMLElement ? html : html?.[0];
  if (!el) return;

  const containers = el.querySelectorAll(".roll-dice-container");
  for (const container of containers) {
    // Collect every child element in order to reconstruct the formula
    const parts = [];    // display fragments: "1d20 → [14]", "+", "1d6 → [3]"
    const children = container.children;

    for (const child of children) {
      // Operator span (+, -)
      if (child.classList.contains("roll-operator")) {
        parts.push(child.textContent.trim());
        continue;
      }

      // Flat modifier span
      if (child.classList.contains("roll-modifier")) {
        parts.push(child.textContent.trim());
        continue;
      }

      // Die wrapper
      if (child.classList.contains("vb-die-wrapper")) {
        const faces = child.dataset.faces;
        const val = child.querySelector(".vb-die-val")?.textContent?.trim();
        if (faces && val) {
          parts.push(`d${faces} → [${val}]`);
        }
        continue;
      }
    }

    if (!parts.length) continue;

    // Also try to get the full formula from the Roll object
    let formulaLine = "";
    if (message?.rolls?.length) {
      const roll = message.rolls[0];
      if (roll?.formula) {
        formulaLine = roll.formula;
      }
    }

    // Build the tooltip
    // Line 1: formula (e.g. "1d20 + 1d6[favored]")
    // Line 2: breakdown (e.g. "d20 → [14] + d6 → [3]")
    // Line 3: total (e.g. "= 17")
    const breakdown = parts.join("  ");
    let tooltip = "";
    if (formulaLine) {
      tooltip += formulaLine + "\n";
    }
    tooltip += breakdown;
    if (message?.rolls?.[0]) {
      tooltip += "\n= " + message.rolls[0].total;
    }

    // Apply to the container itself and each die wrapper inside
    container.title = tooltip;
    container.style.cursor = "help";
    for (const w of container.querySelectorAll(".vb-die-wrapper")) {
      w.title = tooltip;
      w.style.cursor = "help";
    }
  }
}
