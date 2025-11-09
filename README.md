# Terminal Crawler

A web-browser ASCII turn-based roguelike built with Vite and TypeScript. Launch the dev server with `npm run dev` to explore a deterministic 60×40 dungeon rendered with classic glyphs.

## Getting started

```bash
npm install
npm run dev
```

The dev server listens on port `5173` and hot-reloads as you iterate on gameplay systems.

## Controls

- **Movement:** Arrow keys / WASD
- **Wait:** `.` or `Space`
- **Dash:** `g` (example dash east)
- **Aim mode:** `f` toggles manual reticle, `Shift+f` or capital `F` auto-locks onto the nearest monster, `Tab` cycles targets, `Enter` confirms, `Esc` cancels.
- **Inventory:** `i`
- **Quick bar:** `1`–`4`

## Project layout

```
src/
  ai/            Monster state machine and turn processing
  combat/        Damage calculations and mitigation helpers
  core/          Shared systems: grid, FOV, PRNG, input, AP, serialization helpers
  data/          Registries for classes, items, monsters, reforges
  gen/           Dungeon, merchant, and encounter generation
  save/          LocalStorage persistence helpers
  ui/            ASCII renderer, overlays, inventory, aiming
  tests/         Lightweight vitest suites mirroring acceptance checks
```

Extend data registries (items, monsters, biomes) by appending to the relevant arrays inside `src/data`. Systems automatically pick up new entries.

## Acceptance checks

Headless tests covering action point progression, dash rules, mage wand usage, inventory scrap rules, reforge cost scaling, merchant rerolls, dungeon safety, and monster senses live in `src/tests`. They run via `npm test` (vitest), though the provided instructions prefer shipping without executing the suite locally.

## Notes & Assumptions

- Class HP biases use offsets: Warrior +2, Ranger/Thief +0, Mage −1 per floor roll.
- Stamina regenerates when you avoid dashing on your turn and when you use stairs (hook ready to extend).
- Dash failure consumes 2 AP, matching the specification.
- Reforge costs follow the locked triangular sequence `3 → 6 → 10 → 15 → 21`.
- Save slots persist to LocalStorage as Base64-encoded JSON blobs tagged with a version string.
