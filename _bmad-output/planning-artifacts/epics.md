---
stepsCompleted: ['step-01-validate-prerequisites', 'step-02-design-epics', 'step-03-create-stories', 'step-04-final-validation']
inputDocuments: ['prd.md', 'architecture.md', 'ux-design-specification.md']
---

# gardening - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for gardening, decomposing the requirements from the PRD, UX Design if it exists, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

- FR1: User can create a new property with a name
- FR2: User can set property dimensions (known measurements or approximate)
- FR3: User can trace property boundaries over a satellite image
- FR4: User can draw property boundaries manually on a scaled grid canvas
- FR5: User can set the grid scale for the drawing canvas (feet/meters, inches/centimeters)
- FR6: User can set north orientation on their property (optional, skippable)
- FR7: User can view assisted feature detection suggestions overlaid on the satellite image
- FR8: User can accept, adjust, or dismiss each detected feature
- FR9: User can classify detected features by entity type (structure, zone, feature)
- FR10: User can browse detected features in an interactive catalog overlay
- FR11: User can re-enter any guided setup flow after initial onboarding
- FR12: User can edit property boundaries and dimensions after creation
- FR13: User can draw polygons by placing points sequentially
- FR14: User can toggle any polygon segment between straight line and curve
- FR15: User can shape curves by dragging a midpoint handle (bezier-style)
- FR16: User can configure snap-to-grid with selectable scale (1ft, 6in, 1in, freehand)
- FR17: User can toggle snap assist to nearby edges, corners, and existing boundaries
- FR18: User can place points using place-and-drag with a magnifier loupe
- FR19: User can enable two-stage drawing confirmation (preview with draggable handles before finalizing)
- FR20: User can pan and zoom the map using pinch-to-zoom and scroll
- FR21: User can close a polygon by tapping the first point
- FR22: User can create zones within the property at any nesting depth
- FR23: User can create zones within other zones (hierarchical nesting)
- FR24: User can assign colors and labels to zones
- FR25: User can create structures (house, shed, greenhouse) on the property
- FR26: User can create features (trees, fences, water bodies, rocks, driveways) on the property
- FR27: User can place plants at precise positions within zones
- FR28: User can place plants individually (single drop) or in bulk (row tool with start/end/spacing, grid tool with area/spacing)
- FR29: User can create any entity with minimal input (name only) and optionally add detail afterward
- FR30: User can add optional detail to any entity at any time after creation
- FR31: Child zones inherit parent zone properties (soil type, sun exposure, schedules) by default
- FR32: User can override inherited properties on child zones with locally set values
- FR33: User can clear an override to restore the inherited value
- FR34: User can see which values are inherited vs. locally overridden
- FR35: Every entity in the system has a UUID assigned at creation
- FR36: User can tap a parent zone to zoom into it and reveal child zones
- FR37: User can navigate using a breadcrumb trail showing the current hierarchy path
- FR38: User can view a side panel list of zone contents
- FR39: The map displays the current level plus one level deeper (two-level depth rule)
- FR40: Zones too small to render at the current zoom level display as miniature indicators
- FR41: Dense clusters of entities merge into numbered badges that expand on tap or zoom
- FR42: User can enter zone focus mode to see a scoped view of one zone's plants, activity, tasks, and features
- FR43: User can log activities (watering, fertilizing, weeding, treating, planting, harvesting, observing) against zones or plants
- FR44: User can log activities with minimal input (activity type + entity + date) and optionally add detail
- FR45: User can use quick capture via a persistent floating action button accessible from any screen
- FR46: User can classify quick capture entries using a hierarchical category dropdown (pest → type, disease → type, harvest, observation, maintenance → type)
- FR47: Quick capture templates pre-load relevant fields based on the selected category
- FR48: User can log harvests with optional quantity, weight, and quality
- FR49: User can track pest or disease events across multiple plants and zones as a single outbreak
- FR50: User can add notes to any entity at any time
- FR51: User can create recurring schedules (watering, fertilizing, custom) on any zone or plant
- FR52: Schedules on parent zones are inherited by child zones and plants
- FR53: User can override inherited schedules on child entities
- FR54: User can opt into a configurable daily guide
- FR55: The daily guide aggregates due schedules, overdue items, and journal reminders for the current day
- FR56: Daily guide items display with a three-tier severity model (Low, Medium, High)
- FR57: Severity escalates based on configurable rules (e.g., missed watering escalates after N days)
- FR58: User can view severity escalation rules and adjust them per-zone or globally
- FR59: User can group the daily guide by severity, by zone, or by activity type
- FR60: User can mark daily guide items as done with optional detail logging
- FR61: User can attach a reminder to any journal entry ("check back in N days")
- FR62: Journal-triggered reminders appear in the daily guide with the original entry's full context
- FR63: Incomplete daily guide items prompt the user to pull forward or dismiss the next day
- FR64: User can scope the daily guide to "My Zones" or "Full Property"
- FR65: An empty daily guide displays "Nothing scheduled" with a one-time tip about schedule features
- FR66: Every change to any entity or event is stored as an immutable event in the event log
- FR67: User can undo any action via compensating events
- FR68: User can view the complete event history for any entity
- FR69: User can delete any entity (soft delete — essential data retained, recoverable)
- FR70: User can view and restore deleted entities from a deleted items recovery view
- FR71: User can move, resize, or reshape any entity without losing attached data
- FR72: User can create named time periods with start and end dates (deferrable)
- FR73: New time periods inherit the current state as a starting point (deferrable)
- FR74: User can compare two time periods side by side (deferrable)
- FR75: User can access a dedicated privacy dashboard showing all permission toggles
- FR76: User can independently toggle permissions for location, weather, and network access
- FR77: User can grant location permission and have the location stored locally for dependent features
- FR78: User can clear stored location at any time, which disables dependent features with clear messaging
- FR79: The app shows which features are available and which require additional permissions
- FR80: The app functions fully with all permissions denied — no degraded states
- FR81: No user data is transmitted to any server under any circumstances in MVP
- FR82: User can export the complete property data as a portable file
- FR83: The export file is self-contained and can be imported on another device (foundation for Phase 2 sync)
- FR84: New users are guided through property creation with a step-by-step flow
- FR85: Every onboarding step can be skipped
- FR86: User is prompted to add their first zone after property setup (optional, skippable)
- FR87: All guided flows are accessible as tools from the main app after initial onboarding

### NonFunctional Requirements

- NFR1: Page load to interactive state in under 2 seconds for any garden size, including properties with 50+ zones and years of event history
- NFR2: Drawing canvas maintains 60fps (< 16ms frame time) during polygon drawing, point placement, pan, and zoom on desktop and mobile browsers
- NFR3: Quick capture flow from button tap to submission completes in under 15 seconds of user time
- NFR4: Event log queries (entity history, daily guide aggregation, hierarchy rollup) return results without perceptible delay on datasets with thousands of events
- NFR5: Satellite image tiles load and render within 3 seconds on a standard broadband connection
- NFR6: App performs acceptably on devices with 8GB RAM and mid-range mobile processors
- NFR7: Committed events in the event log survive app crashes, browser crashes, and unexpected tab closures — zero data loss for committed writes
- NFR8: IndexedDB transactions are atomic — partial writes do not corrupt the event log or entity state
- NFR9: UUIDs are globally unique with no collisions across devices (critical foundation for Phase 2 sync)
- NFR10: Soft-deleted data remains recoverable indefinitely until the user explicitly purges it
- NFR11: No user data is transmitted over the network under any circumstances in MVP — verifiable by absence of any outbound network requests from the application core
- NFR12: The event log and entity store handle 5+ years of continuous use (estimated 10,000+ events) without degradation below performance targets
- NFR13: IndexedDB storage usage is monitored and the user is warned when approaching browser storage limits
- NFR14: Computed state (current entity values derived from event replay) is cached or materialized to avoid full event replay on every page load
- NFR15: The two-level depth visibility rule and cluster badges prevent rendering performance degradation regardless of the number of entities on the property
- NFR16: Satellite tile imagery loads from a third-party tile provider with graceful degradation if the provider is unavailable (manual grid drawing remains fully functional)
- NFR17: The app makes zero required network requests for core functionality — tile loading is the only network dependency and only during satellite-based property setup
- NFR18: All application assets are cached via service worker after first load — subsequent loads work fully offline
- NFR19: No feature displays a loading spinner, error state, or degraded mode due to lack of network connectivity
- NFR20: The app is indistinguishable in behavior between online and offline states for all MVP features except satellite tile loading

### Additional Requirements

Architecture-derived requirements that impact epic and story creation:

