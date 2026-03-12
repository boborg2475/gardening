## 1. Feature Data & Templates

- [ ] 1.1 Define FeatureTemplate and PlacedFeature types
- [ ] 1.2 Create FEATURE_COLORS shared palette constants
- [ ] 1.3 Implement drawIcon functions for trees category (5 templates)
- [ ] 1.4 Implement drawIcon functions for shrubs category (5 templates)
- [ ] 1.5 Implement drawIcon functions for structures category (6 templates)
- [ ] 1.6 Implement drawIcon functions for hardscape category (7 templates)
- [ ] 1.7 Implement drawIcon functions for water category (5 templates)
- [ ] 1.8 Implement drawIcon functions for misc category (6 templates)
- [ ] 1.9 Write tests for drawIcon functions (render without error, stay within bounds)

## 2. Feature Store Actions

- [ ] 2.1 Add features array to projectStore if not present
- [ ] 2.2 Implement addFeature, updateFeature, removeFeature actions
- [ ] 2.3 Add placingTemplateId field to uiStore
- [ ] 2.4 Write tests for feature store actions

## 3. Placement Flow

- [ ] 3.1 Implement place-feature tool activation from catalog panel
- [ ] 3.2 Implement ghost preview renderer (template drawIcon at cursor, 50% opacity)
- [ ] 3.3 Implement click-to-place handler (create PlacedFeature, add to store)
- [ ] 3.4 Implement multi-placement (tool stays active after placement)
- [ ] 3.5 Implement Escape to exit placement mode
- [ ] 3.6 Write tests for placement flow

## 4. Feature Renderer

- [ ] 4.1 Implement feature renderer that iterates placed features and calls template drawIcon
- [ ] 4.2 Implement fallback rendering for unknown templateId
- [ ] 4.3 Implement viewport culling for off-screen features
- [ ] 4.4 Integrate feature renderer into CanvasEngine render loop
- [ ] 4.5 Write tests for feature renderer

## 5. Feature Selection & Movement

- [ ] 5.1 Implement AABB hit testing for features in reverse z-order
- [ ] 5.2 Implement selection rectangle with corner and midpoint handles
- [ ] 5.3 Implement drag-to-move with offset tracking
- [ ] 5.4 Implement Delete/Backspace to remove selected feature
- [ ] 5.5 Write tests for feature selection and movement

## 6. Feature Panel UI

- [ ] 6.1 Create FeatureCatalogPanel with search bar and category filter pills
- [ ] 6.2 Render template list grouped by category with icon previews
- [ ] 6.3 Create FeatureDetailPanel with template info, position, size, notes, delete button
- [ ] 6.4 Wire size and notes edits to projectStore.updateFeature
- [ ] 6.5 Create placed features list section
- [ ] 6.6 Add FeatureCatalogPanel to sidebar tabs
- [ ] 6.7 Write tests for feature panel components
