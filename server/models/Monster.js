const mongoose = require('mongoose');

/**
 * Monster Schema - Defines different enemy types with difficulty scaling
 * Monsters are spawned during battles based on task difficulty
 */
const monsterSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['goblin', 'skeleton', 'orc', 'dragon'],
      required: true,
      index: true,
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard', 'extreme'],
      required: true,
    },
    // Base stats (can be scaled based on player level)
    baseHealth: {
      type: Number,
      required: true,
      min: 10,
    },
    baseDamage: {
      type: Number,
      required: true,
      min: 1,
    },
    baseArmor: {
      type: Number,
      required: true,
      min: 0,
    },
    // Attack properties
    attackRange: {
      type: Number,
      default: 50, // pixels for Phaser
    },
    attackCooldown: {
      type: Number,
      default: 1500, // milliseconds
    },
    // Special abilities
    abilities: [
      {
        name: String,
        damageMultiplier: {
          type: Number,
          default: 1.5,
        },
        cooldown: Number, // milliseconds
        description: String,
      },
    ],
    // Rewards
    xpReward: {
      type: Number,
      required: true,
      min: 10,
    },
    goldReward: {
      type: Number,
      required: true,
      min: 5,
    },
    // Loot table
    lootTable: [
      {
        itemName: String,
        dropChance: {
          type: Number,
          min: 0,
          max: 1,
        },
      },
    ],
    // Visual/Gameplay properties
    spriteKey: String, // Phaser sprite key
    animationKey: String,
    color: String, // For visual debugging
    description: String,
  },
  {
    timestamps: true,
  }
);

/**
 * Predefined monster configurations
 * These are the standard monsters available in the game
 */
