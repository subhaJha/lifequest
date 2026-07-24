const { getDistrictProgress } = require('../utils/districtProgress');
const DistrictProgress = require('../models/DistrictProgress');

async function ensureDistrictProgress(userId) {
  // Create record on-demand for legacy users
  const doc = await DistrictProgress.findOneAndUpdate(
    { userId },
    {
      $setOnInsert: {
        userId,
        health: 0,
        learning: 0,
        career: 0,
        finance: 0,
        social: 0,
        mindfulness: 0,
      },
    },
    { upsert: true, new: true }
  );

  return doc;
}

// GET current district overview
async function getDistrictOverview(req, res) {
  const userId = req.user.id;

  const dp = await ensureDistrictProgress(userId);
  const pointsMap = {
    health: dp.health ?? 0,
    learning: dp.learning ?? 0,
    career: dp.career ?? 0,
    finance: dp.finance ?? 0,
    social: dp.social ?? 0,
    mindfulness: dp.mindfulness ?? 0,
  };

  const progress = getDistrictProgress(pointsMap);
  res.json({ districtPoints: pointsMap, districtProgress: progress });
}

module.exports = {
  getDistrictOverview,
};

