## Context

Zones are currently flat — all exist at the same level. For more complex garden plans, users want to nest zones (e.g., a "Vegetable Garden" zone containing "Raised Bed 1", "Raised Bed 2"). This requires a navigation model where users can "dive into" a zone to see and edit its sub-zones.

## Goals / Non-Goals

**Goals:**
- Support arbitrary-depth zone nesting via parentZoneId/children relationships
- Enable navigation into and out of zone views with breadcrumb trail
- Clip sub-zone drawing to parent zone boundary
- Auto-fit camera when entering/exiting zone views
- Cascade delete sub-zones when parent is deleted

**Non-Goals:**
- Moving zones between parents (reparenting)
- Merging or splitting zones
- Maximum nesting depth enforcement (UI should work at 5+ levels)

## Decisions

### 1. Navigation stack in uiStore
The drill-down path is a stack of zone IDs. Pushing enters a zone, popping exits. The current view zone is the stack top (or null for property-level).

### 2. Parent boundary as fixed frame in zone view
When inside a zone view, the parent's polygon renders as a non-interactive border/frame. Only sub-zones of the current zone are rendered and editable.

### 3. Sub-zone clipping to parent boundary
When drawing sub-zones inside a zone view, the drawn polygon must be fully contained within the parent zone's boundary. Vertices outside the parent are rejected or clipped.

### 4. World coordinates preserved across navigation
No coordinate transformation on navigation — only camera repositioning. Sub-zones use the same world coordinate system as their parent.

## Risks / Trade-offs

- **Complexity of nested data operations** → Keep zone mutations simple: parentZoneId is set on creation, children array is derived. Cascading delete recursively removes all descendants.
- **UI usability at deep nesting** → Breadcrumb bar provides orientation. No hard limit on depth but UI tested for usability at 5+ levels.
