const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { getAchievements, getToday } = require('../controllers/progressController');

router.get('/achievements', auth, getAchievements);
router.get('/today', auth, getToday);

module.exports = router;

