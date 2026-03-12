## ADDED Requirements

### Requirement: Feature catalog contains ~34 templates in 6 categories
The catalog SHALL contain approximately 34 FeatureTemplate entries organized into trees, shrubs, structures, hardscape, water, and misc categories.

#### Scenario: All categories are represented
- **WHEN** the feature catalog is loaded
- **THEN** templates SHALL exist in all 6 categories: trees (~5), shrubs (~5), structures (~6), hardscape (~7), water (~5), misc (~6)

### Requirement: Each template has a canvas draw icon function
Every FeatureTemplate SHALL have a drawIcon function that renders using only Canvas 2D primitives, confined within the provided bounding rectangle.

#### Scenario: Draw icon renders within bounds
- **WHEN** drawIcon(ctx, x, y, w, h) is called for any template
- **THEN** all drawing SHALL be confined within the rectangle (x, y, w, h) and ctx.save()/ctx.restore() SHALL be called

#### Scenario: Icons use shared FEATURE_COLORS palette
- **WHEN** draw icon functions set fill/stroke colors
- **THEN** they SHALL reference FEATURE_COLORS constants for consistency

### Requirement: Catalog panel supports search and category filtering
The feature panel SHALL display templates with a search bar and category filter pills.

#### Scenario: Search filters by template name
- **WHEN** the user types "tree" in the catalog search bar
- **THEN** only templates whose name contains "tree" (case-insensitive) SHALL be displayed

#### Scenario: Category filter limits displayed templates
- **WHEN** the user activates the "water" category filter
- **THEN** only water category templates SHALL be displayed

#### Scenario: Empty search results show message
- **WHEN** search and filters produce no matches
- **THEN** "No matching features" message SHALL be displayed
