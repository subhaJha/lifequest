# Quest Battle System Documentation

## Overview

The Quest Battle System is a complete turn-based combat system integrated with the LifeQuest task management platform. Players battle monsters tied to task difficulty levels, earning XP and gold rewards for victories.

## Architecture

### Backend (Node.js/Express/MongoDB)

#### Models
- **Monster.js** - Monster configurations with 16 pre-defined variants
- **Battle.js** - Battle records and combat history tracking
- **User.js** - Extended with battle statistics
- **CharacterProfile.js** - Hero stats used in combat

#### Services
- **battleService.js** - Core game logic:
  - Combat mechanics (damage calculation, critical hits)
  - Monster selection and scaling
  - Reward calculation with multipliers
  - Battle statistics aggregation

#### Controllers
- **battleController.js** - HTTP request handlers for 8 battle endpoints

#### Routes
- **battleRoutes.js** - Express route definitions with authentication

### Frontend (React/TypeScript/Phaser)

#### Types
- **battleTypes.ts** - Complete TypeScript interfaces and enums

#### Services
- **battleApi.ts** - API client for all battle endpoints

#### Game Engine (Phaser 3)
- **BattleScene.ts** - Main battle scene orchestrating combat
- **BattleHero.ts** - Player character sprite and animations
- **BattleMonster.ts** - Enemy sprite and animations

#### Components
- **BattleContainer.tsx** - React wrapper managing Phaser instance
- **useBattle.ts** - Custom hook for battle state management

## Game Mechanics

### Monster Types
| Type | Difficulty | Health | Damage | XP | Gold |
|------|-----------|--------|--------|-----|------|
| Goblin | Easy | 20 | 3 | 50 | 25 |
| Goblin | Medium | 35 | 5 | 100 | 50 |
| Goblin | Hard | 50 | 8 | 200 | 100 |
| Skeleton | Easy | 25 | 4 | 75 | 40 |
| Skeleton | Medium | 40 | 6 | 150 | 75 |
| Skeleton | Hard | 60 | 9 | 300 | 150 |
| Skeleton | Extreme | 85 | 12 | 400 | 200 |
| Orc | Medium | 50 | 7 | 175 | 85 |
| Orc | Hard | 70 | 10 | 350 | 175 |
| Orc | Extreme | 100 | 14 | 500 | 250 |
| Dragon | Hard | 120 | 15 | 600 | 300 |
| Dragon | Extreme | 180 | 20 | 1000 | 500 |

### Combat System

#### Damage Calculation
```
damage = baseDamage × (1 - armor × 0.1)
if (isCritical):
  damage = damage × 1.5
minimum damage = 1
```

#### Critical Hit Chance
- Hero: Based on character stats (critChance %)
- Monster: Fixed 10% chance

#### Battle Flow
1. **Initialization**: Hero and monster stats loaded, battle record created
2. **Hero Turn**: Player attacks; server calculates damage
3. **Monster Turn**: Monster attacks; server calculates damage
4. **Repeat**: Until hero or monster health reaches 0
5. **Completion**: Rewards calculated and awarded

### Reward System

#### Base Rewards
Determined by monster difficulty and type

#### Multipliers
- **Quick Battle** (< 30 seconds): 1.25x multiplier
- **Perfect Battle** (no damage taken): 1.5x multiplier
- **Stacking**: Multipliers apply together

#### Level Up
Players level up when total XP reaches threshold:
```
XP_THRESHOLD = 1000 + (level × 500)
```

## API Endpoints

### Battle Endpoints
All endpoints require authentication (JWT token in headers)

#### Start Battle
```
POST /api/battles/start
Body: { taskId, taskDifficulty }
Response: { success, battle, monster, character }
```

#### Get Battle
```
GET /api/battles/:battleId
Response: { success, battle }
```

#### Hero Attack
```
POST /api/battles/:battleId/hero-attack
Response: { success, damage, isCritical, monsterDefeated, battle }
```

#### Monster Attack
```
POST /api/battles/:battleId/monster-attack
Response: { success, damage, isCritical, heroDefeated, battle }
```

#### Complete Battle
```
POST /api/battles/:battleId/complete
Body: { taskId }
Response: { success, rewards, battle }
```

#### Get Battle History
```
GET /api/battles/history?limit=10
Response: { success, battles }
```

#### Get Battle Stats
```
GET /api/battles/stats
Response: { success, stats }
```

#### Forfeit Battle
```
POST /api/battles/:battleId/forfeit
Response: { success, battle }
```

## Frontend Integration

### Using BattleContainer

```tsx
import { BattleContainer } from './components/BattleContainer';

function TaskDetail() {
  const [showBattle, setShowBattle] = useState(false);
  
  const handleBattleComplete = (result, rewards) => {
    if (result === 'victory') {
      // Update XP/gold in UI
      // Mark task as complete
      console.log('Battle won!', rewards);
    }
    setShowBattle(false);
  };

  return (
    <div>
      <button onClick={() => setShowBattle(true)}>Start Battle</button>
      
      {showBattle && (
        <BattleContainer
          taskId="task-id-123"
          taskDifficulty="hard"
          characterLevel={5}
          onBattleComplete={handleBattleComplete}
          onBattleCancel={() => setShowBattle(false)}
        />
      )}
    </div>
  );
}
```

