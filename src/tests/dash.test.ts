import { describe, it, expect } from "vitest";
import { createInitialState } from "../core/state";
import { dash } from "../core/actions";

describe("Dash rules", () => {
  it("consumes stamina unless thief bonus", () => {
    const state = createInitialState({ seed: "dash" });
    state.player.cls = "Warrior";
    const before = state.player.stamina.cur;
    dash(state, { x: 1, y: 0 });
    expect(state.player.stamina.cur).toBeLessThan(before);
  });

  it("blocked dash costs 2 AP", () => {
    const state = createInitialState({ seed: "dash_block" });
    const start = state.playerTurn.ap;
    state.entities.set("blocker", {
      id: "blocker",
      type: "monster",
      position: { x: state.player.position.x + 1, y: state.player.position.y },
      glyph: "#",
      fg: "#fff",
      name: "block",
      blocksMovement: true
    } as any);
    dash(state, { x: 1, y: 0 });
    expect(state.playerTurn.ap).toBe(start - 2);
  });
});
