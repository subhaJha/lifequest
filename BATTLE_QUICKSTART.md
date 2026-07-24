# Battle System Quick Start Guide

## For Developers

### Setting Up

1. **Backend is Ready**
   - Models: Monster.js, Battle.js ✓
   - Service: battleService.js ✓
   - Controllers: battleController.js ✓
   - Routes: battleRoutes.js registered in server.js ✓

2. **Frontend is Ready**
   - Types: battleTypes.ts ✓
   - API: battleApi.ts ✓
   - Game: BattleScene.ts, BattleHero.ts, BattleMonster.ts ✓
   - Components: BattleContainer.tsx ✓
   - Hook: useBattle.ts ✓

### Quick Integration Example

#### Step 1: Add Battle to a Page Component

```tsx
import React, { useState } from 'react';
import { BattleContainer } from '../components/BattleContainer';

export function TaskDetailPage() {
  const [showBattle, setShowBattle] = useState(false);
  const [task, setTask] = useState({
    _id: 'task-123',
    title: 'Complete Project Report',
    difficulty: 'hard' // easy, medium, hard, extreme
  });

  const handleStartBattle = () => {
    setShowBattle(true);
  };

  const handleBattleComplete = (result, rewards) => {
    if (result === 'victory') {
      console.log('🎉 Battle Won!');
      console.log('Rewards:', rewards);
      // Update task status to complete
      // Update character XP/Gold
      completeTask();
    } else if (result === 'defeat') {
      console.log('💀 Battle Lost - Task remains incomplete');
    } else {
      console.log('⚠️ Battle Forfeited');
    }
    
    setShowBattle(false);
  };

  return (
    <div>
      <h1>{task.title}</h1>
      <button onClick={handleStartBattle}>
        ⚔️ Challenge Monster
      </button>

      {showBattle && (
        <BattleContainer
          taskId={task._id}
          taskDifficulty={task.difficulty}
          characterLevel={5}
          onBattleComplete={handleBattleComplete}
          onBattleCancel={() => setShowBattle(false)}
        />
      )}
    </div>
  );
}
```

#### Step 2: Use the Battle Hook for Advanced Control

```tsx
import { useBattle } from '../hooks/useBattle';
import battleAPI from '../services/battleApi';

export function BattleStatsWidget() {
  const { battleStats, getBattleStatsData } = useBattle();

  useEffect(() => {
    getBattleStatsData();
  }, []);

  if (!battleStats) {
    return <div>Loading battle stats...</div>;
  }

  return (
    <div className="stats-widget">
      <h3>Your Battle Stats</h3>
      <p>📊 Total Battles: {battleStats.totalBattles}</p>
      <p>🏆 Victories: {battleStats.victories}</p>
      <p>⚔️ Win Rate: {(battleStats.winRate * 100).toFixed(1)}%</p>
      <p>✨ Total XP: {battleStats.totalXpEarned}</p>
      <p>💰 Total Gold: {battleStats.totalGoldEarned}</p>
      <p>⏱️ Avg Duration: {battleStats.averageBattleDuration}s</p>
    </div>
  );
}
```

### API Usage

#### Direct API Calls

```tsx
import battleAPI from '../services/battleApi';

// Start a battle
const response = await battleAPI.startBattle('task-id', 'hard');
const battle = response.battle; // Battle object

// Get battle state
const battleState = await battleAPI.getBattle(battleId);

// Hero attacks
const attackResult = await battleAPI.heroAttack(battleId);
console.log(attackResult.damage, attackResult.isCritical);

// Monster attacks
const monsterResult = await battleAPI.monsterAttack(battleId);

// Complete and get rewards
const completion = await battleAPI.completeBattle(battleId, taskId);
console.log(completion.rewards);

// Get history
const history = await battleAPI.getBattleHistory(10);

// Get stats
const stats = await battleAPI.getBattleStats();

// Forfeit
await battleAPI.forfeitBattle(battleId);
```

### Monster Selection Logic

Monsters are automatically selected based on task difficulty:

**Easy Tasks** → Goblin (Easy)
**Medium Tasks** → Random from: Goblin (Medium), Skeleton (Easy/Medium), Orc (Medium)
**Hard Tasks** → Random from: Goblin (Hard), Skeleton (Hard), Orc (Hard), Dragon (Hard)
**Extreme Tasks** → Random from: Skeleton (Extreme), Orc (Extreme), Dragon (Extreme)

### Battle Flow Diagram

```
User clicks "Start Battle"
    ↓
[startBattle] → Creates Battle record
    ↓
Phaser BattleScene loads
    ↓
[Display Hero & Monster]
    ↓
Player clicks "Attack" or presses Space
    ↓
[heroAttack] API call → Calculate damage → Update battle
    ↓
[Display damage animation]
    ↓
Check: Monster defeated? YES → handleVictory()
                      NO → Monster's turn
    ↓
[monsterAttack] API call → Calculate damage → Update battle
    ↓
[Display damage animation]
    ↓
Check: Hero defeated? YES → handleDefeat()
                     NO → Back to player turn
    ↓
Battle ends
    ↓
[completeBattle] API call → Calculate rewards → Award XP/Gold
    ↓
Return to Task page
```

