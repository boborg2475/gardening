# Garden Yard Planner — Constitution

## Project Identity
- **Name:** Garden Yard Planner
- **Type:** Client-side-only Progressive Web App
- **Stack:** React 19 + TypeScript + Vite + Zustand + Dexie + HTML Canvas 2D

## Core Principles
1. **Offline-first:** The app must work fully without network connectivity.
2. **Zero backend:** All data lives in the browser (IndexedDB). No accounts, no servers.
3. **Direct manipulation:** Users interact with a visual canvas, not forms. The map IS the interface.
4. **Real-world units:** All coordinates stored in feet/meters, never pixels.
5. **Forgiveness:** Undo/redo makes experimentation safe.
6. **Simplicity:** Minimal UI chrome. The canvas dominates.

## Non-Negotiable Constraints
- No external API calls
- No image assets for icons (canvas-drawn vectors only)
- CSS Modules for styling (no CSS-in-JS runtime)
- TDD workflow: tests before implementation
- All state changes through Zustand stores

## Quality Gates
- All tests pass (`npm run test -- --run`)
- Linter clean (`npm run lint`)
- Build succeeds (`npm run build`)
- Dev server boots (`npm run dev`)
