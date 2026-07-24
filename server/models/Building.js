const mongoose = require('mongoose');

const buildingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    buildingType: {
      type: String,
      enum: ['castle', 'mine', 'forest', 'village', 'academy'],
      required: true,
    },
    level: {
      type: Number,
      default: 1,
      min: 1,
      max: 10,
    },
    health: {
      type: Number,
      default: 100,
    },
    maxHealth: {
      type: Number,
      default: 100,
    },
    position: {
      x: {
        type: Number,
        required: true,
      },
      y: {
        type: Number,
        required: true,
      },
    },
    isUnlocked: {
      type: Boolean,
      default: false,
    },
    unlockedAt: {
      type: Date,
    },
    lastProducedAt: {
      type: Date,
      default: Date.now,
    },
    upgradingUntil: {
      type: Date,
    },
    resources: {
      goldProduction: {
        type: Number,
        default: 0,
      },
      woodProduction: {
        type: Number,
        default: 0,
      },
      stoneProduction: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
buildingSchema.index({ userId: 1, buildingType: 1 });
buildingSchema.index({ userId: 1, 'position.x': 1, 'position.y': 1 });

module.exports = mongoose.model('Building', buildingSchema);
