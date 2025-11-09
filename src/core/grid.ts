import type { Dungeon, Tile, Vec2 } from "./types";

export function createGrid<T>(width: number, height: number, factory: (pos: Vec2) => T): T[][] {
  const rows: T[][] = [];
  for (let y = 0; y < height; y++) {
    const row: T[] = [];
    for (let x = 0; x < width; x++) {
      row.push(factory({ x, y }));
    }
    rows.push(row);
  }
  return rows;
}

export function inBounds(dungeon: Dungeon, pos: Vec2): boolean {
  return pos.x >= 0 && pos.y >= 0 && pos.x < dungeon.width && pos.y < dungeon.height;
}

export function tileAt(dungeon: Dungeon, pos: Vec2): Tile | undefined {
  if (!inBounds(dungeon, pos)) return undefined;
  return dungeon.tiles[pos.y][pos.x];
}

export function neighbors4(pos: Vec2): Vec2[] {
  return [
    { x: pos.x + 1, y: pos.y },
    { x: pos.x - 1, y: pos.y },
    { x: pos.x, y: pos.y + 1 },
    { x: pos.x, y: pos.y - 1 }
  ];
}

export function neighbors8(pos: Vec2): Vec2[] {
  const dirs: Vec2[] = [];
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (dx === 0 && dy === 0) continue;
      dirs.push({ x: pos.x + dx, y: pos.y + dy });
    }
  }
  return dirs;
}

export function rectPoints(x: number, y: number, w: number, h: number): Vec2[] {
  const pts: Vec2[] = [];
  for (let iy = y; iy < y + h; iy++) {
    for (let ix = x; ix < x + w; ix++) {
      pts.push({ x: ix, y: iy });
    }
  }
  return pts;
}