- **Starter Template:** Svelte 5 + SvelteKit (SPA mode) initialized via `npx sv create` with TypeScript, Vitest, Playwright, Prettier, ESLint, Tailwind CSS, and adapter-static. This MUST be Epic 1, Story 1.
- SPA mode configuration: `fallback: '200.html'` in adapter-static, `export const ssr = false` in root `+layout.ts`
- Dexie 4.3.x for IndexedDB persistence with separate tables per entity type (properties, zones, structures, features, plants, events, snapshots)
- Zod for runtime schema validation on all events before IndexedDB commit; entity metadata schemas with `.partial()` for progressive detail
- Event store with fine-grained events (one event per field change), discriminated TypeScript unions, immutable once committed
- Snapshot-on-startup strategy: replay events since last snapshot during splash screen, write fresh snapshot, then display app. Safety valve at 1,000+ events threshold.
- Three-tier state architecture: Dexie (persistence) → Materialized state layer (Svelte 5 runes in `.svelte.ts`) → UI/Canvas (reads reactively)
- Konva + svelte-konva for canvas rendering (polygon drawing, bezier curves, hit detection, pan/zoom)
- Network boundary module at `src/lib/network/` — the ONLY code permitted to make `fetch` calls. Privacy guarantee is auditable.
- Map tile caching in IndexedDB for offline re-viewing of satellite trace after initial setup
- PWA service worker via vite-plugin-pwa v1.0.x (pinned for Vite 6 compatibility). Verify service worker caching on mobile Safari early.
- GitHub Actions CI/CD: Vitest + Playwright + build verification on every PR
- Co-located tests with source files; shared test fixtures in `test/fixtures/` with factory functions for test entities
- Expose Konva stage state via test hooks so Playwright can assert against the scene graph
- Specific project directory structure with domain-separated components: `src/lib/ui/`, `src/lib/canvas/`, `src/lib/stores/`, `src/lib/data/`, `src/lib/domain/`, `src/lib/network/`, `src/lib/types/`
- Null handling semantics: `undefined` = "not provided" (inherit from parent), `null` = "explicitly cleared" (do not inherit)
- Immutable state updates throughout — never mutate entity objects in place
- `crypto.randomUUID()` for all ID generation — no external UUID library
- ISO 8601 date strings everywhere — no Unix timestamps or custom formats
- Consider evaluating shadcn-svelte or similar during implementation to accelerate UI development (no CSS component library specified in architecture)

### UX Design Requirements

- UX-DR1: Dual-context responsive optimization — desktop is drawing-optimized (property setup, satellite tracing, zone drawing, bulk plant entry, seasonal review), mobile is capture-optimized (quick capture, daily guide review, activity logging, zone-scoped task completion). All features available on both, but primary interaction polish differs by platform.
- UX-DR2: Persistent floating action button (FAB) for quick capture accessible from any screen. Smart context inference: pre-select current zone if user is viewing one, surface recent categories based on usage patterns. Zero navigation to begin capture.
- UX-DR3: Daily guide as the primary engagement surface on mobile. Immediately shows what needs attention on app open — no scanning, no navigating. Severity-based task surfacing with calm confidence tone.
- UX-DR4: Progressive detail UI pattern — optional fields available but never visible until sought. No empty form guilt, no beginner/expert modes. The interface for "tomato" and "Cherokee Purple, Baker Creek, $3.50, April 5" must be the same interface with depth determined solely by user input.
- UX-DR5: Zone navigation via tap-to-zoom with breadcrumb trail — maximum 2-3 taps from property map to any specific plant. Hierarchy must feel flat even when structurally deep.
- UX-DR6: Restrained visual language — muted earth tones, not bright gamified colors. Severity indicators use subtle differentiation, not red/yellow/green traffic lights. Interface is visually quiet so garden data stands out.
- UX-DR7: Entity history presented as narrative journal, not log table. Example: "Cherokee Purple: planted April 2, first harvest July 28, 12 harvests total, disease logged twice." The story of a plant told through its events.
- UX-DR8: Privacy dashboard visible and accessible from settings, showing transparency information ("No network requests — all data on this device"). Trust mechanism through visibility, not buried policy.
- UX-DR9: Recovery over prevention — easy reversal via soft delete and undo instead of anxious confirmation dialogs. Shift emotional experience from "afraid to make a mistake" to "bold because nothing is permanent."
- UX-DR10: "That's my yard!" satellite setup moment as hero interaction — heavy polish investment required. This is the word-of-mouth moment and the first differentiator. Manual grid drawing must feel first-class, not fallback.
- UX-DR11: Empty states with appropriate calm messaging ("Nothing scheduled for today") — no gamification, no guilt ("you haven't logged in 3 days"), no streaks or badges. Silence is a feature.
- UX-DR12: Completion micro-moments — clean visual confirmation when tasks are done (list shortens, check appears, entry saves). Quiet accomplishment, not gamified celebration.
- UX-DR13: Skip-friendly onboarding — guided property creation flow that is available but never forced. Every step skippable. All guided flows re-enterable as tools from the main app after initial onboarding.

### FR Coverage Map

| FR | Epic | Description |
|----|------|-------------|
| FR1 | Epic 1 | Create a new property with a name |
| FR2 | Epic 1 | Set property dimensions |
| FR4 | Epic 1 | Draw property boundaries manually on scaled grid |
| FR5 | Epic 1 | Set grid scale for drawing canvas |
| FR6 | Epic 1 | Set north orientation (optional) |
| FR13 | Epic 1 | Draw polygons by placing points sequentially |
| FR14 | Epic 1 | Toggle segment between straight line and curve |
| FR15 | Epic 1 | Shape curves by dragging midpoint handle |
| FR16 | Epic 1 | Configure snap-to-grid with selectable scale |
| FR17 | Epic 1 | Toggle snap assist to edges, corners, boundaries |
| FR18 | Epic 1 | Place points with magnifier loupe |
| FR19 | Epic 1 | Two-stage drawing confirmation |
| FR20 | Epic 1 | Pan and zoom with pinch-to-zoom and scroll |
| FR21 | Epic 1 | Close polygon by tapping first point |
| FR35 | Epic 1 | UUID on every entity at creation |
| FR66 | Epic 1 | Immutable event log for every change |
| FR3 | Epic 2 | Trace property boundaries over satellite image |
| FR7 | Epic 2 | View assisted feature detection suggestions |
| FR8 | Epic 2 | Accept, adjust, or dismiss detected features |
| FR9 | Epic 2 | Classify detected features by entity type |
| FR10 | Epic 2 | Browse detected features in interactive catalog |
| FR12 | Epic 2 | Edit property boundaries and dimensions after creation |
| FR22 | Epic 3 | Create zones within property at any depth |
| FR23 | Epic 3 | Create zones within other zones (nesting) |
| FR24 | Epic 3 | Assign colors and labels to zones |
| FR25 | Epic 3 | Create structures on the property |
| FR26 | Epic 3 | Create features on the property |
| FR27 | Epic 3 | Place plants at precise positions within zones |
| FR28 | Epic 3 | Place plants individually or in bulk (row/grid tools) |
| FR29 | Epic 3 | Create any entity with minimal input (name only) |
| FR30 | Epic 3 | Add optional detail to any entity at any time |
| FR31 | Epic 3 | Child zones inherit parent properties by default |
| FR32 | Epic 3 | Override inherited properties on child zones |
| FR33 | Epic 3 | Clear an override to restore inherited value |
| FR34 | Epic 3 | See which values are inherited vs overridden |
| FR36 | Epic 4 | Tap parent zone to zoom in and reveal children |
| FR37 | Epic 4 | Navigate using breadcrumb trail |
| FR38 | Epic 4 | View side panel list of zone contents |
| FR39 | Epic 4 | Two-level depth visibility rule |
| FR40 | Epic 4 | Miniature indicators for too-small zones |
| FR41 | Epic 4 | Dense cluster badges that expand on tap/zoom |
| FR42 | Epic 4 | Zone focus mode |
| FR43 | Epic 5 | Log activities against zones or plants |
| FR44 | Epic 5 | Log activities with minimal input, optional detail |
| FR45 | Epic 5 | Quick capture via persistent FAB |
| FR46 | Epic 5 | Hierarchical category classification for captures |
| FR47 | Epic 5 | Templates pre-load fields based on category |
| FR48 | Epic 5 | Log harvests with optional quantity, weight, quality |
| FR49 | Epic 5 | Track outbreaks across multiple entities |
| FR50 | Epic 5 | Add notes to any entity at any time |
| FR51 | Epic 6 | Create recurring schedules on any zone or plant |
| FR52 | Epic 6 | Schedule inheritance from parent to child zones |
| FR53 | Epic 6 | Override inherited schedules on child entities |
| FR54 | Epic 6 | Opt into configurable daily guide |
| FR55 | Epic 6 | Daily guide aggregates due and overdue items |
| FR56 | Epic 6 | Three-tier severity model (Low, Medium, High) |
| FR57 | Epic 6 | Severity escalation based on configurable rules |
| FR58 | Epic 6 | View and adjust severity escalation rules |
| FR59 | Epic 6 | Group daily guide by severity, zone, or activity type |
| FR60 | Epic 6 | Mark daily guide items done with optional detail |
| FR61 | Epic 6 | Attach reminders to journal entries |
| FR62 | Epic 6 | Journal reminders appear in daily guide with context |
| FR63 | Epic 6 | Incomplete items prompt pull-forward or dismiss |
| FR64 | Epic 6 | Scope daily guide to "My Zones" or "Full Property" |
| FR65 | Epic 6 | Empty guide shows "Nothing scheduled" with tip |
| FR67 | Epic 7 | Undo any action via compensating events |
| FR68 | Epic 7 | View complete event history for any entity |
| FR69 | Epic 7 | Soft delete any entity (recoverable) |
| FR70 | Epic 7 | View and restore deleted entities |
| FR71 | Epic 7 | Move, resize, reshape without losing data |
| FR75 | Epic 8 | Dedicated privacy dashboard with permission toggles |
| FR76 | Epic 8 | Independently toggle location, weather, network |
| FR77 | Epic 8 | Grant location permission, stored locally |
| FR78 | Epic 8 | Clear stored location, disables dependent features |
| FR79 | Epic 8 | Show which features require additional permissions |
| FR80 | Epic 8 | App functions fully with all permissions denied |
| FR81 | Epic 8 | No user data transmitted to any server in MVP |
| FR82 | Epic 8 | Export complete property data as portable file |
| FR83 | Epic 8 | Export file is self-contained and importable |
| FR11 | Epic 9 | Re-enter any guided setup flow after onboarding |
| FR84 | Epic 9 | Guided step-by-step property creation for new users |
| FR85 | Epic 9 | Every onboarding step can be skipped |
| FR86 | Epic 9 | Prompt to add first zone after property setup |
| FR87 | Epic 9 | All guided flows accessible from main app |
| FR72 | Deferred | Create named time periods (post-MVP) |
| FR73 | Deferred | Time periods inherit current state (post-MVP) |
| FR74 | Deferred | Compare two time periods side by side (post-MVP) |

