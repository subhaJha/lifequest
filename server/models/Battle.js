const mongoose = require('mongoose');

/**
 * Battle Schema - Records individual battles and their outcomes
 * Used for battle history, statistics, and progression tracking
 */
const battleSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      required: true,
    },
    monsterType: {
      type: String,
      enum: ['goblin', 'skeleton', 'orc', 'dragon'],
      required: true,
    },
    monsterDifficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard', 'extreme'],
      required: true,
    },
    // Battle state
    status: {
      type: String,
      enum: ['in-progress', 'victory', 'defeat'],
      default: 'in-progress',
    },
    // Combat statistics
    heroStats: {
      maxHealth: Number,
      currentHealth: Number,
      damage: Number,
      armor: Number,
      critChance: Number, // percentage 0-100
    },
    monsterStats: {
      maxHealth: Number,
      currentHealth: Number,
      damage: Number,
      armor: Number,
    },
    // Battle log
    battleLog: [
      {
        timestamp: {
          type: Date,
          default: Date.now,
        },
        action: String, // e.g., "Hero attacks for 15 damage"
        damage: Number,
        isCritical: Boolean,
        actorType: {
          type: String,
          enum: ['hero', 'monster'],
        },
      },
    ],
    // Rewards granted
    rewards: {
      xpGained: {
        type: Number,
        default: 0,
      },
      goldGained: {
        type: Number,
        default: 0,
      },
      itemsGained: [
        {
          itemName: String,
          quantity: Number,
        },
      ],
      achievementsUnlocked: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Achievement',
        },
      ],
    },
    // Battle duration
    startTime: {
      type: Date,
      default: Date.now,
    },
    endTime: Date,
    durationSeconds: Number,
    // Additional tracking
    turnCount: Number,
    heroTurns: Number,
    monsterTurns: Number,
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
battleSchema.index({ userId: 1, createdAt: -1 });
battleSchema.index({ userId: 1, status: 1 });
battleSchema.index({ taskId: 1 });

module.exports = mongoose.model('Battle', battleSchema);