### Using useBattle Hook

```tsx
import { useBattle } from './hooks/useBattle';

function BattleStats() {
  const { battleState, battleStats, getBattleStatsData } = useBattle();

  useEffect(() => {
    getBattleStatsData();
  }, []);

  if (!battleStats) return <div>Loading...</div>;

  return (
    <div>
      <h2>Battle Statistics</h2>
      <p>Total Battles: {battleStats.totalBattles}</p>
      <p>Win Rate: {(battleStats.winRate * 100).toFixed(1)}%</p>
      <p>XP Earned: {battleStats.totalXpEarned}</p>
    </div>
  );
}
```

## Phaser Integration

### Scene Lifecycle

1. **Preload**: Load battle textures and particle effects
2. **Create**: Initialize hero/monster sprites, create UI, set up input handlers
3. **Update**: Monitor battle state, trigger turn transitions
4. **Shutdown**: Clean up sprites and listeners

### Input Handling

- **Space Bar**: Execute attack
- **Mouse Click**: Attack/Forfeit buttons
- **ESC**: Forfeit battle

### Event System

Battle scene emits completion events:
```typescript
scene.events.on('battleComplete', (data) => {
  // data = { status: 'victory' | 'defeat' | 'forfeit', battleId }
});
```

## Monster Scaling

Monster stats scale with player level:
```
scaledStat = baseStat × (1 + playerLevel × 0.1)
```

This ensures battles remain challenging as players progress.

## Task Difficulty Mapping

| Task Difficulty | Possible Monsters |
|-----------------|-------------------|
| Easy | Goblin (Easy) |
| Medium | Goblin (Medium), Skeleton (Easy/Medium), Orc (Medium) |
| Hard | Goblin (Hard), Skeleton (Medium/Hard), Orc (Hard), Dragon (Hard) |
| Extreme | Skeleton (Extreme), Orc (Extreme), Dragon (Extreme) |

## Error Handling

### Backend
- 401: Unauthorized (missing auth token)
- 403: Forbidden (user doesn't own battle)
- 404: Battle not found
- 500: Server error

### Frontend
- API errors display in BattleContainer
- Network errors handled with retry logic
- Invalid state transitions prevented

## Performance Considerations

- Phaser uses requestAnimationFrame for smooth 60 FPS
- Battle state stored in MongoDB with indexes on userId and taskId
- Aggregate stats calculated on-demand (cache if needed)
- Particle effects optional/disabled on low-end devices

## Testing

### Manual Testing Checklist
- [ ] Start battle from task detail
- [ ] Execute hero attack
- [ ] Execute monster attack
- [ ] Achieve victory and receive rewards
- [ ] Achieve defeat
- [ ] Forfeit battle
- [ ] Check battle history
- [ ] Verify battle stats
- [ ] Test with different difficulty levels
- [ ] Test on mobile (touch controls)

### Unit Tests (Recommended)
- Combat damage calculation
- Critical hit probability
- Reward multiplier logic
- Monster selection by difficulty
- XP threshold calculations

## Troubleshooting

### Battle Won't Start
- Check authentication token
- Verify task ID exists
- Check browser console for errors

### Attacks Not Registering
- Check network tab for API requests
- Verify server is running
- Check MongoDB connection

### Animations Not Playing
- Verify Phaser scene is loaded
- Check browser supports WebGL
- Verify sprite assets exist

### Rewards Not Awarded
- Check battle completion endpoint
- Verify task ID matches
- Check user progress document in MongoDB

## Future Enhancements

- [ ] Multiple battle modes (timed, survival)
- [ ] Special abilities for hero
- [ ] Loot drops and item system
- [ ] Battle difficulty modifiers
- [ ] Leaderboards
- [ ] Battle replays
- [ ] Co-op battles
- [ ] Boss battles with phases
- [ ] Achievements tied to battle stats
- [ ] Battle animations library expansion

## File Structure

```
server/
  models/
    Monster.js           # Monster configurations
    Battle.js            # Battle records
  services/
    battleService.js     # Core battle logic
  controllers/
    battleController.js  # HTTP handlers
  routes/
    battleRoutes.js      # Express routes

client/
  src/
    game/
      entities/
        BattleHero.ts    # Hero sprite
        BattleMonster.ts # Monster sprite
      scenes/
        BattleScene.ts   # Main battle scene
      types/
        battleTypes.ts   # TypeScript interfaces
    services/
      battleApi.ts       # API client
    components/
      BattleContainer.tsx    # React wrapper
      BattleContainer.css    # Styling
    hooks/
      useBattle.ts       # State management hook
```

## Support

For issues or questions:
1. Check this documentation
2. Review error messages in browser console
3. Check MongoDB logs
4. Open an issue on the repository

---

**Last Updated**: 2024
**Battle System Version**: 1.0.0
