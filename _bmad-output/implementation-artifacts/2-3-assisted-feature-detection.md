# Story 2.3: Assisted Feature Detection

Status: ready-for-dev

## Story

As a gardener,
I want the app to suggest features it detects on the satellite image so I can quickly identify my house, shed, and other structures,
So that I save time during property setup and get an accurate starting map.

## Acceptance Criteria

1. **Given** a satellite image is loaded for the property
   **When** feature detection runs (FR7)
   **Then** detected features are highlighted as overlay suggestions on the satellite image with distinct visual indicators

2. **Given** detected features are displayed
   **When** the user reviews a detected feature (FR8)
   **Then** they can accept it (adds to property), adjust its boundary (edit the polygon), or dismiss it (removes suggestion)

3. **Given** the user accepts a detected feature
   **When** they confirm the feature (FR9)
   **Then** they are prompted to classify it by entity type: structure (house, shed, greenhouse), zone, or feature (tree, fence, driveway)
   **And** the classified entity is created with a UUID and persisted via the event store

4. **Given** the user dismisses a detected feature
   **When** the dismissal is confirmed
   **Then** the suggestion overlay is removed and does not reappear

5. **Given** the user adjusts a detected feature
   **When** they modify the boundary polygon
   **Then** the adjusted boundary replaces the original detection and proceeds to classification

## Tasks / Subtasks

