// XP UTILITIES

// How much XP per level
const XP_PER_LEVEL = 100;

// Calculate current level and xp progress
const getLevelInfo = (totalXP) => {
  const level = Math.floor(totalXP / XP_PER_LEVEL) + 1;
  const xpInCurrentLevel = totalXP % XP_PER_LEVEL;
  const xpForNextLevel = XP_PER_LEVEL;

  return {
    level,
    currentXP: xpInCurrentLevel,
    nextLevelXP: xpForNextLevel,
    totalXP,
    progressPercent: (xpInCurrentLevel / xpForNextLevel) * 100,
  };
};

// Add XP to user and check for level up
const addXP = async (user, xpAmount) => {
  const oldLevel = user.level;
  user.xp += xpAmount;

  // Recalculate level
  const levelInfo = getLevelInfo(user.xp);
  user.level = levelInfo.level;

  // Check if level up
  const leveledUp = user.level > oldLevel;

  return {
    xpGained: xpAmount,
    leveledUp,
    oldLevel,
    newLevel: user.level,
    levelInfo,
  };
};

module.exports = {
  XP_PER_LEVEL,
  getLevelInfo,
  addXP,
};