## Epic List

### Epic 1: Property Creation & Drawing Canvas
User can create a property, draw boundaries on a scaled grid canvas with precision polygon tools (straight/curve segments, snap-to-grid, magnifier loupe, two-stage confirmation), and have everything persisted locally via event-sourced architecture. Establishes the canvas rendering layer, data persistence, and materialized state.
**FRs covered:** FR1, FR2, FR4, FR5, FR6, FR13-FR21, FR35, FR66

### Epic 2: Satellite Setup & Feature Detection
User can trace their property over satellite imagery and get AI-assisted feature detection suggestions — the "that's my yard!" hero moment. Includes the network boundary module for tile provider isolation and editing property boundaries after creation.
**FRs covered:** FR3, FR7, FR8, FR9, FR10, FR12

### Epic 3: Zones, Entities & Garden Population
User can create hierarchical zones, structures, features, and plants with precision placement tools (single, row, grid). Property inheritance flows down the hierarchy with overridable values. Progressive detail allows minimal or rich input on every entity.
**FRs covered:** FR22-FR34

### Epic 4: Map Navigation & Visualization
User navigates the property map efficiently with tap-to-zoom into zones, breadcrumb hierarchy trail, side panel contents list, zone focus mode, and smart visualization (two-level depth rule, miniature indicators, cluster badges).
**FRs covered:** FR36-FR42

### Epic 5: Activity Tracking & Quick Capture
User logs garden activities from anywhere in the app via the persistent floating action button with hierarchical classification. Supports harvest logging with optional detail, outbreak tracking across entities, and notes on any entity.
**FRs covered:** FR43-FR50

### Epic 6: Schedules & Daily Guide
User creates recurring schedules with zone-to-child inheritance, gets a configurable daily guide with three-tier severity model, escalation rules, grouping options, journal-triggered reminders, and day-over-day rollover.
**FRs covered:** FR51-FR65

### Epic 7: History, Undo & Recovery
User views complete event history for any entity as a narrative timeline, undoes any action via compensating events, soft deletes entities with full recovery from a dedicated view, and moves or reshapes entities without losing attached data.
**FRs covered:** FR67-FR71

### Epic 8: Privacy, Settings & Data Export
User manages privacy permissions via a dedicated dashboard with independent toggles, controls location storage, sees which features require permissions, and exports complete property data as a self-contained portable file.
**FRs covered:** FR75-FR83

### Epic 9: Onboarding & PWA
New users get a guided, skip-friendly property creation flow with optional first-zone prompt. All guided flows are re-enterable from the main app. App installs as PWA with full offline capability via service worker.
**FRs covered:** FR11, FR84-FR87

**Deferred from MVP:** FR72-FR74 (time periods, period inheritance, period comparison)

## Epic 1: Property Creation & Drawing Canvas

User can create a property, draw boundaries on a scaled grid canvas with precision polygon tools (straight/curve segments, snap-to-grid, magnifier loupe, two-stage confirmation), and have everything persisted locally via event-sourced architecture. Establishes the canvas rendering layer, data persistence, and materialized state.

### Story 1.1: Project Scaffold & Core Architecture

As a developer,
I want a fully configured SvelteKit project with all required dependencies and project structure,
So that I have a solid foundation to build every feature upon.

**Acceptance Criteria:**

**Given** no existing project
**When** the scaffold command is run (`npx sv create gardening --template minimal --types ts --add vitest playwright prettier eslint tailwindcss sveltekit-adapter="adapter:static" --install npm`)
**Then** a SvelteKit project is created with TypeScript, Vitest, Playwright, Prettier, ESLint, Tailwind CSS, and adapter-static
**And** SPA mode is configured: `fallback: '200.html'` in adapter-static config, `export const ssr = false` in root `+layout.ts`

**Given** the scaffolded project
**When** additional dependencies are installed (Dexie 4.3.x, Konva, svelte-konva, Zod, vite-plugin-pwa 1.0.x)
**Then** all packages are added to `package.json` and install successfully

**Given** the project with all dependencies
**When** the directory structure is created
**Then** the following directories exist: `src/lib/ui/`, `src/lib/canvas/`, `src/lib/stores/`, `src/lib/data/`, `src/lib/domain/`, `src/lib/network/`, `src/lib/types/`, `test/fixtures/`, `tests/e2e/`

**Given** the complete project structure
**When** `npm run dev` is executed
**Then** the app loads in the browser and displays a placeholder page

**Given** the project repository
**When** a GitHub Actions CI workflow is configured at `.github/workflows/ci.yml`
**Then** the pipeline runs Vitest, Playwright, and build verification on every PR

### Story 1.2: Event Store & Property Data Model

As a developer,
I want an event-sourced data layer with Zod-validated events, Dexie persistence, and materialized state,
So that all future features can persist and query data reliably with zero data loss.

**Acceptance Criteria:**

**Given** the Dexie database schema
**When** the database is initialized
**Then** tables exist for `properties`, `events`, and `snapshots` with correct indexes
**And** the `properties` table has fields: `id` (UUID), `name` (string), `dimensions` (optional), `geometry` (optional), `northOrientation` (optional)

**Given** a valid event object (e.g., `PropertyCreated`)
**When** the event is committed to the event store
**Then** it is validated by Zod before write, assigned a UUID and ISO 8601 timestamp, and persisted atomically to the `events` table in IndexedDB

**Given** an invalid event object (e.g., missing required fields)
**When** the event is committed to the event store
**Then** the Zod validation fails, the event is NOT written to IndexedDB, and an error is logged to the console

**Given** events exist in the event store
**When** the materialized state layer replays events at startup
**Then** the current state of all properties is computed correctly from the event history
**And** a snapshot is written for future fast startup

**Given** a snapshot exists from a previous session
**When** the app starts
**Then** only events since the last snapshot are replayed
**And** a splash screen is displayed during replay

**Given** more than 1,000 events since the last snapshot
**When** the app starts
**Then** a "Optimizing your data..." message is displayed during extended replay

**Given** the materialized state layer
**When** a new event is committed
**Then** the materialized state updates in-memory immediately via immutable update (new object creation, not mutation)
**And** Svelte 5 runes trigger reactive UI updates

### Story 1.3: Property Creation

As a gardener,
I want to create a new property with a name and optional dimensions,
So that I have a named space to represent my garden.

**Acceptance Criteria:**

**Given** the app is loaded with no existing property
**When** the user enters a property name and submits the creation form
**Then** a new property is created with a UUID, the name is displayed, and a `PropertyCreated` event is committed to the event store

