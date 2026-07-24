# Building System - Troubleshooting Guide

## Common Issues & Solutions

### Building Data Not Loading

**Problem**: BuildingSystem component shows "Loading..." indefinitely or displays error

**Causes & Solutions**:

1. **Authentication Token Missing**
   - Verify user is logged in
   - Check browser DevTools → Application → Cookies for auth token
   - Look for 401 Unauthorized error in Network tab
   - **Fix**: Log out and log back in

2. **Server Not Running**
   - Check if Node.js server is running: `npm run dev` in `/server` directory
   - Verify server responds: `curl http://localhost:5000`
   - **Fix**: Start server with `npm run dev`

3. **API Endpoint Not Found**
   - Verify buildingRoutes are registered in server.js
   - Check line has: `app.use("/api/buildings", buildingRoutes);`
   - **Fix**: Restart server after fixing server.js

4. **Database Connection Failed**
   - Check MongoDB is running
   - Verify connection string in `.env`
   - Look for connection errors in server console
   - **Fix**: Start MongoDB service or verify DB_URL

**Debug Steps**:
```javascript
// In browser console
fetch('http://localhost:5000/api/buildings/buildings', {
  credentials: 'include'
}).then(r => r.json()).then(console.log)
```

---

### Resources Not Updating

**Problem**: Resource bar shows stale numbers, harvest button doesn't change amounts

**Causes & Solutions**:

1. **Auto-Refresh Not Working**
   - Open DevTools → Console
   - Check if requests appear in Network tab every 5 seconds
   - Verify `useKingdomBuildings` hook was called
   - **Fix**: Enable auto-refresh: `useKingdomBuildings(true)`

2. **BuildingSystem Not Mounted**
   - Verify BuildingSystem is in Kingdom page
   - Check React DevTools → Components → Building System exists
   - Verify no JavaScript errors in console
   - **Fix**: Re-add import in Kingdom.tsx: `import { BuildingSystem } from '../components/Building/BuildingSystem';`

3. **Backend Not Calculating Production**
   - Check building documents have `lastProducedAt` timestamp
   - Verify buildings have production rates > 0
   - Look at MongoDB: `db.buildings.findOne()`
   - **Fix**: Ensure buildings have correct resource fields

4. **API Response Format Wrong**
   - Verify API returns: `{ success: true, resources: {...} }`
   - Check response format matches buildingTypes.ts
   - Look at server response in Network tab
   - **Fix**: Restart server to load updated controller

**Debug Steps**:
```typescript
const { resources, refresh } = useKingdomBuildings();
console.log('Current resources:', resources);
await refresh();
console.log('After refresh:', resources);
```

---

### Upgrade Buttons Disabled/Grayed Out

**Problem**: Can't click upgrade even with enough resources

**Causes & Solutions**:

1. **Insufficient Resources**
   - Hover over button to see tooltip
   - Check resource bar for current amounts
   - Verify upgrade cost calculation (1.5x per level)
   - **Fix**: Harvest resources first, then try again

2. **Building Already Upgrading**
   - Check building card for "⚙️ Upgrading..." status
   - Look for `upgradingUntil` timestamp in building data
   - Wait for timer to complete
   - **Fix**: Either wait or check backend for stuck upgrade

3. **Max Level Reached**
   - Check building shows "Lvl 10 (MAX)"
   - Button should say "Max Level Reached"
   - This is expected behavior
   - **Fix**: None needed, this is working correctly

4. **Resources Not Loaded Yet**
   - BuildingSystem loading resources in background
   - Wait for "Loading..." message to disappear
   - **Fix**: Wait for component to fully load

**Debug Steps**:
```typescript
const { buildings, resources } = useKingdomBuildings();
const building = buildings[0];
const config = BUILDING_CONFIG[building.buildingType];
const multiplier = 1.5 ** (building.level - 1);
const cost = {
  gold: Math.floor(config.upgradeBaseCost.gold * multiplier),
  wood: Math.floor(config.upgradeBaseCost.wood * multiplier),
  stone: Math.floor(config.upgradeBaseCost.stone * multiplier),
};
console.log('Can afford?', 
  resources.gold >= cost.gold &&
  resources.wood >= cost.wood &&
  resources.stone >= cost.stone
);
```

---

### Upgrade Timer Not Working

**Problem**: Upgrade timer stuck or not counting down

**Causes & Solutions**:

1. **BuildingInfoPanel Not Mounted**
   - Click on a building to show panel
   - Panel should appear on right side
   - **Fix**: Check if panel disappears - may be hidden on mobile

2. **Timer Not Updating**
   - Check browser console for JavaScript errors
   - Verify setInterval is running (1-second updates)
   - **Fix**: Hard refresh browser (Ctrl+Shift+R)

