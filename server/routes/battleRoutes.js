const express = require('express');
const router = express.Router();
const battleController = require('../controllers/battleController');
const authenticate = require('../middleware/authMiddleware');

/**
 * Battle Routes
 * All routes require authentication
 */

// Start a new battle
router.post('/start', authenticate, battleController.startBattle);

// Get current battle state
router.get('/:battleId', authenticate, battleController.getBattle);

// Hero attacks monster
router.post('/:battleId/hero-attack', authenticate, battleController.heroAttack);

// Monster attacks hero
router.post('/:battleId/monster-attack', authenticate, battleController.monsterAttack);

// Complete battle (award rewards)
router.post('/:battleId/complete', authenticate, battleController.completeBattle);

// Get battle history
router.get(
  '/',
  authenticate,
  (req, res) => {
    // Route to history endpoint if query param present
    if (req.query.history === 'true' || req.path === '/history') {
      return battleController.getBattleHistory(req, res);
    }
    // Otherwise get single battle
    battleController.getBattle(req, res);
  }
);

router.get('/history', authenticate, battleController.getBattleHistory);

// Get battle statistics
router.get('/stats', authenticate, battleController.getBattleStats);

// Forfeit battle
router.post('/:battleId/forfeit', authenticate, battleController.forfeitBattle);

module.exports = router;
