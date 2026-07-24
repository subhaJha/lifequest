const mongoose = require('mongoose');

const AchievementSchema = new mongoose.Schema(
  {
    // Basic identifier
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, default: '' },

    // Optional metadata
    category: { type: String, default: '' },
    icon: { type: String, default: '' },

    // Whether an achievement is one-time
    isRepeatable: { type: Boolean, default: false },

    // XP/Gold rewards (optional)
    xpReward: { type: Number, default: 0 },
    goldReward: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Achievement', AchievementSchema);

