import type { PRNG } from "./types";

function mulberry32(seed: number): () => number {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export class SeededPRNG implements PRNG {
  private generator: () => number;
  private seed: number;
  private label: string;

  constructor(seed: string, label = "root") {
    this.label = label;
    this.seed = hashString(`${seed}:${label}`);
    this.generator = mulberry32(this.seed);
  }

  next(): number {
    return this.generator();
  }

  fork(label: string): PRNG {
    return new SeededPRNG(`${this.seed}`, `${this.label}/${label}`);
  }

  serialize(): string {
    return `${this.seed}`;
  }
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const chr = str.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0;
  }
  return hash >>> 0;
}
