import { createGrid } from "../core/grid";
import type { Dungeon, Tile, Vec2, BiomeId } from "../core/types";
import { SeededPRNG } from "../core/prng";
import { defaultDungeonSettings, RoomsAndMazesSettings } from "./settings";

export interface Room {
  x: number;
  y: number;
  width: number;
  height: number;
  region: number;
}

interface Connector {
  position: Vec2;
  regions: Set<number>;
}

const biomes: BiomeId[] = ["moss", "fungal", "crystal"];

const CARDINALS = [
  { x: 1, y: 0 },
  { x: -1, y: 0 },
  { x: 0, y: 1 },
  { x: 0, y: -1 }
] as const;

class DisjointSet {
  private parent: number[];

  constructor(size: number) {
    this.parent = Array.from({ length: size }, (_, index) => index);
  }

  find(x: number): number {
    if (this.parent[x] !== x) {
      this.parent[x] = this.find(this.parent[x]);
    }
    return this.parent[x];
  }

  union(a: number, b: number): void {
    const rootA = this.find(a);
    const rootB = this.find(b);
    if (rootA === rootB) return;
    this.parent[rootB] = rootA;
  }
}

export interface DungeonGenerationResult {
  dungeon: Dungeon;
  rooms: Room[];
  spawn: Vec2;
  exit: Vec2;
  biome: BiomeId;
}

export function generateDungeon(
  seed: string,
  overrides: Partial<RoomsAndMazesSettings> = {}
): DungeonGenerationResult {
  const settings: RoomsAndMazesSettings = { ...defaultDungeonSettings, ...overrides };
  const prng = new SeededPRNG(seed);
  const biome = biomes[Math.floor(prng.next() * biomes.length)];

  const width = Math.max(5, settings.width | 0);
  const height = Math.max(5, settings.height | 0);

  const tiles = createGrid<Tile>(width, height, () => ({ glyph: "#", walkable: false, blocksSight: true }));
  const seen = createGrid(width, height, () => false);
  const visible = createGrid(width, height, () => false);
  const light = createGrid(width, height, () => 0);
  const regions = createGrid(width, height, () => -1);

  let currentRegion = 0;
  const rooms: Room[] = [];

  const roomAttempts = Math.max(1, settings.roomAttempts | 0);
  for (let i = 0; i < roomAttempts; i++) {
    const roomWidth = randomOdd(prng, settings.minRoomSize, settings.maxRoomSize);
    const roomHeight = randomOdd(prng, settings.minRoomSize, settings.maxRoomSize);
    const maxX = width - roomWidth - 1;
    const maxY = height - roomHeight - 1;
    if (maxX <= 1 || maxY <= 1) break;
    const x = 1 + randomInt(prng, 0, Math.max(0, maxX - 1));
    const y = 1 + randomInt(prng, 0, Math.max(0, maxY - 1));
    const candidate: Room = { x, y, width: roomWidth, height: roomHeight, region: currentRegion };
    if (rooms.some((room) => roomsOverlap(room, candidate))) {
      continue;
    }
    const region = currentRegion++;
    candidate.region = region;
    carveRoom(tiles, regions, candidate, region);
    rooms.push(candidate);
  }

  if (rooms.length === 0) {
    const minSize = Math.max(5, settings.minRoomSize);
    const fallbackWidthBase = Math.min(width - 2, minSize);
    const fallbackHeightBase = Math.min(height - 2, minSize);
    const fallbackWidth = fallbackWidthBase % 2 === 0 ? fallbackWidthBase - 1 : fallbackWidthBase;
    const fallbackHeight = fallbackHeightBase % 2 === 0 ? fallbackHeightBase - 1 : fallbackHeightBase;
    const fallback: Room = {
      x: Math.floor((width - fallbackWidth) / 2),
      y: Math.floor((height - fallbackHeight) / 2),
      width: fallbackWidth,
      height: fallbackHeight,
      region: currentRegion
    };
    carveRoom(tiles, regions, fallback, currentRegion++);
    rooms.push(fallback);
  }

  for (let y = 1; y < height - 1; y += 2) {
    for (let x = 1; x < width - 1; x += 2) {
      if (regions[y][x] !== -1) continue;
      growMaze({ x, y }, prng, settings, tiles, regions, () => currentRegion++);
    }
  }

  const connectors = findConnectors(tiles, regions);
  connectRegions(connectors, prng, settings, tiles, regions, currentRegion);

  const spawnRoom = selectSpawnRoom(rooms);
  const spawn = centerOfRoom(spawnRoom);
  ensureWalkable(tiles, regions, spawn, spawnRoom.region);

  const exit = placeExit(tiles, spawn, prng);
  tiles[exit.y][exit.x] = { glyph: ">", walkable: true, blocksSight: false, tags: ["exit"] };

  const dungeon: Dungeon = { width, height, tiles, seen, visible, light, biome };
  return { dungeon, rooms, spawn, exit, biome };
}

