---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
inputDocuments: ['product-brief-gardening-2026-03-19.md', 'prd.md']
workflowType: 'architecture'
lastStep: 8
status: 'complete'
completedAt: '2026-03-22'
project_name: 'gardening'
user_name: 'Bob'
date: '2026-03-22'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**
87 functional requirements across 10 domains. The heaviest areas are Schedules & Daily Guide (15 FRs), Zone & Entity Management (14 FRs), and Property Management (12 FRs). The breadth of the drawing tools (9 FRs covering polygon drawing, bezier curves, snap, loupe, and two-stage confirmation) signals a significant rendering subsystem. Activity tracking and history management together account for 17 FRs that depend directly on the event-sourced data model.

**Non-Functional Requirements:**
20 NFRs organized into Performance (6), Data Integrity (5), Local Data Scalability (4), Integration (2), and Offline Resilience (3). The most architecturally significant are:
- NFR1/NFR2: Sub-2-second load and 60fps canvas rendering — constrains framework choice and rendering approach
- NFR7/NFR8: Zero data loss on crash with atomic IndexedDB transactions — requires careful write-ahead or transaction design in the event store
- NFR12/NFR14: 5+ years of event data (10,000+ events) without degradation, with materialized/cached computed state — rules out naive full-replay-on-load
- NFR18-20: Complete offline parity — the app must be indistinguishable online vs offline for all MVP features

**Scale & Complexity:**

- Primary domain: Client-side SPA/PWA (no backend)
- Complexity level: Medium-High
- Estimated architectural components: 6-8 major subsystems (event store, entity model, canvas renderer, map navigation, daily guide engine, schedule engine, privacy framework, data export)

### Technical Constraints & Dependencies

- **No server** — all logic, storage, and computation must run in the browser
- **IndexedDB** as the sole persistence layer — subject to browser storage quotas and cross-browser consistency quirks
- **Satellite tile provider** — the only external dependency; must degrade gracefully to manual grid drawing
- **Target hardware floor** — 8GB RAM laptops and mid-range mobile devices constrain bundle size, memory usage, and computational complexity
- **Future sync compatibility** — UUIDs and event-sourced design must be built sync-ready even though sync is post-MVP; retrofitting would be costly
- **PWA requirements** — service worker, web app manifest, offline asset caching

### Cross-Cutting Concerns Identified

- **Event sourcing** — permeates every subsystem; shapes data model, query patterns, undo, history, and future sync
- **Hierarchical inheritance** — affects entity model, schedule propagation, property cascading, and UI display of inherited vs. overridden values
- **Performance budget** — 2-second load, 60fps canvas, responsive queries on 10K+ events — drives decisions on state materialization, rendering strategy, and data access patterns
- **Entity identity (UUIDs)** — must be collision-free across devices from day one to avoid sync-breaking retrofits
- **Privacy enforcement** — architectural constraint (no outbound network from app core) rather than policy; affects how satellite tiles and future online features are integrated
- **Progressive detail model** — data schema must handle sparse entities without null-field bloat or validation friction

## Starter Template Evaluation

### Primary Technology Domain

Client-side SPA/PWA — all logic, storage, and rendering in the browser. No backend. Future expansion to desktop (Tauri) and mobile (Capacitor).

### Starter Options Considered

| Framework | Cross-Platform | Canvas Ecosystem | Event Sourcing Fit | Bundle Size | Solo Dev Fit |
|---|---|---|---|---|---|
| React | Best (React Native option) | Best (react-konva, R3F) | Redux natural fit | ~40KB+ | Most resources |
| **Svelte 5** | **Strong (Tauri + Capacitor)** | **Good (svelte-konva)** | **Runes + Dexie v4** | **~15KB** | **Gentle curve, good docs** |
| SolidJS | Adequate (Tauri + Capacitor) | Limited (manual only) | Signals + DIY | ~7KB | Thin ecosystem |
| Vue 3 | Solid (Tauri + Capacitor) | Adequate (vue-konva) | Pinia + custom | ~30KB | Good docs |

### Selected Starter: Svelte 5 + SvelteKit (SPA mode)

**Rationale for Selection:**
- Svelte + Tauri is a community-favorite combination for desktop with official templates, tiny binaries (<10MB), and Rust-based security model aligned with privacy-first architecture
- Capacitor wraps the web SPA for mobile without restructuring the codebase
- svelte-konva provides declarative Konva bindings for polygon drawing, bezier curves, hit detection, and pan/zoom — exactly what the drawing tools require
- Svelte 5 runes + Dexie.js v4 liveQuery create a reactive pipeline from IndexedDB to UI without external state management libraries
- Compiled framework with no virtual DOM — less overhead driving the canvas layer, supporting 60fps targets
- ~15KB bundle supports the 2-second load requirement on constrained hardware
- Gentlest learning curve of modern frameworks; runes avoid React hooks footguns (stale closures, dependency arrays)

**Initialization Command:**

```bash
npx sv create gardening \
  --template minimal \
  --types ts \
  --add vitest playwright prettier eslint tailwindcss sveltekit-adapter="adapter:static" \
  --install npm
```

