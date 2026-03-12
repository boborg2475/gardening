## 1. Zone Store Actions

- [ ] 1.1 Add Zone type definition with id, name, points, color, soilType, sunExposure, notes fields
- [ ] 1.2 Implement addZone action in projectStore
- [ ] 1.3 Implement updateZone action in projectStore (partial updates by id)
- [ ] 1.4 Implement removeZone action with cascade delete of associated plantings
- [ ] 1.5 Implement reorderZones action in projectStore
- [ ] 1.6 Write tests for all zone store actions

## 2. Zone Drawing Integration

- [ ] 2.1 Wire draw-zone tool activation from toolbar and zone panel "Add Zone" button
- [ ] 2.2 Implement post-completion hook that holds polygon in temporary buffer and opens metadata dialog (instead of saving directly)
- [ ] 2.3 Implement green (#10B981) preview color for zone drawing mode
- [ ] 2.4 Write tests for zone drawing integration

## 3. Zone Metadata Dialog

- [ ] 3.1 Create ZoneMetadataDialog component with name, color, soil type, sun exposure, notes fields
- [ ] 3.2 Implement default name auto-increment (Zone N where N = zones.length + 1)
- [ ] 3.3 Implement color palette rotation for default color selection
- [ ] 3.4 Implement Save handler that creates zone with UUID and all metadata, adds to store, and selects new zone
- [ ] 3.5 Implement Cancel handler that discards polygon and resets tool to select
- [ ] 3.6 Write tests for metadata dialog

## 4. Zone Renderer

- [ ] 4.1 Implement zone renderer with semi-transparent fill (25% opacity), darkened stroke (20%), 2px width
- [ ] 4.2 Implement zone name label at centroid (13px bold, 40% darker color) with pole-of-inaccessibility fallback
- [ ] 4.3 Implement label hiding for small zones (bounding box < 40px)
- [ ] 4.4 Implement selected zone state (3px stroke, 40% opacity outer stroke, 7x7px vertex handles)
- [ ] 4.5 Integrate zone renderer into CanvasEngine render loop between property and house layers
- [ ] 4.6 Write tests for zone renderer

## 5. Zone Selection & Editing

- [ ] 5.1 Implement zone hit testing with point-in-polygon in reverse array order
- [ ] 5.2 Implement zone vertex dragging (8px threshold, grid snap, self-intersection prevention)
- [ ] 5.3 Implement zone interior dragging (move entire zone, grid snap on delta)
- [ ] 5.4 Write tests for zone selection and editing

## 6. Zone Panel

- [ ] 6.1 Create ZonePanel component with zone list rows (color swatch, name, soil, sun, planting count)
- [ ] 6.2 Implement empty state message with Add Zone prompt
- [ ] 6.3 Implement zone row click to select and pan-to-zone on canvas
- [ ] 6.4 Implement drag-to-reorder for zone rows
- [ ] 6.5 Implement Add Zone button that activates draw-zone tool
- [ ] 6.6 Write tests for zone panel

## 7. Zone Deletion

- [ ] 7.1 Implement immediate deletion for zones without plantings
- [ ] 7.2 Create ZoneDeleteConfirmDialog component for zones with plantings
- [ ] 7.3 Implement cascade deletion (zone + all plantings) as single batched store action
- [ ] 7.4 Write tests for zone deletion and cascade behavior
