## 1. JSON Export

- [ ] 1.1 Create exportJson module with ProjectState serialization and versioned envelope
- [ ] 1.2 Implement filename sanitization from project name
- [ ] 1.3 Implement Blob creation, object URL, and hidden anchor download trigger
- [ ] 1.4 Write tests for JSON export (envelope structure, filename sanitization)

## 2. JSON Import

- [ ] 2.1 Create importJson module with FileReader-based file reading
- [ ] 2.2 Implement validation pipeline (JSON parse, envelope structure, required fields)
- [ ] 2.3 Implement schema version checking and migration runner
- [ ] 2.4 Create migrations module with version-keyed migration functions
- [ ] 2.5 Implement project creation (new UUID, name suffix, save to IndexedDB, load into store)
- [ ] 2.6 Write tests for import validation and migration

## 3. Export Menu UI

- [ ] 3.1 Create ExportMenu component with Export JSON and Import JSON options
- [ ] 3.2 Wire hidden file input for import with .json/.garden.json accept filter
- [ ] 3.3 Implement success and error toast notifications
- [ ] 3.4 Integrate ExportMenu into toolbar
- [ ] 3.5 Write tests for export menu interactions