**Given** the property creation form
**When** the user enters a name only and skips dimensions
**Then** the property is created successfully with `undefined` dimensions (progressive detail — no validation error)

**Given** the property creation form
**When** the user enters a name and dimensions (width, length, unit)
**Then** the property is created with dimensions stored and the grid canvas can use them for scale

**Given** a property was created in a previous session
**When** the app is reloaded
**Then** the property is restored from the event store via snapshot/replay and displayed correctly

### Story 1.4: Canvas Foundation with Pan & Zoom

As a gardener,
I want to see a scaled grid canvas for my property and navigate it with pan and zoom,
So that I have a visual workspace to draw my property boundaries.

**Acceptance Criteria:**

**Given** a property exists
**When** the canvas view loads
**Then** a Konva stage renders a scaled grid based on the property dimensions (or a default size if no dimensions set)
**And** grid lines are visible with configurable scale (FR5: feet/meters, inches/centimeters)

**Given** the canvas is displayed on desktop
**When** the user scrolls the mouse wheel
**Then** the canvas zooms in or out smoothly centered on the cursor position

**Given** the canvas is displayed on mobile
**When** the user pinch-to-zooms
**Then** the canvas zooms smoothly centered between the two touch points
**And** the interaction maintains 60fps (< 16ms frame time)

**Given** the canvas is displayed
**When** the user clicks/touches and drags
**Then** the canvas pans in the direction of the drag

**Given** the canvas with grid
**When** the user changes the grid scale setting
**Then** the grid updates to reflect the new scale (e.g., switching from 1ft to 6in spacing)

**Given** the Konva stage
**When** Playwright tests run
**Then** test hooks expose the stage state (entities, positions, layers) for assertions against the scene graph

### Story 1.5: Polygon Drawing Tool

As a gardener,
I want to draw polygon shapes on the canvas by placing points,
So that I can outline boundaries and areas in my garden.

**Acceptance Criteria:**

**Given** the drawing mode is active
**When** the user taps/clicks on the canvas
**Then** a point is placed at that position and a visual marker appears

**Given** two or more points have been placed
**When** the user places additional points
**Then** line segments connect the points in sequence, forming an open polygon outline

**Given** three or more points have been placed
**When** the user taps/clicks the first point
**Then** the polygon closes, connecting the last point back to the first
**And** the completed polygon is rendered as a filled shape with a visible border

**Given** the user is drawing a polygon
**When** the polygon is in progress (not yet closed)
**Then** a preview line follows the cursor/touch from the last placed point to the current position

**Given** a completed polygon
**When** it is finalized
**Then** a polygon event is committed to the event store with the point coordinates

### Story 1.6: Drawing Precision Tools

As a gardener,
I want precision aids like curves, snap-to-grid, edge snapping, a magnifier loupe, and drawing confirmation,
So that I can draw accurate boundaries that match my actual property layout.

**Acceptance Criteria:**

**Given** a polygon segment exists between two points
**When** the user toggles the segment to curve mode (FR14)
**Then** the straight segment becomes a bezier curve with a draggable midpoint control handle

**Given** a curved segment
**When** the user drags the midpoint handle (FR15)
**Then** the curve reshapes in real-time following the handle position
**And** the canvas maintains 60fps during the interaction

**Given** the snap-to-grid option is enabled
**When** the user places a point near a grid intersection (FR16)
**Then** the point snaps to the nearest grid intersection based on the selected snap scale (1ft, 6in, 1in, or freehand)

**Given** snap assist is enabled and existing shapes are on the canvas
**When** the user places a point near an existing edge, corner, or boundary (FR17)
**Then** the point snaps to the nearest edge, corner, or boundary with a visual indicator showing the snap target

**Given** the loupe tool is active
**When** the user touches and holds the canvas (FR18)
**Then** a magnified view appears above the touch point, allowing precise point placement via drag

**Given** two-stage confirmation is enabled
**When** the user completes a polygon (FR19)
**Then** the polygon enters preview mode with draggable handles on each point
**And** the user must confirm or cancel before the polygon is finalized

**Given** two-stage confirmation preview mode
**When** the user drags a handle to adjust a point
**Then** the polygon shape updates in real-time reflecting the adjustment

### Story 1.7: Property Boundary Drawing on Grid

As a gardener,
I want to draw my property boundary on the scaled grid canvas and optionally set north orientation,
So that I have a visual representation of my actual property as the foundation for my garden map.

**Acceptance Criteria:**

**Given** a property exists without a boundary
**When** the user activates the property boundary drawing mode
**Then** the polygon drawing tool is available on the scaled grid canvas with all precision tools (snap, curves, loupe, confirmation)

**Given** the user has completed a polygon on the grid canvas
**When** the polygon is finalized as the property boundary (FR4)
**Then** the boundary is saved to the property entity via a `PropertyBoundarySet` event
**And** the property's geometry is updated in the materialized state

**Given** a property boundary has been drawn
**When** the user views the property
**Then** the boundary polygon is rendered on the canvas with a distinct visual style (fill color, border)

**Given** the property setup flow
**When** the user is offered the north orientation option (FR6)
**Then** they can set north direction by rotating an indicator or selecting from a compass
**And** they can skip this step entirely (orientation remains `undefined`)

**Given** a north orientation has been set
**When** the property map is displayed
**Then** a north indicator is visible on the canvas reflecting the configured orientation

**Given** a property with a boundary
**When** the app is reloaded
**Then** the property boundary is restored from events and rendered correctly on the canvas

## Epic 2: Satellite Setup & Feature Detection

User can trace their property over satellite imagery and get AI-assisted feature detection suggestions — the "that's my yard!" hero moment. Includes the network boundary module for tile provider isolation and editing property boundaries after creation.

### Story 2.1: Network Boundary Module & Tile Provider

As a developer,
I want an isolated network module that handles all satellite tile fetching and caching,
So that the privacy guarantee is enforceable and satellite imagery is available offline after initial load.

**Acceptance Criteria:**

**Given** the project structure
**When** the network boundary module is created at `src/lib/network/`
**Then** it contains `tile-provider.ts` and `tile-cache.ts` as the ONLY files in the codebase permitted to use `fetch`
**And** no other module in the codebase imports `fetch` or makes network requests

**Given** valid coordinates or an address
**When** the tile provider fetches satellite imagery
**Then** tiles load from the configured third-party provider and render within 3 seconds on standard broadband (NFR5)

**Given** satellite tiles have been loaded
**When** the tiles are fetched successfully
**Then** they are cached in IndexedDB via `tile-cache.ts` for offline re-viewing

**Given** cached tiles exist in IndexedDB
**When** the user views the satellite view offline
**Then** previously loaded tiles render from cache without network requests

**Given** the tile provider is unavailable (network error, service down)
**When** the user attempts satellite-based setup
**Then** a clear message explains that satellite view is unavailable and offers the manual grid drawing as a full alternative (NFR16)

### Story 2.2: Satellite Image Tracing

As a gardener,
I want to see my property from satellite view and trace my boundary over the real imagery,
So that my garden map matches my actual property — the "that's my yard!" moment.

**Acceptance Criteria:**

**Given** the user chooses satellite-based property setup
**When** they enter an address or coordinates
**Then** satellite tiles load and display the area centered on that location

**Given** satellite imagery is displayed
**When** the user activates the boundary tracing tool (FR3)
**Then** the polygon drawing tool overlays the satellite image with all precision tools available (snap, curves, loupe, confirmation from Epic 1)

**Given** the user has traced a boundary over the satellite image
**When** the polygon is finalized
**Then** the boundary is saved as the property geometry via a `PropertyBoundarySet` event
**And** the satellite imagery remains visible beneath the boundary outline

**Given** a satellite-traced property boundary
**When** the user views the property map
**Then** the boundary is rendered over the cached satellite tiles
**And** the visual style clearly distinguishes the property boundary from the satellite imagery

### Story 2.3: Assisted Feature Detection

As a gardener,
I want the app to suggest features it detects on the satellite image so I can quickly identify my house, shed, and other structures,
So that I save time during property setup and get an accurate starting map.

**Acceptance Criteria:**

**Given** a satellite image is loaded for the property
**When** feature detection runs (FR7)
**Then** detected features are highlighted as overlay suggestions on the satellite image with distinct visual indicators

**Given** detected features are displayed
**When** the user reviews a detected feature (FR8)
**Then** they can accept it (adds to property), adjust its boundary (edit the polygon), or dismiss it (removes suggestion)

**Given** the user accepts a detected feature
**When** they confirm the feature (FR9)
**Then** they are prompted to classify it by entity type: structure (house, shed, greenhouse), zone, or feature (tree, fence, driveway)
**And** the classified entity is created with a UUID and persisted via the event store

**Given** the user dismisses a detected feature
**When** the dismissal is confirmed
**Then** the suggestion overlay is removed and does not reappear

