## Why

A yard plan includes permanent and semi-permanent structures (trees, fences, sheds, water features) that constrain where gardens can go. Users need a quick way to populate their map with recognizable landscape objects without drawing everything freehand. A searchable catalog of ~30 feature templates with canvas-drawn icons provides this capability.

## What Changes

- Add FeatureTemplate data model with ~34 static templates across 6 categories (trees, shrubs, structures, hardscape, water, misc)
- Add PlacedFeature data model for instances placed on the map
- Implement canvas draw icon functions for all templates using Canvas 2D primitives (no image assets)
- Add feature catalog panel in sidebar with search and category filtering
- Add placement flow: select template → ghost preview follows cursor → click places feature → tool stays active for multiple placements
- Add feature renderer that draws all placed features using their template's drawIcon function
- Add feature selection (bounding rect hit test), movement (drag), and deletion
- Add feature detail panel showing template info, position, editable size, notes, and delete button

## Capabilities

### New Capabilities
- `feature-catalog`: Static feature template catalog with ~34 templates, canvas draw icons, and catalog panel UI
- `feature-placement`: Feature placement, rendering, selection, movement, deletion, and detail panel

### Modified Capabilities

## Impact

- `src/data/` — featureCatalog.ts with all templates and drawIcon functions, FEATURE_COLORS palette
- `src/types/` — FeatureTemplate and PlacedFeature type definitions
- `src/store/` — projectStore.features array with addFeature, updateFeature, removeFeature actions; uiStore placingTemplateId field
- `src/canvas/` — Feature renderer, ghost preview renderer, feature hit testing
- `src/components/panels/` — FeatureCatalogPanel, FeatureDetailPanel
