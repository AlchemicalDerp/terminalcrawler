import { describe, it, expect } from "vitest";
import { generateDungeon } from "../gen/dungeon";

describe("Generation safety", () => {
  it("produces safe spawn rooms", () => {
    const { dungeon, spawn } = generateDungeon(60, 40, "seed");
    expect(dungeon.tiles[spawn.y][spawn.x].walkable).toBe(true);
  });
});
