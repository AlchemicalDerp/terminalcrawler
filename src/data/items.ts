import type { Armor, Consumable, ItemBase, Trinket, Weapon } from "../core/types";

export const weapons: Weapon[] = [
  {
    id: "dagger",
    name: "Dagger",
    kind: "weapon",
    rarity: "common",
    damage: 1,
    apUse: 4,
    scrapValue: [1, 2],
    tags: ["light"],
    classBias: { Thief: 2 }
  },
  {
    id: "longsword",
    name: "Longsword",
    kind: "weapon",
    rarity: "common",
    damage: 2,
    apUse: 6,
    scrapValue: [1, 2],
    tags: ["heavy"],
    classBias: { Warrior: 2 }
  },
  {
    id: "shortbow",
    name: "Shortbow",
    kind: "weapon",
    rarity: "common",
    damage: 1,
    range: 6,
    apUse: 6,
    scrapValue: [1, 2],
    classBias: { Ranger: 2 }
  },
  {
    id: "apprentice_wand",
    name: "Apprentice Wand",
    kind: "weapon",
    rarity: "common",
    damage: 1,
    apUse: 1,
    scrapValue: [1, 2],
    classBias: { Mage: 2 }
  },
  {
    id: "gladius",
    name: "Gladius",
    kind: "weapon",
    rarity: "uncommon",
    damage: 3,
    apUse: 6,
    scrapValue: [2, 3]
  },
  {
    id: "recurve_bow",
    name: "Recurve Bow",
    kind: "weapon",
    rarity: "uncommon",
    damage: 2,
    range: 7,
    apUse: 6,
    scrapValue: [2, 3]
  },
  {
    id: "oak_wand",
    name: "Oak Wand",
    kind: "weapon",
    rarity: "uncommon",
    damage: 2,
    apUse: 1,
    scrapValue: [2, 3],
    classBias: { Mage: 1 }
  },
  {
    id: "bucket_weapon",
    name: "Bucket",
    kind: "weapon",
    rarity: "common",
    damage: 1,
    apUse: 5,
    scrapValue: [1, 1],
    tags: ["improvised"]
  },
  {
    id: "pickaxe",
    name: "Pickaxe",
    kind: "weapon",
    rarity: "uncommon",
    damage: 2,
    apUse: 7,
    scrapValue: [2, 3],
    tags: ["tool"]
  }
];

export const armors: Armor[] = [
  {
    id: "leather_armor",
    name: "Leather Jerkin",
    kind: "armor",
    rarity: "common",
    slot: "chest",
    dr: 1,
    scrapValue: [1, 2]
  },
  {
    id: "chain_armor",
    name: "Chainmail",
    kind: "armor",
    rarity: "uncommon",
    slot: "chest",
    dr: 2,
    scrapValue: [2, 3]
  },
  {
    id: "plate_armor",
    name: "Plate Cuirass",
    kind: "armor",
    rarity: "rare",
    slot: "chest",
    dr: 3,
    scrapValue: [3, 4]
  },
  {
    id: "bucket_helm",
    name: "Bucket Helm",
    kind: "armor",
    rarity: "common",
    slot: "head",
    dr: 1,
    scrapValue: [1, 1]
  }
];

export const trinkets: Trinket[] = [
  {
    id: "scout_lens",
    name: "Scout's Lens",
    kind: "trinket",
    rarity: "uncommon",
    effects: { vision: 1, trapDetect: 10 },
    scrapValue: [2, 3]
  },
  {
    id: "blood_charm",
    name: "Blood Charm",
    kind: "trinket",
    rarity: "rare",
    effects: { flatDamage: 1 },
    scrapValue: [3, 4]
  },
  {
    id: "chrono_pebble",
    name: "Chrono Pebble",
    kind: "trinket",
    rarity: "rare",
    effects: { apOnKill: 2 },
    scrapValue: [3, 4]
  },
  {
    id: "hex_loop",
    name: "Hex Loop",
    kind: "trinket",
    rarity: "rare",
    effects: { manaOnRest: 1 },
    scrapValue: [3, 4]
  }
];

export const consumables: Consumable[] = [
  {
    id: "minor_tonic",
    name: "Minor Tonic",
    kind: "consumable",
    rarity: "common",
    effectId: "heal_minor",
    apUse: 4,
    scrapValue: [1, 2]
  },
  {
    id: "bandage",
    name: "Bandage",
    kind: "consumable",
    rarity: "common",
    effectId: "stop_bleed",
    apUse: 4,
    scrapValue: [1, 2]
  },
  {
    id: "major_elixir",
    name: "Major Elixir",
    kind: "consumable",
    rarity: "rare",
    effectId: "heal_major",
    apUse: 6,
    scrapValue: [2, 4]
  }
];

export const itemRegistry: Record<string, ItemBase> = {};

for (const group of [weapons, armors, trinkets, consumables]) {
  for (const item of group) {
    itemRegistry[item.id] = item;
  }
}
