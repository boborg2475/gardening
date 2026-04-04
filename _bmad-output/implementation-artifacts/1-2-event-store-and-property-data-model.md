# Story 1.2: Event Store & Property Data Model

Status: review

## Story

As a developer,
I want an event-sourced data layer with Zod-validated events, Dexie persistence, and materialized state,
so that all future features can persist and query data reliably with zero data loss.

## Acceptance Criteria

1. **Given** the Dexie database schema
   **When** the database is initialized
   **Then** tables exist for `properties`, `events`, and `snapshots` with correct indexes
   **And** the `properties` table has fields: `id` (UUID), `name` (string), `dimensions` (optional), `geometry` (optional), `northOrientation` (optional)

2. **Given** a valid event object (e.g., `PropertyCreated`)
   **When** the event is committed to the event store
   **Then** it is validated by Zod before write, assigned a UUID and ISO 8601 timestamp, and persisted atomically to the `events` table in IndexedDB

3. **Given** an invalid event object (e.g., missing required fields)
   **When** the event is committed to the event store
   **Then** the Zod validation fails, the event is NOT written to IndexedDB, and an error is logged to the console

4. **Given** events exist in the event store
   **When** the materialized state layer replays events at startup
   **Then** the current state of all properties is computed correctly from the event history
   **And** a snapshot is written for future fast startup

5. **Given** a snapshot exists from a previous session
   **When** the app starts
   **Then** only events since the last snapshot are replayed
   **And** a splash screen is displayed during replay

6. **Given** more than 1,000 events since the last snapshot
   **When** the app starts
   **Then** a "Optimizing your data..." message is displayed during extended replay

7. **Given** the materialized state layer
   **When** a new event is committed
   **Then** the materialized state updates in-memory immediately via immutable update (new object creation, not mutation)
   **And** Svelte 5 runes trigger reactive UI updates

## Tasks / Subtasks

