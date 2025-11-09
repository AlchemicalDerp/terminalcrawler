import type { BiomeId, Monster } from "../core/types";

export interface MonsterTemplate {
  id: string;
  name: string;
  glyph: string;
  fg: string;
  hp: number;
  ap: number;
  vision: number;
  cone?: { angle: number; arc: number };
  tags: string[];
  baseDamage: number;
  dr: number;
  ai: Monster["ai"];
}

export const biomeMonsters: Record<BiomeId, MonsterTemplate[]> = {
  moss: [
    {
      id: "vine_slime",
      name: "Vine Slime",
      glyph: "s",
      fg: "#7fd15b",
      hp: 6,
      ap: 8,
      vision: 7,
      tags: ["slime", "slow"],
      baseDamage: 2,
      dr: 0,
      ai: { kind: "wander" }
    },
    {
      id: "moss_ghoul",
      name: "Moss Ghoul",
      glyph: "g",
      fg: "#7ea04c",
      hp: 12,
      ap: 10,
      vision: 10,
      cone: { angle: 0, arc: 90 },
      tags: ["humanoid"],
      baseDamage: 3,
      dr: 1,
      ai: { kind: "idle" }
    }
  ],
  fungal: [
    {
      id: "sporeling",
      name: "Sporeling",
      glyph: "m",
      fg: "#d1a93c",
      hp: 5,
      ap: 10,
      vision: 7,
      tags: ["fungus"],
      baseDamage: 1,
      dr: 0,
      ai: { kind: "wander" }
    },
    {
      id: "myco_shaman",
      name: "Myco Shaman",
      glyph: "M",
      fg: "#ffdd88",
      hp: 9,
      ap: 12,
      vision: 10,
      cone: { angle: 0, arc: 90 },
      tags: ["caster", "humanoid"],
      baseDamage: 2,
      dr: 0,
      ai: { kind: "idle" }
    }
  ],
  crystal: [
    {
      id: "crystal_bat",
      name: "Crystal Bat",
      glyph: "b",
      fg: "#7ee7ff",
      hp: 4,
      ap: 12,
      vision: 7,
      tags: ["flying"],
      baseDamage: 1,
      dr: 0,
      ai: { kind: "wander" }
    },
    {
      id: "shard_knight",
      name: "Shard Knight",
      glyph: "K",
      fg: "#9ae0ff",
      hp: 14,
      ap: 12,
      vision: 10,
      cone: { angle: 0, arc: 90 },
      tags: ["humanoid", "elite"],
      baseDamage: 3,
      dr: 2,
      ai: { kind: "idle" }
    }
  ]
};

export function instantiateMonster(template: MonsterTemplate, position: { x: number; y: number }, id: string): Monster {
  return {
    id,
    type: "monster",
    name: template.name,
    glyph: template.glyph,
    fg: template.fg,
    position,
    hp: template.hp,
    ap: template.ap,
    vision: template.vision,
    cone: template.cone,
    tags: template.tags,
    baseDamage: template.baseDamage,
    dr: template.dr,
    ai: { ...template.ai },
    blocksMovement: true
  };
}
