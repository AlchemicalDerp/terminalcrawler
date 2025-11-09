import { tileAt, inBounds } from "./grid";
import type { GameState, Vec2 } from "./types";
import { DEFAULT_ACTION_COSTS, spendAP, spendStamina, canDash, recoverStamina } from "./ap";
import { computeFOV } from "./fov";
import { addLog } from "./state";
import { processMonsters } from "../ai/behavior";
import { refreshPlayerAP } from "./ap";

export function movePlayer(state: GameState, delta: Vec2): void {
  const target = { x: state.player.position.x + delta.x, y: state.player.position.y + delta.y };
  if (!canMoveTo(state, target)) {
    addLog(state, { text: "You bump into something.", color: "#888" });
    return;
  }
  if (!spendAP(state, DEFAULT_ACTION_COSTS.move)) return;
  state.player.position = target;
  const playerEntity = state.entities.get(state.player.entityId);
  if (playerEntity) playerEntity.position = target;
  reveal(state);
  recoverStamina(state);
  afterPlayerAction(state);
}

export function waitTurn(state: GameState): void {
  if (!spendAP(state, DEFAULT_ACTION_COSTS.wait)) return;
  addLog(state, { text: "You wait for a moment.", color: "#666" });
  recoverStamina(state);
  afterPlayerAction(state);
}

export function dash(state: GameState, delta: Vec2): void {
  if (!canDash(state)) {
    addLog(state, { text: "You need stamina to dash!", color: "#f55" });
    return;
  }
  const intermediate = { x: state.player.position.x + delta.x, y: state.player.position.y + delta.y };
  const target = { x: intermediate.x + delta.x, y: intermediate.y + delta.y };
  const blocked = !canMoveTo(state, intermediate) || !canMoveTo(state, target);
  if (blocked) {
    if (!spendAP(state, 2)) return;
    addLog(state, { text: "Dash blocked!", color: "#f99" });
    afterPlayerAction(state);
    return;
  }
  if (!spendAP(state, DEFAULT_ACTION_COSTS.dash)) return;
  spendStamina(state, dashStaminaCost(state));
  state.playerMeta.turnsSinceDash += 1;
  state.player.position = target;
  const playerEntity = state.entities.get(state.player.entityId);
  if (playerEntity) playerEntity.position = target;
  addLog(state, { text: "You dash forward!", color: "#fff" });
  reveal(state);
  afterPlayerAction(state);
}

function dashStaminaCost(state: GameState): number {
  if (state.player.cls === "Thief") {
    return state.playerMeta.turnsSinceDash % 2 === 1 ? 0 : 1;
  }
  return 1;
}

function canMoveTo(state: GameState, pos: Vec2): boolean {
  if (!inBounds(state.dungeon, pos)) return false;
  const tile = tileAt(state.dungeon, pos);
  if (!tile?.walkable) return false;
  for (const entity of state.entities.values()) {
    if (entity.blocksMovement && entity.position.x === pos.x && entity.position.y === pos.y) {
      if (entity.id !== state.player.entityId) return false;
    }
  }
  return true;
}

export function reveal(state: GameState): void {
  const fov = computeFOV(state.dungeon, state.player.position, { radius: 8 });
  state.dungeon.visible = fov;
  for (let y = 0; y < state.dungeon.height; y++) {
    for (let x = 0; x < state.dungeon.width; x++) {
      if (fov[y][x]) state.dungeon.seen[y][x] = true;
    }
  }
}

export function updateMonsterFOV(state: GameState): void {
  const overlays: Record<string, boolean[][]> = {};
  for (const monster of state.monsters.values()) {
    overlays[monster.id] = computeFOV(state.dungeon, monster.position, { radius: monster.vision });
  }
  state.overlays.monsterFOV = overlays;
}

function afterPlayerAction(state: GameState): void {
  if (state.playerTurn.ap <= 0) {
    processMonsters(state);
    refreshPlayerAP(state);
    updateMonsterFOV(state);
    state.playerMeta.turnsSinceDash = 0;
    reveal(state);
  }
}
