import { describe, it, expect } from "vitest";
import { createInitialState } from "../core/state";
import { itemRegistry } from "../data/items";
import { calculateScrap } from "../core/scrap";

function setup() {
  const state = createInitialState({ seed: "inventory" });
  const item = { ...itemRegistry["minor_tonic"] };
  state.player.inventory = [item];
  return { state, item };
}

describe("Inventory context", () => {
  it("doubles scrap when reforged", () => {
    const { state, item } = setup();
    state.player.reforges[item.id] = [{ kind: "Warded", tier: 1 }];
    const value = calculateScrap(state, item);
    const [min, max] = item.scrapValue;
    expect(value).toBeGreaterThanOrEqual(min * 2);
    expect(value).toBeLessThanOrEqual(max * 2);
  });
});
