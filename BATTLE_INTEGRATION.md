# Battle System Integration Guide

## Integrating Battles into Task Completion Flow

This guide shows how to integrate the battle system into your existing task management system.

## Step 1: Update Task Routes

Add a battle endpoint to `server/routes/taskRoutes.js`:

```javascript
// In taskRoutes.js
const router = express.Router();

// ... existing routes ...

// Complete task with optional battle
router.post('/:taskId/complete', authenticate, async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Check if task requires battle
    if (task.requiresBattle && task.difficulty) {
      return res.json({
        success: true,
        message: 'Task requires battle completion',
        requiresBattle: true,
        difficulty: task.difficulty,
      });
    }

    // Regular completion without battle
    task.status = 'completed';
    task.completedAt = new Date();
    await task.save();

    res.json({ success: true, task });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

## Step 2: Update Task Component

Create an updated `TaskDetailWithBattle.tsx` component:

```typescript
import React, { useState } from 'react';
import { BattleContainer } from './BattleContainer';
import { Task } from '../types/taskTypes';

interface TaskDetailWithBattleProps {
  task: Task;
  onTaskComplete: (task: Task) => void;
  onCancel: () => void;
}

export const TaskDetailWithBattle: React.FC<TaskDetailWithBattleProps> = ({
  task,
  onTaskComplete,
  onCancel,
}) => {
  const [showBattle, setShowBattle] = useState(false);
  const [battleActive, setBattleActive] = useState(false);

  const handleCompleteTask = async () => {
    // Determine if task requires battle
    if (task.difficulty && shouldRequireBattle(task)) {
      setBattleActive(true);
      setShowBattle(true);
    } else {
      // Complete task without battle
      await completeTaskAPI();
    }
  };

  const handleBattleComplete = async (
    result: 'victory' | 'defeat' | 'forfeit',
    rewards?: any
  ) => {
    if (result === 'victory') {
      // Update character with rewards
      await updateCharacterXP(rewards.xpGained);
      await updateCharacterGold(rewards.goldGained);

      // Complete the task
      await completeTaskAPI();

      // Show success message
      showNotification({
        type: 'success',
        title: 'Task Complete!',
        message: `You earned ${rewards.xpGained} XP and ${rewards.goldGained} gold!`,
      });

      onTaskComplete(task);
    } else if (result === 'defeat') {
      showNotification({
        type: 'warning',
        title: 'Battle Lost',
        message: 'You were defeated. Try again with more preparation!',
      });
    } else if (result === 'forfeit') {
      showNotification({
        type: 'info',
        title: 'Battle Forfeited',
        message: 'The battle was forfeited. Task remains incomplete.',
      });
    }

    setShowBattle(false);
    setBattleActive(false);
  };

  const shouldRequireBattle = (task: Task): boolean => {
    // Tasks marked with requiresBattle and difficulty level require battles
    return task.requiresBattle !== false && !!task.difficulty;
  };

  if (showBattle && battleActive) {
    return (
      <BattleContainer
        taskId={task._id}
        taskDifficulty={task.difficulty as any}
        characterLevel={5} // Get from auth context
        onBattleComplete={handleBattleComplete}
        onBattleCancel={() => setShowBattle(false)}
      />
    );
  }

  return (
    <div className="task-detail">
      <div className="task-header">
        <h1>{task.title}</h1>
        <p className="task-description">{task.description}</p>
      </div>

      <div className="task-info">
        <span className={`difficulty ${task.difficulty}`}>
          {task.difficulty.toUpperCase()}
        </span>
        <span className={`category ${task.category}`}>
          {task.category}
        </span>
      </div>

      <div className="task-actions">
        {task.status === 'completed' ? (
          <div className="task-completed">
            ✓ This task is complete
          </div>
        ) : (
          <>
            {shouldRequireBattle(task) ? (
              <button 
                className="btn-battle"
                onClick={handleCompleteTask}
              >
                ⚔️ Challenge Monster to Complete
              </button>
            ) : (
              <button
                className="btn-complete"
                onClick={handleCompleteTask}
              >
                ✓ Mark Complete
              </button>
            )}
            <button className="btn-cancel" onClick={onCancel}>
              Cancel
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default TaskDetailWithBattle;
```

## Step 3: Update Character Context

Update `AuthContext.tsx` to handle battle rewards:

```typescript
// In contexts/AuthContext.tsx

export interface CharacterProgress {
  totalXP: number;
  level: number;
  gold: number;
  battleStats?: BattleStats;
}

export interface AuthContextValue {
  // ... existing fields ...
  characterProgress: CharacterProgress;
  updateCharacterProgress: (updates: Partial<CharacterProgress>) => void;
  awardBattleRewards: (rewards: { xpGained: number; goldGained: number }) => void;
}

// In your AuthProvider component:
const awardBattleRewards = (rewards: { xpGained: number; goldGained: number }) => {
  setCharacterProgress(prev => {
    const newXP = prev.totalXP + rewards.xpGained;
    const newLevel = calculateLevel(newXP);
    
    return {
      ...prev,
      totalXP: newXP,
      level: newLevel,
      gold: prev.gold + rewards.goldGained,
    };
  });
};

const calculateLevel = (totalXP: number): number => {
  let level = 1;
  let xpRequired = 1000;
  let accumulatedXP = 0;

  while (accumulatedXP + xpRequired <= totalXP) {
    accumulatedXP += xpRequired;
    level++;
    xpRequired = 1000 + (level * 500);
  }

  return level;
};
```

## Step 4: Update Task Service

Add battle completion logic to `client/src/services/api.ts`:

```typescript
// In services/api.ts

export const completeTaskWithBattle = async (
  taskId: string,
  battleId: string
): Promise<any> => {
  // Battle is already completed via battleAPI.completeBattle()
  // Now mark task as completed
  const response = await fetch(
    `${API_URL}/tasks/${taskId}/complete`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ battleId }),
    }
  );

  if (!response.ok) {
    throw new Error('Failed to complete task');
  }

  return response.json();
};

export const completeTaskWithoutBattle = async (
  taskId: string
): Promise<any> => {
  const response = await fetch(
    `${API_URL}/tasks/${taskId}/complete`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    }
  );

  if (!response.ok) {
    throw new Error('Failed to complete task');
  }

  return response.json();
};
```

## Step 5: Update Dashboard

Add battle widgets to `pages/Dashboard.tsx`:

```typescript
import { useBattle } from '../hooks/useBattle';