- [x] Task 1: Define TypeScript types and Zod schemas (AC: #1, #2, #3)
  - [x] Create `src/lib/types/entities.ts` — Property entity type with id, name, dimensions?, geometry?, northOrientation?
  - [x] Create `src/lib/types/events.ts` — Event base type and PropertyCreated discriminated union with Zod schemas
  - [x] Create `src/lib/types/geometry.ts` — Polygon, Point type stubs (geometry details come in later stories)
  - [x] Use `undefined` for "not provided" fields, `null` for "explicitly cleared" per architecture
  - [x] Use `.optional()` for undefined-able fields, `.nullable().optional()` for null-or-undefined fields in Zod
- [x] Task 2: Create Dexie database schema (AC: #1)
  - [x] Create `src/lib/data/db.ts` — Dexie database with `properties`, `events`, `snapshots` tables
  - [x] Define indexes: events table indexed by `entityId`, `type`, `timestamp`; snapshots by `timestamp`
  - [x] Write `src/lib/data/db.test.ts` — verify tables exist and schema is correct
- [x] Task 3: Implement event store with Zod validation (AC: #2, #3)
  - [x] Create `src/lib/data/event-store.ts` — `commitEvent()` function that validates with Zod, assigns UUID + ISO 8601 timestamp, writes atomically to Dexie
  - [x] On Zod validation failure: do NOT write, log `console.error()` with details, throw/return error
  - [x] On successful commit: return the persisted event
  - [x] Write `src/lib/data/event-store.test.ts` — test valid commit, invalid rejection, UUID assignment, timestamp format
- [x] Task 4: Implement snapshot and replay (AC: #4, #5, #6)
  - [x] Add replay logic to event store: `replayEvents(sinceSnapshot?)` that rebuilds entity state from events
  - [x] Add snapshot logic: `writeSnapshot(state)` that saves current materialized state to `snapshots` table
  - [x] On startup: load latest snapshot, replay only events after snapshot timestamp
  - [x] If no snapshot exists: replay all events from beginning
  - [x] Safety valve: if events since snapshot > 1,000, log extended replay warning
  - [x] Write tests for: full replay, snapshot-based partial replay, safety valve threshold
- [x] Task 5: Create materialized state layer (AC: #4, #7)
  - [x] Create `src/lib/stores/materialized-state.svelte.ts` — Svelte 5 runes-based reactive state
  - [x] State holds current property entities computed from events
  - [x] On event commit: update state via immutable update (new object, never mutate)
  - [x] Expose reactive state for UI consumption via runes ($state)
  - [x] Write `src/lib/stores/materialized-state.test.ts` — test state rebuilds from events, immutable updates, reactivity
- [x] Task 6: Create test fixtures (AC: all)
  - [x] Create `test/fixtures/events.ts` — factory functions for PropertyCreated and other test events
  - [x] Create `test/fixtures/entities.ts` — factory functions for Property test entities
  - [x] Ensure factories generate valid UUIDs and ISO 8601 timestamps
- [x] Task 7: Integration verification
  - [x] Write integration test: commit event → state updates → snapshot written → reload → state restored
  - [x] Run full test suite — all pass, no regressions
  - [x] Run lint — passes
  - [x] Run build — passes

## Dev Notes

### Event Payload Structure (MANDATORY)

Every event MUST follow this exact shape:

```typescript
{
  id: string                    // crypto.randomUUID()
  type: 'PropertyCreated'       // PascalCase discriminator
  entityId: string              // target entity UUID
  entityType: 'property'        // routes to correct Dexie table
  timestamp: string             // ISO 8601: new Date().toISOString()
  payload: { ... }              // type-specific data
}
```

- All fields required on every event — no optional event metadata
- `payload` structure varies by event type, defined by Zod discriminated union
- Events validated by Zod before commit — invalid events NEVER reach IndexedDB

### Property Entity Type

For this story, only the Property entity is needed:

```typescript
interface Property {
  id: string;           // crypto.randomUUID()
  name: string;         // required
  dimensions?: {        // undefined = not provided yet
    width: number;
    length: number;
    unit: 'ft' | 'm';
  };
  geometry?: Polygon;   // undefined = not drawn yet
  northOrientation?: number;  // undefined = not set
}
```

### Dexie Table Schema

```typescript
// Table names: lowercase plural
db.version(1).stores({
  properties: 'id, name',
  events: 'id, entityId, entityType, type, timestamp',
  snapshots: 'id, timestamp'
});
```

Architecture specifies separate tables per entity type (`zones`, `structures`, `features`, `plants`) but those are NOT created in this story — only `properties` for now. Other entity tables will be added in Epic 3 stories.

### Three-Tier State Architecture

```
Dexie (persistence) → Materialized State (Svelte 5 runes) → UI/Canvas (reads reactively)
```

- Dexie owns persistence — append-only event writes
- Materialized state layer owns current computed state — rebuilt from events at startup, updated in-memory on each commit
- UI/Canvas reads from materialized state via runes — NEVER queries Dexie directly
- This separation is critical for 60fps rendering

### Snapshot-on-Startup Strategy

1. App starts → show splash screen
2. Load latest snapshot from `snapshots` table
3. If snapshot exists: replay only events with timestamp > snapshot.timestamp
4. If no snapshot: replay ALL events
5. If events since snapshot > 1,000: show "Optimizing your data..." message
6. Write fresh snapshot with rebuilt state
7. Display app

No reliance on close/background lifecycle events — snapshot is always written at startup.

### Null Handling (CRITICAL)

- `undefined` = "not provided" — field not yet entered (progressive detail)
- `null` = "explicitly cleared" — user removed a value, do NOT inherit from parent
- Zod: `.optional()` for undefined-able, `.nullable().optional()` for either
- This distinction is critical for hierarchical inheritance in later stories

### Zod Version Note

Project uses Zod 4.3.x (installed in Story 1.1). Zod 4 has a different API from Zod 3:
- Import: `import { z } from 'zod'` (same)
- Discriminated unions: `z.discriminatedUnion('type', [...])` (same API)
- Check the Zod 4 docs if any API differences arise

### Error Handling

| Error | Action | User Feedback |
|-------|--------|---------------|
| Zod validation failure | `console.error()`, do not commit | Toast: "Couldn't save that change. Please try again." |
| IndexedDB write error | Log error details | "Storage is full. Export your data to free space." |
| Snapshot replay error | Log, attempt full replay from event 0 | Splash screen: "Rebuilding your data..." |

### Previous Story Learnings (from Story 1.1)

- Actual installed versions: Dexie 4.4.x, Zod 4.3.x, Vitest 4.1.x, TypeScript 6.0.x, Svelte 5.54.x
- Vitest uses `--passWithNoTests` flag in npm scripts
- Test files co-located: `event-store.ts` → `event-store.test.ts` (same directory)
- Shared test fixtures go in `test/fixtures/`
- ESLint and Prettier ignore `_bmad/` and `_bmad-output/` directories
- File naming: `kebab-case.ts` for TypeScript modules

### What This Story Does NOT Include

- No zone, structure, feature, or plant entity types (Epic 3)
- No canvas rendering (Story 1.4)
- No property creation UI/forms (Story 1.3)
- No undo/compensating events (Story 7.1)
- No hierarchy traversal or inheritance (Story 3.6)
- No splash screen UI component — just the replay/snapshot logic. Splash screen display is wired in Story 1.3 or later.

### File Locations

| File | Purpose |
|------|---------|
| `src/lib/types/entities.ts` | Property type definition + Zod schema |
| `src/lib/types/events.ts` | Event discriminated unions + Zod schemas |
| `src/lib/types/geometry.ts` | Polygon, Point type stubs |
| `src/lib/data/db.ts` | Dexie database schema |
| `src/lib/data/db.test.ts` | Database schema tests |
| `src/lib/data/event-store.ts` | Event commit, replay, snapshot |
| `src/lib/data/event-store.test.ts` | Event store tests |
| `src/lib/stores/materialized-state.svelte.ts` | Reactive state from events |
| `src/lib/stores/materialized-state.test.ts` | Materialized state tests |
| `test/fixtures/events.ts` | Test event factories |
| `test/fixtures/entities.ts` | Test entity factories |

### Architecture Compliance

**MANDATORY naming:**
- Variables/functions: `camelCase`
- Types/interfaces: `PascalCase`
- Constants: `UPPER_SNAKE_CASE`
- Event types: `PascalCase` verb+noun — `PropertyCreated`
- Dexie tables: lowercase plural — `properties`, `events`, `snapshots`
- Files: `kebab-case.ts`

**FORBIDDEN:**
- No `Date.now()` — use `new Date().toISOString()` (ISO 8601)
- No external UUID libraries — use `crypto.randomUUID()`
- No in-place mutation of state objects
- No direct Dexie queries from UI/canvas components
- No `null` when `undefined` is semantically correct

### References

- [Source: _bmad-output/planning-artifacts/architecture.md — Data Architecture]
- [Source: _bmad-output/planning-artifacts/architecture.md — Communication Patterns / Event Payload Structure]
- [Source: _bmad-output/planning-artifacts/architecture.md — Format Patterns / Null Handling]
- [Source: _bmad-output/planning-artifacts/architecture.md — Frontend Architecture / State Management]
- [Source: _bmad-output/planning-artifacts/architecture.md — Process Patterns / Error Handling]
- [Source: _bmad-output/planning-artifacts/epics.md — Story 1.2: Event Store & Property Data Model]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (1M context)

### Debug Log References

- Dexie requires fake-indexeddb polyfill for Node.js/Vitest tests — installed fake-indexeddb as devDep
- Timestamp-based snapshot queries had race conditions in tests when events committed within same millisecond — added small delay in snapshot integration test
- Zod 4.3.x API confirmed compatible: z.discriminatedUnion, z.literal, z.string().uuid(), z.string().datetime() all work as expected
- Prettier auto-formatted event-store.ts after initial write

### Completion Notes List

- All 7 acceptance criteria satisfied
- Dexie schema with properties, events, snapshots tables and correct indexes
- Event store with Zod validation: commitEvent validates before write, rejects invalid events
- Snapshot-on-startup: initializeState loads snapshot + replays newer events, writes fresh snapshot
- EXTENDED_REPLAY_THRESHOLD constant at 1,000 for safety valve
- Materialized state layer with Svelte 5 $state runes — immutable updates, reactive getters
- PropertyCreated and PropertyUpdated event types with discriminated union
- 28 tests across 3 test files, all passing
- Test fixtures with factory functions for events and entities

### Change Log

- 2026-04-04: Story 1.2 implemented — event-sourced data layer with Zod validation, Dexie persistence, snapshot/replay, and Svelte 5 materialized state

### File List

- src/lib/types/geometry.ts (new)
- src/lib/types/entities.ts (new)
- src/lib/types/events.ts (new)
- src/lib/data/db.ts (new)
- src/lib/data/db.test.ts (new)
- src/lib/data/event-store.ts (new)
- src/lib/data/event-store.test.ts (new)
- src/lib/stores/materialized-state.svelte.ts (new)
- src/lib/stores/materialized-state.test.ts (new)
- test/fixtures/events.ts (new)
- test/fixtures/entities.ts (new)
- package.json (modified — added fake-indexeddb devDep)
- package-lock.json (modified)