**Architectural Decisions Provided by Starter:**

**Language & Runtime:**
TypeScript via SvelteKit's built-in TypeScript support. Strict mode. Svelte 5.x with runes enabled by default.

**Styling Solution:**
Tailwind CSS v4 via `@tailwindcss/vite` plugin. Configuration through CSS directives (not JS config file). Tailwind styles the application chrome (panels, buttons, daily guide, settings). The canvas layer is rendered via Konva and is not styled by Tailwind — project structure must reflect this separation.

**Build Tooling:**
Vite (bundled with SvelteKit). SvelteKit adapter-static for pure SPA output. Service worker via vite-plugin-pwa. Note: SvelteKit 2.x ships with Vite 6 — pin vite-plugin-pwa to v1.0.x for compatibility. Verify service worker caching on mobile Safari early, as that is the most common PWA caching failure point.

**Testing Framework:**
Vitest for unit and component tests. Playwright for E2E tests. Both included via sv CLI.

- Vitest tests the event store, entity model, schedule engine, hierarchy logic — pure TypeScript, no DOM
- Playwright tests user flows: draw a polygon, create a zone, log a harvest
- Add test hooks that expose Konva's stage state (entities, positions, layers) so Playwright can assert against the scene graph rather than screenshots
- Create `test/fixtures/` directory from day one with factory functions for test entities (properties, zones, plants, events) — reused across Vitest and Playwright

**Code Organization:**
SvelteKit file-based routing under `src/routes/`. Domain-separated component structure:

- `src/lib/ui/` — Tailwind-styled Svelte components (panels, forms, daily guide, settings)
- `src/lib/canvas/` — Konva rendering logic (map, drawing tools, zone visualization)
- `src/lib/stores/` — Svelte 5 runes-based state, materialized view layer, event store
- `src/lib/data/` — Dexie.js schema, IndexedDB persistence, entity model
- `test/fixtures/` — Shared test entity factories

**State Architecture Note:**
The app requires a materialized state layer between Dexie (IndexedDB persistence) and the canvas renderer. Dexie owns persistence; a materialized state layer owns current computed state derived from event replay; the canvas reads from the materialized layer, not from Dexie directly. This separation is critical for 60fps rendering — you cannot query IndexedDB on every frame.

**Development Experience:**
Vite HMR with Svelte hot reloading. TypeScript checking. ESLint + Prettier formatting. Playwright test runner.

**Key Packages (current versions):**

| Package | Version | Purpose |
|---|---|---|
| svelte | 5.54.x | UI framework |
| @sveltejs/kit | 2.55.x | Application framework |
| @sveltejs/adapter-static | 3.0.x | SPA/static output |
| konva + svelte-konva | 10.2.x / 1.0.x | Canvas rendering (verify Svelte 5 rune compatibility) |
| dexie | 4.3.x | IndexedDB wrapper with liveQuery |
| vite-plugin-pwa | 1.0.x | Service worker + offline caching (pin for Vite 6) |
| vitest | latest | Unit/component testing |
| playwright | latest | E2E testing |

**SPA Mode Configuration (post-scaffold):**
- Set `fallback: '200.html'` in adapter-static config
- Set `export const ssr = false` in root `+layout.ts`

**Note:** Project initialization using this command should be the first implementation story.

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
- Event store design: fine-grained events, snapshot on startup
- Entity model: separate Dexie tables per entity type
- Data validation: Zod runtime schema validation
- State architecture: three-tier (Dexie → materialized state → UI/canvas)

**Important Decisions (Shape Architecture):**
- Network boundary module for satellite tile isolation
- Map tile caching in IndexedDB for offline re-viewing
- GitHub Actions CI/CD pipeline

**Deferred Decisions (Post-MVP):**
- Sync conflict resolution strategy (Phase 2)
- LLM integration architecture (Phase 4)
- Native app data bridging via Capacitor/Tauri (Phase 5)

### Data Architecture

**Event Store:**
- Fine-grained events — one event per field change, committed individually to IndexedDB as they occur
- Event schema: discriminated TypeScript unions (e.g., `{ type: 'PlantCreated', entityId: UUID, payload: {...}, timestamp: ISO8601 }`)
- Events are immutable once committed — undo via compensating events, never mutation
- Snapshot on startup: app replays all events since last snapshot during splash screen, writes fresh snapshot, then displays the app. No reliance on close/background lifecycle events
- Safety valve: if events since last snapshot exceed a threshold (e.g., 1,000), display "Optimizing your data..." during extended replay

**Entity Model:**
- Separate Dexie tables per entity type: `properties`, `zones`, `structures`, `features`, `plants`
- Each table has type-specific schema with optional fields for progressive detail (e.g., `Plant` has `variety?: string, source?: string, cost?: number`)
- All entities share common fields: `id: UUID`, `parentId: UUID | null`, `name: string`, `geometry: Polygon | Point | null`
- Hierarchy traversal via `getAllChildren(parentId)` helper that queries all tables and merges results
- Event-to-table routing via type map: `{ plant: db.plants, zone: db.zones, ... }`
- Hierarchical inheritance (soil type, schedules) resolved at materialization time, not query time

