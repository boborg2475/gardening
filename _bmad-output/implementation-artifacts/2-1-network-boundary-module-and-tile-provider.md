# Story 2.1: Network Boundary Module & Tile Provider

Status: ready-for-dev

## Story

As a developer,
I want an isolated network module that handles all satellite tile fetching and caching,
So that the privacy guarantee is enforceable and satellite imagery is available offline after initial load.

## Acceptance Criteria

1. **Given** the project structure
   **When** the network boundary module is created at `src/lib/network/`
   **Then** it contains `tile-provider.ts` and `tile-cache.ts` as the ONLY files in the codebase permitted to use `fetch`
   **And** no other module in the codebase imports `fetch` or makes network requests

2. **Given** valid coordinates or an address
   **When** the tile provider fetches satellite imagery
   **Then** tiles load from the configured third-party provider and render within 3 seconds on standard broadband (NFR5)

3. **Given** satellite tiles have been loaded
   **When** the tiles are fetched successfully
   **Then** they are cached in IndexedDB via `tile-cache.ts` for offline re-viewing

4. **Given** cached tiles exist in IndexedDB
   **When** the user views the satellite view offline
   **Then** previously loaded tiles render from cache without network requests

5. **Given** the tile provider is unavailable (network error, service down)
   **When** the user attempts satellite-based setup
   **Then** a clear message explains that satellite view is unavailable and offers the manual grid drawing as a full alternative (NFR16)

## Tasks / Subtasks

