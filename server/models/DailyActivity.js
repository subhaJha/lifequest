const mongoose = require('mongoose');

const dailyActivitySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // UTC day key: YYYY-MM-DD
    dayKey: {
      type: String,
      required: true,
      index: true,
    },

    streak: {
      // streak count as of this day
      type: Number,
      default: 0,
    },

    dailyTasksCompleted: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

dailyActivitySchema.index({ userId: 1, dayKey: 1 }, { unique: true });

module.exports = mongoose.model('DailyActivity', dailyActivitySchema);

