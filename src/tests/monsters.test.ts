import { describe, it, expect } from "vitest";
import { biomeMonsters } from "../data/monsters";

describe("Enemy senses", () => {
  it("humanoids have 10 vision", () => {
    const humanoids = Object.values(biomeMonsters).flat().filter((m) => m.tags.includes("humanoid"));
    expect(humanoids.every((m) => m.vision === 10)).toBe(true);
  });

  it("slimes/bats radius 7", () => {
    const soft = Object.values(biomeMonsters)
      .flat()
      .filter((m) => m.tags.includes("slime") || m.name.includes("Bat"));
    expect(soft.every((m) => m.vision === 7)).toBe(true);
  });
});
