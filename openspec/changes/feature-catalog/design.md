## Context

The canvas engine, stores, and drawing tools are in place. The app needs landscape features (trees, fences, etc.) that users can browse, search, and place on the map. Features are simpler than zones — they're positioned by center point with width/height, not drawn as polygons.

## Goals / Non-Goals

**Goals:**
- Define ~34 feature templates with canvas-drawn icons across 6 categories
- Implement searchable, filterable catalog panel in the sidebar
- Support click-to-place flow with ghost preview and multi-placement
- Render placed features using their template's drawIcon function
- Support selection, drag-to-move, and deletion of placed features

**Non-Goals:**
- Feature rotation (field stored but not applied in initial implementation)
- Feature resizing via drag handles (edit size in the detail panel only)
- Custom user-defined feature templates

## Decisions

### 1. Canvas draw functions over image assets
Each template's icon is drawn using Canvas 2D primitives (arc, lineTo, fillRect, etc.). This keeps icons resolution-independent, requires no asset loading, and keeps the bundle small.

### 2. Shared FEATURE_COLORS palette
A constants object defines the color palette (trunk brown, canopy green, water blue, stone gray). Templates reference these constants for visual consistency.

### 3. Bounding rectangle contract for drawIcon
Every drawIcon function receives (ctx, x, y, w, h) where (x, y) is top-left and (w, h) is the bounding size. Functions must confine drawing within this rectangle and call ctx.save()/ctx.restore().

### 4. Placement stays active for multiple instances
After placing a feature, the tool remains in place-feature mode with the same template. This lets users place multiple trees (or fences, etc.) without reselecting from the catalog each time.

### 5. Hit testing uses axis-aligned bounding rectangle
Feature selection uses simple AABB hit testing: |clickX - featureX| <= width/2 AND |clickY - featureY| <= height/2. This is fast and sufficient since rotation is not yet applied.

## Risks / Trade-offs

- **34 drawIcon functions is significant code volume** → Group by category, use shared helper functions for common primitives (trunks, canopies, rectangles). Each function is simple (10-30 lines).
- **No rotation in initial implementation** → The rotation field is stored (avoiding future migration) but treated as 0. This simplifies hit testing and rendering.
