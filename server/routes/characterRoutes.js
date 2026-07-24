const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const {
  getCharacterProfile,
  selectCharacter,
} = require('../controllers/characterController');

router.get('/', auth, getCharacterProfile);
router.post('/select', auth, selectCharacter);

module.exports = router;

