# Kingdom Building System

## Overview

The Kingdom Building System is an advanced resource management system integrated into the LifeQuest application. Players can construct, manage, and upgrade buildings to produce resources and advance their kingdom.

## Features

- **5 Building Types**: Castle, Mine, Timber Forest, Village Settlement, Academic Academy
- **Resource Production**: Gold, Wood, and Stone generated over time by buildings
- **Upgrade System**: Progressive upgrades (levels 1-10) with exponential cost scaling
- **Resource Management**: Track inventory with capacity limits
- **Real-time Updates**: Automatic data sync and harvest tracking
- **Visual Feedback**: Progress bars, status indicators, and intuitive UI

## Architecture

### Backend (Node.js/Express/MongoDB)

#### Models
- **Building**: Individual building instances with production rates, level, health
- **KingdomResources**: Player inventory and production rates
- **BuildingUpgrade**: Upgrade progress tracking and completion

#### Services
- **buildingService.js**: Core business logic (10 functions)
  - Initialize kingdom with starter resources and castle
  - Manage building unlocking based on character/district levels
  - Calculate exponential upgrade costs
  - Handle resource production and harvesting
  - Track upgrade progress with time-based completion

#### Controllers & Routes
- **buildingController.js**: HTTP endpoint handlers with auth validation
- **buildingRoutes.js**: 9 API endpoints under `/api/buildings`

### Frontend (React/TypeScript)

#### Types
- **buildingTypes.ts**: Complete TypeScript interfaces and enums
  - `BuildingType` enum (CASTLE, MINE, FOREST, VILLAGE, ACADEMY)
  - `Building` interface with all properties
  - `KingdomResources`, `BuildingUpgrade`, `KingdomStats` interfaces
  - `BUILDING_CONFIG` constant with all building configurations

#### Services
- **buildingApi.ts**: API client with 9 async functions
  - Full type safety with TypeScript interfaces
  - Error handling and credential management

#### Components
- **BuildingSystem.tsx**: Main container component
  - Manages kingdom state and data loading
  - Handles harvest, refresh, and upgrade operations
  - Auto-refresh interval (5 seconds)

- **ResourceBar.tsx**: Resource display component
  - Shows gold, wood, stone with visual progress bars
  - Displays current/max capacity and production rates

- **BuildingInfoPanel.tsx**: Building details panel
  - Shows building name, level, health, status
  - Displays production rates and position
  - Real-time upgrade timer

- **UpgradeButton.tsx**: Building upgrade control
  - Shows upgrade cost for next level
  - Enables/disables based on resource availability
  - Displays upgrade duration

#### Hooks
- **useKingdomBuildings.ts**: Custom hook for kingdom state management
  - State: buildings, resources, stats, loading, error
  - Actions: load, harvest, upgrade, unlock, refresh
  - Auto-refresh capability (configurable)

#### Styles
- **ResourceBar.css**: Resource display styling
- **BuildingInfoPanel.css**: Info panel and building details
- **UpgradeButton.css**: Upgrade control styling
- **BuildingSystem.css**: Main container and building grid layout

## API Endpoints

All endpoints require authentication via `authenticate` middleware.

### Building Management
- `POST /api/buildings/initialize` - Initialize kingdom (create starter resources and castle)
- `GET /api/buildings/buildings` - Get all buildings for user
- `GET /api/buildings/buildings/:id` - Get single building details
- `POST /api/buildings/buildings/unlock` - Unlock new building at position

### Upgrades
- `POST /api/buildings/buildings/:id/upgrade` - Start upgrade (deduct resources, create timer)
- `POST /api/buildings/buildings/upgrade/:upgradeId/complete` - Complete upgrade (increase level/production)

### Resources
- `POST /api/buildings/harvest` - Harvest resources from all buildings
- `GET /api/buildings/resources` - Get current resource inventory
- `GET /api/buildings/stats` - Get kingdom stats (buildings count, health, upgrades)
- `POST /api/buildings/award-resources` - Award resources for task completion

## Building Configuration

### Castle (Starter Building)
- **Unlock**: Level 1
- **Production**: None
- **Upgrade**: No upgrades (special building)
- **Purpose**: Kingdom headquarters

### Gold Mine
- **Unlock**: Character Level 3, District Level 2
- **Production**: 5 gold/level
- **Upgrade Duration**: 120 seconds
- **Upgrade Cost**: 500 gold, 200 wood, 300 stone (scales 1.5x per level)

### Timber Forest
- **Unlock**: Character Level 2, District Level 1
- **Production**: 8 wood/level
- **Upgrade Duration**: 90 seconds
- **Upgrade Cost**: 200 gold, 100 wood, 150 stone (scales 1.5x per level)

### Village Settlement
- **Unlock**: Character Level 5, District Level 3
- **Production**: 2 gold, 2 wood, 2 stone/level
- **Upgrade Duration**: 180 seconds
- **Upgrade Cost**: 800 gold, 500 wood, 400 stone (scales 1.5x per level)

