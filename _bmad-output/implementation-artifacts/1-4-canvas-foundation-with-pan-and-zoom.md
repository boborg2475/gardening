# Story 1.4: Canvas Foundation with Pan & Zoom

Status: backlog

## Story

As a gardener,
I want to see a scaled grid canvas for my property and navigate it with pan and zoom,
So that I have a visual workspace to draw my property boundaries.

## Acceptance Criteria

1. **Given** a property exists
   **When** the canvas view loads
   **Then** a Konva stage renders a scaled grid based on the property dimensions (or a default size if no dimensions set)
   **And** grid lines are visible with configurable scale (FR5: feet/meters, inches/centimeters)

2. **Given** the canvas is displayed on desktop
   **When** the user scrolls the mouse wheel
   **Then** the canvas zooms in or out smoothly centered on the cursor position

3. **Given** the canvas is displayed on mobile
   **When** the user pinch-to-zooms
   **Then** the canvas zooms smoothly centered between the two touch points
   **And** the interaction maintains 60fps (< 16ms frame time)

4. **Given** the canvas is displayed
   **When** the user clicks/touches and drags
   **Then** the canvas pans in the direction of the drag

5. **Given** the canvas with grid
   **When** the user changes the grid scale setting
   **Then** the grid updates to reflect the new scale (e.g., switching from 1ft to 6in spacing)

6. **Given** the Konva stage
   **When** Playwright tests run
   **Then** test hooks expose the stage state (entities, positions, layers) for assertions against the scene graph

## Tasks / Subtasks

