## Why

Users may have multiple yards (front, back), seasonal variations, or different properties. Currently the app supports only a single project. Multi-project support lets users create, switch between, rename, and delete independent projects — each a complete yard plan stored separately in IndexedDB.

## What Changes

- Add project list panel showing all saved projects with name and last modified date
- Add create new project flow (fresh project with default state)
- Add project switching (save current, load selected)
- Add project deletion with confirmation
- Add project rename
- Add last-used project tracking (auto-load on startup)

## Capabilities

### New Capabilities
- `multi-project`: Multiple project management with create, switch, rename, delete, and last-used tracking

### Modified Capabilities

## Impact

- `src/store/` — projectStore gains loadProject action; uiStore may gain project switching state
- `src/persistence/` — projectRepo already supports multiple records; add listProjects, deleteProject, last-used tracking
- `src/components/panels/` — ProjectListPanel with project rows and management actions