function carveRoom(tiles: Tile[][], regions: number[][], room: Room, region: number): void {
  for (let y = room.y; y < room.y + room.height; y++) {
    for (let x = room.x; x < room.x + room.width; x++) {
      carveTile(tiles, regions, { x, y }, region);
    }
  }
}

function carveTile(tiles: Tile[][], regions: number[][], pos: Vec2, region: number): void {
  tiles[pos.y][pos.x] = { glyph: ".", walkable: true, blocksSight: false };
  regions[pos.y][pos.x] = region;
}

function randomOdd(prng: SeededPRNG, min: number, max: number): number {
  const low = Math.max(3, Math.min(min, max));
  const high = Math.max(low, max);
  const options: number[] = [];
  for (let size = low; size <= high; size++) {
    if (size % 2 === 1) {
      options.push(size);
    }
  }
  if (options.length === 0) {
    const fallback = low % 2 === 1 ? low : low + 1;
    return Math.max(3, fallback);
  }
  const index = Math.floor(prng.next() * options.length);
  return options[index];
}

function randomInt(prng: SeededPRNG, min: number, max: number): number {
  if (max <= min) return min;
  return Math.floor(prng.next() * (max - min + 1)) + min;
}

function roomsOverlap(a: Room, b: Room): boolean {
  return !(
    a.x + a.width + 1 <= b.x ||
    b.x + b.width + 1 <= a.x ||
    a.y + a.height + 1 <= b.y ||
    b.y + b.height + 1 <= a.y
  );
}

function growMaze(
  start: Vec2,
  prng: SeededPRNG,
  settings: RoomsAndMazesSettings,
  tiles: Tile[][],
  regions: number[][],
  nextRegion: () => number
): void {
  const region = nextRegion();
  const cells: Vec2[] = [];
  let lastDir: Vec2 | undefined;
  carveTile(tiles, regions, start, region);
  cells.push(start);

  while (cells.length > 0) {
    const cell = cells[cells.length - 1];
    const options = availableDirections(cell, regions);
    if (options.length > 0) {
      let direction = options[0];
      if (lastDir && options.includes(lastDir) && prng.next() > settings.windingPercent) {
        direction = lastDir;
      } else {
        direction = options[Math.floor(prng.next() * options.length)];
      }
      const next: Vec2 = { x: cell.x + direction.x * 2, y: cell.y + direction.y * 2 };
      const between: Vec2 = { x: cell.x + direction.x, y: cell.y + direction.y };
      carveTile(tiles, regions, between, region);
      carveTile(tiles, regions, next, region);
      cells.push(next);
      lastDir = direction;
    } else {
      cells.pop();
      lastDir = undefined;
    }
  }
}

function availableDirections(cell: Vec2, regions: number[][]): Vec2[] {
  const dirs: Vec2[] = [];
  for (const dir of CARDINALS) {
    const nx = cell.x + dir.x * 2;
    const ny = cell.y + dir.y * 2;
    if (ny <= 0 || ny >= regions.length - 1 || nx <= 0 || nx >= regions[0].length - 1) continue;
    if (regions[ny][nx] !== -1) continue;
    dirs.push(dir);
  }
  return dirs;
}

