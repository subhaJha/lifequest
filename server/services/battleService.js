const Battle = require('../models/Battle');
const Monster = require('../models/Monster');
const User = require('../models/User');
const CharacterProfile = require('../models/CharacterProfile');
const UserProgress = require('../models/UserProgress');
const Task = require('../models/Task');
const Achievement = require('../models/Achievement');

const { MONSTER_TEMPLATES } = require('../models/Monster');

/**
 * Select a monster based on task difficulty
 * Difficulty mapping: easy -> goblin, medium -> skeleton/orc, hard -> orc, extreme -> dragon
 */
const selectMonsterByDifficulty = (taskDifficulty) => {
  const difficultyMap = {
    easy: 'goblin',
    medium: ['skeleton', 'orc'],
    hard: ['orc', 'dragon'],
    extreme: 'dragon',
  };

  let monsterTypes = difficultyMap[taskDifficulty];
  if (Array.isArray(monsterTypes)) {
    monsterTypes = monsterTypes[Math.floor(Math.random() * monsterTypes.length)];
  }

  return monsterTypes;
};

/**
 * Get monster template by type and difficulty
 */
const getMonsterTemplate = (monsterType, taskDifficulty) => {
  const templates = MONSTER_TEMPLATES[monsterType];
  if (!templates) {
    throw new Error(`Invalid monster type: ${monsterType}`);
  }

  // Map task difficulty to monster difficulty
  const difficultyMap = {
    easy: 'easy',
    medium: 'medium',
    hard: 'hard',
    extreme: 'extreme',
  };

  const monsterDifficulty = difficultyMap[taskDifficulty];
  const template = templates[monsterDifficulty];

  if (!template) {
    // Fallback to highest available difficulty
    const availableDifficulties = Object.keys(templates).sort();
    return templates[availableDifficulties[availableDifficulties.length - 1]];
  }

  return template;
};

/**
 * Initialize a new battle
 */
const initializeBattle = async (userId, taskId, taskDifficulty) => {
  try {
    // Get character stats
    const character = await CharacterProfile.findOne({ userId });
    if (!character) {
      throw new Error('Character not found');
    }

    // Get user progress for level-based stats
    const userProgress = await UserProgress.findOne({ userId });

    // Select and create monster
    const monsterType = selectMonsterByDifficulty(taskDifficulty);
    const monsterTemplate = getMonsterTemplate(monsterType, taskDifficulty);

    // Scale monster stats based on player level
    const levelMultiplier = 1 + userProgress.level * 0.1;
    const scaledMonsterHealth = Math.floor(monsterTemplate.baseHealth * levelMultiplier);
    const scaledMonsterDamage = Math.floor(monsterTemplate.baseDamage * levelMultiplier);

    // Calculate hero stats
    const heroMaxHealth = character.stats.health || 100;
    const heroDamage = character.stats.attack || 10;
    const heroArmor = character.stats.defense || 5;
    const heroCritChance = character.stats.criticalChance || 10;

    // Create battle record
    const battle = await Battle.create({
      userId,
      taskId,
      monsterType: monsterTemplate.type,
      monsterDifficulty: monsterTemplate.difficulty,
      status: 'in-progress',
      heroStats: {
        maxHealth: heroMaxHealth,
        currentHealth: heroMaxHealth,
        damage: heroDamage,
        armor: heroArmor,
        critChance: heroCritChance,
      },
      monsterStats: {
        maxHealth: scaledMonsterHealth,
        currentHealth: scaledMonsterHealth,
        damage: scaledMonsterDamage,
        armor: monsterTemplate.baseArmor,
      },
      startTime: new Date(),
      turnCount: 0,
      heroTurns: 0,
      monsterTurns: 0,
      battleLog: [
        {
          action: `Battle started! ${character.characterName} faces a ${monsterTemplate.difficulty} ${monsterTemplate.type}!`,
          actorType: 'system',
        },
      ],
    });

    return {
      battle: battle,
      monster: monsterTemplate,
      character: character,
    };
  } catch (error) {
    console.error('Error initializing battle:', error);
    throw error;
  }
};

/**
 * Calculate damage with armor and critical hits
 */