**Data Validation:**
- Zod for runtime schema validation on all events before IndexedDB commit
- Entity metadata schemas per type with optional fields via Zod `.partial()`
- Event schemas as discriminated unions — exhaustive type checking at compile time, runtime validation at persistence boundary
- Future: validates data export/import format (Phase 2)

### Authentication & Security

**No authentication or authorization required.** No accounts, no server, no API. Privacy enforced by architecture — the app has no server to transmit data to.

**Network Boundary Module:**
- Single module at `src/lib/network/` is the only code permitted to make `fetch` calls
- Satellite tile provider integration lives exclusively in this module
- Privacy guarantee is auditable: grep for `fetch` outside `src/lib/network/` should return zero results
- All future online features (weather, plant database — Phase 3) must route through this boundary

### API & Communication Patterns

**Not applicable.** No server, no external API, no inter-service communication. Internal communication between data layer and UI is via TypeScript interfaces and Svelte 5 reactivity.

### Frontend Architecture

**State Management:**
- Three-tier architecture:
  1. **Dexie** — owns persistence (IndexedDB), append-only event writes, entity table reads
  2. **Materialized state layer** — Svelte 5 runes in `.svelte.ts` modules, rebuilt from events at startup, updated in-memory as new events commit
  3. **UI/Canvas** — reads from materialized state reactively via runes, never queries Dexie directly
- Flow: user action → create event → write to Dexie → update materialized state → UI/canvas reactively updates

**Component Communication:**
- Props down, events up for parent-child Svelte components
- Shared rune stores (`.svelte.ts` modules) for cross-component state: materialized entities, navigation context, daily guide state
- No global event bus — Svelte 5 reactivity handles cross-component updates

**Map Tile Caching:**
- Satellite tiles cached in IndexedDB after initial load during property setup
- Enables offline re-viewing of satellite trace after initial setup
- Cache managed within the network boundary module

### Infrastructure & Deployment

**Hosting:**
- Self-hosted initially — static asset bundle served by any web server (Nginx, Caddy, Apache)
- No server runtime required — output is pure static files from adapter-static
- Portable to any static host (Netlify, Vercel, GitHub Pages) if needed later

**CI/CD:**
- GitHub Actions pipeline:
  - Run Vitest (unit/component tests) on every PR
  - Run Playwright (E2E tests) on every PR
  - Build and verify static output
  - No automated deployment pipeline initially

**Environment Configuration:**
- Minimal — satellite tile provider URL/API key is the only environment variable
- All other configuration is user-managed at runtime via the privacy dashboard
- No `.env` files with secrets — tile provider key is a public API key embedded in the build

### Decision Impact Analysis

**Implementation Sequence:**
1. Project scaffold (SvelteKit + adapter-static + SPA mode)
2. Dexie schema with separate entity tables
3. Event store with Zod validation
4. Materialized state layer with snapshot/replay
5. Canvas rendering layer reading from materialized state
6. UI components reading from materialized state
7. Network boundary module + tile provider integration
8. PWA service worker configuration
9. CI/CD pipeline

**Cross-Component Dependencies:**
- Event store and entity model must be designed together — events target specific tables
- Materialized state layer depends on both event store (for replay) and entity model (for structure)
- Canvas and UI both depend on materialized state but are independent of each other
- Network boundary is isolated from all other components by design
- Zod schemas serve both event validation and entity type contracts

## Implementation Patterns & Consistency Rules

### Pattern Categories Defined

**Critical Conflict Points Identified:**
6 areas where AI agents could make different choices — naming, structure, formats, events, state management, and error handling. All resolved below.

### Naming Patterns

**Dexie Table Naming:**
- Lowercase plural: `properties`, `zones`, `structures`, `features`, `plants`, `events`, `snapshots`

**Field Naming:**
- `camelCase` everywhere — code and storage use identical naming: `parentId`, `soilType`, `plantingDate`, `sunExposure`
- No translation layer between TypeScript and IndexedDB

**Event Type Naming:**
- `PascalCase` verb+noun discriminated unions: `PlantCreated`, `ZoneDeleted`, `ScheduleUpdated`, `HarvestLogged`
- Maps directly to TypeScript union type discriminator

**File Naming:**
- TypeScript modules: `kebab-case.ts` — `event-store.ts`, `zone-manager.svelte.ts`
- Svelte components: `PascalCase.svelte` — `ZonePanel.svelte`, `DailyGuide.svelte`, `QuickCapture.svelte`
- Test files: `kebab-case.test.ts` — co-located with source file

**Variable and Function Naming:**
- Variables and functions: `camelCase` — `getZoneChildren()`, `applyEvent()`, `materializedState`
- Types and interfaces: `PascalCase` — `Plant`, `ZoneEntity`, `EventPayload`
- Constants: `UPPER_SNAKE_CASE` — `MAX_SNAPSHOT_THRESHOLD`, `DEFAULT_GRID_SCALE`
- Enums: `PascalCase` name, `PascalCase` members — `EntityType.Plant`, `Severity.High`

### Structure Patterns

