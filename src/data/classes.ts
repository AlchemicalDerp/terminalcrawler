import type { PlayerClass, PlayerState } from "../core/types";
import { itemRegistry } from "./items";

export interface ClassDefinition {
  id: PlayerClass;
  baseStats: PlayerState["stats"];
  description: string;
  startingItems: string[];
  stamina: number;
  mana?: number;
  passive?: string;
}

export const classes: Record<PlayerClass, ClassDefinition> = {
  Warrior: {
    id: "Warrior",
    baseStats: { STR: 8, DEX: 5, INT: 3, VIT: 8, WIS: 4, LCK: 4 },
    description: "Tough fighter with shield tricks.",
    startingItems: ["longsword", "leather_armor", "minor_tonic"],
    stamina: 3,
    passive: "+1 flat DR"
  },
  Ranger: {
    id: "Ranger",
    baseStats: { STR: 5, DEX: 8, INT: 4, VIT: 6, WIS: 5, LCK: 6 },
    description: "Sharpshooter with keen senses.",
    startingItems: ["shortbow", "leather_armor", "minor_tonic"],
    stamina: 3,
    passive: "Free diagonal shots"
  },
  Thief: {
    id: "Thief",
    baseStats: { STR: 5, DEX: 8, INT: 5, VIT: 5, WIS: 4, LCK: 7 },
    description: "Sneaky opportunist.",
    startingItems: ["dagger", "minor_tonic", "bandage"],
    stamina: 3,
    passive: "Dash stamina reduction"
  },
  Mage: {
    id: "Mage",
    baseStats: { STR: 3, DEX: 5, INT: 9, VIT: 4, WIS: 8, LCK: 5 },
    description: "Arcane specialist.",
    startingItems: ["apprentice_wand", "minor_tonic", "major_elixir"],
    stamina: 3,
    mana: 5,
    passive: "Wand zap 1 AP"
  }
};

export function createStartingPlayer(cls: PlayerClass): PlayerState {
  const definition = classes[cls];
  const inventory = definition.startingItems.map((id) => itemRegistry[id]);
  const startingWeapon = inventory.find((item) => item.kind === "weapon");
  return {
    cls,
    level: 1,
    hp: { cur: 20, max: 20 },
    apBase: 10,
    stamina: { cur: definition.stamina, max: definition.stamina },
    mana: definition.mana ? { cur: definition.mana, max: definition.mana } : undefined,
    stats: { ...definition.baseStats },
    inventory,
    equipped: {
      weapon: startingWeapon && startingWeapon.kind === "weapon" ? startingWeapon : undefined
    },
    reforges: {},
    quickbar: []
  };
}
