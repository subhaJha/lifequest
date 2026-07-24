const Building = require('../models/Building.js');
const KingdomResources = require('../models/KingdomResources.js');
const BuildingUpgrade = require('../models/BuildingUpgrade.js');
const UserProgress = require('../models/UserProgress.js');

// Building configuration constants
const BUILDING_CONFIG = {
  castle: {
    name: 'Royal Castle',
    description: 'Your kingdom headquarters',
    baseHealth: 150,
    baseProduction: { gold: 0, wood: 0, stone: 0 },
    unlockRequirement: { characterLevel: 1 },
    spriteKey: 'castle-idle',
    upgradeBaseCost: { gold: 0, wood: 0, stone: 0 },
    upgradeDurationSeconds: 0,
  },
  mine: {
    name: 'Gold Mine',
    description: 'Produces gold resources',
    baseHealth: 100,
    baseProduction: { gold: 5, wood: 0, stone: 0 },
    unlockRequirement: { characterLevel: 3, districtLevel: 2 },
    spriteKey: 'mine-idle',
    upgradeBaseCost: { gold: 500, wood: 200, stone: 300 },
    upgradeDurationSeconds: 120,
  },
  forest: {
    name: 'Timber Forest',
    description: 'Harvests wood resources',
    baseHealth: 80,
    baseProduction: { gold: 0, wood: 8, stone: 0 },
    unlockRequirement: { characterLevel: 2, districtLevel: 1 },
    spriteKey: 'forest-idle',
    upgradeBaseCost: { gold: 200, wood: 100, stone: 150 },
    upgradeDurationSeconds: 90,
  },
  village: {
    name: 'Village Settlement',
    description: 'Produces all resources',
    baseHealth: 120,
    baseProduction: { gold: 2, wood: 2, stone: 2 },
    unlockRequirement: { characterLevel: 5, districtLevel: 3 },
    spriteKey: 'village-idle',
    upgradeBaseCost: { gold: 800, wood: 500, stone: 400 },
    upgradeDurationSeconds: 180,
  },
  academy: {
    name: 'Academic Academy',
    description: 'Boosts character growth',
    baseHealth: 110,
    baseProduction: { gold: 1, wood: 1, stone: 1 },
    unlockRequirement: { characterLevel: 7, districtLevel: 5 },
    spriteKey: 'academy-idle',
    upgradeBaseCost: { gold: 1200, wood: 600, stone: 700 },
    upgradeDurationSeconds: 240,
  },
};

// Building positions in the kingdom
const BUILDING_POSITIONS = {
  castle: [{ x: 512, y: 400 }],
  mine: [
    { x: 300, y: 200 },
    { x: 650, y: 200 },
  ],
  forest: [
    { x: 200, y: 600 },
    { x: 750, y: 600 },
  ],
  village: [
    { x: 400, y: 500 },
    { x: 600, y: 500 },
  ],
  academy: [{ x: 512, y: 700 }],
};

/**
 * Initialize kingdom with starting buildings
 */
const initializeKingdom = async (userId) => {
  try {
    // Check if already initialized
    const existingBuildings = await Building.findOne({ userId });
    if (existingBuildings) {
      return existingBuildings;
    }

    // Create starting resources
    let resources = await KingdomResources.findOne({ userId });
    if (!resources) {
      resources = await KingdomResources.create({ userId });
    }

    // Create starting castle
    const castle = await Building.create({
      userId,
      buildingType: 'castle',
      level: 1,
      health: 150,
      maxHealth: 150,
      position: BUILDING_POSITIONS.castle[0],
      isUnlocked: true,
      unlockedAt: new Date(),
      resources: {
        goldProduction: 0,
        woodProduction: 0,
        stoneProduction: 0,
      },
    });

    return castle;
  } catch (error) {
    console.error('Error initializing kingdom:', error);
    throw error;
  }
};

/**
 * Get all buildings for a user
 */
const getUserBuildings = async (userId) => {
  try {
    const buildings = await Building.find({ userId }).sort({
      buildingType: 1,
    });
    return buildings;
  } catch (error) {
    console.error('Error fetching buildings:', error);
    throw error;
  }
};

/**
 * Get building by ID
 */
const getBuildingById = async (buildingId) => {
  try {
    const building = await Building.findById(buildingId);
    if (!building) {
      throw new Error('Building not found');
    }
    return building;
  } catch (error) {
    console.error('Error fetching building:', error);
    throw error;
  }
};

/**
 * Unlock a building
 */
