const AchievementProgress = require('../models/AchievementProgress');
// Phase 1 achievement keys

const ACHIEVEMENTS = {
  FIRST_QUEST_COMPLETED: {
    id: 'FIRST_QUEST_COMPLETED',
  },
  XP_50_EARNED: {
    id: 'XP_50_EARNED',
    thresholdXP: 50,
  },
  LEVEL_UP: {
    id: 'LEVEL_UP',
  },
};

async function getAchievementProgress(userId, achievementId) {
  return AchievementProgress.findOne({ userId, achievementId });
}

async function unlockAchievement(userId, achievementId) {
  const existing = await getAchievementProgress(userId, achievementId);
  if (existing?.unlockedAt) return { unlocked: false, record: existing };

  const updated = await AchievementProgress.findOneAndUpdate(
    { userId, achievementId },
    { $setOnInsert: { userId, achievementId, unlockedAt: new Date() } },
    { new: true, upsert: true }
  );

  return { unlocked: true, record: updated };
}

// Evaluates and unlocks achievements after a task completion.
// Inputs are derived from the current state of the user after XP/streak updates.
async function evaluateAndUnlockAchievements({
  userId,
  taskWasFirstCompletion,
  previousLevel,
  currentLevel,
  currentXP,
}) {
  const unlocked = [];

  if (taskWasFirstCompletion) {
    const r1 = await unlockAchievement(userId, ACHIEVEMENTS.FIRST_QUEST_COMPLETED.id);
    if (r1.unlocked) unlocked.push(ACHIEVEMENTS.FIRST_QUEST_COMPLETED.id);
  }

  if (currentXP >= (ACHIEVEMENTS.XP_50_EARNED.thresholdXP ?? Infinity)) {
    const r2 = await unlockAchievement(userId, ACHIEVEMENTS.XP_50_EARNED.id);
    if (r2.unlocked) unlocked.push(ACHIEVEMENTS.XP_50_EARNED.id);
  }

  // Level up achievement: unlock only when user level increases at the time of this call.
  if (currentLevel > previousLevel) {
    const r3 = await unlockAchievement(userId, ACHIEVEMENTS.LEVEL_UP.id);
    if (r3.unlocked) unlocked.push(ACHIEVEMENTS.LEVEL_UP.id);
  }

  return { unlocked };
}

module.exports = {
  ACHIEVEMENTS,
  evaluateAndUnlockAchievements,
};