3. **Wrong Upgrade Duration**
   - Different buildings have different durations
   - Mine: 120s, Forest: 90s, Village: 180s, Academy: 240s
   - **Fix**: Check BUILDING_CONFIG for expected duration

4. **Upgrade Already Complete**
   - Timer shows "Complete!" when done
   - Building level should auto-increment
   - **Fix**: Refresh page or wait for auto-refresh

**Debug Steps**:
```typescript
const building = buildings[0];
console.log('Upgrading until:', building.upgradingUntil);
console.log('Is upgrading:', 
  building.upgradingUntil && 
  new Date(building.upgradingUntil) > new Date()
);
```

---

### API Errors (401, 404, 500)

**Problem**: Network errors in DevTools when calling API

**Errors & Fixes**:

| Error | Cause | Fix |
|-------|-------|-----|
| 401 Unauthorized | Missing/expired auth token | Log in again |
| 404 Not Found | Endpoint doesn't exist | Restart server |
| 500 Internal Server Error | Server error | Check server console for error |
| CORS Error | Cross-origin request blocked | Check server CORS settings |
| Network Failed | Can't reach server | Verify server is running |

**Debug Steps**:
```javascript
// Check auth token
console.log('Auth headers:', {
  credentials: 'include'
});

// Try basic endpoint
fetch('http://localhost:5000/api/buildings/resources', {
  credentials: 'include'
})
.then(r => {
  console.log('Status:', r.status);
  return r.json();
})
.then(console.log)
.catch(console.error)
```

---

### TypeScript Errors in IDE

**Problem**: Red squiggles in VS Code, build fails

**Common Errors & Fixes**:

1. **Cannot find module 'buildingTypes'**
   - Check import path is correct
   - Should be: `from '../../game/types/buildingTypes'`
   - **Fix**: Verify file exists at that path

2. **Property does not exist on type**
   - Check interface matches backend response
   - Verify API returns all expected fields
   - **Fix**: Update types in buildingTypes.ts

3. **Type 'null' is not assignable**
   - Add null check before using value
   - Use optional chaining: `building?.level`
   - **Fix**: Add proper type guards

**Fix All TypeScript Issues**:
```bash
cd client
npm run lint  # Check for errors
tsc --noEmit  # Type check without building
```

---

### CSS Styles Not Applying

**Problem**: Building cards look unstyled, colors not showing

**Causes & Solutions**:

1. **CSS File Not Imported**
   - Check component has: `import '../../styles/BuildingSystem.css'`
   - Verify all CSS files are imported
   - **Fix**: Add missing import statements

2. **Tailwind Conflicts**
   - LifeQuest uses Tailwind CSS
   - Component CSS might be overridden
   - **Fix**: Use CSS specificity or `!important` if needed

3. **Dark Mode Not Active**
   - Building components expect dark background
   - Check app has dark theme enabled
   - **Fix**: Apply dark theme to parent container

4. **CSS File Not Found**
   - Check file exists in `client/src/styles/`
   - Verify exact filename and path
   - **Fix**: Recreate missing CSS files

**Debug Steps**:
```javascript
// In browser DevTools
// 1. Right-click element
// 2. Inspect
// 3. Check Computed Styles tab
// 4. Look for CSS file source
```

---

### Building Not Unlocking

**Problem**: "Can't unlock" error or building stays locked

**Causes & Solutions**:

1. **Character Level Too Low**
   - Check required character level in BUILDING_CONFIG
   - Verify current character level
   - **Fix**: Complete tasks to level up character

2. **District Level Too Low**
   - Check required district level in BUILDING_CONFIG
   - Look at district progress in Kingdom overview
   - **Fix**: Contribute tasks to level up districts

3. **Position Already Occupied**
   - Each map position can have one building
   - Check if another building exists at that position
   - **Fix**: Choose different position

4. **Insufficient Resources**
   - Some buildings cost resources to unlock
   - Check harvest resources first
   - **Fix**: Harvest and try again

**Example Requirements**:
```typescript
BUILDING_CONFIG[BuildingType.MINE] // Requires:
// characterLevel: 3
// districtLevel: 2

BUILDING_CONFIG[BuildingType.ACADEMY] // Requires:
// characterLevel: 7
// districtLevel: 5
```

---

### Component Not Rendering

**Problem**: BuildingSystem shows blank or nothing

**Causes & Solutions**:

1. **Component Not Imported**
   - Check Kingdom.tsx imports BuildingSystem
   - Verify correct component path
   - **Fix**: Add import at top of file