**Project Organization:**
- Co-located tests: `src/lib/data/event-store.ts` → `src/lib/data/event-store.test.ts`
- Shared test factories: `test/fixtures/` — entity and event factory functions reused across Vitest and Playwright
- Playwright E2E tests: `tests/e2e/` (SvelteKit default from sv CLI)

**Component Organization (by domain, not by type):**

```
src/
  lib/
    ui/              # Tailwind-styled Svelte components
      panels/        # Side panels, detail views
      forms/         # Entity creation, activity logging
      daily-guide/   # Daily guide components
      settings/      # Privacy dashboard, preferences
      shared/        # Buttons, toasts, breadcrumbs
    canvas/          # Konva rendering logic
      map/           # Property map, zone rendering
      drawing/       # Polygon tools, snap, loupe
      navigation/    # Pan, zoom, breadcrumb trail
    stores/          # Svelte 5 rune-based state
      materialized-state.svelte.ts
      navigation-context.svelte.ts
      daily-guide-state.svelte.ts
    data/            # Persistence layer
      db.ts          # Dexie schema and table definitions
      event-store.ts # Event commit, replay, snapshot
      entities/      # Per-type entity helpers
    domain/          # Pure business logic
      hierarchy.ts   # Inheritance resolution, tree traversal
      schedules.ts   # Schedule calculation, escalation
      severity.ts    # Daily guide severity rules
    network/         # Network boundary (only fetch-allowed module)
      tile-provider.ts
      tile-cache.ts
    types/           # Shared TypeScript types
      events.ts      # Event discriminated unions
      entities.ts    # Entity type definitions
      geometry.ts    # Polygon, Point types
  routes/            # SvelteKit file-based routing
test/
  fixtures/          # Shared entity/event factories
tests/
  e2e/               # Playwright E2E tests
```

**File Placement Rules:**
- Pure TypeScript logic (no Svelte imports): `src/lib/domain/`
- Dexie and IndexedDB access: `src/lib/data/` only
- Rune-based reactive state: `src/lib/stores/` only
- Network calls: `src/lib/network/` only — no other directory may import `fetch`
- Svelte components always in `src/lib/ui/` or `src/lib/canvas/`

### Format Patterns

**Date/Time:**
- ISO 8601 strings everywhere: `2026-03-22T14:30:00.000Z`
- No Unix timestamps, no custom formats
- Sortable, human-readable, timezone-aware

**UUID:**
- `crypto.randomUUID()` — built into all target browsers, standard v4
- No external UUID library

**Null Handling:**
- `undefined` = "not provided" — user hasn't entered this field yet (progressive detail)
- `null` = "explicitly cleared" — user removed a previously set value
- This distinction is critical for hierarchical inheritance: `undefined` means "inherit from parent," `null` means "I explicitly have no value, do not inherit"
- Zod schemas use `.optional()` for fields that can be `undefined`, `.nullable().optional()` for fields that can be either

### Communication Patterns

**Event Payload Structure:**
Every event follows this standard shape:

```typescript
{
  id: UUID                    // unique event ID
  type: 'PlantCreated'        // PascalCase discriminator
  entityId: UUID              // target entity
  entityType: 'plant'         // routes to correct Dexie table
  timestamp: string           // ISO 8601
  payload: { ... }            // type-specific data
}
```

- All fields are required on every event — no optional event metadata
- `payload` structure varies by event type, defined by Zod discriminated union
- Events are validated by Zod before commit — invalid events never reach IndexedDB

**State Update Pattern:**
- Immutable updates in the materialized state layer
- New object creation on every state change: `entity = { ...entity, name: newName }`
- Svelte 5 runes track reactivity through assignment — immutable updates trigger reactive updates correctly
- Never mutate entity objects in place

### Process Patterns

**Error Handling:**

| Error Type | Action | User Feedback |
|---|---|---|
| Event validation (Zod failure) | Log to console, do not commit | Toast: "Couldn't save that change. Please try again." |
| IndexedDB write error (quota/transaction) | Log error details | Message with guidance: "Storage is full. Export your data to free space." |
| Canvas rendering error | Catch and recover, fall back to simple shape | Silent recovery — never crash the app |
| Snapshot replay error | Log, attempt full replay from event 0 | Splash screen: "Rebuilding your data..." |

- No error tracking service — no server to send errors to
- Console logging only: `console.error()` for failures, `console.warn()` for recoverable issues
- Never show raw error messages to users — always human-readable guidance

**Loading States:**
- Startup splash screen during snapshot replay — the only true loading state
- All read operations are synchronous from materialized state — no loading spinners
- IndexedDB writes are fire-and-forget from UI perspective: event committed → materialized state updated instantly → Dexie write in parallel
- No loading skeletons, no shimmer effects — the app is either on the splash screen or fully interactive

### Enforcement Guidelines

**All AI Agents MUST:**
- Use `camelCase` for all fields, variables, and functions — no `snake_case` anywhere in the codebase
- Place all network calls in `src/lib/network/` — no `fetch` imports elsewhere
- Validate every event with Zod before IndexedDB commit — no unvalidated writes
- Use immutable state updates — never mutate entity objects in the materialized state layer
- Use `undefined` for "not provided" and `null` for "explicitly cleared" — never interchange them
- Co-locate test files with source files — no mirror directory structure for unit tests
- Use `crypto.randomUUID()` for all ID generation — no external UUID libraries

