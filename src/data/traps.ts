import type { BiomeId } from "../core/types";

export interface TrapTemplate {
  id: string;
  name: string;
  glyph: string;
  damage: number;
  kind: "spike" | "dart" | "explosive" | "snare" | "rune";
  detection: number;
  disarm: number;
  tags?: string[];
}

export const biomeTraps: Record<BiomeId, TrapTemplate[]> = {
  moss: [
    { id: "vine_snare", name: "Vine Snare", glyph: "^", damage: 0, kind: "snare", detection: 35, disarm: 60, tags: ["slow"] },
    { id: "spike_plate", name: "Spike Plate", glyph: "^", damage: 3, kind: "spike", detection: 30, disarm: 40 }
  ],
  fungal: [
    { id: "spore_rune", name: "Spore Rune", glyph: "*", damage: 2, kind: "explosive", detection: 40, disarm: 50, tags: ["debuff"] }
  ],
  crystal: [
    { id: "dart_wall", name: "Dart Wall", glyph: "=", damage: 2, kind: "dart", detection: 35, disarm: 45 },
    { id: "shard_snare", name: "Shard Snare", glyph: "^", damage: 0, kind: "snare", detection: 30, disarm: 50 }
  ]
};
