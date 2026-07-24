const AchievementProgress = require('../models/AchievementProgress');
const DailyActivity = require('../models/DailyActivity');

function toUtcDayKey(date = new Date()) {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

const getAchievements = async (req, res) => {
  const userId = req.user.id;
  const rows = await AchievementProgress.find({ userId }).sort({ unlockedAt: -1 });

  res.json({
    items: rows.map((r) => ({
      achievementId: r.achievementId,
      unlockedAt: r.unlockedAt,
      progress: r.progress,
    })),
  });
};

const getToday = async (req, res) => {
  const userId = req.user.id;
  const dayKey = toUtcDayKey(new Date());
  const today = await DailyActivity.findOne({ userId, dayKey });

  res.json({
    dayKey,
    streak: today?.streak ?? 0,
    dailyTasksCompleted: today?.dailyTasksCompleted ?? 0,
  });
};

module.exports = {
  getAchievements,
  getToday,
};

