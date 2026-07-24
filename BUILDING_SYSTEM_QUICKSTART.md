# Building System Quick Start Guide

## For Players

### Accessing the Building System
1. Navigate to the Kingdom page from the main menu
2. Scroll down to the "⚔️ Kingdom Management" section
3. View your buildings and manage resources

### Basic Actions

**Harvest Resources**
- Click the 🌾 Harvest Resources button to collect resources from all buildings
- Resources are generated based on building production rates

**Upgrade Buildings**
1. Click on any unlocked building to view details
2. An info panel appears on the right side
3. If you can afford the upgrade, click "Upgrade to Level X"
4. Wait for the upgrade to complete (timer shown in building status)

**View Building Details**
- Click any building card to see:
  - Current level and health
  - Production rates
  - Upgrade requirements and costs
  - Position in kingdom

**Monitor Resources**
- View the Resource Bar at the top showing:
  - Current/max resources (gold, wood, stone)
  - Production rates per minute
  - Capacity indicators

## For Developers

### Using the Building System in Your Code

#### 1. With the Custom Hook (Recommended)
```typescript
import { useKingdomBuildings } from '../game/hooks';

function MyComponent() {
  const {
    buildings,
    resources,
    stats,
    loading,
    error,
    harvestResources,
    startUpgrade,
    refresh
  } = useKingdomBuildings(true); // true = auto-refresh enabled

  const handleHarvest = async () => {
    const harvested = await harvestResources();
    console.log('Harvested:', harvested);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <div>Gold: {resources?.gold}</div>
      <button onClick={handleHarvest}>Harvest</button>
    </div>
  );
}
```

#### 2. Using the API Service Directly
```typescript
import buildingAPI from '../services/buildingApi';

// Get all buildings
const { buildings } = await buildingAPI.getBuildings();

// Get resources
const { resources } = await buildingAPI.getResources();

// Start an upgrade
const { upgrade } = await buildingAPI.startUpgrade(buildingId);

// Harvest resources
const { harvested } = await buildingAPI.harvestResources();

// Get kingdom stats
const { stats } = await buildingAPI.getKingdomStats();
```

#### 3. Using Components
```typescript
import { BuildingSystem } from '../components/Building/BuildingSystem';
import { ResourceBar } from '../components/Building/ResourceBar';
import { useKingdomBuildings } from '../game/hooks';

function KingdomPage() {
  return (
    <div>
      <h1>My Kingdom</h1>
      <BuildingSystem />
    </div>
  );
}
```

### Data Types

All types are defined in `buildingTypes.ts`:

```typescript
import {
  BuildingType,
  Building,
  KingdomResources,
  BuildingUpgrade,
  KingdomStats,
  BUILDING_CONFIG
} from '../game/types/buildingTypes';

// Building types
const myBuilding: Building = {
  _id: '123',
  buildingType: BuildingType.MINE,
  level: 3,
  // ... more properties
};

// Resource inventory
const resources: KingdomResources = {
  _id: '123',
  userId: 'user123',
  gold: 1000,
  wood: 500,
  stone: 250,
  // ... capacity and production
};
```

### API Endpoints Reference

All endpoints are under `/api/buildings` and require authentication:

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/initialize` | Initialize player's kingdom |
| GET | `/buildings` | Get all buildings |
| GET | `/buildings/:id` | Get single building |
| POST | `/buildings/unlock` | Unlock new building |
| POST | `/buildings/:id/upgrade` | Start upgrade |
| POST | `/buildings/upgrade/:upgradeId/complete` | Complete upgrade |
| POST | `/harvest` | Harvest resources |
| GET | `/resources` | Get resource inventory |
| GET | `/stats` | Get kingdom stats |
| POST | `/award-resources` | Award resources for task |

### Styling

Each component has its own CSS file with responsive design:
- `ResourceBar.css` - Resource display
- `BuildingInfoPanel.css` - Building details
- `UpgradeButton.css` - Upgrade control
- `BuildingSystem.css` - Main layout

Theme variables can be customized in CSS files:
- Primary color: `#ffd700` (gold)
- Accent color: `#44ff44` (green)
- Background: `#1a1a2e` (dark)

### Error Handling

All API calls include error handling:

```typescript
try {
  const result = await buildingAPI.harvestResources();
  if (result.success) {
    console.log('Harvested:', result.harvested);
  }
} catch (error) {
  console.error('Harvest failed:', error);
  toast.error(error.message);
}
```

### Performance Tips

1. **Use the Hook for Auto-Refresh**: The `useKingdomBuildings` hook automatically syncs data every 5 seconds
2. **Debounce API Calls**: Avoid calling API multiple times quickly
3. **Memoize Components**: Use `React.memo()` for frequently re-rendered building lists
4. **Optimize Renders**: Use `useCallback()` for handlers

### Common Tasks

#### Get Buildings for a Specific Type
```typescript
const goldMines = buildings.filter(b => b.buildingType === BuildingType.MINE);
```

#### Check if Player Can Afford Upgrade
```typescript
const upgradeCost = calculateUpgradeCost(building.level);
const canAfford = 
  resources.gold >= upgradeCost.gold &&
  resources.wood >= upgradeCost.wood &&
  resources.stone >= upgradeCost.stone;
```

#### Calculate Upgrade Cost
```typescript
const baseCost = BUILDING_CONFIG[building.buildingType].upgradeBaseCost;
const multiplier = 1.5 ** (building.level - 1);
const cost = {
  gold: Math.floor(baseCost.gold * multiplier),
  wood: Math.floor(baseCost.wood * multiplier),
  stone: Math.floor(baseCost.stone * multiplier),
};
```

#### Check Upgrade Status
```typescript
const isUpgrading = building.upgradingUntil && 
  new Date(building.upgradingUntil) > new Date();
```

### Debugging

Enable console logging:
```typescript
// In useKingdomBuildings hook
console.log('Buildings:', buildings);
console.log('Resources:', resources);
console.log('Error:', error);
```

Check API responses:
```typescript
const response = await buildingAPI.getBuildings();
console.log('API Response:', response);
```

Monitor network requests:
- Open Browser DevTools (F12)
- Go to Network tab
- Look for requests to `/api/buildings/*`

## Testing

### Manual Testing Checklist
- [ ] Buildings load on Kingdom page
- [ ] Resource bar displays correctly
- [ ] Harvest button works
- [ ] Building details panel opens on click
- [ ] Upgrade button shows correct cost
- [ ] Upgrade starts and displays timer
- [ ] Resources update after harvest
- [ ] Error messages display on API failures
- [ ] Responsive design works on mobile
- [ ] Auto-refresh updates buildings every 5 seconds

### Example cURL Commands
```bash
# Get buildings
curl -X GET http://localhost:5000/api/buildings/buildings \
  -H "Authorization: Bearer YOUR_TOKEN"

# Start harvest
curl -X POST http://localhost:5000/api/buildings/harvest \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get resources
curl -X GET http://localhost:5000/api/buildings/resources \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Troubleshooting

### Buildings Not Loading
- Check browser console for errors
- Verify authentication token is valid
- Check that server is running and `/api/buildings` endpoint is available
- Look at Network tab in DevTools for 401/500 errors

### Resources Not Updating
- Verify auto-refresh is enabled (5-second interval)
- Click Refresh button manually
- Check that buildings have production rates > 0
- Ensure `lastProducedAt` timestamp is being updated

### Upgrades Not Starting
- Check that player has enough resources
- Verify building level is not already at max (10)
- Ensure no upgrade is already in progress
- Check server logs for validation errors

### Styles Not Applying
- Verify CSS files are in correct location
- Check browser DevTools for CSS load errors
- Clear browser cache (Ctrl+Shift+Delete)
- Verify CSS import statements are correct

## Resources

- **Full Documentation**: See [BUILDING_SYSTEM.md](./BUILDING_SYSTEM.md)
- **Type Definitions**: [buildingTypes.ts](./client/src/game/types/buildingTypes.ts)
- **API Client**: [buildingApi.ts](./client/src/services/buildingApi.ts)
- **Component Source**: [Building components](./client/src/components/Building/)

## Support

For issues or questions:
1. Check the [BUILDING_SYSTEM.md](./BUILDING_SYSTEM.md) documentation
2. Review component JSDoc comments in source code
3. Check browser console for error messages
4. Verify all dependencies are installed (`npm install`)