**Given** the user adjusts a detected feature
**When** they modify the boundary polygon
**Then** the adjusted boundary replaces the original detection and proceeds to classification

### Story 2.4: Feature Detection Catalog

As a gardener,
I want to browse all detected features in an organized catalog,
So that I can review and process them systematically rather than hunting across the satellite image.

**Acceptance Criteria:**

**Given** feature detection has identified multiple features
**When** the user opens the feature detection catalog (FR10)
**Then** an interactive overlay panel lists all detected features with thumbnail previews and suggested types

**Given** the catalog is displayed
**When** the user selects a feature in the catalog
**Then** the map pans to center on that feature and highlights it

**Given** the catalog is displayed
**When** the user accepts, adjusts, or dismisses a feature from the catalog
**Then** the catalog updates to reflect the action (accepted features show as classified, dismissed features are removed)

**Given** all detected features have been processed
**When** the user views the catalog
**Then** it shows a summary of accepted vs dismissed features and a clear indication that detection review is complete

### Story 2.5: Edit Property Boundaries After Creation

As a gardener,
I want to edit my property boundaries and dimensions after initial setup,
So that I can refine my map as I learn the exact measurements or make changes to my property.

**Acceptance Criteria:**

**Given** a property with an existing boundary
**When** the user activates boundary editing mode (FR12)
**Then** the boundary polygon becomes editable with draggable handles on each vertex
**And** all precision tools are available (snap, curves, loupe)

**Given** the user is editing a boundary
**When** they move a vertex, add a new point, or remove an existing point
**Then** the polygon updates in real-time on the canvas

**Given** the user has modified the boundary
**When** they confirm the changes
**Then** a `PropertyBoundaryUpdated` event is committed with the new geometry
**And** the materialized state reflects the updated boundary

**Given** a property with dimensions
**When** the user edits the dimensions (width, length, unit)
**Then** a `PropertyDimensionsUpdated` event is committed
**And** the grid canvas scale adjusts to match the new dimensions

**Given** the user is editing a boundary
**When** they cancel the edit
**Then** the boundary reverts to its previous state with no events committed

## Epic 3: Zones, Entities & Garden Population

User can create hierarchical zones, structures, features, and plants with precision placement tools (single, row, grid). Property inheritance flows down the hierarchy with overridable values. Progressive detail allows minimal or rich input on every entity.

### Story 3.1: Zone Creation & Nesting

As a gardener,
I want to create zones within my property and nest zones within other zones,
So that I can organize my garden into logical areas like beds, rows, and sections.

**Acceptance Criteria:**

**Given** a property exists with a boundary
**When** the user creates a new zone (FR22)
**Then** they can draw a polygon on the canvas within the property boundary using the drawing tools
**And** the zone is created with a UUID, name, and geometry via a `ZoneCreated` event

**Given** an existing zone
**When** the user creates a zone within it (FR23)
**Then** the child zone is created with `parentId` referencing the parent zone
**And** the child zone renders visually inside the parent zone on the canvas

**Given** a zone at any nesting depth
**When** the user creates another zone within it
**Then** the nesting works at arbitrary depth — zones within zones within zones

**Given** the zone creation form
**When** the user assigns a color and label to a zone (FR24)
**Then** the zone renders on the canvas with the chosen color fill and label text
**And** a `ZoneUpdated` event records the color and label

**Given** a zone was created with only a name (no color, no label detail)
**When** the zone is displayed on the canvas
**Then** it renders with a default color and the name as its label

### Story 3.2: Structures & Features

As a gardener,
I want to add structures like my house and shed, and features like trees and fences, to my property map,
So that my garden map reflects all the physical elements of my yard.

**Acceptance Criteria:**

**Given** a property exists
**When** the user creates a structure (FR25)
**Then** they can draw or place a shape on the canvas, name it (e.g., "House", "Shed", "Greenhouse"), and it is persisted via a `StructureCreated` event with a UUID

**Given** a property exists
**When** the user creates a feature (FR26)
**Then** they can draw or place a shape on the canvas, name it (e.g., "Oak Tree", "Fence", "Pond"), and it is persisted via a `FeatureCreated` event with a UUID

**Given** structures and features on the canvas
**When** the property map is displayed
**Then** structures and features render with visually distinct styles (different from zones and plants)

**Given** a structure or feature
**When** it was created with only a name
**Then** it displays correctly — no required fields beyond name and placement

### Story 3.3: Entity Creation with Progressive Detail

As a gardener,
I want to create any entity with just a name and add detail later when I'm ready,
So that I can quickly populate my garden map without being slowed down by forms.

**Acceptance Criteria:**

**Given** any entity creation flow (zone, structure, feature, plant)
**When** the user enters only a name and confirms (FR29)
**Then** the entity is created successfully with all optional fields as `undefined`
**And** no validation errors are shown for missing optional fields

**Given** an existing entity with minimal detail
**When** the user opens its detail view and adds information (e.g., soil type, sun exposure, variety, source, cost) (FR30)
**Then** each addition is persisted as an individual event (e.g., `PlantUpdated` with the specific field change)
**And** the materialized state reflects the new detail immediately

**Given** an entity with some optional fields filled
**When** the user views the entity detail
**Then** filled fields display their values and unfilled optional fields are not shown (no empty field guilt per UX-DR4)

**Given** the entity detail view
**When** the user wants to add more detail
**Then** an "Add detail" action reveals available optional fields for that entity type

### Story 3.4: Plant Placement — Single Drop

As a gardener,
I want to place individual plants at precise positions within a zone,
So that my garden map shows exactly where each plant lives.

**Acceptance Criteria:**

**Given** a zone exists on the canvas
**When** the user activates single plant placement mode (FR27)
**Then** they can tap/click within the zone to place a plant at that exact position

**Given** the user places a plant
**When** they confirm the position
**Then** a `PlantCreated` event is committed with the plant's UUID, position coordinates, and parent zone ID
**And** the plant renders as a marker at the placed position on the canvas

**Given** a plant is being placed
**When** snap-to-grid is enabled
**Then** the plant position snaps to the grid like polygon points

**Given** the plant creation flow
**When** the user places a plant
**Then** they are prompted for a name (required) with optional detail available but not forced (progressive detail per FR29)

### Story 3.5: Plant Placement — Row & Grid Tools

As a gardener,
I want to place multiple plants at once using row and grid tools with configurable spacing,
So that I can efficiently map beds with many plants without placing them one at a time.

**Acceptance Criteria:**

**Given** a zone exists on the canvas
**When** the user activates the row placement tool (FR28)
**Then** they define a start point, end point, and spacing distance
**And** the tool previews plant positions along the row before confirmation

**Given** the row tool with configured spacing
**When** the user confirms the row
**Then** all plants in the row are created as individual entities, each with a UUID, position, and parent zone ID
**And** individual `PlantCreated` events are committed for each plant

**Given** a zone exists on the canvas
**When** the user activates the grid placement tool (FR28)
**Then** they define an area (rectangle or polygon) and row/column spacing
**And** the tool previews plant positions in a grid pattern before confirmation

**Given** the grid tool with configured spacing
**When** the user confirms the grid
**Then** all plants in the grid are created as individual entities with correct positions
**And** each plant can have its name and detail set independently after placement

**Given** a row or grid of plants is placed
**When** the user sets a name on the first plant (e.g., "Cherokee Purple")
**Then** a prompt offers to apply the same name to all plants in the batch (efficiency for same-variety rows)
**And** the user can decline and name each plant individually

### Story 3.6: Hierarchical Inheritance & Overrides

As a gardener,
I want child zones to inherit properties from their parent (soil type, sun exposure) and override them when needed,
So that I only set shared properties once at the parent level and customize where things differ.

**Acceptance Criteria:**

**Given** a parent zone with soil type set to "Clay"
**When** a child zone is created within it (FR31)
**Then** the child zone inherits soil type "Clay" without the user setting it explicitly

**Given** a child zone inheriting soil type from its parent
**When** the user sets a local soil type on the child zone (FR32)
**Then** the child zone displays the locally set value instead of the inherited value
**And** a `ZoneUpdated` event records the override

**Given** a child zone with a local override
**When** the user clears the override (FR33)
**Then** the child zone reverts to inheriting the parent's value
**And** the cleared field is set to `undefined` (not `null`) to restore inheritance

**Given** an entity detail view
**When** the user views properties on a zone (FR34)
**Then** inherited values are visually distinguished from locally overridden values (e.g., different text style, "inherited from [Parent Name]" label)

**Given** a three-level hierarchy (Property → Garden → Bed)
**When** the middle zone has an override and the bottom zone does not
**Then** the bottom zone inherits from the middle zone's override, not from the top-level property

**Given** a parent zone's property is changed
**When** child zones inherit from that parent
**Then** the inherited values update automatically in the materialized state for all non-overridden children

