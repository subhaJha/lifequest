const DailyActivity = require('../models/DailyActivity');

function toUtcDayKey(date = new Date()) {
  // YYYY-MM-DD in UTC
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function addDaysUtc(date, days) {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

async function upsertDailyActivityAndStreak({ userId, didCompleteTask = true }) {
  const now = new Date();
  const todayKey = toUtcDayKey(now);
  const yesterdayKey = toUtcDayKey(addDaysUtc(now, -1));

  const inc = didCompleteTask ? 1 : 0;

  // Load yesterday (if it exists) to compute streak for a new day.
  const yesterday = await DailyActivity.findOne({ userId, dayKey: yesterdayKey });

  const today = await DailyActivity.findOne({ userId, dayKey: todayKey });

  if (!today) {
    const newStreak = yesterday ? yesterday.streak + 1 : 1;
    const created = await DailyActivity.create({
      userId,
      dayKey: todayKey,
      streak: newStreak,
      dailyTasksCompleted: inc,
    });
    return { today: created, newStreak, isNewDay: true };
  }

  if (inc > 0) {
    today.dailyTasksCompleted += inc;
    await today.save();
  }

  return { today, newStreak: today.streak, isNewDay: false };
}


module.exports = {
  toUtcDayKey,
  upsertDailyActivityAndStreak,
};