function findConnectors(tiles: Tile[][], regions: number[][]): Connector[] {
  const connectors: Connector[] = [];
  for (let y = 1; y < tiles.length - 1; y++) {
    for (let x = 1; x < tiles[0].length - 1; x++) {
      if (tiles[y][x].walkable) continue;
      const adjacent = new Set<number>();
      for (const dir of CARDINALS) {
        const nx = x + dir.x;
        const ny = y + dir.y;
        const region = regions[ny][nx];
        if (region !== -1) {
          adjacent.add(region);
        }
      }
      if (adjacent.size >= 2) {
        connectors.push({ position: { x, y }, regions: adjacent });
      }
    }
  }
  return connectors;
}

function connectRegions(
  connectors: Connector[],
  prng: SeededPRNG,
  settings: RoomsAndMazesSettings,
  tiles: Tile[][],
  regions: number[][],
  regionCount: number
): void {
  shuffle(connectors, prng);
  const set = new DisjointSet(regionCount);
  const active = new Set<number>();
  for (let i = 0; i < regionCount; i++) {
    active.add(set.find(i));
  }

  const pending: Connector[] = connectors.slice();
  while (active.size > 1 && pending.length > 0) {
    const connector = pending.shift()!;
    const regionList = Array.from(connector.regions).map((id) => set.find(id));
    const uniqueRegions = new Set(regionList);
    if (uniqueRegions.size <= 1) {
      continue;
    }
    const baseRegion = regionList[0];
    carveConnector(connector, baseRegion, tiles, regions);
    const [primary, ...others] = Array.from(uniqueRegions);
    for (const other of others) {
      set.union(primary, other);
    }
    active.clear();
    for (let i = 0; i < regionCount; i++) {
      active.add(set.find(i));
    }
    for (let i = pending.length - 1; i >= 0; i--) {
      const test = Array.from(pending[i].regions).map((id) => set.find(id));
      if (new Set(test).size <= 1) {
        pending.splice(i, 1);
      }
    }
  }

  for (const connector of connectors) {
    if (tiles[connector.position.y][connector.position.x].walkable) continue;
    if (prng.next() < settings.extraConnectorChance) {
      const firstRegion = Array.from(connector.regions)[0];
      const regionId = set.find(firstRegion);
      carveConnector(connector, regionId, tiles, regions);
    }
  }
}

function carveConnector(connector: Connector, regionId: number, tiles: Tile[][], regions: number[][]): void {
  tiles[connector.position.y][connector.position.x] = { glyph: ".", walkable: true, blocksSight: false };
  regions[connector.position.y][connector.position.x] = regionId;
}

function shuffle<T>(array: T[], prng: SeededPRNG): void {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(prng.next() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function selectSpawnRoom(rooms: Room[]): Room {
  return rooms.reduce((largest, room) => {
    const area = room.width * room.height;
    const largestArea = largest.width * largest.height;
    return area > largestArea ? room : largest;
  }, rooms[0]);
}

function centerOfRoom(room: Room): Vec2 {
  return {
    x: room.x + Math.floor(room.width / 2),
    y: room.y + Math.floor(room.height / 2)
  };
}

function ensureWalkable(tiles: Tile[][], regions: number[][], pos: Vec2, region: number): void {
  tiles[pos.y][pos.x] = { glyph: ".", walkable: true, blocksSight: false };
  regions[pos.y][pos.x] = region;
}

function placeExit(tiles: Tile[][], start: Vec2, prng: SeededPRNG): Vec2 {
  const width = tiles[0].length;
  const height = tiles.length;
  const distances = createGrid(width, height, () => -1);
  const queue: Vec2[] = [start];
  let index = 0;
  distances[start.y][start.x] = 0;
  let farthest = start;

  while (index < queue.length) {
    const current = queue[index++];
    const dist = distances[current.y][current.x];
    if (dist > distances[farthest.y][farthest.x]) {
      farthest = current;
    }
    for (const dir of CARDINALS) {
      const nx = current.x + dir.x;
      const ny = current.y + dir.y;
      if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
      if (!tiles[ny][nx].walkable) continue;
      if (distances[ny][nx] !== -1) continue;
      distances[ny][nx] = dist + 1;
      queue.push({ x: nx, y: ny });
    }
  }

  if (farthest.x === start.x && farthest.y === start.y && queue.length > 1) {
    farthest = queue[Math.floor(prng.next() * queue.length)];
  }

  return farthest;
}
