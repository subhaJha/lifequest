const mongoose = require('mongoose');

const characterProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },

    currentCharacterId: {
      type: String,
      default: 'NOVICE',
      index: true,
    },

    unlockedCharacterIds: {
      type: [String],
      default: ['NOVICE'],
    },

    // Future cosmetic customization stored as config object.
    // Example shape: { avatarId: 'AVATAR_1', skin: '...' }
    avatarConfig: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('CharacterProfile', characterProfileSchema);

