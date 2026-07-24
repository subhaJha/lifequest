// DISTRICT POINT AWARDING UTILITIES
// Phase 3: Kingdom & District System

const DistrictProgress = require('../models/DistrictProgress');
const { categoryToDistrict } = require('../utils/taskCategoryToDistrict');

// Default conversion: points gained by district = task.xpReward
// (If later you want separate tuning, change this multiplier only.)
const DEFAULT_DISTRICT_POINT_MULTIPLIER = 1;

/**
 * Award district points for a completed task.
 *
 * @param {Object} params
 * @param {String|mongoose.Types.ObjectId} params.userId
 * @param {String} params.taskCategory - task.category
 * @param {Number} params.xpReward - task.xpReward
 * @param {Number} [params.multiplier=1]
 */
async function awardDistrictPoints({ userId, taskCategory, xpReward, multiplier = DEFAULT_DISTRICT_POINT_MULTIPLIER }) {
  const districtKey = categoryToDistrict(taskCategory);

  const safeXp = typeof xpReward === 'number' && Number.isFinite(xpReward) ? xpReward : 0;
  const safeMultiplier = typeof multiplier === 'number' && Number.isFinite(multiplier) ? multiplier : 1;

  const pointsToAdd = Math.max(0, safeXp * safeMultiplier);

  // Upsert + increment district field.
  // (Upsert ensures legacy users always have a DistrictProgress doc.)
  const update = {
    $inc: {
      [districtKey]: pointsToAdd,
    },
  };

  // Ensure doc exists even if pointsToAdd is 0.
  const setOnInsert = {
    userId,
    health: 0,
    learning: 0,
    career: 0,
    finance: 0,
    social: 0,
    mindfulness: 0,
  };

  await DistrictProgress.findOneAndUpdate(
    { userId },
    {
      ...update,
      $setOnInsert: setOnInsert,
    },
    { upsert: true, new: true }
  );

  return {
    district: districtKey,
    pointsAdded: pointsToAdd,
  };
}

module.exports = {
  awardDistrictPoints,
  DEFAULT_DISTRICT_POINT_MULTIPLIER,
};

