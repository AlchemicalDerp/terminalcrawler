import type { Dungeon, Vec2 } from "./types";
import { createGrid, inBounds, tileAt } from "./grid";

export type FOVMap = boolean[][];

export interface FOVResult {
  visible: FOVMap;
  distance: number[][];
}

export interface FOVOptions {
  radius: number;
  opacity?: (pos: Vec2) => number;
}

export function computeFOV(dungeon: Dungeon, origin: Vec2, opts: FOVOptions): FOVResult {
  const visible = createGrid(dungeon.width, dungeon.height, () => false);
  const distanceMap = createGrid(dungeon.width, dungeon.height, () => Number.POSITIVE_INFINITY);
  visible[origin.y][origin.x] = true;
  distanceMap[origin.y][origin.x] = 0;

  const radius = opts.radius;
  const opacity = opts.opacity ?? ((pos: Vec2) => (tileAt(dungeon, pos)?.blocksSight ? 1 : 0));

  for (let oct = 0; oct < 8; oct++) {
    castLight(
      dungeon,
      origin,
      1,
      1.0,
      0.0,
      radius,
      mult[oct][0],
      mult[oct][1],
      mult[oct][2],
      mult[oct][3],
      visible,
      distanceMap,
      opacity
    );
  }

  return { visible, distance: distanceMap };
}

const mult = [
  [1, 0, 0, 1],
  [0, 1, 1, 0],
  [0, -1, 1, 0],
  [-1, 0, 0, 1],
  [-1, 0, 0, -1],
  [0, -1, -1, 0],
  [0, 1, -1, 0],
  [1, 0, 0, -1]
] as const;

function castLight(
  dungeon: Dungeon,
  origin: Vec2,
  row: number,
  start: number,
  end: number,
  radius: number,
  xx: number,
  xy: number,
  yx: number,
  yy: number,
  visible: FOVMap,
  distanceMap: number[][],
  opacity: (pos: Vec2) => number
): void {
  if (start < end) return;
  const radiusSq = radius * radius;
  for (let distance = row; distance <= radius; distance++) {
    let newStart = 0;
    let blocked = false;
    for (let delta = -distance; delta <= 0; delta++) {
      const lSlope = (delta - 0.5) / (distance + 0.5);
      const rSlope = (delta + 0.5) / (distance - 0.5);
      if (start < rSlope) continue;
      if (end > lSlope) break;

      const x = origin.x + delta * xx + distance * xy;
      const y = origin.y + delta * yx + distance * yy;
      const pos = { x, y };
      if (!inBounds(dungeon, pos)) continue;

      const distanceSq = (delta * delta) + (distance * distance);
      if (distanceSq <= radiusSq) {
        visible[y][x] = true;
        const dist = Math.sqrt(distanceSq);
        if (dist < distanceMap[y][x]) {
          distanceMap[y][x] = dist;
        }
      }

      const tileOpacity = opacity(pos);
      if (blocked) {
        if (tileOpacity === 1) {
          newStart = rSlope;
          continue;
        }
        blocked = false;
        start = newStart;
      } else if (tileOpacity === 1 && distance < radius) {
        blocked = true;
        castLight(dungeon, origin, distance + 1, start, lSlope, radius, xx, xy, yx, yy, visible, distanceMap, opacity);
        newStart = rSlope;
      }
    }
    if (blocked) break;
  }
}
