import type { GameState, SaveSlot } from "../core/types";

const STORAGE_KEY = "terminalcrawler.save";
const VERSION = "0.1.0";

interface PersistedState {
  slots: SaveSlot[];
}

export function loadSlots(): SaveSlot[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const decoded = JSON.parse(atob(raw)) as PersistedState;
    return decoded.slots ?? [];
  } catch (err) {
    console.warn("Failed to load save", err);
    return [];
  }
}

export function saveToSlot(state: GameState, slotIndex: number): void {
  const slots = loadSlots();
  const save: SaveSlot = {
    version: VERSION,
    seed: state.seed,
    prngState: state.prng.serialize(),
    floor: state.floor,
    player: state.player,
    fog: encodeFog(state),
    merchantState: state.merchantSchedule,
    bossesDefeated: [],
    timestamp: Date.now()
  };
  slots[slotIndex] = save;
  persist(slots);
}

function encodeFog(state: GameState): Uint8Array {
  const bits: number[] = [];
  for (let y = 0; y < state.dungeon.height; y++) {
    for (let x = 0; x < state.dungeon.width; x++) {
      bits.push(state.dungeon.seen[y][x] ? 1 : 0);
    }
  }
  return new Uint8Array(bits);
}

function persist(slots: SaveSlot[]): void {
  const data: PersistedState = { slots };
  localStorage.setItem(STORAGE_KEY, btoa(JSON.stringify(data)));
}
