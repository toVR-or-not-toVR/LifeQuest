export function xpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(level, 1.5));
}

export function calculateLevel(totalXP: number): number {
  let level = 1;
  while (xpForLevel(level + 1) <= totalXP) {
    level++;
  }
  return level;
}

export function xpToNextLevel(totalXP: number): number {
  const currentLevel = calculateLevel(totalXP);
  return xpForLevel(currentLevel + 1) - totalXP;
}

export function xpForCurrentLevel(totalXP: number): number {
  const currentLevel = calculateLevel(totalXP);
  const xpAtCurrentLevel = xpForLevel(currentLevel);
  const xpAtNextLevel = xpForLevel(currentLevel + 1);
  const progress = totalXP - xpAtCurrentLevel;
  const needed = xpAtNextLevel - xpAtCurrentLevel;
  return Math.min(progress / needed, 1);
}

export function getLevelTitle(level: number): string {
  if (level >= 50) return 'Legendary Hero';
  if (level >= 40) return 'Grandmaster';
  if (level >= 30) return 'Champion';
  if (level >= 20) return 'Warrior';
  if (level >= 15) return 'Knight';
  if (level >= 10) return 'Adventurer';
  if (level >= 5) return 'Explorer';
  return 'Novice';
}
