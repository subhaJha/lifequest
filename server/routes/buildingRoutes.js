const express = require('express');
const authenticate = require('../middleware/authMiddleware.js');
const buildingController = require('../controllers/buildingController.js');

const router = express.Router();

// Require authentication for all routes
router.use(authenticate);

/**
 * Kingdom Building Routes
 */

// Initialize kingdom
router.post('/initialize', buildingController.initializeKingdom);

// Get all buildings
router.get('/buildings', buildingController.getBuildings);

// Get specific building
router.get('/buildings/:id', buildingController.getBuilding);

// Unlock building
router.post('/buildings/unlock', buildingController.unlockBuilding);

// Start building upgrade
router.post('/buildings/:id/upgrade', buildingController.startUpgrade);

// Complete building upgrade
router.post('/buildings/upgrade/:upgradeId/complete', buildingController.completeUpgrade);

// Harvest resources
router.post('/harvest', buildingController.harvestResources);

// Get resources
router.get('/resources', buildingController.getResources);

// Get kingdom stats
router.get('/stats', buildingController.getKingdomStats);

// Award resources for task
router.post('/award-resources', buildingController.awardResourcesForTask);

module.exports = router;
