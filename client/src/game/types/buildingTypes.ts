// Building types and configuration

export enum BuildingType {
  CASTLE = 'castle',
  MINE = 'mine',
  FOREST = 'forest',
  VILLAGE = 'village',
  ACADEMY = 'academy',
}

export interface BuildingConfig {
  name: string;
  description: string;
  baseHealth: number;
  baseProduction: {
    gold: number;
    wood: number;
    stone: number;
  };
  unlockRequirement: {
    characterLevel?: number;
    districtLevel?: number;
  };
  spriteKey: string;
  upgradeBaseCost: {
    gold: number;
    wood: number;
    stone: number;
  };
  upgradeDurationSeconds: number;
  color: string;
}

export const BUILDING_CONFIG: Record<BuildingType, BuildingConfig> = {
  [BuildingType.CASTLE]: {
    name: 'Royal Castle',
    description: 'Your kingdom headquarters',
    baseHealth: 150,
    baseProduction: { gold: 0, wood: 0, stone: 0 },
    unlockRequirement: { characterLevel: 1 },
    spriteKey: 'castle-idle',
    upgradeBaseCost: { gold: 0, wood: 0, stone: 0 },
    upgradeDurationSeconds: 0,
    color: '#8B4513',
  },
  [BuildingType.MINE]: {
    name: 'Gold Mine',
    description: 'Produces gold resources',
    baseHealth: 100,
    baseProduction: { gold: 5, wood: 0, stone: 0 },
    unlockRequirement: { characterLevel: 3, districtLevel: 2 },
    spriteKey: 'mine-idle',
    upgradeBaseCost: { gold: 500, wood: 200, stone: 300 },
    upgradeDurationSeconds: 120,
    color: '#FFD700',
  },
  [BuildingType.FOREST]: {
    name: 'Timber Forest',
    description: 'Harvests wood resources',
    baseHealth: 80,
    baseProduction: { gold: 0, wood: 8, stone: 0 },
    unlockRequirement: { characterLevel: 2, districtLevel: 1 },
    spriteKey: 'forest-idle',
    upgradeBaseCost: { gold: 200, wood: 100, stone: 150 },
    upgradeDurationSeconds: 90,
    color: '#228B22',
  },
  [BuildingType.VILLAGE]: {
    name: 'Village Settlement',
    description: 'Produces all resources',
    baseHealth: 120,
    baseProduction: { gold: 2, wood: 2, stone: 2 },
    unlockRequirement: { characterLevel: 5, districtLevel: 3 },
    spriteKey: 'village-idle',
    upgradeBaseCost: { gold: 800, wood: 500, stone: 400 },
    upgradeDurationSeconds: 180,
    color: '#CD853F',
  },
  [BuildingType.ACADEMY]: {
    name: 'Academic Academy',
    description: 'Boosts character growth',
    baseHealth: 110,
    baseProduction: { gold: 1, wood: 1, stone: 1 },
    unlockRequirement: { characterLevel: 7, districtLevel: 5 },
    spriteKey: 'academy-idle',
    upgradeBaseCost: { gold: 1200, wood: 600, stone: 700 },
    upgradeDurationSeconds: 240,
    color: '#4169E1',
  },
};

export interface Building {
  _id: string;
  userId: string;
  buildingType: BuildingType;
  level: number;
  health: number;
  maxHealth: number;
  position: {
    x: number;
    y: number;
  };
  isUnlocked: boolean;
  unlockedAt?: Date;
  lastProducedAt: Date;
  upgradingUntil?: Date;
  resources: {
    goldProduction: number;
    woodProduction: number;
    stoneProduction: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface KingdomResources {
  _id: string;
  userId: string;
  gold: number;
  wood: number;
  stone: number;
  goldCapacity: number;
  woodCapacity: number;
  stoneCapacity: number;
  lastHarvestedAt: Date;
  harvestRate: {
    goldPerMinute: number;
    woodPerMinute: number;
    stonePerMinute: number;
  };
}

export interface BuildingUpgrade {
  _id: string;
  userId: string;
  buildingId: string;
  buildingType: BuildingType;
  fromLevel: number;
  toLevel: number;
  costGold: number;
  costWood: number;
  costStone: number;
  upgradeDurationSeconds: number;
  startedAt: Date;
  completedAt?: Date;
  status: 'in-progress' | 'completed' | 'cancelled';
}

export interface KingdomStats {
  buildings: number;
  unlockedBuildings: number;
  totalHealth: number;
  resources: KingdomResources;
  activeUpgrades: number;
}

export const RESOURCE_TYPES = {
  GOLD: 'gold',
  WOOD: 'wood',
  STONE: 'stone',
} as const;

export const RESOURCE_COLORS = {
  gold: '#FFD700',
  wood: '#8B4513',
  stone: '#808080',
} as const;

export const RESOURCE_ICONS = {
  gold: '💰',
  wood: '🪵',
  stone: '⛏️',
} as const;

export default {
  BuildingType,
  BUILDING_CONFIG,
  RESOURCE_TYPES,
  RESOURCE_COLORS,
  RESOURCE_ICONS,
};
