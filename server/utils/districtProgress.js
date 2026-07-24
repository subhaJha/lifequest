// DISTRICT PROGRESSION UTILITIES

// How many district points are needed per level.
// Centralize progression math here.
const DISTRICT_XP_PER_LEVEL = 100;

// Map district points -> level/progress info.
const getDistrictLevel = (points = 0) => {
  const safePoints = typeof points === 'number' && points >= 0 ? points : 0;
  const level = Math.floor(safePoints / DISTRICT_XP_PER_LEVEL) + 1;
  const currentXP = safePoints % DISTRICT_XP_PER_LEVEL;
  const nextLevelXP = DISTRICT_XP_PER_LEVEL;

  return {
    level,
    currentXP,
    nextLevelXP,
    totalPoints: safePoints,
    progressPercent: (currentXP / nextLevelXP) * 100,
  };
};

// Given a points map like { health: 120, learning: 0, ... }, return levels/progress.
const getDistrictProgress = (pointsMap = {}) => {
  const get = (k) => {
    const v = pointsMap?.[k];
    return typeof v === 'number' && v >= 0 ? v : 0;
  };

  return {
    health: getDistrictLevel(get('health')),
    learning: getDistrictLevel(get('learning')),
    career: getDistrictLevel(get('career')),
    finance: getDistrictLevel(get('finance')),
    social: getDistrictLevel(get('social')),
    mindfulness: getDistrictLevel(get('mindfulness')),
  };
};

module.exports = {
  DISTRICT_XP_PER_LEVEL,
  getDistrictLevel,
  getDistrictProgress,
};

