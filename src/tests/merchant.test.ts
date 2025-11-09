import { describe, it, expect } from "vitest";
import { createInitialState } from "../core/state";
import { rerollMerchantStock } from "../gen/merchant";

describe("Merchant", () => {
  it("reroll costs 15 scrap", () => {
    const state = createInitialState({ seed: "merchant" });
    const { scrapLeft, stock } = rerollMerchantStock(state, 20);
    expect(scrapLeft).toBe(5);
    expect(stock).toHaveLength(6);
  });
});
