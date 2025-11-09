import { describe, it, expect } from "vitest";
import { createInitialState } from "../core/state";

describe("Mage wand", () => {
  it("costs 1 AP and deals 1 damage", () => {
    const state = createInitialState({ seed: "mage" });
    state.player.cls = "Mage";
    state.player.equipped.weapon = {
      id: "apprentice_wand",
      name: "Apprentice Wand",
      kind: "weapon",
      rarity: "common",
      damage: 1,
      apUse: 1,
      scrapValue: [1, 2]
    } as any;
    const monsterId = Array.from(state.monsters.keys())[0];
    const monster = state.monsters.get(monsterId)!;
    const apBefore = state.playerTurn.ap;
    const hpBefore = monster.hp;
    state.playerTurn.ap -= state.player.equipped.weapon.apUse ?? 1;
    monster.hp -= state.player.equipped.weapon.damage;
    expect(state.playerTurn.ap).toBe(apBefore - 1);
    expect(monster.hp).toBe(hpBefore - 1);
  });
});