const MONSTER_TEMPLATES = {
  goblin: {
    easy: {
      type: 'goblin',
      difficulty: 'easy',
      baseHealth: 20,
      baseDamage: 3,
      baseArmor: 0,
      attackCooldown: 1500,
      xpReward: 50,
      goldReward: 25,
      spriteKey: 'goblin-idle',
      animationKey: 'goblin-walk',
      color: '#90EE90',
      description: 'A weak goblin grunt',
      abilities: [
        {
          name: 'Poke',
          damageMultiplier: 1.2,
          cooldown: 2000,
          description: 'Quick jab',
        },
      ],
    },
    medium: {
      type: 'goblin',
      difficulty: 'medium',
      baseHealth: 35,
      baseDamage: 5,
      baseArmor: 1,
      attackCooldown: 1200,
      xpReward: 100,
      goldReward: 50,
      spriteKey: 'goblin-idle',
      color: '#32CD32',
      description: 'A tougher goblin warrior',
      abilities: [
        {
          name: 'Slash',
          damageMultiplier: 1.5,
          cooldown: 2500,
          description: 'Powerful slash',
        },
      ],
    },
    hard: {
      type: 'goblin',
      difficulty: 'hard',
      baseHealth: 50,
      baseDamage: 8,
      baseArmor: 2,
      attackCooldown: 1000,
      xpReward: 200,
      goldReward: 100,
      spriteKey: 'goblin-idle',
      color: '#228B22',
      description: 'A goblin champion',
      abilities: [
        {
          name: 'Slash',
          damageMultiplier: 1.5,
          cooldown: 2000,
        },
        {
          name: 'Power Strike',
          damageMultiplier: 2.0,
          cooldown: 4000,
          description: 'Devastating blow',
        },
      ],
    },
  },
  skeleton: {
    easy: {
      type: 'skeleton',
      difficulty: 'easy',
      baseHealth: 25,
      baseDamage: 4,
      baseArmor: 1,
      attackCooldown: 1400,
      xpReward: 60,
      goldReward: 30,
      spriteKey: 'skeleton-idle',
      animationKey: 'skeleton-walk',
      color: '#D3D3D3',
      description: 'A basic skeleton',
      abilities: [
        {
          name: 'Bone Strike',
          damageMultiplier: 1.3,
          cooldown: 2000,
        },
      ],
    },
    medium: {
      type: 'skeleton',
      difficulty: 'medium',
      baseHealth: 40,
      baseDamage: 6,
      baseArmor: 2,
      attackCooldown: 1200,
      xpReward: 120,
      goldReward: 60,
      spriteKey: 'skeleton-idle',
      color: '#A9A9A9',
      description: 'An armored skeleton',
      abilities: [
        {
          name: 'Bone Strike',
          damageMultiplier: 1.4,
          cooldown: 1800,
        },
        {
          name: 'Bone Throw',
          damageMultiplier: 1.2,
          cooldown: 3000,
        },
      ],
    },
    hard: {
      type: 'skeleton',
      difficulty: 'hard',
      baseHealth: 60,
      baseDamage: 9,
      baseArmor: 3,
      attackCooldown: 1000,
      xpReward: 250,
      goldReward: 125,
      spriteKey: 'skeleton-idle',
      color: '#696969',
      description: 'An ancient skeleton warrior',
      abilities: [
        {
          name: 'Bone Strike',
          damageMultiplier: 1.5,
          cooldown: 1500,
        },
        {
          name: 'Bone Throw',
          damageMultiplier: 1.3,
          cooldown: 2500,
        },
        {
          name: 'Bone Storm',
          damageMultiplier: 2.0,
          cooldown: 5000,
        },
      ],
    },
    extreme: {
      type: 'skeleton',
      difficulty: 'extreme',
      baseHealth: 85,
      baseDamage: 12,
      baseArmor: 4,
      attackCooldown: 800,
      xpReward: 400,
      goldReward: 200,
      spriteKey: 'skeleton-idle',
      color: '#2F4F4F',
      description: 'A lich skeleton - undead sorcerer',
      abilities: [
        {
          name: 'Bone Strike',
          damageMultiplier: 1.6,
          cooldown: 1200,
        },
        {
          name: 'Bone Throw',
          damageMultiplier: 1.4,
          cooldown: 2000,
        },
        {
          name: 'Bone Storm',
          damageMultiplier: 2.2,
          cooldown: 3500,
        },
        {
          name: 'Soul Drain',
          damageMultiplier: 1.8,
          cooldown: 4000,
          description: 'Drains life force',
        },
      ],
    },
  },
  orc: {
    medium: {
      type: 'orc',
      difficulty: 'medium',
      baseHealth: 50,
      baseDamage: 7,
      baseArmor: 2,
      attackCooldown: 1300,
      xpReward: 150,
      goldReward: 75,
      spriteKey: 'orc-idle',
      animationKey: 'orc-walk',
      color: '#6B8E23',
      description: 'A green orc warrior',
      abilities: [
        {
          name: 'Club Smash',
          damageMultiplier: 1.6,
          cooldown: 2200,
        },
        {
          name: 'Roar',
          damageMultiplier: 0.8,
          cooldown: 3000,
          description: 'Intimidating roar',
        },
      ],
    },
    hard: {
      type: 'orc',
      difficulty: 'hard',
      baseHealth: 70,
      baseDamage: 10,
      baseArmor: 3,
      attackCooldown: 1100,
      xpReward: 300,
      goldReward: 150,
      spriteKey: 'orc-idle',
      color: '#556B2F',
      description: 'A veteran orc berserker',
      abilities: [
        {
          name: 'Club Smash',
          damageMultiplier: 1.7,
          cooldown: 1800,
        },
        {
          name: 'Roar',
          damageMultiplier: 1.0,
          cooldown: 2500,
        },
        {
          name: 'Berserk',
          damageMultiplier: 2.2,
          cooldown: 4500,
          description: 'Enters berserk rage',
        },
      ],
    },
    extreme: {
      type: 'orc',
      difficulty: 'extreme',
      baseHealth: 100,
      baseDamage: 14,
      baseArmor: 5,
      attackCooldown: 900,
      xpReward: 500,
      goldReward: 250,
      spriteKey: 'orc-idle',
      color: '#3D3D2D',
      description: 'An orc warlord',
      abilities: [
        {
          name: 'Club Smash',
          damageMultiplier: 1.8,
          cooldown: 1500,
        },
        {
          name: 'Roar',
          damageMultiplier: 1.2,
          cooldown: 2000,
        },
        {
          name: 'Berserk',
          damageMultiplier: 2.4,
          cooldown: 3500,
        },
        {
          name: 'War Cry',
          damageMultiplier: 2.0,
          cooldown: 5000,
          description: 'Emboldens self',
        },
      ],
    },
  },
  dragon: {
    hard: {
      type: 'dragon',
      difficulty: 'hard',
      baseHealth: 120,
      baseDamage: 15,
      baseArmor: 5,
      attackCooldown: 1500,
      xpReward: 500,
      goldReward: 250,
      spriteKey: 'dragon-idle',
      animationKey: 'dragon-fly',
      color: '#FF4500',
      description: 'A young red dragon',
      abilities: [
        {
          name: 'Claw',
          damageMultiplier: 1.5,
          cooldown: 2000,
        },
        {
          name: 'Fire Breath',
          damageMultiplier: 2.0,
          cooldown: 3000,
          description: 'Unleashes flames',
        },
        {
          name: 'Tail Swipe',
          damageMultiplier: 1.8,
          cooldown: 2500,
        },
      ],
    },
    extreme: {
      type: 'dragon',
      difficulty: 'extreme',
      baseHealth: 180,
      baseDamage: 20,
      baseArmor: 7,
      attackCooldown: 1200,
      xpReward: 1000,
      goldReward: 500,
      spriteKey: 'dragon-idle',
      color: '#8B0000',
      description: 'An ancient black dragon',
      abilities: [
        {
          name: 'Claw',
          damageMultiplier: 1.8,
          cooldown: 1500,
        },
        {
          name: 'Fire Breath',
          damageMultiplier: 2.3,
          cooldown: 2500,
        },
        {
          name: 'Tail Swipe',
          damageMultiplier: 2.0,
          cooldown: 2000,
        },
        {
          name: 'Dragon Roar',
          damageMultiplier: 1.5,
          cooldown: 3500,
          description: 'Terrifying roar',
        },
        {
          name: 'Meteor Strike',
          damageMultiplier: 2.5,
          cooldown: 6000,
          description: 'Calls down meteors',
        },
      ],
    },
  },
};

module.exports = mongoose.model('Monster', monsterSchema);
module.exports.MONSTER_TEMPLATES = MONSTER_TEMPLATES;
