## Why

A fully populated yard map with grid, property boundary, house, zones, features, and measurements can become visually dense. Users need to toggle visibility of individual layers to focus on specific aspects of their plan — hide the grid when placing features, hide features when editing zone boundaries, show only measurements when checking dimensions.

## What Changes

- Add layer visibility model in uiStore with boolean flags for each renderable layer (grid, property, house, zones, features, measurements)
- Add toggleLayer and setLayerVisibility actions on uiStore
- Add layer panel UI with toggle switches for each layer
- Integrate layer visibility checks into each renderer (skip drawing if layer hidden)
- Integrate layer visibility into hit testing (exclude hidden layer objects from selection)

## Capabilities

### New Capabilities
- `layer-visibility`: Layer visibility toggles with render and hit-test integration, layer panel UI

### Modified Capabilities

## Impact

- `src/store/` — uiStore gains layers object with boolean flags and toggle/set actions
- `src/canvas/` — Each renderer checks layer visibility flag before drawing; hit test filters by visible layers
- `src/components/panels/` — New LayerPanel component with toggle rows