const calculateDamage = (attacker, defender, isCritical = false) => {
  let baseDamage = attacker.damage;

  // Apply critical hit multiplier
  if (isCritical) {
    baseDamage *= 1.5;
  }

  // Apply armor reduction
  const armorReduction = Math.max(0, defender.armor * 0.1); // 10% armor per armor point
  const finalDamage = Math.max(1, Math.floor(baseDamage * (1 - armorReduction)));

  return {
    damage: finalDamage,
    isCritical: isCritical,
  };
};

/**
 * Check if attack is critical hit
 */
const rollCriticalHit = (critChance) => {
  return Math.random() * 100 < critChance;
};

/**
 * Hero attacks monster
 */
const heroAttack = async (battleId) => {
  try {
    const battle = await Battle.findById(battleId);
    if (!battle) {
      throw new Error('Battle not found');
    }

    if (battle.status !== 'in-progress') {
      throw new Error('Battle is not active');
    }

    // Calculate damage
    const isCrit = rollCriticalHit(battle.heroStats.critChance);
    const { damage, isCritical } = calculateDamage(
      battle.heroStats,
      battle.monsterStats,
      isCrit
    );

    // Apply damage
    battle.monsterStats.currentHealth -= damage;

    // Log action
    const action = isCritical
      ? `Hero lands a CRITICAL HIT for ${damage} damage!`
      : `Hero attacks for ${damage} damage`;

    battle.battleLog.push({
      action,
      damage,
      isCritical,
      actorType: 'hero',
    });

    battle.turnCount += 1;
    battle.heroTurns += 1;

    // Check if monster is defeated
    if (battle.monsterStats.currentHealth <= 0) {
      battle.status = 'victory';
      battle.endTime = new Date();
      battle.durationSeconds = Math.floor(
        (battle.endTime - battle.startTime) / 1000
      );
      battle.battleLog.push({
        action: 'Monster defeated! Battle won!',
        actorType: 'system',
      });
    }

    await battle.save();

    return {
      battle,
      damage,
      isCritical,
      monsterDefeated: battle.status === 'victory',
    };
  } catch (error) {
    console.error('Error in hero attack:', error);
    throw error;
  }
};

/**
 * Monster attacks hero
 */
const monsterAttack = async (battleId) => {
  try {
    const battle = await Battle.findById(battleId);
    if (!battle) {
      throw new Error('Battle not found');
    }

    if (battle.status !== 'in-progress') {
      throw new Error('Battle is not active');
    }

    // Calculate damage
    const isCrit = rollCriticalHit(10); // Monsters have 10% crit
    const { damage, isCritical } = calculateDamage(
      battle.monsterStats,
      battle.heroStats,
      isCrit
    );

    // Apply damage
    battle.heroStats.currentHealth -= damage;

    // Log action
    const action = isCritical
      ? `Monster lands a CRITICAL HIT for ${damage} damage!`
      : `Monster attacks for ${damage} damage`;

    battle.battleLog.push({
      action,
      damage,
      isCritical,
      actorType: 'monster',
    });

    battle.turnCount += 1;
    battle.monsterTurns += 1;

    // Check if hero is defeated
    if (battle.heroStats.currentHealth <= 0) {
      battle.status = 'defeat';
      battle.endTime = new Date();
      battle.durationSeconds = Math.floor(
        (battle.endTime - battle.startTime) / 1000
      );
      battle.battleLog.push({
        action: 'Hero defeated! Battle lost!',
        actorType: 'system',
      });
    }

    await battle.save();

    return {
      battle,
      damage,
      isCritical,
      heroDefeated: battle.status === 'defeat',
    };
  } catch (error) {
    console.error('Error in monster attack:', error);
    throw error;
  }
};

/**
 * Complete battle and award rewards
 */
