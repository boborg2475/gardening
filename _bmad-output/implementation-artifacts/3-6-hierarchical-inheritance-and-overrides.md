# Story 3.6: Hierarchical Inheritance & Overrides

Status: ready-for-dev

## Story

As a gardener,
I want child zones to inherit properties from their parent (soil type, sun exposure) and override them when needed,
So that I only set shared properties once at the parent level and customize where things differ.

## Acceptance Criteria

1. **Given** a parent zone with soil type set to "Clay"
   **When** a child zone is created within it (FR31)
   **Then** the child zone inherits soil type "Clay" without the user setting it explicitly

2. **Given** a child zone inheriting soil type from its parent
   **When** the user sets a local soil type on the child zone (FR32)
   **Then** the child zone displays the locally set value instead of the inherited value
   **And** a `ZoneUpdated` event records the override

3. **Given** a child zone with a local override
   **When** the user clears the override (FR33)
   **Then** the child zone reverts to inheriting the parent's value
   **And** the cleared field is set to `undefined` (not `null`) to restore inheritance

4. **Given** an entity detail view
   **When** the user views properties on a zone (FR34)
   **Then** inherited values are visually distinguished from locally overridden values (e.g., different text style, "inherited from [Parent Name]" label)

5. **Given** a three-level hierarchy (Property > Garden > Bed)
   **When** the middle zone has an override and the bottom zone does not
   **Then** the bottom zone inherits from the middle zone's override, not from the top-level property

6. **Given** a parent zone's property is changed
   **When** child zones inherit from that parent
   **Then** the inherited values update automatically in the materialized state for all non-overridden children

## Tasks / Subtasks

