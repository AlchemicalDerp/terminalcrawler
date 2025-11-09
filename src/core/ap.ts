import type { GameState } from "./types";

export const DEFAULT_ACTION_COSTS = {
  move: 2,
  attack: 6,
  wait: 1,
  interact: 3,
  openDoor: 2,
  dash: 4
} as const;

export function refreshPlayerAP(state: GameState): void {
  state.playerTurn.ap = state.player.apBase;
}

export function spendAP(state: GameState, cost: number): boolean {
  if (state.playerTurn.ap < cost) return false;
  state.playerTurn.ap -= cost;
  return true;
}

export function canDash(state: GameState): boolean {
  const cost = state.player.cls === "Thief" && state.playerMeta.turnsSinceDash % 2 === 1 ? 0 : 1;
  if (state.playerTurn.ap < DEFAULT_ACTION_COSTS.dash) return false;
  if (cost === 0) return true;
  return state.player.stamina.cur >= cost;
}

export function spendStamina(state: GameState, amount: number): void {
  state.player.stamina.cur = Math.max(0, state.player.stamina.cur - amount);
}

export function recoverStamina(state: GameState): void {
  if (state.player.stamina.cur < state.player.stamina.max) {
    state.player.stamina.cur += 1;
  }
}