## Epic 4: Map Navigation & Visualization

User navigates the property map efficiently with tap-to-zoom into zones, breadcrumb hierarchy trail, side panel contents list, zone focus mode, and smart visualization (two-level depth rule, miniature indicators, cluster badges).

### Story 4.1: Tap-to-Zoom & Breadcrumb Navigation

As a gardener,
I want to tap on a zone to zoom into it and use breadcrumbs to navigate back up,
So that I can move through my garden hierarchy quickly without getting lost.

**Acceptance Criteria:**

**Given** the property map is displayed with zones visible
**When** the user taps on a parent zone (FR36)
**Then** the canvas zooms into that zone, centering it and revealing its child zones

**Given** the user has zoomed into a zone
**When** the breadcrumb trail is displayed (FR37)
**Then** it shows the full hierarchy path (e.g., "Property > Backyard > Raised Bed 1")
**And** each breadcrumb segment is tappable to navigate back to that level

**Given** the breadcrumb trail
**When** the user taps on a parent breadcrumb segment
**Then** the canvas zooms out to that level, showing that zone and its children

**Given** the user is at the deepest nesting level
**When** they view the breadcrumb trail
**Then** the full path is visible and the current level is highlighted

### Story 4.2: Zone Contents Side Panel

As a gardener,
I want to see a list of everything inside a zone in a side panel,
So that I can quickly review zone contents without scanning the canvas visually.

**Acceptance Criteria:**

**Given** the user is viewing a zone on the canvas
**When** they open the side panel (FR38)
**Then** a list displays all direct children: child zones, structures, features, and plants with their names and types

**Given** the side panel is open
**When** the user taps an item in the list
**Then** the canvas centers on that entity and selects it for viewing/editing

**Given** a zone with many entities
**When** the side panel displays the contents
**Then** items are grouped by type (zones, structures, features, plants) for easy scanning

**Given** the side panel is open on desktop
**When** the user interacts with the canvas
**Then** the side panel remains visible alongside the canvas (split view)

**Given** the side panel is open on mobile
**When** the user interacts with the canvas
**Then** the panel can be dismissed or minimized to reclaim screen space

### Story 4.3: Depth Visibility & Miniature Indicators

As a gardener,
I want the map to show only relevant detail at each zoom level and indicate when zones are too small to display,
So that the map stays readable regardless of how many entities exist.

**Acceptance Criteria:**

**Given** the property map at any zoom level
**When** zones are rendered (FR39)
**Then** the map displays the current level plus one level deeper (two-level depth rule)
**And** deeper nesting levels are hidden until the user zooms into a parent

**Given** a zone that is too small to render meaningfully at the current zoom level
**When** the map displays that area (FR40)
**Then** a miniature indicator (icon or dot) marks the zone's position
**And** the indicator is tappable to zoom into that zone

**Given** the two-level depth rule
**When** the user zooms into a zone
**Then** the visible levels update: the zoomed zone becomes the current level and its children plus grandchildren are shown

**Given** many zones at different nesting levels
**When** the map renders at the property level
**Then** only the property's direct children and their children are visible — performance remains smooth regardless of total entity count (NFR15)

### Story 4.4: Cluster Badges

As a gardener,
I want dense groups of plants or entities to merge into numbered badges that expand when I zoom in or tap,
So that crowded areas of my garden stay readable on the map.

**Acceptance Criteria:**

**Given** multiple entities are positioned close together at the current zoom level
**When** the map renders (FR41)
**Then** the entities merge into a single numbered badge showing the count (e.g., "12")

**Given** a cluster badge is displayed
**When** the user taps the badge
**Then** the map zooms in to reveal the individual entities within the cluster

**Given** a cluster badge is displayed
**When** the user zooms in via pinch or scroll
**Then** the cluster progressively splits into smaller clusters or individual entities as space permits

**Given** the user zooms out
**When** previously visible individual entities become too dense
**Then** they merge back into cluster badges automatically

### Story 4.5: Zone Focus Mode

As a gardener,
I want a focused view of a single zone showing its plants, activities, tasks, and features,
So that I can see everything about one area of my garden in a scoped, uncluttered view.

**Acceptance Criteria:**

**Given** a zone exists with plants and data
**When** the user enters zone focus mode (FR42)
**Then** the view shows only that zone's contents: plants (with positions), child features, recent activity, and pending tasks

**Given** zone focus mode is active
**When** the user views the zone
**Then** the canvas renders the zone boundary at maximum zoom with all plants and features visible at their positions

**Given** zone focus mode is active
**When** the user selects a plant
**Then** the plant's detail panel shows all available information (name, variety, activity history, notes)

**Given** zone focus mode is active
**When** the user wants to return to the full property map
**Then** a clear exit action (button or breadcrumb) returns them to the previous view level

## Epic 5: Activity Tracking & Quick Capture

User logs garden activities from anywhere in the app via the persistent floating action button with hierarchical classification. Supports harvest logging with optional detail, outbreak tracking across entities, and notes on any entity.

### Story 5.1: Activity Logging

As a gardener,
I want to log activities like watering, fertilizing, and weeding against my zones or plants,
So that I have a record of everything I do in the garden.

**Acceptance Criteria:**

**Given** a zone or plant exists
**When** the user logs an activity (FR43)
**Then** they select an activity type (watering, fertilizing, weeding, treating, planting, harvesting, observing) and the target entity
**And** an `ActivityLogged` event is committed with activity type, entity ID, and timestamp

**Given** the activity logging form
**When** the user logs with minimal input (FR44)
**Then** only activity type, target entity, and date are required — all other fields are optional

**Given** the activity logging form
**When** the user adds optional detail (e.g., "10-10-10, 2 cups" for fertilizing)
**Then** the detail is included in the event payload and displayed in the activity record

**Given** an activity has been logged
**When** the user views the target entity's detail
**Then** the activity appears in the entity's event history with timestamp and any detail provided

### Story 5.2: Quick Capture FAB

As a gardener,
I want a floating action button always visible so I can log something instantly from any screen,
So that capturing garden observations takes zero navigation and under 15 seconds.

**Acceptance Criteria:**

**Given** the user is on any screen in the app
**When** the floating action button (FAB) is visible (FR45)
**Then** it is persistently accessible and tapping it opens the quick capture flow

**Given** the user taps the FAB
**When** the quick capture flow opens
**Then** the flow begins immediately — no intermediate screens or navigation required (UX-DR2)

**Given** the user is currently viewing a specific zone on the canvas
**When** they tap the FAB
**Then** the quick capture pre-selects that zone as the target entity (smart context inference per UX-DR2)

**Given** the quick capture flow
**When** the user completes a capture (type + entity + optional detail)
**Then** the total interaction time from FAB tap to submission is achievable in under 15 seconds (NFR3)

**Given** the quick capture flow on mobile
**When** the user interacts one-handed
**Then** the flow is optimized for thumb-reach with large tap targets and minimal scrolling

### Story 5.3: Hierarchical Classification & Templates

As a gardener,
I want to classify my captures using categories and have relevant fields pre-loaded based on what I'm logging,
So that I can quickly log pests, diseases, harvests, and observations with the right detail fields.

**Acceptance Criteria:**

**Given** the quick capture flow
**When** the user selects a category (FR46)
**Then** a hierarchical dropdown allows classification: pest → type, disease → type, harvest, observation, maintenance → type

**Given** a category has been selected
**When** the capture form loads (FR47)
**Then** relevant fields are pre-loaded based on the category (e.g., pest category shows severity and affected area fields; harvest shows quantity and weight fields)

**Given** the pre-loaded template fields
**When** the user views the form
**Then** all template fields are optional — the user can submit with just the category and entity

**Given** the user has recently logged a pest capture
**When** they open quick capture next time
**Then** the recent category is surfaced for quick re-selection (smart context inference)

### Story 5.4: Harvest Logging

As a gardener,
I want to log harvests with optional quantity, weight, and quality ratings,
So that I can track yields across the season and compare plant performance.

**Acceptance Criteria:**

**Given** the user is logging a harvest (FR48)
**When** they select the harvest category in quick capture or activity logging
**Then** the form shows optional fields for quantity (count), weight (with unit), and quality (rating or description)

**Given** the harvest logging form
**When** the user logs with only the target plant and "harvest" type
**Then** the harvest is recorded successfully with no quantity, weight, or quality — progressive detail applies

**Given** the harvest logging form
**When** the user enters full detail (quantity: 5, weight: 2.3 lbs, quality: "excellent")
**Then** all detail is persisted in the `HarvestLogged` event payload

**Given** harvests have been logged for a plant
**When** the user views the plant's history
**Then** harvest entries are displayed with their detail, showing a running tally of total harvests

### Story 5.5: Outbreak Tracking

