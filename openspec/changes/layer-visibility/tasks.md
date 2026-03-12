## 1. Store Integration

- [ ] 1.1 Verify uiStore.layers object exists with all 6 boolean flags defaulting to true
- [ ] 1.2 Implement toggleLayer(layerName) action if not already present
- [ ] 1.3 Implement setLayerVisibility(layerName, visible) action if not already present
- [ ] 1.4 Write tests for layer toggle and set actions

## 2. Renderer Integration

- [ ] 2.1 Add layers.grid check to grid renderer entry point
- [ ] 2.2 Add layers.property check to property renderer
- [ ] 2.3 Add layers.house check to house renderer
- [ ] 2.4 Add layers.zones check to zone renderer
- [ ] 2.5 Add layers.features check to feature renderer
- [ ] 2.6 Add layers.measurements check to measurement renderer
- [ ] 2.7 Write tests verifying renderers skip drawing when layer is hidden

## 3. Hit Test Integration

- [ ] 3.1 Filter hit-test candidates by visible layers before iteration
- [ ] 3.2 Write tests verifying hidden layer objects are not selectable

## 4. Layer Panel UI

- [ ] 4.1 Create LayerPanel component with toggle rows for each layer
- [ ] 4.2 Implement eye icon (open/closed) reflecting visibility state
- [ ] 4.3 Wire toggle clicks to uiStore.toggleLayer
- [ ] 4.4 Add LayerPanel to sidebar tabs
- [ ] 4.5 Write tests for layer panel interactions
