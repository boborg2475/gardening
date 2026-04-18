# Story 2.4: Feature Detection Catalog

Status: ready-for-dev

## Story

As a gardener,
I want to browse all detected features in an organized catalog,
So that I can review and process them systematically rather than hunting across the satellite image.

## Acceptance Criteria

1. **Given** feature detection has identified multiple features
   **When** the user opens the feature detection catalog (FR10)
   **Then** an interactive overlay panel lists all detected features with thumbnail previews and suggested types

2. **Given** the catalog is displayed
   **When** the user selects a feature in the catalog
   **Then** the map pans to center on that feature and highlights it

3. **Given** the catalog is displayed
   **When** the user accepts, adjusts, or dismisses a feature from the catalog
   **Then** the catalog updates to reflect the action (accepted features show as classified, dismissed features are removed)

4. **Given** all detected features have been processed
   **When** the user views the catalog
   **Then** it shows a summary of accepted vs dismissed features and a clear indication that detection review is complete

## Tasks / Subtasks

- [ ] Task 1: Create feature catalog panel component (AC: #1)
  - [ ] Create `src/lib/ui/detection/FeatureCatalog.svelte` — side panel or overlay listing all detected features
  - [ ] Render as a scrollable list with each feature displayed as a card
  - [ ] Each card shows: thumbnail preview (cropped satellite image of the feature area), suggested type with icon, confidence percentage, current status badge (pending/accepted/dismissed)
  - [ ] Sort features: pending first (by confidence descending), then accepted, dismissed features hidden or collapsed
  - [ ] Include a header showing total count and progress: "3 of 7 features reviewed"
  - [ ] Include a toggle to show/hide dismissed features
  - [ ] Panel can be opened/closed via a toolbar button on the map view
  - [ ] Style with Tailwind CSS v4 — semi-transparent background, slides in from right side

- [ ] Task 2: Generate feature thumbnail previews (AC: #1)
  - [ ] Create `src/lib/domain/feature-thumbnails.ts` — generates thumbnail images from satellite tiles
  - [ ] Implement `generateThumbnail(polygon: Point[], tiles: Map<string, Blob>, geoTransform): Promise<string>` — crops the satellite image area containing the feature and returns a data URL
  - [ ] Use a hidden HTML canvas to composite relevant tiles and crop to the feature bounding box
  - [ ] Add padding around the feature polygon (10-20% of bounding box) for context
  - [ ] Scale thumbnail to a fixed size (e.g., 80x80px or 120x80px)
  - [ ] Cache generated thumbnails in memory to avoid regeneration on re-render
  - [ ] Write unit tests with mock tile data

- [ ] Task 3: Implement catalog-to-map navigation (AC: #2)
  - [ ] Wire catalog item click/select to pan the satellite map to center on the selected feature
  - [ ] Use the satellite view store from Story 2.2: call `panTo(featureCenter)` where `featureCenter` is the centroid of the feature polygon
  - [ ] Implement `calculatePolygonCentroid(polygon: Point[]): Point` in a shared geometry utility if not already available
  - [ ] Highlight the selected feature on the map overlay (update `selectedDetectionId` in detection store)
  - [ ] Zoom to fit the feature if it is outside the current viewport or too small to see
  - [ ] Write unit tests for centroid calculation

- [ ] Task 4: Integrate accept/adjust/dismiss actions in catalog (AC: #3)
  - [ ] Add action buttons to each catalog card: "Accept", "Adjust", "Dismiss" — same actions as the detection review panel (Story 2.3)
  - [ ] On "Accept": open the classification prompt (Story 2.3, Task 6) inline or as modal
  - [ ] On "Adjust": pan to the feature on the map and activate boundary editing mode
  - [ ] On "Dismiss": confirm and remove the feature from the catalog (or move to dismissed section)
  - [ ] After any action, update the catalog list reactively — the card reflects the new status immediately
  - [ ] Accepted features show: entity type icon, assigned name, "Accepted" badge
  - [ ] Use the same detection store actions from Story 2.3 — no duplicate logic

- [ ] Task 5: Create completion summary view (AC: #4)
  - [ ] Create `src/lib/ui/detection/DetectionSummary.svelte` — shown when all features are processed
  - [ ] Display summary statistics: total detected, accepted count, dismissed count
  - [ ] List accepted features with their classified types and names
  - [ ] Show a completion message: "All detected features have been reviewed. Your property map is ready!"
  - [ ] Include a "Continue to Property Map" button that closes the catalog and returns to the normal map view
  - [ ] Include a "Re-run Detection" option (if supported) for users who want to try again
  - [ ] Style with Tailwind CSS v4 — celebratory but clean

- [ ] Task 6: Create catalog state management (AC: #1, #2, #3, #4)
  - [ ] Extend `src/lib/stores/detection-store.svelte.ts` with catalog-specific derived state
  - [ ] Add `isCatalogOpen: boolean` reactive state with `openCatalog()` / `closeCatalog()` actions
  - [ ] Derive `catalogItems` — filtered and sorted list of detections for catalog display
  - [ ] Derive `isComplete` — true when all detections have been accepted or dismissed (no pending)
  - [ ] Derive `summary` — `{ total: number; accepted: number; dismissed: number; pending: number }`
  - [ ] Write unit tests for derived state calculations

- [ ] Task 7: Write Playwright E2E tests (AC: #1, #2, #3, #4)
  - [ ] Create `tests/e2e/feature-catalog.spec.ts`
  - [ ] Test: catalog opens and lists all detected features with thumbnails and types
  - [ ] Test: selecting a feature in catalog pans the map to center on it
  - [ ] Test: accepting a feature from catalog updates the card to show classified status
  - [ ] Test: dismissing a feature from catalog removes it from the list
  - [ ] Test: completion summary shows when all features are processed
  - [ ] Test: catalog reflects correct counts throughout the review process

## Dev Notes

### Catalog Panel Design

The feature detection catalog is an interactive overlay panel that provides a systematic way to review detected features. It complements the on-map detection overlays from Story 2.3 by offering a list-based view.

Layout options:
- **Right-side panel** — slides in from the right, overlays the map with ~300px width
- **Bottom sheet** (mobile) — slides up from the bottom, covering ~40% of screen
- **Split view** — catalog on right, map on left (desktop only)

For MVP, a right-side panel with responsive adaptation to bottom sheet on mobile is recommended.

### Thumbnail Generation

Feature thumbnails are generated by:

1. Identifying which satellite tiles overlap the feature's bounding box
2. Drawing those tiles onto a hidden HTML canvas at the correct positions
3. Cropping to the feature's bounding box (with padding)
4. Scaling to thumbnail size
5. Converting to a data URL via `canvas.toDataURL()`

This runs entirely client-side with no network requests. The thumbnails are cached in memory (a `Map<string, string>` keyed by detection ID) since tile data is already loaded.

### Catalog-Map Synchronization

The catalog and map detection overlay share the same `detection-store`:

- Selecting a feature in the catalog sets `selectedDetectionId` in the store
- The detection overlay on the map reads `selectedDetectionId` and highlights accordingly
- Accepting/dismissing from either the catalog or the map overlay updates the same store
- Both views stay in sync reactively via Svelte 5 runes

### Progress Tracking

The catalog shows progress as users work through detections:

```
[=====>          ] 3 of 7 features reviewed
```

"Reviewed" means either accepted or dismissed. Adjusted detections that are then accepted count as reviewed. The progress bar and count update reactively as the detection store changes.

### Completion Flow

When `isComplete` is true (all detections reviewed):

1. The catalog transitions to the summary view
2. Summary shows accepted vs dismissed breakdown
3. User can continue to the normal property map view
4. Accepted entities are now visible on the property map as committed entities

### Architecture Compliance

- **No business logic in Svelte components** — catalog logic delegates to detection store and domain functions
- **Reuse existing actions** — accept/adjust/dismiss from catalog use the same store actions as Story 2.3
- **No `null`** — use `undefined` for optional thumbnail, selectedDetectionId
- **Immutable state** — derived arrays create new references
- **File naming:** `kebab-case.ts` for TypeScript files, `PascalCase.svelte` for Svelte components
- **Test co-location:** tests sit next to source files

### What This Story Does NOT Include

- No feature detection logic (Story 2.3)
- No satellite tile loading (Story 2.1/2.2)
- No boundary editing tools (Story 2.5)
- No drag-and-drop reordering of catalog items
- No export or sharing of detection results
- No filtering by entity type in the catalog (future enhancement)

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Story 2.4: Feature Detection Catalog]
- [Source: _bmad-output/planning-artifacts/architecture.md — Entity Model]
- [Source: _bmad-output/planning-artifacts/architecture.md — Canvas Component Strategy]