As a gardener,
I want to track a pest or disease outbreak that affects multiple plants across different zones,
So that I can see the full scope of a problem and track its resolution.

**Acceptance Criteria:**

**Given** a pest or disease has been logged on one plant
**When** the user creates an outbreak (FR49)
**Then** they can link multiple plants and zones to a single outbreak entity
**And** an `OutbreakCreated` event is committed with a UUID and linked entity IDs

**Given** an active outbreak
**When** the user adds another affected plant or zone
**Then** the outbreak's linked entities update via an `OutbreakUpdated` event

**Given** an active outbreak
**When** the user views it
**Then** all linked plants and zones are listed with their individual observations and the outbreak's timeline

**Given** an outbreak is resolved
**When** the user marks it as resolved
**Then** the resolution is recorded with an optional note and the outbreak appears as resolved in history

### Story 5.6: Entity Notes

As a gardener,
I want to add notes to any entity at any time,
So that I can capture observations, plans, and reminders attached to specific zones or plants.

**Acceptance Criteria:**

**Given** any entity (zone, structure, feature, plant)
**When** the user adds a note (FR50)
**Then** the note text is persisted via a `NoteAdded` event linked to the entity ID with a timestamp

**Given** an entity with notes
**When** the user views the entity detail
**Then** all notes are displayed in chronological order with timestamps

**Given** the note input
**When** the user submits a note
**Then** only the text content is required — no categories, tags, or metadata needed

**Given** notes exist on an entity
**When** the user views the entity's event history
**Then** notes appear interleaved with other events (activities, updates) in chronological order

## Epic 6: Schedules & Daily Guide

User creates recurring schedules with zone-to-child inheritance, gets a configurable daily guide with three-tier severity model, escalation rules, grouping options, journal-triggered reminders, and day-over-day rollover.

### Story 6.1: Recurring Schedules

As a gardener,
I want to create recurring schedules for watering, fertilizing, and custom activities on any zone or plant,
So that the app knows what needs doing and when.

**Acceptance Criteria:**

**Given** a zone or plant exists
**When** the user creates a schedule (FR51)
**Then** they set the activity type (watering, fertilizing, or custom), recurrence pattern (every N days, specific days of week), and start date
**And** a `ScheduleCreated` event is committed with the schedule details and target entity ID

**Given** a schedule is created
**When** the recurrence pattern is evaluated for a given date
**Then** the schedule engine correctly identifies whether the activity is due on that date

**Given** a schedule exists
**When** the user edits the recurrence pattern or activity type
**Then** a `ScheduleUpdated` event records the changes
**And** future due dates reflect the updated pattern

**Given** a schedule exists
**When** the user deletes it
**Then** the schedule is removed from active schedules and no longer generates due items

### Story 6.2: Schedule Inheritance & Overrides

As a gardener,
I want schedules on parent zones to automatically apply to child zones and plants, with the ability to override,
So that I set watering once at the garden level and only customize where needed.

**Acceptance Criteria:**

**Given** a parent zone with a watering schedule
**When** a child zone or plant exists within it (FR52)
**Then** the child inherits the watering schedule without the user creating a separate one

**Given** an inherited schedule on a child entity
**When** the user creates a local schedule on that child (FR53)
**Then** the local schedule overrides the inherited one for that entity
**And** the override is visible in the entity's detail view

**Given** a child entity with an overridden schedule
**When** the user removes the local override
**Then** the child reverts to inheriting the parent's schedule

**Given** a multi-level hierarchy (Property → Garden → Bed → Plant)
**When** a schedule is set at the Garden level
**Then** it cascades to Bed and Plant unless overridden at any intermediate level

### Story 6.3: Daily Guide Core

As a gardener,
I want to opt into a daily guide that shows me what needs attention today,
So that I open the app and immediately know what to do in my garden.

**Acceptance Criteria:**

**Given** the app settings
**When** the user opts into the daily guide (FR54)
**Then** the daily guide view becomes the primary engagement surface on app open (UX-DR3)

**Given** the daily guide is enabled
**When** the user opens the guide for today (FR55)
**Then** it aggregates all due schedules, overdue items, and journal reminders for the current date

**Given** the daily guide has no items for today
**When** it is displayed (FR65)
**Then** it shows "Nothing scheduled for today" with a one-time tip about creating schedules
**And** no guilt messaging, no "you've been away" language (UX-DR11)

**Given** the daily guide is not yet enabled
**When** the user navigates to it
**Then** a simple opt-in prompt explains what the guide does and lets them enable it

### Story 6.4: Severity Model & Escalation

As a gardener,
I want daily guide items to show severity levels that escalate when things are overdue,
So that I can focus on what's most urgent without anxiety about low-priority items.

**Acceptance Criteria:**

**Given** a daily guide item
**When** it is displayed (FR56)
**Then** it shows one of three severity levels: Low, Medium, or High with visually subtle differentiation (UX-DR6 — not traffic light colors)

**Given** a schedule item that is due today
**When** it has not been missed previously
**Then** it displays at its default severity level (Low or Medium depending on activity type)

**Given** a schedule item that was missed
**When** configurable escalation rules are applied (FR57)
**Then** the severity escalates (e.g., missed watering escalates to High after 2 days overdue)

**Given** the severity escalation rules
**When** the user views or adjusts them (FR58)
**Then** they can modify escalation thresholds per-zone or globally (e.g., "escalate watering after 1 day, fertilizing after 3 days")

### Story 6.5: Guide Grouping & Scoping

As a gardener,
I want to group my daily guide by severity, zone, or activity type, and scope it to specific zones,
So that I can view my tasks in the way that's most useful for how I work.

**Acceptance Criteria:**

**Given** the daily guide has multiple items
**When** the user selects grouping by severity (FR59)
**Then** items are organized into High, Medium, and Low sections

**Given** the daily guide has multiple items
**When** the user selects grouping by zone
**Then** items are organized by their target zone with zone names as section headers

**Given** the daily guide has multiple items
**When** the user selects grouping by activity type
**Then** items are organized by activity (watering, fertilizing, etc.) with type names as section headers

**Given** the daily guide scoping options
**When** the user scopes to "My Zones" or "Full Property" (FR64)
**Then** the guide filters to show only items for the selected scope

### Story 6.6: Task Completion & Detail Logging

As a gardener,
I want to mark daily guide items as done and optionally add detail about what I did,
So that completing tasks is satisfying and my records capture the specifics.

**Acceptance Criteria:**

**Given** a daily guide item
**When** the user marks it as done (FR60)
**Then** the item is cleared from the guide with clean visual confirmation (UX-DR12 — list shortens, check appears)
**And** an `ActivityLogged` event is committed recording the completion

**Given** the user marks an item as done
**When** they choose to add detail
**Then** an optional detail field appears for notes (e.g., "10-10-10, 2 cups" for fertilizing)
**And** the detail is included in the activity event

**Given** the user marks an item as done
**When** they do not add detail
**Then** the completion is recorded with just the activity type, entity, and timestamp — no friction

### Story 6.7: Journal Reminders & Rollover

As a gardener,
I want to attach "check back in N days" reminders to journal entries and have incomplete tasks roll over,
So that follow-ups surface automatically and nothing falls through the cracks.

**Acceptance Criteria:**

**Given** the user is logging an activity or note
**When** they attach a reminder (FR61)
**Then** they set a "check back in N days" value
**And** the reminder is persisted with the journal entry

**Given** a journal reminder's due date arrives
**When** the daily guide renders (FR62)
**Then** the reminder appears with the original entry's full context (the note text, the entity, the original date)

**Given** a daily guide item is incomplete at end of day
**When** the next day's guide loads (FR63)
**Then** the user is prompted to pull the item forward to today or dismiss it
**And** pulled-forward items appear in today's guide; dismissed items are removed

**Given** the rollover prompt
**When** the user dismisses an item
**Then** it does not reappear the following day unless a new schedule occurrence generates it

## Epic 7: History, Undo & Recovery

User views complete event history for any entity as a narrative timeline, undoes any action via compensating events, soft deletes entities with full recovery from a dedicated view, and moves or reshapes entities without losing attached data.

### Story 7.1: Undo via Compensating Events

As a gardener,
I want to undo any action I've taken,
So that I can be bold with changes knowing nothing is permanent.

**Acceptance Criteria:**

**Given** the user has performed an action (created, updated, or deleted an entity)
**When** they invoke undo (FR67)
**Then** a compensating event is generated that reverses the effect of the original event
**And** the compensating event is committed to the event store (the original event remains immutable)

**Given** a `PlantCreated` event was the last action
**When** the user undoes it
**Then** a `PlantDeleted` (soft delete) compensating event is committed and the plant is removed from the materialized state

