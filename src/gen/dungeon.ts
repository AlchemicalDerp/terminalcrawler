import { createGrid, rectPoints } from "../core/grid";
import type { Dungeon, Tile, Vec2, BiomeId } from "../core/types";
import { SeededPRNG } from "../core/prng";

interface Room {
  x: number;
  y: number;
  width: number;
  height: number;
}

const biomes: BiomeId[] = ["moss", "fungal", "crystal"];

export interface DungeonGenerationResult {
  dungeon: Dungeon;
  rooms: Room[];
  spawn: Vec2;
  exit: Vec2;
  biome: BiomeId;
}

export function generateDungeon(width: number, height: number, seed: string): DungeonGenerationResult {
  const prng = new SeededPRNG(seed);
  const biome = biomes[Math.floor(prng.next() * biomes.length)];
  const tiles = createGrid<Tile>(width, height, () => ({ glyph: "#", walkable: false, blocksSight: true }));
  const seen = createGrid(width, height, () => false);
  const visible = createGrid(width, height, () => false);
  const light = createGrid(width, height, () => 0);

  const rooms: Room[] = [];
  const roomCount = 6 + Math.floor(prng.next() * 7); // 6-12

  for (let i = 0; i < roomCount; i++) {
    const w = 5 + Math.floor(prng.next() * 6);
    const h = 5 + Math.floor(prng.next() * 6);
    const x = 1 + Math.floor(prng.next() * (width - w - 1));
    const y = 1 + Math.floor(prng.next() * (height - h - 1));
    const room: Room = { x, y, width: w, height: h };
    if (rooms.some((r) => overlap(r, room))) continue;
    rooms.push(room);
    carveRoom(tiles, room);
    if (rooms.length > 1) {
      const prev = rooms[rooms.length - 2];
      connectRooms(tiles, center(prev), center(room));
    }
  }

  if (rooms.length === 0) {
    const fallback = { x: 2, y: 2, width: 8, height: 8 };
    rooms.push(fallback);
    carveRoom(tiles, fallback);
  }

  const spawnRoom = ensureSafeSpawn(prng, rooms, tiles);
  const spawn = { x: Math.floor(spawnRoom.x + spawnRoom.width / 2), y: Math.floor(spawnRoom.y + spawnRoom.height / 2) };
  const exitRoom = rooms[rooms.length - 1];
  const exit = { x: exitRoom.x + Math.floor(exitRoom.width / 2), y: exitRoom.y + Math.floor(exitRoom.height / 2) };
  tiles[exit.y][exit.x] = { glyph: ">", walkable: true, blocksSight: false, tags: ["exit"] };

  const dungeon: Dungeon = { width, height, tiles, seen, visible, light, biome };
  return { dungeon, rooms, spawn, exit, biome };
}

function carveRoom(tiles: Tile[][], room: Room): void {
  for (const pt of rectPoints(room.x, room.y, room.width, room.height)) {
    tiles[pt.y][pt.x] = { glyph: ".", walkable: true, blocksSight: false };
  }
}

function connectRooms(tiles: Tile[][], a: Vec2, b: Vec2): void {
  let x = a.x;
  let y = a.y;
  while (x !== b.x) {
    tiles[y][x] = { glyph: ".", walkable: true, blocksSight: false };
    x += x < b.x ? 1 : -1;
  }
  while (y !== b.y) {
    tiles[y][x] = { glyph: ".", walkable: true, blocksSight: false };
    y += y < b.y ? 1 : -1;
  }
}

function overlap(a: Room, b: Room): boolean {
  return !(a.x + a.width + 1 < b.x || b.x + b.width + 1 < a.x || a.y + a.height + 1 < b.y || b.y + b.height + 1 < a.y);
}

function center(room: Room): Vec2 {
  return { x: Math.floor(room.x + room.width / 2), y: Math.floor(room.y + room.height / 2) };
}

function ensureSafeSpawn(prng: SeededPRNG, rooms: Room[], tiles: Tile[][]): Room {
  const safeRooms = rooms.filter((room) => room.width >= 5 && room.height >= 5);
  const room = safeRooms[0] ?? rooms[0];
  carveSafety(room, tiles);
  return room;
}

function carveSafety(room: Room, tiles: Tile[][]): void {
  for (const pt of rectPoints(room.x - 1, room.y - 1, room.width + 2, room.height + 2)) {
    if (!tiles[pt.y] || !tiles[pt.y][pt.x]) continue;
    const tile = tiles[pt.y][pt.x];
    if (tile.glyph === "^") {
      tiles[pt.y][pt.x] = { glyph: ".", walkable: true, blocksSight: false };
    }
  }
  tiles[room.y][room.x + 1] = { glyph: ".", walkable: true, blocksSight: false };
  tiles[room.y + room.height - 1][room.x + room.width - 2] = { glyph: ".", walkable: true, blocksSight: false };
}
