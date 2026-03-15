# LLD-03: Persistence

## Dexie Database (`persistence/db.ts`)
- Database name: 'GardenPlannerDB'
- Version 1: `projects` table with `id` as primary key

## Project Repository (`persistence/projectRepo.ts`)
- `saveProject(project: Project): Promise<void>` — upsert project
- `loadProject(id: string): Promise<Project | undefined>` — load by ID
- `loadLastProject(): Promise<Project | undefined>` — load most recently updated
- `deleteProject(id: string): Promise<void>` — delete by ID
- `listProjects(): Promise<Project[]>` — list all

## Auto-save
- Subscribe to projectStore changes
- Debounce saves by 1 second
- Wired in App component on mount
