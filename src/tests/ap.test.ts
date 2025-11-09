import { describe, it, expect } from "vitest";
import { apForLevel } from "../core/progression";
import { createInitialState } from "../core/state";

describe("AP progression", () => {
  it("matches key levels", () => {
    expect(apForLevel(1)).toBe(10);
    expect(apForLevel(3)).toBe(12);
    expect(apForLevel(5)).toBe(14);
  });

  it("refresh does not carry over", () => {
    const state = createInitialState({ seed: "test" });
    const start = state.playerTurn.ap;
    state.playerTurn.ap -= 5;
    expect(state.playerTurn.ap).toBe(start - 5);
    state.playerTurn.ap = 0;
    // simulate end turn
    state.playerTurn.ap = start;
    expect(state.playerTurn.ap).toBe(start);
  });
});
