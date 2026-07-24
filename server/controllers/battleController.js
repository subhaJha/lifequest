const battleService = require('../services/battleService');
const Battle = require('../models/Battle');

/**
 * Start a new battle
 * POST /api/battles/start
 * Body: { taskId, taskDifficulty }
 */
const startBattle = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const { taskId, taskDifficulty } = req.body;

    if (!taskId || !taskDifficulty) {
      return res
        .status(400)
        .json({ success: false, error: 'Missing taskId or taskDifficulty' });
    }

    const result = await battleService.initializeBattle(
      req.user._id,
      taskId,
      taskDifficulty
    );

    res.json({
      success: true,
      battle: result.battle,
      monster: result.monster,
      character: {
        name: result.character.characterName,
        level: result.character.level,
      },
    });
  } catch (error) {
    console.error('Error starting battle:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get current battle
 * GET /api/battles/:battleId
 */
const getBattle = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const battle = await battleService.getBattle(req.params.battleId);

    if (!battle) {
      return res.status(404).json({ success: false, error: 'Battle not found' });
    }

    // Verify user ownership
    if (battle.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }

    res.json({ success: true, battle });
  } catch (error) {
    console.error('Error getting battle:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Hero attacks monster
 * POST /api/battles/:battleId/hero-attack
 */
const heroAttack = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const battle = await battleService.getBattle(req.params.battleId);

    if (!battle) {
      return res.status(404).json({ success: false, error: 'Battle not found' });
    }

    // Verify user ownership
    if (battle.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }

    const result = await battleService.heroAttack(req.params.battleId);

    res.json({
      success: true,
      damage: result.damage,
      isCritical: result.isCritical,
      monsterDefeated: result.monsterDefeated,
      battle: result.battle,
    });
  } catch (error) {
    console.error('Error in hero attack:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Monster attacks hero
 * POST /api/battles/:battleId/monster-attack
 */
const monsterAttack = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const battle = await battleService.getBattle(req.params.battleId);

    if (!battle) {
      return res.status(404).json({ success: false, error: 'Battle not found' });
    }

    // Verify user ownership
    if (battle.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }

    const result = await battleService.monsterAttack(req.params.battleId);

    res.json({
      success: true,
      damage: result.damage,
      isCritical: result.isCritical,
      heroDefeated: result.heroDefeated,
      battle: result.battle,
    });
  } catch (error) {
    console.error('Error in monster attack:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Complete battle (award rewards after victory)
 * POST /api/battles/:battleId/complete
 * Body: { taskId }
 */
const completeBattle = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const battle = await battleService.getBattle(req.params.battleId);

    if (!battle) {
      return res.status(404).json({ success: false, error: 'Battle not found' });
    }

    // Verify user ownership
    if (battle.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }

    const { taskId } = req.body;
    const result = await battleService.completeBattle(
      req.params.battleId,
      taskId
    );

    res.json({
      success: true,
      rewards: result.rewards,
      battle: result.battle,
    });
  } catch (error) {
    console.error('Error completing battle:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get battle history
 * GET /api/battles/history?limit=10
 */
const getBattleHistory = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const limit = parseInt(req.query.limit) || 10;
    const battles = await battleService.getBattleHistory(req.user._id, limit);

    res.json({ success: true, battles });
  } catch (error) {
    console.error('Error getting battle history:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get battle statistics
 * GET /api/battles/stats
 */
const getBattleStats = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const stats = await battleService.getBattleStats(req.user._id);

    res.json({ success: true, stats });
  } catch (error) {
    console.error('Error getting battle stats:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Forfeit battle
 * POST /api/battles/:battleId/forfeit
 */
const forfeitBattle = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const battle = await battleService.getBattle(req.params.battleId);

    if (!battle) {
      return res.status(404).json({ success: false, error: 'Battle not found' });
    }

    // Verify user ownership
    if (battle.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }

    const updatedBattle = await battleService.forfeitBattle(req.params.battleId);

    res.json({ success: true, battle: updatedBattle });
  } catch (error) {
    console.error('Error forfeiting battle:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  startBattle,
  getBattle,
  heroAttack,
  monsterAttack,
  completeBattle,
  getBattleHistory,
  getBattleStats,
  forfeitBattle,
};
