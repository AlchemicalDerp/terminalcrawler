import { weapons, armors, trinkets, consumables } from "../data/items";
import type { GameState, Entity } from "../core/types";
import { addLog } from "../core/state";

export interface MerchantState {
  stock: string[];
  floor: number;
}

export function ensureMerchant(state: GameState): void {
  if (state.floor === state.merchantSchedule.nextGuaranteed || (state.floor - state.merchantSchedule.lastFloor) >= 2) {
    spawnMerchant(state);
    state.merchantSchedule.lastFloor = state.floor;
    state.merchantSchedule.nextGuaranteed = state.floor + 2;
  }
}

function spawnMerchant(state: GameState): void {
  const position = { ...state.player.position };
  position.x += 2;
  const merchant: Entity = {
    id: `merchant_${state.floor}`,
    type: "merchant",
    position,
    glyph: "M",
    fg: "#ffb347",
    name: "Merchant",
    blocksMovement: true
  };
  state.entities.set(merchant.id, merchant);
  addLog(state, { text: "A merchant sets up nearby.", color: "#ffd27f" });
}

export function rerollMerchantStock(state: GameState, scrap: number): { stock: string[]; scrapLeft: number } {
  const cost = 15;
  if (scrap < cost) {
    addLog(state, { text: "Not enough scrap to reroll!", color: "#f55" });
    return { stock: [], scrapLeft: scrap };
  }
  const pool = [...weapons, ...armors, ...trinkets, ...consumables];
  const stock: string[] = [];
  for (let i = 0; i < 6; i++) {
    const item = pool[Math.floor(state.prng.next() * pool.length)];
    stock.push(item.id);
  }
  addLog(state, { text: "Merchant restocks their wares.", color: "#ffd27f" });
  return { stock, scrapLeft: scrap - cost };
}
