# Kingdom Building System - Implementation Checklist

Use this checklist to verify the Building System is correctly implemented and ready for deployment.

## Pre-Deployment Verification

### Backend Setup ✓

**Models** (in `server/models/`)
- [ ] `Building.js` exists and has correct schema
- [ ] `KingdomResources.js` exists with capacity fields
- [ ] `BuildingUpgrade.js` exists with status tracking
- [ ] All models export correctly: `module.exports = mongoose.model(...)`

**Services** (in `server/services/`)
- [ ] `buildingService.js` exists
- [ ] Has 10 functions: initializeKingdom, getUserBuildings, etc.
- [ ] All functions exported with `module.exports = { ... }`
- [ ] BUILDING_CONFIG constant defined with all 5 types
- [ ] Resource calculations correct (1.5x exponential scaling)

**Controllers** (in `server/controllers/`)
- [ ] `buildingController.js` exists
- [ ] Has 10 controller methods for all endpoints
- [ ] All methods check `req.user` for authentication
- [ ] All methods return JSON with `{ success, data/error }`

**Routes** (in `server/routes/`)
- [ ] `buildingRoutes.js` exists
- [ ] All 9 routes defined and exported
- [ ] All routes use `authenticate` middleware
- [ ] Base path set correctly with `router.post(...)`, etc.

**Server Integration** (in `server/server.js`)
- [ ] Import statement: `const buildingRoutes = require("./routes/buildingRoutes.js");`
- [ ] Route registration: `app.use("/api/buildings", buildingRoutes);`
- [ ] Placed after other route registrations

**CommonJS Format Verification**
- [ ] No `import` statements in backend files (only `require`)
- [ ] No `export` statements (only `module.exports`)
- [ ] All require paths correct and relative

### Frontend Setup ✓

**Type Definitions** (in `client/src/game/types/`)
- [ ] `buildingTypes.ts` exists
- [ ] BuildingType enum with 5 types (CASTLE, MINE, FOREST, VILLAGE, ACADEMY)
- [ ] All interfaces defined: Building, KingdomResources, BuildingUpgrade, KingdomStats
- [ ] BUILDING_CONFIG constant with all 5 building configurations
- [ ] Resource constants defined: RESOURCE_TYPES, RESOURCE_COLORS, RESOURCE_ICONS

**API & Config** (in `client/src/game/api/` and `client/src/services/`)
- [ ] `config.ts` exists with API_BASE_URL
- [ ] `buildingApi.ts` exists with 9 async functions
- [ ] All functions typed with return interfaces
- [ ] All functions use `credentials: 'include'` for auth

**Components** (in `client/src/components/Building/`)
- [ ] `BuildingSystem.tsx` - main container component
- [ ] `ResourceBar.tsx` - resource display
- [ ] `BuildingInfoPanel.tsx` - building details
- [ ] `UpgradeButton.tsx` - upgrade control
- [ ] All components use TypeScript strict mode
- [ ] All components have JSDoc comments

**Custom Hook** (in `client/src/game/hooks/`)
- [ ] `useKingdomBuildings.ts` exists
- [ ] Hook has 8+ functions/actions
- [ ] Auto-refresh functionality works
- [ ] Hook exported in `index.ts`

**Styling** (in `client/src/styles/`)
- [ ] `BuildingSystem.css` - main layout
- [ ] `ResourceBar.css` - resource display
- [ ] `BuildingInfoPanel.css` - info panel
- [ ] `UpgradeButton.css` - upgrade control
- [ ] All CSS files have responsive design (@media queries)
- [ ] Color scheme consistent (dark theme)

**Page Integration** (in `client/src/pages/`)
- [ ] `Kingdom.tsx` imports BuildingSystem: `import { BuildingSystem } from '../components/Building/BuildingSystem';`
- [ ] BuildingSystem component rendered: `<BuildingSystem />`
- [ ] Component placed after KingdomOverview
- [ ] Page compiles without TypeScript errors

### Documentation ✓

- [ ] `BUILDING_SYSTEM.md` exists - comprehensive technical doc
- [ ] `BUILDING_SYSTEM_QUICKSTART.md` exists - developer/player guide
- [ ] `BUILDING_SYSTEM_SUMMARY.md` exists - overview
- [ ] `BUILDING_SYSTEM_TROUBLESHOOTING.md` exists - issue resolution
- [ ] All docs have clear sections and examples

---

## Runtime Verification

### Start Services ✓

**Step 1: Start MongoDB**
```bash
# Windows
mongod

# Or if using MongoDB Atlas, ensure MONGODB_URI is set in .env
```
- [ ] MongoDB running on default port (27017) or configured in .env
- [ ] Connection string valid in `server/config/db.js`

