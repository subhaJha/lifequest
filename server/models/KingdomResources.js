const mongoose = require('mongoose');

const kingdomResourcesSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    gold: {
      type: Number,
      default: 500,
      min: 0,
    },
    wood: {
      type: Number,
      default: 300,
      min: 0,
    },
    stone: {
      type: Number,
      default: 300,
      min: 0,
    },
    goldCapacity: {
      type: Number,
      default: 5000,
    },
    woodCapacity: {
      type: Number,
      default: 3000,
    },
    stoneCapacity: {
      type: Number,
      default: 3000,
    },
    lastHarvestedAt: {
      type: Date,
      default: Date.now,
    },
    harvestRate: {
      goldPerMinute: {
        type: Number,
        default: 10,
      },
      woodPerMinute: {
        type: Number,
        default: 5,
      },
      stonePerMinute: {
        type: Number,
        default: 5,
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('KingdomResources', kingdomResourcesSchema);
