const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { getDistrictOverview } = require('../controllers/districtController');

router.get('/overview', auth, getDistrictOverview);

module.exports = router;

