/**
 * Battle System Types
 * Complete TypeScript interfaces for the Quest Battle System
 */

export enum MonsterType {
  GOBLIN = 'goblin',
  SKELETON = 'skeleton',
  ORC = 'orc',
  DRAGON = 'dragon',
}

export enum BattleDifficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
  EXTREME = 'extreme',
}

export enum BattleStatus {
  IN_PROGRESS = 'in-progress',
  VICTORY = 'victory',
  DEFEAT = 'defeat',
}

// Monster Configuration
export interface MonsterAbility {
  name: string;
  damageMultiplier: number;
  cooldown: number;
  description?: string;
}

export interface MonsterTemplate {
  type: MonsterType;
  difficulty: BattleDifficulty;
  baseHealth: number;
  baseDamage: number;
  baseArmor: number;
  attackCooldown: number;
  xpReward: number;
  goldReward: number;
  spriteKey: string;
  animationKey?: string;
  color: string;
  description: string;
  abilities: MonsterAbility[];
  lootTable?: LootItem[];
}

export interface LootItem {
  itemName: string;
  dropChance: number;
}

// Combat Stats
export interface CombatStats {
  maxHealth: number;
  currentHealth: number;
  damage: number;
  armor: number;
  critChance?: number;
}

export interface HeroStats extends CombatStats {
  critChance: number;
}

export interface MonsterStats extends CombatStats {}

// Battle Log
export interface BattleLogEntry {
  timestamp: Date;
  action: string;
  damage?: number;
  isCritical?: boolean;
  actorType: 'hero' | 'monster' | 'system';
}

// Battle Rewards
export interface BattleRewards {
  xpGained: number;
  goldGained: number;
  itemsGained: ItemReward[];
  achievementsUnlocked: string[];
}

export interface ItemReward {
  itemName: string;
  quantity: number;
}

// Main Battle Interface
export interface Battle {
  _id: string;
  userId: string;
  taskId: string;
  monsterType: MonsterType;
  monsterDifficulty: BattleDifficulty;
  status: BattleStatus;
  heroStats: HeroStats;
  monsterStats: MonsterStats;
  battleLog: BattleLogEntry[];
  rewards: BattleRewards;
  startTime: Date;
  endTime?: Date;
  durationSeconds?: number;
  turnCount: number;
  heroTurns: number;
  monsterTurns: number;
  createdAt: Date;
  updatedAt: Date;
}

// Battle Action Results
export interface AttackResult {
  battle: Battle;
  damage: number;
  isCritical: boolean;
  monsterDefeated?: boolean;
  heroDefeated?: boolean;
}

export interface BattleCompletion {
  battle: Battle;
  rewards: {
    xpGained: number;
    goldGained: number;
    levelUp: boolean;
    newLevel: number;
  };
}

// Battle Statistics
export interface BattleStats {
  totalBattles: number;
  victories: number;
  defeats: number;
  winRate: number;
  totalXpEarned: number;
  totalGoldEarned: number;
  averageBattleDuration: number;
}

// API Responses
export interface StartBattleResponse {
  success: boolean;
  battle: Battle;
  monster: MonsterTemplate;
  character: {
    name: string;
    level: number;
  };
}

export interface GetBattleResponse {
  success: boolean;
  battle: Battle;
}

export interface AttackResponse {
  success: boolean;
  damage: number;
  isCritical: boolean;
  monsterDefeated?: boolean;
  heroDefeated?: boolean;
  battle: Battle;
}

export interface CompleteBattleResponse {
  success: boolean;
  rewards: {
    xpGained: number;
    goldGained: number;
    levelUp: boolean;
    newLevel: number;
  };
  battle: Battle;
}

export interface BattleHistoryResponse {
  success: boolean;
  battles: Battle[];
}

export interface BattleStatsResponse {
  success: boolean;
  stats: BattleStats;
}

// Phaser-specific types
export interface BattleSceneData {
  battleId: string;
  monstersTemplate: MonsterTemplate;
  heroHealth: number;
  monsterHealth: number;
}

export interface CombatAction {
  type: 'hero-attack' | 'monster-attack' | 'ability' | 'item';
  damage: number;
  isCritical: boolean;
  timestamp: number;
}

export interface BattleAnimation {
  name: string;
  duration: number;
  targets: 'hero' | 'monster' | 'both';
  effect: 'damage' | 'heal' | 'crit' | 'block' | 'miss';
}

// UI State
export interface BattleUIState {
  battleId: string;
  isLoading: boolean;
  error: string | null;
  battleStatus: BattleStatus;
  heroHealth: number;
  monsterHealth: number;
  currentTurn: 'hero' | 'monster';
  isPlayerTurn: boolean;
  battleLog: string[];
  battleEnded: boolean;
  rewards?: BattleRewards;
}

// Constants
export const MONSTER_CONFIG = {
  GOBLIN: {
    EASY: { health: 20, damage: 3 },
    MEDIUM: { health: 35, damage: 5 },
    HARD: { health: 50, damage: 8 },
  },
  SKELETON: {
    EASY: { health: 25, damage: 4 },
    MEDIUM: { health: 40, damage: 6 },
    HARD: { health: 60, damage: 9 },
    EXTREME: { health: 85, damage: 12 },
  },
  ORC: {
    MEDIUM: { health: 50, damage: 7 },
    HARD: { health: 70, damage: 10 },
    EXTREME: { health: 100, damage: 14 },
  },
  DRAGON: {
    HARD: { health: 120, damage: 15 },
    EXTREME: { health: 180, damage: 20 },
  },
};

export const XP_REWARDS = {
  EASY: 50,
  MEDIUM: 150,
  HARD: 300,
  EXTREME: 600,
};

export const GOLD_REWARDS = {
  EASY: 25,
  MEDIUM: 75,
  HARD: 150,
  EXTREME: 300,
};

// Colors
export const MONSTER_COLORS = {
  [MonsterType.GOBLIN]: '#90EE90',
  [MonsterType.SKELETON]: '#D3D3D3',
  [MonsterType.ORC]: '#6B8E23',
  [MonsterType.DRAGON]: '#FF4500',
};

export const UI_COLORS = {
  HERO_HEALTH: '#44FF44',
  MONSTER_HEALTH: '#FF4444',
  DAMAGE_TEXT: '#FFB6C1',
  CRIT_TEXT: '#FFD700',
  HEAL_TEXT: '#90EE90',
  BACKGROUND: '#1a1a2e',
  BORDER: '#0f3460',
  TEXT: '#e0e0e0',
};
