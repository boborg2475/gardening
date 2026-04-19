---
stepsCompleted:
  - step-01-preflight-and-context
  - step-02-generation-mode
  - step-03-test-strategy
  - step-04-generate-tests
  - step-04c-aggregate
  - step-05-validate-and-complete
lastStep: step-05-validate-and-complete
lastSaved: '2026-04-19'
storyId: '2.1'
storyTitle: 'Network Boundary Module & Tile Provider'
detectedStack: frontend
inputDocuments:
  - _bmad-output/implementation-artifacts/2-1-network-boundary-module-and-tile-provider.md
  - _bmad/tea/testarch/knowledge/data-factories.md
  - _bmad/tea/testarch/knowledge/test-quality.md
  - _bmad/tea/testarch/knowledge/test-healing-patterns.md
  - _bmad/tea/testarch/knowledge/selector-resilience.md
---

# ATDD Checklist — Story 2.1: Network Boundary Module & Tile Provider

## Step 1: Preflight & Context

- Stack: frontend (SvelteKit + Playwright)
- Story: 2.1 — Network Boundary Module & Tile Provider
- Test framework: Playwright (tests/e2e/, *.e2e.ts)
- Knowledge loaded: data-factories, test-quality, test-healing-patterns, selector-resilience
- Playwright Utils: not enabled
- Pact.js: not enabled

### Acceptance Criteria

1. Network boundary module at `src/lib/network/` — `tile-provider.ts` and `tile-cache.ts` ONLY files permitted to use `fetch`
2. Tiles load from configured provider within 3 seconds (NFR5)
3. Fetched tiles cached in IndexedDB for offline re-viewing
4. Cached tiles render from cache without network requests
5. Graceful degradation when provider unavailable — clear message + manual grid fallback (NFR16)

## Step 2: Generation Mode

- Mode: AI Generation
- Rationale: Clear ACs, standard scenarios (network fetch, caching, error handling, UI fallback). No complex UI recording needed.

## Step 3: Test Strategy

### AC → Scenario Mapping

| AC | Scenario | Level | Priority | Red Phase Rationale |
|----|----------|-------|----------|---------------------|
| AC#1 | No `fetch` outside `src/lib/network/` | CI check | P0 | Fails if fetch found elsewhere |
| AC#2 | Tile loads for valid coordinates | E2E | P0 | No tile provider exists |
| AC#2 | Tile loading within 3s budget (NFR5) | E2E | P1 | No implementation |
| AC#3 | Fetched tile stored in IndexedDB | E2E | P0 | No cache exists |
| AC#4 | Cached tile served without network | E2E | P0 | No cache-first logic |
| AC#5 | Unavailable message when provider down | E2E | P0 | No fallback UI |
| AC#5 | "Use Manual Grid" navigates to grid setup | E2E | P1 | No button exists |
| AC#5 | "Retry" re-checks provider status | E2E | P2 | No retry logic |

### Test Levels

- **E2E (Playwright):** All user-facing scenarios — tile loading, caching behavior, fallback UI
- **CI check:** Network boundary enforcement via grep
- **Unit tests:** Will be written alongside implementation (Zod validation, tile math) — not part of ATDD E2E scope

### Priorities

- **P0:** Core flow — tiles load, cache works, fallback shows
- **P1:** Performance budget, manual grid navigation
- **P2:** Retry button behavior

### Red Phase Confirmation

All E2E tests will fail before implementation because:
- No tile provider module exists
- No tile cache exists
- No NetworkUnavailable component exists
- No route handling for satellite view exists

## Step 4: Test Generation (RED Phase)

### Generated Test Files

| File | Level | Tests | TDD Phase |
|------|-------|-------|-----------|
| `tests/e2e/tile-loading.e2e.ts` | E2E | 7 | RED (test.skip) |
| `src/lib/types/tiles.test.ts` | Unit | 8 | RED (it.skip) |
| `src/lib/network/tile-grid.test.ts` | Unit | 9 | RED (it.skip) |
| `src/lib/network/tile-cache.test.ts` | Unit | 7 | RED (it.skip) |
| `src/lib/network/tile-provider.test.ts` | Unit | 9 | RED (it.skip) |
| `src/lib/network/tile-loader.test.ts` | Unit | 4 | RED (it.skip) |

### Summary

- **Total test files:** 6
- **Total tests:** 44
- **All tests use `.skip()`** — TDD red phase confirmed
- **Priority coverage:** P0: 21, P1: 15, P2: 8
- **AC coverage:** All 5 acceptance criteria have test coverage
- **Fixture needs:** fake-indexeddb (already installed), vi.stubGlobal for fetch mocking, Playwright route mocking for E2E

### AC → Test Traceability

| AC | Test Files | Test Count |
|----|-----------|------------|
| AC#1 | tiles.test.ts, tile-provider.test.ts | 8 |
| AC#2 | tile-loading.e2e.ts, tile-grid.test.ts, tile-provider.test.ts, tile-loader.test.ts | 18 |
| AC#3 | tile-loading.e2e.ts, tile-cache.test.ts, tile-provider.test.ts | 9 |
| AC#4 | tile-loading.e2e.ts, tile-cache.test.ts, tile-provider.test.ts | 5 |
| AC#5 | tile-loading.e2e.ts, tile-provider.test.ts, tile-loader.test.ts | 7 |

## Step 5: Validation & Completion

### Validation Results

- [x] Prerequisites satisfied (Playwright + Vitest configured, story approved)
- [x] Test files created with correct naming conventions (*.test.ts, *.e2e.ts)
- [x] All tests use describe.skip() / test.skip() — TDD red phase
- [x] All 5 acceptance criteria have test coverage
- [x] Unit tests run and skip correctly (43 skipped, 0 failures)
- [x] E2E test file passes ESLint
- [x] Full existing test suite unaffected (23 passed, 348 tests green)
- [x] No CLI sessions to clean up (AI generation mode)
- [x] Artifacts stored in _bmad-output/test-artifacts/

### Next Steps

1. **Implement Story 2.1** — build the network boundary module
2. **Remove describe.skip()** from unit tests as each module is implemented
3. **Remove test.skip()** from E2E tests when satellite UI is wired up
4. **Verify GREEN phase** — all tests pass after implementation