### Reward Calculation Example

```
Base XP from monster: 100
Base Gold from monster: 50

Scenario 1: Normal victory (30+ seconds, took damage)
Result: 100 XP, 50 Gold

Scenario 2: Quick victory (< 30 seconds, took damage)
Result: 125 XP (1.25x), 62 Gold (1.25x)

Scenario 3: Perfect victory (no damage taken, any duration)
Result: 150 XP (1.5x), 75 Gold (1.5x)

Scenario 4: Quick + Perfect victory
Result: 187 XP (1.25x × 1.5x), 93 Gold (1.25x × 1.5x)
```

### Difficulty Scaling Example

For a level 5 player vs level 2 monster:
```
Base Monster Stats:
- Health: 50
- Damage: 8

Scaling Factor: 1 + (5 × 0.1) = 1.5

Scaled Monster Stats:
- Health: 50 × 1.5 = 75
- Damage: 8 × 1.5 = 12
```

### Error Handling

```tsx
try {
  const response = await battleAPI.startBattle(taskId, difficulty);
  // Handle success
} catch (error) {
  if (error.message.includes('401')) {
    // Handle authentication error
  } else if (error.message.includes('403')) {
    // Handle authorization error
  } else {
    // Handle other errors
  }
}
```

### Styling the Battle UI

Edit `client/src/components/BattleContainer.css` to customize:
- Battle arena appearance
- Button styles
- Health bar colors
- Animation timings

Key CSS classes:
- `.battle-container` - Main wrapper
- `.battle-game` - Phaser canvas container
- `.battle-result` - Victory/Defeat overlay
- `.battle-result.victory` - Victory styling
- `.battle-result.defeat` - Defeat styling

### Testing Battles Locally

1. Start the backend:
   ```bash
   cd server
   npm start
   ```

2. Start the frontend:
   ```bash
   cd client
   npm run dev
   ```

3. Log in and navigate to a task
4. Click "Challenge Monster"
5. Battle should load in Phaser scene
6. Click "ATTACK" button to fight
7. Watch for victory/defeat

### Common Integration Points

| Component | Purpose | Location |
|-----------|---------|----------|
| TaskDetail | Start battle from task | `pages/TaskDetail.tsx` |
| TaskList | Show battle stats | `components/TaskList.tsx` |
| Dashboard | Battle stats widget | `pages/Dashboard.tsx` |
| Character | Character level affected by XP | `pages/CharacterProfile.tsx` |
| Inventory | Loot drops (future) | `components/Inventory.tsx` |

### Debug Tips

1. **Check Browser Console** for Phaser errors
2. **Check Network Tab** for API calls
3. **Check Server Logs** for backend errors
4. **Verify MongoDB** contains battle records
5. **Check Redux/State** for character updates

### Performance Tips

- Battle scene only renders when needed (lazy load Phaser)
- Limit particle effects on mobile
- Cache monster sprites
- Reuse Phaser graphics objects

### Next Steps

1. ✅ Integrate BattleContainer into TaskDetail page
2. ✅ Add "Challenge Monster" button to tasks
3. ✅ Update character XP on victory
4. ✅ Mark task complete on victory
5. ✅ Add battle stats to dashboard
6. ✅ Create achievement triggers (first victory, etc.)
7. ✅ Add leaderboards showing battle stats

---

## For Game Designers

### Balancing Battles

**Difficulty Curve**:
- Easy battles should win 90% of time
- Medium battles should win 70% of time
- Hard battles should win 50% of time
- Extreme battles should win 30% of time

**Adjusting Monster Stats**:
1. Edit `server/models/Monster.js` MONSTER_TEMPLATES
2. Test with a player character
3. Verify win rates in battle history
4. Adjust baseHealth/baseDamage as needed

**Reward Balance**:
- Early game: 50-100 XP per battle
- Mid game: 200-300 XP per battle
- Late game: 500-1000 XP per battle

### Future Enhancement Ideas

- [ ] Monster abilities (special attacks)
- [ ] Hero abilities unlocked at levels
- [ ] Status effects (poison, stun)
- [ ] Multiple battle strategies
- [ ] Armor/weapon affecting stats
- [ ] Boss battles with phases
- [ ] Daily battle challenges
- [ ] Battle tournaments

---

**Quick Links**:
- [Full Documentation](./BATTLE_SYSTEM.md)
- [Battle Types](./client/src/game/types/battleTypes.ts)
- [Battle API](./client/src/services/battleApi.ts)
- [Battle Scene](./client/src/game/scenes/BattleScene.ts)
