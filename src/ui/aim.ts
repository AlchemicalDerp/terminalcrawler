import { findPath } from "../core/path";
import { inBounds } from "../core/grid";
import type { GameState, Vec2 } from "../core/types";

export function enterAim(state: GameState, mode: "manual" | "auto" = "manual"): void {
  state.overlays.aim = {
    active: true,
    mode,
    reticle: { ...state.player.position },
    path: []
  };
  if (mode === "auto") {
    autoSelectTarget(state);
  }
}

export function exitAim(state: GameState): void {
  state.overlays.aim = undefined;
}

export function moveReticle(state: GameState, delta: Vec2): void {
  if (!state.overlays.aim?.active) return;
  const ret = state.overlays.aim.reticle;
  const pos = { x: ret.x + delta.x, y: ret.y + delta.y };
  if (!inBounds(state.dungeon, pos)) return;
  state.overlays.aim.reticle = pos;
  updateAimPath(state, pos);
}

export function cycleTarget(state: GameState): void {
  if (!state.overlays.aim?.active) return;
  const monsters = Array.from(state.monsters.values());
  if (monsters.length === 0) return;
  const current = state.overlays.aim.target;
  const idx = monsters.findIndex((m) => m.id === current);
  const next = monsters[(idx + 1) % monsters.length];
  state.overlays.aim.target = next.id;
  state.overlays.aim.reticle = { ...next.position };
  updateAimPath(state, next.position);
}

export function confirmAim(state: GameState): void {
  if (!state.overlays.aim?.active) return;
  const target = state.overlays.aim.target;
  if (target) {
    // For now just log the target; combat system will process actual attacks.
    state.log.push({ text: `Targeting ${state.monsters.get(target)?.name ?? "nothing"}.`, color: "#ff0" });
  }
  exitAim(state);
}

function updateAimPath(state: GameState, pos: Vec2): void {
  const path = findPath(state.dungeon, state.player.position, pos) ?? [];
  if (!state.overlays.aim) return;
  state.overlays.aim.path = path;
  state.overlays.aim.target = Array.from(state.monsters.values()).find((m) => m.position.x === pos.x && m.position.y === pos.y)?.id;
}

function autoSelectTarget(state: GameState): void {
  const monsters = Array.from(state.monsters.values());
  monsters.sort((a, b) => distanceSq(state.player.position, a.position) - distanceSq(state.player.position, b.position));
  const target = monsters[0];
  if (!target || !state.overlays.aim) return;
  state.overlays.aim.target = target.id;
  state.overlays.aim.reticle = { ...target.position };
  updateAimPath(state, target.position);
}

function distanceSq(a: Vec2, b: Vec2): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy;
}
