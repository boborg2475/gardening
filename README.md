# Gardening

A privacy-first, offline-first web app for mapping and managing home gardens. Map your property, draw boundaries, create zones, and track plants — all data stays on your device.

## Getting Started

### Prerequisites

- Node.js 24.x
- npm

### Install

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
npm run preview   # preview the production build locally
```

## Testing

### Unit Tests (Vitest)

```bash
npm run test:unit
```

### End-to-End Tests (Playwright)

```bash
npx playwright install --with-deps   # first time only
npm run test:e2e
```

### Mutation Testing (Stryker)

```bash
npm run test:mutate
```

### Lint & Format

```bash
npm run lint       # check formatting and lint rules
npm run format     # auto-fix formatting
```

## Color Palette

The app uses a restrained earth-tone palette (UX-DR6) — muted sage greens, warm browns, stone grays, and parchment whites. No bright gamified colors.

| Token           | Hex       | Role                         | Swatch                                               |
| --------------- | --------- | ---------------------------- | ---------------------------------------------------- |
| `primary`       | `#6B7C5E` | Actions, active states       | ![#6B7C5E](https://placehold.co/24x24/6B7C5E/6B7C5E) |
| `primary-hover` | `#5A6B4E` | Primary hover                | ![#5A6B4E](https://placehold.co/24x24/5A6B4E/5A6B4E) |
| `accent`        | `#8B7355` | Secondary emphasis           | ![#8B7355](https://placehold.co/24x24/8B7355/8B7355) |
| `accent-hover`  | `#7A6347` | Accent hover                 | ![#7A6347](https://placehold.co/24x24/7A6347/7A6347) |
| `background`    | `#F5F1EB` | Page background (parchment)  | ![#F5F1EB](https://placehold.co/24x24/F5F1EB/F5F1EB) |
| `surface`       | `#FAF7F2` | Cards, panels                | ![#FAF7F2](https://placehold.co/24x24/FAF7F2/FAF7F2) |
| `input`         | `#FDFCFA` | Input backgrounds            | ![#FDFCFA](https://placehold.co/24x24/FDFCFA/FDFCFA) |
| `foreground`    | `#3D3631` | Primary text (warm charcoal) | ![#3D3631](https://placehold.co/24x24/3D3631/3D3631) |
| `muted`         | `#8A8278` | Secondary text, labels       | ![#8A8278](https://placehold.co/24x24/8A8278/8A8278) |
| `border`        | `#D9D3CB` | Borders, dividers            | ![#D9D3CB](https://placehold.co/24x24/D9D3CB/D9D3CB) |
| `destructive`   | `#A85C4A` | Errors (muted brick red)     | ![#A85C4A](https://placehold.co/24x24/A85C4A/A85C4A) |
| `success`       | `#7A8B5C` | Completion (soft olive)      | ![#7A8B5C](https://placehold.co/24x24/7A8B5C/7A8B5C) |

### Canvas Colors

| Token           | Hex                     | Role                         |
| --------------- | ----------------------- | ---------------------------- |
| Grid major      | `#C4BDB4`               | Major grid lines (warm gray) |
| Grid minor      | `#D9D3CB`               | Minor grid lines (light tan) |
| Drawing stroke  | `#6B7C5E`               | Drawing lines (sage green)   |
| Drawing preview | `#8FA07D`               | Preview/guide line           |
| Boundary fill   | `rgba(107,124,94,0.08)` | Completed boundary (8% sage) |

All tokens are defined in `src/app.css` via Tailwind v4 `@theme` and referenced as utilities (e.g., `bg-primary`, `text-muted`, `border-border`). Canvas-specific constants live in `src/lib/canvas/canvas-theme.ts`.

## Tech Stack

- **Svelte 5** + SvelteKit (SPA mode)
- **Tailwind CSS v4** for styling
- **Dexie** (IndexedDB) for local-only persistence
- **Konva** + svelte-konva for canvas rendering
- **Zod** for runtime schema validation
- **Playwright** for E2E testing
- **Vitest** for unit testing
- **Stryker** for mutation testing
