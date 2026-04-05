# Story 3.3: Entity Creation with Progressive Detail

Status: ready-for-dev

## Story

As a gardener,
I want to create any entity with just a name and add detail later when I'm ready,
So that I can quickly populate my garden map without being slowed down by forms.

## Acceptance Criteria

1. **Given** any entity creation flow (zone, structure, feature, plant)
   **When** the user enters only a name and confirms (FR29)
   **Then** the entity is created successfully with all optional fields as `undefined`
   **And** no validation errors are shown for missing optional fields

2. **Given** an existing entity with minimal detail
   **When** the user opens its detail view and adds information (e.g., soil type, sun exposure, variety, source, cost) (FR30)
   **Then** each addition is persisted as an individual event (e.g., `PlantUpdated` with the specific field change)
   **And** the materialized state reflects the new detail immediately

3. **Given** an entity with some optional fields filled
   **When** the user views the entity detail
   **Then** filled fields display their values and unfilled optional fields are not shown (no empty field guilt per UX-DR4)

4. **Given** the entity detail view
   **When** the user wants to add more detail
   **Then** an "Add detail" action reveals available optional fields for that entity type

## Tasks / Subtasks

- [ ] Task 1: Define optional field schemas for each entity type (AC: #1, #2)
  - [ ] Extend `Zone` type in `src/lib/types/zone.ts` with optional fields: `soilType?: string`, `sunExposure?: string`, `irrigationType?: string`, `notes?: string`
  - [ ] Extend `Structure` type in `src/lib/types/structure.ts` with optional fields: `description?: string`, `dimensions?: { width: number, length: number }`, `material?: string`, `notes?: string`
  - [ ] Extend `Feature` type in `src/lib/types/feature.ts` with optional fields: `description?: string`, `species?: string`, `age?: string`, `notes?: string`
  - [ ] Create `src/lib/types/plant.ts` with `Plant` interface: `id: UUID`, `name: string`, `position: Point`, `parentZoneId: string`, plus optional fields: `variety?: string`, `source?: string`, `datePlanted?: string`, `cost?: number`, `notes?: string`
  - [ ] Create `StructureUpdated` and `FeatureUpdated` Zod schemas in `src/lib/types/events.ts` with partial update payloads
  - [ ] Ensure `PlantUpdated` Zod schema exists in `src/lib/types/events.ts` with partial update payload
  - [ ] Update the event discriminated union type to include all new update event types
  - [ ] Write unit tests for all update event Zod schemas

- [ ] Task 2: Define available optional fields metadata per entity type (AC: #4)
  - [ ] Create `src/lib/domain/entity-fields.ts` with field metadata definitions
  - [ ] Define `getOptionalFields(entityType: string): FieldDefinition[]` — returns metadata for all optional fields of an entity type
  - [ ] Each `FieldDefinition` includes: `key: string`, `label: string`, `type: 'text' | 'number' | 'select'`, `options?: string[]` (for select fields)
  - [ ] Zone optional fields: soil type (select: Clay, Sandy, Loam, Silt, Peat, Chalk), sun exposure (select: Full Sun, Partial Shade, Full Shade), irrigation type (text), notes (text)
  - [ ] Structure optional fields: description (text), material (text), notes (text)
  - [ ] Feature optional fields: description (text), species (text), age (text), notes (text)
  - [ ] Plant optional fields: variety (text), source (text), date planted (text), cost (number), notes (text)
  - [ ] Write unit tests verifying correct field definitions returned for each entity type

- [ ] Task 3: Implement entity update domain logic (AC: #2)
  - [ ] Create `src/lib/domain/entity-update.ts` with `updateEntity(entityType: string, entityId: string, field: string, value: unknown)` function
  - [ ] Function constructs the appropriate update event (e.g., `ZoneUpdated`, `PlantUpdated`) with the specific field change in the payload
  - [ ] Dispatches the event via `dispatchEvent()` from the materialized state layer
  - [ ] Validate that the field is a valid optional field for the entity type
  - [ ] Validate the value matches the expected type for the field
  - [ ] Write unit tests covering: update zone soil type, update plant variety, update structure material, invalid field rejection

- [ ] Task 4: Add update event reducers in the materialized state layer (AC: #2)
  - [ ] Add `StructureUpdated` reducer that merges the partial update into the existing structure entity
  - [ ] Add `FeatureUpdated` reducer that merges the partial update into the existing feature entity
  - [ ] Ensure `PlantUpdated` and `ZoneUpdated` reducers also handle progressive detail field updates
  - [ ] Ensure reducers produce new state objects (no in-place mutation)
  - [ ] Write unit tests verifying field updates are correctly applied and state rebuilds from event sequences

- [ ] Task 5: Create entity detail view component (AC: #3, #4)
  - [ ] Create `src/lib/ui/entities/EntityDetailView.svelte` — generic detail view that works for any entity type
  - [ ] Display entity name prominently at the top
  - [ ] Show only filled optional fields with their values (AC: #3 — no empty field guilt)
  - [ ] Hide unfilled optional fields entirely from the default view
  - [ ] Add an "Add detail" button/action at the bottom of the filled fields section
  - [ ] Style with Tailwind CSS — clean, minimal layout

- [ ] Task 6: Create "Add detail" expansion panel (AC: #4)
  - [ ] Create `src/lib/ui/entities/AddDetailPanel.svelte` — expandable panel showing available optional fields
  - [ ] On "Add detail" click, reveal all optional fields that are currently `undefined` for the entity
  - [ ] Each field renders with the appropriate input type (text input, number input, select dropdown)
  - [ ] On field value change, call `updateEntity()` from domain logic to persist the change as an individual event
  - [ ] After a field is filled, it moves from the "Add detail" panel to the main detail view
  - [ ] Style unfilled fields with a subtle placeholder appearance to distinguish from filled fields

- [ ] Task 7: Create entity field display component (AC: #3)
  - [ ] Create `src/lib/ui/entities/EntityField.svelte` — reusable component for displaying a single field value
  - [ ] Display field label and value in a consistent layout
  - [ ] Support inline editing — click/tap on a field value to edit it
  - [ ] On edit, persist the change via `updateEntity()` domain function
  - [ ] Handle different value types (text, number, select) with appropriate display formatting

- [ ] Task 8: Wire entity detail view into canvas entity selection (AC: #3, #4)
  - [ ] When a user taps/clicks an entity on the canvas, open the entity detail view
  - [ ] Determine entity type from the selected entity to load correct field definitions
  - [ ] Load current entity state from materialized state
  - [ ] Ensure detail view updates reactively when events are dispatched (field additions reflect immediately)

- [ ] Task 9: Write Playwright E2E tests (AC: #1, #2, #3, #4)
  - [ ] Create `tests/e2e/progressive-detail.spec.ts`
  - [ ] Test: create a zone with name only, verify no validation errors and zone appears on canvas
  - [ ] Test: open zone detail view, verify only name is shown (no empty fields)
  - [ ] Test: click "Add detail", verify optional fields appear
  - [ ] Test: fill in soil type, verify it is persisted as a `ZoneUpdated` event and appears in detail view
  - [ ] Test: verify unfilled fields remain hidden after adding one field
  - [ ] Test: reload app, verify added detail is restored from events

## Dev Notes

### Progressive Detail Philosophy (UX-DR4)

The progressive detail pattern is a core UX principle: no entity should require more than a name to create. This eliminates "empty field guilt" — the psychological friction of seeing many blank fields that feel like they should be filled. Instead:

1. **Create fast** — name only, all optional fields `undefined`
2. **Detail later** — "Add detail" reveals available fields on demand
3. **Show what matters** — filled fields displayed, unfilled fields hidden
4. **Individual persistence** — each field change is its own event, not a bulk save

### Event-Per-Field Pattern

Each field addition generates its own event rather than saving the entire entity:

```typescript
// Adding soil type to a zone
{
  id: crypto.randomUUID(),
  type: 'ZoneUpdated',
  entityId: '<zone-uuid>',
  entityType: 'zone',
  timestamp: new Date().toISOString(),
  payload: {
    soilType: 'Clay'
  }
}

// Adding variety to a plant (separate event)
{
  id: crypto.randomUUID(),
  type: 'PlantUpdated',
  entityId: '<plant-uuid>',
  entityType: 'plant',
  timestamp: new Date().toISOString(),
  payload: {
    variety: 'Cherokee Purple'
  }
}
```

This aligns with the event sourcing architecture — each change is independently trackable, undoable (Epic 6), and auditable.

### Entity Field Definitions

The `entity-fields.ts` module provides metadata that drives the UI dynamically:

```typescript
interface FieldDefinition {
  key: string;        // field name on the entity
  label: string;      // human-readable label
  type: 'text' | 'number' | 'select';
  options?: string[]; // for select fields
}
```

This approach keeps the UI generic — one detail view component works for all entity types, configured by field metadata.

### Architecture Compliance

- **No business logic in Svelte components** — all update logic lives in `src/lib/domain/entity-update.ts`
- **Immutable state transitions** — reducers merge partial updates into new state objects
- **No `null`** — unfilled fields are `undefined`, not `null` (critical for inheritance in Story 3.6)
- **No `Date.now()`** — use `new Date().toISOString()` for ISO 8601
- **No external UUID libraries** — use `crypto.randomUUID()`
- **File naming:** `kebab-case.ts` for TypeScript, `PascalCase.svelte` for components
- **Test co-location:** tests sit next to source files

### What This Story Does NOT Include

- No entity deletion
- No entity type conversion (changing a structure to a feature)
- No bulk editing of multiple entities
- No photo or media attachment to entities
- No entity search or filtering
- No inheritance of field values from parent zones (Story 3.6)

### References

- [Source: _bmad-output/planning-artifacts/architecture.md — Three-Tier State Management]
- [Source: _bmad-output/planning-artifacts/architecture.md — Implementation Patterns & Consistency Rules]
- [Source: _bmad-output/planning-artifacts/epics.md — Story 3.3: Entity Creation with Progressive Detail]
- [Source: _bmad-output/planning-artifacts/prd.md — UX-DR4: No Empty Field Guilt]