### Academic Academy
- **Unlock**: Character Level 7, District Level 5
- **Production**: 1 gold, 1 wood, 1 stone/level
- **Upgrade Duration**: 240 seconds
- **Upgrade Cost**: 1200 gold, 600 wood, 700 stone (scales 1.5x per level)

## Game Mechanics

### Starting Resources
- Gold: 500
- Wood: 300
- Stone: 300
- Capacities: Gold 5000, Wood 3000, Stone 3000

### Upgrade Cost Scaling
```
multiplier = 1.5 ^ (currentLevel - 1)
cost = baseCost * multiplier
```

### Resource Production
Production is calculated based on:
- Building type (defines base production rate per level)
- Building level (multiplies production rate)
- Time since last harvest

### Building Levels
- Min Level: 1 (unlocked)
- Max Level: 10 (maximum upgrade)
- Health increases with level

### Task Reward Multipliers
- Easy: 1.0x
- Medium: 1.5x
- Hard: 2.0x
- Extreme: 3.0x

## Integration Points

### With Game System
The Building System integrates with:
- **Character Profile**: Level required for building unlocks
- **District System**: District levels required for building unlocks
- **Task System**: Resources awarded on task completion

### With Kingdom Page
The Building System renders as a section in the Kingdom page (`/pages/Kingdom.tsx`):
- Displays after the KingdomOverview component
- Uses same dark theme styling
- Auto-initializes on component mount

## Usage Example

### In React Component
```typescript
import { useKingdomBuildings } from './game/hooks';

const MyComponent = () => {
  const { buildings, resources, harvestResources } = useKingdomBuildings();

  const handleHarvest = async () => {
    const harvested = await harvestResources();
    console.log('Harvested:', harvested);
  };

  return (
    <div>
      <div>{resources?.gold} gold</div>
      <button onClick={handleHarvest}>Harvest</button>
    </div>
  );
};
```

### API Client
```typescript
import buildingAPI from './services/buildingApi';

// Get all buildings
const { buildings } = await buildingAPI.getBuildings();

// Start upgrade
const { upgrade } = await buildingAPI.startUpgrade(buildingId);

// Harvest resources
const { harvested } = await buildingAPI.harvestResources();
```

## Styling

All components use a cohesive dark theme matching the LifeQuest design:
- Primary colors: Gold (#FFD700), Green (#44FF44)
- Backgrounds: Dark grays (#1a1a2e, #16213e)
- Accent colors: Resource-specific (#FFD700 gold, #8B4513 wood, #808080 stone)

Responsive design adapts to:
- Desktop: Full grid layout with side panels
- Tablet: Reduced grid columns, auto-hide side panels
- Mobile: Single column layout

## Error Handling

All API calls include comprehensive error handling:
- Network errors logged to console
- User-facing errors via toast notifications
- Fallback UI states for loading and error conditions
- Graceful degradation on API failures

## Performance Considerations

- Auto-refresh interval: 5 seconds (configurable)
- Debounced API calls to prevent request flooding
- Memoized state updates to prevent unnecessary re-renders
- Efficient resource calculations using time-based math

## Future Enhancements

- Building animations (Phaser integration)
- Resource production visual effects
- Building destruction/repair mechanics
- Building specialization trees
- Cooperative multiplayer building
- Time-skip mechanics for upgrades

## Testing

Backend endpoints can be tested via:
```bash
# Initialize kingdom
curl -X POST http://localhost:5000/api/buildings/initialize

# Get buildings
curl http://localhost:5000/api/buildings/buildings

# Get resources
curl http://localhost:5000/api/buildings/resources

# Harvest
curl -X POST http://localhost:5000/api/buildings/harvest
```

Frontend components can be tested via the Kingdom page at `/kingdom` route.

## Files Created

### Backend (CommonJS)
- `server/models/Building.js`
- `server/models/KingdomResources.js`
- `server/models/BuildingUpgrade.js`
- `server/services/buildingService.js`
- `server/controllers/buildingController.js`
- `server/routes/buildingRoutes.js`

### Frontend (TypeScript/React)
- `client/src/game/types/buildingTypes.ts`
- `client/src/game/api/config.ts`
- `client/src/services/buildingApi.ts`
- `client/src/components/Building/BuildingSystem.tsx`
- `client/src/components/Building/ResourceBar.tsx`
- `client/src/components/Building/BuildingInfoPanel.tsx`
- `client/src/components/Building/UpgradeButton.tsx`
- `client/src/game/hooks/useKingdomBuildings.ts`
- `client/src/styles/ResourceBar.css`
- `client/src/styles/BuildingInfoPanel.css`
- `client/src/styles/UpgradeButton.css`
- `client/src/styles/BuildingSystem.css`

## Related Documentation

- **Phaser Integration**: See PHASER_INTEGRATION.md for game framework details
- **District System**: See existing districtController.js and districtRoutes.js
- **Character System**: See characterController.js for level management
