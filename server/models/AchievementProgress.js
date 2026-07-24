const mongoose = require('mongoose');

const achievementProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // Stable achievement key, e.g. FIRST_QUEST_COMPLETED
    achievementId: {
      type: String,
      required: true,
      index: true,
    },

    unlockedAt: {
      type: Date,
      default: null,
    },

    // optional counters for progressive achievements
    progress: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

achievementProgressSchema.index({ userId: 1, achievementId: 1 }, { unique: true });

module.exports = mongoose.model(
  'AchievementProgress',
  achievementProgressSchema
);

