## Why

As users create more detailed garden plans, they need to organize zones hierarchically — a "Front Yard" zone containing sub-zones like "Herb Garden" and "Flower Border". Zone navigation lets users dive into a zone to focus on its contents, then navigate back up, keeping complex plans manageable.

## What Changes

- Add parentZoneId and children fields to Zone data model for hierarchical nesting
- Add zone navigation stack in uiStore for tracking drill-down path
- Add "View Zone" action to dive into a selected zone
- Add breadcrumb bar showing navigation path with clickable segments
- Add back button for navigating up one level
- Modify zone drawing to create sub-zones when inside a zone view (clipped to parent boundary)
- Add cascading deletion for zones with sub-zone descendants
- Add camera auto-fit when entering/exiting zone view

## Capabilities

### New Capabilities
- `zone-navigation`: Hierarchical zone navigation with sub-zones, breadcrumb navigation, camera auto-fit, and cascading deletion

### Modified Capabilities

## Impact

- `src/types/` — Zone type gains parentZoneId and children fields
- `src/store/` — uiStore gains zoneNavigationStack and currentViewZoneId; projectStore zone actions updated for hierarchy
- `src/canvas/` — Zone view rendering (parent as frame, filter to sub-zones), camera auto-fit
- `src/components/` — BreadcrumbBar, ViewZone action, back button
