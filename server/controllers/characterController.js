const CharacterProfile = require('../models/CharacterProfile');

const ensureProfile = async (userId) => {
  const profile = await CharacterProfile.findOneAndUpdate(
    { userId },
    {
      $setOnInsert: {
        userId,
        currentCharacterId: 'NOVICE',
        unlockedCharacterIds: ['NOVICE'],
        avatarConfig: {},
      },
    },
    { upsert: true, new: true }
  );
  return profile;
};

const getCharacterProfile = async (req, res) => {
  const userId = req.user.id;
  const profile = await ensureProfile(userId);
  res.json({
    currentCharacterId: profile.currentCharacterId,
    unlockedCharacterIds: profile.unlockedCharacterIds,
    avatarConfig: profile.avatarConfig,
  });
};

// For Phase 2: only support selecting currentCharacterId and optionally avatarConfig.
const selectCharacter = async (req, res) => {
  const userId = req.user.id;
  const { currentCharacterId, avatarConfig } = req.body || {};

  if (!currentCharacterId || typeof currentCharacterId !== 'string') {
    return res.status(400).json({ msg: 'currentCharacterId is required' });
  }

  const profile = await ensureProfile(userId);

  const nextUnlocked = Array.isArray(profile.unlockedCharacterIds)
    ? new Set(profile.unlockedCharacterIds)
    : new Set();
  nextUnlocked.add(currentCharacterId);

  profile.currentCharacterId = currentCharacterId;
  profile.unlockedCharacterIds = Array.from(nextUnlocked);

  if (avatarConfig && typeof avatarConfig === 'object') {
    profile.avatarConfig = avatarConfig;
  }

  await profile.save();

  res.json({
    currentCharacterId: profile.currentCharacterId,
    unlockedCharacterIds: profile.unlockedCharacterIds,
    avatarConfig: profile.avatarConfig,
  });
};

module.exports = {
  getCharacterProfile,
  selectCharacter,
};

