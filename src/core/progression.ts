export function apForLevel(level: number): number {
  return 10 + Math.floor(level / 2) * 2;
}

export function hpGainForFloor(cls: "Warrior" | "Ranger" | "Thief" | "Mage", floor: number, roll: number): number {
  const ranges = [
    { min: 1, max: 4 },
    { min: 3, max: 6 },
    { min: 5, max: 9 },
    { min: 8, max: 12 }
  ];
  const tier = Math.min(3, Math.floor((floor - 1) / 4));
  const base = ranges[tier];
  const offsets: Record<typeof cls, number> = {
    Warrior: 2,
    Ranger: 0,
    Thief: 0,
    Mage: -1
  } as const;
  const value = base.min + Math.floor(roll * (base.max - base.min + 1)) + offsets[cls];
  return Math.max(1, value);
}