- [ ] Task 1: Define tile provider types and configuration (AC: #1, #2)
  - [ ] Create `src/lib/types/tiles.ts` with types: `TileCoordinate` (`{ x: number; y: number; z: number }`), `TileUrl`, `TileProviderConfig` (provider URL template, attribution, max zoom, API key)
  - [ ] Define `TileLoadResult` discriminated union: `{ status: 'loaded'; data: Blob }` | `{ status: 'cached'; data: Blob }` | `{ status: 'error'; message: string }`
  - [ ] Define `TileProviderStatus` type: `'available' | 'unavailable' | 'unknown'`
  - [ ] Add Zod schemas for tile coordinate validation (z must be within valid zoom range, x/y within tile grid bounds)
  - [ ] Write unit tests for type validation

- [ ] Task 2: Implement tile cache with IndexedDB via Dexie (AC: #3, #4)
  - [ ] Create `src/lib/network/tile-cache.ts` — the sole tile caching module
  - [ ] Define a Dexie table `tilecache` with schema: `{ key: string; blob: Blob; timestamp: string; z: number }` where key is `${z}/${x}/${y}`
  - [ ] Implement `getCachedTile(coord: TileCoordinate): Promise<Blob | undefined>` — returns cached tile blob or undefined
  - [ ] Implement `cacheTile(coord: TileCoordinate, blob: Blob): Promise<void>` — stores tile in IndexedDB
  - [ ] Implement `hasCachedTile(coord: TileCoordinate): Promise<boolean>` — quick existence check
  - [ ] Implement `clearTileCache(): Promise<void>` — purges all cached tiles (for settings/debugging)
  - [ ] Implement `getCacheStats(): Promise<{ count: number; estimatedSizeBytes: number }>` — for diagnostics
  - [ ] Write unit tests with mock Dexie (or in-memory IndexedDB via fake-indexeddb)

- [ ] Task 3: Implement tile provider with fetch isolation (AC: #1, #2, #5)
  - [ ] Create `src/lib/network/tile-provider.ts` — the ONLY file permitted to use `fetch`
  - [ ] Implement `fetchTile(coord: TileCoordinate, config: TileProviderConfig): Promise<TileLoadResult>` — fetches a single tile, returns blob or error
  - [ ] Implement cache-first strategy: check `tile-cache.ts` first, only fetch on cache miss
  - [ ] On successful fetch, store in cache via `cacheTile()` before returning
  - [ ] Implement timeout handling: abort fetch after configurable timeout (default 5s per tile) using `AbortController`
  - [ ] Implement `checkProviderStatus(config: TileProviderConfig): Promise<TileProviderStatus>` — fetches a single test tile to verify provider availability
  - [ ] Handle all fetch errors gracefully: network error, HTTP error, timeout — return `TileLoadResult` with status `'error'` and descriptive message
  - [ ] Write unit tests with mocked fetch (vi.stubGlobal or msw)

- [ ] Task 4: Implement tile grid calculation for viewport (AC: #2)
  - [ ] Create `src/lib/network/tile-grid.ts` — pure functions for calculating which tiles are needed
  - [ ] Implement `calculateVisibleTiles(center: { lat: number; lng: number }, zoom: number, viewportSize: { width: number; height: number }): TileCoordinate[]` — returns list of tile coordinates that cover the viewport
  - [ ] Implement `latLngToTile(lat: number, lng: number, zoom: number): TileCoordinate` — converts geographic coordinates to tile coordinates using slippy map math
  - [ ] Implement `tileToLatLng(coord: TileCoordinate): { lat: number; lng: number }` — inverse conversion for tile positioning
  - [ ] Write unit tests with known coordinate-to-tile conversions

- [ ] Task 5: Create tile loading orchestrator (AC: #2, #3, #4, #5)
  - [ ] Create `src/lib/network/tile-loader.ts` — coordinates tile loading for a viewport
  - [ ] Implement `loadTilesForViewport(center, zoom, viewportSize, config): Promise<Map<string, TileLoadResult>>` — loads all visible tiles with concurrency limit (max 6 parallel fetches)
  - [ ] Implement progressive loading: return cached tiles immediately, fetch missing tiles in background
  - [ ] Track loading progress: `{ total: number; loaded: number; cached: number; failed: number }`
  - [ ] Implement retry logic: retry failed tiles once after a short delay (1s)
  - [ ] Emit loading state updates via a callback or reactive store
  - [ ] Write unit tests for orchestration logic with mocked tile provider

- [ ] Task 6: Create network unavailable fallback UI (AC: #5)
  - [ ] Create `src/lib/ui/shared/NetworkUnavailable.svelte` — displays clear message when satellite tiles cannot load
  - [ ] Message text: "Satellite view is currently unavailable. You can still set up your property using the manual grid drawing tool."
  - [ ] Include a "Use Manual Grid" action button that routes to the grid-based property setup (Story 1.7)
  - [ ] Include a "Retry" button that re-checks provider status
  - [ ] Style with Tailwind CSS v4, use warning/info visual treatment (not error — this is a graceful degradation)

- [ ] Task 7: Enforce network boundary with lint rule or CI check (AC: #1)
  - [ ] Add a CI check or custom ESLint rule that verifies `fetch` is only imported/used in `src/lib/network/` files
  - [ ] Consider a simple grep-based check in the CI pipeline: `grep -r "fetch(" src/lib/ --include="*.ts" --include="*.svelte" | grep -v "src/lib/network/"` should return empty
  - [ ] Document the network boundary rule in dev notes

- [ ] Task 8: Write integration and E2E tests (AC: #1, #2, #3, #4, #5)
  - [ ] Create `tests/e2e/tile-loading.spec.ts`
  - [ ] Test: tiles load and render for valid coordinates (mock tile server or use test fixtures)
  - [ ] Test: tiles are served from cache on second load (verify no network requests)
  - [ ] Test: network unavailable fallback message appears when provider is down
  - [ ] Test: "Use Manual Grid" button navigates to grid-based setup
  - [ ] Test: tile loading completes within 3s performance budget
  - [ ] Create tile image test fixtures in `test/fixtures/tiles/`

## Dev Notes

### Network Boundary Architecture

This story establishes the network boundary module — the ONLY code in the entire application permitted to make outbound network requests. This is a privacy-by-architecture guarantee, not just policy.

The module structure at `src/lib/network/`:

```
src/lib/network/
  tile-provider.ts   # The ONLY file that calls fetch()
  tile-cache.ts      # IndexedDB cache for tiles via Dexie
  tile-grid.ts       # Pure math for tile coordinate calculations
  tile-loader.ts     # Orchestrates tile loading for a viewport
```

All future online features (weather API, plant database — Phase 3+) must also route through `src/lib/network/`.

### Tile Provider Selection

The architecture specifies a satellite tile provider as the only external dependency. Options for the tile provider:

- **MapTiler** — satellite imagery with free tier, API key required
- **Mapbox** — high-quality satellite, free tier with API key
- **OpenStreetMap** — no satellite imagery, but good for street maps
- **Esri/ArcGIS** — satellite imagery, free tier available

The provider URL is configured via `TileProviderConfig` so it can be swapped without code changes. The API key is a public key embedded in the build (not a secret — per architecture doc).

### Slippy Map Tile Math

Standard web map tile systems use the "slippy map" convention:

```typescript
function latLngToTile(lat: number, lng: number, zoom: number): TileCoordinate {
  const n = Math.pow(2, zoom);
  const x = Math.floor(((lng + 180) / 360) * n);
  const latRad = (lat * Math.PI) / 180;
  const y = Math.floor(((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n);
  return { x, y, z: zoom };
}
```

Tiles are 256x256 pixels. Zoom level determines the number of tiles: `2^z x 2^z` total tiles at zoom level `z`.

### Cache-First Strategy

The tile loading strategy is cache-first:

1. Check IndexedDB cache for the tile
2. If cached, return immediately (no network request)
3. If not cached, fetch from provider
4. On successful fetch, store in cache, then return
5. On fetch failure, return error result

This ensures offline functionality after initial load and minimizes redundant network requests.

### Performance Budget (NFR5)

Tiles must load within 3 seconds on standard broadband. To achieve this:

- Limit concurrent fetches to 6 (browser connection limit per host)
- Load visible tiles first (center outward)
- Return cached tiles immediately while fetching missing tiles
- Use `AbortController` to cancel stale requests when viewport changes rapidly

### IndexedDB Tile Storage

Tiles are stored as `Blob` objects in IndexedDB via Dexie. The tile cache is a separate Dexie database (or separate table in the existing database) to keep tile data isolated from application event data.

Key format: `${z}/${x}/${y}` — matches the standard tile URL path pattern.

Consider storage limits: a typical property view at zoom levels 16-19 might require 50-200 tiles at ~20-50KB each, totaling 1-10MB. Well within IndexedDB limits.

### Graceful Degradation (NFR16)

When the tile provider is unavailable, the app must not block the user. The fallback path is:

1. Detect provider unavailability (fetch failure, timeout)
2. Show clear message explaining the situation
3. Offer manual grid drawing (Story 1.7) as a full alternative
4. Allow retry when user is ready

The manual grid drawing path from Epic 1 is a complete alternative — satellite imagery is a convenience, not a requirement.

### Architecture Compliance

- **No business logic in Svelte components** — all tile math and loading logic in `.ts` modules
- **No `fetch` outside `src/lib/network/`** — enforced by CI check
- **No `null`** — use `undefined` for missing cached tiles
- **Immutable return values** — `TileLoadResult` is a new object per call
- **File naming:** `kebab-case.ts` for TypeScript files, `PascalCase.svelte` for Svelte components
- **Test co-location:** tests sit next to source files

### What This Story Does NOT Include

- No satellite image rendering on canvas (Story 2.2)
- No address geocoding/search (Story 2.2)
- No feature detection or image analysis (Story 2.3)
- No map controls (zoom buttons, attribution overlay)
- No tile pre-fetching for adjacent areas
- No cache eviction policy (future optimization)

### References

- [Source: _bmad-output/planning-artifacts/architecture.md — Network Boundary Module]
- [Source: _bmad-output/planning-artifacts/architecture.md — Map Tile Caching]
- [Source: _bmad-output/planning-artifacts/epics.md — Story 2.1: Network Boundary Module & Tile Provider]