**Anti-Patterns to Avoid:**
- Importing `fetch` or making network calls outside `src/lib/network/`
- Querying Dexie directly from UI or canvas components — always go through materialized state
- Using `Date.now()` or custom date formats — always ISO 8601 strings
- Mutating state objects in place instead of creating new objects
- Placing business logic in Svelte components — extract to `src/lib/domain/`
- Using `null` when `undefined` is semantically correct (field not yet provided)

## Project Structure & Boundaries

### Complete Project Directory Structure

```
gardening/
├── .github/
│   └── workflows/
│       └── ci.yml                    # Vitest + Playwright + build verification
├── src/
│   ├── app.css                       # Tailwind CSS entry point
│   ├── app.html                      # SvelteKit HTML shell
│   ├── lib/
│   │   ├── ui/                       # Tailwind-styled Svelte components
│   │   │   ├── panels/
│   │   │   │   ├── EntityDetail.svelte       # Zone/plant/structure detail view
│   │   │   │   ├── EntityDetail.test.ts
│   │   │   │   ├── SidePanel.svelte          # Collapsible side panel container
│   │   │   │   └── ZoneContents.svelte       # Zone children list (FR38)
│   │   │   ├── forms/
│   │   │   │   ├── EntityCreate.svelte       # Two-phase entity creation (FR29-30)
│   │   │   │   ├── ActivityLog.svelte        # Activity journal entry (FR43-44)
│   │   │   │   ├── QuickCapture.svelte       # FAB + classification flow (FR45-47)
│   │   │   │   ├── HarvestLog.svelte         # Harvest with optional detail (FR48)
│   │   │   │   ├── ScheduleForm.svelte       # Schedule creation/editing (FR51-53)
│   │   │   │   └── OutbreakTracker.svelte    # Cross-entity pest/disease (FR49)
│   │   │   ├── daily-guide/
│   │   │   │   ├── DailyGuide.svelte         # Main daily guide view (FR54-55)
│   │   │   │   ├── GuideItem.svelte          # Individual guide item with severity (FR56)
│   │   │   │   ├── SeverityRules.svelte      # Escalation config (FR57-58)
│   │   │   │   └── GuideGrouping.svelte      # Group by severity/zone/type (FR59)
│   │   │   ├── settings/
│   │   │   │   ├── PrivacyDashboard.svelte   # Permission toggles (FR75-80)
│   │   │   │   ├── DataExport.svelte         # Export property data (FR82-83)
│   │   │   │   └── DeletedItems.svelte       # Soft delete recovery view (FR70)
│   │   │   ├── onboarding/
│   │   │   │   ├── PropertySetup.svelte      # Guided property creation (FR84-86)
│   │   │   │   ├── FeatureDetection.svelte   # Satellite detection overlay (FR7-10)
│   │   │   │   └── FirstZonePrompt.svelte    # Optional first zone (FR86)
│   │   │   └── shared/
│   │   │       ├── Toast.svelte              # User-facing error/success messages
│   │   │       ├── Breadcrumb.svelte         # Navigation breadcrumb trail (FR37)
│   │   │       ├── SplashScreen.svelte       # Startup snapshot replay
│   │   │       └── EmptyState.svelte         # "Nothing scheduled" states (FR65)
│   │   ├── canvas/                   # Konva rendering logic
│   │   │   ├── map/
│   │   │   │   ├── PropertyMap.svelte        # Root canvas container
│   │   │   │   ├── ZoneRenderer.svelte       # Zone polygon rendering
│   │   │   │   ├── PlantRenderer.svelte      # Plant position markers
│   │   │   │   ├── StructureRenderer.svelte  # Structure shapes
│   │   │   │   ├── FeatureRenderer.svelte    # Feature shapes (trees, fences)
│   │   │   │   ├── DepthVisibility.svelte    # Two-level depth rule (FR39)
│   │   │   │   ├── ClusterBadge.svelte       # Dense area badges (FR41)
│   │   │   │   └── MiniatureIndicator.svelte # Too-small zone indicators (FR40)
│   │   │   ├── drawing/
│   │   │   │   ├── PolygonTool.svelte        # Point-to-point drawing (FR13)
│   │   │   │   ├── CurveToggle.svelte        # Straight/curve segment (FR14-15)
│   │   │   │   ├── SnapGrid.svelte           # Configurable snap-to-grid (FR16-17)
│   │   │   │   ├── MagnifierLoupe.svelte     # Place-and-drag loupe (FR18)
│   │   │   │   ├── DrawConfirmation.svelte   # Two-stage confirm (FR19)
│   │   │   │   ├── PlantPlacement.svelte     # Single/row/grid tools (FR28)
│   │   │   │   └── SatelliteTrace.svelte     # Satellite image tracing (FR3)
│   │   │   ├── navigation/
│   │   │   │   ├── PanZoom.svelte            # Pinch-to-zoom, scroll (FR20)
│   │   │   │   └── ZoneFocus.svelte          # Zone focus mode (FR42)
│   │   │   └── test-hooks.ts                 # Expose Konva stage state for Playwright
│   │   ├── stores/                   # Svelte 5 rune-based reactive state
│   │   │   ├── materialized-state.svelte.ts  # Current entity state from events
│   │   │   ├── materialized-state.test.ts
│   │   │   ├── navigation-context.svelte.ts  # Current map position, zoom, focus
│   │   │   ├── daily-guide-state.svelte.ts   # Guide items, severity, grouping
│   │   │   └── daily-guide-state.test.ts
│   │   ├── data/                     # Persistence layer
│   │   │   ├── db.ts                         # Dexie schema, table definitions
│   │   │   ├── db.test.ts
│   │   │   ├── event-store.ts                # Event commit, replay, snapshot
│   │   │   ├── event-store.test.ts
│   │   │   └── entities/
│   │   │       ├── property-helpers.ts       # Property CRUD via events
│   │   │       ├── zone-helpers.ts           # Zone CRUD + nesting
│   │   │       ├── plant-helpers.ts          # Plant CRUD + placement
│   │   │       ├── structure-helpers.ts      # Structure CRUD
│   │   │       └── feature-helpers.ts        # Feature CRUD
│   │   ├── domain/                   # Pure business logic (no Svelte imports)
│   │   │   ├── hierarchy.ts                  # Tree traversal, getAllChildren (FR22-23)
│   │   │   ├── hierarchy.test.ts
│   │   │   ├── inheritance.ts                # Property cascading + overrides (FR31-34)
│   │   │   ├── inheritance.test.ts
│   │   │   ├── schedules.ts                  # Schedule calculation, recurrence (FR51-53)
│   │   │   ├── schedules.test.ts
│   │   │   ├── severity.ts                   # Daily guide severity + escalation (FR56-58)
│   │   │   ├── severity.test.ts
│   │   │   ├── undo.ts                       # Compensating event generation (FR67)
│   │   │   ├── undo.test.ts
│   │   │   ├── soft-delete.ts                # Soft delete + restore logic (FR69-70)
│   │   │   ├── soft-delete.test.ts
│   │   │   └── export.ts                     # Data export formatting (FR82-83)
│   │   ├── network/                  # Network boundary (ONLY fetch-allowed module)
│   │   │   ├── tile-provider.ts              # Satellite tile fetching
│   │   │   └── tile-cache.ts                 # IndexedDB tile caching
│   │   └── types/                    # Shared TypeScript types
│   │       ├── events.ts                     # Event discriminated unions + Zod schemas
│   │       ├── entities.ts                   # Entity type definitions + Zod schemas
│   │       ├── geometry.ts                   # Polygon, Point, BezierSegment types
│   │       ├── schedules.ts                  # Schedule, recurrence types
│   │       └── daily-guide.ts                # Guide item, severity types
│   └── routes/                       # SvelteKit file-based routing
│       ├── +layout.ts                        # ssr = false (SPA mode)
│       ├── +layout.svelte                    # App shell, splash screen, FAB
│       ├── +page.svelte                      # Property map (main view)
│       ├── daily-guide/
│       │   └── +page.svelte                  # Daily guide view
│       ├── settings/
│       │   └── +page.svelte                  # Privacy dashboard + settings
│       └── onboarding/
│           └── +page.svelte                  # Guided setup flow
├── test/
│   └── fixtures/
│       ├── entities.ts                       # Factory functions for test entities
│       ├── events.ts                         # Factory functions for test events
│       └── properties.ts                     # Full property fixtures for E2E
├── tests/
│   └── e2e/
│       ├── property-setup.spec.ts            # Onboarding E2E (Journey 1, 2)
│       ├── daily-tracking.spec.ts            # Daily use E2E (Journey 3)
│       ├── bulk-entry.spec.ts                # Power user E2E (Journey 4)
│       ├── history-review.spec.ts            # Seasonal return E2E (Journey 5)
│       └── error-recovery.spec.ts            # Delete + restore E2E (Journey 6)
├── static/
│   ├── favicon.png
│   ├── manifest.json                         # PWA web app manifest
│   └── icons/                                # PWA app icons
├── package.json
├── svelte.config.js                          # adapter-static, fallback: '200.html'
├── vite.config.ts                            # vite-plugin-pwa config
├── tsconfig.json
├── .gitignore
├── .prettierrc
└── eslint.config.js
```

