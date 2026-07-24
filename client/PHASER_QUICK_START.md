# Quick Start Guide - Phaser RPG Integration

## Installation & Setup

### Prerequisites
- Node.js 16+
- npm or yarn
- Existing LifeQuest project

### Step 1: Install Dependencies
```bash
cd client
npm install phaser
```

✅ **Already completed in your project**

### Step 2: File Structure Created
All necessary files have been created:

```
✅ src/game/Game.ts
✅ src/game/scenes/BootScene.ts
✅ src/game/scenes/KingdomScene.ts
✅ src/game/scenes/UIScene.ts
✅ src/game/entities/Hero.ts
✅ src/game/entities/Building.ts
✅ src/game/hooks/useGameInstance.ts
✅ src/game/hooks/useGameScene.ts
✅ src/game/hooks/index.ts
✅ src/components/GameContainer.tsx
✅ src/styles/GameContainer.css
✅ src/pages/Game.tsx
✅ App.tsx (updated with /game route)
```

### Step 3: Verify Installation
```bash
# In the client directory
npm run dev

# Navigate to http://localhost:5173/game after logging in
```

## What's Implemented

### ✅ Core Game Features
- **Phaser Game Instance**: Fully configured with React integration
- **Three Scenes**:
  - BootScene: Asset generation & loading
  - KingdomScene: Main gameplay with map and characters
  - UIScene: HUD with XP tracking and level progression
- **Hero System**: 
  - Movement (click or WASD)
  - Animations (idle, walk, celebrate)
  - XP tracking
  - Floating damage/XP text
- **Kingdom Buildings**:
  - Castle, Towers, Houses
  - Selection & upgrade system
  - Resource tracking
- **Camera System**:
  - Follow hero
  - Zoom support (mouse wheel)
  - World bounds collision

### ✅ React Integration
- Custom hooks: `useGameInstance`, `useGameScene`
- GameContainer component with loading states
- Proper lifecycle management
- Error handling

### ✅ Routing
- `/game` route added
- Protected by authentication
- Integrated into navigation

## Running the Game

### Development Mode
```bash
cd client
npm run dev
```

### In Browser
1. Login to your LifeQuest account
2. Navigate to `/game` or click game link
3. Use controls:
   - **Click**: Move hero or select building
   - **WASD**: Direct movement
   - **Scroll**: Zoom camera

## Testing Features

### Test XP System
```typescript
// In browser DevTools Console
const kingdomScene = window.game.scene.getScene('KingdomScene');
const hero = kingdomScene.getHero();
hero.gainXP(50); // Should show XP gain and celebration
```

### Test Building Selection
- Click on any building (castle, tower, house)
- Building highlights with yellow selection circle
- Building info available in scene

### Test Camera
- Move hero to edges
- Use mouse wheel to zoom in/out (0.5x - 2x)
- Camera follows hero movement

## Project Integration

### Existing Systems Connected
- ✅ Authentication (protected route)
- ✅ Character profiles (loads XP data)
- ✅ Backend API (ready for XP syncing)

### Not Modified
- ✅ Auth logic
- ✅ Dashboard
- ✅ Task system
- ✅ Character profiles
- ✅ Kingdom district system

## Placeholder Assets

All graphics are currently generated using Phaser's Graphics API:
- Hero: Blue square
- Castle: Brown rectangle with door
- Towers: Brown squares
- Houses: Brown squares
- Map: Green grid

### To Replace with Real Assets

1. **Prepare sprite files** (PNG format)
   - Place in `public/assets/hero/`, `buildings/`, etc.

2. **Update BootScene.ts**
   ```typescript
   preload(): void {
     this.load.spritesheet('hero-idle', '/assets/hero-spritesheet.png', {
       frameWidth: 32,
       frameHeight: 32,
     });
   }
   ```

3. **Update animations** in Hero.ts
   ```typescript
   anims.create({
     key: 'hero-walk',
     frames: anims.generateFrameNumbers('hero-idle', { start: 4, end: 7 }),
   });
   ```

## TypeScript Configuration

All files are fully typed:
- Game configuration interfaces
- Scene type safety
- Entity parameter types
- Event callback typing

## Backend Integration Ready

The game is ready to connect to your API:

### Example: Sync XP Gains
```typescript
// In GameContainer.tsx or Game.tsx
const onXPGained = async (xp: number) => {
  try {
    await fetch('/api/character/xp/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ xp }),
    });
  } catch (error) {
    console.error('Failed to sync XP:', error);
  }
};
```

### Recommended API Endpoints
- `POST /api/character/xp/add` - Record XP gains
- `GET /api/character/profile` - Load character data
- `POST /api/kingdom/buildings/:id/upgrade` - Upgrade buildings

## Troubleshooting

### Game shows blank screen
- Check browser console (F12)
- Verify `npm install phaser` completed
- Clear browser cache: Ctrl+Shift+Delete
- Hard refresh: Ctrl+Shift+R

### TypeScript errors in IDE
- Run `npm install` again
- Restart TypeScript server (Cmd+K Cmd+J in VS Code)
- Check Phaser types are installed

### Performance issues
- Reduce zoom to 1x
- Close browser DevTools
- Check for browser extensions blocking WebGL
- Run in Chrome/Edge (best WebGL support)

## Next Steps

### Phase 1 (Current) - Basic Game Loop ✅
- [x] Phaser setup
- [x] Scenes system
- [x] Hero movement
- [x] Buildings
- [x] XP system
- [x] React integration

### Phase 2 - Polish & Content
- [ ] Real sprite assets
- [ ] More detailed map
- [ ] NPC characters
- [ ] Quests
- [ ] Sound effects

### Phase 3 - Advanced Features
- [ ] Combat system
- [ ] Economy/trading
- [ ] Guilds
- [ ] Leaderboards
- [ ] Mobile optimization

## File Reference

### Game Logic Files
| File | Lines | Purpose |
|------|-------|---------|
| Game.ts | ~60 | Main game manager |
| BootScene.ts | ~60 | Asset loading |
| KingdomScene.ts | ~200+ | Gameplay loop |
| UIScene.ts | ~150+ | HUD system |
| Hero.ts | ~180+ | Character entity |
| Building.ts | ~150+ | Building entity |

### React Integration Files
| File | Lines | Purpose |
|------|-------|---------|
| useGameInstance.ts | ~30 | Game lifecycle hook |
| useGameScene.ts | ~30 | Scene access hook |
| GameContainer.tsx | ~60 | React wrapper |
| Game.tsx | ~30 | Route page |
| GameContainer.css | ~80 | Styling |

### Config Files
| File | Changes |
|------|---------|
| App.tsx | Added Game import & route |
| package.json | Phaser dependency added |

## Support

For issues or questions:
1. Check PHASER_INTEGRATION.md for detailed docs
2. Review Phaser docs: https://photonstorm.github.io/phaser3-docs/
3. Check TypeScript errors in console
4. Review browser console for runtime errors

---

**Status**: Ready for testing and development ✅
**Last Updated**: 2026-06-22
