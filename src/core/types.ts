export type Rarity = "common" | "uncommon" | "rare" | "epic" | "legendary" | "cursed";

export interface ReforgeMod {
  kind: "Warded" | "Oiled" | "Strengthening" | "Mystic" | "Masterful" | "Cursed";
  tier: number;
}

export interface ItemBase {
  id: string;
  name: string;
  kind: "weapon" | "armor" | "trinket" | "consumable" | "key" | "misc";
  rarity: Rarity;
  apUse?: number;
  scrapValue: [number, number];
  tags?: string[];
}

export interface Weapon extends ItemBase {
  kind: "weapon";
  damage: number;
  critChance?: number;
  range?: number;
  twoHanded?: boolean;
  classBias?: Partial<Record<PlayerClass, number>>;
}

export interface Armor extends ItemBase {
  kind: "armor";
  slot: "head" | "chest" | "hands" | "feet" | "offhand";
  dr: number;
}

export interface Trinket extends ItemBase {
  kind: "trinket";
  effects: Record<string, number | string | boolean>;
}

export interface Consumable extends ItemBase {
  kind: "consumable";
  effectId: string;
  apUse: number;
}

export interface Equipped {
  head?: Armor;
  chest?: Armor;
  hands?: Armor;
  feet?: Armor;
  offhand?: Armor | Weapon;
  weapon?: Weapon;
  trinket1?: Trinket;
  trinket2?: Trinket;
}

export type PlayerClass = "Warrior" | "Ranger" | "Thief" | "Mage";

export interface PlayerState {
  cls: PlayerClass;
  level: number;
  hp: { cur: number; max: number };
  apBase: number;
  stamina: { cur: number; max: number };
  mana?: { cur: number; max: number };
  stats: { STR: number; DEX: number; INT: number; VIT: number; WIS: number; LCK: number };
  inventory: ItemBase[];
  equipped: Equipped;
  reforges: Record<string, ReforgeMod[]>;
  quickbar: string[];
}

export interface SaveSlot {
  version: string;
  seed: string;
  prngState: string;
  floor: number;
  player: PlayerState;
  fog: Uint8Array;
  merchantState: unknown;
  bossesDefeated: number[];
  timestamp: number;
}

export type TileGlyph = "#" | "." | "+" | ">" | "<" | "^" | "~" | "," | ":" | "=";

export interface Tile {
  glyph: TileGlyph;
  walkable: boolean;
  blocksSight: boolean;
  tags?: string[];
}

export interface Vec2 {
  x: number;
  y: number;
}

export type EntityType = "player" | "monster" | "item" | "trap" | "merchant" | "boss";

export interface Entity {
  id: string;
  type: EntityType;
  position: Vec2;
  glyph: string;
  fg: string;
  bg?: string;
  name: string;
  blocksMovement?: boolean;
}

export interface Monster extends Entity {
  type: "monster";
  hp: number;
  ap: number;
  vision: number;
  cone?: { angle: number; arc: number };
  ai: MonsterAIState;
  tags: string[];
  baseDamage: number;
  dr: number;
}

export type MonsterAIStateType = "idle" | "wander" | "investigate" | "chase" | "search" | "return";

export interface MonsterAIState {
  kind: MonsterAIStateType;
  target?: Vec2;
  heardAt?: Vec2;
  lastSeen?: Vec2;
  turns?: number;
}

export interface Dungeon {
  width: number;
  height: number;
  tiles: Tile[][];
  seen: boolean[][];
  visible: boolean[][];
  light: number[][];
  biome: BiomeId;
}

export type BiomeId = "moss" | "fungal" | "crystal";

export interface GameLogEntry {
  text: string;
  color?: string;
}

export interface ActionCost {
  ap: number;
  stamina?: number;
  mana?: number;
}

export interface GameState {
  dungeon: Dungeon;
  entities: Map<string, Entity>;
  monsters: Map<string, Monster>;
  player: PlayerState & { entityId: string; position: Vec2 };
  turnQueue: string[];
  log: GameLogEntry[];
  level: number;
  floor: number;
  seed: string;
  prng: PRNG;
  overlays: OverlayState;
  merchantSchedule: MerchantSchedule;
  playerTurn: { ap: number };
  playerMeta: { turnsSinceDash: number };
}

export interface OverlayState {
  aim?: AimOverlay;
  monsterFOV: Record<string, boolean[][]>;
}

export interface AimOverlay {
  active: boolean;
  mode: "manual" | "auto";
  target?: string;
  reticle: Vec2;
  path: Vec2[];
}

export interface MerchantSchedule {
  lastFloor: number;
  nextGuaranteed: number;
}

export interface PRNG {
  next(): number;
  fork(label: string): PRNG;
  serialize(): string;
}