**Step 2: Start Backend Server**
```bash
cd server
npm install
npm run dev
```
- [ ] Server starts without errors
- [ ] Console shows: "Server running on port 5000"
- [ ] No import/require errors
- [ ] Building routes registered

**Step 3: Start Frontend Dev Server**
```bash
cd client
npm install
npm run dev
```
- [ ] Vite dev server starts
- [ ] No TypeScript compilation errors
- [ ] No console warnings about missing modules

### Browser Testing ✓

**Step 1: Navigate to Kingdom Page**
- [ ] Open browser to `http://localhost:5173/kingdom`
- [ ] Page loads without JavaScript errors
- [ ] Authenticated (logged in as test user)

**Step 2: BuildingSystem Component**
- [ ] Component renders without errors
- [ ] "⚔️ Kingdom Management" heading visible
- [ ] Loading state appears briefly then shows buildings

**Step 3: Resource Bar**
- [ ] Displays 3 resource types (gold, wood, stone)
- [ ] Shows current/max capacity
- [ ] Shows production rates per minute
- [ ] Progress bars visible with correct colors

**Step 4: Building Grid**
- [ ] At least Castle building visible
- [ ] Building cards show level and health
- [ ] Building cards clickable
- [ ] Selected building highlighted in gold

**Step 5: Building Info Panel**
- [ ] Click building → info panel appears on right
- [ ] Panel shows building name, level, health
- [ ] Panel shows production rates
- [ ] Close button (✕) works

**Step 6: Upgrade Control**
- [ ] Upgrade button visible in panel
- [ ] Shows cost for next level
- [ ] Shows upgrade duration
- [ ] Button color changes based on affordability

**Step 7: Harvest & Refresh**
- [ ] Harvest button works → resources change
- [ ] Refresh button updates data
- [ ] Auto-refresh updates every 5 seconds (check Network tab)

### API Testing ✓

**Test Authentication**
```bash
curl -X GET http://localhost:5000/api/buildings/buildings \
  -H "Authorization: Bearer YOUR_TOKEN"
```
- [ ] Returns 200 (not 401)
- [ ] Returns buildings array

**Test Endpoints** (use same auth header)
- [ ] `POST /initialize` - creates starter resources
- [ ] `GET /buildings` - returns buildings array
- [ ] `GET /resources` - returns resource inventory
- [ ] `GET /stats` - returns kingdom stats
- [ ] `POST /harvest` - harvests resources

### Database Verification ✓

**Check Collections**
```bash
mongosh
> use your_database_name
> show collections
```
- [ ] `buildings` collection exists
- [ ] `kingdomresources` collection exists
- [ ] `buildingupgrades` collection exists (after upgrade)

**Check Documents**
```bash
> db.buildings.findOne()
> db.kingdomresources.findOne()
```
- [ ] Building has correct schema (level, position, resources)
- [ ] Resources document has gold, wood, stone fields
- [ ] Timestamps present (createdAt, updatedAt)

### TypeScript Compilation ✓

**Check for Errors**
```bash
cd client
npm run build
```
- [ ] No TypeScript errors
- [ ] No compilation warnings
- [ ] Build completes successfully
- [ ] Output files created in `dist/`

**Check Linting**
```bash
npm run lint
```
- [ ] No ESLint errors in building components
- [ ] No unused imports

---

## Performance Validation

### Load Time ✓

**Measure Initial Load**
- [ ] DevTools Network tab - measure API calls
- [ ] Initial load < 2 seconds
- [ ] Resource bar renders < 1 second after load
- [ ] Building grid renders < 1.5 seconds

**Measure Auto-Refresh**
- [ ] Network tab shows requests every 5 seconds
- [ ] Each request completes in < 500ms
- [ ] No duplicate requests
- [ ] No failed requests (401, 500 errors)

### Memory Usage ✓

