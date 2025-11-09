import type { GameState, ItemBase, ReforgeMod } from "../core/types";
import { addLog } from "../core/state";

const costSequence = [3, 6, 10, 15, 21];

export function reforgeCost(level: number): number {
  return costSequence[Math.min(level, costSequence.length - 1)];
}

const mods: ReforgeMod["kind"][] = ["Warded", "Oiled", "Strengthening", "Mystic", "Masterful", "Cursed"];

export function applyReforge(state: GameState, item: ItemBase): ReforgeMod {
  const modsForItem = state.player.reforges[item.id] ?? [];
  const tier = modsForItem.length + 1;
  const roll = Math.floor(state.prng.next() * mods.length);
  const modKind = mods[roll];
  const mod: ReforgeMod = { kind: modKind, tier };
  state.player.reforges[item.id] = [...modsForItem, mod];
  if (modKind === "Cursed") {
    state.player.reforges[item.id] = [{ kind: "Cursed", tier: tier }];
    state.player.stats.STR -= 1 + Math.floor(state.floor / 10);
    state.player.hp.max -= 1 + Math.floor(state.floor / 5) + Math.floor(state.level / 3);
    addLog(state, { text: `${item.name} is cursed!`, color: "#f55" });
  } else {
    addLog(state, { text: `${item.name} gains ${mod.kind} ${mod.tier}.`, color: "#9ff" });
  }
  return mod;
}
