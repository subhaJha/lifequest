const TITLES: Record<number, string> = {
  1: 'Novice Adventurer',
  2: 'Apprentice',
  3: 'Skilled Traveler',
  4: 'Seasoned Fighter',
  5: 'Elite Guardian',
};

export function getLevelTitle(level: number): string {
  if (level <= 1) return TITLES[1];
  if (TITLES[level]) return TITLES[level];
  if (level < 10) return 'Dungeon Champion';
  return 'Legendary Conqueror';
}

