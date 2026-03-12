## 1. Plant Database

- [ ] 1.1 Define Plant type with all metadata fields
- [ ] 1.2 Create plantDatabase.ts with ~150 plant entries across 8 categories
- [ ] 1.3 Implement getPlantById lookup function
- [ ] 1.4 Implement searchPlants function (case-insensitive substring match on commonName and scientificName)
- [ ] 1.5 Implement filterPlantsByCategory function
- [ ] 1.6 Implement filterPlants combined filter function
- [ ] 1.7 Write tests for all plant database functions

## 2. Planting Store

- [ ] 2.1 Define Planting type with id, zoneId, plantId, quantity, plantingDate, status, notes
- [ ] 2.2 Add plantings array to projectStore
- [ ] 2.3 Implement addPlanting, updatePlanting, removePlanting actions
- [ ] 2.4 Implement plantingsForZone selector
- [ ] 2.5 Update removeZone action to cascade delete associated plantings
- [ ] 2.6 Write tests for planting store actions and selectors

## 3. Plant Browser Dialog

- [ ] 3.1 Create PlantBrowserDialog component with search bar and category toggles
- [ ] 3.2 Implement debounced search (150ms) against commonName and scientificName
- [ ] 3.3 Implement category toggle filter with OR logic
- [ ] 3.4 Implement results count display
- [ ] 3.5 Implement plant list entries with name, scientific name, category badge, info icons
- [ ] 3.6 Implement plant selection to proceed to planting form
- [ ] 3.7 Write tests for plant browser dialog

## 4. Planting Panel

- [ ] 4.1 Create PlantingPanel component with zone header, planting count, Add button
- [ ] 4.2 Implement planting card list (name, quantity, status badge, date)
- [ ] 4.3 Implement status badge color mapping (planned=gray, planted=blue, growing=green, harvested=amber, removed=red)
- [ ] 4.4 Implement expandable planting detail with full plant info, editable fields, delete button
- [ ] 4.5 Implement status dropdown with immediate save
- [ ] 4.6 Implement notes textarea with save-on-blur
- [ ] 4.7 Implement planting deletion with confirmation
- [ ] 4.8 Implement empty state and no-zone-selected states
- [ ] 4.9 Add PlantingPanel to sidebar
- [ ] 4.10 Write tests for planting panel

## 5. Planting Form

- [ ] 5.1 Create planting form with plant display, quantity input, date picker, status dropdown, notes textarea
- [ ] 5.2 Implement quantity validation (min 1, integer only)
- [ ] 5.3 Implement Save handler to create Planting and add to store
- [ ] 5.4 Write tests for planting form
