# Changelog

## v1.2.0

### New Features
- **Pack Instincts / Pack Tactics** — NPC passive ability automation. When an NPC with Pack Instincts attacks a target, and an ally of that NPC is adjacent to the target, saves against the attack are Hindered. Works from both the crawl strip action menu and the actor sheet. Effect auto-cleans on turn change.
- **Terrain Difficulty** — Movement tracker now queries Scene Region "Modify Movement Cost" behaviors. Tokens moving through difficult terrain have their movement cost multiplied accordingly.
- **Enforce Combat Movement setting** — New world setting to toggle movement enforcement during combat independently from crawl movement enforcement.

### Improvements
- Movement distance is now computed once per token move instead of twice (deduplication).
- Terrain difficulty function accepts elevation as a parameter instead of performing a canvas token lookup.

## v1.1.0
- Alchemist Cookbook, NPC abilities (Magic Ward), flanking checker, combat strip enhancements.