const completeBattle = async (battleId, taskId) => {
  try {
    const battle = await Battle.findById(battleId);
    if (!battle || battle.status === 'in-progress') {
      throw new Error('Invalid battle state');
    }

    if (battle.status !== 'victory') {
      throw new Error('Can only complete victorious battles');
    }

    // Get monster template for reward calculation
    const monsterTemplate = getMonsterTemplate(
      battle.monsterType,
      battle.monsterDifficulty
    );

    // Calculate rewards
    let xpGained = monsterTemplate.xpReward;
    let goldGained = monsterTemplate.goldReward;

    // Bonus for quick battles
    if (battle.durationSeconds < 30) {
      xpGained = Math.floor(xpGained * 1.25);
      goldGained = Math.floor(goldGained * 1.25);
    }

    // Bonus for no damage taken
    if (battle.heroStats.currentHealth === battle.heroStats.maxHealth) {
      xpGained = Math.floor(xpGained * 1.5);
      goldGained = Math.floor(goldGained * 1.5);
    }

    // Update user progress
    const userProgress = await UserProgress.findOne({ userId: battle.userId });
    userProgress.totalXP += xpGained;
    userProgress.gold += goldGained;

    // Check for level up
    const oldLevel = userProgress.level;
    const xpForNextLevel = 1000 + oldLevel * 500; // Exponential XP requirements
    if (userProgress.totalXP >= xpForNextLevel) {
      userProgress.level += 1;
      userProgress.totalXP -= xpForNextLevel;
    }

    await userProgress.save();

    // Update user gold in User model if it exists there
    const user = await User.findById(battle.userId);
    if (user) {
      user.gold = (user.gold || 0) + goldGained;
      await user.save();
    }

    // Check for achievement unlocks
    const achievements = [];
    // Add achievement logic here if needed

    // Store rewards in battle
    battle.rewards = {
      xpGained,
      goldGained,
      achievementsUnlocked: achievements,
    };

    await battle.save();

    return {
      battle,
      rewards: {
        xpGained,
        goldGained,
        levelUp: userProgress.level > oldLevel,
        newLevel: userProgress.level,
      },
    };
  } catch (error) {
    console.error('Error completing battle:', error);
    throw error;
  }
};

/**
 * Get battle by ID
 */
const getBattle = async (battleId) => {
  try {
    const battle = await Battle.findById(battleId);
    return battle;
  } catch (error) {
    console.error('Error getting battle:', error);
    throw error;
  }
};

/**
 * Get battle history for user
 */
const getBattleHistory = async (userId, limit = 10) => {
  try {
    const battles = await Battle.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit);
    return battles;
  } catch (error) {
    console.error('Error getting battle history:', error);
    throw error;
  }
};

/**
 * Get battle statistics for user
 */
const getBattleStats = async (userId) => {
  try {
    const battles = await Battle.find({ userId });

    const stats = {
      totalBattles: battles.length,
      victories: battles.filter((b) => b.status === 'victory').length,
      defeats: battles.filter((b) => b.status === 'defeat').length,
      winRate:
        battles.length > 0
          ? Math.round(
              (battles.filter((b) => b.status === 'victory').length /
                battles.length) *
                100
            )
          : 0,
      totalXpEarned: battles.reduce((sum, b) => sum + (b.rewards?.xpGained || 0), 0),
      totalGoldEarned: battles.reduce((sum, b) => sum + (b.rewards?.goldGained || 0), 0),
      averageBattleDuration:
        battles.length > 0
          ? Math.round(
              battles.reduce((sum, b) => sum + (b.durationSeconds || 0), 0) /
                battles.length
            )
          : 0,
    };

    return stats;
  } catch (error) {
    console.error('Error getting battle stats:', error);
    throw error;
  }
};

/**
 * Forfeit a battle
 */
const forfeitBattle = async (battleId) => {
  try {
    const battle = await Battle.findById(battleId);
    if (!battle) {
      throw new Error('Battle not found');
    }

    battle.status = 'defeat';
    battle.endTime = new Date();
    battle.durationSeconds = Math.floor(
      (battle.endTime - battle.startTime) / 1000
    );
    battle.battleLog.push({
      action: 'Hero forfeited the battle',
      actorType: 'system',
    });

    await battle.save();

    return battle;
  } catch (error) {
    console.error('Error forfeiting battle:', error);
    throw error;
  }
};

module.exports = {
  selectMonsterByDifficulty,
  getMonsterTemplate,
  initializeBattle,
  calculateDamage,
  rollCriticalHit,
  heroAttack,
  monsterAttack,
  completeBattle,
  getBattle,
  getBattleHistory,
  getBattleStats,
  forfeitBattle,
};
