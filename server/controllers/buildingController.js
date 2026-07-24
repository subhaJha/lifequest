const buildingService = require('../services/buildingService.js');

/**
 * Initialize kingdom
 * POST /api/buildings/initialize
 */
const initializeKingdom = async (req, res) => {
  try {
    const userId = req.user.id;
    const building = await buildingService.initializeKingdom(userId);
    res.json({
      success: true,
      message: 'Kingdom initialized',
      building,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get all buildings
 * GET /api/buildings/buildings
 */
const getBuildings = async (req, res) => {
  try {
    const userId = req.user.id;
    const buildings = await buildingService.getUserBuildings(userId);
    res.json({
      success: true,
      buildings,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get building by ID
 * GET /api/buildings/buildings/:id
 */
const getBuilding = async (req, res) => {
  try {
    const { id } = req.params;
    const building = await buildingService.getBuildingById(id);

    // Verify ownership
    if (building.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    res.json({
      success: true,
      building,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Unlock a building
 * POST /api/buildings/buildings/unlock
 */
const unlockBuilding = async (req, res) => {
  try {
    const userId = req.user.id;
    const { buildingType, position } = req.body;

    if (!buildingType || !position) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: buildingType, position',
      });
    }

    const building = await buildingService.unlockBuilding(
      userId,
      buildingType,
      position
    );

    res.json({
      success: true,
      message: `${buildingType} unlocked`,
      building,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Start building upgrade
 * POST /api/buildings/buildings/:id/upgrade
 */
const startUpgrade = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const result = await buildingService.startUpgrade(userId, id);

    res.json({
      success: true,
      message: 'Upgrade started',
      ...result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Complete building upgrade (can be called periodically)
 * POST /api/buildings/buildings/upgrade/:upgradeId/complete
 */
const completeUpgrade = async (req, res) => {
  try {
    const { upgradeId } = req.params;
    const result = await buildingService.completeUpgrade(upgradeId);

    res.json({
      success: true,
      message: 'Upgrade completed',
      ...result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Harvest resources
 * POST /api/buildings/harvest
 */
const harvestResources = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await buildingService.harvestResources(userId);

    res.json({
      success: true,
      message: 'Resources harvested',
      ...result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get kingdom resources
 * GET /api/buildings/resources
 */
const getResources = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await buildingService.harvestResources(userId);

    res.json({
      success: true,
      resources: result.resources,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get kingdom statistics
 * GET /api/buildings/stats
 */
const getKingdomStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const stats = await buildingService.getKingdomStats(userId);

    res.json({
      success: true,
      stats,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Award resources for task completion
 * POST /api/buildings/award-resources
 */
const awardResourcesForTask = async (req, res) => {
  try {
    const userId = req.user.id;
    const { taskDifficulty } = req.body;

    if (!taskDifficulty) {
      return res.status(400).json({
        success: false,
        message: 'Missing required field: taskDifficulty',
      });
    }

    const result = await buildingService.awardResourcesForTask(
      userId,
      taskDifficulty
    );

    res.json({
      success: true,
      message: 'Resources awarded',
      ...result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  initializeKingdom,
  getBuildings,
  getBuilding,
  unlockBuilding,
  startUpgrade,
  completeUpgrade,
  harvestResources,
  getResources,
  getKingdomStats,
  awardResourcesForTask,
};
