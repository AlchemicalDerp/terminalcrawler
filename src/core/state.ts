import { generateDungeon } from "../gen/dungeon";
import type { GameState, GameLogEntry, Entity, Monster } from "./types";
import { SeededPRNG } from "./prng";
import { createStartingPlayer } from "../data/classes";
import { instantiateMonster, biomeMonsters } from "../data/monsters";
import { apForLevel } from "./progression";

let entityCounter = 0;

export interface GameOptions {
  seed?: string;
}

export function createInitialState(opts: GameOptions = {}): GameState {
  const seed = opts.seed ?? `${Date.now()}`;
  const prng = new SeededPRNG(seed);
  const { dungeon, spawn, biome } = generateDungeon(60, 40, seed);

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
    const position = {
      x: Math.max(1, Math.min(dungeon.width - 2, Math.floor(prng.next() * dungeon.width))),
      y: Math.max(1, Math.min(dungeon.height - 2, Math.floor(prng.next() * dungeon.height)))
    };
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
    playerMeta: { turnsSinceDash: 0 }
  } as GameState;

  return state;
}

export function addLog(state: GameState, entry: GameLogEntry): void {
  state.log.push(entry);
}

function nextEntityId(): string {
  entityCounter += 1;
  return `ent_${entityCounter}`;
}