2. **Component Not Used in JSX**
   - Check Kingdom.tsx has `<BuildingSystem />`
   - Verify placement in JSX (not in comment)
   - **Fix**: Add component to return statement

3. **Conditional Rendering Hiding Component**
   - Check if conditions before rendering
   - Look for `{showBuildings && <BuildingSystem />}`
   - **Fix**: Ensure condition is true

4. **React Route Not Set Up**
   - Check Kingdom page is routable at `/kingdom`
   - Verify route is in App.tsx or router config
   - **Fix**: Add route to router configuration

**Debug Steps**:
```javascript
// In React DevTools
// 1. Go to Components tab
// 2. Search for "BuildingSystem"
// 3. Check if component appears in tree
// 4. Inspect props and state
```

---

### Database Issues

**Problem**: "Cannot read property of undefined" or data persistence issues

**Causes & Solutions**:

1. **MongoDB Collections Don't Exist**
   - Collections auto-create with first document
   - No need to create manually
   - **Fix**: Insert first building via API

2. **Data Not Persisting**
   - Check database connection in server.js
   - Verify Mongoose models are defined
   - **Fix**: Check DB_URL in .env is correct

3. **Duplicate Documents**
   - Multiple buildings created with same data
   - Check create endpoints don't have race conditions
   - **Fix**: Ensure unique indexes exist

4. **Schema Mismatch**
   - Document structure doesn't match model
   - Old documents have wrong fields
   - **Fix**: Delete old data and start fresh

**Check MongoDB**:
```javascript
// In MongoDB shell or compass
db.buildings.findOne()
db.kingdomresources.findOne()
db.buildingupgrades.findOne()

// Verify collections exist
show collections
```

---

### Performance Issues

**Problem**: Slow loading, lag when switching buildings

**Causes & Solutions**:

1. **Too Many Re-renders**
   - Check React DevTools → Profiler
   - Look for unnecessary renders
   - **Fix**: Add React.memo() to components

2. **Large Amount of Building Data**
   - More than 100 buildings per player
   - Each refresh downloads all buildings
   - **Fix**: Implement pagination or virtualization

3. **API Calls Too Frequent**
   - Auto-refresh running multiple times
   - Overlapping requests in network
   - **Fix**: Debounce API calls, increase refresh interval

4. **Large CSS Files**
   - Check combined CSS file size
   - Look for unused styles
   - **Fix**: Clean up CSS, remove duplicates

**Optimize**:
```typescript
// Reduce refresh interval
useKingdomBuildings(true); // Default 5s

// Or disable auto-refresh
const { refresh } = useKingdomBuildings(false);
// Call refresh() manually when needed
```

---

### Network Request Issues

**Problem**: API calls hang, timeout, or fail sporadically

**Causes & Solutions**:

1. **Network Timeout**
   - Server taking too long to respond
   - Database query is slow
   - **Fix**: Check server performance, add indexes

2. **Request Cancelled**
   - User navigated away while request pending
   - Component unmounted before response
   - **Fix**: Add cleanup in useEffect

3. **Too Many Concurrent Requests**
   - Browser limiting simultaneous connections
   - Multiple rapid clicks triggering requests
   - **Fix**: Debounce click handlers, limit concurrent requests

4. **Large Response Size**
   - Downloading too much data
   - Each building has lots of fields
   - **Fix**: Optimize API response size, paginate results

**Monitor Requests**:
```javascript
// In DevTools Network tab:
// 1. Filter by "XHR"
// 2. Watch for requests timing out
// 3. Check response sizes
// 4. Look for duplicate requests
```

---

## Getting Help

If you encounter an issue not listed here:

1. **Check Console Output**
   - Browser console (F12) for JavaScript errors
   - Server console (terminal) for backend errors
   - MongoDB logs for database issues

2. **Review Documentation**
   - [BUILDING_SYSTEM.md](./BUILDING_SYSTEM.md) - Technical details
   - [BUILDING_SYSTEM_QUICKSTART.md](./BUILDING_SYSTEM_QUICKSTART.md) - Usage guide
   - Inline code comments in components

3. **Inspect Network Traffic**
   - DevTools Network tab to see requests/responses
   - Check request headers for auth token
   - Verify response format matches types

4. **Enable Debug Logging**
   - Add `console.log()` statements in components
   - Check Redux/state management logs
   - Use React DevTools Profiler

5. **Verify Installation**
   - Check all dependencies installed: `npm install`
   - Verify Node.js version: `node -v`
   - Confirm MongoDB running: `mongosh`

## Contact & Support

For persistent issues:
- Review the source code comments
- Check recent git commits for changes
- Verify all files are created correctly
- Ensure database is properly initialized
