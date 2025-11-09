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