### Architectural Boundaries

**Data Flow Diagram:**

```
┌─────────────────────────────────────────────────┐
│                  UI / Canvas                     │
│        (reads from materialized state)           │
│                                                  │
│  src/lib/ui/    src/lib/canvas/    src/routes/   │
└──────────────────────┬──────────────────────────┘
                       │ reads via runes
┌──────────────────────▼──────────────────────────┐
│            Materialized State Layer              │
│         (Svelte 5 runes in .svelte.ts)           │
│                                                  │
│            src/lib/stores/                       │
└──────────┬───────────────────────┬──────────────┘
           │ rebuilt from events    │ uses pure logic
┌──────────▼──────────┐  ┌────────▼──────────────┐
│    Persistence      │  │    Domain Logic        │
│    (Dexie/IDB)      │  │    (pure TypeScript)   │
│                     │  │                        │
│  src/lib/data/      │  │  src/lib/domain/       │
└─────────────────────┘  └────────────────────────┘

┌─────────────────────────────────────────────────┐
│           Network Boundary (isolated)            │
│         src/lib/network/ — ONLY fetch user       │
└─────────────────────────────────────────────────┘
```

**Boundary Rules:**
- UI/Canvas → Materialized State: read-only via runes, write via dispatching events
- Materialized State → Data: rebuilt from event replay at startup, updated on each new event commit
- Materialized State → Domain: calls pure functions for hierarchy resolution, schedule calculation, severity computation
- Data → IndexedDB: Dexie manages all IndexedDB transactions, no raw IndexedDB access anywhere
- Network → everything else: completely isolated. No other module imports from `src/lib/network/`

