import { generateDungeon } from "../gen/dungeon";
import { viewportDungeonSettings } from "../gen/settings";
import type { RoomsAndMazesSettings } from "../gen/settings";
import type { Dungeon, GameState, GameLogEntry, Entity, Monster, Vec2 } from "./types";
import { SeededPRNG } from "./prng";
import { createStartingPlayer } from "../data/classes";
import { instantiateMonster, biomeMonsters } from "../data/monsters";
import { apForLevel } from "./progression";

let entityCounter = 0;

export interface GameOptions {
  seed?: string;
  dungeon?: Partial<RoomsAndMazesSettings>;
}

export function createInitialState(opts: GameOptions = {}): GameState {
  const seed = opts.seed ?? `${Date.now()}`;
  const prng = new SeededPRNG(seed);
  const viewportOverrides = typeof window !== "undefined" ? viewportDungeonSettings() : {};
  const overrides = { ...viewportOverrides, ...(opts.dungeon ?? {}) };
  const { dungeon, spawn, biome } = generateDungeon(seed, overrides);

  const playerState = createStartingPlayer("Warrior");
  playerState.apBase = apForLevel(playerState.level);
  const playerEntity: Entity = {
    id: nextEntityId(),
    type: "player",
    position: spawn,
    glyph: "@",
    fg: "#fff",
    name: "You",
    blocksMovement: true
  };

  const entities = new Map<string, Entity>();
  const monsters = new Map<string, Monster>();
  entities.set(playerEntity.id, playerEntity);

  const monsterTemplates = biomeMonsters[biome];
  for (let i = 0; i < 4; i++) {
    const template = monsterTemplates[Math.floor(prng.next() * monsterTemplates.length)];
    const position = randomWalkableTile(dungeon, () => prng.next(), spawn);
    if (!position) continue;
    const entityId = nextEntityId();
    const monster = instantiateMonster(template, position, entityId);
    entities.set(monster.id, monster);
    monsters.set(monster.id, monster);
  }

  const state: GameState = {
    dungeon,
    entities,
    monsters,
    player: { ...playerState, entityId: playerEntity.id, position: spawn },
    turnQueue: [playerEntity.id],
    log: [{ text: "Welcome to Terminal Crawler!", color: "#9be7ff" }],
    level: 1,
    floor: 1,
    seed,
    prng,
    overlays: { monsterFOV: {} },
    merchantSchedule: { lastFloor: 0, nextGuaranteed: 2 },
    playerTurn: { ap: playerState.apBase },
    playerMeta: { turnsSinceDash: 0 },
    dungeonSettings: overrides
  } as GameState;

  return state;
}

export function addLog(state: GameState, entry: GameLogEntry): void {
  state.log.push(entry);
}

export function ascendFloor(state: GameState): void {
  const nextFloor = state.floor + 1;
  const viewportOverrides = typeof window !== "undefined" ? viewportDungeonSettings() : {};
  const overrides = { ...(state.dungeonSettings ?? {}), ...viewportOverrides };
  state.dungeonSettings = overrides;
  const seed = `${state.seed}:floor:${nextFloor}`;
  const { dungeon, spawn, biome } = generateDungeon(seed, overrides);

  state.floor = nextFloor;
  state.dungeon = dungeon;
  state.prng = new SeededPRNG(seed);

  const playerEntity = state.entities.get(state.player.entityId);
  state.player.position = spawn;
  if (playerEntity) {
    playerEntity.position = spawn;
  }

  removeMonsters(state);

  const monsterTemplates = biomeMonsters[biome];
  const spawnBudget = Math.max(3, Math.round((dungeon.width * dungeon.height) / 500));
  for (let i = 0; i < spawnBudget; i++) {
    const template = monsterTemplates[Math.floor(state.prng.next() * monsterTemplates.length)];
    const position = randomWalkableTile(dungeon, () => state.prng.next(), spawn);
    if (!position) continue;
    const entityId = nextEntityId();
    const monster = instantiateMonster(template, position, entityId);
    state.entities.set(monster.id, monster);
    state.monsters.set(monster.id, monster);
  }

  state.overlays.monsterFOV = {};
  addLog(state, { text: `Floor ${state.floor}`, color: "#9be7ff" });
}

function removeMonsters(state: GameState): void {
  for (const monsterId of state.monsters.keys()) {
    state.entities.delete(monsterId);
  }
  state.monsters.clear();
}

function randomWalkableTile(dungeon: Dungeon, next: () => number, exclude?: Vec2): Vec2 | undefined {
  for (let attempts = 0; attempts < 50; attempts++) {
    const x = Math.floor(next() * dungeon.width);
    const y = Math.floor(next() * dungeon.height);
    const tile = dungeon.tiles[y]?.[x];
    if (tile?.walkable) {
      if (exclude && exclude.x === x && exclude.y === y) {
        continue;
      }
      return { x, y };
    }
  }
  return undefined;
}

function nextEntityId(): string {
  entityCounter += 1;
  return `ent_${entityCounter}`;
}