export const Dashboard: React.FC = () => {
  const { battleStats } = useBattle();
  const { characterProgress } = useAuth();

  useEffect(() => {
    getBattleStatsData();
  }, []);

  return (
    <div className="dashboard">
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Character Level</h3>
          <p className="stat-value">{characterProgress.level}</p>
        </div>

        <div className="stat-card">
          <h3>Total XP</h3>
          <p className="stat-value">{characterProgress.totalXP}</p>
        </div>

        <div className="stat-card">
          <h3>Gold</h3>
          <p className="stat-value">{characterProgress.gold}</p>
        </div>

        {battleStats && (
          <>
            <div className="stat-card">
              <h3>Battles Won</h3>
              <p className="stat-value">{battleStats.victories}</p>
            </div>

            <div className="stat-card">
              <h3>Win Rate</h3>
              <p className="stat-value">
                {(battleStats.winRate * 100).toFixed(1)}%
              </p>
            </div>

            <div className="stat-card">
              <h3>Avg Battle Time</h3>
              <p className="stat-value">
                {battleStats.averageBattleDuration}s
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
```

## Step 6: Add Achievement System Integration

Update `server/services/achievements.js` to trigger on battles:

```javascript
// In server/services/achievements.js

const checkBattleAchievements = async (userId, battleResult) => {
  const achievements = [];

  // First victory
  const stats = await getBattleStats(userId);
  if (stats.totalBattles === 1) {
    achievements.push('FIRST_VICTORY');
  }

  // Perfect battles
  if (battleResult.heroTurns === 1) {
    // One-hit kill
    achievements.push('ONE_HIT_WONDER');
  }

  if (battleResult.battle.rewards) {
    // Perfect battle (no damage)
    if (battleResult.battle.heroStats.currentHealth === 
        battleResult.battle.heroStats.maxHealth) {
      achievements.push('PERFECT_BATTLE');
    }
  }

  // Win streak
  const recentBattles = await getBattleHistory(userId, 5);
  const recentWins = recentBattles.filter(b => b.status === 'victory').length;
  if (recentWins === 5) {
    achievements.push('WINNING_STREAK');
  }

  // Extreme difficulty
  if (battleResult.battle.monsterDifficulty === 'extreme') {
    achievements.push('EXTREME_WARRIOR');
  }

  return achievements;
};
```

## Step 7: Database Schema Considerations

Update your Task schema to support battles:

```javascript
// In server/models/Task.js

const taskSchema = new Schema({
  // ... existing fields ...
  
  requiresBattle: {
    type: Boolean,
    default: true, // All tasks require battles
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard', 'extreme'],
    default: 'medium',
  },
  linkedBattle: {
    type: Schema.Types.ObjectId,
    ref: 'Battle',
  },
  battleStats: {
    totalAttempts: Number,
    victories: Number,
    losses: Number,
  },
});
```

## Step 8: Testing Integration

### Test Checklist

- [ ] Create a task with difficulty 'hard'
- [ ] Click "Complete Task"
- [ ] Battle should launch
- [ ] Win the battle
- [ ] Task should be marked complete
- [ ] Character XP should increase
- [ ] Character level should update if XP threshold met
- [ ] Gold should increase
- [ ] Battle stats should update

### Test Scenarios

```typescript
// Scenario 1: Quick victory (< 30 seconds)
// Expected: XP × 1.25, Gold × 1.25

// Scenario 2: Perfect battle (no damage taken)
// Expected: XP × 1.5, Gold × 1.5

// Scenario 3: Loss
// Expected: Task remains incomplete, no rewards

// Scenario 4: Level up after victory
// Expected: Character level increases, new abilities unlocked
```

## Migration Guide

If you have existing tasks:

```javascript
// Add battle support to existing tasks
db.tasks.updateMany(
  {},
  {
    $set: {
      requiresBattle: true,
      difficulty: 'medium', // Default or calculate from category
      battleStats: { totalAttempts: 0, victories: 0, losses: 0 }
    }
  }
);
```

## Performance Optimization

### Caching Battle Stats

```typescript
// Cache battle stats on client for 5 minutes
const CACHE_DURATION = 5 * 60 * 1000;
let cachedStats = null;
let cacheTime = 0;

export const getCachedBattleStats = async () => {
  if (cachedStats && Date.now() - cacheTime < CACHE_DURATION) {
    return cachedStats;
  }

  const stats = await battleAPI.getBattleStats();
  cachedStats = stats;
  cacheTime = Date.now();
  return stats;
};
```

### Database Indexes

```javascript
// In server/models/Battle.js
battleSchema.index({ userId: 1, createdAt: -1 });
battleSchema.index({ userId: 1, status: 1 });
battleSchema.index({ taskId: 1 });
```

## Troubleshooting Common Issues

### Issue: Battle doesn't start
**Solution**: Check that battleAPI.startBattle returns valid response

### Issue: XP doesn't update
**Solution**: Verify awardBattleRewards is called after victory

### Issue: Task remains incomplete
**Solution**: Ensure completeTaskAPI() is called after battle victory

### Issue: Character level doesn't increase
**Solution**: Check XP threshold calculation in calculateLevel()

## Next Steps

1. ✅ Implement battle-aware task completion
2. ✅ Add achievement triggers on battle events
3. ✅ Create leaderboards based on battle stats
4. ✅ Add battle tutorials for new players
5. ✅ Create daily battle challenges
6. ✅ Add battle replays

---

For detailed API documentation, see [BATTLE_SYSTEM.md](./BATTLE_SYSTEM.md)
For quick implementation examples, see [BATTLE_QUICKSTART.md](./BATTLE_QUICKSTART.md)
