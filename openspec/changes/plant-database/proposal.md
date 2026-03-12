## Why

The whole point of mapping garden zones is to plan what grows in them. Without a plant database and planting tracker, zones are just colored shapes. The plant database provides reference information gardeners need (hardiness zones, sun/water needs, spacing) and the planting tracker turns a static map into a living record of what's planted where.

## What Changes

- Add static plant database (~150 entries) with metadata: hardiness zones, sun requirements, water needs, spacing, mature size, days to maturity
- Add plant data model with search and filter functions (by name, category, combined)
- Add planting model for tracking plant instances in zones (quantity, date, status, notes)
- Add planting panel in sidebar showing plantings for the selected zone
- Add plant browser dialog for searching and selecting plants when adding plantings
- Add planting CRUD with zone association and zone deletion cascade
- Add planting status lifecycle (planned → planted → growing → harvested → removed)

## Capabilities

### New Capabilities
- `plant-database`: Static plant database with ~150 entries and search/filter functionality
- `planting-tracker`: Planting management with zone association, CRUD operations, status tracking, and cascade delete

### Modified Capabilities

## Impact

- `src/data/` — plantDatabase.ts with ~150 plant entries and lookup/filter functions
- `src/types/` — Plant and Planting type definitions
- `src/store/` — projectStore.plantings array with addPlanting, updatePlanting, removePlanting actions; selectors for plantingsForZone
- `src/components/panels/` — PlantingPanel, PlantBrowserDialog, planting detail view