### Requirements to Structure Mapping

**FR1-12 (Property Management):**
- `src/lib/ui/onboarding/` — property setup flow
- `src/lib/canvas/drawing/SatelliteTrace.svelte` — satellite tracing
- `src/lib/canvas/drawing/PolygonTool.svelte` — manual boundary drawing
- `src/lib/data/entities/property-helpers.ts` — property events
- `src/lib/ui/onboarding/FeatureDetection.svelte` — assisted detection

**FR13-21 (Drawing & Map Tools):**
- `src/lib/canvas/drawing/` — all drawing tools
- `src/lib/canvas/navigation/PanZoom.svelte` — pan/zoom

**FR22-35 (Zone & Entity Management):**
- `src/lib/data/entities/` — per-type entity event helpers
- `src/lib/domain/hierarchy.ts` — nesting, tree traversal
- `src/lib/domain/inheritance.ts` — cascading properties, overrides
- `src/lib/ui/forms/EntityCreate.svelte` — two-phase creation
- `src/lib/canvas/drawing/PlantPlacement.svelte` — row/grid tools

**FR36-42 (Map Navigation):**
- `src/lib/canvas/navigation/` — pan, zoom, zone focus
- `src/lib/canvas/map/DepthVisibility.svelte` — two-level depth rule
- `src/lib/canvas/map/ClusterBadge.svelte` — dense clusters
- `src/lib/ui/shared/Breadcrumb.svelte` — hierarchy trail

**FR43-50 (Activity Tracking):**
- `src/lib/ui/forms/` — activity log, quick capture, harvest, outbreak
- `src/lib/data/event-store.ts` — activity events committed here

**FR51-65 (Schedules & Daily Guide):**
- `src/lib/domain/schedules.ts` — schedule calculation
- `src/lib/domain/severity.ts` — severity rules, escalation
- `src/lib/stores/daily-guide-state.svelte.ts` — reactive guide state
- `src/lib/ui/daily-guide/` — all guide UI components

**FR66-74 (History & Time):**
- `src/lib/data/event-store.ts` — immutable event log, replay
- `src/lib/domain/undo.ts` — compensating event generation
- `src/lib/domain/soft-delete.ts` — soft delete + restore
- `src/lib/ui/settings/DeletedItems.svelte` — recovery view

**FR75-81 (Privacy & Settings):**
- `src/lib/ui/settings/PrivacyDashboard.svelte` — permission toggles
- `src/lib/network/` — isolated network boundary enforces privacy

**FR82-83 (Data Export):**
- `src/lib/domain/export.ts` — export formatting
- `src/lib/ui/settings/DataExport.svelte` — export UI

**FR84-87 (Onboarding):**
- `src/lib/ui/onboarding/` — guided setup flow
- `src/routes/onboarding/` — onboarding route

### Cross-Cutting Concerns Mapping

- **Event Sourcing:** `src/lib/data/event-store.ts` + `src/lib/types/events.ts` — every subsystem writes events through the same store
- **Hierarchy/Inheritance:** `src/lib/domain/hierarchy.ts` + `src/lib/domain/inheritance.ts` — used by materialized state, daily guide, and canvas
- **UUID Generation:** `crypto.randomUUID()` inline — no centralized utility needed
- **Zod Validation:** `src/lib/types/events.ts` + `src/lib/types/entities.ts` — schemas co-located with type definitions

### Data Flow

```
User Action (tap, draw, form submit)
  → Create Event object (typed, with UUID + timestamp)
  → Validate with Zod
  → Commit to Dexie events table
  → Apply to materialized state (immutable update via runes)
  → UI/Canvas reactively updates
```

## Architecture Validation Results

### Coherence Validation

**Decision Compatibility:** All technology choices are compatible. Svelte 5 + SvelteKit + Vite 6 + adapter-static form the core. svelte-konva 1.0.x is compatible with Svelte 5 and Konva 10.2.x. Dexie 4.3.x and Zod are framework-agnostic. vite-plugin-pwa pinned to v1.0.x for Vite 6 compatibility. No contradictory decisions found.

