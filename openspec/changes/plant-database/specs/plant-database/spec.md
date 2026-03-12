## ADDED Requirements

### Requirement: Plant database contains ~150 searchable plants across 8 categories
The static plant database SHALL contain approximately 150 Plant entries spanning vegetable, fruit, herb, flower, perennial, annual, vine, and ground-cover categories.

#### Scenario: All categories are represented
- **WHEN** the plant database is loaded
- **THEN** entries SHALL exist in all 8 categories with approximate counts: vegetable(35), fruit(15), herb(20), flower(20), perennial(20), annual(15), vine(10), ground-cover(15)

#### Scenario: Each plant has complete metadata
- **WHEN** any plant entry is accessed
- **THEN** it SHALL have non-empty commonName, scientificName, category, and valid numeric values for hardinessZoneMin/Max, spacingInches, and matureSizeFeet

### Requirement: Plant search matches common and scientific names
The searchPlants function SHALL perform case-insensitive substring matching against both commonName and scientificName.

#### Scenario: Search by common name
- **WHEN** searchPlants("basil") is called
- **THEN** results SHALL include plants with "basil" in their commonName (e.g., "Sweet Basil", "Thai Basil")

#### Scenario: Search by scientific name
- **WHEN** searchPlants("lycopersicum") is called
- **THEN** results SHALL include tomato varieties matching the scientific name

### Requirement: Plant browser dialog provides search and category filtering
The plant browser dialog SHALL provide a search bar (auto-focused, debounced 150ms), category toggle buttons, results count, and a scrollable plant list.

#### Scenario: Browser opens with auto-focused search
- **WHEN** the plant browser dialog opens
- **THEN** the search bar SHALL be auto-focused and all plants SHALL be displayed

#### Scenario: Category and search filters combine
- **WHEN** the user types "tom" and activates the "vegetable" category
- **THEN** only vegetable plants matching "tom" SHALL be displayed

#### Scenario: Plant entry shows metadata summary
- **WHEN** plants are listed in the browser
- **THEN** each entry SHALL show common name (bold), scientific name (italic), category badge, sun icon, water icon, and zone range

### Requirement: Plant details display all metadata fields
When viewing a plant (in browser or expanded planting), all metadata SHALL be displayed with appropriate icons and labels.

#### Scenario: Full plant details shown
- **WHEN** a plant's details are displayed
- **THEN** hardiness zones, sun requirement, water needs, spacing, mature size, and days to maturity (or "Perennial" if null) SHALL be shown
