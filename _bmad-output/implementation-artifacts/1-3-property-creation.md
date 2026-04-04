# Story 1.3: Property Creation

Status: backlog

## Story

As a gardener,
I want to create a new property with a name and optional dimensions,
So that I have a named space to represent my garden.

## Acceptance Criteria

1. **Given** the app is loaded with no existing property
   **When** the user enters a property name and submits the creation form
   **Then** a new property is created with a UUID, the name is displayed, and a `PropertyCreated` event is committed to the event store

2. **Given** the property creation form
   **When** the user enters a name only and skips dimensions
   **Then** the property is created successfully with `undefined` dimensions (progressive detail — no validation error)

3. **Given** the property creation form
   **When** the user enters a name and dimensions (width, length, unit)
   **Then** the property is created with dimensions stored and the grid canvas can use them for scale

4. **Given** a property was created in a previous session
   **When** the app is reloaded
   **Then** the property is restored from the event store via snapshot/replay and displayed correctly

## Tasks / Subtasks

- [ ] Task 1: Create property domain logic (AC: #1, #2, #3)
  - [ ] Create `src/lib/domain/property.ts` with a `createProperty()` function that accepts name and optional dimensions
  - [ ] `createProperty()` generates a UUID via `crypto.randomUUID()`, constructs the `PropertyCreated` event data, and calls `dispatchEvent()` from the materialized state layer
  - [ ] Validate property name is a non-empty string before dispatching (throw descriptive error if invalid)
  - [ ] Validate dimensions if provided: width and length must be positive numbers, unit must be `'ft'` or `'m'`
  - [ ] Return the created property entity (extracted from dispatched event payload + entityId)
  - [ ] Create `src/lib/domain/property.test.ts` with unit tests covering: valid name only, valid name + dimensions, empty name rejection, invalid dimensions rejection

- [ ] Task 2: Create property creation form component (AC: #1, #2, #3)
  - [ ] Create `src/lib/ui/onboarding/PropertyCreationForm.svelte`
  - [ ] Add required text input for property name with label and placeholder
  - [ ] Add optional dimensions fieldset: width (number input), length (number input), unit (select: ft/m)
  - [ ] Add submit button with clear label (e.g., "Create Property")
  - [ ] Implement form submission handler that calls `createProperty()` from domain logic
  - [ ] Display inline validation error if property name is empty on submit
  - [ ] Style with Tailwind CSS — mobile-first responsive layout
  - [ ] Dimensions fields should be visually grouped and clearly marked as optional
  - [ ] Disable submit button while form is submitting (prevent double-submit)

- [ ] Task 3: Create property display component (AC: #1, #4)
  - [ ] Create `src/lib/ui/panels/PropertyHeader.svelte` to display property name and dimensions summary
  - [ ] Read property data from the materialized state layer via `getProperties()` / `getProperty()`
  - [ ] Display property name prominently
  - [ ] If dimensions exist, display them formatted (e.g., "50 x 100 ft")
  - [ ] If dimensions are `undefined`, display nothing or a subtle hint (e.g., "Dimensions not set")

- [ ] Task 4: Wire onboarding flow into app route (AC: #1, #4)
  - [ ] Update `src/routes/+page.svelte` to conditionally render based on materialized state
  - [ ] If no property exists (`getProperties().length === 0`), show the `PropertyCreationForm`
  - [ ] If a property exists, show the `PropertyHeader` (and placeholder for future canvas area)
  - [ ] Ensure the materialized state `initialize()` is called on app load (from `+layout.svelte` or `+page.svelte`)
  - [ ] Show a loading indicator while `isLoading()` is true during state initialization
  - [ ] After property creation, the form should disappear and the property header should appear (reactive update via Svelte 5 runes)

- [ ] Task 5: Verify persistence and reload (AC: #4)
  - [ ] Manually verify: create a property, reload the page, confirm property is restored
  - [ ] Write an integration test in `src/lib/domain/property.test.ts` (or separate file) that: commits a `PropertyCreated` event, calls `initializeState()`, and asserts the property is present in the returned state
  - [ ] Ensure snapshot/replay from Story 1.2 correctly restores property state on reload

- [ ] Task 6: Write component tests (AC: #1, #2, #3)
  - [ ] Create `src/lib/ui/onboarding/PropertyCreationForm.test.ts` with Vitest + testing-library or Svelte component testing
  - [ ] Test: submitting with a valid name dispatches a `PropertyCreated` event
  - [ ] Test: submitting with empty name shows validation error and does not dispatch
  - [ ] Test: submitting with name + dimensions includes dimensions in the event
  - [ ] Test: submitting with name only and no dimensions creates property with `undefined` dimensions

## Dev Notes

### Relationship to Story 1.2

This story builds directly on Story 1.2's event store and materialized state layer. The key integration points are:

- **`dispatchEvent()`** from `src/lib/stores/materialized-state.svelte.ts` — commits events and updates reactive state
- **`getProperties()`** / **`getProperty()`** — read materialized property state (Svelte 5 runes, reactive)
- **`initialize()`** — called on app load to replay events from Dexie and restore state
- **`PropertyCreatedSchema`** from `src/lib/types/events.ts` — Zod schema that validates the event shape
- **`PropertySchema`** / **`DimensionsSchema`** from `src/lib/types/entities.ts` — entity type definitions

### Canonical Pattern: Form to Event to State

This story establishes the canonical data flow pattern for the entire app:

```
User fills form → domain function called → dispatchEvent() → commitEvent() persists to Dexie
                                                            → applyEvent() updates materialized state
                                                            → Svelte 5 runes reactivity updates UI
```

All future entity creation stories (zones, beds, plants) should follow this same pattern.

### PropertyCreated Event Shape

The event dispatched by the domain logic should match the existing `PropertyCreatedSchema`:

```typescript
{
  type: 'PropertyCreated',
  entityId: crypto.randomUUID(),  // becomes the property ID
  entityType: 'property',
  payload: {
    name: 'My Garden',
    dimensions: { width: 50, length: 100, unit: 'ft' }  // optional
  }
}
```

The `id` and `timestamp` fields are added automatically by `commitEvent()`.

### Progressive Detail

Dimensions are optional by design — the user can create a property with just a name and add dimensions later (via a future `PropertyUpdated` event). The form should make this clear:
- Property name: required, validated as non-empty
- Dimensions: clearly optional, collapsed or de-emphasized in the UI
- No validation error when dimensions are omitted

### Form Design Guidance

- Mobile-first: single-column layout, full-width inputs
- Property name input should be prominent and focused on load
- Dimensions section should be visually secondary (collapsible toggle or clearly labeled "Optional")
- Use Tailwind utility classes directly — no custom CSS files
- Consider `<fieldset>` with `<legend>` for the dimensions group
- Submit button should use a primary color from the design system

### Relationship to Architecture Doc's PropertySetup.svelte

The architecture doc defines `src/lib/ui/onboarding/PropertySetup.svelte` as the guided property creation component covering FR84-86. `PropertyCreationForm.svelte` in this story is a focused sub-component handling only the creation form. Story 1.7 will introduce `PropertySetupFlow.svelte` which orchestrates the full onboarding flow (create property → draw boundary → set north). The architecture's `PropertySetup.svelte` may be introduced at that point or as a later wrapper — `PropertyCreationForm.svelte` is intentionally scoped to just the form.

### Domain Logic Separation

All business logic lives in `src/lib/domain/property.ts`, not in the Svelte component. The component only:
1. Collects form input
2. Calls the domain function
3. Reacts to state changes

The domain function:
1. Validates input
2. Constructs event data
3. Calls `dispatchEvent()`

### File Naming Conventions

| File | Path |
|------|------|
| Domain logic | `src/lib/domain/property.ts` |
| Domain tests | `src/lib/domain/property.test.ts` |
| Creation form | `src/lib/ui/onboarding/PropertyCreationForm.svelte` |
| Form tests | `src/lib/ui/onboarding/PropertyCreationForm.test.ts` |
| Property header | `src/lib/ui/panels/PropertyHeader.svelte` |

### Validation Rules

- Property name: non-empty string (`z.string().min(1)` — already enforced by `PropertyCreatedSchema`)
- Width: positive number (`z.number().positive()`)
- Length: positive number (`z.number().positive()`)
- Unit: `'ft'` or `'m'` only (`z.enum(['ft', 'm'])`)
- Zod validation happens at two layers: domain function (early feedback) and `commitEvent()` (safety net)

### What This Story Does NOT Include

- No property editing or updating (future story with `PropertyUpdated` event)
- No property deletion
- No Konva canvas rendering (Story 1.4)
- No grid overlay or spatial visualization
- No multi-property support (MVP assumes one property)
- No north orientation setting

### References

- [Source: _bmad-output/planning-artifacts/architecture.md — Three-Tier State Architecture]
- [Source: _bmad-output/planning-artifacts/architecture.md — Project Structure & Boundaries]
- [Source: _bmad-output/planning-artifacts/architecture.md — Implementation Patterns & Consistency Rules]
- [Source: _bmad-output/planning-artifacts/epics.md — Story 1.3: Property Creation]
- [Source: _bmad-output/implementation-artifacts/1-2-event-store-and-property-data-model.md — Event Store API]