- [ ] Task 1: Define feature detection domain types and event schemas (AC: #1, #3, #4)
  - [ ] Create `src/lib/types/detection.ts` with types: `DetectedFeature` (`{ id: string; suggestedType: FeatureEntityType; polygon: Point[]; confidence: number; status: DetectionStatus }`), `DetectionStatus` enum (`'pending' | 'accepted' | 'adjusted' | 'dismissed'`), `FeatureEntityType` (`'structure' | 'zone' | 'feature'`), `StructureSubtype` (`'house' | 'shed' | 'greenhouse' | 'garage' | 'other'`), `FeatureSubtype` (`'tree' | 'fence' | 'driveway' | 'path' | 'pond' | 'other'`)
  - [ ] Add Zod schemas for `DetectedFeature` validation
  - [ ] Add `FeatureDetected` event schema — payload: `{ detections: DetectedFeature[] }`
  - [ ] Add `DetectionAccepted` event schema — payload: `{ detectionId: string; entityType: FeatureEntityType; subtype: string; polygon: Point[] }`
  - [ ] Add `DetectionDismissed` event schema — payload: `{ detectionId: string }`
  - [ ] Update the event discriminated union to include new event types
  - [ ] Write unit tests for all schemas

- [ ] Task 2: Implement feature detection engine (AC: #1)
  - [ ] Create `src/lib/domain/feature-detection.ts` — core detection logic
  - [ ] Implement `detectFeatures(tileData: Blob[], bounds: Polygon): DetectedFeature[]` — analyzes satellite imagery tiles to identify features
  - [ ] For MVP: implement simple heuristic-based detection (contrast analysis, edge detection on tile pixel data) or use a pre-trained lightweight model
  - [ ] Assign suggested types based on feature characteristics: large rectangular shapes suggest structures, irregular shapes suggest natural features, linear shapes suggest fences/paths
  - [ ] Assign confidence score (0-1) based on detection clarity
  - [ ] Generate UUID for each detected feature
  - [ ] Return features sorted by confidence (highest first)
  - [ ] Write unit tests with test fixture images containing known features

- [ ] Task 3: Implement detection state management (AC: #1, #2, #3, #4, #5)
  - [ ] Create `src/lib/stores/detection-store.svelte.ts` using Svelte 5 runes
  - [ ] Define reactive state: `detections: DetectedFeature[]`, `selectedDetectionId: string | undefined`, `isDetecting: boolean`, `progress: { total: number; processed: number }`
  - [ ] Implement `runDetection(tileData, bounds)` — triggers detection engine and populates detections
  - [ ] Implement `selectDetection(id: string)` — sets the active detection for review
  - [ ] Implement `acceptDetection(id: string, entityType, subtype)` — marks as accepted, commits `DetectionAccepted` event, creates entity
  - [ ] Implement `dismissDetection(id: string)` — marks as dismissed, commits `DetectionDismissed` event
  - [ ] Implement `startAdjustment(id: string)` — enters boundary editing mode for the detection
  - [ ] Implement `finalizeAdjustment(id: string, newPolygon: Point[])` — updates detection polygon and proceeds to classification
  - [ ] Derive `pendingDetections`, `acceptedDetections`, `dismissedDetections` from detections array
  - [ ] Write unit tests for all state transitions

- [ ] Task 4: Create detection overlay rendering on canvas (AC: #1, #2)
  - [ ] Create `src/lib/canvas/map/DetectionOverlay.svelte` — Konva `<Layer>` rendering detected feature outlines
  - [ ] Render each detection as a polygon with dashed outline and pulsing/glowing effect to indicate suggestion status
  - [ ] Color-code by suggested type: blue for structures, green for zones/natural features, orange for linear features
  - [ ] Highlight the selected detection with a brighter outline and thicker stroke
  - [ ] Show a small label/badge on each detection with the suggested type name
  - [ ] Dismissed detections are not rendered
  - [ ] Accepted detections render with a solid outline and checkmark indicator
  - [ ] No business logic in the component — read from detection store

- [ ] Task 5: Create detection review interaction UI (AC: #2, #3)
  - [ ] Create `src/lib/ui/detection/DetectionReviewPanel.svelte` — floating panel shown when a detection is selected
  - [ ] Display detection details: suggested type, confidence percentage, thumbnail preview
  - [ ] Include three action buttons: "Accept", "Adjust Boundary", "Dismiss"
  - [ ] On "Accept": show classification prompt (Task 6) before confirming
  - [ ] On "Adjust Boundary": activate polygon editing mode on the detection (reuse boundary editing from Story 2.5)
  - [ ] On "Dismiss": confirm dismissal with a brief confirmation ("Dismiss this suggestion?")
  - [ ] Panel positions near the selected detection on the map (or in a fixed sidebar position)
  - [ ] Style with Tailwind CSS v4

- [ ] Task 6: Create entity classification prompt (AC: #3)
  - [ ] Create `src/lib/ui/detection/ClassificationPrompt.svelte` — modal or inline prompt for classifying accepted features
  - [ ] Display entity type options: Structure, Zone, Feature — with icons
  - [ ] On selecting "Structure": show subtype options (house, shed, greenhouse, garage, other)
  - [ ] On selecting "Feature": show subtype options (tree, fence, driveway, path, pond, other)
  - [ ] On selecting "Zone": proceed directly (zones are further defined in Epic 3)
  - [ ] Include a name input field (pre-filled with suggested type, e.g., "House", "Shed")
  - [ ] On confirm: create the entity with UUID via the event store, commit `DetectionAccepted` event
  - [ ] Style with Tailwind CSS v4

- [ ] Task 7: Implement entity creation from accepted detections (AC: #3)
  - [ ] Create `src/lib/domain/detection-entity-factory.ts` — creates domain entities from accepted detections
  - [ ] Implement `createEntityFromDetection(detection: DetectedFeature, entityType, subtype, name, propertyId): void` — creates the appropriate entity event
  - [ ] For structures: commit `StructureCreated` event with polygon geometry, type, and name
  - [ ] For zones: commit `ZoneCreated` event with polygon geometry and name
  - [ ] For features: commit `FeatureCreated` event with polygon geometry, type, and name
  - [ ] All entities are children of the property (set `parentId` to `propertyId`)
  - [ ] Write unit tests for entity creation from each detection type

- [ ] Task 8: Implement dismissed detection persistence (AC: #4)
  - [ ] Store dismissed detection IDs in the event store via `DetectionDismissed` events
  - [ ] On subsequent detection runs (if re-run is supported), filter out previously dismissed detections by comparing polygon overlap
  - [ ] Ensure dismissed suggestions do not reappear after page reload — materializer reads `DetectionDismissed` events
  - [ ] Write unit tests for dismissal persistence and filtering

- [ ] Task 9: Write Playwright E2E tests (AC: #1, #2, #3, #4, #5)
  - [ ] Create `tests/e2e/feature-detection.spec.ts`
  - [ ] Test: feature detection runs and highlights detected features on satellite image
  - [ ] Test: selecting a detection shows the review panel with accept/adjust/dismiss options
  - [ ] Test: accepting a detection prompts for classification and creates an entity
  - [ ] Test: dismissing a detection removes the overlay and it does not reappear
  - [ ] Test: adjusting a detection allows boundary editing and proceeds to classification
  - [ ] Create test fixture satellite images with known detectable features in `test/fixtures/`

## Dev Notes

### Feature Detection Approach

For MVP, feature detection can be implemented using client-side image analysis:

1. **Canvas-based pixel analysis** — draw tile images to a hidden HTML canvas, read pixel data, detect edges and regions using simple computer vision algorithms
2. **Pre-trained TensorFlow.js model** — if available, a lightweight object detection model could run in the browser for better accuracy
3. **Heuristic approach** — analyze tile images for rectangular shapes (structures), large uniform areas (lawns, driveways), linear features (fences, paths)

The detection engine should be swappable — start with heuristics, upgrade to ML later without changing the UI or state management.

### Detection Overlay Visual Design

Detected features should be visually distinct from committed property elements:

- **Pending detections**: dashed outline, subtle pulsing animation, semi-transparent fill
- **Selected detection**: solid bright outline, highlighted fill, review panel visible
- **Accepted detections**: solid outline with checkmark badge, filled with entity type color
- **Dismissed detections**: not rendered (removed from overlay)

Color coding by type helps users quickly identify what was detected:
- Structures (blue): `rgba(59, 130, 246, 0.3)` fill, `#3B82F6` stroke
- Zones/natural (green): `rgba(34, 197, 94, 0.3)` fill, `#22C55E` stroke
- Linear features (orange): `rgba(249, 115, 22, 0.3)` fill, `#F97316` stroke

### Entity Type Hierarchy

Accepted detections create entities in the existing entity model:

- **Structure** → stored in `structures` Dexie table, subtypes: house, shed, greenhouse, garage, other
- **Zone** → stored in `zones` Dexie table, further defined in Epic 3
- **Feature** → stored in `features` Dexie table, subtypes: tree, fence, driveway, path, pond, other

All entities get a UUID, are children of the property (`parentId = propertyId`), and have polygon geometry from the detection.

### Adjustment Flow

When a user adjusts a detection boundary:

1. The detection's polygon enters an editable state (draggable vertices, add/remove points)
2. This reuses the boundary editing infrastructure from Story 2.5
3. On confirm, the adjusted polygon replaces the original detection polygon
4. The flow then proceeds to the classification prompt (same as accept)

### State Persistence

- `DetectedFeature` objects are transient — they exist in the detection store during a session
- `DetectionAccepted` and `DetectionDismissed` events are persisted to the event store
- On page reload, the materialized state includes entities created from accepted detections
- Dismissed detection IDs are persisted so they can be filtered on subsequent runs

### Architecture Compliance

- **No business logic in Svelte components** — detection logic in `src/lib/domain/`, state in stores
- **No `null`** — use `undefined` for optional fields (confidence, subtype)
- **Immutable state transitions** — detection state updates return new arrays/objects
- **File naming:** `kebab-case.ts` for TypeScript files, `PascalCase.svelte` for Svelte components
- **Test co-location:** tests sit next to source files
- **No `fetch` outside network boundary** — detection runs on already-loaded tile data

### What This Story Does NOT Include

- No feature detection catalog UI (Story 2.4)
- No boundary editing tool (Story 2.5 — but may be referenced for adjustment flow)
- No machine learning model training or server-side detection
- No automatic acceptance of high-confidence detections
- No detection re-run or refresh capability
- No detection undo (dismiss is final within a session)

### References

- [Source: _bmad-output/planning-artifacts/architecture.md — Entity Model]
- [Source: _bmad-output/planning-artifacts/architecture.md — Event Store]
- [Source: _bmad-output/planning-artifacts/epics.md — Story 2.3: Assisted Feature Detection]