const unlockBuilding = async (userId, buildingType, position) => {
  try {
    // Check if already unlocked
    const existing = await Building.findOne({
      userId,
      buildingType,
      'position.x': position.x,
      'position.y': position.y,
    });

    if (existing) {
      if (existing.isUnlocked) {
        throw new Error('Building already unlocked');
      }
      // Update existing to unlocked
      existing.isUnlocked = true;
      existing.unlockedAt = new Date();
      return await existing.save();
    }

    // Check unlock requirements
    const userProgress = await UserProgress.findOne({ userId });
    const config = BUILDING_CONFIG[buildingType];

    if (config.unlockRequirement.characterLevel) {
      if (!userProgress || userProgress.level < config.unlockRequirement.characterLevel) {
        throw new Error(
          `Requires character level ${config.unlockRequirement.characterLevel}`
        );
      }
    }

    // Create new building
    const building = new Building({
      userId,
      buildingType,
      level: 1,
      health: config.baseHealth,
      maxHealth: config.baseHealth,
      position,
      isUnlocked: true,
      unlockedAt: new Date(),
      resources: {
        goldProduction: config.baseProduction.gold,
        woodProduction: config.baseProduction.wood,
        stoneProduction: config.baseProduction.stone,
      },
    });

    return await building.save();
  } catch (error) {
    console.error('Error unlocking building:', error);
    throw error;
  }
};

/**
 * Calculate upgrade cost based on building type and level
 */
const calculateUpgradeCost = (buildingType, currentLevel) => {
  const config = BUILDING_CONFIG[buildingType];
  const baseCost = config.upgradeBaseCost;
  const multiplier = 1.5 ** (currentLevel - 1);

  return {
    gold: Math.floor(baseCost.gold * multiplier),
    wood: Math.floor(baseCost.wood * multiplier),
    stone: Math.floor(baseCost.stone * multiplier),
  };
};

/**
 * Start building upgrade
 */
const startUpgrade = async (userId, buildingId) => {
  try {
    const building = await Building.findById(buildingId);
    if (!building) {
      throw new Error('Building not found');
    }

    if (building.userId.toString() !== userId) {
      throw new Error('Unauthorized');
    }

    if (building.level >= 10) {
      throw new Error('Building is already at maximum level');
    }

    if (building.upgradingUntil && building.upgradingUntil > new Date()) {
      throw new Error('Building is already being upgraded');
    }

    // Calculate costs
    const upgradeCost = calculateUpgradeCost(building.buildingType, building.level);

    // Check resources
    const resources = await KingdomResources.findOne({ userId });
    if (!resources) {
      throw new Error('Resources not found');
    }

    if (
      resources.gold < upgradeCost.gold ||
      resources.wood < upgradeCost.wood ||
      resources.stone < upgradeCost.stone
    ) {
      throw new Error('Insufficient resources');
    }

    // Deduct resources
    resources.gold -= upgradeCost.gold;
    resources.wood -= upgradeCost.wood;
    resources.stone -= upgradeCost.stone;
    await resources.save();

    // Calculate upgrade duration
    const config = BUILDING_CONFIG[building.buildingType];
    const upgradeDurationSeconds = config.upgradeDurationSeconds;
    const completionTime = new Date(Date.now() + upgradeDurationSeconds * 1000);

    // Create upgrade record
    const upgrade = await BuildingUpgrade.create({
      userId,
      buildingId,
      buildingType: building.buildingType,
      fromLevel: building.level,
      toLevel: building.level + 1,
      costGold: upgradeCost.gold,
      costWood: upgradeCost.wood,
      costStone: upgradeCost.stone,
      upgradeDurationSeconds,
    });

    // Update building
    building.upgradingUntil = completionTime;
    await building.save();

    return { upgrade, resources, completionTime };
  } catch (error) {
    console.error('Error starting upgrade:', error);
    throw error;
  }
};

/**
 * Complete building upgrade
 */
