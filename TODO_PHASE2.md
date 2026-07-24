# Phase 2 - Character system checklist

- [x] Backend: add CharacterProfile collection + endpoints
  - [x] server/models/CharacterProfile.js
  - [x] server/controllers/characterController.js
  - [x] server/routes/characterRoutes.js
  - [x] wired into server/server.js under /api/character

- [x] Frontend: add Character title mapping + Character profile page
  - [x] client/src/utils/characterTitles.ts
  - [x] client/src/pages/CharacterProfile.tsx
  - [x] route wired in client/src/App.tsx as /character

- [x] Frontend: Character card component (dashboard)
  - [x] client/src/components/CharacterCard.tsx
  - [x] dashboard shows CharacterCard

- [ ] Avatar selection system (UI) complete + persisted
  - [x] Avatar selection UI in CharacterProfile.tsx
  - [x] Persist via characterAPI.selectCharacter

- [ ] XP progress visualization improvements (bar + progress percent)
- [ ] Level-up modal + animations

- [ ] Achievement display improvements (Phase 1 display exists; update layout as needed)

