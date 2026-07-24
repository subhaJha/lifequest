# Phase 1 - Implementation Checklist

- [x] Create models:
  - [x] server/models/UserProgress.js
  - [x] server/models/DailyActivity.js
  - [x] server/models/AchievementProgress.js


- [ ] Implement services:
  - [x] server/services/dailyStreak.js (UTC day + streak update)
  - [x] server/services/achievements.js (achievement definitions + unlock checks)


- [ ] Implement controller updates:
  - [x] server/controllers/taskController.js integrate:

    - [ ] upsert UserProgress
    - [ ] update DailyActivity + User.streak
    - [ ] evaluate/unlock achievements

- [ ] Add routes/endpoints:
  - [x] server/routes/progressRoutes.js
  - [x] wire into server/server.js


- [ ] Frontend integration: 
  - [x] client/src/services/api.ts add progress endpoints
  - [x] client/src/pages/Dashboard.tsx show unlocked achievements + today streak


- [x] Validation:
  - [ ] run backend tests / sanity check task completion updates persistence

