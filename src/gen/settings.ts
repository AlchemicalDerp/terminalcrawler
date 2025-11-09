export interface RoomsAndMazesSettings {
  width: number;
  height: number;
  roomAttempts: number;
  minRoomSize: number;
  maxRoomSize: number;
  extraConnectorChance: number;
  windingPercent: number;
}

export const defaultDungeonSettings: RoomsAndMazesSettings = {
  width: 69,
  height: 45,
  roomAttempts: 90,
  minRoomSize: 5,
  maxRoomSize: 13,
  extraConnectorChance: 0.18,
  windingPercent: 0.3
};

export function viewportDungeonSettings(): Partial<RoomsAndMazesSettings> {
  if (typeof window === "undefined") {
    return {};
  }

  const glyphSize = 16;
  const reservedHorizontal = 240 + 280 + 12 * 2 + 16 * 2; // side panels + gaps + map padding
  const availableWidthPx = Math.max(320, window.innerWidth - reservedHorizontal);
  const rawWidth = Math.max(30, Math.floor(availableWidthPx / glyphSize));
  const width = ensureOdd(Math.max(41, rawWidth));

  const reservedVertical = 24 + 16 * 2; // top spacing + map padding
  const availableHeightPx = Math.max(240, window.innerHeight - reservedVertical);
  const rawHeightFromScreen = Math.max(20, Math.floor(availableHeightPx / glyphSize));
  const targetHeightFromWidth = Math.floor(width * 0.58);
  let heightCandidate = Math.min(targetHeightFromWidth, rawHeightFromScreen);
  const minHeight = Math.min(rawHeightFromScreen, 27);
  heightCandidate = Math.max(heightCandidate, minHeight);
  const height = ensureOdd(heightCandidate);

  const area = width * height;
  const roomAttempts = Math.max(60, Math.round(area / 45));

  const maxRoomSize = ensureOdd(Math.max(9, Math.min(17, Math.floor(width / 4) * 2 + 1)));

  return {
    width,
    height,
    roomAttempts,
    minRoomSize: 5,
    maxRoomSize
  };
}

function ensureOdd(value: number): number {
  const base = Math.max(5, value);
  return base % 2 === 0 ? base - 1 : base;
}
