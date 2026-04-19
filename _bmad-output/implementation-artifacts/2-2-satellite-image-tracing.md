# Story 2.2: Satellite Image Tracing

Status: ready-for-dev

## Story

As a gardener,
I want to see my property from satellite view and trace my boundary over the real imagery,
So that my garden map matches my actual property — the "that's my yard!" moment.

## Acceptance Criteria

1. **Given** the user chooses satellite-based property setup
   **When** they enter an address or coordinates
   **Then** satellite tiles load and display the area centered on that location

2. **Given** satellite imagery is displayed
   **When** the user activates the boundary tracing tool (FR3)
   **Then** the polygon drawing tool overlays the satellite image with all precision tools available (snap, curves, loupe, confirmation from Epic 1)

3. **Given** the user has traced a boundary over the satellite image
   **When** the polygon is finalized
   **Then** the boundary is saved as the property geometry via a `PropertyBoundarySet` event
   **And** the satellite imagery remains visible beneath the boundary outline

4. **Given** a satellite-traced property boundary
   **When** the user views the property map
   **Then** the boundary is rendered over the cached satellite tiles
   **And** the visual style clearly distinguishes the property boundary from the satellite imagery

## Tasks / Subtasks

- [ ] Task 1: Implement address/coordinate input and geocoding (AC: #1)
  - [ ] Create `src/lib/types/geo.ts` with types: `GeoCoordinate` (`{ lat: number; lng: number }`), `AddressInput` (`{ query: string }`), `GeocodingResult` (`{ coordinate: GeoCoordinate; displayName: string }`)
  - [ ] Create `src/lib/network/geocoder.ts` — geocoding logic within the network boundary module (this file may also use `fetch`)
  - [ ] Implement `geocodeAddress(query: string): Promise<GeocodingResult | undefined>` — converts address string to lat/lng coordinates
  - [ ] Implement `parseCoordinates(input: string): GeoCoordinate | undefined` — parses user-entered coordinates in common formats (decimal degrees, DMS)
  - [ ] Handle geocoding errors gracefully — return `undefined` with no crash
  - [ ] Update the network boundary CI check to include `geocoder.ts` as a permitted fetch user
  - [ ] Write unit tests for coordinate parsing and geocoding result handling

- [ ] Task 2: Create satellite tile rendering layer on Konva canvas (AC: #1, #3, #4)
  - [ ] Create `src/lib/canvas/map/SatelliteTileLayer.svelte` — Konva `<Layer>` that renders satellite tiles as `<Image>` nodes
  - [ ] Accept `center: GeoCoordinate`, `zoom: number`, and `viewportSize` as props
  - [ ] Use `tile-loader.ts` from Story 2.1 to load tiles for the current viewport
  - [ ] Position each tile `<Image>` correctly on the canvas based on its tile coordinates
  - [ ] Handle tile loading states: show placeholder for loading tiles, render cached/loaded tiles immediately
  - [ ] Re-render tiles when pan/zoom changes (debounce tile loading during rapid pan/zoom)
  - [ ] Ensure this layer renders BELOW the drawing layer and boundary layer
  - [ ] No business logic in the component — delegate tile positioning math to a utility

- [ ] Task 3: Create satellite tile positioning utilities (AC: #1)
  - [ ] Create `src/lib/canvas/map/tile-position-utils.ts` — pure functions for converting tile coordinates to canvas pixel positions
  - [ ] Implement `tileToCanvasPosition(coord: TileCoordinate, centerCoord: GeoCoordinate, canvasCenter: Point, zoom: number): Point` — returns canvas x/y for top-left corner of tile
  - [ ] Implement `canvasToGeo(canvasPoint: Point, centerCoord: GeoCoordinate, canvasCenter: Point, zoom: number): GeoCoordinate` — converts canvas position to geographic coordinate (for coordinate display)
  - [ ] Implement `geoToCanvas(geo: GeoCoordinate, centerCoord: GeoCoordinate, canvasCenter: Point, zoom: number): Point` — converts geographic coordinate to canvas position
  - [ ] Write unit tests with known coordinate-to-position conversions

- [ ] Task 4: Create satellite setup entry UI (AC: #1)
  - [ ] Create `src/lib/ui/onboarding/SatelliteSetup.svelte` — entry point for satellite-based property setup
  - [ ] Include an address/coordinate text input field with clear labeling
  - [ ] Include a "Locate" or "Search" button that triggers geocoding
  - [ ] Display loading state while geocoding/tile loading is in progress
  - [ ] On successful geocoding, transition to the satellite map view centered on the result
  - [ ] On geocoding failure, display a helpful error message with option to enter coordinates directly
  - [ ] Include a "Use Manual Grid Instead" link for users who prefer grid-based setup
  - [ ] Style with Tailwind CSS v4

- [ ] Task 5: Integrate polygon drawing tool with satellite view (AC: #2, #3)
  - [ ] Wire the polygon drawing tool (Story 1.5) to render over the satellite tile layer
  - [ ] Ensure all precision tools from Story 1.6 are available: snap-to-grid, curve segments, loupe/magnifier, two-stage point confirmation
  - [ ] Map canvas coordinates to geographic coordinates so the boundary polygon stores real-world positions
  - [ ] Create `src/lib/domain/satellite-boundary.ts` — domain logic for satellite-traced boundary finalization
  - [ ] Implement `finalizeSatelliteBoundary(propertyId: string, canvasPoints: Point[], geoTransform): void` — converts canvas points to geo-referenced polygon and commits `PropertyBoundarySet` event
  - [ ] Store both canvas-relative and geo-referenced coordinates in the event payload for rendering flexibility
  - [ ] Write unit tests for boundary finalization and coordinate transformation

- [ ] Task 6: Style boundary overlay on satellite imagery (AC: #3, #4)
  - [ ] Define boundary visual style that is clearly visible over satellite imagery: bright outline color (e.g., `#FFD700` gold or `#00FF88` green), semi-transparent fill, 3px+ stroke width
  - [ ] Ensure boundary style contrasts with typical satellite imagery (greens, browns, grays)
  - [ ] Add a subtle drop shadow or glow effect to the boundary line for readability over varied backgrounds
  - [ ] Render boundary on a dedicated Konva layer above satellite tiles but below UI overlays
  - [ ] Verify boundary remains visible at all zoom levels

- [ ] Task 7: Create satellite view navigation store (AC: #1, #2)
  - [ ] Create `src/lib/stores/satellite-view-store.svelte.ts` using Svelte 5 runes
  - [ ] Define reactive state: `center: GeoCoordinate`, `mapZoom: number`, `isLoading: boolean`, `providerStatus: TileProviderStatus`
  - [ ] Integrate with the navigation context from Story 1.4 — satellite zoom maps to canvas zoom
  - [ ] Expose actions: `setCenter(coord)`, `setMapZoom(zoom)`, `panTo(coord)`
  - [ ] This state is session-only, not persisted to Dexie
  - [ ] Write unit tests for store state transitions

- [ ] Task 8: Write Playwright E2E tests (AC: #1, #2, #3, #4)
  - [ ] Create `tests/e2e/satellite-tracing.spec.ts`
  - [ ] Test: entering an address loads satellite tiles centered on location (mock tile server)
  - [ ] Test: polygon drawing tool works over satellite imagery
  - [ ] Test: completed boundary is saved as `PropertyBoundarySet` event
  - [ ] Test: boundary renders over satellite tiles after finalization
  - [ ] Test: boundary visual style is distinct from satellite imagery
  - [ ] Test: satellite imagery remains visible beneath boundary outline
  - [ ] Create mock tile server fixtures in `test/fixtures/tiles/`

## Dev Notes

### Satellite View Architecture

This story layers satellite imagery beneath the existing canvas architecture from Epic 1. The layer order on the Konva stage becomes:

1. **Satellite Tile Layer** (bottom) — renders tile images from the tile provider
2. **Grid Layer** (optional) — grid can be hidden or shown over satellite
3. **Boundary Layer** — renders the property boundary polygon
4. **Drawing Layer** — active polygon drawing tool overlay
5. **Interaction Layer** — precision tool overlays (loupe, snap indicators)

### Coordinate Systems

This story introduces a critical complexity: the relationship between canvas coordinates and geographic coordinates. Three coordinate systems are in play:

- **Screen coordinates** — pixel position on the user's screen
- **Canvas coordinates** — position on the Konva stage (affected by pan/zoom from Story 1.4)
- **Geographic coordinates** — lat/lng in the real world (WGS84)

The transformation chain: `screen → canvas → geographic` (and vice versa). All stored geometry should include geographic coordinates for real-world meaning, while canvas coordinates are used for rendering.

### Geocoding Integration

Geocoding (address to coordinates) requires a network request, so `geocoder.ts` lives inside `src/lib/network/` alongside the tile provider. Options:

- **Nominatim** (OpenStreetMap) — free, no API key, rate-limited
- **MapTiler Geocoding** — if already using MapTiler for tiles, same API key
- **Mapbox Geocoding** — if using Mapbox for tiles

The geocoder is a secondary `fetch` user within the network boundary. Update CI checks accordingly.

### Polygon Tool Reuse

The polygon drawing tool from Story 1.5 and precision tools from Story 1.6 are reused directly. The only new logic is:

1. Rendering satellite tiles beneath the drawing layer
2. Converting finalized polygon points from canvas space to geographic space
3. Committing the boundary as a `PropertyBoundarySet` event (same as Story 1.7, but with geo-referenced coordinates)

### Boundary Visual Style Over Satellite Imagery

The boundary must be clearly visible over satellite imagery, which has highly variable colors and textures. Recommendations:

- Use a bright, contrasting outline color (gold `#FFD700` or bright green `#00FF88`)
- Apply a 3-4px stroke width (thicker than grid-based boundary)
- Add a subtle outer glow or shadow effect using Konva shadow properties
- Use a semi-transparent fill with low opacity (e.g., `rgba(255, 215, 0, 0.15)`)
- Avoid pure white or pure black outlines — they blend with building roofs and shadows

### Performance Considerations

- Satellite tiles are typically 256x256 pixel PNG/JPEG images (~20-50KB each)
- A typical viewport at zoom 18 shows ~12-20 tiles
- Tiles should load progressively — show whatever is cached immediately, load missing tiles in background
- Debounce tile loading during rapid pan/zoom to avoid unnecessary requests
- Use Konva image caching for rendered tiles to avoid re-decoding

### What This Story Does NOT Include

- No feature detection or AI analysis of satellite imagery (Story 2.3)
- No feature catalog (Story 2.4)
- No boundary editing after creation (Story 2.5)
- No measurement tools on satellite view
- No satellite imagery source selection/switching
- No offline geocoding — address lookup requires network

### References

- [Source: _bmad-output/planning-artifacts/architecture.md — Network Boundary Module]
- [Source: _bmad-output/planning-artifacts/architecture.md — Canvas Component Strategy]
- [Source: _bmad-output/planning-artifacts/epics.md — Story 2.2: Satellite Image Tracing]
