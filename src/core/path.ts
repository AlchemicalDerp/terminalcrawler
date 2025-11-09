import type { Dungeon, Vec2 } from "./types";
import { inBounds, neighbors4, tileAt } from "./grid";

interface Node {
  pos: Vec2;
  g: number;
  f: number;
  parent?: Node;
}

export function findPath(dungeon: Dungeon, start: Vec2, goal: Vec2): Vec2[] | undefined {
  const open: Node[] = [{ pos: start, g: 0, f: heuristic(start, goal) }];
  const closed = new Set<string>();

  while (open.length > 0) {
    open.sort((a, b) => a.f - b.f);
    const current = open.shift()!;
    if (current.pos.x === goal.x && current.pos.y === goal.y) {
      return reconstruct(current);
    }
    closed.add(key(current.pos));

    for (const neighbor of neighbors4(current.pos)) {
      if (!inBounds(dungeon, neighbor)) continue;
      const tile = tileAt(dungeon, neighbor);
      if (!tile || !tile.walkable) continue;
      const k = key(neighbor);
      if (closed.has(k)) continue;
      const cost = current.g + 1;
      let node = open.find((n) => n.pos.x === neighbor.x && n.pos.y === neighbor.y);
      if (!node) {
        node = { pos: neighbor, g: cost, f: cost + heuristic(neighbor, goal), parent: current };
        open.push(node);
      } else if (cost < node.g) {
        node.g = cost;
        node.parent = current;
        node.f = cost + heuristic(neighbor, goal);
      }
    }
  }
  return undefined;
}

function heuristic(a: Vec2, b: Vec2): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function reconstruct(node: Node): Vec2[] {
  const path: Vec2[] = [];
  let n: Node | undefined = node;
  while (n) {
    path.push(n.pos);
    n = n.parent;
  }
  return path.reverse();
}

function key(pos: Vec2): string {
  return `${pos.x},${pos.y}`;
}
