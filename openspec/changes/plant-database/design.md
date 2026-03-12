## Context

Garden zones exist as colored polygons with metadata. The next step is letting users track what they plan to plant in each zone. This requires a reference database of plants and a per-zone planting tracker.

## Goals / Non-Goals

**Goals:**
- Ship ~150 plant entries covering 8 categories with complete metadata
- Provide fast search and filtering in a modal plant browser dialog
- Track individual plantings per zone with status lifecycle
- Handle zone deletion cascade (deleting a zone removes all its plantings)

**Non-Goals:**
- User-editable plant database (reference data is static)
- Plant spacing visualization on the map
- Planting calendar or seasonal recommendations
- Plant images (text-only entries with metadata icons)

## Decisions

### 1. Static TypeScript array for plant database
Plants are defined as a flat array in a TypeScript file. At ~150 entries this is manageable and keeps the data bundled with the app for offline access. No separate data file or fetch needed.

### 2. Planting references plant by ID, not embedded copy
The Planting model stores a plantId string that references the static Plant.id. This keeps planting records small and plant metadata always comes from the single source of truth.

### 3. Zone deletion cascade in a single store action
The removeZone action in projectStore filters both zones and plantings in one call, ensuring zundo captures both as a single atomic snapshot. One undo restores everything.

### 4. Status as unconstrained enum
The status field allows any value from the set (planned, planted, growing, harvested, removed) in any order. No enforced progression — users can skip states or go backwards.

## Risks / Trade-offs

- **~150 plant entries is significant data authoring work** → Plant data is compiled from public horticultural references. Values are approximate and intended for planning, not botanical accuracy.
- **No plant images** → Text-based entries with metadata icons (sun, water, zone range) are sufficient for the planning use case and keep the bundle small.