**Check Memory**
- [ ] DevTools Memory tab
- [ ] Component memory < 5MB
- [ ] No memory leaks (memory shouldn't grow continuously)
- [ ] Multiple refresh cycles don't increase memory

### Render Performance ✓

**Check Rendering**
- [ ] React DevTools Profiler
- [ ] Component render time < 100ms
- [ ] No unnecessary re-renders
- [ ] Building grid renders efficiently (5-10 buildings)

---

## Mobile/Responsive Testing ✓

**Mobile Breakpoints**
- [ ] DevTools Device Mode - iPhone 12
- [ ] DevTools Device Mode - iPad

**Mobile Verification**
- [ ] Resource bar stacks vertically
- [ ] Building grid is single column
- [ ] Info panel not visible (hidden on mobile)
- [ ] All buttons clickable (minimum 44px)
- [ ] No horizontal scroll

**Tablet Verification**
- [ ] Resource bar fits on screen
- [ ] Building grid has 2-3 columns
- [ ] Info panel auto-hides (readjusts)
- [ ] Text is readable (minimum 14px)

---

## Error Handling Testing ✓

**Network Errors**
- [ ] Disconnect internet → error toast appears
- [ ] Reconnect → auto-refresh works
- [ ] Error message readable and actionable

**Authentication Errors**
- [ ] Clear auth token in browser
- [ ] Try to load buildings → 401 error
- [ ] Error message appears
- [ ] Redirect to login page works

**Server Errors**
- [ ] Stop server while using app
- [ ] Harvest button → error toast appears
- [ ] Message: "Failed to harvest resources"
- [ ] App doesn't crash

**Invalid Data**
- [ ] Check API returns invalid format
- [ ] Component handles gracefully
- [ ] Error logged to console
- [ ] User sees friendly error message

---

## Feature Testing ✓

**Building Unlocking**
- [ ] Character level too low → can't unlock
- [ ] Sufficient level → can unlock
- [ ] New building appears in grid
- [ ] Locked icon shows for locked buildings

**Upgrade System**
- [ ] Insufficient resources → button disabled (gray)
- [ ] Sufficient resources → button enabled (green)
- [ ] Click upgrade → resources deducted
- [ ] Timer appears → countdown works
- [ ] On completion → level increases

**Resource Production**
- [ ] Building has production rate > 0
- [ ] Production increases over time
- [ ] Harvest collects all production
- [ ] Resources capped at max capacity

**Building Levels**
- [ ] Level 1-9 → can upgrade
- [ ] Level 10 → button says "Max Level"
- [ ] Each level increases health (visual indicator)
- [ ] Production scales with level

---

## Cross-Browser Testing ✓

**Chrome/Edge**
- [ ] All features work
- [ ] No console errors
- [ ] Styles display correctly

**Firefox**
- [ ] All features work
- [ ] No console errors
- [ ] Styles display correctly

**Safari**
- [ ] All features work
- [ ] No console errors
- [ ] Styles display correctly

---

## Final Deployment Checks

### Code Quality ✓
- [ ] No `console.log()` statements left in production code
- [ ] No `debugger;` statements
- [ ] All error handling in place
- [ ] No security issues (auth checks on all endpoints)

### Documentation ✓
- [ ] All documentation files created and complete
- [ ] Code comments explain complex logic
- [ ] JSDoc comments on all functions
- [ ] Troubleshooting guide is comprehensive

### Performance ✓
- [ ] No performance warnings in DevTools
- [ ] API response times acceptable (< 500ms)
- [ ] No memory leaks detected
- [ ] CSS files optimized (no unused styles)

### Security ✓
- [ ] All API routes require authentication
- [ ] User can only access own buildings/resources
- [ ] Input validation on server
- [ ] No sensitive data in client code

### Database ✓
- [ ] All collections have proper indexes
- [ ] Data persists across server restarts
- [ ] No duplicate documents
- [ ] Backup strategy in place

---

## Deployment Readiness

### Pre-Deployment ✓
- [ ] All checklists above completed
- [ ] All tests passing
- [ ] Code reviewed and approved
- [ ] Environment variables set correctly

### Production Setup ✓
- [ ] Server running on production port
- [ ] Database connection to production DB
- [ ] SSL/HTTPS enabled
- [ ] Rate limiting configured
- [ ] Error logging enabled

### Post-Deployment ✓
- [ ] Monitor server logs for errors
- [ ] Check database performance
- [ ] Monitor user feedback
- [ ] Have rollback plan ready

---

## Sign-Off

**Completed By**: _________________  **Date**: _________

**Tested By**: _________________  **Date**: _________

**Approved By**: _________________  **Date**: _________

### Notes:
```
[Add any special notes, known issues, or follow-up items here]




```

---

## Quick Reference

**Common Commands**
```bash
# Start services
cd server && npm run dev           # Backend
cd client && npm run dev           # Frontend

# Testing
npm run build                      # Build frontend
npm run lint                       # Lint code
curl http://localhost:5000/api/buildings/buildings  # Test API

# Database
mongosh                            # Connect to MongoDB
db.buildings.find()               # View buildings
db.buildings.deleteMany({})       # Clear data
```

**File Locations**
- Backend: `server/models/`, `server/services/`, `server/controllers/`, `server/routes/`
- Frontend: `client/src/components/Building/`, `client/src/game/`, `client/src/services/`
- Docs: `BUILDING_SYSTEM*.md` files in root
- Styles: `client/src/styles/BuildingSystem.css`, etc.

**Key Configuration**
- `BUILDING_CONFIG` - All building specs in `buildingTypes.ts`
- `API_BASE_URL` - API endpoint in `config.ts`
- `RESOURCE_COLORS` - Theme colors in `buildingTypes.ts`

---

**Status**: Ready for Deployment ✅
