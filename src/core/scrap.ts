import type { GameState, ItemBase } from "./types";

export function calculateScrap(state: GameState, item: ItemBase): number {
  const [min, max] = item.scrapValue;
  const reforges = state.player.reforges[item.id]?.length ?? 0;
  const roll = min + Math.floor(state.prng.next() * (max - min + 1));
  return reforges > 0 ? roll * 2 : roll;
}
