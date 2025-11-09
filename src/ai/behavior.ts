import { findPath } from "../core/path";
import { inBounds, tileAt } from "../core/grid";
import type { GameState, Monster, Vec2 } from "../core/types";
import { monsterAttack } from "../combat/damage";

export function processMonsters(state: GameState): void {
  for (const monster of Array.from(state.monsters.values())) {
    takeTurn(state, monster);
  }
}

function takeTurn(state: GameState, monster: Monster): void {
  const dist = distance(state.player.position, monster.position);
  if (dist <= 1.5) {
    monsterAttack(state, monster);
    return;
  }
  const path = findPath(state.dungeon, monster.position, state.player.position);
  if (path && path.length > 1) {
    const next = path[1];
    if (canMove(state, next)) {
      monster.position = next;
      const entity = state.entities.get(monster.id);
      if (entity) entity.position = next;
    }
  }
}

function canMove(state: GameState, pos: Vec2): boolean {
  if (!inBounds(state.dungeon, pos)) return false;
  const tile = tileAt(state.dungeon, pos);
  if (!tile?.walkable) return false;
  for (const entity of state.entities.values()) {
    if (entity.blocksMovement && entity.position.x === pos.x && entity.position.y === pos.y && entity.type !== "monster") {
      return false;
    }
  }
  return true;
}

function distance(a: Vec2, b: Vec2): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}