- [ ] Task 1: Create canvas navigation state store (AC: #1, #2, #3, #4)
  - [ ] Create `src/lib/stores/navigation-context.svelte.ts` with Svelte 5 runes (`$state`, `$derived`) — matches architecture doc's canonical naming
  - [ ] Define reactive state: `panOffset: { x: number; y: number }`, `zoomLevel: number`, `gridScale: GridScale`
  - [ ] Define `GridScale` type with options: `'1ft'`, `'6in'`, `'1in'`, `'1m'`, `'10cm'`, `'1cm'`
  - [ ] Implement zoom limits (min/max) to prevent extreme zoom levels (e.g., 0.1x to 10x)
  - [ ] Implement `resetView()` to restore default pan/zoom
  - [ ] This state is reactive but NOT persisted to Dexie — session-only
  - [ ] Write unit tests in `src/lib/stores/navigation-context.test.ts`

- [ ] Task 2: Create grid rendering logic (AC: #1, #5)
  - [ ] Create `src/lib/canvas/map/grid-renderer.ts` with pure functions for grid line calculation
  - [ ] Implement `calculateGridLines(width, height, scale, unit)` — returns arrays of line coordinates
  - [ ] Support major grid lines (ft/m) and minor grid lines (in/cm) with distinct visual styling
  - [ ] Grid lines should extend to fill the visible viewport based on current pan/zoom
  - [ ] Handle unit conversion between imperial (ft/in) and metric (m/cm)
  - [ ] Default canvas size when property has no dimensions: 100ft x 100ft (or metric equivalent)
  - [ ] Write unit tests in `src/lib/canvas/map/grid-renderer.test.ts`

- [ ] Task 3: Create pan/zoom navigation logic and component (AC: #2, #3, #4)
  - [ ] Create `src/lib/canvas/navigation/pan-zoom-utils.ts` with pure functions for zoom and pan calculations
  - [ ] Implement `calculateWheelZoom(event, currentZoom, stagePosition)` — returns new zoom level and stage position, centered on cursor
  - [ ] Implement `calculatePinchZoom(touches, currentZoom, stagePosition)` — returns new zoom level and stage position, centered between touch points
  - [ ] Implement `calculatePanOffset(dragStart, dragEnd, currentOffset)` — returns new pan offset
  - [ ] Apply zoom limits from navigation state
  - [ ] Ensure calculations are pure functions (no DOM/Konva dependencies) for testability
  - [ ] Ensure pan works for both mouse drag and touch drag
  - [ ] Write unit tests in `src/lib/canvas/navigation/pan-zoom-utils.test.ts`
  - [ ] Create `src/lib/canvas/navigation/PanZoom.svelte` — component that wires pan/zoom interactions to the Konva stage, matching architecture doc's canonical `PanZoom.svelte` name
  - [ ] Wire wheel event to zoom handler, update navigation state reactively
  - [ ] Wire touch events (pinch-to-zoom) to zoom handler with multi-touch detection
  - [ ] Wire drag events to pan handler (use Konva stage `draggable` or manual drag handlers)
  - [ ] No business logic in the component — delegate all calculations to `pan-zoom-utils.ts`

- [ ] Task 4: Create the root canvas container component (AC: #1, #2, #3, #4, #6)
  - [ ] Create `src/lib/canvas/map/PropertyMap.svelte` using svelte-konva declarative bindings — this is the root canvas container per the architecture doc
  - [ ] Render `<Stage>` with responsive sizing (fill available viewport)
  - [ ] Add a dedicated grid `<Layer>` beneath other layers, rendering `<Line>` elements from grid-renderer output
  - [ ] Include `<PanZoom>` component from Task 3 to handle all pan/zoom interactions
  - [ ] Read property dimensions from materialized state; fall back to default size if undefined
  - [ ] Ensure grid re-renders reactively when `gridScale` changes in navigation state
  - [ ] No business logic in the component — delegate all calculations to handler modules

- [ ] Task 5: Create grid scale selector UI component (AC: #5)
  - [ ] Create `src/lib/ui/shared/GridScaleSelector.svelte` — dropdown or toggle for grid scale options
  - [ ] Display options: 1ft, 6in, 1in (imperial) and 1m, 10cm, 1cm (metric)
  - [ ] Filter options based on current property unit setting (ft shows imperial options, m shows metric)
  - [ ] On change, update `gridScale` in navigation state store
  - [ ] Style with Tailwind CSS v4

- [ ] Task 6: Integrate canvas into application route (AC: #1)
  - [ ] Add `PropertyMap` component to the main route (or a dedicated canvas route)
  - [ ] Ensure canvas fills available viewport space responsively
  - [ ] Place `GridScaleSelector` in an accessible UI overlay position
  - [ ] Verify canvas loads with grid visible using property dimensions or default size

- [ ] Task 7: Expose test hooks for Playwright (AC: #6)
  - [ ] Create `src/lib/canvas/test-hooks.ts` with functions to expose Konva stage reference — placed at canvas root per architecture doc
  - [ ] Attach stage reference to a `data-testid` element or `window.__gardenCanvas` in dev/test mode only
  - [ ] Expose methods: `getStageState()`, `getEntities()`, `getLayerByName()`, `getZoomLevel()`, `getPanOffset()`
  - [ ] Gate test hooks behind an environment check (do not expose in production builds)
  - [ ] Write unit tests in `src/lib/canvas/test-hooks.test.ts`

- [ ] Task 8: Write Playwright E2E tests (AC: #1, #2, #3, #4, #5, #6)
  - [ ] Create `tests/e2e/canvas-foundation.spec.ts`
  - [ ] Test: canvas loads and grid is visible (stage has expected layers)
  - [ ] Test: mouse wheel zoom changes zoom level (verify via test hooks)
  - [ ] Test: click-and-drag pans the canvas (verify pan offset changes via test hooks)
  - [ ] Test: changing grid scale updates grid line spacing
  - [ ] Test: pinch-to-zoom on mobile (via Playwright touch emulation or manual testing) — verify zoom centered between touch points
  - [ ] Create test fixtures in `test/fixtures/` for property data with and without dimensions

- [ ] Task 9: Performance validation (AC: #3)
  - [ ] Verify pan/zoom interactions maintain 60fps (< 16ms frame time) using browser DevTools or Playwright performance tracing
  - [ ] Profile grid rendering with large property dimensions to ensure no jank
  - [ ] Optimize grid rendering if needed (e.g., only render visible grid lines, debounce grid recalculation during zoom)
  - [ ] Document any performance findings in dev notes

## Dev Notes

### Canvas Architecture Overview

This story introduces the Konva canvas layer — the visual foundation for all subsequent drawing stories. The canvas uses a layered architecture:

- **Grid Layer** (bottom): Renders scale grid lines — always beneath all other content
- **Drawing Layer** (future): Will hold property boundaries (Story 1.7), zones, plants, etc.
- **Interaction Layer** (future): Will hold drawing tool overlays (Story 1.5)

All canvas components live in `src/lib/canvas/` with subdirectories:
- `map/` — PropertyMap component, grid renderer, test hooks
- `navigation/` — pan and zoom handler logic
- `drawing/` — reserved for Story 1.5+

### svelte-konva Usage

svelte-konva provides declarative Konva bindings for Svelte. Components map to Konva nodes:

```svelte
<Stage bind:config={stageConfig}>
  <Layer>
    {#each gridLines as line}
      <Line config={line} />
    {/each}
  </Layer>
</Stage>
```

Verify svelte-konva 1.0.x works correctly with Svelte 5 runes — this was flagged as a potential compatibility concern in Story 1.1.

### Pan Implementation

Two approaches for panning:
1. **Konva `draggable` stage** — simplest, set `draggable: true` on the Stage config
2. **Manual drag handlers** — more control, track `mousedown`/`mousemove`/`mouseup` and `touchstart`/`touchmove`/`touchend`

Prefer the Konva `draggable` approach for simplicity unless it conflicts with future drawing tool interactions (Story 1.5). If using `draggable`, the stage `dragend` event provides the new position.

### Zoom Implementation

**Desktop (mouse wheel):**
- Listen for `wheel` events on the Konva stage
- Calculate new scale factor from `event.deltaY`
- Zoom centered on cursor position: adjust stage position so the point under the cursor stays fixed
- Apply zoom limits (e.g., 0.1x to 10x)

**Mobile (pinch-to-zoom):**
- Detect two-finger touch via `touchstart`/`touchmove` with `event.touches.length === 2`
- Calculate distance between touch points to determine scale delta
- Zoom centered between the two touch points
- Consider Konva's built-in touch support or Hammer.js if multi-touch handling is complex

### Grid Scale Configuration

Supported grid scales (from FR5):

| Scale Option | Line Spacing | Unit System |
|-------------|-------------|-------------|
| 1ft | 1 foot | Imperial |
| 6in | 6 inches | Imperial |
| 1in | 1 inch | Imperial |
| 1m | 1 meter | Metric |
| 10cm | 10 centimeters | Metric |
| 1cm | 1 centimeter | Metric |

Major grid lines should be visually distinct from minor grid lines (thicker stroke, different opacity). The grid scale selector should only show options matching the property's unit system.

### Default Canvas Size

When a property has no dimensions set (`property.dimensions === undefined`), use a default canvas size of **100ft x 100ft** (or **30m x 30m** for metric). This provides a reasonable workspace until the user defines actual property boundaries.

### Responsive Canvas Sizing

The Konva `<Stage>` must fill the available viewport space. Use a ResizeObserver or Svelte reactive binding to track the container's dimensions and update the stage `width` and `height` accordingly. The grid should re-render when the viewport size changes.

### Navigation State (Not Persisted)

The navigation state (pan offset, zoom level, grid scale) lives in `src/lib/stores/navigation-context.svelte.ts` — a Svelte 5 runes-based store (`.svelte.ts` extension per architecture convention for rune-based modules). This state is NOT persisted to Dexie. Navigation position is ephemeral session state, not application data. On page reload, the canvas resets to the default view.

### Test Hooks for Playwright

Expose the Konva stage reference so Playwright E2E tests can inspect the scene graph:

```ts
// In dev/test mode only — file: src/lib/canvas/test-hooks.ts
if (import.meta.env.DEV || import.meta.env.MODE === 'test') {
  window.__propertyMap = {
    getStageState: () => ({ ... }),
    getZoomLevel: () => navigationState.zoomLevel,
    getPanOffset: () => navigationState.panOffset,
    getEntities: () => [ ... ],
    getLayerByName: (name: string) => stage.findOne(name)
  };
}
```

Playwright tests can then access via `page.evaluate(() => window.__propertyMap.getZoomLevel())`.

### Performance Considerations

- **60fps target:** Pan and zoom handlers must complete within 16ms per frame
- **Grid optimization:** For fine grid scales (1in, 1cm), only render grid lines within the visible viewport — do not render the entire grid at all zoom levels
- **Debounce grid recalculation:** During continuous zoom, debounce or throttle grid line recalculation to avoid excessive DOM updates
- **Konva layer caching:** Consider using Konva layer `cache()` for the grid layer if static between scale changes

### Architecture Compliance Reminders

- **No business logic in Svelte components** — all grid math, zoom calculations, and pan logic go in dedicated `.ts` modules under `src/lib/canvas/`
- **File naming:** `kebab-case.ts` for TypeScript files, `PascalCase.svelte` for Svelte components
- **Test co-location:** tests sit next to source files (e.g., `grid-renderer.test.ts` alongside `grid-renderer.ts`)
- **No `null`** when `undefined` is semantically correct
- **No in-place state mutation** — create new objects for state updates
- **Types:** `PascalCase` for type/interface names (e.g., `GridScale`, `PanOffset`, `ZoomConfig`)

### What This Story Does NOT Include

- No drawing tools or mode switching (Story 1.5)
- No property boundary rendering or polygon drawing (Story 1.7)
- No zone or bed rendering
- No plant placement
- No undo/redo for canvas operations
- No canvas state persistence to Dexie (navigation state is ephemeral)

### References

- [Source: _bmad-output/planning-artifacts/architecture.md — Canvas Layer & Konva Integration]
- [Source: _bmad-output/planning-artifacts/architecture.md — Project Structure & Boundaries]
- [Source: _bmad-output/planning-artifacts/architecture.md — Implementation Patterns & Consistency Rules]
- [Source: _bmad-output/planning-artifacts/epics.md — Story 1.4: Canvas Foundation with Pan & Zoom]
