# LLD-13: Zone Navigation & Sub-Zones

## Overview

Zones are hierarchical — a zone can contain sub-zones to arbitrary depth. Users can "dive into" a zone to view and edit its contents at a focused level, then navigate back up to the parent.

## Data Model

### Zone hierarchy

- Each `Zone` gains an optional `parentZoneId: string | null` field (null = top-level zone).
- Each `Zone` gains a `children: string[]` array of child zone IDs for fast lookup.
- Sub-zones inherit world-unit coordinates from the parent — measurements are preserved across navigation levels.

### Navigation state (uiStore)

- `zoneNavigationStack: string[]` — stack of zone IDs representing the current drill-down path. Empty = top-level (property) view.
- `currentViewZoneId: string | null` — the zone currently being viewed (derived from top of stack, or null for top-level).

## Behavior

### Diving into a zone

1. User clicks a zone to select it.
2. A "View Zone" action appears (in context menu, sidebar, or overlay button).
3. On activation, the selected zone's ID is pushed onto `zoneNavigationStack`.
4. The canvas re-renders in **zone view**: the parent zone's boundary becomes the viewport frame, and only the zone's sub-zones and contents are displayed.
5. The grid and coordinate system remain in world units — measurements stay consistent with the parent view.

### Navigating back

1. A back/breadcrumb control is visible when `zoneNavigationStack` is non-empty.
2. Clicking back pops the top of `zoneNavigationStack`.
3. The canvas re-renders at the parent level.

### Drawing sub-zones

- When inside a zone view, the zone drawing tool creates sub-zones with `parentZoneId` set to the current view zone.
- Sub-zones are clipped to the parent zone's boundary (cannot extend outside).

### Rendering in zone view

- The parent zone's boundary is rendered as a fixed frame/border.
- The camera auto-fits to the parent zone's bounding box on entry.
- Sub-zones render identically to top-level zones (same colors, labels, selection behavior).
- The grid remains visible and aligned to the global coordinate system.

### Deletion cascade

- Deleting a zone that has sub-zones prompts for confirmation and deletes all descendants.
- Deleting a zone while viewing it navigates back to the parent first.

## UI Elements

- **Breadcrumb bar**: Shows navigation path (e.g., "Property > Front Yard > Herb Garden"). Each segment is clickable to jump to that level.
- **Back button**: Visible in toolbar when inside a zone view.
- **"View Zone" action**: Available on selected zones (button in sidebar or double-click).

## Constraints

- Maximum nesting depth: no hard limit, but UI should remain usable at 5+ levels.
- Zone coordinates are always in world units — no coordinate transformation on navigation, only camera repositioning.
- Sub-zone polygons must be fully contained within the parent zone boundary.
