# Story 3.2: Structures & Features

Status: ready-for-dev

## Story

As a gardener,
I want to add structures like my house and shed, and features like trees and fences, to my property map,
So that my garden map reflects all the physical elements of my yard.

## Acceptance Criteria

1. **Given** a property exists
   **When** the user creates a structure (FR25)
   **Then** they can draw or place a shape on the canvas, name it (e.g., "House", "Shed", "Greenhouse"), and it is persisted via a `StructureCreated` event with a UUID

2. **Given** a property exists
   **When** the user creates a feature (FR26)
   **Then** they can draw or place a shape on the canvas, name it (e.g., "Oak Tree", "Fence", "Pond"), and it is persisted via a `FeatureCreated` event with a UUID

3. **Given** structures and features on the canvas
   **When** the property map is displayed
   **Then** structures and features render with visually distinct styles (different from zones and plants)

4. **Given** a structure or feature
   **When** it was created with only a name
   **Then** it displays correctly — no required fields beyond name and placement

## Tasks / Subtasks

- [ ] Task 1: Define structure and feature domain types and Zod schemas (AC: #1, #2)
  - [ ] Create `src/lib/types/structure.ts` with `Structure` interface: `id: UUID`, `name: string`, `geometry: Polygon`, `structureType?: string` (e.g., "house", "shed", "greenhouse")
  - [ ] Create `src/lib/types/feature.ts` with `Feature` interface: `id: UUID`, `name: string`, `geometry: Polygon | Point`, `featureType?: string` (e.g., "tree", "fence", "water", "rock", "driveway")
  - [ ] Create `StructureCreated` Zod schema in `src/lib/types/events.ts` with payload `{ name: string, geometry: Polygon, structureType?: string }`
  - [ ] Create `FeatureCreated` Zod schema in `src/lib/types/events.ts` with payload `{ name: string, geometry: Polygon | Point, featureType?: string }`
  - [ ] Update the event discriminated union type to include `StructureCreated` and `FeatureCreated`
  - [ ] Write unit tests for Zod schema validation (valid structure, valid feature, missing name rejected)

- [ ] Task 2: Implement structure and feature domain logic (AC: #1, #2, #4)
  - [ ] Create `src/lib/domain/structure.ts` with `createStructure()` function that accepts name, geometry, and optional structureType
  - [ ] Create `src/lib/domain/feature.ts` with `createFeature()` function that accepts name, geometry, and optional featureType
  - [ ] Both functions generate a UUID via `crypto.randomUUID()`, construct the appropriate event, and call `dispatchEvent()`
  - [ ] Validate that name is a non-empty string before dispatching
  - [ ] Write unit tests in `src/lib/domain/structure.test.ts` and `src/lib/domain/feature.test.ts`

- [ ] Task 3: Add event reducers in the materialized state layer (AC: #1, #2)
  - [ ] Add `StructureCreated` reducer that creates a new structure entity in the materialized state
  - [ ] Add `FeatureCreated` reducer that creates a new feature entity in the materialized state
  - [ ] Ensure reducers produce new state objects (no in-place mutation)
  - [ ] Write unit tests verifying state updates from both event types
  - [ ] Write unit tests verifying state rebuilds correctly from a sequence of events

- [ ] Task 4: Create structure and feature rendering canvas components (AC: #3)
  - [ ] Create `src/lib/canvas/map/StructureLayer.svelte` — Konva layer for rendering all structures
  - [ ] Create `src/lib/canvas/map/StructureShape.svelte` — renders a single structure with distinct visual style (e.g., solid fill, hatched pattern, or distinct border style)
  - [ ] Create `src/lib/canvas/map/FeatureLayer.svelte` — Konva layer for rendering all features
  - [ ] Create `src/lib/canvas/map/FeatureShape.svelte` — renders a single feature with visual style distinct from zones and structures (e.g., dashed borders for fences, circular marker for trees)
  - [ ] Add name labels to both structures and features on the canvas
  - [ ] Reactively bind to structures and features from materialized state
  - [ ] Ensure layer ordering: structures and features render above zones but below the drawing interaction layer

- [ ] Task 5: Create visual style definitions for structures and features (AC: #3)
  - [ ] Create `src/lib/canvas/styles/entity-styles.ts` with style constants for structures (fill, stroke, opacity, pattern)
  - [ ] Define distinct styles per structure type: house (gray fill), shed (brown fill), greenhouse (transparent green fill)
  - [ ] Define distinct styles per feature type: tree (green circle), fence (dashed line), water (blue fill), rock (gray), driveway (dark gray)
  - [ ] Ensure all styles are visually distinguishable from zone polygon styles
  - [ ] Write unit tests verifying style lookup by entity type

- [ ] Task 6: Create structure and feature creation UI flow (AC: #1, #2, #4)
  - [ ] Create `src/lib/ui/entities/StructureCreationForm.svelte` — minimal form with name input (required), optional type selector
  - [ ] Create `src/lib/ui/entities/FeatureCreationForm.svelte` — minimal form with name input (required), optional type selector
  - [ ] Integrate with polygon drawing tool for shape placement (structures)
  - [ ] Support both polygon and point placement for features (e.g., a tree is a point, a fence is a polygon/line)
  - [ ] On submit, call appropriate domain function with drawn geometry and form data
  - [ ] Style with Tailwind CSS — mobile-first responsive layout

- [ ] Task 7: Create entity type selector component (AC: #1, #2)
  - [ ] Create `src/lib/ui/shared/EntityTypeSelector.svelte` — reusable dropdown/chip selector for entity subtypes
  - [ ] For structures: House, Shed, Greenhouse, Other
  - [ ] For features: Tree, Fence, Water Feature, Rock, Driveway, Other
  - [ ] Selection is optional — entity can be created without specifying a type
  - [ ] Selected type influences default visual style on the canvas

- [ ] Task 8: Write Playwright E2E tests (AC: #1, #2, #3, #4)
  - [ ] Create `tests/e2e/structures-and-features.spec.ts`
  - [ ] Test: create a structure with name and polygon, verify it renders on canvas
  - [ ] Test: create a feature with name and placement, verify it renders on canvas
  - [ ] Test: verify structures and features have distinct visual styles from zones
  - [ ] Test: create structure with name only (no type), verify it displays correctly
  - [ ] Test: create feature with name only (no type), verify it displays correctly
  - [ ] Test: reload app, verify structures and features restored from events

## Dev Notes

### Entity Type Hierarchy

The application has four main entity types on the canvas:
- **Zones** (Story 3.1) — organizational areas, polygon-based
- **Structures** (this story) — built elements like houses, sheds
- **Features** (this story) — natural or permanent elements like trees, fences, water
- **Plants** (Stories 3.4, 3.5) — individual plants placed within zones

Structures and features are top-level entities placed on the property, not nested within zones. They exist alongside zones on the property map.

### Visual Distinction Strategy

Each entity type needs a visually distinct rendering style so users can quickly identify what they are looking at:

```typescript
// Structure styles — solid, architectural feel
const STRUCTURE_STYLES = {
  house:      { fill: '#9E9E9E', stroke: '#616161', strokeWidth: 2, opacity: 0.8 },
  shed:       { fill: '#8D6E63', stroke: '#5D4037', strokeWidth: 2, opacity: 0.8 },
  greenhouse: { fill: '#A5D6A7', stroke: '#4CAF50', strokeWidth: 2, opacity: 0.4 },
  default:    { fill: '#BDBDBD', stroke: '#757575', strokeWidth: 2, opacity: 0.7 }
};

// Feature styles — natural, organic feel
const FEATURE_STYLES = {
  tree:     { fill: '#2E7D32', stroke: '#1B5E20', radius: 12, shape: 'circle' },
  fence:    { stroke: '#795548', strokeWidth: 3, dash: [10, 5], shape: 'line' },
  water:    { fill: '#42A5F5', stroke: '#1E88E5', strokeWidth: 1, opacity: 0.6 },
  rock:     { fill: '#9E9E9E', stroke: '#757575', strokeWidth: 1, opacity: 0.9 },
  driveway: { fill: '#616161', stroke: '#424242', strokeWidth: 1, opacity: 0.7 },
  default:  { fill: '#BDBDBD', stroke: '#757575', strokeWidth: 1, opacity: 0.6 }
};
```

### Event Schema

```typescript
// StructureCreated event
{
  id: crypto.randomUUID(),
  type: 'StructureCreated',
  entityId: '<structure-uuid>',
  entityType: 'structure',
  timestamp: new Date().toISOString(),
  payload: {
    name: 'House',
    geometry: [{ x: 50, y: 50 }, { x: 200, y: 50 }, { x: 200, y: 150 }, { x: 50, y: 150 }],
    structureType: 'house'  // optional
  }
}

// FeatureCreated event
{
  id: crypto.randomUUID(),
  type: 'FeatureCreated',
  entityId: '<feature-uuid>',
  entityType: 'feature',
  timestamp: new Date().toISOString(),
  payload: {
    name: 'Oak Tree',
    geometry: { x: 300, y: 400 },  // Point for point features
    featureType: 'tree'  // optional
  }
}
```

### Progressive Detail

This story establishes the pattern that only name and placement are required for entity creation (FR29). All other fields (type, description, notes, etc.) are optional and can be added later via Story 3.3's progressive detail flow.

### Architecture Compliance

- **No business logic in Svelte components** — all creation logic lives in `src/lib/domain/structure.ts` and `src/lib/domain/feature.ts`
- **Immutable state transitions** — domain functions return new state objects, never mutate
- **No `null`** — use `undefined` for optional fields (structureType, featureType)
- **No `Date.now()`** — use `new Date().toISOString()` for ISO 8601
- **No external UUID libraries** — use `crypto.randomUUID()`
- **File naming:** `kebab-case.ts` for TypeScript, `PascalCase.svelte` for components
- **Test co-location:** tests sit next to source files

### What This Story Does NOT Include

- No editing or moving structures/features after placement
- No deletion of structures/features
- No progressive detail editing UI (Story 3.3)
- No structure/feature nesting within zones
- No import of structures from satellite imagery
- No 3D or elevation rendering

### References

- [Source: _bmad-output/planning-artifacts/architecture.md — Canvas Component Strategy]
- [Source: _bmad-output/planning-artifacts/architecture.md — Three-Tier State Management]
- [Source: _bmad-output/planning-artifacts/architecture.md — Implementation Patterns & Consistency Rules]
- [Source: _bmad-output/planning-artifacts/epics.md — Story 3.2: Structures & Features]