const completeUpgrade = async (upgadeId) => {
  try {
    const upgrade = await BuildingUpgrade.findById(upgadeId);
    if (!upgrade) {
      throw new Error('Upgrade not found');
    }

    if (upgrade.status !== 'in-progress') {
      throw new Error('Upgrade is not in progress');
    }

    // Update upgrade
    upgrade.status = 'completed';
    upgrade.completedAt = new Date();
    await upgrade.save();

    // Update building
    const building = await Building.findById(upgrade.buildingId);
    if (!building) {
      throw new Error('Building not found');
    }

    const oldProduction = { ...building.resources };

    building.level = upgrade.toLevel;
    const config = BUILDING_CONFIG[building.buildingType];
    building.maxHealth = config.baseHealth * upgrade.toLevel;
    building.health = building.maxHealth;
    building.upgradingUntil = undefined;

    // Increase production based on level
    building.resources.goldProduction = config.baseProduction.gold * upgrade.toLevel;
    building.resources.woodProduction = config.baseProduction.wood * upgrade.toLevel;
    building.resources.stoneProduction = config.baseProduction.stone * upgrade.toLevel;

    await building.save();

    return { upgrade, building, oldProduction };
  } catch (error) {
    console.error('Error completing upgrade:', error);
    throw error;
  }
};

/**
 * Harvest resources from buildings
 */
const harvestResources = async (userId) => {
  try {
    const buildings = await Building.find({ userId, isUnlocked: true });
    const resources = await KingdomResources.findOne({ userId });

    if (!resources) {
      throw new Error('Resources not found');
    }

    let harvested = {
      gold: 0,
      wood: 0,
      stone: 0,
    };

    for (const building of buildings) {
      const timeSinceLastHarvestMs = Date.now() - building.lastProducedAt.getTime();
      const timeSinceLastHarvestMinutes = timeSinceLastHarvestMs / (1000 * 60);

      // Calculate production
      const goldProduced = Math.floor(
        building.resources.goldProduction * timeSinceLastHarvestMinutes
      );
      const woodProduced = Math.floor(
        building.resources.woodProduction * timeSinceLastHarvestMinutes
      );
      const stoneProduced = Math.floor(
        building.resources.stoneProduction * timeSinceLastHarvestMinutes
      );

      harvested.gold += goldProduced;
      harvested.wood += woodProduced;
      harvested.stone += stoneProduced;

      building.lastProducedAt = new Date();
      await building.save();
    }

    // Add to resources (capped at capacity)
    resources.gold = Math.min(
      resources.gold + harvested.gold,
      resources.goldCapacity
    );
    resources.wood = Math.min(
      resources.wood + harvested.wood,
      resources.woodCapacity
    );
    resources.stone = Math.min(
      resources.stone + harvested.stone,
      resources.stoneCapacity
    );
    resources.lastHarvestedAt = new Date();

    await resources.save();

    return { harvested, resources };
  } catch (error) {
    console.error('Error harvesting resources:', error);
    throw error;
  }
};

/**
 * Get kingdom statistics
 */
const getKingdomStats = async (userId) => {
  try {
    const buildings = await Building.find({ userId });
    const resources = await KingdomResources.findOne({ userId });
    const upgrades = await BuildingUpgrade.find({
      userId,
      status: 'in-progress',
    });

    const stats = {
      buildings: buildings.length,
      unlockedBuildings: buildings.filter((b) => b.isUnlocked).length,
      totalHealth: buildings.reduce((sum, b) => sum + b.maxHealth, 0),
      resources: resources || {
        gold: 0,
        wood: 0,
        stone: 0,
      },
      activeUpgrades: upgrades.length,
    };

    return stats;
  } catch (error) {
    console.error('Error getting kingdom stats:', error);
    throw error;
  }
};

/**
 * Award resources on task completion
 */
const awardResourcesForTask = async (userId, taskDifficulty) => {
  try {
    const resources = await KingdomResources.findOne({ userId });
    if (!resources) {
      throw new Error('Resources not found');
    }

    // Award based on task difficulty
    const difficultyMultiplier = {
      easy: 1,
      medium: 1.5,
      hard: 2,
      extreme: 3,
    }[taskDifficulty] || 1;

    const award = {
      gold: Math.floor(50 * difficultyMultiplier),
      wood: Math.floor(30 * difficultyMultiplier),
      stone: Math.floor(30 * difficultyMultiplier),
    };

    resources.gold = Math.min(
      resources.gold + award.gold,
      resources.goldCapacity
    );
    resources.wood = Math.min(
      resources.wood + award.wood,
      resources.woodCapacity
    );
    resources.stone = Math.min(
      resources.stone + award.stone,
      resources.stoneCapacity
    );

    await resources.save();

    return { award, resources };
  } catch (error) {
    console.error('Error awarding resources:', error);
    throw error;
  }
};

module.exports = {
  initializeKingdom,
  getUserBuildings,
  getBuildingById,
  unlockBuilding,
  calculateUpgradeCost,
  startUpgrade,
  completeUpgrade,
  harvestResources,
  getKingdomStats,
  awardResourcesForTask,
};
