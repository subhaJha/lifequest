const mongoose = require('mongoose');

const buildingUpgradeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    buildingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Building',
      required: true,
    },
    buildingType: {
      type: String,
      enum: ['castle', 'mine', 'forest', 'village', 'academy'],
      required: true,
    },
    fromLevel: {
      type: Number,
      required: true,
      min: 1,
    },
    toLevel: {
      type: Number,
      required: true,
      min: 2,
      max: 10,
    },
    costGold: {
      type: Number,
      required: true,
      default: 0,
    },
    costWood: {
      type: Number,
      required: true,
      default: 0,
    },
    costStone: {
      type: Number,
      required: true,
      default: 0,
    },
    upgradeDurationSeconds: {
      type: Number,
      required: true,
      default: 60,
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['in-progress', 'completed', 'cancelled'],
      default: 'in-progress',
    },
  },
  {
    timestamps: true,
  }
);

buildingUpgradeSchema.index({ userId: 1, status: 1 });
buildingUpgradeSchema.index({ buildingId: 1, status: 1 });

module.exports = mongoose.model('BuildingUpgrade', buildingUpgradeSchema);
