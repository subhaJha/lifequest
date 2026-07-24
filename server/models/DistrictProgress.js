const mongoose = require('mongoose');

const districtProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },

    // District point totals
    health: {
      type: Number,
      default: 0,
    },
    learning: {
      type: Number,
      default: 0,
    },
    career: {
      type: Number,
      default: 0,
    },
    finance: {
      type: Number,
      default: 0,
    },
    social: {
      type: Number,
      default: 0,
    },
    mindfulness: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('DistrictProgress', districtProgressSchema);

