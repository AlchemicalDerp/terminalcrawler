import { describe, it, expect } from "vitest";
import { reforgeCost } from "../data/reforge";

describe("Reforge costs", () => {
  it("follows escalating sequence", () => {
    expect([0, 1, 2, 3, 4].map(reforgeCost)).toEqual([3, 6, 10, 15, 21]);
  });
});