- [ ] Task 1: Define inheritable property types and schemas (AC: #1, #2, #3)
  - [ ] Create `src/lib/types/inheritance.ts` with `InheritableProperties` interface: `soilType?: string`, `sunExposure?: string`, `irrigationType?: string`, `hardinessZone?: string`
  - [ ] Define `ResolvedProperty<T>` type: `{ value: T, source: 'local' | 'inherited', sourceZoneId?: string, sourceZoneName?: string }`
  - [ ] Define `InheritanceResolution` type: a map of field names to `ResolvedProperty` values
  - [ ] Write unit tests for type construction and validation

- [ ] Task 2: Implement inheritance resolution logic (AC: #1, #5, #6)
  - [ ] Create `src/lib/domain/inheritance.ts` with pure functions for property inheritance
  - [ ] Implement `resolveInheritedValue(field: string, zoneId: string, zones: Zone[]): ResolvedProperty | undefined` — walks the ancestor chain to find the nearest value for a field
  - [ ] Walk from child to parent to grandparent (etc.) until a local value is found or the root is reached
  - [ ] If the zone has a local value for the field, return it with `source: 'local'`
  - [ ] If the zone does not have a local value, check the parent zone, and so on up the hierarchy
  - [ ] Return `undefined` if no zone in the chain has the value set
  - [ ] Implement `resolveAllProperties(zoneId: string, zones: Zone[]): InheritanceResolution` — resolves all inheritable fields for a zone
  - [ ] Write unit tests covering: local value, single-level inheritance, multi-level inheritance (3+ levels), no value in chain, middle override hides top value (AC: #5)

- [ ] Task 3: Implement override and clear-override domain logic (AC: #2, #3)
  - [ ] Add `setOverride(zoneId: string, field: string, value: unknown)` function in `src/lib/domain/inheritance.ts` — dispatches a `ZoneUpdated` event with the local value
  - [ ] Add `clearOverride(zoneId: string, field: string)` function — dispatches a `ZoneUpdated` event setting the field to `undefined` (NOT `null`)
  - [ ] Validate that the field is an inheritable property
  - [ ] Validate that the value matches the expected type for the field
  - [ ] Write unit tests covering: set override, clear override restores inheritance, clear on zone with no override (no-op)

- [ ] Task 4: Implement cascading update detection (AC: #6)
  - [ ] Create `src/lib/domain/inheritance-cascade.ts` with cascade detection logic
  - [ ] Implement `getAffectedDescendants(zoneId: string, field: string, zones: Zone[]): string[]` — returns zone IDs of all descendants that inherit the given field (i.e., do not have a local override)
  - [ ] This function does NOT dispatch events — it identifies which zones will be affected by a parent change
  - [ ] The materialized state layer uses this to reactively update resolved values when a parent changes
  - [ ] Write unit tests covering: single child inherits, child with override not affected, deep hierarchy with mixed overrides

- [ ] Task 5: Integrate inheritance into the materialized state layer (AC: #1, #6)
  - [ ] Extend the materialized state to compute resolved inherited values for all zones
  - [ ] When a `ZoneUpdated` event changes an inheritable property, recompute resolved values for all descendant zones
  - [ ] Store resolved values as derived state (computed from zone hierarchy, not stored in events)
  - [ ] Ensure resolved values update automatically when parent zones change (reactive derivation)
  - [ ] Write unit tests verifying: parent change cascades to non-overridden children, parent change does not cascade to overridden children

- [ ] Task 6: Create inheritance-aware entity detail view (AC: #4)
  - [ ] Extend `src/lib/ui/entities/EntityDetailView.svelte` (from Story 3.3) to display inheritance information
  - [ ] For each inheritable field, show the resolved value with its source
  - [ ] Locally overridden values: display with normal text style and a small "overridden" indicator
  - [ ] Inherited values: display with a distinct style (e.g., italic text, lighter color) and "inherited from [Parent Name]" label
  - [ ] Fields with no value (not set anywhere in the hierarchy): hidden per progressive detail (Story 3.3)

- [ ] Task 7: Create override and clear-override UI controls (AC: #2, #3, #4)
  - [ ] Create `src/lib/ui/entities/InheritableField.svelte` — reusable component for a single inheritable field
  - [ ] When showing an inherited value: display an "Override" action that allows the user to set a local value
  - [ ] When showing an overridden value: display a "Clear override" action that restores inheritance
  - [ ] "Override" action reveals an inline editor for the field value
  - [ ] "Clear override" calls `clearOverride()` from domain logic and visually transitions back to the inherited style
  - [ ] Write unit tests for the component's state transitions

- [ ] Task 8: Create inheritance indicator canvas component (AC: #4)
  - [ ] Create `src/lib/canvas/map/InheritanceIndicator.svelte` — optional small visual indicator on zones showing inheritance status
  - [ ] Consider a small icon or badge on the zone polygon indicating whether properties are inherited or overridden
  - [ ] Keep this subtle to avoid visual clutter — it is informational, not primary
  - [ ] This component is optional and can be deferred if it adds too much visual noise

- [ ] Task 9: Write Playwright E2E tests (AC: #1, #2, #3, #4, #5, #6)
  - [ ] Create `tests/e2e/inheritance.spec.ts`
  - [ ] Test: set soil type on parent zone, create child zone, verify child inherits soil type
  - [ ] Test: override soil type on child zone, verify child displays local value
  - [ ] Test: clear override on child zone, verify child reverts to inherited value
  - [ ] Test: verify inherited values display with "inherited from [Parent]" label
  - [ ] Test: verify overridden values display with "overridden" indicator
  - [ ] Test: three-level hierarchy — set top, override middle, verify bottom inherits from middle
  - [ ] Test: change parent property, verify non-overridden children update automatically
  - [ ] Test: reload app, verify inheritance relationships restored from events

## Dev Notes

### Inheritance Resolution Algorithm

The inheritance algorithm walks the zone hierarchy from child to root, looking for the nearest local value:

```typescript
function resolveInheritedValue(
  field: string,
  zoneId: string,
  zones: Map<string, Zone>
): ResolvedProperty | undefined {
  let currentZone = zones.get(zoneId);

  while (currentZone) {
    const localValue = currentZone[field];
    if (localValue !== undefined) {
      return {
        value: localValue,
        source: currentZone.id === zoneId ? 'local' : 'inherited',
        sourceZoneId: currentZone.id,
        sourceZoneName: currentZone.name
      };
    }
    currentZone = currentZone.parentId
      ? zones.get(currentZone.parentId)
      : undefined;
  }

  return undefined; // No value set anywhere in the chain
}
```

### undefined vs null (Critical)

The distinction between `undefined` and `null` is semantically important for inheritance:

- **`undefined`** — the field has no local value; inherit from parent
- **`null`** — NEVER used (per project convention)

When clearing an override, the field MUST be set to `undefined`, not deleted from the object. The `ZoneUpdated` event payload explicitly sets the field to `undefined`:

```typescript
// Clear override event
{
  type: 'ZoneUpdated',
  entityId: '<zone-uuid>',
  entityType: 'zone',
  payload: {
    soilType: undefined  // restores inheritance
  }
}
```

### Cascading Updates

When a parent zone's inheritable property changes, the materialized state must recompute resolved values for all descendants. This is a derived computation, not stored in events:

```
Parent (soilType: "Clay") → changed to "Loam"
  ├── Child A (soilType: undefined) → inherits "Loam" (auto-updated)
  ├── Child B (soilType: "Sandy") → keeps "Sandy" (local override, unaffected)
  └── Child C (soilType: undefined) → inherits "Loam" (auto-updated)
       └── Grandchild (soilType: undefined) → inherits "Loam" (auto-updated)
```

### Three-Level Override Example (AC: #5)

```
Property (sunExposure: "Full Sun")
  └── Garden (sunExposure: "Partial Shade")  ← override
       └── Bed (sunExposure: undefined)       ← inherits "Partial Shade" from Garden, NOT "Full Sun" from Property
```

The resolution walks up from Bed to Garden and finds "Partial Shade" — it stops there and does not continue to Property.

### Visual Distinction Design

Inherited vs overridden values should be clearly distinguishable in the detail view:

```
┌─────────────────────────────────────┐
│ Raised Bed 1                        │
│                                     │
│ Soil Type: Clay                     │
│   └ inherited from "Backyard"       │
│   [Override]                        │
│                                     │
│ Sun Exposure: Partial Shade  ✎      │
│   └ overridden locally              │
│   [Clear override]                  │
│                                     │
│ [+ Add detail]                      │
└─────────────────────────────────────┘
```

### Performance Considerations

- Inheritance resolution is a tree traversal — for deeply nested hierarchies, cache resolved values
- Cascading updates on parent change should use `getDescendants()` from `hierarchy.ts` (Story 3.1) to find affected zones efficiently
- Resolved values should be computed lazily (on access) or eagerly (on event) depending on performance characteristics — start with eager computation and optimize if needed

### Architecture Compliance

- **No business logic in Svelte components** — all inheritance logic lives in `src/lib/domain/inheritance.ts` and `src/lib/domain/inheritance-cascade.ts`
- **Immutable state transitions** — domain functions return new state objects, never mutate
- **No `null`** — use `undefined` for cleared overrides (CRITICAL for inheritance semantics)
- **No `Date.now()`** — use `new Date().toISOString()` for ISO 8601
- **No external UUID libraries** — use `crypto.randomUUID()`
- **File naming:** `kebab-case.ts` for TypeScript, `PascalCase.svelte` for components
- **Test co-location:** tests sit next to source files

### What This Story Does NOT Include

- No inheritance for plant entities (plants do not inherit from zones in this story)
- No cross-zone inheritance (only parent-child within the same hierarchy)
- No inheritance conflict resolution UI (e.g., choosing between two parents)
- No inheritance history or audit trail
- No bulk override operations across multiple zones
- No property-level inheritable defaults (only zone-to-zone)

### References

- [Source: _bmad-output/planning-artifacts/architecture.md — Three-Tier State Management]
- [Source: _bmad-output/planning-artifacts/architecture.md — Implementation Patterns & Consistency Rules]
- [Source: _bmad-output/planning-artifacts/architecture.md — Domain Logic: hierarchy.ts, inheritance.ts]
- [Source: _bmad-output/planning-artifacts/epics.md — Story 3.6: Hierarchical Inheritance & Overrides]
