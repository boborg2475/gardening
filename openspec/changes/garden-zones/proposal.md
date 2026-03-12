## Why

The polygon draw tool and property/house outlines (from core-drawing-tools) give users the ability to draw on the canvas, but they cannot yet define garden zones — the primary organizational unit for planning plantings. Zones are the core feature that transforms a property map into a garden planner.

## What Changes

- Add zone drawing mode (`draw-zone`) that reuses the polygon draw tool with a metadata dialog on completion
- Add zone metadata dialog with fields: name (auto-incremented), color (palette rotation), soil type, sun exposure, notes
- Add zone renderer with semi-transparent fill, darkened stroke, centroid name label
- Add zone selection via canvas click (point-in-polygon, topmost wins on overlap)
- Add zone vertex dragging to reshape and interior dragging to move entire zone
- Add zone panel in sidebar listing all zones with metadata summary
- Add zone deletion with cascade to remove associated plantings, confirmation dialog when plantings exist
- Add zone reordering (changes render/z-order)

## Capabilities

### New Capabilities
- `zone-management`: Garden zone drawing, rendering, selection, editing, metadata management, zone panel, and deletion with planting cascade

### Modified Capabilities

## Impact

- `src/canvas/` — Zone renderer, draw tool integration for zone mode
- `src/store/` — projectStore zone actions (addZone, updateZone, removeZone, reorderZones), zone-related selectors
- `src/components/` — ZoneMetadataDialog, ZonePanel, zone detail section in sidebar
- `src/types/` — Zone type definition with metadata fields
