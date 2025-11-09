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
  const radius = Math.max(0, opts.radius);
  const opacity = opts.opacity ?? ((pos: Vec2) => (tileAt(dungeon, pos)?.blocksSight ? 1 : 0));

  visible[origin.y][origin.x] = true;
  distanceMap[origin.y][origin.x] = 0;

  const minY = Math.max(0, origin.y - radius);
  const maxY = Math.min(dungeon.height - 1, origin.y + radius);
  const minX = Math.max(0, origin.x - radius);
  const maxX = Math.min(dungeon.width - 1, origin.x + radius);

  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      if (x === origin.x && y === origin.y) continue;
      const dx = x - origin.x;
      const dy = y - origin.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > radius) continue;

      const line = traceLine(origin, { x, y });
      let blocked = false;
      let reachedTarget = false;
      let prevPoint: Vec2 = origin;
      for (const point of line) {
        if (!inBounds(dungeon, point)) {
          blocked = true;
          break;
        }
        const px = point.x;
        const py = point.y;
        const stepDx = px - origin.x;
        const stepDy = py - origin.y;
        const stepDist = Math.sqrt(stepDx * stepDx + stepDy * stepDy);
        if (stepDist > radius) break;

        if (!(px === origin.x && py === origin.y) && isDiagonalStep(prevPoint, point)) {
          const cornerA = { x: point.x, y: prevPoint.y };
          const cornerB = { x: prevPoint.x, y: point.y };
          if (cornerOpaque(cornerA, dungeon, opacity) || cornerOpaque(cornerB, dungeon, opacity)) {
            blocked = true;
            break;
          }
        }

        visible[py][px] = true;
        if (stepDist < distanceMap[py][px]) {
          distanceMap[py][px] = stepDist;
        }

        if (px === x && py === y) {
          reachedTarget = true;
          break;
        }

        if (!(px === origin.x && py === origin.y)) {
          const tileOpacity = sampleOpacity(point, dungeon, opacity);
          if (tileOpacity >= 1) {
            blocked = true;
            break;
          }
        }

        prevPoint = point;
      }

      if (!reachedTarget && blocked) {
        continue;
      }
    }
  }

  return { visible, distance: distanceMap };
}

function traceLine(start: Vec2, end: Vec2): Vec2[] {
  const points: Vec2[] = [];
  let x0 = start.x;
  let y0 = start.y;
  const x1 = end.x;
  const y1 = end.y;

  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;

  while (true) {
    points.push({ x: x0, y: y0 });
    if (x0 === x1 && y0 === y1) break;
    const e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      x0 += sx;
    }
    if (e2 < dx) {
      err += dx;
      y0 += sy;
    }
  }

  return points;
}

function isDiagonalStep(prev: Vec2, current: Vec2): boolean {
  return prev.x !== current.x && prev.y !== current.y;
}

function cornerOpaque(pos: Vec2, dungeon: Dungeon, opacity: (pos: Vec2) => number): boolean {
  if (!inBounds(dungeon, pos)) return true;
  return opacity(pos) >= 1;
}

function sampleOpacity(pos: Vec2, dungeon: Dungeon, opacity: (pos: Vec2) => number): number {
  if (!inBounds(dungeon, pos)) return 1;
  return opacity(pos);
}