**Given** a `ZoneUpdated` event changed soil type from "Clay" to "Loam"
**When** the user undoes it
**Then** a compensating `ZoneUpdated` event restores soil type to "Clay"

**Given** multiple actions have been performed
**When** the user undoes repeatedly
**Then** each undo steps back one action in reverse chronological order via compensating events

### Story 7.2: Entity Event History View

As a gardener,
I want to see the complete history of any entity presented as a readable timeline,
So that I can review what happened to a plant or zone across the season.

**Acceptance Criteria:**

**Given** an entity with events in its history
**When** the user views the entity's event history (FR68)
**Then** all events are displayed in chronological order as a narrative timeline (UX-DR7)
**And** the display reads like a journal: "Planted April 2 — First harvest July 28 — Disease logged August 15"

**Given** an entity history with many events
**When** the timeline is displayed
**Then** events are grouped by type or date for readability (activities, updates, notes interleaved chronologically)

**Given** an entity history
**When** the user scrolls through the timeline
**Then** performance remains smooth even with hundreds of events for a single entity (NFR4)

### Story 7.3: Soft Delete & Restore

As a gardener,
I want deleted items to be recoverable so I never lose data by accident,
So that I can reorganize my garden confidently without fear of permanent loss.

**Acceptance Criteria:**

**Given** an entity exists
**When** the user deletes it (FR69)
**Then** a soft delete event is committed — the entity's essential data is retained but it is removed from the active map view
**And** no confirmation dialog is shown (UX-DR9 — recovery over prevention)

**Given** entities have been soft deleted
**When** the user navigates to the deleted items view (FR70)
**Then** all soft-deleted entities are listed with their name, type, deletion date, and a preview of their data

**Given** the deleted items view
**When** the user restores an entity
**Then** a compensating restore event is committed, the entity reappears on the map in its original position with all data intact

**Given** a soft-deleted entity
**When** it has not been explicitly purged
**Then** it remains recoverable indefinitely (NFR10)

**Given** a zone with child entities is deleted
**When** the deletion occurs
**Then** all child entities are also soft deleted and can be restored together with the parent

### Story 7.4: Move, Resize & Reshape Entities

As a gardener,
I want to move, resize, or reshape any entity on the canvas without losing its attached data,
So that I can reorganize my garden layout while preserving all history, notes, and activities.

**Acceptance Criteria:**

**Given** an entity (zone, structure, feature, plant) on the canvas
**When** the user moves it to a new position (FR71)
**Then** a geometry update event is committed with the new position
**And** all attached data (activities, notes, schedules, history) remains linked to the entity

**Given** a zone on the canvas
**When** the user resizes or reshapes its boundary
**Then** a geometry update event records the new polygon
**And** all child entities and data remain attached

**Given** a plant is moved from one zone to another
**When** the move is completed
**Then** the plant's `parentId` is updated via event and it inherits properties from the new parent zone
**And** the plant's entire event history is preserved

**Given** an entity has been moved or reshaped
**When** the user undoes the action
**Then** the entity returns to its previous position/shape via a compensating event

## Epic 8: Privacy, Settings & Data Export

User manages privacy permissions via a dedicated dashboard with independent toggles, controls location storage, sees which features require permissions, and exports complete property data as a self-contained portable file.

### Story 8.1: Privacy Dashboard & Permission Toggles

As a gardener,
I want a clear privacy dashboard showing what permissions the app has and what features they enable,
So that I trust the app and understand exactly what data stays on my device.

**Acceptance Criteria:**

**Given** the user navigates to settings
**When** they open the privacy dashboard (FR75)
**Then** it displays all permission toggles with clear labels and current state (enabled/disabled)
**And** the dashboard communicates "No network requests — all data on this device" (UX-DR8)

**Given** the privacy dashboard
**When** the user views permission toggles (FR76)
**Then** location, weather, and network access are independently toggleable

**Given** any permission is denied
**When** the user views the feature list (FR79)
**Then** each feature shows whether it is available or requires a specific permission
**And** no features are degraded — the app functions fully with all permissions denied (FR80)

**Given** the app core
**When** any operation runs in MVP (FR81)
**Then** no user data is transmitted to any server under any circumstances
**And** this is verifiable by the absence of outbound network requests from the application core (NFR11)

### Story 8.2: Location Permission Management

As a gardener,
I want to grant or revoke location permission and understand what it affects,
So that I control whether the app knows where my property is.

**Acceptance Criteria:**

**Given** the privacy dashboard
**When** the user grants location permission (FR77)
**Then** the location is obtained and stored locally on-device for dependent features (e.g., satellite tile centering, future weather integration)

**Given** location permission is granted and stored
**When** the user clears the stored location (FR78)
**Then** the location data is deleted from local storage
**And** dependent features are disabled with clear messaging explaining why (e.g., "Satellite centering requires location permission")

**Given** location is cleared
**When** the user views affected features
**Then** each affected feature shows a message explaining it requires location and how to re-enable it

### Story 8.3: Data Export & Import

As a gardener,
I want to export my complete property data as a portable file and import it on another device,
So that I own my data and can back it up or transfer it.

**Acceptance Criteria:**

**Given** a property with data (zones, plants, events, schedules)
**When** the user triggers data export (FR82)
**Then** a self-contained file is generated containing the complete event log, entity state, and all metadata

**Given** the export file
**When** the user downloads it
**Then** the file format is portable (e.g., JSON) and can be read by any text editor

**Given** the export file from one device
**When** the user imports it on another device (FR83)
**Then** the complete property is restored with all entities, events, schedules, and history intact

**Given** an import is performed on a device with existing data
**When** the import completes
**Then** the user is informed of the result and the imported data does not corrupt existing properties

**Given** the export/import functionality
**When** UUIDs are present in the export
**Then** all UUIDs are preserved exactly to ensure foundation for future Phase 2 sync (NFR9)

## Epic 9: Onboarding & PWA

New users get a guided, skip-friendly property creation flow with optional first-zone prompt. All guided flows are re-enterable from the main app. App installs as PWA with full offline capability via service worker.

### Story 9.1: Guided Property Creation Flow

As a new gardener opening the app for the first time,
I want a step-by-step guide that walks me through creating my property,
So that I get started quickly without feeling overwhelmed.

**Acceptance Criteria:**

**Given** a new user opens the app with no existing property
**When** the onboarding flow starts (FR84)
**Then** a step-by-step guide walks them through: name the property → set dimensions (optional) → choose setup method (satellite or grid) → draw boundary → review

**Given** any step in the onboarding flow
**When** the user wants to skip it (FR85)
**Then** a clear skip option is available and skipping does not block subsequent steps
**And** skipped information defaults to `undefined` (progressive detail)

**Given** the onboarding flow
**When** the user completes property creation
**Then** they land on the property map view with their newly created property displayed

**Given** the onboarding flow
**When** the user exits partway through (closes browser, navigates away)
**Then** any completed steps are preserved via committed events — they can resume or restart

### Story 9.2: First Zone Prompt & Re-enterable Flows

As a gardener who just set up my property,
I want to be nudged to add my first zone, and I want to access any setup flow later from the main app,
So that onboarding flows remain useful as tools throughout my use of the app.

**Acceptance Criteria:**

**Given** the user has completed property creation
**When** the onboarding offers the first zone prompt (FR86)
**Then** they can add a first zone (drawing it on the canvas) or skip

**Given** the first zone prompt
**When** the user skips it
**Then** they land on the empty property map with no guilt messaging — just the canvas with their boundary

**Given** the user is past initial onboarding
**When** they want to re-run a guided flow (FR87, FR11)
**Then** all guided flows (property setup, boundary drawing, zone creation) are accessible as tools from the main app menu

**Given** a re-entered guided flow
**When** the user completes it
**Then** the flow applies its results to the existing property (e.g., re-drawing boundary replaces the old one via events)

### Story 9.3: PWA Installation & Offline Support

As a gardener,
I want to install the app to my phone's home screen and use it fully offline in the garden,
So that I never need a network connection to track my garden.

**Acceptance Criteria:**

**Given** the app is loaded in a browser
**When** the service worker registers (NFR18)
**Then** all application assets are cached for offline use after first load

**Given** the app has been loaded once
**When** the user opens it without network connectivity (NFR19)
**Then** the app loads fully from cached assets with no loading spinners, error states, or degraded modes

**Given** the app is loaded on a mobile browser
**When** the PWA install prompt is available
**Then** the web app manifest enables install-to-homescreen with appropriate app icon and splash screen

**Given** the app is installed as PWA
**When** the user opens it from the home screen
**Then** it launches in standalone mode (no browser chrome) and behaves identically to the browser version

**Given** the app is running offline
**When** the user performs any MVP feature (create, draw, log, capture, schedule)
**Then** the behavior is indistinguishable from online usage (NFR20) — all data persists to IndexedDB locally
