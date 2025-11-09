import type { GameState } from "./types";

export function beginTurn(state: GameState, entityId: string): void {
  if (!state.turnQueue.includes(entityId)) {
    state.turnQueue.push(entityId);
  }
}

export function nextActor(state: GameState): string | undefined {
  const id = state.turnQueue.shift();
  if (id) state.turnQueue.push(id);
  return id;
}

export function spendAP(state: GameState, amount: number): void {
  state.player.apBase = Math.max(0, state.player.apBase - amount);
}
