## 1. Data Model Updates

- [ ] 1.1 Add parentZoneId (string | null) field to Zone type
- [ ] 1.2 Add children (string[]) field to Zone type
- [ ] 1.3 Add zoneNavigationStack and currentViewZoneId to uiStore
- [ ] 1.4 Update addZone to set parentZoneId based on current view context
- [ ] 1.5 Update removeZone to cascade delete all descendant zones and plantings
- [ ] 1.6 Write tests for hierarchical zone store actions

## 2. Zone View Rendering

- [ ] 2.1 Filter rendered zones based on current navigation context (show only children of current view zone)
- [ ] 2.2 Render parent zone boundary as non-interactive frame in zone view
- [ ] 2.3 Implement camera auto-fit to parent zone bounding box on view entry
- [ ] 2.4 Implement camera restore on view exit
- [ ] 2.5 Write tests for zone view rendering

## 3. Navigation UI

- [ ] 3.1 Create BreadcrumbBar component showing navigation path
- [ ] 3.2 Implement clickable breadcrumb segments for jumping to any level
- [ ] 3.3 Add back button visible when inside a zone view
- [ ] 3.4 Add "View Zone" action button/context menu for selected zones
- [ ] 3.5 Write tests for navigation components

## 4. Sub-Zone Drawing

- [ ] 4.1 Modify draw-zone tool to set parentZoneId when drawing inside a zone view
- [ ] 4.2 Implement polygon clipping/validation against parent zone boundary
- [ ] 4.3 Write tests for sub-zone drawing constraints