**Pattern Consistency:** camelCase used consistently from code through storage through event payloads — no translation layers. PascalCase event types align with TypeScript discriminated unions. File naming follows SvelteKit ecosystem conventions. Immutable state updates are compatible with Svelte 5 rune reactivity.

**Structure Alignment:** Architectural boundaries are properly enforced by directory structure. Data access isolated to `src/lib/data/`, network access isolated to `src/lib/network/`, domain logic isolated to `src/lib/domain/` with no framework imports. The three-tier state architecture (Dexie → materialized state → UI/canvas) is reflected in the directory layout.

### Requirements Coverage Validation

**Functional Requirements:** All 87 FRs are architecturally supported. FR72-74 (time periods) are marked deferrable per PRD — the event-sourced architecture supports adding them later without structural changes.

**Non-Functional Requirements:** All 20 NFRs are addressed. Performance targets (NFR1-6) supported by compiled Svelte output, materialized state layer, and snapshot-on-startup strategy. Data integrity targets (NFR7-11) supported by Dexie atomic transactions, individual event commits, and network boundary isolation. Scalability targets (NFR12-15) supported by snapshot/replay model and two-level depth rendering. Offline resilience (NFR18-20) supported by PWA service worker and zero network dependencies.

### Implementation Readiness Validation

**Decision Completeness:** All critical and important decisions are documented with specific versions. Implementation patterns cover naming, structure, formats, communication, and process categories. Enforcement guidelines and anti-patterns are specified.

**Structure Completeness:** Full project tree defined with every file mapped to specific functional requirements. Architectural boundaries are explicit with clear rules about what code goes where.

**Pattern Completeness:** All identified conflict points resolved. Event payload structure standardized. Null handling semantics defined for inheritance model. Error handling patterns cover all failure modes.

### Gap Analysis Results

**Critical Gaps:** None.

**Important Notes:**
- Time period features (FR72-74) are intentionally deferred — architecture supports future addition
- No CSS component library specified — Tailwind alone means building UI components from scratch. Consider evaluating shadcn-svelte or similar during implementation to accelerate UI development

**Deferred by Design:**
- Accessibility architecture (post-MVP per PRD)
- Sync/conflict resolution (Phase 2)
- LLM integration (Phase 4)
- Native platform bridging (Phase 5)

### Architecture Completeness Checklist

**Requirements Analysis**
- [x] Project context thoroughly analyzed
- [x] Scale and complexity assessed (Medium-High)
- [x] Technical constraints identified (no server, IndexedDB, target hardware)
- [x] Cross-cutting concerns mapped (event sourcing, hierarchy, performance, privacy)

**Architectural Decisions**
- [x] Critical decisions documented with versions
- [x] Technology stack fully specified (Svelte 5, SvelteKit, Konva, Dexie, Zod, Tailwind)
- [x] Data architecture defined (fine-grained events, separate tables, snapshot-on-startup)
- [x] State management defined (three-tier: Dexie → materialized state → UI/canvas)
- [x] Performance considerations addressed (materialized state, snapshot strategy, 60fps canvas)

**Implementation Patterns**
- [x] Naming conventions established (camelCase fields, PascalCase events/types, kebab-case files)
- [x] Structure patterns defined (co-located tests, domain-organized components)
- [x] Communication patterns specified (event payload structure, immutable state updates)
- [x] Process patterns documented (error handling, loading states, null semantics)

**Project Structure**
- [x] Complete directory structure defined
- [x] Component boundaries established (data, domain, stores, ui, canvas, network)
- [x] Integration points mapped (data flow diagram)
- [x] Requirements to structure mapping complete (all 87 FRs mapped)

### Architecture Readiness Assessment

**Overall Status:** READY FOR IMPLEMENTATION

**Confidence Level:** High

**Key Strengths:**
- Event-sourced architecture provides undo, history, future sync, and data integrity as emergent properties of the core design
- Three-tier state architecture cleanly separates persistence, computation, and rendering
- Network boundary module makes privacy guarantee auditable and enforceable
- Snapshot-on-startup eliminates unreliable mobile lifecycle dependencies
- Separate entity tables provide type safety at the storage layer while supporting progressive detail
- Domain logic isolated as pure TypeScript — highly testable without framework overhead

**Areas for Future Enhancement:**
- CSS component library evaluation during implementation
- Time period data model when FR72-74 are prioritized
- Accessibility architecture when post-MVP work begins
- Sync protocol design when Phase 2 is scoped

### Implementation Handoff

**AI Agent Guidelines:**
- Follow all architectural decisions exactly as documented
- Use implementation patterns consistently across all components
- Respect project structure and boundaries — especially the network isolation rule
- Refer to this document for all architectural questions
- When in doubt about where code belongs, check the Requirements to Structure Mapping

**First Implementation Priority:**

```bash
npx sv create gardening \
  --template minimal \
  --types ts \
  --add vitest playwright prettier eslint tailwindcss sveltekit-adapter="adapter:static" \
  --install npm
```

Then configure SPA mode, add Dexie + Konva + svelte-konva + vite-plugin-pwa + Zod, and build the event store with Vitest tests.
